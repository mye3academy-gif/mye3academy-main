// frontend/src/components/Navbar.jsx
import newLogo from "../assets/mye3AcadmeyNewLogo.jpeg";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Home,
  Zap,
  MessageSquare,
  HelpCircle,
  Bell,
  Download,
} from "lucide-react";

import { logoutUser } from "../redux/userSlice";
import { fetchCategories } from "../redux/categorySlice";
import { setPublicCategoryFilter } from "../redux/studentSlice";
import { motion, AnimatePresence } from "framer-motion";
import { usePWA } from "../context/PWAContext";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { deferredPrompt, handleInstall, isInstalled } = usePWA();

  const { userData } = useSelector((state) => state.user || {});
  const categories = useSelector((state) => state.category?.items || []);
  const { filters } = useSelector((state) => state.students || { filters: {} });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      if (currentScrollY > 100) {
        scrollTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (categories.length === 0) dispatch(fetchCategories());
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [dispatch, categories.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleSelectCategory = (catId) => {
    dispatch(setPublicCategoryFilter(catId));
    setIsCategoryDropdownOpen(false);
    if (location.pathname !== "/all-tests") navigate("/all-tests");
  };

  const role = userData?.role || "student";
  let dashboardPath = "/student-dashboard";
  let showDashboardBtn = !!userData;
  let dashboardLabel = "My Dashboard";

  const isAdminInStudentView = role === "admin" && !location.pathname.startsWith("/admin");

  if (role === "admin") {
    if (isAdminInStudentView) {
        dashboardPath = "/student-dashboard"; 
        dashboardLabel = "Student Dashboard";
    } else {
        dashboardPath = "/admin";
        dashboardLabel = "Admin Panel";
    }
  } else if (role === "instructor") {
    dashboardPath = "/instructor-dashboard";
    dashboardLabel = "Instructor Panel";
  } else if (role === "institution") {
    dashboardPath = "/institution-dashboard";
    dashboardLabel = "Institution Portal";
  }

  const currentCategoryName =
    categories?.find((c) => c.slug === filters.category)?.name || "Categories";

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 transform ${isVisible ? "translate-y-0" : "-translate-y-full"} ${scrolled ? "bg-white py-1 md:py-2 shadow-sm" : "bg-white/90 backdrop-blur-md py-2 md:py-4"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16 md:h-24">
            
            {/* ── MOBILE VIEW ── */}
            <div className="flex md:hidden items-center justify-between w-full h-full px-1 gap-2">
              {/* Left: Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center active:scale-95 transition-transform -ml-4 sm:-ml-8">
                  <img 
                    src={newLogo} 
                    alt="Mye3 Logo" 
                    className="h-14 sm:h-16 w-auto object-contain object-left mix-blend-multiply scale-[1.1] origin-left"
                  />
                </Link>
              </div>

              {/* Center: Categories */}
              <div className="flex-grow flex justify-center relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center justify-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-slate-700 active:scale-95 transition-all"
                >
                  <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                    {currentCategoryName}
                  </span>
                </button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: 10, x: "-50%" }}
                      className="absolute top-full left-1/2 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-[70] overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Categories</p>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {categories.map((cat) => (
                          <button
                            key={cat._id}
                            onClick={() => handleSelectCategory(cat.slug)}
                            className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight hover:bg-slate-50 transition-colors"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Menu */}
              <div className="flex-shrink-0 flex items-center gap-1">
                {!isInstalled && (
                  <button
                    onClick={() => {
                      if (deferredPrompt && handleInstall) {
                        handleInstall();
                      } else {
                        alert("Please use your browser's menu to 'Install App' or 'Add to Home Screen'.");
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg active:scale-95 transition-transform shadow-sm"
                  >
                    <Download size={12} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Install</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1.5 text-slate-700 active:scale-90 transition-all"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>

            {/* ── DESKTOP VIEW ── */}
            <div className="hidden md:flex items-center w-full gap-8">
              {/* === LEFT: Logo === */}
              <Link to="/" className="flex items-center flex-shrink-0 hover:scale-[1.02] transition-transform -ml-12 md:-ml-20">
                <img 
                  src={newLogo} 
                  alt="Mye3 Logo" 
                  className="h-20 md:h-24 w-auto object-contain object-left mix-blend-multiply scale-[1.15] origin-left"
                />
              </Link>

              {/* === RIGHT: Nav Links === */}
              <nav className="flex items-center gap-8 font-bold text-[11px] text-slate-600 ml-auto mr-8">
                <Link
                  to="/"
                  className={location.pathname === "/" ? "text-indigo-600" : "hover:text-indigo-600 transition-colors uppercase tracking-widest"}
                >
                  HOME
                </Link>
                <Link
                  to="/all-tests"
                  className={location.pathname === "/all-tests" && !location.search.includes("type=") ? "text-indigo-600" : "hover:text-indigo-600 transition-colors uppercase tracking-widest"}
                >
                  ALL TESTS
                </Link>
                <Link
                  to="/mock-tests"
                  className={location.pathname === "/mock-tests" ? "text-indigo-600" : "hover:text-indigo-600 transition-colors uppercase tracking-widest"}
                >
                  MOCK TESTS
                </Link>
                <Link
                  to="/grand-tests"
                  className={location.pathname === "/grand-tests" ? "text-indigo-600" : "hover:text-indigo-600 transition-colors uppercase tracking-widest"}
                >
                  GRAND TESTS
                </Link>
              </nav>

              {/* === FAR RIGHT: Actions === */}
              <div className="flex items-center gap-6">
                <div className="w-px h-5 bg-slate-200" />
                
                {userData ? (
                  <div className="flex items-center gap-4">
                    {showDashboardBtn && (
                      <Link
                        to={dashboardPath}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        Dashboard
                      </Link>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center gap-3 p-1 pr-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-white transition-all shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center font-black text-[10px] text-indigo-600">
                          {userData.profilePicture ? (
                            <img
                              src={userData.profilePicture}
                              alt="User"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            userData.firstname?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                          {userData.firstname}
                        </span>
                        <ChevronDown size={12} className={isProfileDropdownOpen ? "rotate-180" : ""} />
                      </button>
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50">
                          <Link
                            to={dashboardPath}
                            className="flex items-center px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                          >
                            <LayoutDashboard size={16} className="mr-2" /> {dashboardLabel.toUpperCase()}
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
                          >
                            <LogOut size={16} className="mr-2" /> LOGOUT
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 font-bold text-[11px]">
                    <Link to="/login" className="text-slate-600 hover:text-indigo-600 uppercase tracking-widest">
                      Login
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform hover:scale-105 uppercase tracking-widest">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-[100dvh] w-[280px] bg-white shadow-2xl z-[110] md:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <Link to="/" className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Home size={20} className="text-indigo-500" /> Home
                </Link>
                <Link to="/mock-tests" className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Zap size={20} className="text-indigo-500" /> Mock Tests
                </Link>
                <Link to="/student/doubts" className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <HelpCircle size={20} className="text-indigo-500" /> Ask Doubts
                </Link>
                <Link to="/contact" className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <MessageSquare size={20} className="text-indigo-500" /> Add Feedback
                </Link>
                <Link to="/student-dashboard?tab=job-notifications" className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Bell size={20} className="text-indigo-500" /> Job Notifications
                </Link>
              </div>

              <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                {userData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 uppercase">
                        {userData.firstname?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">{userData.firstname}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userData.role}</p>
                      </div>
                    </div>
                    <Link to={dashboardPath} className="flex items-center gap-4 text-sm font-black text-indigo-600 uppercase tracking-widest">
                      <LayoutDashboard size={20} /> {dashboardLabel}
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-4 text-sm font-black text-red-500 uppercase tracking-widest pt-4 w-full">
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" className="py-3 px-4 text-center text-xs font-black text-slate-700 uppercase border border-slate-200 rounded-xl bg-white">
                      Login
                    </Link>
                    <Link to="/signup" className="py-3 px-4 text-center text-xs font-black text-white uppercase bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
