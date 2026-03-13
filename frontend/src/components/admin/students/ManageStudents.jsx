import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchStudents,
  blockStudent,
  deleteStudent,
} from "../../../redux/adminStudentSlice";
import api from "../../../api/axios";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaDownload,
  FaChartBar,
  FaQuestionCircle,
  FaTimes,
  FaArrowRight,
  FaEllipsisV,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

import { Search, GraduationCap, Phone, Info, Globe, Building2, Download, ExternalLink, Calendar, CheckCircle2, Clock, MoreVertical, Trash2, Pencil, Plus, ShieldCheck } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const ManageStudents = () => {
  const dispatch = useDispatch();

  const { students, status, error } = useSelector(
    (state) => state.adminStudents
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "idle") dispatch(fetchStudents());
  }, [status, dispatch]);

  const handleDownloadReport = async () => {
    try {
      const response = await api.get("/api/admin/users/students/report", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Students_Report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Failed to download report");
    }
  };

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityType, setActivityType] = useState(null); // 'purchased', 'attempts', 'doubts'
  const [activityData, setActivityData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const openActivityModal = async (student, type) => {
    setSelectedStudent(student);
    setActivityType(type);
    setIsModalLoading(true);
    setActivityData(null);
    try {
      const { data } = await api.get(`/api/admin/users/students/${student._id}/activity`);
      setActivityData(data);
    } catch (err) {
      toast.error("Failed to fetch activity details");
    } finally {
      setIsModalLoading(false);
    }
  };

  const [activeMenu, setActiveMenu] = useState(null);

  const handleBlock = (id) => {
    if (window.confirm("Are you sure you want to change this student's status?")) {
      dispatch(blockStudent(id));
      setActiveMenu(null);
    }
  };

  const handleStudentDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudent(id));
      setActiveMenu(null);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students || [];

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const fullName = `${s.firstname || ""} ${s.lastname || ""}`.toLowerCase();
        return fullName.includes(term) || s.email?.toLowerCase().includes(term);
      });
    }

    // Status Filter
    if (statusFilter !== "all") {
      const isActiveValue = statusFilter === "active";
      result = result.filter((s) => s.isActive === isActiveValue);
    }

    // Source Filter
    if (sourceFilter !== "all") {
      result = result.filter((s) => s.registrationSource === sourceFilter);
    }

    // Sort by Newest First
    return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [searchTerm, statusFilter, sourceFilter, students]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [currentPage, filteredStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-sans pb-32 relative">
      {/* Visual background accents */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-cyan-50/30 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/20 rounded-full blur-[100px] -z-0 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* WHITE HEADER STRIP */}
      <div className="bg-white border-b border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] mb-4 md:mb-8 top-0 sticky z-40">
        <div className="max-w-[1700px] mx-auto px-4 md:px-6 py-2 md:py-4 animate-in fade-in slide-in-from-top-1 duration-700">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 mb-2 md:mb-0">
              <div className="hidden md:block w-1.5 h-10 bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.2)]" />
              <div className="hidden md:block">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7e7e7e] hover:text-cyan-600 transition"
                >
                  <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
                <h1 className="text-2xl font-black text-[#3e4954] tracking-tight uppercase flex items-center gap-3 mt-4">
                  <GraduationCap className="text-cyan-600" size={24} />
                  Manage Students
                </h1>
                <p className="text-[10px] font-bold text-[#7e7e7e] mt-2">Track and manage student records</p>
              </div>
            </div>

            {/* Desktop-only Search/Filters */}
            <div className="hidden md:flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-600 transition-colors"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="bg-slate-50 border border-slate-100 rounded-none pl-9 pr-4 py-2.5 text-xs focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/5 outline-none w-52 md:w-64 transition-all font-bold text-[#3e4954]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-none px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-cyan-600 transition-all text-[#3e4954] cursor-pointer"
              >
                <option value="all">EVERYONE</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="blocked">BLOCKED ONLY</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-none px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-cyan-600 transition-all text-[#3e4954] cursor-pointer"
              >
                <option value="all">ALL SOURCES</option>
                <option value="self">SELF REGISTERED</option>
                <option value="institution">INSTITUTIONS</option>
                <option value="admin">ADMIN ADDED</option>
              </select>
            </div>

            {/* Mobile-only Top Controls - Image 2 Style */}
            <div className="flex md:hidden flex-col w-full gap-2">
               <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7e7e7e] ml-1"
                >
                  <FaArrowLeft size={8} /> Back to Dashboard
                </Link>
                
               <div className="flex items-center justify-between gap-2 px-1">
                 <button
                    onClick={handleDownloadReport}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-[#7e7e7e] py-2 text-[9px] font-black uppercase tracking-wider rounded-lg"
                  >
                    <Download size={12} /> Report
                  </button>
                  <Link
                    to="/admin/users/students/add"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-600 text-white py-2 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm shadow-cyan-100"
                  >
                    <Plus size={14} /> Add Student
                  </Link>
               </div>
            </div>

            <div className="hidden md:flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-[#7e7e7e] px-4 py-2.5 rounded-none shadow-sm hover:bg-slate-50 transition font-black text-[10px] uppercase tracking-widest border-b-2 hover:border-b-cyan-600"
                >
                  <Download size={14} /> Export
                </button>
                
                <Link
                  to="/admin/users/students/add"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-none shadow-lg shadow-cyan-100 transition flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus size={16} /> New Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 md:px-6">
        <div className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.04)] rounded-[2.5rem] border border-slate-100 overflow-hidden relative z-10 transition-all hover:shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-visible">
            {status === "loading" && (
              <div className="flex flex-col justify-center items-center p-32">
                <FaSpinner className="animate-spin text-5xl text-cyan-600" />
                <p className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Loading student data...</p>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-col items-center justify-center p-32 text-rose-500">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                   <FaExclamationTriangle className="text-2xl" />
                </div>
                <p className="font-black uppercase text-[11px] tracking-widest">Failed to load students</p>
                <p className="text-xs mt-2 opacity-60 italic">{error}</p>
              </div>
            )}

            {status === "succeeded" && (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[750px] sm:min-w-full">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="px-8 py-4 text-[11px] font-black uppercase text-slate-600 tracking-wider">Student</th>
                        <th className="px-8 py-4 text-[11px] font-black uppercase text-slate-600 tracking-wider">Source</th>
                        <th className="px-8 py-4 text-[11px] font-black uppercase text-slate-600 tracking-wider text-center">Activity</th>
                        <th className="px-8 py-4 text-[11px] font-black uppercase text-slate-600 tracking-wider text-center">Doubts</th>
                        <th className="px-8 py-4 text-[11px] font-black uppercase text-slate-600 tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((s) => {
                          const fullName = `${s.firstname || ""} ${s.lastname || ""}`.trim();

                          return (
                            <tr key={s._id} className="group hover:bg-slate-50/80 transition-all duration-500 border-b border-slate-50/80 last:border-0 h-24">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-5">
                                  <div className="relative group/avatar">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border-2 border-slate-100 overflow-hidden shadow-sm group-hover/avatar:border-cyan-200 transition-all duration-500 p-0.5">
                                      <img
                                        src={`https://ui-avatars.com/api/?background=F1F5F9&color=0891B2&bold=true&name=${encodeURIComponent(fullName || "U")}`}
                                        className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover/avatar:scale-110"
                                        onError={(e) => {
                                          e.target.src = `https://ui-avatars.com/api/?background=0ea5e9&color=fff&bold=true&name=UN`;
                                        }}
                                      />
                                    </div>
                                    {s.isActive && (
                                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm animate-pulse"></div>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm truncate group-hover:text-cyan-600 transition-colors">
                                      {fullName || "Unnamed Student"}
                                    </span>
                                    <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block mt-1 opacity-80">
                                      {s.email}
                                    </span>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="p-1 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                        <Phone size={10} />
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-black tracking-tight">{s.phoneNumber || "Not registered"}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-8 py-4">
                                <div className="flex flex-col gap-2.5 min-w-[160px]">
                                  {/* Source Badge */}
                                  {s.registrationSource === "self" ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-[0.15em] w-fit shadow-sm">
                                      <Globe size={11} className="stroke-[3]" /> SELF REGISTERED
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-1.5">
                                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] w-fit shadow-sm border ${
                                        s.registrationSource === 'admin' 
                                          ? "bg-rose-50 text-rose-700 border-rose-100" 
                                          : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                      }`}>
                                        {s.registrationSource === 'admin' ? <ShieldCheck size={12} className="stroke-[3]" /> : <Building2 size={12} className="stroke-[3]" />}
                                        {s.registrationSource === 'admin' ? "ADMIN ADDED" : "INSTITUTION"}
                                      </span>
                                      {s.addedBy && (
                                        <span className="text-[9px] font-black text-slate-400 pl-1 uppercase tracking-widest leading-none mt-1">
                                          By <span className="text-slate-600 uppercase">{s.addedBy.firstname}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Date Display */}
                                  <div className="flex items-center gap-2.5 mt-1 border-l-2 border-slate-100 pl-3">
                                    <Calendar size={13} className="text-slate-300" />
                                    <span className="text-[10px] text-slate-500 font-black tracking-tight uppercase">
                                      {new Date(s.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-8 py-4">
                                <div className="flex items-center justify-center gap-4">
                                  <button 
                                    onClick={() => openActivityModal(s, 'purchased')}
                                    className="group/stat flex flex-col items-center p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100 hover:bg-cyan-600 hover:border-cyan-600 transition-all duration-300 active:scale-90"
                                  >
                                    <span className="text-base font-black text-cyan-700 leading-none group-hover/stat:text-white transition-colors">
                                      {s.purchasedTestCount || 0}
                                    </span>
                                    <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mt-1.5 group-hover/stat:text-cyan-100 transition-colors">Purchase</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => openActivityModal(s, 'attempts')}
                                    className="group/stat flex flex-col items-center p-3 rounded-2xl bg-orange-50/50 border border-orange-100 hover:bg-orange-600 hover:border-orange-600 transition-all duration-300 active:scale-90"
                                  >
                                    <span className="text-base font-black text-orange-700 leading-none group-hover/stat:text-white transition-colors">
                                      {s.attemptCount || 0}
                                    </span>
                                     <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest mt-1.5 group-hover/stat:text-orange-100 transition-colors">Attempt</span>
                                  </button>
                                </div>
                              </td>

                              <td className="px-8 py-4 text-center">
                                 <button 
                                    onClick={() => openActivityModal(s, 'doubts')}
                                    className="inline-flex flex-col items-center gap-0.5 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-600 transition-all duration-300 group/doubt active:scale-90"
                                  >
                                    <div className="relative">
                                      <span className="text-base font-black text-purple-700 block leading-none group-hover/doubt:text-white transition-colors">
                                        {s.doubtCount || 0}
                                      </span>
                                      {s.doubtCount > 0 && (
                                        <div className="absolute -top-1 -right-1.5 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                                      )}
                                    </div>
                                     <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest mt-1.5 group-hover/doubt:text-purple-100 transition-colors">Doubt</span>
                                  </button>
                              </td>

                              <td className="px-8 py-4 text-center">
                                <div className="flex items-center justify-center gap-5 relative">
                                  {/* PREMIUM TOGGLE */}
                                  <div className="flex flex-col items-center gap-1.5">
                                    <button
                                      onClick={() => handleBlock(s._id)}
                                      className={`group/toggle relative inline-flex h-5 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ring-4 ring-transparent hover:ring-slate-100 shadow-inner ${
                                        s.isActive ? "bg-emerald-500" : "bg-slate-200"
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-500 shadow-md ${
                                          s.isActive ? "translate-x-6" : "translate-x-1"
                                        }`}
                                      />
                                    </button>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${s.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                                      {s.isActive ? "ACTIVE" : "BLOCKED"}
                                    </span>
                                  </div>

                                  {/* HOVER ACTION MENU */}
                                  <div className="relative group/actions z-10">
                                    <button 
                                      className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-500 border-2 bg-white text-slate-400 border-slate-100 group-hover/actions:bg-slate-900 group-hover/actions:text-white group-hover/actions:border-slate-900 group-hover/actions:shadow-2xl active:scale-90`}
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                    
                                    <div className="absolute top-1/2 right-full mr-4 -translate-y-1/2 hidden group-hover/actions:block animate-in fade-in zoom-in slide-in-from-right-4 duration-300 z-[100]">
                                      <div className="bg-slate-900 text-white shadow-[0_30px_90px_rgba(0,0,0,0.4)] rounded-[1.5rem] overflow-hidden min-w-[180px] border border-slate-800/50 backdrop-blur-2xl">
                                        <div className="px-5 py-3 bg-slate-800/40 border-b border-white/5">
                                          <p className="text-[9px] font-black uppercase tracking-[3px] text-slate-500">Logistics Unit</p>
                                        </div>
                                        
                                        <Link
                                          to={`/admin/users/students/edit/${s._id}`}
                                          className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-cyan-600 transition-all border-l-4 border-transparent hover:border-white group/item"
                                        >
                                          <Pencil size={14} className="group-hover/item:scale-110 transition-transform" />
                                          Edit Core Profile
                                        </Link>

                                        <button
                                          onClick={() => handleBlock(s._id)}
                                          className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 transition-all border-l-4 border-transparent ${
                                            s.isActive 
                                              ? "hover:bg-rose-600 group/item2" 
                                              : "hover:bg-emerald-600 group/item3"
                                          }`}
                                        >
                                          {s.isActive ? <FaBan size={14} className="group-hover/item2:rotate-12 transition-transform" /> : <FaCheckCircle size={14} className="group-hover/item3:scale-110 transition-transform" />}
                                          {s.isActive ? "Revoke Access" : "Grant Access"}
                                        </button>

                                        <div className="h-px bg-white/5 mx-2 my-1"></div>

                                        <button
                                          onClick={() => handleStudentDelete(s._id)}
                                          className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-rose-900 text-rose-400 font-bold transition-all border-l-4 border-transparent hover:border-rose-500"
                                        >
                                          <Trash2 size={14} />
                                          Purge Data
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-32 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                              <GraduationCap size={40} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">No matching student records found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden divide-y divide-slate-100">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((s) => {
                      const fullName = `${s.firstname || ""} ${s.lastname || ""}`.trim();

                      return (
                        <div key={s._id} className="p-3.5 space-y-3 bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                                <img
                                  src={`https://ui-avatars.com/api/?background=F1F5F9&color=0891B2&bold=true&name=${encodeURIComponent(fullName || "U")}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 text-[13px] uppercase truncate tracking-tight">{fullName || "Unnamed"}</p>
                                <p className="text-[10px] text-cyan-600 font-bold truncate opacity-80">{s.email}</p>
                                <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase tracking-widest">Joined: {new Date(s.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-none border ${
                                s.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              }`}>
                                {s.isActive ? "Active" : "Blocked"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                            <button 
                              onClick={() => openActivityModal(s, 'purchased')}
                              className="flex flex-col items-center py-1.5 rounded-lg bg-white border border-slate-100 active:scale-95 transition-transform"
                            >
                              <span className="text-[12px] font-black text-cyan-600">{s.purchasedTestCount || 0}</span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Tests</span>
                            </button>
                            <button 
                              onClick={() => openActivityModal(s, 'attempts')}
                              className="flex flex-col items-center py-1.5 rounded-lg bg-white border border-slate-100 active:scale-95 transition-transform"
                            >
                              <span className="text-[12px] font-black text-orange-600">{s.attemptCount || 0}</span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Attempts</span>
                            </button>
                            <button 
                              onClick={() => openActivityModal(s, 'doubts')}
                              className="flex flex-col items-center py-1.5 rounded-lg bg-white border border-slate-100 active:scale-95 transition-transform"
                            >
                              <span className="text-[12px] font-black text-purple-600">{s.doubtCount || 0}</span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Doubts</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-0.5">
                            <Link
                              to={`/admin/users/students/edit/${s._id}`}
                              className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                               Edit
                            </Link>
                            <button
                              onClick={() => handleBlock(s._id)}
                              className={`flex-1 py-2 rounded-lg border font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
                                s.isActive ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                              }`}
                            >
                              {s.isActive ? "Revoke" : "Grant"}
                            </button>
                            <button
                              onClick={() => handleStudentDelete(s._id)}
                              className="px-3 py-2 bg-rose-900 text-white rounded-lg active:scale-95 transition-transform shadow-sm"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-20 text-center">
                      <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">No student records found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {status === "succeeded" && totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 pb-12">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 rounded-2xl font-black text-xs transition-all active:scale-90 ${
                  currentPage === i + 1 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-110" 
                    : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVITY MODAL */}
      {selectedStudent && activityType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.4)] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-slate-200">
            {/* Elegant Minimal Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 flex justify-between items-center border-b border-slate-100 bg-white">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                  {activityType === 'purchased' ? 'Purchases' : activityType === 'attempts' ? 'Attempts' : 'Doubts'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                     {selectedStudent.firstname} {selectedStudent.lastname}
                   </p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedStudent(null); setActivityType(null); }} 
                className="w-8 h-8 rounded-lg hover:bg-slate-50 transition flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {isModalLoading ? (
                <div className="py-24 text-center">
                  <FaSpinner className="animate-spin text-5xl text-cyan-600 mx-auto" />
                   <p className="mt-6 text-[10px] text-slate-400 font-black tracking-widest uppercase">Loading activity data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityType === 'purchased' && (
                    <div className="space-y-4">
                      {activityData?.purchasedTests?.length > 0 ? (
                        activityData.purchasedTests.map((test, i) => (
                          <div key={i} className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 hover:border-cyan-200 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-cyan-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                <GraduationCap size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-tight text-base">{test.title}</h4>
                                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                   <Calendar size={12} className="text-slate-400" />
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ordered: {new Date(test.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg font-black text-[9px] uppercase tracking-widest border border-emerald-100">Purchased</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState icon={<Globe size={40} />} message="No purchases found" />
                      )}
                    </div>
                  )}

                  {activityType === 'attempts' && (
                    <div className="space-y-3">
                      {activityData?.attempts?.length > 0 ? (
                        activityData.attempts.map((att, i) => (
                          <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-300">
                            <div className="flex items-center justify-between gap-4">
                               <div className="flex-1">
                                  <h4 className="font-bold text-slate-700 text-[13px] uppercase tracking-tight mb-1">{att.mocktestId?.title || 'Mock Test'}</h4>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                      att.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>{att.status}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{new Date(att.createdAt).toLocaleDateString()}</span>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6">
                                  <div className="text-center group-hover:scale-110 transition-transform">
                                    <div className="text-xl font-black text-slate-900 leading-none">{att.score}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</div>
                                  </div>
                                  <div className="w-px h-8 bg-slate-100" />
                                  <div className="text-center">
                                    <div className="text-xl font-black text-cyan-600 leading-none">
                                      {(att.correctCount && att.answers?.length) ? Math.round((att.correctCount / att.answers.length) * 100) : 0}%
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</div>
                                  </div>
                                  <Link to={`/student/review/${att._id}`} target="_blank" className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-all active:scale-95 shadow-sm">
                                    <ExternalLink size={14} />
                                  </Link>
                               </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState icon={<FaChartBar size={32} />} message="No attempts found" />
                      )}
                    </div>
                  )}

                  {activityType === 'doubts' && (
                    <div className="space-y-4">
                      {activityData?.doubts?.length > 0 ? (
                        activityData.doubts.map((doubt, i) => (
                          <div key={i} className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${doubt.status === 'answered' ? 'bg-emerald-500' : 'bg-purple-600'}`}></div>
                            <div className="flex justify-between items-center mb-4 pl-2">
                               <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest border ${
                                 doubt.status === 'answered' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-purple-50 border-purple-100 text-purple-700'
                               }`}>
                                  {doubt.status}
                                </span>
                               <span className="text-[9px] text-slate-400 font-bold flex items-center gap-2">
                                 <Clock size={12} /> {new Date(doubt.createdAt).toLocaleDateString()}
                               </span>
                            </div>
                            <div className="pl-2">
                              <h4 className="text-lg font-bold text-slate-700 leading-relaxed mb-4 italic">"{doubt.text}"</h4>
                              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-3">Instructor Response</p>
                                {doubt.status === 'pending' ? (
                                  <div className="flex items-center gap-3 animate-pulse">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                     <p className="text-[10px] font-bold text-slate-500">Awaiting instructor assignment</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-white uppercase">
                                         {doubt.assignedInstructor?.firstname?.[0] || doubt.assignedBy?.firstname?.[0] || 'A'}
                                       </div>
                                       <div>
                                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Assigned Expert</p>
                                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{doubt.assignedInstructor?.firstname || "System Admin"}</p>
                                       </div>
                                    </div>
                                    {doubt.answer && (
                                      <div className="pt-3 border-t border-slate-50">
                                         <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{doubt.answer}"</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                         <EmptyState icon={<FaQuestionCircle size={40} />} message="No doubts found" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end flex-shrink-0">
               <button
                  onClick={() => { setSelectedStudent(null); setActivityType(null); }}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Helper Components */
const MetricBox = ({ label, value, color }) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center`}>
    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-base font-black text-${color}-600 leading-none`}>{value}</span>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-24 text-slate-300">
    <div className="mb-6 opacity-20 flex justify-center">{icon}</div>
    <p className="font-black uppercase text-[11px] tracking-[0.3em]">{message}</p>
  </div>
);

export default ManageStudents;
