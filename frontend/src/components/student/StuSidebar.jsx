import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentProfile } from "../../redux/studentSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { setUserData } from "../../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, TrendingUp, Settings, LogOut,
  Search, MessageCircle, LayoutGrid, Menu, X,
  ChevronLeft, ChevronRight, GraduationCap, Bell
} from "lucide-react";

const MENU = [
  { label: "Overview",         icon: LayoutGrid,    key: "overview"     },
  { label: "My Enrollments",   icon: BookOpen,      key: "my-tests"     },
  { label: "Explore Tests",    icon: Search,        key: "explore"      },
  { label: "My Performance",   icon: TrendingUp,    key: "performance"  },
  { label: "My Doubts",        icon: MessageCircle, key: "doubts"       },
  { label: "Job Notifications", icon: Bell,          key: "job-notifications" },
  { label: "Profile Settings", icon: Settings,      key: "settings"     },
];

const StuSidebar = ({ activeTab, setActiveTab }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { studentProfile } = useSelector((s) => s.students);

  // default open
  const [isPinned,     setIsPinned]     = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Notification unread logic
  const { notifications } = useSelector(s => s.students);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!notifications) return;
    const lastSeen = localStorage.getItem("lastSeenNotification") || 0;
    const count = notifications.filter(n => new Date(n.createdAt).getTime() > Number(lastSeen)).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleTabClick = (key) => {
    if (key === "explore") {
      return navigate("/all-tests");
    }
    
    setActiveTab(key);
    if (key === "job-notifications") {
      localStorage.setItem("lastSeenNotification", Date.now());
      setUnreadCount(0);
    }
    if (isMobileOpen) setIsMobileOpen(false);
  };

  useEffect(() => {
    if (!studentProfile) dispatch(fetchStudentProfile());
  }, [dispatch, studentProfile]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setIsLoggingOut(true);
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      localStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Desktop Sidebar ──
  const DesktopSidebar = (
    <div className="relative h-full">
      {/* Floating toggle button OUTSIDE the sidebar so it's never clipped */}
      <button
        onClick={() => setIsPinned(p => !p)}
        className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-blue-600 hover:scale-110 transition-all z-[120]"
      >
        {isPinned
          ? <ChevronLeft  size={18} strokeWidth={2.5} />
          : <ChevronRight size={18} strokeWidth={2.5} />}
      </button>

    <motion.div
      animate={{ width: isPinned ? 260 : 72 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="h-full bg-white border-r border-slate-200 flex flex-col z-[100] overflow-hidden"
    >

      {/* Brand */}
      <div className="px-5 py-7 flex items-center gap-3 shrink-0">
        <Link
          to="/"
          className="shrink-0 transition-transform hover:scale-105"
        >
          <img 
            src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`}
            alt="Mye3 Logo"
            className="w-auto h-8 sm:h-9 object-contain"
          />
        </Link>
        <AnimatePresence>
          {isPinned && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1,  x:  0 }}
              exit={{ opacity: 0,   x: -8 }}
              className="overflow-hidden whitespace-nowrap cursor-pointer"
              onClick={() => navigate("/")}
            >
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none">
                Student Dashboard
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {MENU.map((m) => {
          const Icon    = m.icon;
          const isActive = activeTab === m.key;
          return (
            <div
              key={m.key}
              onClick={() => handleTabClick(m.key)}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              {/* Tooltip when collapsed */}
              {!isPinned && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[200] pointer-events-none">
                  {m.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="stu-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-blue-600 rounded-r-full"
                />
              )}

              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 relative z-10" />

              <AnimatePresence>
                {isPinned && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1,  x:  0 }}
                    exit={{ opacity: 0,   x: -6 }}
                    className="text-sm font-bold whitespace-nowrap"
                  >
                    {m.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Notification Badge */}
              {m.key === "job-notifications" && unreadCount > 0 && (
                <div className={`absolute ${isPinned ? 'right-3' : 'right-1 top-1'} flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg border-2 border-white animate-bounce`}>
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all w-full
            ${isPinned
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
        >
          <LogOut size={20} className="shrink-0" />
          {isPinned && (
            <span className="text-sm font-bold whitespace-nowrap">
              {isLoggingOut ? "Signing out..." : "Secure Logout"}
            </span>
          )}
        </button>
      </div>
    </motion.div>
    </div>
  );

  // ── Mobile drawer inner (always expanded) ──
  const MobileContent = (
    <div className="h-full bg-white flex flex-col">
      <div className="px-5 py-6 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img 
              src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`}
              alt="Mye3 Logo"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Student Dashboard</p>
          </div>
        </div>
        <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {MENU.map((m) => {
          const Icon     = m.icon;
          const isActive = activeTab === m.key;
          return (
            <div
              key={m.key}
              onClick={() => handleTabClick(m.key)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
                ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm font-bold flex-1">{m.label}</span>
              {m.key === "job-notifications" && unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                   {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl w-full bg-rose-50 text-rose-600 border border-rose-100"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold">Secure Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full px-4 py-3 bg-white/95 backdrop-blur-md z-50 flex justify-between items-center shadow-sm border-b border-slate-100">
        <Link to="/">
          <img 
            src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`}
            alt="Mye3 Logo"
            className="h-6 w-auto object-contain"
          />
        </Link>
        <button onClick={() => setIsMobileOpen(true)}>
          <Menu size={22} className="text-slate-600" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0 overflow-visible z-50">
        {DesktopSidebar}
      </div>

      {/* Mobile drawer */}
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen z-[160] md:hidden w-[280px]"
            >
              {MobileContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StuSidebar;
