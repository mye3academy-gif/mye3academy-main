import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Trophy,
  FileText,
  Video,
} from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import heroBanner from "../../assets/home-banner.svg";
import slider1 from "../../assets/slider1.jpeg";
import slider2 from "../../assets/slider2.jpeg";
import slider3 from "../../assets/slider3.jpeg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [slider1, slider2, slider3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (!userData) {
      navigate("/all-tests");
    } else {
      const role = userData.role;
      if (role === "admin") navigate("/admin");
      else if (role === "institution") navigate("/institution-dashboard");
      else if (role === "instructor") navigate("/instructor-dashboard");
      else navigate("/student-dashboard");
    }
  };

  return (
    <section className="relative bg-[#f0f9ff] lg:min-h-screen overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* ====== HERO CONTENT ====== */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* MOBILE ONLY IMMERSIVE CAROUSEL */}
        <div className="block lg:hidden w-full relative pt-[78px] px-4">
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-white rounded-xl border border-slate-100 shadow-sm">
            {/* Background images carousel */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={slides[currentSlide]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-contain"
                alt={`Banner ${currentSlide + 1}`}
              />
            </AnimatePresence>

            {/* Indicators inside the banner area */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block max-w-6xl mx-auto px-6 lg:px-8 w-full md:pt-32 pt-10 pb-12 md:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center text-left w-full">

            {/* DESKTOP ONLY TEXT */}
            <div className="hidden lg:block space-y-4 lg:pr-4">

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#1e293b] leading-[1.15] tracking-tight uppercase">
                MASTER EVERY <br className="hidden sm:block" /> CONCEPT WITH <br className="hidden sm:block" />
                <span className="text-blue-600">SPECIALIZED TEST SERIES</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
                <span>LEARN</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
                <span>PRACTICE</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
                <span>IMPROVE</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
                <span className="text-blue-600">SUCCEED</span>
              </div>

              <p className="text-sm md:text-base text-slate-600 max-w-md leading-relaxed">
                Join thousands of aspirants and sharpen your skills with
                real-time exam simulations. Start your preparation for free today!
              </p>

              <div className="pt-2">
                <button
                  onClick={handleGetStarted}
                  className="bg-[#1ec978] hover:bg-[#19af69] text-white px-8 py-4 font-black text-xs transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                  GET STARTED FOR FREE
                </button>
              </div>
            </div>

            {/* RIGHT VISUALS (Desktop Only) */}
            <div className="hidden lg:flex relative justify-center lg:-ml-8">
              <img
                src={heroBanner}
                alt="Specialized Test Series Banner"
                className="w-full max-w-[500px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====== STATS BAR — pinned at bottom (Hidden on Mobile) ====== */}
      <div className="hidden md:block w-full px-4 lg:px-8 pb-10 sm:pb-12 mt-auto">
        <div className="max-w-5xl mx-auto bg-white shadow-xl shadow-blue-900/5 border border-slate-100 p-3 sm:p-5 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

            <div className="flex items-center gap-2 sm:gap-3 md:border-r border-slate-100">
              <div className="p-2 sm:p-2.5 bg-teal-50 text-teal-600 flex-shrink-0 rounded-lg">
                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">REGISTERED</p>
                <p className="text-[11px] sm:text-sm font-black text-slate-800 uppercase">50+ LAKHS</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:border-r border-slate-100">
              <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-500 flex-shrink-0 rounded-lg">
                <Trophy className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">SELECTIONS</p>
                <p className="text-[11px] sm:text-sm font-black text-slate-800 uppercase">4+ LAKHS</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:border-r border-slate-100">
              <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 flex-shrink-0 rounded-lg">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">TESTS TAKEN</p>
                <p className="text-[11px] sm:text-sm font-black text-slate-800 uppercase">80+ LAKHS</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-orange-50 text-orange-500 flex-shrink-0 rounded-lg">
                <Video className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">CLASSES</p>
                <p className="text-[11px] sm:text-sm font-black text-slate-800 uppercase">25+ LAKHS</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;

