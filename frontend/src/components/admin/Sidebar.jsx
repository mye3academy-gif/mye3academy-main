import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProfile } from "../../redux/adminSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { setUserData } from "../../redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";

import {
  LogOut, HelpCircle, GraduationCap, Building2, UserCog,
  ChevronLeft, ChevronRight, ChevronDown,
  CreditCard, LayoutGrid, FileText, Bell
} from "lucide-react";

const MENU = [
  { label: "Dashboard",          icon: LayoutGrid,  path: "/admin",                          end: true },
  {
    label: "Academic Exams",     icon: FileText,    key: "tests",
    children: [
      { label: "Exam Categories",    path: "/admin/categories"          },
      { label: "Subscription Plans", path: "/admin/subscriptions"       },
      { label: "All Tests",          path: "/admin/tests/manage-tests"  },
    ],
  },
  { label: "Students",            icon: GraduationCap, path: "/admin/users/students/manage"     },
  { label: "Institutions",        icon: Building2,     path: "/admin/users/institutions/manage" },
  { label: "Instructors",         icon: UserCog,       path: "/admin/users/instructors/manage"  },
  {
    label: "Payments",           icon: CreditCard,  key: "payments",
    children: [
      { label: "Transactions Hub",  path: "/admin/payments"         },
      { label: "Payment Settings",  path: "/admin/payment-settings" },
    ],
  },
  { label: "Doubt Management",    icon: HelpCircle, path: "/admin/doubts"         },
  { label: "Notifications",       icon: Bell,       path: "/admin/notifications"  },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const { adminProfile } = useSelector((s) => s.admin || {});

  // default open
  const [isPinned,    setIsPinned]    = useState(true);
  const [openMenus,   setOpenMenus]   = useState({});
  const [isLoggingOut,setIsLoggingOut]= useState(false);

  useEffect(() => {
    if (!adminProfile) dispatch(fetchAdminProfile());
  }, [dispatch, adminProfile]);

  // Auto-open active parent dropdown
  useEffect(() => {
    const active = MENU.find(m => m.children?.some(c => location.pathname === c.path));
    if (active) setOpenMenus(prev => ({ ...prev, [active.key]: true }));
  }, [location.pathname]);

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    if (!isPinned) setIsPinned(true); // auto-expand on submenu click
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      toast.success("You are now signed out");
      navigate("/");
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
        className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-[#5654F7] hover:scale-110 transition-all z-[120]"
      >
        {isPinned
          ? <ChevronLeft  size={18} strokeWidth={2.5} />
          : <ChevronRight size={18} strokeWidth={2.5} />}
      </button>

    <motion.div
      animate={{ width: isPinned ? 260 : 72 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="h-full bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col z-[100] overflow-hidden"
    >

      {/* Brand */}
      <div className="px-5 py-7 flex items-center gap-3 shrink-0">
        <Link
          to="/"
          className="shrink-0 w-10 h-10 rounded-2xl bg-[#5654F7] flex items-center justify-center text-white shadow-lg hover:rotate-6 transition-transform"
        >
          <GraduationCap size={22} strokeWidth={2.5} />
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
              <h2 className="text-lg font-black text-slate-800 tracking-tighter italic leading-none">Mye3</h2>
              <p className="text-[10px] font-bold text-[#5654F7] uppercase tracking-[0.2em] leading-none mt-0.5">Academy Admin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {MENU.map((m, i) => {
          const Icon = m.icon;
          const isActiveParent = m.path
            ? location.pathname === m.path
            : m.children?.some(c => location.pathname === c.path);
          const isOpen = openMenus[m.key];

          return (
            <div key={i} className="mb-0.5">
              <div
                onClick={() => m.children ? toggleMenu(m.key) : (navigate(m.path), setMobileOpen?.(false))}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-none cursor-pointer group transition-all
                  ${isActiveParent
                    ? "bg-[#5654F7]/10 text-[#5654F7]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#5654F7]"}`}
              >
                {/* Tooltip when collapsed */}
                {!isPinned && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[200] pointer-events-none">
                    {m.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                )}

                {isActiveParent && !m.children && (
                  <motion.div
                    layoutId="admin-active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-[#5654F7] rounded-r-full"
                  />
                )}

                <Icon size={20} strokeWidth={isActiveParent ? 2.5 : 2} className="shrink-0 relative z-10" />

                <AnimatePresence>
                  {isPinned && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1,  x:  0 }}
                      exit={{ opacity: 0,   x: -6 }}
                      className="text-sm font-bold whitespace-nowrap flex-1"
                    >
                      {m.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {m.children && isPinned && (
                  <ChevronDown
                    size={15}
                    className={`ml-auto opacity-40 transition-transform duration-200 ${isOpen ? "rotate-180 opacity-100 text-[#5654F7]" : ""}`}
                  />
                )}
              </div>

              {/* Accordion submenu */}
              <AnimatePresence>
                {m.children && isOpen && isPinned && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-11 pr-2 space-y-0.5"
                  >
                    {m.children.map((c, idx) => {
                      const isChild = location.pathname === c.path;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); navigate(c.path); setMobileOpen?.(false); }}
                          className={`relative py-2 pl-4 rounded-xl text-[13px] font-bold cursor-pointer transition-colors
                            ${isChild ? "text-[#5654F7]" : "text-slate-500 hover:text-[#5654F7]"}`}
                        >
                          {isChild && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#5654F7]" />
                          )}
                          {c.label}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
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

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block h-screen sticky top-0 overflow-visible z-50">
        {DesktopSidebar}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-[100dvh] w-[280px] bg-white shadow-2xl z-[10000]"
            >
              <div className="h-full overflow-y-auto flex flex-col">
                {/* Mobile brand */}
                <div className="px-5 py-6 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Link to="/" className="w-10 h-10 rounded-2xl bg-[#5654F7] flex items-center justify-center text-white">
                      <GraduationCap size={22} />
                    </Link>
                    <div>
                      <h2 className="text-lg font-black text-slate-800 italic">Mye3</h2>
                      <p className="text-[10px] font-bold text-[#5654F7] uppercase tracking-wider">Academy Admin</p>
                    </div>
                  </div>
                </div>

                {/* Mobile nav */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                  {MENU.map((m, i) => {
                    const Icon = m.icon;
                    const isActiveParent = m.path
                      ? location.pathname === m.path
                      : m.children?.some(c => location.pathname === c.path);
                    const isOpen = openMenus[m.key];
                    return (
                      <div key={i}>
                        <div
                          onClick={() => m.children ? toggleMenu(m.key) : (navigate(m.path), setMobileOpen(false))}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
                            ${isActiveParent ? "bg-[#5654F7]/10 text-[#5654F7]" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          <Icon size={20} />
                          <span className="text-sm font-bold flex-1">{m.label}</span>
                          {m.children && <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                        </div>
                        {m.children && isOpen && (
                          <div className="pl-10 space-y-0.5 mt-0.5">
                            {m.children.map((c, idx) => (
                              <div
                                key={idx}
                                onClick={() => { navigate(c.path); setMobileOpen(false); }}
                                className={`py-2 pl-4 rounded-xl text-[13px] font-bold cursor-pointer
                                  ${location.pathname === c.path ? "text-[#5654F7]" : "text-slate-500"}`}
                              >
                                {c.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                  <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-2xl w-full bg-rose-50 text-rose-600 border border-rose-100">
                    <LogOut size={20} />
                    <span className="text-sm font-bold">Secure Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
