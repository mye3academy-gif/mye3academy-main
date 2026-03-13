import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Zap,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

const FeaturesSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* ================= LEFT CONTENT ================= */}
          <div className="lg:col-span-1 space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 group transition-transform duration-500 hover:rotate-6">
              <div className="bg-indigo-600 p-2.5 rounded-lg shadow-lg shadow-indigo-100">
                <GraduationCap className="text-white w-8 h-8" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight uppercase font-poppins">
              WHY <span className="text-emerald-500">MYE3</span> ACADEMY?
            </h2>

            <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
              With <span className="font-bold text-slate-900">50+ Lakh Students</span> and <span className="font-bold text-slate-900">One of the best Selection rate in India</span> amongst online learning platforms, you can surely rely on us to excel.
            </p>

            <div className="pt-4">
              <button 
                onClick={() => navigate("/all-tests")}
                className="px-8 py-3.5 bg-emerald-500 text-white font-black text-[11px] rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:scale-105 transition-all duration-300 uppercase tracking-widest"
              >
                Get Started For Free
              </button>
            </div>


          </div>

          {/* ================= RIGHT GRID (Staggered Cards) ================= */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              {/* Feature 1: Learn from Best */}
              <div className="bg-[#ecfdf5] p-5 rounded-2xl border border-emerald-200 shadow-lg shadow-emerald-500/10 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-[#4de59e] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-200">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Learn from the Best
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Learn from the masters of the subject, in the most engaging
                  yet simplified ways.
                </p>
              </div>

              {/* Feature 2: Detailed Score Analysis */}
               <div className="bg-[#fffbeb] p-5 rounded-2xl border border-amber-200 shadow-lg shadow-amber-500/10 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-200">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Detailed Score Analysis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Get a detailed breakdown of your strengths & weaknesses and
                  discover insights to improve your score.
                </p>
              </div>
            </div>

            {/* Column 2 (Staggered - Offset Top) */}
            <div className="space-y-4 md:mt-6">
              {/* Feature 3: Live Tests */}
              <div className="bg-[#fdf2f8] p-5 rounded-2xl border border-pink-200 shadow-lg shadow-pink-500/10 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-200">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Live Tests for Real Experience
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Feel the thrill of a real exam. Improve your time & pressure
                  management skills with real-time simulations.
                </p>
              </div>

              {/* Feature 4: Doubt Solving (Replacing Multilingual) */}
              <div className="bg-[#eef2ff] p-5 rounded-2xl border border-indigo-200 shadow-lg shadow-indigo-500/10 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Instant Doubt Solving
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Stuck on a tricky question? Get step-by-step solutions from
                  our verified experts instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
