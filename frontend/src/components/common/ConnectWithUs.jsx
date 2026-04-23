import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ChevronDown, Handshake, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import illustration from '../../assets/Gemini_Generated_Image_a0kdwza0kdwza0kd (1).png';

const ConnectWithUs = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [formData, setFormData] = useState({ name: '', mobile: '', role: 'student' });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.mobile) {
            toast.error("Please fill all required fields");
            return;
        }
        toast.success(`Thank you ${formData.name}! We will connect with you shortly.`);
        setIsOpen(false);
        setFormData({ name: '', mobile: '', role: 'student' });
    };

    return (
        <>
            {/* Floating Trigger */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60]">
                <button 
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center bg-[#ff9d43] text-white py-2.5 px-3 md:py-3 md:px-4 rounded-l-2xl shadow-xl hover:bg-[#ff8a1d] transition-all duration-300"
                >
                    <div className="hidden group-hover:block mr-2 text-xs font-black uppercase tracking-widest">Connect With Us</div>
                    <Handshake size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -left-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100]" 
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={isMobile ? { y: "100%" } : { opacity: 0, y: 20 }}
                            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
                            exit={isMobile ? { y: "100%" } : { opacity: 0, y: 20 }}
                            transition={isMobile ? { type: "spring", damping: 25, stiffness: 200 } : { duration: 0.3 }}
                            className={`bg-white z-[110] shadow-2xl overflow-hidden
                                ${isMobile
                                    ? 'fixed inset-x-0 bottom-0 rounded-t-[32px] flex flex-col h-screen'
                                    : 'fixed inset-0 flex flex-row'
                                }`}
                        >
                            {/* MOBILE: Drag Handle */}
                            {isMobile && (
                                <div className="flex justify-center pt-4 pb-1 shrink-0">
                                    <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                                </div>
                            )}

                            {/* MOBILE: Close Buttons Row */}
                            <div className={`${isMobile ? 'flex justify-between items-center px-4 py-2 border-b border-slate-50' : 'hidden'}`}>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                    <ArrowLeft size={20} />
                                </button>
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Connect</h3>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* DESKTOP: Left Panel (Full Screen) */}
                            {!isMobile && (
                                <div className="w-[45%] bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex flex-col items-center justify-center p-12 shrink-0 relative">
                                    {/* Desktop Close Button (Floating) */}
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm group"
                                    >
                                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <img src={illustration} alt="Connect" className="w-full max-w-sm object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] mb-12 animate-float" />
                                    
                                    <div className="max-w-md text-center">
                                        <h2 className="text-4xl font-black text-white leading-tight mb-4 uppercase tracking-tighter">
                                            Ready to Start Your Journey?
                                        </h2>
                                        <p className="text-orange-50 text-lg font-medium leading-relaxed mb-8 opacity-90">
                                            Our counselors are waiting to guide you to your dream career. Let's talk!
                                        </p>
                                        
                                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                                            <div className="w-10 h-10 bg-[#ff9d43] rounded-full flex items-center justify-center shadow-lg">
                                                <Phone size={20} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest leading-none mb-1">Direct Hotline</p>
                                                <p className="text-lg font-black text-white tracking-tight leading-none">+91 99126 71666</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* RIGHT PANEL (Desktop) / FORM AREA (Mobile) */}
                            <div className={`flex-1 ${!isMobile ? 'overflow-y-auto flex flex-col justify-center bg-white relative' : 'px-5 py-2 overflow-hidden flex flex-col justify-center'}`}>
                                <div className={`w-full ${!isMobile ? 'max-w-lg mx-auto p-12' : 'max-w-md mx-auto'}`}>
                                    <div className={`${isMobile ? 'mb-1' : 'mb-8'}`}>
                                        <h4 className={`${isMobile ? 'text-base' : 'text-2xl'} font-black text-slate-800 uppercase tracking-tighter mb-0`}>Get in Touch</h4>
                                        <p className="text-slate-500 font-bold text-[9px]">We typically respond within 15 minutes.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-2' : 'space-y-6'}`}>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">
                                                Full Name <span className="text-[#ff9d43]">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Rahul Sharma" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl ${isMobile ? 'py-2 px-4 text-sm' : 'py-4 px-6 text-base'} font-bold text-slate-700 focus:ring-4 focus:ring-orange-50 focus:border-[#ff9d43] outline-none transition-all placeholder:text-slate-300`} 
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">
                                                Mobile Number <span className="text-[#ff9d43]">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 text-xs font-black text-slate-500">
                                                    IN +91 <ChevronDown size={12} />
                                                </div>
                                                <input 
                                                    type="tel" 
                                                    placeholder="10-digit number" 
                                                    value={formData.mobile}
                                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                    className={`flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl ${isMobile ? 'py-2 px-4 text-sm' : 'py-4 px-6 text-base'} font-bold text-slate-700 focus:ring-4 focus:ring-orange-50 focus:border-[#ff9d43] outline-none transition-all placeholder:text-slate-300`} 
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">
                                                I am a <span className="text-[#ff9d43]">*</span>
                                            </label>
                                            <div className="flex gap-2.5">
                                                {['parents', 'student'].map((r) => (
                                                    <label 
                                                        key={r} 
                                                        className={`flex-1 flex items-center justify-center gap-2 ${isMobile ? 'py-2.5' : 'py-4'} border-2 rounded-xl cursor-pointer transition-all ${formData.role === r ? 'bg-orange-50 border-[#ff9d43] text-[#ff9d43]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                    >
                                                        <input type="radio" name="role" checked={formData.role === r}
                                                            onChange={() => setFormData({ ...formData, role: r })} className="hidden" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <button 
                                            type="submit"
                                            className={`w-full bg-[#ff9d43] hover:bg-[#ff8a1d] text-white font-black ${isMobile ? 'py-3.5' : 'py-5'} rounded-xl shadow-lg shadow-orange-100 transition-all uppercase tracking-[0.2em] text-xs active:scale-[0.98] mt-1.5`}
                                        >
                                            Connect Now
                                        </button>
                                    </form>

                                    {/* MOBILE ONLY Footer */}
                                    {isMobile && (
                                        <div className="mt-2 pt-2 border-t border-slate-50 text-center space-y-1">
                                            <img src={illustration} alt="Connect" className="w-36 h-auto mx-auto object-contain mix-blend-multiply opacity-80" />
                                            <div className="inline-flex items-center gap-2 text-slate-700">
                                                <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center">
                                                    <Phone size={10} className="text-[#ff9d43]" />
                                                </div>
                                                <span className="text-[10px] font-black tracking-tight">+91 99126 71666</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};

export default ConnectWithUs;
