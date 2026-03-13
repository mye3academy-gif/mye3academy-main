import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  GraduationCap,
  Phone,
  Calendar,
  Clock,
  Plus,
  Mail,
  Lock,
  User as UserIcon,
  ChevronRight,
  Zap,
  ArrowLeft,
} from "lucide-react";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaChartBar,
  FaQuestionCircle,
} from "react-icons/fa";
import { fetchInstitutionStudents } from "../../redux/institutionStudentSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 12;

const InstitutionStudents = () => {
  const dispatch = useDispatch();
  const { students, status, error } = useSelector(
    (state) => state.institutionStudents
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityType, setActivityType] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    dispatch(fetchInstitutionStudents());
  }, [dispatch]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      const fullName = `${s.firstname || ""} ${s.lastname || ""}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [students, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/institution/students/add", newStudent);
      toast.success("Student added successfully");
      setShowAddForm(false);
      setNewStudent({ firstname: "", lastname: "", email: "", password: "", phoneNumber: "" });
      dispatch(fetchInstitutionStudents());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    }
  };

  const openActivityModal = async (student, type) => {
    setSelectedStudent(student);
    setActivityType(type);
    setIsModalLoading(true);
    setActivityData(null);
    try {
      const { data } = await api.get(`/api/institution/students/${student._id}/activity`);
      setActivityData(data);
    } catch (err) {
      toast.error("Failed to fetch activity records");
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div className="font-sans">

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] mb-6 -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 pt-2 pb-6">
        <div className="mb-4">
          <Link
            to="/institution-dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 transition group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(8,141,178,0.3)]" />
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-600/10 text-cyan-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                Campus Students
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 pl-1">
                Integrated Student Registry &amp; Campus Directory
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors"
                size={15}
              />
              <input
                type="text"
                placeholder="SEARCH DIRECTORY..."
                className="bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-[10px] font-black tracking-widest focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/5 outline-none w-48 md:w-56 transition-all placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-2xl shadow-lg transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
            >
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>
      </div>

      {/* DATA VIEW (Table on Desktop, Cards on Mobile) */}
      <div className="bg-white md:shadow-[0_20px_60px_rgba(0,0,0,0.04)] md:rounded-[2rem] md:border border-slate-100 overflow-hidden">
        
        {status === "loading" && (
          <div className="flex flex-col justify-center items-center p-24">
            <FaSpinner className="animate-spin text-4xl text-cyan-600" />
            <p className="mt-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Syncing Campus Registry...
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center justify-center p-24 text-rose-500">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-5">
              <FaExclamationTriangle className="text-xl" />
            </div>
            <p className="font-black uppercase text-[11px] tracking-widest">Registry Failed</p>
            <p className="text-xs mt-1 opacity-60 italic">{error}</p>
          </div>
        )}

        {status === "succeeded" && (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em]">
                      Student Profile
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] text-center">
                      Engagement
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] text-center">
                      Avg Score
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] text-right">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((s) => {
                      const fullName = `${s.firstname || ""} ${s.lastname || ""}`.trim();
                      return (
                        <tr
                          key={s._id}
                          className="group hover:bg-slate-50/80 transition-all duration-300 border-b border-slate-50 last:border-0"
                        >
                          {/* Profile */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border-2 border-slate-100 overflow-hidden shadow-sm group-hover:border-cyan-200 transition-all duration-300 p-0.5">
                                  <img
                                    src={`https://ui-avatars.com/api/?background=F1F5F9&color=0891B2&bold=true&name=${encodeURIComponent(fullName || "U")}`}
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=0ea5e9&color=fff&bold=true&name=UN`; }}
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-800 uppercase tracking-tight text-sm truncate group-hover:text-cyan-600 transition-colors">
                                  {fullName || "Unnamed Student"}
                                </span>
                                <span className="text-[10px] text-cyan-600 font-bold block mt-0.5 opacity-80">
                                  {s.email}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <div className="p-1 bg-slate-100 rounded-md text-slate-400">
                                    <Phone size={9} />
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-black tracking-tight">
                                    {s.phoneNumber || "0000000000"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Engagement */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => openActivityModal(s, "purchased")}
                                className="group/stat flex flex-col items-center p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-100 hover:bg-cyan-600 hover:border-cyan-600 transition-all duration-300 active:scale-90 min-w-[48px]"
                              >
                                <span className="text-sm font-black text-cyan-700 leading-none group-hover/stat:text-white transition-colors">
                                  {s.purchasedTestCount || 0}
                                </span>
                                <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mt-1 group-hover/stat:text-cyan-100 transition-colors">
                                  Tests
                                </span>
                              </button>

                              <button
                                onClick={() => openActivityModal(s, "attempts")}
                                className="group/stat flex flex-col items-center p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 hover:bg-orange-600 hover:border-orange-600 transition-all duration-300 active:scale-90 min-w-[48px]"
                              >
                                <span className="text-sm font-black text-orange-700 leading-none group-hover/stat:text-white transition-colors">
                                  {s.attemptCount || 0}
                                </span>
                                <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest mt-1 group-hover/stat:text-orange-100 transition-colors">
                                  Exams
                                </span>
                              </button>
                            </div>
                          </td>

                          {/* Avg Score */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100">
                              <span className="text-sm font-black text-slate-700 leading-none">
                                {s.avgScore || 0}%
                              </span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                                Score
                              </span>
                            </div>
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={12} className="text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-tight">
                                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                                    day: "2-digit", month: "short", year: "numeric",
                                  })}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
                                Enrolled
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-200">
                          <GraduationCap size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                          No student records found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => {
                  const fullName = `${s.firstname || ""} ${s.lastname || ""}`.trim();
                  return (
                    <div key={s._id} className="p-5 flex flex-col gap-4 bg-white last:border-b-0 border-b border-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                              <img
                                src={`https://ui-avatars.com/api/?background=F1F5F9&color=0891B2&bold=true&name=${encodeURIComponent(fullName || "U")}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm leading-tight">
                              {fullName || "Unnamed Student"}
                            </h3>
                            <span className="text-[10px] font-bold text-cyan-600 opacity-80 mt-0.5">
                              {s.email}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Calendar size={12} className="text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center gap-1.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Engagement</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => openActivityModal(s, "purchased")} className="flex flex-col items-center">
                                    <span className="text-sm font-black text-cyan-600">{s.purchasedTestCount || 0}</span>
                                    <span className="text-[7px] font-black text-cyan-400 uppercase tracking-tighter">Tests</span>
                                </button>
                                <div className="w-px h-4 bg-slate-200" />
                                <button onClick={() => openActivityModal(s, "attempts")} className="flex flex-col items-center">
                                    <span className="text-sm font-black text-orange-500">{s.attemptCount || 0}</span>
                                    <span className="text-[7px] font-black text-orange-400 uppercase tracking-tighter">Exams</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-cyan-50/30 border border-cyan-100 rounded-2xl p-3 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-black text-cyan-700 leading-none">{s.avgScore || 0}%</span>
                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Avg score</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-1">
                         <div className="flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-300" />
                            <span className="uppercase tracking-tight tracking-widest">{s.phoneNumber || "0000000000"}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                             <Clock size={10} className="text-slate-300" />
                             <span>Joined {new Date(s.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-16 text-center">
                  <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No student records</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {status === "succeeded" && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-black text-xs transition-all active:scale-90 ${
                currentPage === i + 1
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.75rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Add Student</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Register a new student to your campus
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-100 transition active:scale-95"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                  <input
                    type="text" required placeholder="e.g. RAKESH"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:bg-white focus:border-cyan-600 outline-none transition-all placeholder:text-slate-300"
                    value={newStudent.firstname}
                    onChange={(e) => setNewStudent({ ...newStudent, firstname: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input
                    type="text" required placeholder="e.g. KUMAR"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold focus:bg-white focus:border-cyan-600 outline-none transition-all placeholder:text-slate-300"
                    value={newStudent.lastname}
                    onChange={(e) => setNewStudent({ ...newStudent, lastname: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email" required placeholder="student@example.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 pl-10 text-xs font-bold focus:bg-white focus:border-cyan-600 outline-none transition-all placeholder:text-slate-300"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="password" required placeholder="Secure password"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 pl-10 text-xs font-bold focus:bg-white focus:border-cyan-600 outline-none transition-all placeholder:text-slate-300"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 transition shadow-lg active:scale-95"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY MODAL */}
      {selectedStudent && activityType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.75rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                  {activityType} Insight
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Student: <span className="text-cyan-600 font-black">{selectedStudent.firstname} {selectedStudent.lastname}</span>
                </p>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setActivityType(null); }}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 transition flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 active:scale-95"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {isModalLoading ? (
                <div className="py-20 text-center">
                  <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto" />
                  <p className="mt-5 text-[10px] text-slate-400 font-black tracking-widest uppercase">
                    Fetching activity data...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData?.[activityType === "purchased" ? "purchasedTests" : activityType]?.length > 0 ? (
                    activityData[activityType === "purchased" ? "purchasedTests" : activityType].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-cyan-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Zap size={16} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-tight text-xs mb-0.5">
                              {item.title || item.mocktestId?.title || "Exercise Module"}
                            </h4>
                            <div className="flex items-center gap-2 opacity-60">
                              <Calendar size={10} className="text-slate-400" />
                              <span className="text-[9px] font-bold text-slate-500 uppercase">
                                {new Date(item.date || item.createdAt).toLocaleDateString()}
                              </span>
                              {item.score && (
                                <span className="text-[9px] font-bold text-slate-500 uppercase">• Score: {item.score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-600 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-300">
                      <div className="mb-5 opacity-20 flex justify-center">
                        {activityType === "attempts" ? <FaChartBar size={36} /> : <FaQuestionCircle size={36} />}
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-[0.3em]">No Records Found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setSelectedStudent(null); setActivityType(null); }}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
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

export default InstitutionStudents;
