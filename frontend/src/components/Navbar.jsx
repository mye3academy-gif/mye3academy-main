// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Search,
  Home,
  ClipboardList,
  Zap,
  Grid,
} from "lucide-react";



import { logoutUser } from "../redux/userSlice";
import { fetchCategories } from "../redux/categorySlice";
import { setPublicCategoryFilter } from "../redux/studentSlice";
import { motion, AnimatePresence } from "framer-motion";
import MobileFooterNav from "./MobileFooterNav";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // Reset timer on scroll
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      // Auto-show after 2 seconds of no scrolling
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

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleSelectCategory = (catId) => {
    dispatch(setPublicCategoryFilter(catId));
    setIsCategoryDropdownOpen(false);
    if (location.pathname !== "/all-tests") navigate("/all-tests");
  };

  // --- LOGIC CONNECTIVITY FIX: Dashboard Visibility ---
  const role = userData?.role || "student";
  let dashboardPath = "/student-dashboard";
  let showDashboardBtn = !!userData; // If logged in, show dashboard button
  let dashboardLabel = "My Dashboard";

  // Check if Admin is in "Student View" mode
  const isAdminInStudentView = role === "admin" && !location.pathname.startsWith("/admin");

  if (role === "admin") {
    if (isAdminInStudentView) {
        // In Student View: Link to Student Dashboard, but label appropriately or hide if preferred
        dashboardPath = "/student-dashboard"; 
        dashboardLabel = "Student Dashboard";
        // Option: set showDashboardBtn = false to hide it completely in student view
        // showDashboardBtn = false; 
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
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 transform ${isVisible ? "translate-y-0" : "-translate-y-full"} ${scrolled ? "bg-white py-1.5 md:py-2 shadow-sm" : "bg-white/90 backdrop-blur-md py-2 md:py-4"}`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* MOBILE TOP UI */}
            <div className="flex md:hidden items-center justify-between w-full h-full px-2">
              {/* Left: Logo */}
              <Link
                to="/"
                className="flex items-center active:scale-95 transition-transform"
              >
                <img 
                  src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
                  alt="Mye3 Logo" 
                  className="h-9 w-auto object-contain"
                />
              </Link>

              {/* Center: Categories */}
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center justify-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-slate-700 active:scale-95 transition-all"
                >
                  <span className="text-[11px] font-black uppercase tracking-tight whitespace-nowrap">
                    {currentCategoryName}
                  </span>
                </button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-[70] overflow-hidden"
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
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-slate-700 active:scale-90 transition-all"
              >
                <Menu size={24} />
              </button>
            </div>










            {/* DESKTOP TOP UI */}
            <div className="hidden md:flex items-center w-full gap-8">
              {/* === LEFT: Logo === */}
              <Link
                to="/"
                className="flex items-center flex-shrink-0 hover:scale-[1.02] transition-transform"
              >
                <img 
                  src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
                  alt="Mye3 Logo" 
                  className="h-10 w-auto object-contain"
                />
              </Link>

              {/* === CENTER: Nav Links === */}
              <div className="flex items-center gap-8 font-bold text-[11px] text-slate-600 mr-auto">
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
              </div>


              {/* === RIGHT: Nav Links (second half) + Actions === */}
              <div className="flex items-center gap-8 ml-auto">
                <div className="flex items-center gap-8 font-bold text-[11px] text-slate-600">
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
                </div>

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
                        onClick={() =>
                          setIsProfileDropdownOpen(!isProfileDropdownOpen)
                        }
                        className="flex items-center gap-3 p-1 pr-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-white transition-all"
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
                        <ChevronDown
                          size={12}
                          className={isProfileDropdownOpen ? "rotate-180" : ""}
                        />
                      </button>
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50">
                          <Link
                            to={dashboardPath}
                            className="flex items-center px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                          >
                            <LayoutDashboard size={16} className="mr-2" />{" "}
                            {dashboardLabel.toUpperCase()}
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
                    <Link
                      to="/login"
                      className="text-slate-600 hover:text-indigo-600 uppercase tracking-widest"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </nav>

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
              className="fixed right-0 top-0 h-screen w-[280px] bg-white shadow-2xl z-[110] md:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                  Navigation
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <Link
                  to="/"
                  className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest"
                >
                  <Home size={20} className="text-indigo-500" /> Home
                </Link>
                <Link
                  to="/all-tests"
                  className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest"
                >
                  <ClipboardList size={20} className="text-indigo-500" /> All Tests
                </Link>
                <Link
                  to="/mock-tests"
                  className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest"
                >
                  <Zap size={20} className="text-indigo-500" /> Mock Tests
                </Link>
                <Link
                  to="/grand-tests"
                  className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest"
                >
                  <Zap size={20} className="text-indigo-500" /> Grand Tests
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
                        <p className="text-sm font-black text-slate-800 uppercase">
                          {userData.firstname}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {userData.role}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={dashboardPath}
                      className="flex items-center gap-4 text-sm font-black text-indigo-600 uppercase tracking-widest"
                    >
                      <LayoutDashboard size={20} /> {dashboardLabel}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 text-sm font-black text-red-500 uppercase tracking-widest pt-4 w-full"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/login"
                      className="py-3 px-4 text-center text-xs font-black text-slate-700 uppercase border border-slate-200 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="py-3 px-4 text-center text-xs font-black text-white uppercase bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100"
                    >
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
