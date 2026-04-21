import SubscriptionPlan from "../../models/SubscriptionPlan.js";

// GET ALL
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().populate("categories", "name").sort({ createdAt: -1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
export const addSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, discountPrice, validityDays, categories, isPublished } = req.body;

    const parseIds = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      try { const p = JSON.parse(val); return Array.isArray(p) ? p.filter(Boolean) : []; }
      catch { return []; }
    };

    const newPlan = new SubscriptionPlan({
      name,
      description,
      price,
      discountPrice,
      validityDays,
      categories: parseIds(categories),
      isPublished: isPublished !== undefined ? (isPublished === true || isPublished === "true") : true,
    });

    await newPlan.save();
    res.status(201).json({ success: true, message: "Plan added", plan: newPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discountPrice, validityDays, categories, isPublished } = req.body;

    const parseIds = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      try { const p = JSON.parse(val); return Array.isArray(p) ? p.filter(Boolean) : []; }
      catch { return []; }
    };

    const updateData = { name, description, price, discountPrice, validityDays };
    if (isPublished !== undefined) updateData.isPublished = isPublished === true || isPublished === "true";
    if (categories  !== undefined) updateData.categories    = parseIds(categories);

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlan) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, message: "Updated successfully", plan: updatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
