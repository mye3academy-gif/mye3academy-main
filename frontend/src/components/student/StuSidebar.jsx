import React, { useState, useMemo, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentProfile } from "../../redux/studentSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { setUserData } from "../../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";

import {
  BookOpen,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  Search,
  GraduationCap,
  MessageCircle,
  LayoutGrid,
  ChevronDown,
  Menu,
  X,
  Zap
} from "lucide-react";

const MENU = [
  { label: "Overview", icon: LayoutGrid, key: "overview" },
  { label: "My Enrollments", icon: BookOpen, key: "my-tests" },
  { label: "Explore Tests", icon: Search, key: "explore" },
  { label: "My Performance", icon: TrendingUp, key: "performance" },
  { label: "My Doubts", icon: MessageCircle, key: "doubts" },
  { label: "Profile Settings", icon: Settings, key: "settings" },
];

const StuSidebar = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { studentProfile } = useSelector((state) => state.students);
  const [isHovering, setIsHovering] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hoverTimer = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    if (!studentProfile) dispatch(fetchStudentProfile());
  }, [dispatch, studentProfile]);

  const expandedSidebar = isPinned || isHovering || isMobileOpen;

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    hoverTimer.current = setTimeout(() => setIsHovering(true), 150);
  };

  const handleLeave = () => {
    if (isPinned) return;
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => setIsHovering(false), 200);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setIsLoggingOut(true);
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      localStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const SidebarContent = (
    <motion.div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      animate={{ width: expandedSidebar ? 280 : 88 }}
      transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.8 }}
      className="relative h-full bg-white border-r border-slate-200 flex flex-col z-[100]"
    >
      <Link
        to="/"
        key="logo-desktop"
        className="px-4 py-6 flex items-center gap-2 relative z-[110] group"
      >
        <div className="shrink-0 cursor-pointer active:scale-95 transition-all duration-300">
          <img 
            src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
            alt="Mye3 Logo" 
            className="h-10 w-auto object-contain mx-auto"
          />
        </div>
        <AnimatePresence mode="wait">
          {expandedSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden whitespace-nowrap pr-4"
            >
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider leading-none mt-0.5">Student</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* NAVIGATION */}
      <nav className="px-3 space-y-1 flex-grow overflow-y-auto custom-scrollbar">
        {MENU.map((m, i) => {
          const Icon = m.icon;
          const isActive = activeTab === m.key;

          return (
            <div key={i} className="mb-1">
              <div
                onClick={() => {
                  setActiveTab(m.key);
                  setIsMobileOpen(false);
                }}
                className={`
                    relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all
                    ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill-stu"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-blue-600 rounded-r-full shadow-sm"
                  />
                )}

                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 relative z-10" />

                <AnimatePresence>
                  {expandedSidebar && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="text-[14px] font-bold whitespace-nowrap overflow-hidden"
                    >
                      {m.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
                flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group w-full
                ${expandedSidebar ? "bg-rose-50 text-rose-600 shadow-sm border border-rose-100" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"}
            `}
        >
          <LogOut size={20} className="shrink-0" />
          {expandedSidebar && (
            <span className="text-[13px] font-bold whitespace-nowrap">
              {isLoggingOut ? "Signing out..." : "Secure Logout"}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full p-4 bg-white/95 backdrop-blur-md z-50 flex justify-between items-center shadow-sm border-b border-slate-100">
        <Link to="/">
          <img 
            src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
            alt="Mye3 Logo" 
            className="h-8 w-auto object-contain"
          />
        </Link>
        <Menu
          className="text-slate-600 cursor-pointer"
          onClick={() => setIsMobileOpen(true)}
        />
      </div>

      <div className="hidden md:block h-screen sticky top-0 transition-all">
        {SidebarContent}
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 h-screen z-[160] md:hidden w-[280px]"
            >
              <div className="h-full bg-white relative">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-[170]"
                >
                  <X size={20} />
                </button>
                <div className="h-full w-full pointer-events-auto">
                  {SidebarContent}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StuSidebar;
