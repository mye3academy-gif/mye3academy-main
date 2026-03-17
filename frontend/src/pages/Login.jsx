import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import googleImg from "../assets/google.png";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import loginIllustration from "../assets/Gemini_Generated_Image_a0kdwza0kdwza0kd (1).png";
import toast from "react-hot-toast";

const InputField = ({
  id,
  type,
  placeholder,
  label,
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
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const googleData = {
        firstname: user.displayName?.split(" ")[0] || "User",
        lastname: user.displayName?.split(" ")[1] || "",
        email: user.email,
        avatar: user.photoURL,
      };
      const res = await api.post("/api/auth/google", googleData);
      dispatch(setUserData(res.data));
      toast.success("Signed in successfully!");
      
      const role = res.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'institution') navigate('/institution-dashboard');
      else if (role === 'instructor') navigate('/instructor-dashboard');
      else navigate('/');
    } catch (err) {
      toast.error("Google connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Credentials required");
    try {
      setLoading(true);
      const result = await api.post("/api/auth/login", { email, password });
      dispatch(setUserData(result.data));
      toast.success("Welcome back!");
      
      const role = result.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'institution') navigate('/institution-dashboard');
      else if (role === 'instructor') navigate('/instructor-dashboard');
      else navigate('/');
    } catch (error) {
      if (error.response?.status === 403) {
        toast("Verification needed. Check email.");
        try {
          await api.post("/api/auth/resend-otp", { email });
        } catch (resendError) {
          console.error("Resend OTP error:", resendError);
          // Optional: toast.error("Verification email could not be sent. Please try again later.");
        }
        setStep(2);
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Invalid OTP format");
    try {
      setLoading(true);
      const result = await api.post("/api/auth/verify-otp", { email, otp });
      dispatch(setUserData(result.data.user));
      toast.success("Email verified!");
      navigate("/");
    } catch (error) {
      toast.error("Wrong OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#96D0F3FF] flex items-center justify-center p-0 md:p-8 lg:p-12">
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
          className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 lg:p-10 bg-white relative z-20 overflow-y-auto lg:overflow-hidden custom-scrollbar"
        >
          <div className="w-full max-w-[400px] flex flex-col">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
                <img 
                  src={`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`} 
                  alt="Mye3 Logo" 
                  className="h-14 w-auto object-contain"
                />
            </div>


            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              {step === 1 ? (
                <>
                <div className="mb-4 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                    Hey, welcome back up to your special place
                  </p>
                </div>

                  <form onSubmit={handleLogin} className="space-y-2">
                    <InputField
                      id="email"
                      type="email"
                      placeholder="Username or email"
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

                    <div className="flex items-center justify-between mb-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}
                             onClick={() => setRememberMe(!rememberMe)}>
                          {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/forget-password")}
                        className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                  </button>

                  <p className="text-center mt-4 text-slate-400 font-bold text-[10px] tracking-tight">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-indigo-600 font-black hover:underline underline-offset-4"
                    >
                      Sign Up
                    </button>
                  </p>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/institution-login")}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 tracking-wider uppercase underline underline-offset-4 transition-all"
                    >
                      SIGN IN AS INSTITUTION
                    </button>
                  </div>
                </form>

                </>
              ) : (
                /* OTP VERIFICATION VIEW */
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                      Verify Your <br />
                      <span className="text-emerald-600">Email</span>
                    </h2>
                    <p className="text-slate-400 font-medium tracking-tight">
                      Enter the code sent to {email}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full py-4 text-center text-2xl font-black tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                      placeholder="000000"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-slate-900 text-white rounded-xl font-black transition-all active:scale-[0.98] flex justify-center items-center shadow-lg"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
                    </button>

                    <div className="flex justify-between items-center px-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => api.post("/api/auth/resend-otp", { email })}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN - HERO */}
        <motion.div 
          layoutId="auth-hero-column"
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#5959E0FF]"
        >
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 lg:p-12">
            <div className="relative w-full flex-1 flex items-center justify-center animate-float overflow-hidden">
               <img
                 src={loginIllustration}
                 alt="Login Illustration"
                 className="max-w-full max-h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)]"
               />
            </div>
            
            <div className="mt-2 text-center">
               <h3 className="text-xl lg:text-2xl font-black tracking-[0.05em] uppercase text-white drop-shadow-lg">
                 Access Your <span className="text-purple-200">Potential</span>
               </h3>
               <div className="w-8 h-1 bg-white/20 mx-auto my-2 rounded-full"></div>
               <p className="text-indigo-100/80 text-[10px] font-bold max-w-xs mx-auto tracking-wide">
                 Join thousands of students on their path to excellence.
               </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
        </motion.div>

      </motion.div>
    </div>
  );
};


export default Login;
