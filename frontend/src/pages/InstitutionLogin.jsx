import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  Building2,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import signupIllustration from "../assets/Gemini_Generated_Image_6fv81j6fv81j6fv8 (1).png";
import toast from "react-hot-toast";

const InputField = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  isPass,
  showPass,
  togglePass,
}) => (
  <div className="relative w-full mb-4 group">
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl
                   text-slate-800 placeholder-slate-400 font-medium
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 
                   outline-none transition-all duration-300 text-xs shadow-sm"
      />

      {isPass && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-slate-300 hover:text-indigo-600 transition-colors"
          onClick={togglePass}
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

const InstitutionLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Credentials required");
    try {
      setLoading(true);
      const result = await api.post("/api/auth/login", { email, password });
      
      if (result.data.role !== 'institution') {
        toast.error("Access denied. Use student login.");
        return;
      }

      dispatch(setUserData(result.data));
      toast.success("Institution Dashboard Access!");
      navigate('/institution-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#96D0F3FF] flex items-center justify-center p-0 md:p-8 lg:p-12">
      <motion.div 
        layout
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ 
          layout: { duration: 8, ease: [0.25, 1, 0.5, 1] }
        }}
        className="w-full max-w-[1240px] h-[100dvh] md:h-full md:max-h-[900px] bg-white md:rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        
        <motion.div 
          layoutId="auth-form-column"
          className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 lg:p-10 bg-white overflow-y-auto relative z-20"
        >
          <div className="w-full max-w-[400px] flex flex-col">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
                <img 
                  src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
                  alt="Mye3 Logo" 
                  className="h-14 w-auto object-contain"
                />
            </div>

            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-lg mb-2">
                    <Building2 className="text-indigo-600" size={20} />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-1">
                    Institution Portal
                  </h2>
                  <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                    Manage your students and tests with ease
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <InputField
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    isPass
                    showPass={showPass}
                    togglePass={() => setShowPass(!showPass)}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-6"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                  </button>


                  <div className="flex justify-between items-center px-1 mt-6">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <ArrowLeft size={14} /> Back to Student Login
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN - HERO */}
        <motion.div 
          layoutId="auth-hero-column"
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A23]"
        >
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-indigo-900/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 lg:p-12 text-center text-white">
            <div className="relative w-full flex-1 flex items-center justify-center animate-float">
               <img
                 src={signupIllustration}
                 alt="Institution Portal"
                 className="max-w-[75%] max-h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
               />
            </div>
            
            <div className="mt-4">
               <h3 className="text-xl lg:text-3xl font-black tracking-tight uppercase text-white drop-shadow-lg">
                 Partner Portal <br /> <span className="text-indigo-400">Excellence</span>
               </h3>
               <div className="w-12 h-1 bg-indigo-500 mx-auto my-4 rounded-full"></div>
               <p className="text-slate-300 text-xs font-bold max-w-xs mx-auto tracking-wide leading-relaxed">
                 Streamline your educational operations with our advanced institution management suite.
               </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default InstitutionLogin;
