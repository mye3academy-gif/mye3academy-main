import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { setUserData } from "../../redux/userSlice";

import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  ShieldCheck,
} from "lucide-react";

const InstitutionProfileSettings = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstname: userData?.firstname || "",
    lastname: userData?.lastname || "",
    phoneNumber: userData?.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    userData?.avatar
      ? `${import.meta.env.VITE_SERVER_URL}/${userData.avatar}`
      : `https://ui-avatars.com/api/?name=${userData?.firstname}&background=6366f1&color=fff`
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstname", profileData.firstname);
      formData.append("lastname", profileData.lastname);
      formData.append("phoneNumber", profileData.phoneNumber);
      if (avatar) formData.append("photo", avatar);
      if (profileData.newPassword) {
        formData.append("currentPassword", profileData.currentPassword);
        formData.append("newPassword", profileData.newPassword);
      }

      const { data } = await api.put("/api/auth/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setUserData(data.user));
      toast.success("Profile updated successfully!");
      setProfileData({ ...profileData, currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-transparent w-full">
      <div className="max-w-5xl mx-auto pb-12">
        <header className="mb-4 text-center md:text-left pt-2">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Settings</h1>
          <p className="text-indigo-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-1.5 opacity-60">Identity & Security Sync</p>
        </header>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-xl transition group-hover:brightness-90"
                />
                <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-lg cursor-pointer shadow-lg hover:bg-indigo-700 transition active:scale-90">
                  <Camera size={14} />
                  <input type="file" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <h3 className="mt-4 font-black text-slate-800 text-sm">Profile Identity</h3>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Campus Logo</p>
            </div>

            <div className="bg-indigo-600 p-5 rounded-3xl shadow-xl text-white relative overflow-hidden">
               <ShieldCheck className="absolute -bottom-2 -right-2 text-white/10" size={70} />
               <h4 className="font-black text-sm mb-1 relative z-10 italic">Data Integrity</h4>
               <p className="text-[10px] text-white/70 leading-relaxed relative z-10">
                 Instant sync enabled.
               </p>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-1">Institution Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none rounded-xl pl-10 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                        value={profileData.firstname}
                        onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                        placeholder="Mye3 Academy"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-1">Campus Location</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                      value={profileData.lastname}
                      onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                      placeholder="Main Campus"
                    />
                  </div>
               </div>

               <div className="space-y-1 mb-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 pl-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                      type="tel"
                      className="w-full bg-slate-50 border-none rounded-xl pl-10 py-3 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-800 text-sm"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
               </div>

               <hr className="my-6 border-slate-100" />

               <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Lock size={16} className="text-indigo-600" /> Security
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Current Auth</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-indigo-600 transition text-sm"
                      placeholder="••••••••"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">New Auth Token</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-indigo-600 transition text-sm"
                      placeholder="New Password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    />
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50 text-[10px]"
               >
                  {isLoading ? "Syncing..." : <><Save size={16} /> Propagate Changes</>}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionProfileSettings;
