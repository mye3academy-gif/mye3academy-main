import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import { Clock, BookOpen, FileText, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const MockTestCard = ({ test, isEmbedded = false, index = 0 }) => {
  const navigate = useNavigate();
  const { userData, myMockTests } = useSelector((state) => state.user);

  const isPurchased =
    userData?.purchasedTests?.some(
      (id) => String(id._id || id) === String(test._id)
    ) || myMockTests?.some((t) => String(t._id) === String(test._id));

  const effectivePrice =
    test.discountPrice > 0 && Number(test.discountPrice) < Number(test.price)
      ? Number(test.discountPrice)
      : Number(test.price || 0);

  const canStart = test.isFree === true || String(test.isFree) === "true" || effectivePrice <= 0 || isPurchased;

  const navigateToTest = (id) => {
    console.log("MockTestCard: Navigating to test", { id: String(id), canStart, isPurchased, userData: !!userData });
    if (!userData) {
      toast.error("Please login to continue");
      return navigate("/login");
    }
    if (canStart && userData?.role === "student") {
      navigate(`/student/instructions/${String(id)}`);
    } else {
      navigate(`/all-tests/${String(id)}`);
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

  const features = [
    { label: "Live Test", count: test.featureCounts?.liveTests || 0, icon: "⚡" },
    { label: "Chapter Test", count: test.featureCounts?.chapterTests || 0, icon: "📝" },
    { label: "Full Test", count: test.featureCounts?.fullTests || 0, icon: "🏆" },
  ];

  const languagesText = useMemo(() => {
    if (!test.languages || test.languages.length === 0) return "English";
    return test.languages.join(", ");
  }, [test.languages]);

  const subcategoryText = test.subcategory || "Mock Test";

  const isGrand = test.isGrandTest === true;

  // Theme Definitions
  const theme = isGrand ? {
    headerBg: "bg-gradient-to-br from-orange-200 via-orange-100/60 to-white",
    pillBg: "bg-orange-200",
    pillText: "text-orange-800",
    accentText: "text-orange-600",
    hoverText: "group-hover:text-orange-800",
    buttonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    buttonHover: "hover:opacity-90",
    shadow: "shadow-orange-200",
    btnLabel: "View Grand Test"
  } : {
    headerBg: "bg-gradient-to-br from-emerald-200 via-emerald-100/60 to-white", 
    pillBg: "bg-emerald-200",
    pillText: "text-emerald-800",
    accentText: "text-emerald-600",
    hoverText: "group-hover:text-emerald-800",
    buttonBg: "bg-gradient-to-r from-emerald-500 to-emerald-600", 
    buttonHover: "hover:opacity-90",
    shadow: "shadow-emerald-200",
    btnLabel: "View Test Series"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={() => navigateToTest(test._id)}
      className={`flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:${theme.shadow}/60 transition-all duration-500 overflow-hidden cursor-pointer group h-full p-2 sm:p-0`}
    >
      {/* ── HEADER (Dynamic Theme) ── */}
      <div className={`pt-3 px-3 pb-1.5 ${theme.headerBg} relative border-b border-slate-50`}>
        <div className="flex justify-between items-start relative z-10">
          {/* Circular Logo - Enhanced Elevation */}
          <div className="relative group/logo">
            <div className={`absolute -inset-1 rounded-full blur-2xl opacity-30 group-hover/logo:opacity-50 transition-opacity duration-700 ${isGrand ? 'bg-orange-400' : 'bg-emerald-400'}`}></div>
            
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-xl border-2 border-white flex items-center justify-center overflow-hidden transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500 relative z-20">
               <div className={`absolute inset-0 opacity-10 ${isGrand ? 'bg-gradient-to-tr from-orange-400 to-transparent' : 'bg-gradient-to-tr from-emerald-400 to-transparent'}`}></div>
               <img
                 src={cardImage}
                 alt="Category"
                 onError={handleImageError}
                 className="w-full h-full object-contain p-1.5 sm:p-2 relative z-10"
               />
            </div>
          </div>
        </div>

        {/* Mock/Grand Label */}
        <div className="mt-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${theme.pillBg} ${theme.pillText}`}>
            {isGrand ? "Grand Test Series" : "Mock Test"}
          </span>
        </div>
      </div>

      <div className="p-3 flex-grow">
        {/* Title */}
        <h3 className={`text-[12px] sm:text-[13px] font-black text-slate-800 leading-tight mb-1 sm:mb-1.5 ${theme.hoverText} transition-colors tracking-tight uppercase line-clamp-2`}>
          {test.title}
        </h3>
        
        {/* Subcategory */}
        <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2 italic">
          {subcategoryText}
        </p>

        {/* Languages */}
        <div className={`flex items-center gap-1.5 mb-2 sm:mb-3 ${theme.accentText} opacity-80`}>
          <BookOpen size={10} strokeWidth={3} />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em]">
            {languagesText}
          </span>
        </div>

        {/* Test Specifications */}
        <div className="space-y-1 sm:space-y-1.5 mb-1 sm:mb-1.5">
           <div className="flex items-center justify-between group/item">
              <div className="flex items-center gap-1.5 sm:gap-2">
                 <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                    <Clock size={9} className={theme.accentText} />
                 </div>
                 <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-500 uppercase">Duration</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase">{test.durationMinutes || 0} MIN</span>
           </div>

           <div className="flex items-center justify-between group/item">
              <div className="flex items-center gap-1.5 sm:gap-2">
                 <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                    <FileText size={9} className={theme.accentText} />
                 </div>
                 <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-500 uppercase">Qs</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase">{test.totalQuestions || 0}</span>
           </div>

           <div className="flex items-center justify-between group/item">
              <div className="flex items-center gap-1.5 sm:gap-2">
                 <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${theme.pillBg} flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                    <Trophy size={9} className={theme.accentText} />
                 </div>
                 <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-500 uppercase">Marks</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase">{test.totalMarks || 0}</span>
           </div>

           <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between group/item">
              <div className="flex items-center gap-1.5 sm:gap-2">
                 <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${isGrand ? 'bg-orange-50' : 'bg-emerald-50'} flex items-center justify-center`}>
                    <span className="text-[9px]">💎</span>
                 </div>
                 <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-500 uppercase">Pricing</span>
              </div>
              <span className={`text-[9px] sm:text-[10px] font-black ${test.isFree ? 'text-emerald-600' : 'text-slate-800'}`}>
                 {test.isFree ? 'FREE' : `Rs.${effectivePrice}`}
              </span>
           </div>
        </div>
      </div>


      {/* ── FOOTER (Action Button) ── */}
      <div className="px-3 pb-3 mt-auto">
        <button
          onClick={handleAction}
          className={`w-full py-2 ${theme.buttonBg} ${theme.buttonHover} text-white rounded-lg font-black text-[10px] uppercase tracking-[0.15em] shadow-md shadow-slate-200/50 transition-all active:scale-[0.95] flex items-center justify-center gap-1.5 group/btn whitespace-nowrap`}
        >
          <span className="hidden sm:inline">{theme.btnLabel}</span>
          <span className="sm:hidden">VIEW TEST</span>
          <ChevronRight 
            size={12} 
            strokeWidth={4}
            className="group-hover/btn:translate-x-0.5 transition-transform" 
          />
        </button>
      </div>

    </motion.div>
  );
};

export default MockTestCard;
