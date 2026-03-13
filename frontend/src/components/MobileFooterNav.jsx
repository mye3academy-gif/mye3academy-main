import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Search, ClipboardList, Zap, User } from "lucide-react";

const MobileFooterNav = () => {
  const location = useLocation();
  const { userData } = useSelector((state) => state.user);

  let dashboardPath = "/student-dashboard";
  if (userData?.role === "admin") dashboardPath = "/admin";
  else if (userData?.role === "instructor") dashboardPath = "/instructor-dashboard";
  else if (userData?.role === "institution") dashboardPath = "/institution-dashboard";

  const tabs = [
    { id: "home", label: "HOME", icon: Home, path: "/" },
    { id: "all", label: "ALL", icon: Search, path: "/all-tests" },
    { id: "mock", label: "MOCK", icon: ClipboardList, path: "/mock-tests" },
    { id: "grand", label: "GRAND", icon: Zap, path: "/grand-tests" },
    { id: "profile", label: "PROFILE", icon: User, path: userData ? dashboardPath : "/login" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-50 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
           const isActive = location.pathname === tab.path || (tab.id === 'all' && location.pathname === '/all-tests');
           return (
            <Link
              key={tab.id}
              to={tab.path}
              className="flex flex-col items-center gap-1.5 min-w-[55px] pt-1"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110"
                    : "text-slate-400 hover:text-indigo-400"
                }`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
              </div>
              <span
                className={`text-[10px] font-black tracking-tight ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooterNav;
