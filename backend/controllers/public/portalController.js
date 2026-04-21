import MockTest from "../../models/MockTest.js";
import GrandTest from "../../models/GrandTest.js";
import Category from "../../models/Category.js";
import SubscriptionPlan from "../../models/SubscriptionPlan.js";
import mongoose from "mongoose";

/**
 * 1. Get All Categories (For Landing Page/Filters)
 */
export const getAllCategories = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       console.log("⚠️ DB NOT READY (ReadyState:", mongoose.connection.readyState, ")");
       return res.status(503).json({ success: false, message: "Database connecting..." });
    }
    console.log("📡 FETCHING ALL CATEGORIES...");
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error("❌ GET_ALL_CATEGORIES_ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories", error: err.message });
  }
};

/**
 * 2. Get All Published Mock Tests (Combined)
 */
export const getPublishedMockTests = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({ success: false, message: "Database connecting..." });
    }
    const { category, q } = req.query;
    let filter = { isPublished: true };

    if (category && typeof category === 'string' && category.toLowerCase() !== "all") {
      filter.categorySlug = category.toLowerCase().trim();
    }

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    // Fetch from both collections in parallel
    const [mockTests, grandTests] = await Promise.all([
      MockTest.find(filter)
        .populate("category", "name slug image")
        .select("-questions -attempts")
        .lean(),
      GrandTest.find(filter)
        .populate("category", "name slug image")
        .select("-questions -attempts")
        .lean(),
    ]);

    // Robustness: Ensure grand tests have the flag
    const processedGrand = grandTests.map(t => ({ ...t, isGrandTest: true }));

    // Combine and sort by newest first
    const combined = [...mockTests, ...processedGrand].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      mocktests: combined,
    });
  } catch (err) {
    console.error("PUBLIC_MOCKTEST_FETCH_ERROR:", err.message);
    res.status(500).json({ success: false, message: "Error fetching tests" });
  }
};

/**
 * 3. Get Single Mock Test Details
 */
export const getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Search both collections
    let test = await MockTest.findById(id)
      .populate("category", "name slug image")
      .select("-questions -attempts"); 
      
    if (!test) {
      test = await GrandTest.findById(id)
        .populate("category", "name slug image")
        .select("-questions -attempts");
    }

    if (!test) return res.status(404).json({ message: "Mocktest not found" });
    
    // ✅ Add effective fields for consistency (Instruction page fallback uses this)
    const testObj = test.toObject ? test.toObject() : test;
    testObj.marksPerQuestion = (testObj.marksPerQuestion > 0) ? testObj.marksPerQuestion : (testObj.totalQuestions > 0 ? Number((testObj.totalMarks / testObj.totalQuestions).toFixed(2)) : 1);
    testObj.negativeMarking = (testObj.negativeMarking !== undefined && testObj.negativeMarking !== null) ? testObj.negativeMarking : 0;

    res.status(200).json({ success: true, test: testObj });
  } catch (err) {
    console.error("GET_MOCKTEST_BY_ID_ERROR:", err);
    res.status(500).json({ message: "Error fetching test details", error: err.message });
  }
};

/**
 * 4. Get Published Subscription Plans
 */
export const getPublishedSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isPublished: true })
        .populate("categories", "name slug image")
        .sort({ price: 1 });
    res.status(200).json({ success: true, plans: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching subscription plans" });
  }
};

/**
 * 5. Get Upcoming & Popular Exams for Home Gallery
 * Logic: 
 * - 'Upcoming': Recently unpublished tests.
 * - 'Popular': Recently published tests.
 */
export const getUpcomingExams = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({ success: false, message: "Database connecting..." });
    }

    // 1. POPULAR: Recently Published Tests
    const [popularMocks, popularGrands] = await Promise.all([
      MockTest.find({ isPublished: true })
        .populate("category", "name slug icon image")
        .select("title subcategory isPublished thumbnail category createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      GrandTest.find({ isPublished: true })
        .populate("category", "name slug icon image")
        .select("title subcategory isPublished thumbnail category createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const formattedPopular = [...popularMocks, ...popularGrands]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(t => ({ ...t, isUpcoming: false, type: 'test' }));

    // 2. UPCOMING: Strictly Empty Categories + Unpublished Tests
    // A. Fetch all categories and find which ones HAVE published tests
    const [allCategories, pubMocks, pubGrands] = await Promise.all([
      Category.find({}).lean(),
      MockTest.distinct("category", { isPublished: true }),
      GrandTest.distinct("category", { isPublished: true })
    ]);

    const publishedCatIds = new Set([
      ...pubMocks.map(id => id.toString()),
      ...pubGrands.map(id => id.toString())
    ]);

    // Empty Categories = Categories with NO published tests
    const emptyCategories = allCategories.filter(cat => !publishedCatIds.has(cat._id.toString()));

    // B. Fetch Unpublished Tests (Drafts)
    const [draftMocks, draftGrands] = await Promise.all([
      MockTest.find({ isPublished: false }).lean(),
      GrandTest.find({ isPublished: false }).lean()
    ]);

    // C. Combine for Upcoming List
    const upcomingList = [
      ...emptyCategories.map(cat => ({
        _id: cat._id,
        title: cat.name,
        slug: cat.slug,
        thumbnail: cat.image,
        isUpcoming: true,
        type: 'category'
      })),
      ...[...draftMocks, ...draftGrands].map(t => ({
        _id: t._id,
        title: t.title,
        thumbnail: t.thumbnail,
        isUpcoming: true,
        type: 'test'
      }))
    ];

    res.status(200).json({ 
      success: true, 
      upcoming: upcomingList,
      popular: formattedPopular
    });
  } catch (err) {
    console.error("❌ UPCOMING_EXAMS_STRICT_ERROR:", err);
    res.status(500).json({ success: false, message: "Error fetching upcoming exams" });
  }
};

