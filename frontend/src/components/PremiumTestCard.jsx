import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Unlock, Play, FileText, Trophy, CheckCircle2, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { fetchPublicTestById } from "../redux/mockTestSlice";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

import { motion } from "framer-motion";

const PremiumTestCard = ({ test, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate  = useNavigate();

  const { userData, myMockTests }  = useSelector((s) => s.user);

  const purchasedTests = userData?.purchasedTests || userData?.enrolledMockTests || [];
  const isGrand        = test.isGrandTest === true;
  const isFree         = test.isFree === true;
  
  const hasPurchased   = purchasedTests.some((i) => String(i._id || i) === String(test._id)) || 
                       myMockTests?.some((t) => String(t._id) === String(test._id));

  const effectivePrice =
    test.discountPrice > 0 && Number(test.discountPrice) < Number(test.price)
      ? Number(test.discountPrice)
      : Number(test.price);

  const canStart = isFree || effectivePrice <= 0 || hasPurchased;

  const navigateToTest = (id) => {
    const idStr = String(id);
    console.log("PremiumTestCard: Navigating to test", { id: idStr, canStart, hasPurchased, userData: !!userData });
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    if (canStart && userData?.role === "student") {
      navigate(`/student/instructions/${idStr}`);
    } else {
      navigate(`/all-tests/${idStr}`);
    }
  };

  const handleAction = (e) => {
    if (e) e.stopPropagation();
    navigateToTest(test._id);
  };

  const cardImage = test.thumbnail 
    ? getImageUrl(test.thumbnail)
    : (test.category && (test.category.icon || test.category.image)) 
      ? getImageUrl(test.category.icon || test.category.image) 
      : `${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`;

  const enrolledCount = useMemo(() => {
    const total = (test.baseEnrolledCount || 0) + (test.attempts?.length || 0);
    if (total >= 1000) {
      const num = total / 1000;
      return `${num >= 10 ? Math.round(num) : num.toFixed(1)}k`;
    }
    return total;
  }, [test.baseEnrolledCount, test.attempts]);

  // Theme (Premium Grand)
  const theme = {
    headerBg: "bg-gradient-to-br from-orange-200 via-orange-100/60 to-white",
    pillBg: "bg-orange-200",
    pillText: "text-orange-800",
    accentText: "text-orange-600",
    hoverText: "group-hover:text-orange-800",
    buttonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    buttonHover: "hover:opacity-90",
    shadow: "shadow-orange-200",
    btnLabel: "View Grand Test"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={() => navigateToTest(test._id)}
      className={`flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:${theme.shadow}/60 transition-all duration-500 overflow-hidden cursor-pointer group h-full`}
    >
      {/* ── HEADER (Peach Theme) ── */}
      <div className={`pt-3 px-3 pb-1 ${theme.headerBg} relative border-b border-slate-50`}>
        <div className="flex justify-between items-start relative z-10">
          {/* Circular Logo - Enhanced Elevation */}
          <div className="relative group/logo">
            <div className="absolute -inset-1 rounded-full blur-2xl opacity-30 group-hover/logo:opacity-50 transition-opacity duration-700 bg-orange-400"></div>
            
            <div className="w-10 h-10 rounded-full bg-white shadow-xl border-2 border-white flex items-center justify-center overflow-hidden transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500 relative z-20">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-orange-400 to-transparent"></div>
              <img
                src={cardImage}
                alt="Category"
                onError={handleImageError}
                className="w-full h-full object-contain p-2 relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="mt-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${theme.pillBg} ${theme.pillText}`}>
            Grand Test Series
          </span>
        </div>
      </div>

      <div className="p-3 flex-grow flex flex-col">
        {/* Title */}
        <h3 className={`text-[13px] font-black text-slate-800 leading-tight mb-1.5 ${theme.hoverText} transition-colors line-clamp-2 min-h-[2rem] tracking-tight uppercase`}>
          {test.title}
        </h3>

        {/* Subjects */}
        <div className={`flex items-center gap-2 mb-3 ${theme.accentText} opacity-80`}>
          <BookOpen size={11} strokeWidth={3} />
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            {test.languages && test.languages.length > 0 ? test.languages.join(", ") : "ENGLISH"}
          </span>
        </div>

        {/* Specifications - Vertical List */}
        <div className="space-y-1.5 mb-1.5">
           <div className="flex items-center justify-between group/item">
               <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                     <Clock size={10} className={theme.accentText} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 md:block hidden">DURATION</span>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 block md:hidden">TIME</span>
               </div>
               <span className="text-[10px] font-black text-slate-800 uppercase md:block hidden">{test.durationMinutes || 0} MINUTES</span>
               <span className="text-[10px] font-black text-slate-800 uppercase block md:hidden">{test.durationMinutes || 0} MIN</span>
            </div>

           <div className="flex items-center justify-between group/item">
               <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                     <FileText size={10} className={theme.accentText} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 md:block hidden">TOTAL QUESTIONS</span>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 block md:hidden">QUESTIONS</span>
               </div>
               <span className="text-[10px] font-black text-slate-800 uppercase md:block hidden">{test.totalQuestions || 0} QUESTIONS</span>
               <span className="text-[10px] font-black text-slate-800 uppercase block md:hidden">{test.totalQuestions || 0} Qs</span>
            </div>

           <div className="flex items-center justify-between group/item">
               <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                     <Trophy size={10} className={theme.accentText} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 md:block hidden">TOTAL MARKS</span>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 block md:hidden">MARKS</span>
               </div>
               <span className="text-[10px] font-black text-slate-800 uppercase md:block hidden">{test.totalMarks || 0} MARKS</span>
               <span className="text-[10px] font-black text-slate-800 uppercase block md:hidden">{test.totalMarks || 0} Pts</span>
            </div>

           <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between group/item">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                     <span className="text-[10px]">💎</span>
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 md:block hidden">ACCESS TYPE</span>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 block md:hidden">ACCESS</span>
               </div>
               <span className={`text-[10px] font-black ${test.isFree ? 'text-emerald-600' : 'text-slate-800'} md:block hidden`}>
                  {test.isFree ? 'FREE ACCESS' : `Rs. ${effectivePrice}`}
               </span>
               <span className={`text-[10px] font-black ${test.isFree ? 'text-emerald-600' : 'text-slate-800'} block md:hidden`}>
                  {test.isFree ? 'FREE' : `Rs. ${effectivePrice}`}
               </span>
            </div>
        </div>
      </div>

      {/* ── FOOTER / ACTION ── */}
      <div className="p-3 pt-0 mt-auto">
        <button
          onClick={handleAction}
          className={`w-full py-2 ${theme.buttonBg} ${theme.buttonHover} text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 group/btn`}
        >
          {theme.btnLabel}
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default PremiumTestCard;
