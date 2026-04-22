import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicTestById } from "../redux/mockTestSlice";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import api from "../api/axios";
import { Clock, BookOpen, FileText, MinusCircle, Tag, ArrowLeft, Play, ShieldCheck, Target, Globe, HelpCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import { addPurchasedTest, fetchMyMockTests } from "../redux/userSlice";
import RelatedTests from "../components/sections/RelatedTests";

export default function MockTestDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userData, myMockTests } = useSelector((state) => state.user);
    const test = useSelector((state) => state.mocktest.selectedMocktest);
    const status = useSelector((state) => state.mocktest.selectedStatus);
    const error = useSelector((state) => state.mocktest.selectedError);

    useEffect(() => {
        if (id) dispatch(fetchPublicTestById(id));
        
        // Cleanup: dismiss any hanging toasts when leaving the page
        return () => toast.dismiss();
    }, [dispatch, id]);

    const isPurchased =
        userData?.purchasedTests?.some((pid) => String(pid._id || pid) === String(id)) ||
        myMockTests?.some((t) => String(t._id) === String(id));

    const effectivePrice =
        test?.discountPrice > 0 && Number(test?.discountPrice) < Number(test?.price)
            ? Number(test?.discountPrice)
            : Number(test?.price || 0);

    // Determine if this specific test has attempts exhausted and needs re-purchase
    const enrolledData = myMockTests?.find(t => String(t._id) === String(id));
    const isLimitReached = enrolledData?.isPurchaseRequired === true;

    const canStart = (test?.isFree || effectivePrice <= 0 || isPurchased) && !isLimitReached;

    const [isProcessing, setIsProcessing] = React.useState(false);

    // Dynamic Razorpay Script Loader
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUnlock = async () => {
        if (!userData) {
            toast.error("Please login to unlock tests");
            return navigate("/login");
        }

        if (userData?.role !== "student") {
            toast.error("Access Restricted: Only students can attempt examinations.");
            return;
        }

        if (canStart) {
            return navigate(`/student/instructions/${id}`);
        }

        setIsProcessing(true);
        const toastId = toast.loading("Initializing purchase...");

        try {
            // 1. Check if it's actually free (backend safety) or needs payment
            if (effectivePrice <= 0 || test.isFree) {
                const { data } = await api.post("/api/payment/enroll-free", {
                    cartItems: [id]
                });

                if (data.success) {
                    dispatch(addPurchasedTest(id));
                    dispatch(fetchMyMockTests()); // Refresh store
                    toast.update(toastId, { render: "Enrolled successfully!", type: "success", isLoading: false, autoClose: 3000 });
                    navigate(`/student/instructions/${id}`);
                }
                setIsProcessing(false);
                return;
            }

            // 2. Create Order first to see if it's a Mock order or Real
            const { data: orderData } = await api.post("/api/payment/create-order", {
                cartItems: [id]
            });

            if (!orderData.success) {
                throw new Error(orderData.message || "Order creation failed");
            }

            // 3. Handle Mock vs Real Flow
            if (orderData.id.startsWith("mock_order_")) {
                toast.update(toastId, { render: "Simulating mock payment...", isLoading: true });
                
                // Realism delay
                await new Promise(r => setTimeout(r, 1500));

                const { data: verifyData } = await api.post("/api/payment/verify-payment", {
                    razorpay_order_id: orderData.id,
                    razorpay_payment_id: "mock_pay_" + Date.now(),
                    razorpay_signature: "mock_sig_" + Date.now(),
                });

                if (verifyData.success) {
                    dispatch(addPurchasedTest(id));
                    dispatch(fetchMyMockTests());
                    toast.update(toastId, { render: "Test Unlocked (Test Mode)!", type: "success", isLoading: false, autoClose: 3000 });
                    navigate(`/student/instructions/${id}`);
                } else {
                    toast.update(toastId, { render: "Mock verification failed.", type: "error", isLoading: false, autoClose: 3000 });
                }
                setIsProcessing(false);
                return;
            }

            // 4. Paid Flow - Real Razorpay Flow
            const res = await loadRazorpayScript();
            if (!res) {
                toast.update(toastId, { render: "Razorpay SDK failed to load.", type: "error", isLoading: false, autoClose: 3000 });
                setIsProcessing(false);
                return;
            }

            // 5. Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Mye3 Academy",
                description: `Payment for ${test.title}`,
                image: `${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`,
                order_id: orderData.id,
                handler: async (response) => {
                    try {
                        toast.update(toastId, { render: "Verifying payment...", isLoading: true });
                        const { data: verifyData } = await api.post("/api/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyData.success) {
                            dispatch(addPurchasedTest(id));
                            dispatch(fetchMyMockTests());
                            toast.update(toastId, { render: "Test Unlocked Successfully!", type: "success", isLoading: false, autoClose: 3000 });
                            navigate(`/student/instructions/${id}`);
                        } else {
                            toast.update(toastId, { render: "Verification failed.", type: "error", isLoading: false, autoClose: 5000 });
                        }
                    } catch (err) {
                        toast.update(toastId, { render: "Payment verification failed.", type: "error", isLoading: false, autoClose: 5000 });
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: userData.name,
                    email: userData.email,
                },
                theme: {
                    color: "#2563eb",
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast.dismiss(toastId);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Purchase Error:", error);
            const msg = error.response?.data?.message || error.message || "Something went wrong.";
            toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 5000 });
            setIsProcessing(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Portal</p>
                    <p className="text-sm font-black text-slate-900 mt-1">Preparing your assessment...</p>
                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl shadow-blue-900/5 text-center border border-slate-100"
                >
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <MinusCircle size={40} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Technical Disruption</h2>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                        We encountered an issue while retrieving this assessment. This might be due to a synchronization error.
                    </p>
                    <div className="space-y-4">
                        <Link to="/all-tests" className="flex items-center justify-center gap-3 w-full py-4 bg-[#122b5e] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-black transition-all">
                            <ArrowLeft size={16} /> Return to Tests
                        </Link>
                        <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                            Attempt Reconnect
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!test) return null;

    const imgSrc = test.thumbnail
        ? getImageUrl(test.thumbnail)
        : test.category?.image
        ? getImageUrl(test.category.image)
        : `${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`;



    const stats = [
        { icon: <BookOpen size={14} />, label: "Questions", val: test.totalQuestions || 0 },
        { 
            icon: <Clock size={14} />, 
            label: "Duration", 
            val: test.durationMinutes > 0 
                ? `${test.durationMinutes} min` 
                : (test.totalQuestions > 0 ? `${test.totalQuestions * 2} min` : "—") 
        },
        { icon: <FileText size={14} />, label: "Total Marks", val: test.totalMarks || 0 },
        { icon: <MinusCircle size={14} />, label: "Negative", val: test.negativeMarking || "None" },
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-16">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
                
                {/* ── BREADCRUMBS ── */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap px-1">
                    <Link to="/all-tests" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all group">
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
                        <span>Tests</span>
                    </Link>
                    <span className="text-slate-200">/</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{test.category?.name || "EXAMS"}</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[150px]">{test.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* ── LEFT AREA ── */}
                    <div className="flex-1 w-full space-y-6">
                        {/* HERO BANNER (2-Column Card Layout) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full overflow-hidden shadow-xl shadow-blue-900/5 bg-white border border-slate-100 rounded-3xl"
                        >
                            <div className="flex flex-col md:flex-row min-h-[180px]">
                                {/* Left: Image (Like a card) */}
                                <div className="w-full md:w-[240px] bg-slate-50 flex items-center justify-center p-6 border-r border-slate-100">
                                    <div className="w-full h-full max-h-[120px] relative group/thumb">
                                        <div className="absolute -inset-4 bg-blue-400/5 blur-3xl opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                                        <img 
                                            src={imgSrc} 
                                            alt={test.title} 
                                            className="w-full h-full object-contain drop-shadow-xl relative z-10 transition-transform duration-500 group-hover/thumb:scale-110"
                                            onError={handleImageError}
                                        />
                                    </div>
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-600/10`}>
                                            {test.category?.name || "Mock Test"}
                                        </span>
                                        {test.subcategory && (
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">
                                                {test.subcategory}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-4">
                                        {test.title}
                                    </h1>
                                    
                                    <div className="flex flex-wrap gap-5 items-center pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-black text-slate-800 uppercase">{test.durationMinutes || 0} MINS</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-black text-slate-800 uppercase">{test.totalQuestions || 0} Qs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Trophy size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-black text-slate-800 uppercase">{test.totalMarks || 0} Pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* STATS STRIP (Compact) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {stats.map((s, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 group hover:border-blue-500 transition-all duration-300"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-3">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                        <p className="text-sm font-black text-slate-900 uppercase leading-none">{s.val}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* DESCRIPTION & CURRICULUM */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8">
                            <div>
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Test Information</h2>
                                </div>
                                <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
                                    {test.description || "This assessment is designed to evaluate your practical knowledge and speed. It covers the core concepts defined in the exam curriculum with high-quality questions curated by industry experts."}
                                </p>
                            </div>

                            {test.subjects && test.subjects.length > 0 && (
                                <div className="pt-8 border-t border-slate-100">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Units & Coverage</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {test.subjects.map((sub, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 group transition-all">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{sub.name}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase bg-white px-2.5 py-1 rounded-full border border-slate-100">
                                                    {sub.easy + sub.medium + sub.hard > 0 ? `${sub.easy + sub.medium + sub.hard} Qs` : "Full"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── SIDEBAR (STICKY) ── */}
                    <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col">
                            {/* PRICING AREA */}
                            <div className="bg-[#122b5e] pt-12 pb-10 px-8 text-white text-center relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
                                
                                <div className="relative z-10">
                                    {(test.isFree || effectivePrice <= 0) ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300/60 mb-2">Access Status</span>
                                            <div className="text-5xl font-black tracking-tighter text-emerald-400 drop-shadow-sm">FREE</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300/60 mb-2">Enrollment Fee</span>
                                            <div className="flex items-start gap-1 justify-center">
                                                <span className="text-lg font-black mt-2 opacity-50">₹</span>
                                                <span className="text-6xl font-black tracking-tighter">{effectivePrice}</span>
                                            </div>
                                            {test.discountPrice > 0 && test.discountPrice < test.price && (
                                                <div className="flex gap-2 items-center mt-3 scale-110">
                                                    <span className="text-xs font-bold text-blue-200/40 line-through tracking-wide">₹{test.price}</span>
                                                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">
                                                        SAVE {Math.round((1 - test.discountPrice / test.price) * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* DETAILS LIST (Sync with MockTestCard) */}
                            <div className="p-8 space-y-5">
                                {[
                                    { label: "Questions", val: `${test.totalQuestions || 0} Qs`, icon: <HelpCircle size={12} /> },
                                    { label: "Duration", val: test.durationMinutes > 0 ? `${test.durationMinutes} Min` : "Auto", icon: <Clock size={12} /> },
                                    { label: "Max Marks", val: `${test.totalMarks || 0} Pts`, icon: <Trophy size={12} /> },
                                    { label: "Languages", val: Array.isArray(test.languages) && test.languages.length > 0 ? test.languages.join(", ") : "English", icon: <Globe size={12} /> },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between group/sid">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-blue-500 group-hover/sid:bg-blue-600 group-hover/sid:text-white transition-all">
                                                {s.icon}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-800 uppercase">{s.val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA ACTION */}
                            <div className="p-8 pt-0 mt-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUnlock}
                                    disabled={isProcessing}
                                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-blue-600/10 disabled:bg-slate-300 ${
                                        canStart 
                                            ? "bg-[#21b731] hover:bg-[#1a9227]" 
                                            : "bg-blue-600 hover:bg-slate-900"
                                    }`}
                                >
                                    {isProcessing ? <CgSpinner className="animate-spin" size={16} /> : <Play size={14} className="fill-current" />}
                                    {canStart ? "Start Assessment" : "Unlock Access"}
                                </motion.button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* RELATED TESTS SECTION */}
                <RelatedTests 
                    categorySlug={test.category?.slug} 
                    excludeId={id} 
                    limit={4} 
                />
            </div>
        </div>
    );
}