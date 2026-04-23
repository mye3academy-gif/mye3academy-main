import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { Crown, CheckCircle2, ArrowRight } from "lucide-react";
import { fetchStudentProfile } from "../../redux/studentSlice"; 

export default function SubscriptionPassBanner({ pass, categoryName, isSubscribed, selectedCatId }) {
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
            <div className="mb-8 w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest">{pass.name} is Active!</h3>
                        <p className="text-emerald-100 text-sm font-medium">You have unlimited access to all {categoryName || "Premium"} tests.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 w-full bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-indigo-950 rounded-3xl p-1 relative overflow-hidden shadow-2xl">
            {/* Animated background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Left Content */}
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 shadow-lg shadow-amber-500/20">
                        <Crown size={12} /> PRO PASS
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                        Unlock {categoryName ? `${categoryName} Pass` : "Unlimited Mye3 Pass"}
                    </h2>
                    
                    <p className="text-indigo-200 text-sm md:text-base font-medium mb-6 max-w-xl">
                        {pass.description || `Get unrestricted access to all premium tests, detailed analytics, and previous year papers for ${pass.validityDays} days.`}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {["All Premium Tests", `${pass.validityDays} Days Validity`, "Detailed Solutions"].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Action Box */}
                <div className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-80 shrink-0 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="text-center mb-6">
                        {discountPercentage > 0 && (
                            <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                                <span className="line-through text-sm font-bold">₹{pass.price}</span>
                                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                    Save {discountPercentage}%
                                </span>
                            </div>
                        )}
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-xl font-black text-slate-400">₹</span>
                            <span className="text-5xl font-black text-slate-800 tracking-tighter">{effectivePrice}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleBuyPass}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.1em] text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : "Buy Pass Now"}
                        {!isProcessing && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    <p className="text-center mt-4 text-[10px] font-bold text-slate-400">Secure Payment powered by Razorpay</p>
                </div>
            </div>
        </div>
    );
}
