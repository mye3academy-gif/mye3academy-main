import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { Crown, CheckCircle2, ArrowRight } from "lucide-react";
import { fetchStudentProfile } from "../../redux/studentSlice"; 

export default function SubscriptionPassBanner({ pass, categoryName, isSubscribed, selectedCatId, type }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!pass) return null;

    // Check if user already has this subscription active or category covered
    const hasActivePass = isSubscribed || userData?.activeSubscriptions?.some(
        (sub) => {
            const subPlanId = sub.planId?._id?.toString() || sub.planId?.toString();
            const passId = pass._id?.toString();
            return subPlanId === passId && new Date(sub.expiresAt) > new Date();
        }
    );

    const effectivePrice = pass.discountPrice > 0 && pass.discountPrice < pass.price 
        ? pass.discountPrice : pass.price;

    const discountPercentage = pass.discountPrice > 0 
        ? Math.round((1 - pass.discountPrice / pass.price) * 100) : 0;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuyPass = async () => {
        if (!userData) {
            toast.error("Please login to purchase passes.");
            return navigate("/login");
        }

        setIsProcessing(true);
        const toastId = toast.loading("Initializing secure checkout...");

        try {
            // 1. Create Order for SubscriptionPlan
            const { data: orderData } = await api.post("/api/payment/create-order", {
                cartItems: [pass._id],
                itemType: "SubscriptionPlan"
            });

            if (!orderData.success) throw new Error("Could not initialize order");

            // 2. Handle Mock Order (Test Mode)
            if (orderData.id.startsWith("mock_order_")) {
                toast.dismiss(toastId);
                toast.loading("Simulating checkout...");
                await new Promise(r => setTimeout(r, 1000));
                
                const { data: verifyData } = await api.post("/api/payment/verify-payment", {
                    razorpay_order_id: orderData.id,
                    razorpay_payment_id: "mock_pay_" + Date.now(),
                    razorpay_signature: "mock_sig_" + Date.now(),
                });

                toast.dismiss();
                if (verifyData.success) {
                    dispatch(fetchStudentProfile());
                    toast.success("🎉 Pass Unlocked! Welcome to Premium!");
                    setTimeout(() => navigate("/student-dashboard?tab=my-tests"), 1500);
                } else {
                    toast.error("Failed to activate pass. Try again.");
                }
                setIsProcessing(false);
                return;
            }

            // 3. Real Razorpay Flow
            const res = await loadRazorpayScript();
            if (!res) throw new Error("Razorpay SDK failed to load");

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Mye3 Academy",
                description: `Purchase: ${pass.name}`,
                image: "/logo.png",
                order_id: orderData.id,
                handler: async (response) => {
                    try {
                        toast.dismiss(toastId);
                        const verifyingId = toast.loading("Verifying payment...");
                        const { data: verifyData } = await api.post("/api/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.dismiss(verifyingId);
                        if (verifyData.success) {
                            dispatch(fetchStudentProfile());
                            toast.success("🎉 Pass Active! Enjoy unlimited access!");
                            setTimeout(() => navigate("/student-dashboard?tab=my-tests"), 1500);
                        } else {
                            toast.error("Payment verification failed. Contact support.");
                        }
                    } catch (err) {
                        toast.dismiss();
                        toast.error("Payment error. Please contact support.");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: { name: userData.name, email: userData.email },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: () => { setIsProcessing(false); toast.dismiss(toastId); } }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Purchase Error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to process payment";
            toast.dismiss(toastId);
            toast.error(msg);
            setIsProcessing(false);
        }
    };

    if (hasActivePass) {
        return (
            <div className="mb-8 w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 md:p-6 shadow-lg text-white">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest">{pass.name} Active!</h3>
                        <p className="text-emerald-100 text-[9px] md:text-sm font-bold uppercase tracking-tight">Unlimited access to all {categoryName || "Premium"} tests.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isMock = type === "mock";
    const isGrand = type === "grand";

    // Dynamic Colors based on type
    const bannerBg = isMock 
        ? "from-emerald-600 via-teal-700 to-emerald-800" 
        : isGrand 
            ? "from-orange-500 via-amber-600 to-orange-700" 
            : "from-indigo-900 via-[#1e1b4b] to-indigo-950";

    const accentColor = isMock ? "emerald" : isGrand ? "orange" : "indigo";
    const buttonBg = isMock 
        ? "from-emerald-500 to-teal-600 shadow-emerald-100" 
        : isGrand 
            ? "from-orange-500 to-amber-600 shadow-orange-100" 
            : "from-indigo-600 to-blue-600 shadow-indigo-100";

    return (
        <div className={`mb-3 w-full bg-gradient-to-br ${bannerBg} rounded-xl md:rounded-3xl p-0.5 relative overflow-hidden shadow-lg`}>
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-white/10 rounded-full blur-[20px]"></div>

            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[12px] md:rounded-[22px] p-3 md:p-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8">
                
                {/* Content */}
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-950 text-[6px] md:text-[8px] font-black uppercase tracking-widest rounded-full">
                            <Crown size={6} /> PRO
                        </div>
                        {isMock && <span className="text-[6px] font-black text-emerald-300 uppercase tracking-widest">Mock Edition</span>}
                        {isGrand && <span className="text-[6px] font-black text-orange-300 uppercase tracking-widest">Grand Edition</span>}
                    </div>
                    
                    <h2 className="text-sm md:text-3xl font-black text-white leading-tight mb-0.5 uppercase tracking-tight">
                        {categoryName ? `${categoryName} Pass` : "Premium Pass"}
                    </h2>
                    
                    <p className="text-white/60 text-[8px] md:text-base font-bold uppercase tracking-widest line-clamp-1 md:line-clamp-none">
                        Unrestricted access for {pass.validityDays} days
                    </p>

                    {/* Features - Desktop Only */}
                    <div className="hidden md:flex flex-wrap gap-4 mt-4">
                        {["All Premium Tests", `${pass.validityDays} Days Validity`, "Detailed Solutions"].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 size={16} className={`text-${accentColor}-400`} />
                                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buy Box */}
                <div className="bg-white rounded-lg md:rounded-2xl p-2.5 md:p-6 shadow-xl w-full md:w-80 shrink-0">
                    <div className="flex items-center justify-between md:flex-col md:justify-center mb-2 md:mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] md:text-xl font-black text-slate-400">₹</span>
                            <span className="text-xl md:text-5xl font-black text-slate-800 tracking-tighter">{effectivePrice}</span>
                        </div>
                        {discountPercentage > 0 && (
                            <div className="flex items-center gap-1 md:mt-1">
                                <span className="line-through text-[7px] md:text-sm font-bold text-slate-400">₹{pass.price}</span>
                                <span className="bg-rose-100 text-rose-600 px-1 py-0.5 rounded text-[6px] md:text-[10px] font-black uppercase tracking-widest">
                                    -{discountPercentage}%
                                </span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleBuyPass}
                        disabled={isProcessing}
                        className={`w-full bg-gradient-to-r ${buttonBg} text-white py-2 md:py-4 rounded-md md:rounded-xl font-black uppercase tracking-widest text-[9px] md:text-sm hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1 group disabled:opacity-70`}
                    >
                        {isProcessing ? "Wait..." : "Buy Now"}
                        {!isProcessing && <ArrowRight size={12} className="hidden md:block group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
