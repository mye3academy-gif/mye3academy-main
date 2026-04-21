import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentNotifications } from '../../redux/studentSlice';
import { Bell, Briefcase, Info, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentNotifications = () => {
    const dispatch = useDispatch();
    const { notifications, notificationStatus } = useSelector((state) => state.students);

    useEffect(() => {
        dispatch(fetchStudentNotifications());
    }, [dispatch]);

    const getTypeIcon = (type) => {
        switch (type) {
            case "job": return <Briefcase size={20} className="text-emerald-500" />;
            case "urgent": return <AlertCircle size={20} className="text-rose-500" />;
            case "result": return <Clock size={20} className="text-amber-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "job": return "border-l-emerald-500 bg-emerald-50/30";
            case "urgent": return "border-l-rose-500 bg-rose-50/30";
            case "result": return "border-l-amber-500 bg-amber-50/30";
            default: return "border-l-blue-500 bg-blue-50/30";
        }
    };

    if (notificationStatus === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Checking for updates...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Job Notifications & Alerts</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stay updated with the latest opportunities and news</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl">
                    <Bell className="text-blue-600" size={24} />
                </div>
            </div>

            {notifications.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {notifications.map((n, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={n._id}
                            className={`p-6 rounded-3xl border border-slate-100 border-l-4 shadow-xl shadow-slate-200/40 transition-all hover:translate-x-1 ${getTypeColor(n.type)}`}
                        >
                            <div className="flex gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-slate-50">
                                    {getTypeIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{n.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            n.type === 'job' ? 'bg-emerald-100 text-emerald-700' :
                                            n.type === 'urgent' ? 'bg-rose-100 text-rose-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {n.type}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-3xl mb-4">{n.message}</p>
                                    
                                    {n.link && (
                                        <a
                                            href={n.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                        >
                                            View Details <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Bell className="text-slate-200" size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-300 uppercase tracking-[0.2em]">No Notifications Yet</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">Check back later for exciting job updates!</p>
                </div>
            )}
        </div>
    );
};

export default StudentNotifications;
