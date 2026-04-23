import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Common Layout for static pages like Privacy Policy, About Us, etc.
 * @param {string} title - Page Title
 * @param {string} subtitle - Optional Subtitle or description
 * @param {React.ReactNode} children - Main content
 */
const StaticPageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-white/5 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={12} />
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-indigo-400">{title}</span>
          </nav>

          <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-xs md:text-lg max-w-2xl font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-12 prose prose-slate max-w-none prose-headings:font-black prose-p:leading-relaxed prose-li:font-medium">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaticPageLayout;
