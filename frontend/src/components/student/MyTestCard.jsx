import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Clock,
    BarChart2,
    Play,
    ShoppingBag
} from 'lucide-react';
import api from "../../api/axios";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";

const StatItem = ({ icon: Icon, value, label, accentColorClass }) => (
    <div className="text-center">
        <Icon size={20} className={`${accentColorClass} mx-auto mb-1`} />
        <p className="text-lg sm:text-xl font-extrabold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const MyTestCard = ({ test }) => {
    const navigate = useNavigate();

    const imgSrc = getImageUrl(test.thumbnail);

    const isCompleted = test.status === "completed" || test.status === "finished";
    const isReadyForNewAttempt = test.status === "ready_to_retry";
    const isInProgress = test.progress > 0 || test.status === "in-progress";

    const isGrandTest = test.isGrandTest === true;
    const progress = isCompleted ? 100 : test.progress || 0;

    const isLimitReached = test.mocktestId?.allowedAttempts && test.attemptsMade >= test.mocktestId.allowedAttempts;
    const hasAttempts = test.attemptsMade > 0;

    const handleAction = (e) => {
        if (e) e.stopPropagation();
        const testId = String(test._id);

        if (isLimitReached) {
            // Redirect to test detail page for re-purchase or more info
            navigate(`/test/${test.mocktestId?._id || test.mocktestId}`);
            return;
        }
        
        if (isReadyForNewAttempt || test.status === 'not_started' || test.status === 'in-progress' || !test.status) {
            navigate(`/student/instructions/${testId}`);
        }
    };

    const handleReview = (e) => {
        if (e) e.stopPropagation();
        const attemptId = test.latestAttemptId ? String(test.latestAttemptId) : null;
        if (attemptId) {
            navigate(`/student/review/${attemptId}`);
        }
    };

    // Color Theme Logic based on Test Type (Consistent with All Tests)
    const theme = isGrandTest ? {
        primary: "orange-600",
        bg: "bg-orange-50/40",
        border: "border-orange-100",
        hoverBorder: "group-hover:border-orange-300",
        iconBg: "bg-orange-100/50",
        text: "text-orange-600",
        badge: "bg-gradient-to-r from-orange-500 to-amber-500",
        progress: "bg-orange-500",
        button: "bg-orange-600 hover:bg-orange-700 shadow-orange-200/50"
    } : {
        primary: "emerald-600",
        bg: "bg-emerald-50/40",
        border: "border-emerald-100",
        hoverBorder: "group-hover:border-emerald-300",
        iconBg: "bg-emerald-100/50",
        text: "text-emerald-600",
        badge: "bg-gradient-to-r from-emerald-500 to-green-500",
        progress: "bg-emerald-500",
        button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50"
    };

    let buttonText = "Start Exam";
    let statusLabel = "Ready";

    if (isLimitReached) {
        buttonText = "Enroll Again";
        statusLabel = "Limit Reached";
    } else if (isCompleted && !isReadyForNewAttempt) {
        buttonText = "Re-attempt";
        statusLabel = "Completed";
    } else if (isInProgress) {
        buttonText = "Resume Exam";
        statusLabel = "In Progress";
    } else if (isReadyForNewAttempt) {
        buttonText = "Start New";
        statusLabel = "Needs Retry";
    }

    return (
        <div 
            onClick={handleAction}
            className={`group cursor-pointer ${theme.bg} rounded-xl border ${theme.border} ${theme.hoverBorder} p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 sm:gap-4`}
        >
            {/* Header Section: Profile Style Image + Title */}
            <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                    <img
                        src={imgSrc}
                        alt={test.title}
                        onError={handleImageError}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-105`}
                    />
                    {/* Status Indicator Dot - Theme Aware */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm
                        ${statusLabel === "Completed" ? "bg-emerald-500" : (statusLabel === "In Progress" ? theme.progress : "bg-blue-500")}
                        ${statusLabel === "In Progress" ? `ring-2 ring-${theme.primary}/20` : ""}
                    `}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className={`text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider sm:tracking-[2px] text-white shadow-sm flex-shrink-0 ${theme.badge}`}>
                            {isGrandTest ? "Grand" : "Mock"}
                        </span>
                        <div className="flex-1 min-w-0 text-right flex flex-col items-end">
                            <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight sm:tracking-wider truncate block">
                                {statusLabel}
                            </span>
                            {isLimitReached && (
                                <span className="text-[6px] sm:text-[7px] font-black text-rose-500 uppercase tracking-tighter mt-0.5">
                                    No attempts left
                                </span>
                            )}
                        </div>
                    </div>
                    <h3 className={`text-[12px] sm:text-[14px] font-black leading-tight line-clamp-2 sm:truncate transition-colors group-hover:${theme.text} text-slate-800 uppercase`}>
                        {test.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 sm:mt-1 font-bold truncate opacity-70">
                        {test.category?.name || test.category || "GENERAL EXAM"}
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 py-3 px-1 border-y border-white/50 bg-white/40 rounded-lg">
                <div className="flex flex-col items-center border-r border-slate-200/50">
                    <span className={`text-[11px] font-black ${theme.text}`}>{test.durationMinutes || 0}m</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                </div>
                <div className="flex flex-col items-center border-r border-slate-200/50">
                    <span className={`text-[11px] font-black ${theme.text}`}>{test.totalQuestions || 0}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Qs</span>
                </div>
                <div className="flex flex-col items-center border-r border-slate-200/50">
                    <span className={`text-[11px] font-black ${theme.text}`}>{test.totalMarks || 100}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Marks</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-black ${theme.text}`}>{test.attemptsMade || 0}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Atts</span>
                </div>
            </div>

            {/* Progress Bar (Ultra Slim) */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[2px]">
                    <span className="flex items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${theme.progress}`}></div>
                        Progress
                    </span>
                    <span className="text-slate-700">{progress}%</span>
                </div>
                <div className="h-1 w-full bg-white/50 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${theme.progress} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Action Buttons Area */}
            <div className="flex gap-2 mt-1">
                {hasAttempts && (
                    <button
                        onClick={handleReview}
                        className={`flex-1 py-2 px-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-[0.95] flex items-center justify-center gap-1.5 border-2 ${theme.text} ${theme.border} hover:bg-white bg-white/50`}
                    >
                        <BarChart2 size={12} className="shrink-0" />
                        <span className="truncate">Review</span>
                    </button>
                )}
                
                <button
                    onClick={handleAction}
                    className={`${hasAttempts ? 'flex-[1.5]' : 'w-full'} py-2 px-1 sm:py-2.5 rounded-lg text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${isLimitReached ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200/50' : theme.button}`}
                >
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{buttonText}</span>
                        {!isLimitReached && <Play size={10} fill="currentColor" className="shrink-0" />}
                        {isLimitReached && <ShoppingBag size={10} className="shrink-0" />}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default MyTestCard;