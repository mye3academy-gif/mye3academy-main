import mongoose from "mongoose";
import User from "./models/Usermodel.js";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    const user = await User.findById("69b05d129d0562ef04b6bbd2").populate("activeSubscriptions.planId");
    console.log("User active subs:", JSON.stringify(user.activeSubscriptions, null, 2));

    if (user.activeSubscriptions && user.activeSubscriptions.length > 0 && user.activeSubscriptions[0].planId) {
        console.log("Categories inside plan:", user.activeSubscriptions[0].planId.categories);
    } else {
        console.log("No valid planId populated!");
    }
    
    process.exit(0);
});
