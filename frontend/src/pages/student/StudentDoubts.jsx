import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentDoubts, createStudentDoubt } from "../../redux/doubtSlice";
import { fetchPerformanceHistory } from "../../redux/studentSlice";
import { getSocket } from "../../socket";
import { MessageCircle, Plus, Filter, CheckCircle, Clock, Loader2, X, Send, BookOpen, AlertCircle, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

const StudentDoubts = () => {
  const dispatch = useDispatch();
  const { myDoubts, myStatus } = useSelector((state) => state.doubts);
  const { attemptsHistory, attemptsHistoryStatus } = useSelector((state) => state.students);
  
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Multi-step Modal State
  const [modalStep, setModalStep] = useState(1); // 1: Type, 2: Select Test (if needed), 3: Form
  const [queryType, setQueryType] = useState(null); // 'general' | 'test'
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Form State
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentDoubts());
    if (attemptsHistoryStatus === 'idle') {
      dispatch(fetchPerformanceHistory());
    }
  }, [dispatch, attemptsHistoryStatus]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => {
      toast.success("An instructor answered your doubt!");
      dispatch(fetchStudentDoubts());
    };
    socket.on("doubtAnswered", handler);
    return () => socket.off("doubtAnswered", handler);
  }, [dispatch]);

  const resetModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
    setQueryType(null);
    setSelectedTest(null);
    setSubject("");
    setQuery("");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalStep(1);
  };

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!subject || !query) return toast.error("Please fill all fields");
    
    setIsSubmitting(true);
    const doubtData = {
      type: queryType,
      subject: subject,
      text: query,
      ...(selectedTest && { mocktestId: selectedTest.mocktestId?._id || selectedTest.mocktestId })
    };

    const result = await dispatch(createStudentDoubt(doubtData));
    setIsSubmitting(false);

    if (createStudentDoubt.fulfilled.match(result)) {
      resetModal();
      toast.success("Query submitted successfully!");
    }
  };

  const filteredDoubts = myDoubts.filter(d => {
    if (filter === "answered") return d.status === "answered";
    if (filter === "pending") return d.status !== "answered";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Doubt Solutions</h1>
            <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest sm:tracking-[2px] mt-0.5">Query Center</p>
          </div>
        </div>
        <button 
          onClick={handleOpenModal}
          className="group relative bg-slate-900 border border-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 overflow-hidden transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
          <Plus size={16} /> Ask a Query
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-100 w-full sm:w-fit mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Queries', icon: Filter },
          { id: 'pending', label: 'Unresolved', icon: Clock },
          { id: 'answered', label: 'Resolved', icon: CheckCircle }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${filter === f.id ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <f.icon size={12} strokeWidth={3} />
            {f.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {myStatus === "loading" ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>
      ) : filteredDoubts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <MessageCircle className="text-slate-200" size={32} />
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No queries found</p>
          <p className="text-slate-300 text-xs mt-1">Start by asking your first academic doubt today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredDoubts.map((doubt) => (
            <div key={doubt._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">
                      {doubt.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Clock size={11} /> {new Date(doubt.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[2px] shadow-sm
                    ${doubt.status === 'answered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}
                  `}>
                    {doubt.status === 'answered' ? <CheckCircle size={10} strokeWidth={3}/> : <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                    {doubt.status === 'answered' ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                
                <h3 className="text-slate-800 font-bold text-sm sm:text-[15px] leading-relaxed group-hover:text-blue-600 transition-colors">
                  {doubt.text}
                </h3>
                
                {doubt.mocktestId && (
                  <div className="mt-4 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100/50 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference:</span>
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-xs uppercase">{doubt.mocktestId.title || "Selected Test"}</span>
                  </div>
                )}
              </div>

              {/* Answer Section */}
              {doubt.answer && (
                <div className="bg-emerald-50/30 border-t border-emerald-100/50 p-4 md:p-6 relative">
                  <div className="absolute top-0 left-6 w-px h-full bg-emerald-100" />
                  <div className="flex gap-4 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                      <CheckCircle size={12} strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Academic Feedback</p>
                        <span className="text-[9px] font-bold text-slate-400 opacity-60">
                          {new Date(doubt.answeredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium italic">"{doubt.answer}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MULTI-STEP MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {modalStep > 1 && (
                      <button 
                        onClick={() => setModalStep(prev => prev - 1)}
                        className="p-1 px-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                      >
                        <ChevronLeft size={14} strokeWidth={3} /> Back
                      </button>
                    )}
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[3px] bg-blue-50 px-2 py-0.5 rounded">Step {modalStep} of {queryType === 'test' ? 3 : 2}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                    {modalStep === 1 ? "Select Query Type" : modalStep === 2 && queryType === 'test' ? "Select Test Attempt" : "Doubt Details"}
                  </h2>
                </div>
                <button onClick={resetModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Step 1: Query Type Selection */}
              {modalStep === 1 && (
                <div className="grid grid-cols-1 gap-4 py-4 animate-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={() => { setQueryType('test'); setModalStep(2); }}
                    className="flex items-center gap-5 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/30 transition-all text-left bg-white group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Query About a Test</p>
                      <p className="text-xs text-slate-400 font-bold">Ask about wrong questions or doubts from a previous test attempt.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setQueryType('general'); setModalStep(3); }}
                    className="flex items-center gap-5 p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left bg-white group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">General Doubt</p>
                      <p className="text-xs text-slate-400 font-bold">Academic questions not related to any specific test session.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2: Test Attempt Selection (Only for test-related) */}
              {modalStep === 2 && queryType === 'test' && (
                <div className="flex-1 overflow-y-auto pr-2 animate-in slide-in-from-right-4 duration-300 space-y-3 py-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Choose a previous attempt:</p>
                  {attemptsHistoryStatus === 'loading' ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                  ) : attemptsHistory.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs font-bold text-slate-400">No test attempts found.</p>
                      <button onClick={() => setQueryType('general')} className="text-blue-600 text-[10px] font-black uppercase mt-2">Open General Doubt Instead</button>
                    </div>
                  ) : (
                    attemptsHistory.map((att) => (
                      <button
                        key={att._id}
                        onClick={() => { setSelectedTest(att); setModalStep(3); }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-left bg-slate-50/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-8 rounded-full ${att.mocktestId?.isGrandTest ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase truncate max-w-[200px]">{att.mocktestId?.title || "Untitled Test"}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Score: {att.score} / {att.mocktestId?.totalMarks || '--'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(att.createdAt).toLocaleDateString()}</p>
                          <ChevronLeft className="rotate-180 text-slate-300 group-hover:text-blue-500 transition-colors" size={14} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Step 3: Form */}
              {modalStep === 3 && (
                <form onSubmit={handleSubmitDoubt} className="animate-in slide-in-from-right-4 duration-300 space-y-6 py-4 flex-1 overflow-y-auto pr-2">
                  {selectedTest && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-600" />
                        <div>
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Linked Test</p>
                          <p className="text-[10px] font-black text-blue-800 uppercase truncate max-w-[150px]">{selectedTest.mocktestId?.title}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setSelectedTest(null); setModalStep(2); }} className="text-[9px] font-black text-blue-600 uppercase border-b border-blue-200">Change</button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Category</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English Language</option>
                      <option value="Physics">Physics</option>
                      <option value="Reasoning">Logical Reasoning</option>
                      <option value="Aptitude">Numerical Aptitude</option>
                      <option value="GS">General Studies</option>
                      <option value="Other">Other Subjects</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {queryType === 'test' ? "Question Details (Question No, etc.)" : "Query Description"}
                    </label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 md:h-40 resize-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                      placeholder={queryType === 'test' ? "Example: Question 25 in Section B has a wrong key..." : "Describe your doubt in detail..."}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-white">
                    <button type="button" onClick={resetModal} className="flex-1 px-6 py-3.5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-[2] bg-slate-900 text-white rounded-xl py-3.5 font-black text-[10px] uppercase tracking-[3px] shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                      Submit Query
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDoubts;