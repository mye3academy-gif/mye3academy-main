// frontend/src/pages/admin/AdminDoubts.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDoubts, assignDoubtToInstructor } from "../../redux/doubtSlice";
import { fetchInstructors } from "../../redux/instructorSlice"; 
import { getSocket } from "../../socket"; // Socket import
import toast from "react-hot-toast";
import { useMemo, useState, useCallback } from "react";
import { User, BookOpen, Clock, CheckCircle, ChevronRight, Eye, X, MessageSquare, ShieldCheck, Mail, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDoubts = () => {
  const dispatch = useDispatch();
  const { adminDoubts, adminStatus } = useSelector((state) => state.doubts);
  const { instructors } = useSelector((state) => state.instructors);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // --- MODAL STATE ---
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDoubtDetails = (doubt) => {
    setSelectedDoubt(doubt);
    setIsModalOpen(true);
  };

  const closeDoubtDetails = () => {
    setSelectedDoubt(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(fetchAdminDoubts());
    dispatch(fetchInstructors());

    // Listen for new doubts live!
    const socket = getSocket();
    if (socket) {
        socket.on("newDoubtReceived", (data) => {
            toast(data.message, { icon: '🔔' });
            dispatch(fetchAdminDoubts());
        });
        return () => socket.off("newDoubtReceived");
    }
  }, [dispatch]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.max(1, Math.ceil(adminDoubts.length / ITEMS_PER_PAGE));

  const paginatedDoubts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return adminDoubts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, adminDoubts]);

  // Reset page when data changes (e.g., new doubt received)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [adminDoubts.length, totalPages, currentPage]);

  const handleAssign = (id, instructorId) => {
    if (!instructorId || instructorId === "Select") return;
    dispatch(assignDoubtToInstructor({ id, instructorId, status: "assigned" }));
  };

  return (
    <div className="px-6 py-2 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
           <BookOpen className="text-blue-600" size={24}/> Doubt Management
        </h2>
        <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-gray-500 shadow-sm uppercase tracking-widest shrink-0">
          Total Doubts: {adminDoubts.length}
        </span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#fdfdfd] text-[#3e4954] uppercase font-black text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student & Subject</th>
                <th className="px-4 py-3 w-1/3">Doubt Query</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedDoubts.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-gray-900 flex items-center gap-2 text-xs">
                       <User size={14} className="text-slate-400"/> 
                       {d.student?.firstname} {d.student?.lastname}
                    </div>
                    <div className="text-[9px] text-[#21b731] font-black uppercase tracking-wider mt-0.5">
                        {d.subject}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-xs">
                     <p className="line-clamp-2 font-bold text-gray-700 leading-relaxed" title={d.text}>{d.text}</p>
                     {d.mocktestId && <span className="text-[8px] text-blue-600 font-extrabold uppercase tracking-widest mt-1 block">Test Related</span>}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest border
                      ${d.status === 'pending' ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                      ${d.status === 'assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                      ${d.status === 'answered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                    `}>
                      {d.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      className="border border-slate-200 px-2 py-1 text-[10px] font-bold text-gray-700 focus:border-blue-500 outline-none w-full bg-slate-50 rounded-none cursor-pointer"
                      value={d.assignedInstructor?._id || ""}
                      onChange={(e) => handleAssign(d._id, e.target.value)}
                      disabled={d.status === 'answered'}
                    >
                      <option value="">Select Instructor</option>
                      {instructors?.map((i) => (
                        <option key={i._id} value={i._id}>
                          {i.firstname} {i.lastname}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openDoubtDetails(d)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors group/view"
                        title="View Details"
                      >
                        <Eye size={16} className="group-hover/view:scale-110 transition-transform" />
                      </button>

                      {d.status === 'pending' && (
                        <button className="text-rose-500 hover:text-rose-700 text-[9px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Reject</button>
                      )}
                      {d.status === 'answered' && (
                        <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle size={12}/> Success
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="lg:hidden divide-y divide-slate-100">
          {paginatedDoubts.map((d) => (
            <div key={d._id} className="p-4 space-y-3 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="font-extrabold text-gray-900 flex items-center gap-2 text-[11px] truncate uppercase tracking-tight">
                    <User size={12} className="text-slate-400 shrink-0"/> 
                    {d.student?.firstname} {d.student?.lastname}
                  </div>
                  <div className="text-[9px] text-[#21b731] font-black uppercase tracking-wider mt-0.5">
                    {d.subject}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest border
                  ${d.status === 'pending' ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                  ${d.status === 'assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                  ${d.status === 'answered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                `}>
                  {d.status}
                </span>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                <p className="text-[11px] font-bold text-gray-700 leading-relaxed line-clamp-3">
                  {d.text}
                </p>
                {d.mocktestId && (
                  <span className="text-[8px] text-blue-600 font-black uppercase tracking-widest mt-2 block">
                    Test Related
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assign Expert</span>
                  <select
                    className="border border-slate-200 px-2 py-1.5 text-[10px] font-bold text-gray-700 outline-none w-full bg-white rounded-lg cursor-pointer"
                    value={d.assignedInstructor?._id || ""}
                    onChange={(e) => handleAssign(d._id, e.target.value)}
                    disabled={d.status === 'answered'}
                  >
                    <option value="">Select Instructor</option>
                    {instructors?.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.firstname} {i.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="shrink-0 self-end mb-1">
                  <button 
                    onClick={() => openDoubtDetails(d)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm shadow-blue-200"
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* We removed the extra closing div here to keep pagination inside the white box */}

        {/* PAGINATION CONTROLS */}
        {adminDoubts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-0 bg-white border-t border-slate-100 p-4 shadow-sm">
            <div className="text-[10px] font-black text-[#7e7e7e] uppercase tracking-widest font-poppins">
              Showing <span className="text-[#3e4954]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-[#3e4954]">{Math.min(currentPage * ITEMS_PER_PAGE, adminDoubts.length)}</span> of <span className="text-[#21b731]">{adminDoubts.length}</span> results
            </div>
            
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-10 h-10 flex items-center justify-center border border-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-[#3e4954] transition-all"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 text-[11px] font-black transition-all border ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-[#3e4954]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 || 
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-slate-300 font-bold">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-10 h-10 flex items-center justify-center border border-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-[#3e4954] transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* DOUBT DETAILS MODAL - Fixed Top Cut-Off & Alignment */}
      <AnimatePresence>
        {isModalOpen && selectedDoubt && (
          <div className="fixed inset-0 z-[999999] flex items-start justify-center p-4 overflow-y-auto pt-24">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDoubtDetails}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1]"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-200 flex flex-col mb-8 overflow-hidden"
              style={{ zIndex: 1000000 }}
            >
              {/* Header - Neat & Compact */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white flex-shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Doubt Details</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Ref: #{selectedDoubt._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={closeDoubtDetails}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-rose-500 transition-all border border-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                {/* Info Cards */}
                <div className="space-y-6">
                  {/* Participant Bar */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Student</span>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedDoubt.student?.firstname} {selectedDoubt.student?.lastname}</p>
                      <p className="text-[10px] font-bold text-slate-500 lowercase">{selectedDoubt.student?.email}</p>
                    </div>
                    <div className="text-right space-y-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Subject</span>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 inline-block">{selectedDoubt.subject}</span>
                    </div>
                  </div>

                  {/* Date/Status Banner */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full animate-pulse ${selectedDoubt.status === 'answered' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Status: {selectedDoubt.status}</span>
                    </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <Calendar size={12} /> Submitted: {new Date(selectedDoubt.createdAt).toLocaleDateString()}
                     </p>
                  </div>

                  {/* Query Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-4 bg-slate-900 rounded-full" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Question</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 shadow-sm transition-hover hover:border-slate-200">
                      <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">
                        "{selectedDoubt.text}"
                      </p>
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                       <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Instructor Assignment</span>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                          {selectedDoubt.assignedInstructor?.firstname?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">
                            {selectedDoubt.assignedInstructor ? `${selectedDoubt.assignedInstructor.firstname} ${selectedDoubt.assignedInstructor.lastname}` : 'Unassigned'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selectedDoubt.assignedInstructor ? 'Subject Expert' : 'Pending Assignment'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
                         {selectedDoubt.assignedInstructor ? (
                           <span className="text-[10px] font-black text-blue-600 flex items-center gap-1.5 uppercase tracking-widest">
                             <ShieldCheck size={14} /> Assigned
                           </span>
                         ) : (
                           <span className="text-[10px] font-black text-rose-500 uppercase">Wait</span>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Final Solution */}
                  {selectedDoubt.status === 'answered' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                         <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Instructor's Answer</span>
                      </div>
                      <div className="bg-emerald-50/30 rounded-2xl p-5 border border-emerald-100/50">
                        <p className="text-sm font-bold text-emerald-950 leading-relaxed whitespace-pre-wrap">
                          {selectedDoubt.answer}
                        </p>
                        <div className="mt-4 pt-3 border-t border-emerald-100/50 flex justify-end">
                           <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic opacity-70">
                             Solved on {new Date(selectedDoubt.answeredAt).toLocaleString()}
                           </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 flex-shrink-0">
                <button 
                  onClick={closeDoubtDetails}
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDoubts;