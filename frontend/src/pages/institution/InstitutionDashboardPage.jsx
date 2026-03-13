import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  FaUserGraduate, 
  FaClipboardList, 
  FaQuestionCircle, 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaCrown, 
  FaAward, 
  FaFire 
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import StatCard from "../../components/admin/StatCard";
import { fetchInstitutionStats, fetchInstitutionStudents } from "../../redux/institutionDashboardSlice";
import { getImageUrl } from "../../utils/imageHelper";
import { motion, AnimatePresence } from "framer-motion";

const InstitutionDashboardPage = () => {
  const dispatch = useDispatch();

  const { stats, students, loading, error } = useSelector(
    (state) => state.institutionDashboard || {}
  );

  useEffect(() => {
    dispatch(fetchInstitutionStats());
    dispatch(fetchInstitutionStudents());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <ClipLoader size={60} color={"#4f46e5"} />
        <p className="ml-4 text-indigo-600 font-medium">
          Loading institution dashboard...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-red-500 text-center p-6 bg-red-50 border rounded-xl m-10">
        Dashboard Error: {error || "Failed to load statistics"}
      </div>
    );
  }

  const topStudents = students ? [...students].sort((a, b) => (b.attemptCount || 0) - (a.attemptCount || 0)) : [];
  const top3 = topStudents.slice(0, 3);
  const theRest = topStudents.slice(3, 8);

  return (
    <div className="flex flex-col gap-4 w-full pb-8">
      <div className="flex items-center justify-between shrink-0">
        <div>
            <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight uppercase leading-none">
            Campus Overview
            </h1>
            <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1 opacity-70">
            Real-time Monitoring
            </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 font-black text-[7px] uppercase tracking-widest shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
        <StatCard
            title="Students"
            value={stats.students || 0}
            icon={<FaUserGraduate />}
            bgColor="bg-indigo-600"
            progress={65}
            compact
        />

        <StatCard
            title="Attempts"
            value={stats.attempts || 0}
            icon={<FaClipboardList />}
            bgColor="bg-amber-500"
            progress={42}
            compact
        />

        <StatCard
            title="Doubts"
            value={stats.doubts || 0}
            icon={<FaQuestionCircle />}
            bgColor="bg-purple-600"
            progress={28}
            compact
        />
      </div>

      <style>
        {`
            @keyframes rotate-halo {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .rank-halo {
                position: absolute;
                inset: -6px;
                background: conic-gradient(from 0deg, #f59e0b, #fbbf24, #f59e0b);
                border-radius: 100%;
                animation: rotate-halo 4s linear infinite;
                opacity: 0.4;
                filter: blur(8px);
            }
            .rank-frame {
                position: absolute;
                inset: -3px;
                border: 2px solid #f59e0b;
                border-radius: 100%;
                box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
                z-index: 5;
            }
            @keyframes floating {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .floating { animation: floating 3s ease-in-out infinite; }
            
            .glass-row {
               background: rgba(255, 255, 255, 0.7);
               backdrop-filter: blur(10px);
               border: 1px solid rgba(255, 255, 255, 0.5);
            }
        `}
      </style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow min-h-0 overflow-hidden">
        {/* GRAND RANK CARD - Strictly Optimized Fit */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-5 flex flex-col border border-slate-100 shadow-sm relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50 shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-amber-100">
                    <FaTrophy size={14} />
                </div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Hall of Fame</h3>
             </div>
             <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full">Top Scorers</span>
          </div>

          <div className="relative z-10 flex flex-col gap-4 flex-grow min-h-0">
            {top3.length > 0 && (
               <div className="grid grid-cols-3 gap-3 shrink-0">
                  {top3.map((student, idx) => {
                     const isFirst = idx === 0;
                     return (
                        <div key={student._id} className={`relative flex flex-col items-center p-3.5 rounded-[24px] border transition-all ${isFirst?'bg-amber-50/50 border-amber-200 shadow-sm':'bg-slate-50/50 border-slate-100'}`}>
                           <div className="relative mb-2">
                              {isFirst && <FaCrown className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 w-4 h-4 floating" />}
                              <div className={`w-12 h-12 rounded-full border-2 shadow-sm overflow-hidden bg-white relative ${isFirst?'border-amber-400':'border-slate-300'}`}>
                                 {student.avatar ? (
                                    <img src={getImageUrl(student.avatar)} alt={student.firstname} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">{student.firstname?.charAt(0)}</div>
                                 )}
                              </div>
                           </div>
                           <h4 className="text-[10px] font-black uppercase text-slate-700 text-center truncate w-full">{student.firstname}</h4>
                           <div className={`mt-2 px-3 py-1 rounded-full font-black text-[9px] ${isFirst?'bg-amber-500 text-white':'bg-white text-slate-600 border border-slate-100'}`}>
                                {student.attemptCount || 0} PTS
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}

            <div className="overflow-y-auto pr-2 space-y-2 flex-grow custom-scrollbar">
               {theRest.length > 0 ? (
                  theRest.map((student, idx) => (
                    <div key={student._id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-50 hover:border-indigo-50 hover:shadow-sm transition-all group">
                        <span className="text-[8px] font-black text-slate-300 w-4">#{idx+4}</span>
                        <div className="w-8 h-8 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                            {student.avatar ? <img src={getImageUrl(student.avatar)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-slate-300">{student.firstname?.charAt(0)}</div>}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-[10px] font-black text-slate-700 truncate uppercase">{student.firstname}</p>
                            <p className="text-[7px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-wider">{student.email}</p>
                        </div>
                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">{student.attemptCount || 0}</span>
                    </div>
                  ))
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-4">
                        <FaAward size={32} />
                        <p className="text-[7px] font-black uppercase tracking-widest mt-2">No More Data</p>
                   </div>
               )}
            </div>
          </div>
        </div>

        {/* COMPACT ACTIONS */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          <div className="flex-1 p-6 bg-indigo-600 rounded-[32px] relative overflow-hidden flex flex-col justify-between group">
             <div className="relative z-10">
                <h2 className="text-xl font-black text-white uppercase italic leading-none">Empower</h2>
                <p className="text-indigo-100 text-[9px] font-medium opacity-80 mt-2 leading-relaxed uppercase">
                  Analyze Growth
                </p>
             </div>
             <button className="relative z-10 w-full bg-white text-indigo-600 px-4 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
               All Stats
             </button>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>

          <div className="p-4 bg-slate-900 rounded-[24px] border border-slate-800 flex items-center justify-between group relative overflow-hidden shrink-0">
             <div className="relative z-10">
                <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Help</p>
                <h4 className="text-[10px] font-black text-white uppercase opacity-90 leading-none">Support</h4>
             </div>
             <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 transition-all border border-slate-700">
                <FaQuestionCircle size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboardPage;
