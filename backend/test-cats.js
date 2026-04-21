import mongoose from "mongoose";
import Category from "./models/Category.js";
import MockTest from "./models/MockTest.js";
import GrandTest from "./models/GrandTest.js";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        // Show all categories
        const cats = await Category.find({}).select("_id name slug").lean();
        console.log("=== ALL CATEGORIES ===");
        cats.forEach(c => console.log(`  ${c._id} => ${c.name}`));

        // Show all unique category IDs used in MockTests
        const mocks = await MockTest.find({}).select("title category").lean();
        console.log("\n=== MOCK TESTS CATEGORY IDs ===");
        mocks.forEach(t => console.log(`  ${t.title} => category: ${t.category}`));

        const grands = await GrandTest.find({}).select("title category").lean();
        console.log("\n=== GRAND TESTS CATEGORY IDs ===");
        grands.forEach(t => console.log(`  ${t.title} => category: ${t.category}`));

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
