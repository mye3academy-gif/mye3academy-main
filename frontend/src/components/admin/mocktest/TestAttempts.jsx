import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft, User, Clock, Target, Calendar, ChevronRight, Search } from "lucide-react";
import { ClipLoader } from "react-spinners";

const BASE_URL = import.meta.env.VITE_SERVER_URL || "";
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const TestAttempts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testTitle, setTestTitle] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch attempts and test details
                const [attemptsRes, testRes] = await Promise.all([
                    api.get(`/api/admin/mocktests/${id}/attempts`),
                    api.get(`/api/admin/mocktests/${id}`)
                ]);
                setAttempts(attemptsRes.data.attempts || []);
                setTestTitle(testRes.data.title || "Unknown Test");
            } catch (error) {
                console.error("Failed to load attempts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredAttempts = attempts.filter(att => 
        (att.studentId?.firstname + " " + att.studentId?.lastname).toLowerCase().includes(search.toLowerCase()) ||
        att.studentId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <ClipLoader color="#4f46e5" size={50} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <button 
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Test Performance: <span className="text-indigo-600">{testTitle}</span>
                </h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                    Real-time attempt monitoring and result tracking
                </p>
            </div>

            <div className="bg-white border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <span>Total Attempts: <span className="text-indigo-600">{attempts.length}</span></span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Student</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Attempt Date</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Score</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Accuracy</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAttempts.length > 0 ? filteredAttempts.map((att) => (
                                <tr key={att._id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {att.studentId?.avatar ? (
                                                <img 
                                                    src={getImageUrl(att.studentId.avatar)} 
                                                    alt="avatar" 
                                                    className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-black text-sm text-slate-800">{att.studentId?.firstname} {att.studentId?.lastname}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{att.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                                <Calendar size={12} className="text-slate-300" />
                                                {new Date(att.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <Clock size={12} className="text-slate-300" />
                                                {new Date(att.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-[0.2em] border ${
                                            att.status === 'completed' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {att.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-indigo-600">{att.score || 0}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Target size={14} className="text-slate-300" />
                                            <span className="text-sm font-black text-slate-700">{att.correctCount || 0} Correct</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link 
                                            to={`/student/review/${att._id}`}
                                            className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-all hover:translate-x-1"
                                        >
                                            View Report
                                            <ChevronRight size={14} strokeWidth={3} />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No attempts found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TestAttempts;
