import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { Bell, Send, Trash2, Info, Briefcase, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ManageNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "general",
        link: ""
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/api/admin/notifications/all");
            setNotifications(res.data.notifications);
        } catch (err) {
            toast.error("Failed to load notifications");
        } finally {
            setFetching(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return toast.error("Fill all required fields");

        setLoading(true);
        try {
            await api.post("/api/admin/notifications/send", formData);
            toast.success("Notification sent successfully!");
            setFormData({ title: "", message: "", type: "general", link: "" });
            fetchNotifications();
        } catch (err) {
            toast.error("Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await api.delete(`/api/admin/notifications/${id}`);
            toast.success("Deleted");
            fetchNotifications();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "job": return <Briefcase size={16} className="text-emerald-500" />;
            case "urgent": return <AlertCircle size={16} className="text-rose-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="p-6 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 bg-[#5654F7] flex items-center justify-center rounded-2xl shadow-lg shadow-blue-100">
                    <Bell className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Notification Center</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Broadcast Real-time Alerts to Students</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CREATE NOTIFICATION FORM */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Send size={16} className="text-[#5654F7]" /> New Notification
                        </h3>
                        
                        <form onSubmit={handleSend} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., New Job Alert: Software Engineer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Message *</label>
                                <textarea
                                    rows="4"
                                    placeholder="Write your message here..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                                    >
                                        <option value="general">General</option>
                                        <option value="job">Job Alert</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="result">Result Update</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">External Link</label>
                                    <input
                                        type="url"
                                        placeholder="Optional Link"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#5654F7] hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {loading ? "Broadcasting..." : "Broadcast Now"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* NOTIFICATIONS LIST */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={16} className="text-[#5654F7]" /> Recent History
                            </h3>
                            <span className="text-[10px] font-black text-slate-400">{notifications.length} Total</span>
                        </div>

                        <div className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {notifications.map((n) => (
                                    <motion.div
                                        key={n._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="p-5 hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800 tracking-tight">{n.title}</h4>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                            {new Date(n.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(n._id)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{n.message}</p>
                                                {n.link && (
                                                    <a 
                                                        href={n.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                                    >
                                                        View Related Link →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {notifications.length === 0 && !fetching && (
                                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                                    <Bell size={48} className="opacity-10 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No notifications sent yet</p>
                                </div>
                            )}

                            {fetching && (
                                <div className="flex justify-center py-24">
                                    <div className="w-8 h-8 border-4 border-[#5654F7] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageNotifications;
