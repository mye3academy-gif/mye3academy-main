import mongoose from "mongoose";
import Category from "./models/Category.js";
import MockTest from "./models/MockTest.js";

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        const c = await Category.findById("69b14f0948bfefcb6fe06933");
        console.log("Category 69b14f0948bfefcb6fe06933 details:");
        console.log(c);
        
        const mocks = await MockTest.find({}).limit(5).select("title category subCategory");
        console.log("Sample tests:");
        console.log(mocks);

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
