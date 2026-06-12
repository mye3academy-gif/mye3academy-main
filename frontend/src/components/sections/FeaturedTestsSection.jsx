import React, { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  Users,
  Rocket,
  Wallet,
  Play,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicTestById } from "../../redux/mockTestSlice";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";

// Helper for Stats
const StatItem = ({ icon: Icon, value, label, accentLight }) => (
  <div className="text-center">
    <Icon size={18} className={`${accentLight} mx-auto mb-1`} />
    <p className="text-lg font-black text-slate-800 leading-tight">{value}</p>
    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
      {label}
    </p>
  </div>
);

const TestCard = ({ test }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const title = (test.title || test.subcategory || test.name || "Exam").toUpperCase();
  const isGrand = test.isGrandTest === true;

  // Theme Colors
  const themeColor = isGrand ? "border-t-orange-500" : "border-t-emerald-500";
  const btnColor = isGrand ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700";

  const handleAction = (e) => {
    e.stopPropagation();
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    navigate(`/all-tests/${test._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/all-tests/${test._id}`)}
      className={`group flex flex-col items-start text-left p-6 bg-white border border-slate-100 border-t-4 ${themeColor} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative min-h-[180px]`}
    >
      <div className="flex-1 w-full">
        {/* Title */}
        <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight uppercase leading-tight mb-2">
           {title}
        </h3>

        {/* Subjects/Languages */}
        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-3">
           {test.languages?.join(", ") || "English, Maths, General Science"}
        </p>
      </div>

      <button
        onClick={handleAction}
        className={`mt-4 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95`}
      >
        View Test <ChevronRight size={14} strokeWidth={3} />
      </button>
    </div>
  );
};

// ----------------------------------------------------
// FEATURED SECTION COMPONENT
// ----------------------------------------------------

const FeaturedTestsSection = ({
  id,
  title,
  tests,
  loading,
  showViewAll,
  onViewAll,
  viewAllText = "View All Tests",
  CardComponent: Component = TestCard, // Fixed: Renamed to Component to satisfy linter
}) => {
  const isAltBg = id === "grand-tests";
  const displayedTests = tests || [];

  return (
    <section
      className={`py-16 md:py-24 ${
        isAltBg ? "bg-[#f1f5f9]" : "bg-[#f8fafc]"
      } text-slate-800 relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://api.netlify.com/builds/grid.svg')]"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <h2 className={`text-center text-2xl md:text-4xl font-black uppercase tracking-tighter ${
            title.toLowerCase().includes("grand") 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-800 to-blue-900 drop-shadow-sm px-4 py-1" 
              : "text-slate-900"
          }`}>
            {title.toUpperCase()}
          </h2>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && displayedTests.length === 0 && (
          <p className="text-center text-slate-400 text-lg font-bold">
            No tests found.
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-10">
          {!loading &&
            displayedTests.map((test, idx) => (
              <div key={test._id} className="flex">
                <div className="w-full flex-grow">
                  <Component test={test} index={idx} />
                </div>
              </div>
            ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={onViewAll}
              className="px-10 py-3.5 font-bold uppercase tracking-widest text-indigo-600 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm hover:border-indigo-600 hover:bg-indigo-50 transform hover:scale-[1.02] transition-all duration-300 text-[11px]"
            >
              Explore All Test Series
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTestsSection;
