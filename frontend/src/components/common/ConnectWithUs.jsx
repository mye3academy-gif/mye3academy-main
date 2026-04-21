import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, MessageSquare, Handshake, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import illustration from '../../assets/Gemini_Generated_Image_a0kdwza0kdwza0kd (1).png';

const ConnectWithUs = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        role: 'student'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
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
            {/* FLOATING TRIGGER BUTTON */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-end">
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center bg-[#ff9d43] text-white py-3 px-4 rounded-l-2xl shadow-xl hover:bg-[#ff8a1d] transition-all duration-300"
                >
                    <div className="hidden group-hover:block mr-2 text-xs font-black uppercase tracking-widest animate-fadeIn">
                        Connect With Us
                    </div>
                    <Handshake size={20} className="group-hover:scale-110 transition-transform" />
                    
                    {/* Pulsing indicator */}
                    <span className="absolute -top-1 -left-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </button>
            </div>

            {/* MODAL OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: "-45%", x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, y: "-45%", x: "-50%" }}
                            className="fixed left-1/2 top-1/2 w-[95%] md:w-[400px] bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 flex justify-between items-center border-b border-slate-50">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    Connect With Us
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Enter Your Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#ff9d43] focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-shrink-0 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-500 py-3">
                                            IN +91 <ChevronDown size={14} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Enter Mobile Number"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#ff9d43] focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Role Radio Buttons */}
                                <div className="flex items-center gap-6 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={formData.role === 'parents'}
                                            onChange={() => setFormData({ ...formData, role: 'parents' })}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.role === 'parents' ? 'border-[#ff9d43]' : 'border-slate-200'}`}>
                                            {formData.role === 'parents' && <div className="w-2.5 h-2.5 rounded-full bg-[#ff9d43]" />}
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${formData.role === 'parents' ? 'text-slate-700' : 'text-slate-400'}`}>Parents</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={formData.role === 'student'}
                                            onChange={() => setFormData({ ...formData, role: 'student' })}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.role === 'student' ? 'border-[#ff9d43]' : 'border-slate-200'}`}>
                                            {formData.role === 'student' && <div className="w-2.5 h-2.5 rounded-full bg-[#ff9d43]" />}
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${formData.role === 'student' ? 'text-slate-700' : 'text-slate-400'}`}>Student</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#ff9d43] hover:bg-[#ff8a1d] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-100 transition-all uppercase tracking-widest text-sm active:scale-95"
                                >
                                    Connect
                                </button>
                            </form>

                            {/* Footer Illustration */}
                            <div className="bg-slate-50 pt-2 pb-6 px-10">
                                <img src={illustration} alt="Illustration" className="w-full h-auto object-contain mix-blend-multiply" />
                                <div className="mt-4 flex items-center justify-center gap-2 text-slate-800">
                                    <Phone size={16} className="text-[#ff9d43]" />
                                    <span className="text-sm font-black tracking-tight">+91 99126 71666</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default ConnectWithUs;
