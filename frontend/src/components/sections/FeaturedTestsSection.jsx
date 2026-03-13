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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  /* Image logic prioritize thumbnail > category */
  const imageSource = test.thumbnail 
    ? getImageUrl(test.thumbnail)
    : (test.category && (test.category.icon || test.category.image)) 
      ? getImageUrl(test.category.icon || test.category.image) 
      : "/logo.png";

  const isFree = test.isFree === true;
  const isGrand = test.isGrandTest === true;
  const students = test.totalQuestions * 37 + 500;

  const accentColor = isGrand
    ? "from-indigo-600 to-purple-500"
    : "from-cyan-600 to-blue-500";

  const accentLight = isGrand ? "text-indigo-600" : "text-cyan-600";
  const glowColor = isGrand ? "shadow-indigo-100" : "shadow-cyan-100";

  const handleLoginCheck = () => {
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return false;
    }
    return true;
  };



  const handleStartTest = () => {
    if (!handleLoginCheck()) return;
    navigate(`/all-tests/${test._id}`);
  };

  const handleViewDetails = () => {
    navigate(`/all-tests/${test._id}`);
  };

  return (
    <div
      className={`
                group relative flex flex-col rounded-[24px] overflow-hidden cursor-pointer
                bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] 
                hover:shadow-xl hover:${glowColor}
                transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.01]
            `}
    >
      {(isFree || isGrand) && (
        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full z-20 shadow-md uppercase tracking-widest">
          {isGrand ? "Grand Series" : "Free"}
        </span>
      )}

      {/* ── HEADER ── */}
      <div className="relative w-full h-32 md:h-36 overflow-hidden">
        <img
          src={imageSource}
          alt={test.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      <Link
        to={`/all-tests/${test._id}`}
        className="p-4 flex flex-col flex-grow"
      >
        <div className="mb-2">
          {test.category?.name && (
            <p className="text-[9px] font-black text-slate-400 mb-1 tracking-[0.2em]">
              {test.category.name.toUpperCase()}
            </p>
          )}
          <h3 className="text-[14px] font-black text-slate-900 leading-tight line-clamp-2 transition-colors group-hover:text-indigo-600 uppercase tracking-tighter">
            {test.title}
          </h3>
        </div>

        <p className="text-slate-500 text-[11px] mb-3 line-clamp-2 flex-grow font-medium leading-relaxed">
          {test.description}
        </p>

        <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-3 mb-4">
          <StatItem
            icon={Clock}
            value={`${test.durationMinutes}`}
            label="Min"
            accentLight={accentLight}
          />
          <StatItem
            icon={BookOpen}
            value={`${test.totalQuestions}`}
            label="Qs"
            accentLight={accentLight}
          />
          <StatItem
            icon={Users}
            value={students.toLocaleString().replace(/,/g, " ")}
            label="Enrolled"
            accentLight={accentLight}
          />
        </div>

        <p
          className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${accentColor} uppercase`}
        >
          {isFree ? "FREE" : `₹${test.price}`}
        </p>
      </Link>

      <div className="p-4 pt-0">
        {isFree ? (
          <button
            onClick={handleStartTest}
            className="flex items-center justify-center gap-2 w-full text-white py-2.5 rounded-xl font-black transition bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 uppercase tracking-widest text-[9px]"
          >
            <Play size={16} /> Start Now
          </button>
        ) : (
          <button
            onClick={handleViewDetails}
            className={`flex items-center justify-center gap-2 w-full text-white py-2.5 rounded-xl font-black transition bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 uppercase tracking-widest text-[9px]`}
          >
            <Wallet size={16} /> Buy Now
          </button>
        )}
      </div>
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
      className={`py-20 md:py-24 ${
        isAltBg ? "bg-slate-200/40" : "bg-[#f8fafc]"
      } text-slate-800 relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://api.netlify.com/builds/grid.svg')]"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6">
          <h2 className={`text-center text-2xl md:text-3xl font-black uppercase tracking-tighter ${
            title.toLowerCase().includes("grand") 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 drop-shadow-sm px-4 py-1" 
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {!loading &&
            displayedTests.map((test) => (
              <div key={test._id} className="flex">
                <div className="w-full flex-grow">
                  <Component test={test} />
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
