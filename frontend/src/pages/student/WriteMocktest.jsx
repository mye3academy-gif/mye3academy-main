import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
// ✅ FIX: Use the correct, singular import path for your configured API instance
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Clock,
  Menu,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Home,
  CheckCircle,
  Trash2,
  ClipboardList,
  HelpCircle,
} from "lucide-react";

// 1. Base URL configuration (Used for image paths)
const BASE_URL = "import.meta.env.VITE_SERVER_URL";

// 2. Simple Spinner Component
const SimpleSpinner = ({ size = 24, color = "#06b6d4", className = "" }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill={color}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    ></path>
  </svg>
);

// 3. IMAGE URL HELPER
const getImageUrl = (path) => {
  if (!path) return null;
  // If it's already a full URL (e.g. Cloudinary), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Ensure there is a leading slash before appending to BASE_URL
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
};

/* --------------------------------------
    TIMER COMPONENT
-------------------------------------- */
const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [remaining, setRemaining] = useState(expiryTimestamp - Date.now());

  const timerColor =
    remaining < 60000 * 5 // Less than 5 minutes
      ? "text-red-500"
      : remaining < 60000 * 15
        ? "text-yellow-500"
        : "text-green-600";

  useEffect(() => {
    const interval = setInterval(() => {
      const r = expiryTimestamp - Date.now();
      if (r <= 1000) {
        clearInterval(interval);
        setRemaining(0);
        onTimeUp();
      } else {
        setRemaining(r);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeUp]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      className={`flex items-center text-xl font-extrabold ${timerColor} p-2 rounded-lg bg-white border`}
    >
      <Clock className="h-5 w-5 mr-2" />
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
};

/* --------------------------------------
    QUESTION RENDERER
-------------------------------------- */
const QuestionRenderer = ({ question, answers, handleAnswer, isMarked, toggleMark }) => {
  if (!question) return null;
  const qId = question.id || question._id;

  /* ----------------------------------------------------
      1. PASSAGE BLOCK (STANDALONE PASSAGE QUESTION)
  ----------------------------------------------------- */
  if (question.questionType === "passage") {
    return (
      <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-xl font-bold text-purple-900 mb-4">
          Reading Passage
        </h3>

        {question.title && (
          <p className="whitespace-pre-line mb-4 text-gray-700 leading-relaxed">
            {question.title}
          </p>
        )}

        {/* Passage Image */}
        {question.questionImageUrl && (
          <img
            src={getImageUrl(question.questionImageUrl)}
            className="max-h-80 w-full object-contain rounded-lg border my-4 bg-white"
            alt="Passage"
          />
        )}

        <p className="text-sm italic mt-4 text-purple-700 font-semibold">
          (Note: Questions based on this passage follow next.)
        </p>
      </div>
    );
  }

  /* ----------------------------------------------------
      2. MCQ / MANUAL QUESTION WITH OPTIONAL PARENT PASSAGE
  ----------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Parent Passage Context */}
      {question.parentQuestionId && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4 text-sm text-gray-700">
          <h4 className="font-bold text-blue-800 mb-2">Reference Passage:</h4>

          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {/* Use parentQuestionId.questionText */}
            <p className="whitespace-pre-line mb-2">
              {question.parentQuestionId.title}
            </p>

            {/* Parent Passage Image */}
            {question.parentQuestionId.questionImageUrl && (
              <img
                src={getImageUrl(question.parentQuestionId.questionImageUrl)}
                className="h-32 w-auto mt-2 rounded border bg-white"
                alt="Passage Reference"
              />
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MAIN QUESTION TEXT
      ----------------------------------------------------- */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-bold text-gray-800 leading-tight">
          Q: {question.title || question.questionText}
        </h3>
        {/* Mark for review button removed per user request */}
      </div>

      {/* Question Image */}
      {question.questionImageUrl && (
        <img
          src={getImageUrl(question.questionImageUrl)}
          className="max-h-80 w-full object-contain rounded-lg border shadow-sm bg-white"
          alt="Question"
        />
      )}

      {/* ----------------------------------------------------
          OPTIONS / MANUAL ANSWER
      ----------------------------------------------------- */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <p className="text-sm font-semibold mb-3 text-gray-600">
          Choose your answer:
        </p>

        {/* MULTIPLE CHOICE */}
        {question.options.map((opt, idx) => {
          const chosen = answers[qId]?.selected?.[0] === idx;
          const optionLabel = String.fromCharCode(65 + idx);

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(qId, "mcq", idx)}
              className={`w-full text-left p-4 rounded-lg flex items-center space-x-4 transition-all duration-150 border-2 mb-3 last:mb-0 ${chosen
                  ? "bg-cyan-100 border-cyan-500 shadow-md scale-[1.01]"
                  : "bg-white border-gray-200 hover:border-cyan-200 hover:bg-slate-50"
                }`}
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs flex-shrink-0 ${chosen
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
              >
                {optionLabel}
              </span>

              <div className="flex-grow">
                <span className={`text-base font-semibold ${chosen ? "text-cyan-900" : "text-gray-700"}`}>
                  {opt.text || `Option ${optionLabel}`}
                </span>

                {opt.imageUrl && (
                  <img
                    src={getImageUrl(opt.imageUrl)}
                    alt="option"
                    className="h-16 w-auto object-contain mt-2 rounded border bg-white"
                  />
                )}
              </div>
            </button>
          );
        })}

        {/* MANUAL ANSWER */}
        {question.questionType === "manual" && (
          <textarea
            rows="6"
            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none text-gray-700 shadow-inner"
            placeholder="Write your answer here..."
            value={answers[qId]?.manual || ""}
            onChange={(e) => handleAnswer(qId, "manual", e.target.value)}
          />
        )}
      </div>

      {/* FOOTER (dynamic markings) */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-600 pt-3 border-t border-gray-100">
        <span>
          Marks: <strong>{question.marksPerQuestion || question.marks || 1}</strong>
        </span>
        <span>
          Negative:{" "}
          <strong className="text-red-500">
            {question.globalNegative !== undefined && question.globalNegative !== null
              ? question.globalNegative
              : (question.negative || 0)}
          </strong>
        </span>
      </div>
    </div>
  );
};

/* --------------------------------------
    QUESTION NAVIGATION PANEL
-------------------------------------- */
const QuestionNavigationPanel = ({
  questions,
  currentIndex,
  setCurrentIndex,
  answers,
  markedForReview,
  viewedQuestions,
  isMobile,
  onClose,
  expiryTimestamp,
  onTimeUp,
}) => {
  const getQuestionStatus = (qid) => {
    if (markedForReview?.has(qid)) return "marked";
    const answer = answers[qid];
    if (
      answer?.selected?.length ||
      (answer?.manual && answer.manual.trim().length > 0)
    ) {
      return "answered";
    }
    if (viewedQuestions?.has(qid)) return "viewed";
    return "unanswered";
  };

  const statusMap = {
    answered: "bg-emerald-500 text-white shadow-emerald-100",
    unanswered: "bg-red-500 text-white shadow-red-100",
    marked: "bg-purple-600 text-white shadow-purple-100 scale-105",
    viewed: "bg-slate-300 text-slate-700",
    current: "bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 z-10",
    default: "bg-white text-slate-400 border border-slate-200",
  };

  const handleNavClick = (index) => {
    setCurrentIndex(index);
    if (isMobile) onClose();
  };

  // Filter out passage containers from the navigation palette
  const actionableQuestions = questions.filter(
    (q) => q.questionType !== "passage",
  );

  return (
    <div
      className={`flex flex-col p-4 h-full overflow-y-auto ${isMobile ? "bg-white" : "bg-slate-50/50"}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">
          Question Palette
        </h3>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-slate-400 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Exam Lockdown: Timer relocated from header to sidebar */}
      <div className="mb-6">
        <Timer
          expiryTimestamp={expiryTimestamp}
          onTimeUp={onTimeUp}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Answered</span>
          <span className="text-[10px] font-black text-emerald-600 ml-auto">
            {actionableQuestions.filter((q) => getQuestionStatus(q.id || q._id) === "answered").length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600 shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Skipped / Doubtful</span>
          <span className="text-[10px] font-black text-purple-600 ml-auto">
            {actionableQuestions.filter((q) => getQuestionStatus(q.id || q._id) === "marked").length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Unanswered</span>
          <span className="text-[10px] font-black text-red-600 ml-auto">
            {actionableQuestions.filter((q) => getQuestionStatus(q.id || q._id) === "unanswered" || getQuestionStatus(q.id || q._id) === "viewed").length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Viewed</span>
          <span className="text-[10px] font-black text-slate-500 ml-auto">
             {viewedQuestions?.size || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 content-start">
        {actionableQuestions.map((q, index) => {
          const qId = q.id || q._id;
          const status = getQuestionStatus(qId);
          let colorClass = statusMap.default;

          if (questions.indexOf(q) === currentIndex) colorClass = statusMap.current;
          else if (status === "marked") colorClass = statusMap.marked;
          else if (status === "answered") colorClass = statusMap.answered;
          else if (status === "viewed") colorClass = statusMap.viewed;
          else if (status === "unanswered") colorClass = statusMap.unanswered;

          return (
            <button
              key={qId}
              onClick={() => {
                const trueIndex = questions.indexOf(q);
                handleNavClick(trueIndex);
              }}
              className={`h-11 w-11 flex items-center justify-center text-[13px] font-black rounded-xl transition-all duration-200 shadow-sm active:scale-90 ${colorClass}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* --------------------------------------
    MAIN COMPONENT: WriteMocktest
-------------------------------------- */
const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  // ── FULLSCREEN LOCKDOWN ──
  const [fsWarning, setFsWarning] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const MAX_VIOLATIONS = 3;

  const enterFullscreen = () => {
    try {
      const el = document.documentElement;
      const promise = el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.mozRequestFullScreen?.();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {}); // silently ignore permission errors
      }
    } catch {
      // ignore - browser may not allow fullscreen without user interaction
    }
    setFsWarning(false);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  };

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [viewedQuestions, setViewedQuestions] = useState(new Set());
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const isSubmittedRef = React.useRef(false); // tracks if exam is done
  const endsAt = attempt?.endsAt;

  // --- DERIVED STATE ---
  const isFreeTest = useMemo(() => {
    const price = attempt?.mocktestId?.price;
    if (price === undefined || price === null) return false;
    if (typeof price === "number") return price === 0;
    if (typeof price === "string") return price === "0";
    return false;
  }, [attempt]);

  const subjects = useMemo(() => {
    if (!attempt || !attempt.questions) return [];
    const normalized = attempt.questions
      .map((q) => (q.subject || q.category || "").trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());
    const uniqueSet = new Set(normalized);
    const prettySubjects = [...uniqueSet].map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1),
    );
    return ["all", ...prettySubjects];
  }, [attempt]);

  const filteredQuestions = useMemo(() => {
    if (!attempt || !attempt.questions) return [];
    if (selectedSubject === "all") return attempt.questions;
    return attempt.questions.filter(
      (q) => q.subject === selectedSubject || q.category === selectedSubject,
    );
  }, [attempt, selectedSubject]);

  const current = useMemo(() => {
    return filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;
  }, [filteredQuestions, currentIndex]);

  const navigationQuestions = useMemo(() => {
    if (!attempt || !attempt.questions) return [];
    return attempt.questions;
  }, [attempt]);

  const actionableQuestions = useMemo(() => {
    if (!attempt || !attempt.questions) return [];
    return attempt.questions.filter(q => q.questionType !== "passage");
  }, [attempt]);

  const currentActionableIndex = useMemo(() => {
    if (!current || current.questionType === "passage") return -1;
    return actionableQuestions.indexOf(current);
  }, [current, actionableQuestions]);

  const totalAnswered = useMemo(() => {
    return actionableQuestions.filter((q) => {
      const qId = q.id || q._id;
      const ans = answers[qId];
      return (
        ans?.selected?.length > 0 ||
        (ans?.manual && ans.manual.trim().length > 0)
      );
    }).length;
  }, [actionableQuestions, answers]);

  const hasAnsweredCurrent = useMemo(() => {
    if (!current || (current.id || current._id) === undefined) return false;
    const qId = current.id || current._id;
    const ans = answers[qId];
    return (
      ans?.selected?.length > 0 ||
      (ans?.manual && ans.manual.trim().length > 0)
    );
  }, [current, answers]);

  // Track viewed questions (actionable only)
  useEffect(() => {
    if (current && current.questionType !== "passage") {
      const qId = current.id || current._id;
      setViewedQuestions((prev) => {
        if (prev.has(qId)) return prev;
        const next = new Set(prev);
        next.add(qId);
        return next;
      });
    }
  }, [current]);

  const handleAnswer = useCallback((qid, type, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        selected: type === "mcq" ? [value] : prev[qid]?.selected || [],
        manual: type === "manual" ? value : prev[qid]?.manual || "",
      },
    }));
  }, []);

  const toggleMarkForReview = useCallback((qid) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);

  // ✅ State: Controls whether the user sees the dashboard/review buttons
  // This should be true if the student has purchased at least ONE mocktest (has dashboard)
  const [hasDashboardAccess, setHasDashboardAccess] = useState(false);





  /* --- SUBMIT HANDLER --- */
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!isAutoSubmit) {
        if (
          !window.confirm(
            "Are you sure you want to submit the exam? This cannot be undone.",
          )
        ) {
          return;
        }
      }

      if (isSubmitting) return;
      exitFullscreen(); // ← exit fullscreen on submit
      setIsSubmitting(true);
      const toastId = toast.loading(
        isAutoSubmit ? "Auto-submitting test..." : "Submitting test...",
      );

      // Format answers
      const formattedAnswers = Object.entries(answers).map(([id, a]) => ({
        questionId: id,
        selectedAnswer:
          a.manual?.trim() !== ""
            ? a.manual
            : a.selected?.length
              ? a.selected[0]
              : null,
      }));

      const finalData = { answers: formattedAnswers };

      try {
        const res = await api.post(
          `/api/student/submit-test/${attemptId}`,
          finalData,
        );

        toast.dismiss(toastId);

        exitFullscreen();
        isSubmittedRef.current = true; // mark exam done — stop all warnings
        setFsWarning(false);
        setResultData({
          score: res.data.score || 0,
          totalMarks: res.data.totalMarks || attempt.totalMarks || 0,
        });
        setShowResultModal(true);
      } catch (err) {
        console.error("Submission Error:", err);
        toast.error(err.response?.data?.message || "Error submitting test", {
          id: toastId,
        });
        setIsSubmitting(false);
      }
    },
    [attemptId, answers, attempt, isSubmitting],
  );

  const handleTimeUp = useCallback(() => {
    setIsTimeOver(true);
    toast.error("Time up! Auto-submitting...");
    exitFullscreen();
    handleSubmit(true);
  }, [handleSubmit]);

  /* --- LOAD ATTEMPT --- */
  useEffect(() => {
    // Auto-enter fullscreen when exam starts
    enterFullscreen();

    // Detect tab switch / window blur
    const handleVisibilityChange = () => {
      if (isSubmittedRef.current) return; // exam done, ignore
      if (document.hidden) {
        setFsWarning(true);
        setTabViolations((v) => {
          const next = v + 1;
          if (next >= MAX_VIOLATIONS) {
            toast.error("Too many tab switches! Auto-submitting...");
            handleSubmit(true);
          }
          return next;
        });
      }
    };
    const handleBlur = () => {
      if (isSubmittedRef.current) return; // exam done, ignore
      if (!document.hidden) {
        setFsWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- LOAD ATTEMPT --- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/student/attempt/${attemptId}`);
        if (data.success && data.attempt) {
          setAttempt(data.attempt);
        } else {
          // Fallback for older structure or errors
          setAttempt(data);
        }

        // ✅ ACCESS CONTROL LOGIC:
        // hasDashboardAccess should come from backend:
        // true if student has purchased at least ONE mocktest (has dashboard)
        // Fallback to mocktestId.isPremium if you still use that.
        setHasDashboardAccess(
          !!(
            data.hasDashboardAccess ||
            data.studentHasDashboard ||
            data.mocktestId?.isPremium
          ),
        );

        // Resume state if exists
        const restored = {};
        if (data.attempt.answers?.length > 0) {
          data.attempt.questions.forEach((q) => {
            const qId = q.id || q._id;
            const existingAnswer = data.attempt.answers.find(
              (a) => a.questionId === qId || a.questionId?.toString() === qId?.toString(),
            );
            // Convert selectedAnswer (which is a number for MCQs) back into a selectable format
            const selected = existingAnswer
              ? typeof existingAnswer.selectedAnswer === "number"
                ? [existingAnswer.selectedAnswer]
                : []
              : [];
            const manual = existingAnswer
              ? typeof existingAnswer.selectedAnswer === "string"
                ? existingAnswer.selectedAnswer
                : ""
              : "";
            restored[qId] = { selected, manual };
          });
          setAnswers(restored);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load test");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId, navigate]);

  useEffect(() => {
    if (
      currentIndex >= filteredQuestions.length &&
      filteredQuestions.length > 0
    ) {
      setCurrentIndex(filteredQuestions.length - 1);
    } else if (currentIndex < 0 && filteredQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions, currentIndex]);



  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <SimpleSpinner size={50} color={"#06b6d4"} />
      </div>
    );
  }

  // Check if test is already completed and close the page if modal isn't showing
  if (
    (attempt.status === "finished" || attempt.status === "completed") &&
    !showResultModal
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Exam Completed!
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          This attempt is closed.
        </p>
        <button
          onClick={() => navigate("/student-dashboard")}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans relative">

      {/* ── FULLSCREEN / TAB-SWITCH WARNING OVERLAY ── */}
      {fsWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm mx-4 p-8 text-center shadow-2xl border-t-4 border-red-500">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-black text-red-600 uppercase tracking-widest mb-2">
              Security Protocol Active
            </h2>
            <p className="text-[13px] text-slate-600 mb-1">
              Switching tabs or exiting fullscreen is monitored.
            </p>
            <p className="text-[11px] text-red-500 font-bold mb-6">
              Warning {tabViolations} / {MAX_VIOLATIONS}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={enterFullscreen}
                className="w-full py-3 bg-[#21b731] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1a9227] transition-colors shadow-lg"
              >Continue Exam</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL --- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                <ClipboardList className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Exam Summary</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Final Review Before Submission</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Questions</p>
                <p className="text-2xl font-black text-slate-800">{actionableQuestions.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Answered</p>
                <p className="text-2xl font-black text-emerald-700">
                   {actionableQuestions.filter(q => {
                      const qid = q.id || q._id;
                      return !markedForReview.has(qid) && (answers[qid]?.selected?.length > 0 || answers[qid]?.manual?.trim());
                   }).length}
                </p>
              </div>
              <button
                onClick={() => {
                  const firstSkipped = actionableQuestions.find(q => markedForReview.has(q.id || q._id));
                  if (firstSkipped) {
                    setSelectedSubject("all");
                    // Use a functional update or wait for state if needed, but here simple reset works
                    setTimeout(() => {
                      setCurrentIndex(attempt.questions.indexOf(firstSkipped));
                      setShowPreviewModal(false);
                    }, 0);
                  }
                }}
                className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-left hover:bg-purple-100 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Skipped / Doubtful</p>
                  <Eye className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-black text-purple-700">{markedForReview.size}</p>
              </button>
              <button
                onClick={() => {
                  const firstUnanswered = actionableQuestions.find(q => {
                    const qId = q.id || q._id;
                    const ans = answers[qId];
                    return !markedForReview.has(qId) && !(ans?.selected?.length > 0 || (ans?.manual && ans.manual.trim().length > 0));
                  });
                  if (firstUnanswered) {
                    setSelectedSubject("all");
                    setTimeout(() => {
                      setCurrentIndex(attempt.questions.indexOf(firstUnanswered));
                      setShowPreviewModal(false);
                    }, 0);
                  }
                }}
                className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-left hover:bg-rose-100 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Unanswered</p>
                  <Eye className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-black text-rose-700">
                   {actionableQuestions.filter(q => {
                      const qid = q.id || q._id;
                      const ans = answers[qid];
                      return !markedForReview.has(qid) && !(ans?.selected?.length > 0 || (ans?.manual && ans.manual.trim().length > 0));
                   }).length}
                </p>
              </button>
            </div>

            {viewedQuestions.size < actionableQuestions.length && (
              <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-amber-900 uppercase tracking-tight mb-0.5">Unviewed Questions Detected</p>
                  <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                    You have not viewed {actionableQuestions.length - viewedQuestions.size} questions. We recommend checking all questions before submitting.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!isTimeOver && (
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all"
                >
                  Back to Test
                </button>
              )}
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleSubmit(true); // Using autoSubmit flag logic to avoid nested confirm
                }}
                disabled={isSubmitting}
                className={`flex-[1.5] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-indigo-100 ${isTimeOver ? 'w-full w-fit' : ''}`}
              >
                {isTimeOver ? 'Auto-Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SCORE MODAL --- */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-200">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-yellow-50">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Test Submitted!
            </h2>

            <p className="text-gray-500 mb-8">
              You have successfully completed the exam.
            </p>

            {/* SCORE */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl p-6 mb-8">
              <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wide mb-1">
                Your Score
              </p>

              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-black text-gray-900">
                  {resultData?.score}
                </span>
                <span className="text-xl text-gray-400 font-medium mb-1">
                  / {resultData?.totalMarks}
                </span>
              </div>
            </div>

            {/* BUTTONS — SAME AS FIRST CODE */}
            <div className="flex flex-col gap-3">
              {/* REVIEW */}
              <button
                onClick={() => navigate(`/student/review/${attemptId}`)}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Review Answers
              </button>

              {/* HOME */}
              <button
                onClick={() => navigate("/student-dashboard")}
                className="w-full py-3 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: pt-[60px] removed to hide the header space */}
      <div className="flex flex-grow overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center border-b border-gray-200">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 mb-1 self-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {current?.questionType === "passage" ? "READING CONTEXT" : "LIVE EXAMINATION"}
                </span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {current?.questionType === "passage" ? (
                    "Reading Passage"
                  ) : (
                    <>Question {currentActionableIndex + 1} of {actionableQuestions.length}</>
                  )}
                  <span className="text-slate-400 ml-4 hidden sm:inline-block font-bold text-sm">
                    ({totalAnswered} Answered)
                  </span>
                </h2>
                <button 
                  onClick={() => setIsNavOpen(true)}
                  className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>
              <div className="sm:hidden text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">
                {totalAnswered} Questions Answered
              </div>
            </div>
            <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentIndex(0);
                }}
                className="block w-full sm:w-48 px-3 py-2 border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-[11px] font-black uppercase tracking-widest"
              >
                <option value="all">All Sections</option>
                {subjects.slice(1).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scrollbar">
            {current && (current.id || current._id) ? (
              <div className="bg-white p-6 shadow-sm border border-slate-200 flex flex-col">
                <div className="lg:hidden mb-4">
                  <Timer
                    expiryTimestamp={new Date(endsAt).getTime()}
                    onTimeUp={handleTimeUp}
                  />
                </div>
                <QuestionRenderer
                  question={{
                    ...current,
                    marksPerQuestion: attempt.marksPerQuestion !== undefined && attempt.marksPerQuestion !== null
                      ? attempt.marksPerQuestion
                      : (attempt.totalQuestions > 0
                        ? (attempt.totalMarks / attempt.totalQuestions).toFixed(1).replace(/\.0$/, '')
                        : current.marks),
                    globalNegative: attempt.negativeMarking
                  }}
                  answers={answers}
                  handleAnswer={handleAnswer}
                  isMarked={markedForReview.has(current.id || current._id)}
                  toggleMark={toggleMarkForReview}
                />
              </div>
            ) : (
              <div className="text-center p-10 bg-white border border-slate-200 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                {filteredQuestions.length === 0
                  ? "No questions match the current subject filter."
                  : "No questions found in this section or test."}
              </div>
            )}
          </div>

          {/* ── BOTTOM NAV BAR ── */}
          <div className="sticky bottom-0 z-10 bg-white px-2 sm:px-4 py-3 sm:py-4 border-t border-slate-200 flex justify-between items-center gap-3">
            <button
              disabled={currentIndex === 0 || filteredQuestions.length === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-3 sm:px-6 py-3 flex items-center justify-center bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-30 disabled:grayscale transition-all font-black uppercase text-[9px] sm:text-[10px] tracking-widest shrink-0 border border-slate-200"
            >
              <ChevronLeft size={16} className="mr-1 sm:mr-2" /> <span className="hidden xs:inline">Previous</span>
            </button>
            
            <button
              onClick={() => {
                const qId = current.id || current._id;
                // Treat skip as "Mark for Review" and move next
                if (!markedForReview.has(qId)) {
                  toggleMarkForReview(qId);
                }
                if (currentIndex < filteredQuestions.length - 1) {
                  setCurrentIndex(i => i + 1);
                }
              }}
              className="px-4 sm:px-8 py-3 flex items-center justify-center bg-white text-purple-600 rounded-xl hover:bg-purple-50 border-2 border-purple-100 transition-all font-black uppercase text-[10px] sm:text-[11px] tracking-widest shrink-0"
            >
               <span>Skip & Doubt</span>
            </button>

            {/* Mobile Submit Button - Enhanced visibility */}
            <button
              onClick={() => {
                if (viewedQuestions.size < actionableQuestions.length) {
                  toast.error(`Please view all questions before submitting. (${viewedQuestions.size}/${actionableQuestions.length} viewed)`);
                  return;
                }
                setShowPreviewModal(true);
              }}
              disabled={isSubmitting}
              className={`flex-1 lg:hidden px-3 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
                viewedQuestions.size < actionableQuestions.length 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <CheckCircle size={16} /> <span>Submit</span>
            </button>

            <button
              disabled={
                currentIndex === filteredQuestions.length - 1 ||
                filteredQuestions.length === 0 ||
                !hasAnsweredCurrent
              }
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-3 sm:px-6 py-3 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all font-black uppercase text-[9px] sm:text-[10px] tracking-widest shrink-0 shadow-lg shadow-indigo-100"
            >
              <span className="hidden xs:inline">Save & Next</span> <ChevronRight size={16} className="ml-1 sm:ml-2" />
            </button>
          </div>
        </div>

        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border-l border-slate-200 bg-slate-50/30">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <QuestionNavigationPanel
              questions={navigationQuestions}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              answers={answers}
              markedForReview={markedForReview}
              viewedQuestions={viewedQuestions}
              isMobile={false}
              expiryTimestamp={new Date(endsAt).getTime()}
              onTimeUp={handleTimeUp}
            />
          </div>
          {/* ── FINAL SUBMIT pinned at bottom of sidebar ── */}
          <div className="border-t border-slate-200 p-4 flex-shrink-0 bg-white">
            <button
              onClick={() => {
                if (viewedQuestions.size < actionableQuestions.length) {
                  toast.error(`Please view all questions before submitting. (${viewedQuestions.size}/${actionableQuestions.length} viewed)`);
                  return;
                }
                setShowPreviewModal(true);
              }}
              disabled={isSubmitting}
              className={`w-full py-4 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${isSubmitting || viewedQuestions.size < actionableQuestions.length
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                }`}
            >
              {isSubmitting ? (
                <><SimpleSpinner size={18} color="#fff" /> PROCESSING...</>
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {isSubmitting ? "" : "Final Submit"}
            </button>
          </div>
        </aside>
      </div>

      {isNavOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex lg:hidden">
          <div className="w-full h-full bg-white max-w-sm absolute right-0 shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <QuestionNavigationPanel
                questions={navigationQuestions}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                answers={answers}
                markedForReview={markedForReview}
                viewedQuestions={viewedQuestions}
                isMobile={true}
                onClose={() => setIsNavOpen(false)}
                expiryTimestamp={new Date(endsAt).getTime()}
                onTimeUp={handleTimeUp}
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => {
                  if (viewedQuestions.size < actionableQuestions.length) {
                    toast.error(`Please view all questions before submitting. (${viewedQuestions.size}/${actionableQuestions.length} viewed)`);
                    return;
                  }
                  setIsNavOpen(false);
                  setShowPreviewModal(true);
                }}
                disabled={isSubmitting}
                className={`w-full py-4 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${
                  isSubmitting || viewedQuestions.size < actionableQuestions.length
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                }`}
              >
                {isSubmitting ? (
                  <><SimpleSpinner size={18} color="#fff" /> PROCESSING...</>
                ) : (
                  <><CheckCircle size={18} /> Submit Exam</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriteMocktest;
