import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Footer = () => {
  const { userData } = useSelector((state) => state.user || {});
  
  // Dashboard path logic
  let dashboardPath = "/student-dashboard";
  if (userData?.role === "admin") dashboardPath = "/admin";
  else if (userData?.role === "instructor") dashboardPath = "/instructor-dashboard";
  else if (userData?.role === "institution") dashboardPath = "/institution-dashboard";

  // If page not available, go to dashboard (if logged in) or login
  const fallbackPath = userData ? dashboardPath : "/login";

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          {/* BRAND COLUMN */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <img 
                src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
                alt="Mye3 Logo" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              The nation's most trusted AI-powered test series platform. Your
              partner in exam excellence and professional success.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/all-tests" className="hover:text-indigo-400 transition-colors">
                  All Test Series
                </Link>
              </li>
              <li>
                <Link
                  to="/all-tests"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Learning Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/mock-tests"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Featured Mock Tests
                </Link>
              </li>
              <li>
                <Link to="/grand-tests" className="hover:text-indigo-400 transition-colors">
                  Grand Test Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors">
                  About MYE 3 Academy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/instructor-program" className="hover:text-indigo-400 transition-colors">
                  Instructor Program
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-indigo-400 transition-colors">
                  Help Center / FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-indigo-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-indigo-400 transition-colors">
                  Cookie Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT SECTION */}
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <p>&copy; 2025 MYE 3 Academy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed By <a href="https://webnappstudio.in/index.html" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-400 transition-colors">Web N App Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
