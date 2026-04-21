import mongoose from "mongoose";
import SubscriptionPlan from "./models/SubscriptionPlan.js";

// From the debug output we know these category IDs in mye3academy DB:
// SSC    : 69a82050516317e2889df59b  (SSC CHCL, SSC CGHL, SSC GD CONSTABLE, SSC FOREST OFFICER)
// Banking: 69a82050516317e2889df59c  (IBPS CLERK, SBI CLERK)
// Railways: 69a82050516317e2889df59d (RRB, RAILWAYS, RFC)
// Police : 69a82050516317e2889df59e  (TG CONSATBLE, TG SUB-INSPECTOR)
// UPSC   : 69a82050516317e2889df59f  (CIVILS MOCKTEST, CIVILS LEVEL -1)
// GROUP-1: 69b14ef748bfefcb6fe0692e
// GROUP-2: 69b14f0948bfefcb6fe06933  (grop constable)
// GROUP-3: 69b14f1a48bfefcb6fe06938
// GROUP-4: 69b14f2648bfefcb6fe0693d
// IBPS   : 69dcaac0306df1d4d261a851  (IBPS RRB PO Mock Test)

// The "groups" plan should unlock GROUP-2 plus related categories (SSC, Police, Railways)
const PLAN_ID = "69e5e1095b248188b38fdc01"; // "groups" plan

const ALL_RELEVANT_CATEGORIES = [
  "69b14f0948bfefcb6fe06933", // GROUP-2
  "69a82050516317e2889df59e", // Police  
  "69a82050516317e2889df59b", // SSC
  "69a82050516317e2889df59d", // Railways
];

mongoose.connect("mongodb+srv://nrakeshkumar36_db_user:rakesh@cluster0.xbbx94r.mongodb.net/mye3academy?retryWrites=true&w=majority").then(async () => {
    try {
        const updated = await SubscriptionPlan.findByIdAndUpdate(
            PLAN_ID,
            { categories: ALL_RELEVANT_CATEGORIES },
            { new: true }
        );
        console.log("✅ Updated plan:", updated.name);
        console.log("   Categories:", updated.categories);
    } catch(e) {
        console.error("❌ Error:", e.message);
    }
    process.exit(0);
});
