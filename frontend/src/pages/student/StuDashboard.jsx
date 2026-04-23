// frontend/src/pages/student/StuDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import StuSidebar from "../../components/student/StuSidebar";
import StuHeader from "../../components/student/StuHeader";
import { ArrowLeft } from "lucide-react";
import DashboardOverview from "./DashboardOverview";
import AllMockTests from "../AllMockTests";
import PerformanceHistory from "./PerformanceHistory";
import ProfileSettings from "./ProfileSettings";
import MyTests from "./MyTests";
import StudentDoubts from "./StudentDoubts";
import StudentNotifications from "./StudentNotifications";

import { initSocket, disconnectSocket } from "../../socket";
import { fetchStudentDoubts } from "../../redux/doubtSlice";
import { fetchStudentNotifications, addNotification } from "../../redux/studentSlice";
import { fetchStudentProfile } from "../../redux/studentSlice";

export default function StuDashboard() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };
  const mainRef = useRef(null);

  // LOGIC CONNECTIVITY FIX: Get Profile from studentSlice and Auth from userSlice
  const userProfile = useSelector((state) => state.students.studentProfile);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // React to ?tab= query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
       // Optional: Ensure default tab is in URL if needed, or leave as is
    }
  }, [searchParams]);

  // 1. DATA HYDRATION: Ensure profile data exists
  useEffect(() => {
    if (!userProfile && userData) {
      dispatch(fetchStudentProfile());
    }
    dispatch(fetchStudentNotifications());
  }, [dispatch, userProfile, userData]);

  // 2. SOCKET & DOUBTS SYNC
  useEffect(() => {
    if (userData?._id) {
      const socket = initSocket(userData._id);
      const handleAnswer = () => {
        dispatch(fetchStudentDoubts());
      };
      const handleNewNotification = (notif) => {
        dispatch(addNotification(notif));
        toast.success(`📢 New Update: ${notif.title}`, {
           icon: '🚀',
           duration: 5000,
           position: 'top-right'
        });
      };
      
      socket.on("doubtAnswered", handleAnswer);
      socket.on("new_notification", handleNewNotification);

      return () => {
        socket.off("doubtAnswered", handleAnswer);
        socket.off("new_notification", handleNewNotification);
        disconnectSocket();
      };
    }
  }, [userData?._id, dispatch]);

  // SCROLL TO TOP ON TAB CHANGE
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <StuSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT AREA */}
      <main ref={mainRef} className="flex-1 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-6 lg:pb-8 pt-14 md:pt-2 overflow-y-auto">
        {/* Pass userData for header display while profile is loading */}
        <StuHeader user={userProfile || userData} setActiveTab={setActiveTab} />

        {activeTab !== "overview" && (
          <button 
            onClick={() => setActiveTab("overview")}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors px-2"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </button>
        )}

        <div className="mt-6">
          {activeTab === "overview" && <DashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === "my-tests" && <MyTests setActiveTab={setActiveTab} />}
          {activeTab === "performance" && <PerformanceHistory initialFilter="all" />}
          {activeTab === "settings" && <ProfileSettings />}
          {activeTab === "doubts" && <StudentDoubts />}
          {activeTab === "job-notifications" && <StudentNotifications />}
        </div>
      </main>
    </div>
  );
}
