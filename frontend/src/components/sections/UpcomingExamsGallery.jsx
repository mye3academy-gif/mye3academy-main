import React from "react";
import { Zap, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";

const UpcomingExamsGallery = ({ data = { upcoming: [], popular: [] }, loading }) => {
  const navigate = useNavigate();
  const { userData, myMockTests } = useSelector((state) => state.user);

  const renderCard = (item) => {
    const icon = item.thumbnail 
      ? getImageUrl(item.thumbnail) 
      : (item.category?.image || item.category?.icon ? getImageUrl(item.category.image || item.category.icon) : null);
    
    const title = (item.title || item.subcategory || item.name || "Exam").toUpperCase();
    const isCategory = item.type === 'category';

    const handleClick = () => {
      const idStr = String(item._id);
      if (isCategory) {
        return navigate(`/all-tests?category=${encodeURIComponent(item.slug)}`);
      }

      // ── LOGIC FOR TESTS ──
      if (!userData) {
        return navigate("/login");
      }

      const isPurchased =
        userData?.purchasedTests?.some((pid) => String(pid._id || pid) === idStr) ||
        myMockTests?.some((t) => String(t._id) === idStr);

      const price = Number(item.discountPrice || item.price || 0);
      const isFree = item.isFree === true || String(item.isFree) === "true";
      const canStart = isFree || price <= 0 || isPurchased;

      console.log("UpcomingExamsGallery: Clicked test", { title, id: idStr, isPurchased, canStart });

      if (canStart) {
        navigate(`/student/instructions/${idStr}`);
      } else {
        navigate(`/all-tests/${idStr}`);
      }
    };

    return (
      <div
        key={item._id}
        onClick={handleClick}
        className="group flex flex-col items-center text-center gap-2 p-3 bg-white border border-slate-100 border-t-4 border-t-emerald-500 rounded-lg shadow-sm hover:shadow-md hover:border-t-orange-400 transition-all duration-300 cursor-pointer relative md:flex-row md:text-left md:px-5 md:py-3.5 md:gap-4"
      >
        {/* Status Badge for "Upcoming" */}
        {item.isUpcoming && (
          <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-orange-500 text-white text-[7px] md:text-[8px] font-black rounded-md tracking-widest uppercase shadow-sm z-10 animate-pulse">
             Upcoming
          </span>
        )}
        
        {/* Logo Container */}
        <div className="w-10 h-10 md:w-12 md:h-12 flex-none rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100 group-hover:bg-white group-hover:scale-105 transition-all duration-300">
          {icon ? (
            <img
              src={icon}
              alt={title}
              className="w-full h-full object-contain p-1.5 md:p-2"
              onError={handleImageError}
            />
          ) : (
            <div className="text-sm md:text-lg font-black text-slate-300 uppercase">
              {title.charAt(0)}
            </div>
          )}
        </div>

        {/* Title */}
        <span className="flex-1 text-[11px] md:text-[13px] font-black text-slate-700 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-2 md:line-clamp-1">
           {title}
        </span>

        {/* Simple Arrow (Hidden on mobile) */}
        <ChevronRight size={18} className="hidden md:block text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* 1. UPCOMING SECTION - Only shown if there are upcoming items */}
        {data.upcoming && data.upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                Mock Tests
              </h2>
              <div className="h-1 flex-1 bg-slate-100 rounded-full mx-4 hidden md:block"></div>
              <Zap size={20} className="text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {data.upcoming.map(item => renderCard(item))}
            </div>
          </div>
        )}

        {/* Global Action Link */}
        <div className="mt-10 text-right">
          <Link
            to="/all-tests"
            className="text-[11px] text-indigo-600 font-black hover:underline inline-flex items-center gap-1 uppercase tracking-widest border-b-2 border-indigo-100 pb-0.5 hover:border-indigo-500 transition-all"
          >
            Explore all exams <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingExamsGallery;
