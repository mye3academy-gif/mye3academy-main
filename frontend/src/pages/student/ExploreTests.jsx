import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicMockTests, resetPublicFilters, setPublicCategoryFilter } from '../../redux/studentSlice';
import { fetchCategories } from '../../redux/categorySlice';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';
import MockTestCard from '../../components/MockTestCard';
import { ChevronRight, Search, BookOpen, Layers } from 'lucide-react';

const STAGES = { SUBCATEGORY: 'sub', TESTS: 'tests' };

// Normalize subcategory name for reliable grouping/matching
const normalizeSub = (s) => (s || "General").toString().toLowerCase().replace(/\s+/g, '').replace(/,/g, '');

export default function ExploreTests() {
  const dispatch = useDispatch();

  const { publicMocktests, publicStatus } = useSelector((s) => s.students);
  const { items: categories, loading: catLoading } = useSelector((s) => s.category);
  const { userData } = useSelector((s) => s.user);

  const [selectedCatId,  setSelectedCatId]  = useState(null);
  const [selectedSub,    setSelectedSub]    = useState(null);
  const [stage,          setStage]          = useState(STAGES.SUBCATEGORY);
  const [search,         setSearch]         = useState('');

  // ── load categories & all tests once ──────────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(resetPublicFilters());
    dispatch(fetchPublicMockTests(''));
  }, [dispatch]);

  // ── auto-select first category ────────────────────────────────
  useEffect(() => {
    if (categories.length && !selectedCatId) {
      setSelectedCatId(categories[0]._id);
    }
  }, [categories]);

  // ── subscribed category IDs ───────────────────────────────────
  const subscribedCatIds = useMemo(() => {
    if (!userData?.activeSubscriptions) return new Set();
    const now = new Date();
    const ids = new Set();
    userData.activeSubscriptions
      .filter(s => new Date(s.expiresAt) > now)
      .forEach(s => {
        const cats = s.planId?.categories || s.categories || [];
        cats.forEach(c => ids.add(String(c._id || c)));
      });
    return ids;
  }, [userData]);

  // ── tests for selected category ───────────────────────────────
  const testsInCategory = useMemo(() => {
    if (!publicMocktests || !selectedCatId) return [];
    return publicMocktests.filter(t =>
      String(t.category?._id || t.category) === String(selectedCatId)
    );
  }, [publicMocktests, selectedCatId]);

  // ── group by subcategory ──────────────────────────────────────
  const subcategoryGroups = useMemo(() => {
    const map = {};
    testsInCategory.forEach(t => {
      const key = (t.subcategory || 'General').trim();
      const normKey = normalizeSub(key);
      if (!map[normKey]) map[normKey] = { name: key, tests: [] };
      map[normKey].tests.push(t);
    });
    return Object.values(map).map(group => ({ name: group.name, tests: group.tests, count: group.tests.length }));
  }, [testsInCategory]);

  // ── tests in selected subcategory ────────────────────────────
  const testsInSub = useMemo(() => {
    if (!selectedSub) return [];
    const normalizedSelected = normalizeSub(selectedSub);
    return testsInCategory.filter(t => normalizeSub(t.subcategory) === normalizedSelected);
  }, [testsInCategory, selectedSub]);

  const filteredTests = useMemo(() => {
    if (!search.trim()) return testsInSub;
    return testsInSub.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));
  }, [testsInSub, search]);

  const selectedCat = categories.find(c => c._id === selectedCatId);
  const isSubscribed = subscribedCatIds.has(String(selectedCatId));

  const handleCatClick = (catId) => {
    setSelectedCatId(catId);
    setSelectedSub(null);
    setStage(STAGES.SUBCATEGORY);
    setSearch('');
  };

  const handleSubClick = (subName) => {
    setSelectedSub(subName);
    setStage(STAGES.TESTS);
    setSearch('');
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Explore All Exams
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Select a category, then pick a sub-exam to start practicing
            </p>
          </div>
          {/* Breadcrumb */}
          {stage === STAGES.TESTS && (
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400">
              <button
                onClick={() => { setStage(STAGES.SUBCATEGORY); setSelectedSub(null); setSearch(''); }}
                className="text-blue-600 hover:underline"
              >
                {selectedCat?.name}
              </button>
              <ChevronRight size={14} />
              <span className="text-slate-700">{selectedSub}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">

        {/* ── LEFT: Category List ─── */}
        <div className="w-64 shrink-0 border-r border-slate-100 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</p>
          </div>
          {catLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <nav className="py-2">
              {categories.map((cat) => {
                const isActive  = cat._id === selectedCatId;
                const isSub     = subscribedCatIds.has(String(cat._id));
                const testCount = publicMocktests?.filter(t =>
                  String(t.category?._id || t.category) === String(cat._id)
                ).length || 0;

                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCatClick(cat._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group relative
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                    )}
                    {/* Category image/icon */}
                    <div className="w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {cat.image ? (
                        <img
                          src={getImageUrl(cat.image)}
                          alt={cat.name}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[13px] font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                          {cat.name}
                        </span>
                        {isSub && (
                          <span className="shrink-0 text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Pass
                          </span>
                        )}
                      </div>
                      {testCount > 0 && (
                        <p className="text-[10px] text-slate-400 font-bold">{testCount} Tests</p>
                      )}
                    </div>
                    <ChevronRight size={14} className={`shrink-0 transition-transform ${isActive ? 'text-blue-400 translate-x-0.5' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── RIGHT PANEL ─── */}
        <div className="flex-1 overflow-y-auto">

          {/* Right panel header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-800">
                {stage === STAGES.TESTS ? selectedSub : (selectedCat?.name || 'Select a Category')}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {stage === STAGES.TESTS
                  ? `${testsInSub.length} Test${testsInSub.length !== 1 ? 's' : ''} available`
                  : `${subcategoryGroups.length} Sub-exam${subcategoryGroups.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {isSubscribed && (
              <span className="flex items-center gap-1.5 text-xs font-black bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full">
                👑 Subscribed
              </span>
            )}
            {stage === STAGES.TESTS && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tests..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white w-52"
                />
              </div>
            )}
          </div>

          {/* ── STAGE: SUBCATEGORY LIST ── */}
          {stage === STAGES.SUBCATEGORY && (
            <div className="p-6">
              {publicStatus === 'loading' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : subcategoryGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <BookOpen size={48} className="text-slate-200 mb-4" />
                  <h3 className="font-black text-slate-700 text-lg">No Tests Yet</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-xs">
                    No tests have been published in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subcategoryGroups.map((grp) => (
                    <button
                      key={grp.name}
                      onClick={() => handleSubClick(grp.name)}
                      className="flex items-center justify-between gap-3 bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl p-4 text-left transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        {/* Category icon for subcategory */}
                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {selectedCat?.image ? (
                            <img
                              src={getImageUrl(selectedCat.image)}
                              alt={grp.name}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Layers size={18} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm group-hover:text-blue-700 transition-colors leading-tight">
                            {grp.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                            {grp.count} Test{grp.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STAGE: TESTS LIST ── */}
          {stage === STAGES.TESTS && (
            <div className="p-6">
              {/* Back button */}
              <button
                onClick={() => { setStage(STAGES.SUBCATEGORY); setSelectedSub(null); setSearch(''); }}
                className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 mb-5 transition-colors"
              >
                ← Back to {selectedCat?.name}
              </button>

              {filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search size={40} className="text-slate-200 mb-3" />
                  <h3 className="font-black text-slate-700">No Tests Found</h3>
                  {search && (
                    <button onClick={() => setSearch('')} className="mt-3 text-blue-600 font-bold text-sm hover:underline">
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTests.map((test, i) => (
                    <MockTestCard key={test._id} test={test} isEmbedded={true} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}