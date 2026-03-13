import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";
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

        {/* Header — matches Testbook exactly */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800">Popular Exams</h2>
          <p className="text-sm text-slate-500 mt-1">
            Get exam-ready with concepts, questions and study notes as per the latest pattern
          </p>
        </div>

        {/* Tabs — pill style, cyan active */}
        <div className="relative mb-5">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:-left-[18px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-7 md:h-7 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-cyan-500 transition-all active:scale-90 flex"
          >
            <ChevronLeft size={16} md={14} />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 px-4 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`#categories .scroll-tabs::-webkit-scrollbar{display:none}`}</style>
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeCategory === tab.id
                    ? "bg-cyan-500 border-cyan-500 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:border-cyan-400 hover:text-cyan-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 md:-right-[18px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-7 md:h-7 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-cyan-500 transition-all active:scale-90 flex"
          >
            <ChevronRight size={16} md={14} />
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
              {filteredExams.slice(0, 9).map((item) => {
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

                return (
                  <div
                    key={item._id}
                    onClick={handleClick}
                    className="group flex items-center gap-4 px-5 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer"
                  >
                    {/* Circular icon container - optimized size for 3-column layout */}
                    <div className="w-12 h-12 flex-none rounded-full bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                      {testIcon ? (
                        <img
                          src={testIcon}
                          alt={testLabel}
                          className="w-full h-full object-contain p-2"
                          onError={handleImageError}
                        />
                      ) : (
                        <span className="text-lg font-black text-slate-400">
                          {testLabel.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Name - Clean, bold, and vertical aligned */}
                    <span className="flex-1 text-[13px] font-black text-slate-700 group-hover:text-cyan-600 transition-colors leading-tight truncate">
                      {testLabel}
                    </span>

                    {/* Simple Arrow - Exactly like Testbook */}
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-cyan-500 shrink-0 transition-colors" />
                  </div>
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
