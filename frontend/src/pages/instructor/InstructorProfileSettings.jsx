import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// ✅ Import Instructor Actions
import {
  updateInstructorProfile,
  fetchInstructorProfile,
  clearInstructorStatus,
} from "../../redux/instructorSlice";
import { Camera, Save, Loader, Lock, User, Phone, Mail } from "lucide-react";

const InstructorProfileSettings = () => {
  const dispatch = useDispatch();

  // ✅ Get data from INSTRUCTOR store
  const {
    instructorProfile,
    profileLoading, // Make sure your slice has this or 'loading'
    profileStatus, // Make sure your slice uses this or 'status'
    profileError,
    profileSuccessMessage,
  } = useSelector((state) => state.instructors);

  // Local State for Form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(
    "https://via.placeholder.com/150?text=User",
  );
  const [avatarFile, setAvatarFile] = useState(null);

  // 1. Fetch Profile on Mount
  useEffect(() => {
    dispatch(fetchInstructorProfile());
  }, [dispatch]);

  // 2. Populate Form when data arrives
  useEffect(() => {
    if (instructorProfile) {
      setFormData((prev) => ({
        ...prev,
        firstName: instructorProfile.firstname || "",
        lastName: instructorProfile.lastname || "",
        phoneNumber: instructorProfile.phoneNumber || "",
        password: "",
        confirmPassword: "",
      }));

      if (instructorProfile.avatar) {
        // Ensure URL matches your backend
        setAvatarPreview(
          `import.meta.env.VITE_SERVER_URL/${instructorProfile.avatar.replace(/\\/g, "/")}`,
        );
      }
    }
  }, [instructorProfile]);

  // Handle Text Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const submitData = new FormData();
    submitData.append("firstName", formData.firstName);
    submitData.append("lastName", formData.lastName);
    submitData.append("phoneNumber", formData.phoneNumber);

    if (formData.password) submitData.append("password", formData.password);
    if (avatarFile) submitData.append("avatar", avatarFile);

    dispatch(updateInstructorProfile(submitData));
  };

  // Auto-clear messages
  useEffect(() => {
    if (profileStatus === "succeeded" || profileStatus === "failed") {
      const timer = setTimeout(() => dispatch(clearInstructorStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileStatus, dispatch]);

  // Show Loading Spinner
  if (profileLoading && !instructorProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-transparent w-full">
      <div className="max-w-5xl mx-auto pb-12 px-4">
        <header className="mb-6 text-center md:text-left pt-4">
          <h1 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
            Pro Profile
          </h1>
          <p className="text-indigo-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-2 opacity-60">
            Expert Metadata & Security
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Avatar Area */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover ring-8 ring-indigo-50 shadow-2xl transition group-hover:brightness-90"
                />
                <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-3 rounded-2xl cursor-pointer shadow-lg hover:bg-indigo-700 transition active:scale-90">
                  <Camera size={18} />
                  <input type="file" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <h3 className="mt-6 font-black text-slate-800 text-lg uppercase italic tracking-tight">Expert Identity</h3>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Platform Visual Representative</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
               <h4 className="font-black text-sm mb-1 relative z-10 italic uppercase tracking-widest">Instructor Status</h4>
               <p className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase relative z-10 opacity-80">
                 Verified Educator
               </p>
            </div>
          </div>

          {/* Form Fields Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-2">First Mention</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-xl pl-11 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-2">Surname</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                      placeholder="Doe"
                    />
                  </div>
               </div>

               <div className="space-y-1.5 mb-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-2">Sync Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                      type="email"
                      value={instructorProfile?.email || ""}
                      disabled
                      className="w-full bg-slate-100 border-none rounded-xl pl-11 py-3 text-slate-400 font-bold text-sm cursor-not-allowed italic"
                    />
                  </div>
               </div>

               <div className="space-y-1.5 mb-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-2">Mobile Terminal</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-none rounded-xl pl-11 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                      placeholder="+91 000-000-0000"
                    />
                  </div>
               </div>

               <hr className="my-6 border-slate-100" />

               <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 uppercase italic tracking-tigh">
                  <Lock size={16} className="text-indigo-600" /> Security Threshold
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-2">New Cipher</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-indigo-600 transition text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-2">Verify Cipher</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-indigo-600 transition text-sm font-bold"
                    />
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={profileStatus === "loading"}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50 text-[10px]"
               >
                  {profileStatus === "loading" ? "Syncing..." : <><Save size={16} /> Propagate Changes</>}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorProfileSettings;
