import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInstructorDoubts,
  answerInstructorDoubt,
} from "../../redux/doubtSlice";
import { getSocket } from "../../socket";
import toast from "react-hot-toast";
import {
  Send,
  Clock,
  User,
  MessageCircle,
  FileText,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

// Helper to resolve Image URLs
const BASE_URL = import.meta.env.VITE_SERVER_URL || "";
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
};

const InstructorDoubts = () => {
  const dispatch = useDispatch();
  const { instructorDoubts } = useSelector((state) => state.doubts);
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState("pending");

  useEffect(() => {
    dispatch(fetchInstructorDoubts());

    const socket = getSocket();
    if (socket) {
      socket.on("doubtAssigned", () => {
        toast("New doubt assigned to you!", {
          icon: "📝",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
          },
        });
        dispatch(fetchInstructorDoubts());
      });
      return () => socket.off("doubtAssigned");
    }
  }, [dispatch]);

  const handleAnswer = (id) => {
    if (!answers[id]?.trim()) return toast.error("Answer cannot be empty");
    dispatch(answerInstructorDoubt({ id, answer: answers[id] }));
    setAnswers((prev) => ({ ...prev, [id]: "" }));
  };

  const pendingDoubts = instructorDoubts.filter((d) => d.status !== "answered");
  const answeredDoubts = instructorDoubts.filter((d) => d.status === "answered");

  return (
    <div className="p-3 md:p-8 bg-slate-50 min-h-[calc(100vh-90px)]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
              Doubt Portal
            </h1>
            <p className="text-indigo-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] mt-3 opacity-60">
              Assigned Resolution Center
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mx-auto md:mx-0">
            <button
              onClick={() => setView("pending")}
              className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition ${
                view === "pending"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Pending ({pendingDoubts.length})
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-4 md:px-6 py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition ${
                view === "history"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              History ({answeredDoubts.length})
            </button>
          </div>
        </header>

        {view === "pending" ? (
          <div className="space-y-8">
            {pendingDoubts.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row animate-in slide-in-from-bottom duration-500"
              >
                {/* CONTEXT AREA */}
                <div className="lg:w-3/5 p-5 md:p-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[8px] uppercase tracking-widest border border-indigo-100">
                        {d.subject}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-black text-[8px] uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        <Clock size={10} className="text-orange-400" /> 
                        {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-tight">
                          {d.student?.firstname} {d.student?.lastname}
                        </p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Identified Student
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                        <User size={14} />
                      </div>
                    </div>
                  </div>

                  {d.questionId && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" /> Reference Material
                      </h4>
                      <p className="text-slate-700 font-bold text-sm leading-relaxed mb-4 italic text-balance">
                        "{d.questionId.title}"
                      </p>
                      {d.questionId.questionImageUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm p-1 inline-block">
                          <img
                            src={getImageUrl(d.questionId.questionImageUrl)}
                            alt="Reference"
                            className="max-h-56 object-contain rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <MessageCircle
                      size={32}
                      className="absolute -top-4 -left-4 text-indigo-100/50 -z-10"
                    />
                    <h4 className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">
                      Student Inquiry
                    </h4>
                    <p className="text-slate-900 text-lg md:text-2xl font-black leading-tight tracking-tight">
                      {d.text}
                    </p>
                  </div>
                </div>

                {/* ACTION AREA */}
                <div className="lg:w-2/5 p-8 md:p-10 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center">
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block pl-2">
                      Your Resolution
                    </label>
                    <textarea
                      className="w-full bg-white border-2 border-slate-100 rounded-3xl p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 focus:outline-none transition-all shadow-inner placeholder:text-slate-300 min-h-[180px]"
                      placeholder="Explain the logic, mention steps, provide a clear path to the solution..."
                      value={answers[d._id] || ""}
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, [d._id]: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    onClick={() => handleAnswer(d._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                  >
                    <Send size={16} /> Propagate Answer
                  </button>
                </div>
              </div>
            ))}

            {pendingDoubts.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-400 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <ShieldCheck size={48} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                  Clear Skies
                </h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                  All assigned doubts have been resolved.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {answeredDoubts.map((d) => (
              <div
                key={d._id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full font-black text-[8px] uppercase tracking-widest">
                    {d.subject}
                  </span>
                  <span className="text-emerald-500 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Resolved
                  </span>
                </div>
                <p className="text-slate-800 font-black mb-3 line-clamp-2 uppercase tracking-tight text-sm italic">
                  Q: {d.text}
                </p>
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                    " {d.answer} "
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDoubts;
