import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyMockTests } from "../../redux/userSlice";
import MyTestCard from "../../components/student/MyTestCard";
import { Loader, Crown, ShoppingBag } from "lucide-react";

const MyTests = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const { myMockTests, myMockTestsStatus, myMockTestsError } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    // Fetch every time component mounts to ensure fresh data
    dispatch(fetchMyMockTests());
  }, [dispatch]);

  // Separate subscription tests from directly-purchased tests
  const subscriptionTests = (myMockTests || []).filter(t => t._fromSubscription);
  const purchasedTests    = (myMockTests || []).filter(t => !t._fromSubscription);

  let content;

  if (myMockTestsStatus === "loading") {
    content = (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-400 font-medium">Loading your tests...</p>
      </div>
    );
  } else if (myMockTestsStatus === "succeeded") {
    if (!myMockTests || myMockTests.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
            <ShoppingBag size={36} className="text-blue-300" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2">No Tests Yet</h3>
          <p className="text-slate-400 text-sm font-medium max-w-xs mb-6">
            You haven't enrolled in any tests yet. Explore and buy a test or a subscription pass to get started.
          </p>
          <button
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 transition-all active:scale-95"
          >
            Browse Available Tests
          </button>
        </div>
      );
    } else {
      content = (
        <div className="space-y-10">

          {/* ── SUBSCRIPTION TESTS ── */}
          {subscriptionTests.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Crown size={16} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Via Subscription Pass</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {subscriptionTests.length} Tests Unlocked
                  </p>
                </div>
                <div className="flex-1 h-px bg-amber-100 mx-2 hidden md:block" />
                <span className="px-3 py-1 text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 rounded-full uppercase tracking-widest">
                  👑 Pass Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {subscriptionTests.map((test) => {
                  if (!test || typeof test !== "object") return null;
                  return <MyTestCard key={`sub-${test._id}`} test={test} />;
                })}
              </div>
            </section>
          )}

          {/* ── PURCHASED TESTS ── */}
          {purchasedTests.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={16} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Purchased Tests</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {purchasedTests.length} Tests
                  </p>
                </div>
                <div className="flex-1 h-px bg-slate-100 mx-2 hidden md:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {purchasedTests.map((test) => {
                  if (!test || typeof test !== "object") return null;
                  return <MyTestCard key={`pur-${test._id}`} test={test} />;
                })}
              </div>
            </section>
          )}
        </div>
      );
    }
  } else if (myMockTestsStatus === "failed") {
    content = (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-500 font-bold text-sm">Failed to load tests</p>
        <p className="text-slate-400 text-xs mt-1">{myMockTestsError}</p>
        <button
          onClick={() => dispatch(fetchMyMockTests())}
          className="mt-4 px-4 py-2 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Active Tests</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-1">
            {myMockTests?.length || 0} Total &bull; {subscriptionTests.length} via Pass &bull; {purchasedTests.length} Purchased
          </p>
        </div>
        <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block"></div>
        <button
          onClick={() => setActiveTab("explore")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all rounded-none"
        >
          Explore All Test
        </button>
      </div>
      {content}
    </div>
  );
};

export default MyTests;