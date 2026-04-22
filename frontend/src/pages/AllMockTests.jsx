import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight, Search, ArrowLeft, Loader2 } from "lucide-react";
import { fetchPublicMockTests, resetPublicFilters, fetchPublicSubscriptions } from "../redux/studentSlice";
import { fetchMyProfile } from "../redux/userSlice";
import SubscriptionPassBanner from "../components/student/SubscriptionPassBanner";
import { fetchCategories } from "../redux/categorySlice";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import MockTestCard from "../components/MockTestCard";

const STAGES = { SUBCATEGORY: "sub", TESTS: "tests" };

// Normalize subcategory name for reliable grouping/matching
const normalizeSub = (s) => (s || "General").toString().toLowerCase().replace(/\s+/g, '').replace(/,/g, '');

export default function AllMockTests({ overrideType }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { publicMocktests, publicStatus, publicSubscriptions } = useSelector((s) => s.students);
  const { items: categories, loading: catLoading } = useSelector((s) => s.category);
  const { userData } = useSelector((s) => s.user);

  // Derive state from URL params
  const selectedCatId = searchParams.get("category");
  const selectedSub   = searchParams.get("sub");
  const stage         = selectedSub ? STAGES.TESTS : STAGES.SUBCATEGORY;

  const [search,        setSearch]        = useState("");
  const [isSyncing,     setIsSyncing]     = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(resetPublicFilters());
    dispatch(fetchPublicMockTests(""));
    dispatch(fetchPublicSubscriptions());

    // Sync profile on load to handle recent purchases
    if (userData) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch]);

  // Auto-select first category if none in URL
  useEffect(() => {
    if (categories.length && !selectedCatId) {
      setSearchParams({ category: categories[0]._id }, { replace: true });
    }
  }, [categories, selectedCatId, setSearchParams]);

  // Subscribed category IDs
  const subscribedCatIds = useMemo(() => {
    if (!userData?.activeSubscriptions) return new Set();
    const now = new Date();
    const ids = new Set();
    userData.activeSubscriptions
      .filter((s) => new Date(s.expiresAt) > now)
      .forEach((s) => {
        const cats = s.planId?.categories || s.categories || [];
        cats.forEach((c) => ids.add(String(c._id || c)));
      });
    return ids;
  }, [userData]);

  // Tests for selected category (optionally filtered by type)
  const testsInCategory = useMemo(() => {
    if (!publicMocktests || !selectedCatId) return [];
    return publicMocktests.filter((t) => {
      const catMatch = String(t.category?._id || t.category) === String(selectedCatId);
      if (overrideType === "mock") return catMatch && !t.isGrandTest;
      if (overrideType === "grand") return catMatch && t.isGrandTest;
      return catMatch;
    });
  }, [publicMocktests, selectedCatId, overrideType]);

  // Group by subcategory
  const subcategoryGroups = useMemo(() => {
    const map = {};
    testsInCategory.forEach((t) => {
      const key = (t.subcategory || "General").trim(); // Keep original-ish for display name
      const normKey = normalizeSub(key);
      if (!map[normKey]) map[normKey] = { name: key, tests: [] };
      map[normKey].tests.push(t);
    });
    return Object.values(map).map((group) => ({ name: group.name, count: group.tests.length, tests: group.tests }));
  }, [testsInCategory]);

  // Tests in selected subcategory (+ search filter)
  const testsInSub = useMemo(() => {
    if (!selectedSub) return [];
    const normalizedSelected = normalizeSub(selectedSub);
    const base = testsInCategory.filter((t) => normalizeSub(t.subcategory) === normalizedSelected);
    if (!search.trim()) return base;
    return base.filter((t) => t.title?.toLowerCase().includes(search.toLowerCase()));
  }, [testsInCategory, selectedSub, search]);

  const selectedCat  = categories.find((c) => c._id === selectedCatId);

  // Find a subscription plan that covers this category
  const activePlanForCategory = useMemo(() => {
    if (!publicSubscriptions || !selectedCatId) return null;
    return publicSubscriptions.find(plan => 
      plan.categories?.some(cat => String(cat._id || cat) === String(selectedCatId))
    );
  }, [publicSubscriptions, selectedCatId]);

  const isSubscribed = subscribedCatIds.has(String(selectedCatId));

  // Total test count across all categories
  const totalTests = publicMocktests?.length || 0;

  const handleCatClick = (catId) => {
    setSearchParams({ category: catId });
    setSearch("");
  };

  const handleSubClick = (subName) => {
    setSearchParams({ category: selectedCatId || "", sub: subName });
    setSearch("");
  };

  const handleBackToSub = () => {
    setSearchParams({ category: selectedCatId || "" });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* ─── Page heading ─── */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
            {totalTests}+ Explore all Exams
          </h1>
          <p className="text-slate-400 text-[11px] md:text-sm mt-1 font-medium leading-relaxed">
            Get exam-ready with concepts, questions and study notes as per the latest pattern
          </p>
        </div>

        {/* ─── Main panel ─── */}
        <div className="flex flex-row border border-slate-200 rounded-xl overflow-hidden min-h-[520px] shadow-sm bg-white">

          {/* LEFT: Category selector sidebar */}
          <div className="w-[85px] md:w-64 shrink-0 border-r border-slate-200 bg-white">
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar py-1 md:py-0">
            {catLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <nav>
                {categories.map((cat) => {
                  const isActive = cat._id === selectedCatId;
                  const count = publicMocktests?.filter(
                    (t) => String(t.category?._id || t.category) === String(cat._id)
                  ).length || 0;

                  return (
                    <button
                      key={cat._id}
                      onClick={() => handleCatClick(cat._id)}
                      className={`w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-1 md:px-4 py-4 md:py-3.5 text-center md:text-left transition-all group
                        ${isActive ? "bg-emerald-50 border-r-4 md:border-r-0 md:border-l-4 border-emerald-500" : "hover:bg-slate-50 border-r-4 md:border-r-0 md:border-l-4 border-transparent"}`}
                    >
                      {/* icon */}
                      <div className={`w-8 h-8 md:w-8 md:h-8 shrink-0 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-active:scale-95
                        ${isActive ? "bg-emerald-100" : "bg-slate-100"}`}>
                        {cat.image ? (
                          <img
                            src={getImageUrl(cat.image)}
                            alt={cat.name}
                            onError={handleImageError}
                            className="w-5 h-5 md:w-6 md:h-6 object-contain"
                          />
                        ) : (
                          <span className="text-[10px] md:text-sm font-black text-slate-400">
                            {cat.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 w-full overflow-hidden">
                        <p className={`text-[9px] md:text-[13px] font-bold leading-tight break-words md:truncate
                          ${isActive ? "text-emerald-700" : "text-slate-700 group-hover:text-slate-900"}`}>
                          {cat.name}
                        </p>
                        {count > 0 && (
                          <p className="hidden md:block text-[10px] text-slate-400 font-medium">{count} tests</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* RIGHT: Content */}
        <div className="flex-1 overflow-y-auto bg-white">

            {/* ── SUBSCRIPTION BANNER ── */}
            {stage === STAGES.SUBCATEGORY && activePlanForCategory && (
               <div className="px-6 pt-6">
                 <SubscriptionPassBanner 
                    pass={activePlanForCategory} 
                    categoryName={selectedCat?.name} 
                    isSubscribed={isSubscribed}
                    selectedCatId={selectedCatId}
                 />
               </div>
            )}

            {/* ── SUBCATEGORY GRID ── */}
            {stage === STAGES.SUBCATEGORY && (
              <div className="p-6">
                {/* {isSubscribed && (
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 w-fit">
                    👑 You have a subscription pass for this category
                  </div>
                )} */}

                {publicStatus === "loading" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : subcategoryGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <img
                      src={selectedCat?.image ? getImageUrl(selectedCat.image) : ""}
                      alt=""
                      className="w-16 h-16 object-contain opacity-20 mb-4"
                      onError={(e) => e.target.style.display = "none"}
                    />
                    <h3 className="font-black text-slate-500 text-base">No Tests Available</h3>
                    <p className="text-slate-400 text-sm mt-1">No tests published in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subcategoryGroups.map((grp) => (
                      <button
                        key={grp.name}
                        onClick={() => handleSubClick(grp.name)}
                        className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl bg-white hover:border-emerald-400 hover:shadow-md transition-all group text-left"
                      >
                        {/* Subcategory icon = category image */}
                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {selectedCat?.image ? (
                            <img
                              src={getImageUrl(selectedCat.image)}
                              alt={grp.name}
                              onError={handleImageError}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-black text-slate-300">
                              {grp.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                            {grp.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">{grp.count} Tests</p>
                        </div>
                        <ChevronRight size={16} className="shrink-0 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TESTS LIST ── */}
            {stage === STAGES.TESTS && (
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToSub}
                      className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <ArrowLeft size={16} /> {selectedCat?.name}
                    </button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-sm font-black text-slate-800">{selectedSub}</span>
                    <span className="text-xs text-slate-400 font-bold">({testsInSub.length} Tests)</span>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tests..."
                      className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-400 bg-white w-56"
                    />
                  </div>
                </div>

                {testsInSub.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-60 text-center">
                    <Search size={40} className="text-slate-200 mb-3" />
                    <h3 className="font-black text-slate-600">No Tests Found</h3>
                    {search && (
                      <button onClick={() => setSearch("")} className="mt-3 text-emerald-600 font-bold text-sm hover:underline">
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-2 md:px-0">
                    {testsInSub.map((test, i) => (
                      <div key={test._id} className="w-full">
                        <MockTestCard test={test} isEmbedded={false} index={i} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
