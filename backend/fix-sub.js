import mongoose from "mongoose";
import SubscriptionPlan from "./models/SubscriptionPlan.js";
import Category from "./models/Category.js";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        // Find GROUP-2 category (the one actually used in tests - from 69a82050... range)
        // From debug: GROUP-2 in Category collection is 69b14f0948bfefcb6fe06933
        // But tests don't use this ID. Let's check what categories exist with the old IDs
        const allCats = await Category.find({}).select("_id name").lean();
        console.log("All categories:");
        allCats.forEach(c => console.log(`  ${c.name}: ${c._id}`));

        // Find all subscription plans
        const plans = await SubscriptionPlan.find({}).lean();
        console.log("\nAll plans:");
        plans.forEach(p => console.log(`  ${p.name}: categories=${JSON.stringify(p.categories)}`));
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
