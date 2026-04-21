import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    validityDays: { type: Number, required: true, default: 365 }, // Admin can set validity
    
    // The specific categories this plan unlocks
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    
    // Extra attempts subscribers get per test (added on top of maxAttempts)
    extraAttempts: { type: Number, default: 0 }, // 0 = no extra, -1 = unlimited
    
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
