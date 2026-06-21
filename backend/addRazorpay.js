import mongoose from "mongoose";
import dotenv from "dotenv";
import PaymentGateway from "./models/PaymentGateway.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");
    
    const existing = await PaymentGateway.findOne({ name: "Razorpay" });
    if (existing) {
      console.log("Razorpay already exists!");
    } else {
      const razorpay = new PaymentGateway({
        name: "Razorpay",
        isActive: false,
        currency: "INR",
        credentials: {
          keyId: "",
          keySecret: ""
        },
        isTestMode: false,
        themeColor: "#3399cc"
      });
      await razorpay.save();
      console.log("Razorpay successfully added to the database!");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

run();
