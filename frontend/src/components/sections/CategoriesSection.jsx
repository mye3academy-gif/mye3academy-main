import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";
import { motion } from "framer-motion";
import MockTestCard from "../MockTestCard";

const toTitleCase = (str = "") =>
  str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const CategoriesSection = ({ categories = [], loading }) => {
  const navigate = useNavigate();
  const { userData, myMockTests } = useSelector((state) => state.user);
  const scrollRef = useRef(null);

  /* ── 1. Build category tabs ── */
  const categoryTabs = useMemo(() => {
    if (!categories.length) return [];
    const map = new Map();
    categories.forEach((item) => {
      const slug = item.categorySlug || item.category?.slug || item.slug || "others";
      const name = item.categoryName || item.category?.name || item.name || "Exam";
      if (!map.has(slug.toLowerCase())) map.set(slug.toLowerCase(), name);
    });
    return Array.from(map).map(([id, label]) => {
      const base = label.toUpperCase();
      return { id, label: base.includes("EXAM") ? base : `${base} EXAMS` };
    });
  }, [categories]);

  const [activeCategory, setActiveCategory] = useState("");
  useEffect(() => {
    if (categoryTabs.length > 0 && !activeCategory) setActiveCategory(categoryTabs[0].id);
  }, [categoryTabs, activeCategory]);

  const filteredExams = useMemo(() => {
    if (!activeCategory) return [];
    return categories.filter((item) => {
      const slug = item.categorySlug || item.category?.slug || item.slug || "others";
      return slug.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [categories, activeCategory]);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  /* ── RENDER ── */
  return (
    /* Testbook uses a very light gray section background */
    <section id="categories" className="py-10 bg-slate-50 scroll-mt-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">All Tests</h2>
          <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2 mb-3"></div>
          <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Get exam-ready with concepts, questions and study notes as per the latest pattern
          </p>
        </div>

        {/* Tabs — modern pill style */}
        <div className="relative mb-10">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto pb-4 px-4 md:px-0 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                  activeCategory === tab.id
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                    : "bg-white border border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading exams…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {filteredExams.slice(0, 9).map((item, index) => {
                const testIcon = item.thumbnail 
                  ? getImageUrl(item.thumbnail)
                  : (item.category && (item.category.icon || item.category.image)) 
                    ? getImageUrl(item.category.icon || item.category.image) 
                    : null;
                const testLabel = (item.title || item.subcategory || item.name || "Test").toUpperCase();

                const handleClick = () => {
                  const idStr = String(item._id);
                  if (!userData) {
                    return navigate(`/all-tests/${idStr}`);
                  }
                  
                  const isPurchased =
                    userData?.purchasedTests?.some((pid) => String(pid._id || pid) === idStr) ||
                    myMockTests?.some((t) => String(t._id) === idStr);

                  const effective =
                    item.discountPrice > 0 && Number(item.discountPrice) < Number(item.price)
                      ? Number(item.discountPrice)
                      : Number(item.price || 0);
                  const isFree = item.isFree === true || String(item.isFree) === "true" || effective <= 0;
                  
                  console.log("CategoriesSection: Clicked test", { name: testLabel, id: idStr, isPurchased, isFree });

                  if (isFree || isPurchased) {
                    navigate(`/student/instructions/${idStr}`);
                  } else {
                    navigate(`/all-tests/${idStr}`);
                  }
                };

                const gradients = [
                  "from-teal-500 to-emerald-600",
                  "from-purple-500 to-indigo-600",
                  "from-orange-500 to-red-600",
                  "from-blue-500 to-cyan-600",
                  "from-pink-500 to-rose-600",
                  "from-amber-500 to-orange-600",
                ];
                const gradClass = gradients[index % gradients.length];

                return (
                  <motion.div
                    key={item._id}
                    onClick={handleClick}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className={`group relative flex flex-col p-4 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden bg-gradient-to-br ${gradClass}`}
                  >
                    {/* Glassy Overlay */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] group-hover:bg-transparent transition-all duration-500"></div>
                    
                    {/* Floating Glows */}
                    <div className="absolute -right-6 -top-6 w-16 h-16 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-700"></div>

                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      {/* Modern Icon Container - Smaller */}
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                        {testIcon ? (
                          <img
                            src={testIcon}
                            alt={testLabel}
                            className="w-full h-full object-contain p-2 brightness-0 invert"
                            onError={handleImageError}
                          />
                        ) : (
                          <span className="text-sm font-black text-white">
                            {testLabel.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                         <h3 className="text-[13px] font-black text-white leading-tight uppercase tracking-tight drop-shadow-sm line-clamp-1">
                           {testLabel}
                         </h3>
                         <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest">
                           Test Series
                         </p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center justify-between">
                       <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">
                          Explore
                       </span>
                       <div className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 flex items-center gap-1.5">
                          View
                          <ChevronRight size={12} strokeWidth={3} />
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* "Explore all exams" — bottom right plain link, exactly Testbook */}
            {filteredExams.length > 0 && (
              <div className="mt-4 text-right">
                <Link
                  to="/all-tests"
                  className="text-sm text-cyan-600 font-medium hover:underline inline-flex items-center gap-1 hover:text-cyan-700 transition"
                >
                  Explore all exams
                </Link>
              </div>
            )}
          </>
        )}

        {!loading && filteredExams.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No exams found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
