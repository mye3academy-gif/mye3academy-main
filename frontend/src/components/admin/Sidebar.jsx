import React, { useState, useMemo, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProfile } from "../../redux/adminSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { setUserData } from "../../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  HelpCircle,
  GraduationCap,
  Building2,
  UserCog,
  ChevronRight,
  ChevronDown,
  CreditCard,
  LayoutGrid
} from "lucide-react";

// ----------------------------------------------
// NAVIGATION DATA MAPPING V2.1
// ----------------------------------------------
const MENU = [
  { label: "Dashboard", icon: LayoutGrid, path: "/admin", end: true },
  {
    label: "Academic Exams",
    icon: FileText,
    key: "tests",
    children: [
      { label: "Exam Categories", path: "/admin/categories" },
      { label: "All Tests", path: "/admin/tests/manage-tests" },
    ],
  },
  { label: "Students", icon: GraduationCap, path: "/admin/users/students/manage" },
  { label: "Institutions", icon: Building2, path: "/admin/users/institutions/manage" },
  { label: "Instructors", icon: UserCog, path: "/admin/users/instructors/manage" },
  {
    label: "Payment Management",
    icon: CreditCard,
    key: "payments",
    children: [
      { label: "Transactions Hub", path: "/admin/payments" },
      { label: "Payment Settings", path: "/admin/payment-settings" },
    ],
  },
  { label: "Doubt Management", icon: HelpCircle, path: "/admin/doubts" },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { adminProfile } = useSelector((state) => state.admin || {});
  
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openMenus, setOpenMenus] = useState({}); // Track multiple open accordions
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sidebarRef = useRef(null);
  const hoverTimer = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!adminProfile) dispatch(fetchAdminProfile());
  }, [dispatch, adminProfile]);

  // Sync openMenus with current path
  useEffect(() => {
    const activeParent = MENU.find(m => m.children?.some(c => location.pathname === c.path));
    if (activeParent) {
      setOpenMenus(prev => ({ ...prev, [activeParent.key]: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileOpen]);

  // Force expanded mode on mobile to show all menu labels in the drawer
  const expandedSidebar = isMobile ? true : (isPinned || isHovering);

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    hoverTimer.current = setTimeout(() => setIsHovering(true), 150);
  };

  const handleLeave = () => {
    if (isPinned) return;
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => setIsHovering(false), 200);
  };

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    if (!expandedSidebar) setIsPinned(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      toast.success("You are now signed out");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const avatarUrl = useMemo(() => {
    if (adminProfile?.avatar)
      return `${import.meta.env.VITE_SERVER_URL}/${adminProfile.avatar.replace(/\\/g, "/")}`;
    return `https://ui-avatars.com/api/?name=${adminProfile?.firstname || "Admin"}+${adminProfile?.lastname || ""}&background=6366f1&color=fff&size=128&bold=true`;
  }, [adminProfile]);


  const SidebarContent = (
    <div
      className={`h-full bg-white flex flex-col shadow-[12px_0_40px_rgba(33,33,33,0.03)] border-r border-slate-100 ${isMobile ? 'w-[280px]' : (expandedSidebar ? 'w-[280px]' : 'w-[88px]')} transition-all duration-300`}
    >
      {/* BRAND SECTION */}
      <div className="px-4 py-8 flex items-center gap-2">
        <Link
          to="/"
          className="shrink-0 cursor-pointer hover:rotate-2 transition-transform"
        >
          <img 
            src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
            alt="Mye3 Logo" 
            className="h-10 w-auto object-contain mx-auto"
          />
        </Link>
        <AnimatePresence mode="wait">
          {expandedSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden whitespace-nowrap cursor-pointer pr-4"
              onClick={() => navigate("/")}
            >
              <p className="text-[10px] font-bold text-[#5654F7] uppercase tracking-wider leading-none mt-0.5">Admin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION */}
      <nav className="px-3 space-y-1 flex-grow overflow-y-auto custom-scrollbar">
        {MENU.map((m, i) => {
          const Icon = m.icon;
          const isActiveParent = m.path ? location.pathname === m.path : m.children?.some(c => location.pathname === c.path);
          const isDropdownOpen = openMenus[m.key];

          return (
            <div key={i} className="mb-1">
              <div
                onClick={() => {
                  if (m.children) {
                    toggleMenu(m.key);
                  } else {
                    navigate(m.path);
                    setMobileOpen(false);
                  }
                }}
                className={`
                    relative flex items-center gap-4 px-4 py-3 rounded-none cursor-pointer group transition-all
                    ${isActiveParent ? "bg-[#5654F7]/10 text-[#5654F7]" : "text-slate-500 hover:bg-slate-50 hover:text-[#5654F7]"}
                `}
              >
                {isActiveParent && !m.children && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-[#5654F7] rounded-r-full shadow-sm"
                  />
                )}

                <Icon size={20} strokeWidth={isActiveParent ? 2.5 : 2} className="shrink-0 relative z-10" />

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

                {m.children && expandedSidebar && (
                  <ChevronDown
                    size={16}
                    className={`ml-auto opacity-40 transition-transform ${isDropdownOpen ? "rotate-180 text-[#5654F7] opacity-100" : ""}`}
                  />
                )}
              </div>

              {/* INLINE SUBMENU (ACCORDION) */}
              <AnimatePresence>
                {m.children && isDropdownOpen && expandedSidebar && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-11 pr-2 space-y-1 relative"
                  >
                    {m.children.map((c, idx) => {
                      const isActiveChild = location.pathname === c.path;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(c.path);
                            setMobileOpen(false);
                          }}
                          className={`
                            relative py-2 pl-4 rounded-xl text-[13px] font-bold cursor-pointer transition-colors
                            ${isActiveChild ? "text-[#5654F7]" : "text-slate-500 hover:text-[#5654F7]"}
                          `}
                        >
                          {isActiveChild && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#5654F7] shadow-sm" />
                          )}
                          {c.label}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FLOATING SUBMENU (WHEN COLLAPSED) */}
              <AnimatePresence>
                {m.children && !expandedSidebar && isHovering && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute left-full ml-2 top-0 bg-white border border-slate-100 shadow-2xl rounded-2xl w-48 p-2 z-[110]"
                  >
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                    </div>
                    {m.children.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(c.path);
                          setMobileOpen(false);
                        }}
                        className={`
                            px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-colors
                            ${location.pathname === c.path ? "bg-[#5654F7]/10 text-[#5654F7]" : "text-slate-600 hover:bg-slate-50 hover:text-[#5654F7]"}
                        `}
                      >
                        {c.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="mt-8 md:mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
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
              {isLoggingOut ? "Signing out..." : "Logout"}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR - Standard CSS hiding */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen z-50 overflow-visible">
        {SidebarContent}
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-[100dvh] w-[280px] bg-white shadow-2xl z-[10000]"
            >
              <div className="h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                {SidebarContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
