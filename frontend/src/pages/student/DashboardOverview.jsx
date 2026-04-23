import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { fetchGlobalLeaderboard, fetchPerformanceHistory, fetchPublicMockTests, fetchUpcomingExams } from '../../redux/studentSlice'; 
import { fetchMyMockTests } from '../../redux/userSlice';
import { fetchStudentDoubts } from '../../redux/doubtSlice';
import UpcomingExamsGallery from '../../components/sections/UpcomingExamsGallery';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  Trophy,
  Crown,
  Medal,
  Bell
} from 'lucide-react';

import { StatCard } from '../../components/student/DashboardUIKIt';
import { getImageUrl } from '../../utils/imageHelper';

const DashboardOverview = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userData, myMockTests, myMockTestsStatus } = useSelector((state) => state.user);
  const { 
    attemptsHistory, 
    attemptsHistoryStatus,
    globalLeaderboard,
    globalLeaderboardStatus,
    upcomingExams,
    upcomingStatus,
    notifications
  } = useSelector((state) => state.students);
  const { myDoubts, myStatus } = useSelector((state) => state.doubts);
  
  useEffect(() => {
    dispatch(fetchPublicMockTests());
    dispatch(fetchUpcomingExams());
    dispatch(fetchPerformanceHistory());
    
    if (globalLeaderboardStatus === 'idle') {
      dispatch(fetchGlobalLeaderboard());
    }
    
    // Fetch doubts to show on dashboard
    if (myStatus === 'idle') {
      dispatch(fetchStudentDoubts());
    }
    
    // FETCH MY TESTS FOR NAVIGATION CONSISTENCY
    if (myMockTestsStatus === 'idle') {
      dispatch(fetchMyMockTests());
    }
  }, [dispatch, globalLeaderboardStatus, myMockTestsStatus, myStatus]);

  const myTestsCount = userData?.purchasedTests?.length || 0;
  const myAttempts = attemptsHistory || [];

  const { grandAttempts } = useMemo(() => {
    return myAttempts.reduce((acc, curr) => {
      if (curr.mocktestId?.isGrandTest === true || curr.mocktestId?.title?.toLowerCase().includes("grand")) {
        acc.grandAttempts.push(curr);
      }
      return acc;
    }, { grandAttempts: [] });
  }, [myAttempts]);

  // Doubts count
  const pendingDoubts = useMemo(() => {
    if (!myDoubts) return 0;
    return myDoubts.filter(d => d.status !== 'answered' && d.status !== 'resolved').length;
  }, [myDoubts]);

  const avgScore = useMemo(() => {
    const completed = myAttempts.filter(a => (a.mocktestId?.totalMarks || 0) > 0);
    if (completed.length === 0) return "0.0";
    const totalPct = completed.reduce((acc, a) => {
      const pct = (a.score / a.mocktestId.totalMarks) * 100;
      return acc + pct;
    }, 0);
    return (totalPct / completed.length).toFixed(1);
  }, [myAttempts]);
  
  const jobNotificationsCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(n => n.type === 'job').length;
  }, [notifications]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* 🎟️ ACTIVE PASSES SECTION */}
      {userData?.activeSubscriptions?.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-amber-500" size={20} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Premium Passes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.activeSubscriptions.map((sub, idx) => {
              const planName = typeof sub.planId === 'object' ? sub.planId?.name : null;
              const displayName = planName || "Premium Pass";
              const expiryDate = new Date(sub.expiresAt);
              const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
              if (daysLeft <= 0) return null;

              return (
                <div key={idx} className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 shadow-lg shadow-amber-200/50 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown size={14} className="text-amber-100" />
                      <h4 className="font-black text-base tracking-tight leading-tight">{displayName}</h4>
                    </div>
                    <p className="text-amber-100 text-xs font-bold uppercase tracking-wider bg-black/10 inline-block px-2 py-0.5 rounded">
                      {daysLeft} Days Left
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            icon={<BookOpen />}
            title="Tests Enrolled"
            value={myTestsCount}
            color="blue"
            onClick={() => setActiveTab('my-tests')}
          />
          <StatCard
            icon={<Zap />}
            title="Grand Tests"
            value={grandAttempts.length}
            color="amber"
            subValue="ATTEMPTS"
            onClick={() => setActiveTab('performance')}
          />
          <StatCard
            icon={<CheckCircle />}
            title="Total Attempts"
            value={myAttempts.length}
            color="emerald"
            onClick={() => setActiveTab('performance')}
          />
          <StatCard
            icon={<Target />}
            title="Avg. Score"
            value={avgScore} 
            color="indigo"
            subValue="/ 100"
            onClick={() => setActiveTab('performance')}
          />
          <StatCard
            icon={<MessageSquare />}
            title="My Doubts"
            value={pendingDoubts} 
            color="rose"
            subValue="PENDING"
            onClick={() => setActiveTab('doubts')}
          />
          <StatCard
            icon={<Bell />}
            title="Job Notifications"
            value={jobNotificationsCount} 
            color="indigo"
            subValue="NEW ALERTS"
            onClick={() => setActiveTab('job-notifications')}
          />
        </div>
      </section>

      <style>
        {`
            @keyframes shimmer {
                0% { transform: translateX(-100%); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            .shimmer-effect {
                position: relative;
                overflow: hidden;
            }
            .shimmer-effect::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 3s infinite;
            }
            @keyframes floating {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0px); }
            }
            .floating-card {
                animation: floating 4s ease-in-out infinite;
            }
            @keyframes rotate-halo {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .profile-halo {
                position: absolute;
                top: -8px;
                left: -8px;
                right: -8px;
                bottom: -8px;
                background: conic-gradient(from 0deg, #f59e0b, #fbbf24, #f59e0b);
                border-radius: 100%;
                animation: rotate-halo 4s linear infinite;
                opacity: 0.3;
                filter: blur(4px);
            }
            .profile-frame {
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border: 2px solid #f59e0b;
                border-radius: 100%;
                box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
                z-index: 5;
            }
        `}
      </style>
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        <div className="flex flex-col">
           <div className="bg-white p-6 rounded-none border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.15)] h-full overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 flex items-center justify-center rounded-none shadow-[0_5px_15px_rgba(245,158,11,0.3)]">
                       <Trophy size={24} className="text-white drop-shadow-sm" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-[#3e4954] tracking-tight">Top Rankers</h3>
                       <p className="text-[11px] font-bold text-[#7e7e7e] uppercase tracking-[0.2em] mt-0.5">Performance Elite Board</p>
                    </div>
                 </div>
                 <div className="px-3 py-1 bg-emerald-500 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Live
                 </div>
              </div>

              <div className="relative z-10 space-y-4 sm:space-y-6">
                 {globalLeaderboard && globalLeaderboard.length > 0 ? (
                    globalLeaderboard.slice(0, 4).map((ranker, index) => {
                       const isFirst = index === 0;
                       
                       let rankStyles = {
                          bg: "bg-white", border: "border-slate-100", text: "text-slate-700", 
                          icon: <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm"><span className="text-[10px] font-black">{index + 1}</span></div>
                       };

                       if (index === 0) {
                          rankStyles = {
                             bg: "scale-[1.02] shadow-[0_20px_40px_rgba(245,158,11,0.2)] z-10 floating-card shimmer-effect !bg-gradient-to-br from-amber-50/90 via-amber-100/90 to-amber-200/90",
                             border: "border-amber-400",
                             text: "text-amber-800",
                             icon: <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 flex items-center justify-center border-2 border-amber-200 shadow-md"><Crown className="text-white animate-pulse" size={18} /></div>
                          };
                       } else if (index === 1) {
                          rankStyles = {
                             bg: "bg-gradient-to-br from-orange-50 to-orange-100/50", border: "border-orange-200/50", text: "text-orange-700",
                             icon: <div className="w-8 h-8 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center border-2 border-orange-200 shadow-sm"><Medal className="text-white" size={12} /></div>
                          };
                       } else if (index === 2) {
                          rankStyles = {
                             bg: "bg-gradient-to-br from-slate-50 to-slate-100/50", border: "border-slate-200/50", text: "text-slate-700",
                             icon: <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-500 flex items-center justify-center border-2 border-slate-200 shadow-sm"><Medal className="text-white" size={12} /></div>
                          };
                       }

                       return (
                          <div 
                             key={ranker._id}
                             className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-none border ${rankStyles.border} ${rankStyles.bg} transition-all duration-400 hover:shadow-xl group relative overflow-hidden`}
                          >
                             {isFirst && (
                                <div className="absolute top-0 right-0 z-20 overflow-hidden w-20 sm:w-24 h-20 sm:h-24 pointer-events-none">
                                    <div className="absolute top-3 sm:top-4 -right-10 sm:-right-8 w-28 sm:w-32 bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600 text-amber-950 text-[7px] sm:text-[9px] font-black py-0.5 sm:py-1 transform rotate-45 text-center shadow-md uppercase tracking-widest drop-shadow-md">
                                        TOP 1
                                    </div>
                                </div>
                             )}

                             <div className="flex-shrink-0">
                                {rankStyles.icon}
                             </div>

                             <div className="relative flex-shrink-0 mx-1">
                                {isFirst && (
                                   <>
                                      <div className="profile-halo"></div>
                                      <div className="profile-frame"></div>
                                   </>
                                )}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden bg-white shadow-md relative ${isFirst ? 'border-amber-400' : 'border-white'}`}>
                                   {ranker.avatar ? (
                                      <img src={getImageUrl(ranker.avatar)} alt={ranker.name} className="w-full h-full object-cover" />
                                   ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-bold text-xs uppercase">
                                         {ranker.name?.charAt(0)}
                                      </div>
                                   )}
                                </div>
                             </div>

                             <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                                <h4 className={`text-[12px] sm:text-sm font-black truncate transition-colors duration-300 ${isFirst ? 'text-amber-950' : 'text-[#3e4954] group-hover:text-blue-600'}`}>{ranker.name}</h4>
                                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                                   <span className={`text-[8.5px] sm:text-[10px] font-bold uppercase tracking-tighter ${isFirst ? 'text-amber-700/80' : 'text-slate-400'}`}>{ranker.attemptsCount} Assessments</span>
                                </div>
                             </div>

                              <div className="text-right whitespace-nowrap relative z-20 min-w-[60px] sm:min-w-[80px]">
                                <div className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 ${isFirst ? 'text-amber-700/70' : 'text-slate-400'}`}>Points</div>
                                <div className={`text-sm sm:text-xl font-black tracking-tight leading-none ${isFirst ? 'text-amber-600' : 'text-[#3e4954]'}`}>
                                   {ranker.totalScore}
                                </div>
                              </div>
                          </div>
                       );
                    })
                 ) : (
                    <div className="py-12 bg-slate-50/50 rounded-none border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                       <Trophy className="text-slate-200 mb-2" size={40} />
                       <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">
                          {globalLeaderboardStatus === 'loading' ? 'Calculating rankings...' : 'No ranking data available yet'}
                       </p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="flex flex-col">
           <div className="bg-gradient-to-br from-[#122b5e] to-[#1e4db7] rounded-none p-8 md:p-10 text-white relative overflow-hidden group shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-white/10 h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-400 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32 animate-pulse"></div>
              
              <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 rounded-none border border-white/10 backdrop-blur-md">
                     <ShieldCheck className="text-blue-300" size={14} />
                     <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-blue-100">Unlock Your Potential</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.15]">Challenge Your <br/><span className="text-blue-300">Knowledge</span></h3>
                  <p className="text-blue-100/90 font-medium text-base sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-sm">
                     Start testing your skills today! Browse our expert-curated mock tests.
                  </p>

                  <button 
                     onClick={() => navigate('/all-tests')}
                     className="group/btn inline-flex items-center gap-2 sm:gap-3 bg-white text-[#122b5e] px-6 sm:px-8 py-4 sm:py-5 rounded-none font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-50 transition-all transform active:scale-95 shadow-xl shadow-blue-950/20 whitespace-nowrap"
                  >
                     Go to Mock Tests 
                     <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-none bg-blue-100 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                        <ArrowRight size={12} className="text-[#122b5e]" />
                     </div>
                  </button>
              </div>
           </div>
        </div>
      </section>

      <UpcomingExamsGallery 
        data={upcomingExams} 
        loading={upcomingStatus === "loading"} 
      />
    </div>
  );
};

export default DashboardOverview;