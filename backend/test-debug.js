import mongoose from "mongoose";
import User from "./models/Usermodel.js";
import MockTest from "./models/MockTest.js";
import SubscriptionPlan from "./models/SubscriptionPlan.js";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        const user = await User.findById("69b05d129d0562ef04b6bbd2").populate("activeSubscriptions.planId");
        if (!user) {
            console.log("No user found!");
            process.exit(0);
        }

        const activeSubs = (user.activeSubscriptions || []).filter(sub => sub.planId && new Date(sub.expiresAt) > new Date());
        console.log(`Active plans count: ${activeSubs.length}`);

        for (const sub of activeSubs) {
            const plan = sub.planId;
            console.log(`Plan ID: ${plan._id}, Name: ${plan.name}, Categories:`, plan.categories);

            for (const catId of (plan.categories || [])) {
                console.log(`Searching for MockTests with category: ${catId}`);
                const mocks = await MockTest.find({ category: catId, isPublished: true }).select("title isPublished").lean();
                console.log(`Found ${mocks.length} mocks:`, mocks);
            }
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
