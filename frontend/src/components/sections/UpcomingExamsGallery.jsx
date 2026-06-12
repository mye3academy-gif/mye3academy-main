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
      if (!userData) {
        return navigate("/login");
      }
      const isPurchased =
        userData?.purchasedTests?.some((pid) => String(pid._id || pid) === idStr) ||
        myMockTests?.some((t) => String(t._id) === idStr);

      const price = Number(item.discountPrice || item.price || 0);
      const isFree = item.isFree === true || String(item.isFree) === "true";
      const canStart = isFree || price <= 0 || isPurchased;

      if (canStart) {
        navigate(`/student/instructions/${idStr}`);
      } else {
        navigate(`/all-tests/${idStr}`);
      }
    };

    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-amber-500"
    ];
    const colorClass = colors[Math.abs(String(item._id).charCodeAt(0)) % colors.length];

    return (
      <div
        key={item._id}
        onClick={handleClick}
        className="group relative flex flex-col bg-white rounded-[24px] shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden h-full border border-slate-50"
      >
        {/* Top Color Flood - 40% height */}
        <div className={`h-16 w-full ${colorClass} relative`}>
          <div className="absolute inset-0 bg-black/5"></div>
          {/* Status Badge for "Upcoming" */}
          {item.isUpcoming && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[7px] font-black rounded-full tracking-widest uppercase border border-white/30">
               Upcoming
            </span>
          )}
        </div>

        {/* Bottom Content Area */}
        <div className="pt-8 px-4 pb-4 flex flex-col flex-grow relative">
          
          {/* Floating Icon Container */}
          <div className="absolute -top-7 left-4 md:left-5 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl border border-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-500">
            {icon ? (
              <img
                src={icon}
                alt={title}
                className="w-full h-full object-contain p-2"
                onError={handleImageError}
              />
            ) : (
              <div className="text-sm md:text-lg font-black text-slate-300 uppercase">
                {title.charAt(0)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="mt-2">
             <h3 className="text-[11px] md:text-[14px] font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                {title}
             </h3>
             <div className="mt-2 flex items-center justify-between">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                   Explore now
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                   <ChevronRight size={12} strokeWidth={3} />
                </div>
             </div>
          </div>
        </div>
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
                Upcoming Tests
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
