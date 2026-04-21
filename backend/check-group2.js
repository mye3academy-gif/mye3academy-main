import mongoose from "mongoose";
import MockTest from "./models/MockTest.js";
import GrandTest from "./models/GrandTest.js";
import SubscriptionPlan from "./models/SubscriptionPlan.js";

// GROUP-2 category ID confirmed from Category collection
const GROUP2_CAT_ID = "69b14f0948bfefcb6fe06933";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        // Tests under GROUP-2
        const mocks = await MockTest.find({ category: GROUP2_CAT_ID }).select("title category").lean();
        const grands = await GrandTest.find({ category: GROUP2_CAT_ID }).select("title category").lean();
        
        console.log(`\nMock Tests under GROUP-2: ${mocks.length}`);
        mocks.forEach(t => console.log(`  - ${t.title}`));
        
        console.log(`\nGrand Tests under GROUP-2: ${grands.length}`);
        grands.forEach(t => console.log(`  - ${t.title}`));

        // Check subscription plan categories
        const plans = await SubscriptionPlan.find({}).lean();
        console.log("\nSubscription Plan categories:");
        plans.forEach(p => console.log(`  ${p.name}: ${JSON.stringify(p.categories)}`));

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
