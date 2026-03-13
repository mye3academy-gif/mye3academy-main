// frontend/src/pages/AllMockTests.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { IoSearch, IoFunnel, IoClose, IoApps, IoChevronDown, IoSwapVertical, IoTrophy, IoDocumentText } from "react-icons/io5";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

import { useDebounce } from "../hooks/useDebounce";
import {
  fetchPublicMockTests,
  setPublicCategoryFilter,
  setPublicSearch,
} from "../redux/studentSlice";
import { fetchCategories } from "../redux/categorySlice";
import MockTestCard from "../components/MockTestCard";
import PremiumTestCard from "../components/PremiumTestCard";
import UpcomingExamsGallery from "../components/sections/UpcomingExamsGallery";
import { fetchUpcomingExams } from "../redux/studentSlice";

const getCategoryTheme = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("banking")) return { border: "border-blue-200", text: "text-blue-600", bg: "bg-blue-50", icon: "text-blue-500" };
  if (n.includes("ssc")) return { border: "border-rose-200", text: "text-rose-600", bg: "bg-rose-50", icon: "text-rose-500" };
  if (n.includes("railway") || n.includes("rrb")) return { border: "border-orange-200", text: "text-orange-600", bg: "bg-orange-50", icon: "text-orange-500" };
  if (n.includes("constable") || n.includes("police")) return { border: "border-emerald-200", text: "text-emerald-600", bg: "bg-emerald-50", icon: "text-emerald-500" };
  if (n.includes("teaching") || n.includes("tet")) return { border: "border-purple-200", text: "text-purple-600", bg: "bg-purple-50", icon: "text-purple-500" };
  if (n.includes("defence")) return { border: "border-slate-300", text: "text-slate-700", bg: "bg-slate-100", icon: "text-slate-600" };
  return { border: "border-indigo-200", text: "text-indigo-600", bg: "bg-indigo-50", icon: "text-indigo-500" };
};

const TYPE_THEME = {
  all: { border: "border-indigo-200", text: "text-indigo-600", bg: "bg-indigo-50", primary: "bg-indigo-600", hover: "hover:border-indigo-600", accent: "indigo", sideActive: "border-indigo-600 bg-indigo-50 text-indigo-600", sideIcon: "bg-indigo-100 text-indigo-600", sideDot: "bg-indigo-600" },
  mock: { border: "border-emerald-200", text: "text-emerald-600", bg: "bg-emerald-50", primary: "bg-emerald-600", hover: "hover:border-emerald-600", accent: "emerald", sideActive: "border-emerald-600 bg-emerald-50 text-emerald-600", sideIcon: "bg-emerald-100 text-emerald-600", sideDot: "bg-emerald-600" },
  grand: { border: "border-amber-200", text: "text-amber-600", bg: "bg-amber-50", primary: "bg-amber-500", hover: "hover:border-amber-500", accent: "amber", sideActive: "border-amber-600 bg-amber-50 text-amber-600", sideIcon: "bg-amber-100 text-amber-600", sideDot: "bg-amber-600" }
};

const TypeTabs = ({ activeType, onTypeChange, isEmbedded }) => {
  const tabs = [
    { id: 'all', label: 'All Tests', path: '/all-tests' },
    { id: 'mock', label: 'Mock Tests', path: '/mock-tests' },
    { id: 'grand', label: 'Grand Tests', path: '/grand-tests' },
  ];

  const theme = TYPE_THEME[activeType] || TYPE_THEME.all;

  return (
    <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        isEmbedded ? (
          <button
            key={tab.id}
            onClick={() => onTypeChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeType === tab.id
                ? `${theme.primary} text-white shadow-md`
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ) : (
          <Link
            key={tab.id}
            to={tab.path}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeType === tab.id
                ? `${theme.primary} text-white shadow-md`
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </Link>
        )
      ))}
    </div>
  );
};

export default function AllMockTests({ isEmbedded = false, overrideType = null }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { publicMocktests, publicStatus, filters, upcomingExams, upcomingStatus } = useSelector(
    (state) => state.students
  );
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.q || "");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name-az, name-za
  const [testType, setTestType] = useState(overrideType || searchParams.get("type") || "all"); // all, mock, grand
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const activeTheme = TYPE_THEME[testType] || TYPE_THEME.all;

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const searchFromUrl = searchParams.get("q");
    const typeFromUrl = searchParams.get("type");
    
    if (categoryFromUrl) dispatch(setPublicCategoryFilter(categoryFromUrl));
    if (searchFromUrl) {
      dispatch(setPublicSearch(searchFromUrl));
      setSearchTerm(searchFromUrl);
    }
  }, [dispatch, searchParams, overrideType]);

  useEffect(() => {
    setTestType(overrideType || searchParams.get("type") || "all");
  }, [overrideType, searchParams]);

  useEffect(() => {
    if (debouncedSearchTerm !== filters.q) {
      dispatch(setPublicSearch(debouncedSearchTerm));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUpcomingExams());
  }, [dispatch]);

  const buildQuery = useCallback((filters) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    return params.toString() ? `?${params.toString()}` : "";
  }, []);

  useEffect(() => {
    const qs = buildQuery(filters);
    dispatch(fetchPublicMockTests(qs));
  }, [dispatch, filters, buildQuery]);

  const handleSelectCategory = (slug) => {
    dispatch(setPublicCategoryFilter(slug));
    setIsFilterPanelOpen(false);
  };

  // Memoized filtered tests
  const allTests = useMemo(() => {
    if (!publicMocktests) return [];
    let tests = [...publicMocktests];
    
    // Filter by type (Mock vs Grand)
    if (testType === "mock") tests = tests.filter((t) => !t.isGrandTest);
    if (testType === "grand") tests = tests.filter((t) => t.isGrandTest === true);
    
    // Sort
    if (sortBy === "newest") tests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") tests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "name-az") tests.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "name-za") tests.sort((a, b) => b.title.localeCompare(a.title));
    
    return tests;
  }, [publicMocktests, sortBy, testType]);

  const selectedCategoryName = useMemo(() => {
    if (!filters.category) return null;
    return categories.find((c) => c.slug === filters.category)?.name || filters.category;
  }, [filters.category, categories]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 18;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.q, filters.category, testType]);

  const currentTests = useMemo(() => {
    const start = (currentPage - 1) * testsPerPage;
    return allTests.slice(start, start + testsPerPage);
  }, [allTests, currentPage]);

  const totalPages = Math.ceil(allTests.length / testsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${
      isEmbedded ? "bg-transparent" :
      testType === "mock" ? "bg-[#f0fff4] pt-20 pb-16" :
      testType === "grand" ? "bg-[#fffbeb] pt-20 pb-16" :
      "bg-[#f4f7fa] pt-20 pb-16"
    }`}>
      <div className={isEmbedded ? "w-full" : "max-w-[1440px] mx-auto px-6 md:px-12"}>

        {/* ── TYPE HERO BANNER ── */}
        {testType === "mock" && (
          <div className="mt-2 mb-6 border-l-4 border-[#21b731] bg-white shadow-sm px-5 py-4 hidden md:flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-11 h-11 bg-[#21b731]/10 flex items-center justify-center text-[#21b731] flex-shrink-0">
                <IoDocumentText size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#3e4954] tracking-tight">Mock Tests</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {allTests.length} Mock Tests Available
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TypeTabs activeType="mock" onTypeChange={setTestType} isEmbedded={isEmbedded} />
              
              <div className="relative w-full md:w-80 group">
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-[#21b731] transition-all duration-300 overflow-hidden p-1">
                  <div className="pl-3 pr-2 py-2 text-slate-400">
                    <IoSearch size={18} />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Test Series"
                    className="w-full px-1 py-1.5 outline-none text-[13px] text-slate-700 placeholder:text-slate-400 bg-transparent"
                  />
                  <button className="bg-[#21b731] hover:bg-[#1a9227] text-white px-5 py-2 rounded-md text-[11px] font-bold shadow-sm transition-all ml-1 tracking-wider">
                    SEARCH
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-auto">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg hover:border-[#21b731] transition-all cursor-pointer p-0.5">
                  <div className="pl-3 text-slate-400">
                    <IoSwapVertical size={16} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent pl-2 pr-10 py-2.5 outline-none text-xs font-bold text-slate-700 cursor-pointer min-w-[140px]"
                  >
                    <option value="newest">NEWEST FIRST</option>
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="name-az">NAME (A-Z)</option>
                    <option value="name-za">NAME (Z-A)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <IoChevronDown size={14} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {testType === "grand" && (
          <div className="mt-2 mb-6 border-l-4 border-amber-500 bg-white shadow-sm px-5 py-4 hidden md:flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-11 h-11 bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                <IoTrophy size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#3e4954] tracking-tight">Grand Tests</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {allTests.length} Grand Tests Available
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TypeTabs activeType="grand" onTypeChange={setTestType} isEmbedded={isEmbedded} />

              <div className="relative w-full md:w-80 group">
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-amber-500 transition-all duration-300 overflow-hidden p-1">
                  <div className="pl-3 pr-2 py-2 text-slate-400">
                    <IoSearch size={18} />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Test Series"
                    className="w-full px-1 py-1.5 outline-none text-[13px] text-slate-700 placeholder:text-slate-400 bg-transparent"
                  />
                  <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-md text-[11px] font-bold shadow-sm transition-all ml-1 tracking-wider">
                    SEARCH
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-auto">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg hover:border-amber-500 transition-all cursor-pointer p-0.5">
                  <div className="pl-3 text-slate-400">
                    <IoSwapVertical size={16} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent pl-2 pr-10 py-2.5 outline-none text-xs font-bold text-slate-700 cursor-pointer min-w-[140px]"
                  >
                    <option value="newest">NEWEST FIRST</option>
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="name-az">NAME (A-Z)</option>
                    <option value="name-za">NAME (Z-A)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <IoChevronDown size={14} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {!["mock", "grand"].includes(testType) && (
          <div className="mt-2 mb-6 border-l-4 border-indigo-600 bg-white shadow-sm px-5 py-4 hidden md:flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-11 h-11 bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <IoDocumentText size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#3e4954] tracking-tight">All Tests</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {allTests.length} Total Tests Available
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TypeTabs activeType="all" onTypeChange={setTestType} isEmbedded={isEmbedded} />

              <div className="relative w-full md:w-80 group">
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-indigo-600 transition-all duration-300 overflow-hidden p-1">
                  <div className="pl-3 pr-2 py-2 text-slate-400">
                    <IoSearch size={18} />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Test Series"
                    className="w-full px-1 py-1.5 outline-none text-[13px] text-slate-700 placeholder:text-slate-400 bg-transparent"
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-[11px] font-bold shadow-sm transition-all ml-1 tracking-wider">
                    SEARCH
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-auto">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-600 transition-all cursor-pointer p-0.5">
                  <div className="pl-3 text-slate-400">
                    <IoSwapVertical size={16} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent pl-2 pr-10 py-2.5 outline-none text-xs font-bold text-slate-700 cursor-pointer min-w-[140px]"
                  >
                    <option value="newest">NEWEST FIRST</option>
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="name-az">NAME (A-Z)</option>
                    <option value="name-za">NAME (Z-A)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <IoChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE SIMPLIFIED HEADER */}
        <div className="md:hidden flex flex-col gap-4 mb-6 mt-2">
            <TypeTabs activeType={testType} onTypeChange={setTestType} isEmbedded={isEmbedded} />
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 shadow-sm flex items-center justify-between uppercase tracking-tighter"
                >
                  <span className="truncate">{selectedCategoryName || "Category"}</span>
                  <IoChevronDown className="shrink-0" size={14} />
                </button>
                <div className="flex-[1.5] relative">
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:border-indigo-600 shadow-sm uppercase tracking-tighter"
                    />
                    <IoSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>
            </div>
        </div>

        {/* MAIN LAYOUT WRAPPER */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR CATEGORIES */}
          <div className="hidden lg:flex w-56 shrink-0 flex-col relative lg:sticky lg:top-24 mb-8 lg:mb-0 max-h-[calc(100vh-8rem)] bg-white border border-slate-100 shadow-sm">

            {/* Sticky header — OUTSIDE scroll area */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                Categories
              </span>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
            {categoriesLoading ? (
              <div className="flex flex-col gap-0 p-2">
                {[1,2,3,4,5,6,7].map((i) => (
                  <div key={i} className="h-10 bg-slate-50 animate-pulse mb-1" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col">

                {/* ALL button */}
                <button
                  onClick={() => handleSelectCategory("")}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-150 border-l-2 ${
                    !filters.category
                      ? activeTheme.sideActive
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 transition-colors ${
                    !filters.category ? activeTheme.sideIcon : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}>
                    <IoApps size={14} />
                  </div>
                  <span className={`text-[11px] font-black tracking-wide truncate ${
                    !filters.category ? "text-[#21b731]" : "text-slate-600 group-hover:text-slate-800"
                  }`}>
                    All
                  </span>
                  {!filters.category && (
                    <div className="ml-auto w-1.5 h-1.5 bg-[#21b731] flex-shrink-0" />
                  )}
                </button>

                {/* Divider */}
                <div className="mx-3 my-1 border-t border-slate-50" />

                {/* Category buttons */}
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((cat) => {
                    const isActive = filters.category === cat.slug;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleSelectCategory(cat.slug)}
                         className={`group flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-150 border-l-2 ${
                          isActive
                            ? activeTheme.sideActive
                            : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                        }`}
                      >
                        {/* Category thumbnail */}
                        <div className={`w-7 h-7 flex-shrink-0 overflow-hidden border transition-all ${
                          isActive ? "border-[#21b731]/30" : "border-slate-100 group-hover:border-slate-200"
                        }`}>
                          {cat.image ? (
                            <img
                              src={getImageUrl(cat.image)}
                              alt={cat.name}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[9px] font-black text-slate-400 uppercase">
                              {cat.name?.charAt(0)}
                            </div>
                          )}
                        </div>

                        <span className={`text-[11px] font-black tracking-wide truncate transition-colors ${
                          isActive ? "text-[#21b731]" : "text-slate-600 group-hover:text-slate-800"
                        }`}>
                          {cat.name}
                        </span>

                        {isActive && (
                          <div className={`ml-auto w-1.5 h-1.5 ${activeTheme.sideDot} flex-shrink-0`} />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
            </div>
          </div>

          {/* RIGHT GRID CONTENT */}
          <div className="flex-1 min-w-0 w-full">
            {publicStatus === "loading" ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-[320px] bg-white border border-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

            {/* Count label - HIDDEN ON MOBILE */}
            <div className="mb-4 hidden md:flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {allTests.length} Tests
              </span>
            </div>

            {/* Unified grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentTests.length > 0 ? (
                currentTests.map((test, index) => (
                  test.isGrandTest ? (
                    <PremiumTestCard key={test._id} test={test} index={index} />
                  ) : (
                    <MockTestCard key={test._id} test={test} index={index} isEmbedded={isEmbedded} />
                  )
                ))
              ) : (
                <div className="col-span-full py-16 bg-white border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                    <IoSearch size={24} />
                  </div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">No Tests Found</h3>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      dispatch(setPublicSearch(""));
                       dispatch(setPublicCategoryFilter(""));
                    }}
                    className={`mt-4 ${activeTheme.text} font-black uppercase tracking-widest text-[10px] hover:underline`}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1 mx-2 flex-wrap justify-center">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 text-[11px] font-black flex items-center justify-center transition-all border ${
                        currentPage === i + 1
                          ? `${activeTheme.primary} border-transparent text-white shadow-md`
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterPanelOpen(false)} />
          <div className="relative w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Categories</h2>
              <button onClick={() => setIsFilterPanelOpen(false)} className="p-1.5 bg-slate-100 rounded-full">
                <IoClose size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* All */}
              <button
                onClick={() => handleSelectCategory("")}
                className={`flex flex-col items-center justify-end h-24 rounded-xl border-2 overflow-hidden transition-all
                  ${!filters.category ? "border-blue-600" : "border-slate-200"}`}
              >
                <div className="flex-1 w-full flex items-center justify-center bg-blue-50">
                  <IoApps size={28} className="text-blue-400" />
                </div>
                <div className={`w-full py-1.5 text-center text-xs font-bold uppercase ${!filters.category ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>
                  All
                </div>
              </button>
              {categories.map((cat) => {
                const isSelected = filters.category === cat.slug;
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`flex flex-col items-center justify-end h-24 rounded-xl border-2 overflow-hidden transition-all
                      ${isSelected ? "border-blue-600" : "border-slate-200"}`}
                  >
                    <div className="flex-1 w-full relative bg-slate-100">
                      {cat.image
                        ? <img src={getImageUrl(cat.image)} alt={cat.name} onError={handleImageError} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl font-black text-slate-300">{cat.name?.charAt(0)}</span></div>
                      }
                    </div>
                    <div className={`w-full py-1.5 text-center text-xs font-bold uppercase ${isSelected ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>
                      {cat.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── UPCOMING EXAMS SECTION ── */}
      <div className="mt-12">
        <UpcomingExamsGallery 
          data={upcomingExams} 
          loading={upcomingStatus === "loading"} 
        />
      </div>
    </div>
  );
}
