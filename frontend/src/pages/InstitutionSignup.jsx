import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Building2,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  Smartphone,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { setUserData } from "../redux/userSlice";
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
  <div className="relative w-full mb-3 group">
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
          onClick={togglePass}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10 text-slate-300 hover:text-indigo-600 transition-colors"
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  </div>
);

const InstitutionSignup = () => {
  const [formData, setFormData] = useState({
    firstname: "", // Treated as Admin/Contact person name
    lastname: "",  // Treated as Institution Name
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSignUp = async () => {
    if (!formData.email || !formData.password)
      return toast.error("Details missing");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords don't match");

    try {
      setLoading(true);
      toast.loading("Sending Verification code...", { id: "otp-loading" }); 
      await api.post("/api/auth/signup", { ...formData, role: "institution" });
      toast.dismiss("otp-loading");
      toast.success("Verification code sent to email!");
      setStep(2);
    } catch (error) {
      toast.dismiss("otp-loading");
      toast.error(error.response?.data?.message || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    try {
      setLoading(true);
      const result = await api.post("/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      dispatch(setUserData(result.data.user));
      toast.success("Institution Account Verified!");
      navigate("/institution-dashboard");
    } catch (error) {
      toast.error("Verification Failed");
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
        className="w-full max-w-[1240px] h-screen md:h-full md:max-h-[900px] bg-white md:rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row-reverse overflow-hidden"
      >
        
        <motion.div 
          layoutId="auth-form-column"
          className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 lg:p-10 bg-white overflow-y-auto relative z-20"
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
                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-lg mb-2">
                       <Building2 className="text-indigo-600" size={20} />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-1">
                      Institution Registration
                    </h2>
                    <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                      Empower your faculty with elite testing tools
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-1">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} />
                      <InputField id="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} />
                    </div>

                    <InputField
                      id="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                    />

                    <InputField
                      id="phoneNumber"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        id="password"
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        isPass
                        showPass={showPass}
                        togglePass={() => setShowPass(!showPass)}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <InputField
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-6"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
                    </button>


                    <p className="text-center mt-6 text-slate-400 font-bold text-[10px] tracking-tight">
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/institution-login")}
                        className="text-indigo-600 font-black hover:underline underline-offset-4"
                      >
                        Portal Login
                      </button>
                    </p>
                  </form>
                </>
              ) : (
                /* OTP VERIFICATION VIEW */
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                      Verify <br />
                      <span className="text-indigo-600">Institution</span>
                    </h2>
                    <p className="text-slate-400 font-medium tracking-tight">
                      Enter the security code sent to {formData.email}
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-6">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full py-4 text-center text-2xl font-black tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl text-indigo-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                      placeholder="000000"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-slate-900 text-white rounded-xl font-black transition-all active:scale-[0.98] flex justify-center items-center shadow-lg"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Complete Setup"}
                    </button>

                    <div className="flex justify-between items-center px-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ArrowLeft size={14} /> Back
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
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A23]"
        >
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 lg:p-12 text-white">
            <div className="relative w-full flex-1 flex items-center justify-center animate-float">
               <img
                 src={signupIllustration}
                 alt="Institution Registration"
                 className="max-w-[80%] max-h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
               />
            </div>
            
            <div className="-mt-6 text-center">
               <h3 className="text-xl lg:text-3xl font-black tracking-tight uppercase text-white drop-shadow-lg">
                 Scale Your <span className="text-indigo-400">Impact</span>
               </h3>
               <div className="w-12 h-1 bg-white/20 mx-auto my-4 rounded-full"></div>
               <p className="text-slate-300 text-xs font-bold max-w-xs mx-auto tracking-wide leading-relaxed">
                 Join our partner network and provide world-class mock tests to your entire student base.
               </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default InstitutionSignup;
