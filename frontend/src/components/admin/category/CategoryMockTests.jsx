import React, { useState, useEffect, useMemo } from "react";
import {
    Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Trophy,
    Layers, ChevronDown, ChevronUp, Users, FolderPlus
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../../api/axios";
import { ClipLoader } from "react-spinners";
import { getImageUrl, handleImageError } from "../../../utils/imageHelper";

export default function CategoryMockTests() {
    const { category } = useParams();
    const navigate = useNavigate();

    const [mocktests, setMocktests] = useState([]);
    const [loading,   setLoading]   = useState(true);

    // Which subcategory sections are collapsed
    const [collapsed, setCollapsed] = useState({});

    const formatCategoryName = (slug) => {
        if (!slug) return "All Categories";
        return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    const getMocktests = async () => {
        setLoading(true);
        try {
            const [mockRes, grandRes] = await Promise.all([
                api.get(`/api/admin/mocktests/category?category=${category}&isGrandTest=false`),
                api.get(`/api/admin/mocktests/category?category=${category}&isGrandTest=true`)
            ]);
            setMocktests([
                ...(mockRes.data.mocktests || []),
                ...(grandRes.data.mocktests || [])
            ]);
        } catch {
            toast.error("Failed to fetch tests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getMocktests(); }, [category]);

    // Group by subcategory
    // Normalize subcategory name for reliable grouping/matching
    const normalizeSub = (s) => (s || "General").toString().toLowerCase().replace(/\s+/g, '').replace(/,/g, '');

    const subcategoryGroups = useMemo(() => {
        const map = {};
        mocktests.forEach(t => {
            const key = (t.subcategory || "General").trim();
            const normKey = normalizeSub(key);
            if (!map[normKey]) map[normKey] = { name: key, tests: [] };
            map[normKey].tests.push(t);
        });
        return Object.values(map).map(group => ({ name: group.name, tests: group.tests }));
    }, [mocktests]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this test permanently?")) return;
        try {
            await api.delete(`/api/admin/mocktests/${id}`);
            toast.success("Deleted");
            setMocktests(prev => prev.filter(t => t._id !== id));
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleTogglePublish = async (id, current) => {
        try {
            setMocktests(prev => prev.map(t => t._id === id ? { ...t, isPublished: !current } : t));
            const res = await api.put(`/api/admin/mocktests/${id}/publish`);
            toast.success(res.data.message || (!current ? "Published" : "Unpublished"));
        } catch {
            toast.error("Failed to update");
            getMocktests();
        }
    };

    const toggleCollapse = (name) => {
        setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <div className="min-h-screen bg-[#EDF0FF]">

            {/* ── HEADER ── */}
            <div className="bg-white border-b border-slate-200 shadow-sm mb-4">
                <div className="max-w-[1700px] mx-auto px-4 md:px-6 py-4">
                    <Link
                        to="/admin/categories"
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#21b731] transition-all tracking-widest uppercase mb-3"
                    >
                        <ArrowLeft size={13} /> Back to categories
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-[#21b731]" />
                            <div>
                                <h1 className="text-xl font-black text-[#3e4954] uppercase tracking-tight">
                                    {formatCategoryName(category)}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {mocktests.length} Total Tests · {subcategoryGroups.length} Sub-Categories
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/admin/mocktests/${category}/new?type=mock`)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 shadow-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                            >
                                <Plus size={16} /> Add New Sub-Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="max-w-[1700px] mx-auto px-4 md:px-6 pb-10">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[40vh] gap-4">
                        <ClipLoader size={40} color="#21b731" />
                        <p className="text-sm font-bold text-slate-400">Loading tests...</p>
                    </div>
                ) : mocktests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <Layers size={48} className="text-slate-200 mb-4" />
                        <h3 className="text-lg font-black text-slate-600">No Tests Yet</h3>
                        <p className="text-sm text-slate-400 mt-1">Click "+ Mock Test" or "+ Grand Test" to add your first test.</p>
                        <Link
                            to={`/admin/mocktests/${category}/new?type=mock`}
                            className="mt-6 flex items-center gap-2 bg-[#21b731] text-white px-6 py-3 font-black text-sm uppercase tracking-widest hover:bg-[#1a9227] transition-all"
                        >
                            <Plus size={16} /> Add First Test
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subcategoryGroups.map((grp) => (
                            <div key={grp.name} className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">

                                {/* Subcategory header */}
                                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                                    <button
                                        onClick={() => toggleCollapse(grp.name)}
                                        className="flex items-center gap-3 flex-1 text-left group"
                                    >
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Layers size={15} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <span className="text-[13px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {grp.name}
                                            </span>
                                            <span className="ml-2 text-[10px] font-bold text-slate-400">
                                                {grp.tests.length} Test{grp.tests.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {collapsed[grp.name]
                                            ? <ChevronDown size={16} className="text-slate-400 ml-2" />
                                            : <ChevronUp size={16} className="text-slate-400 ml-2" />
                                        }
                                    </button>

                                    {/* Add test to THIS subcategory */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/admin/mocktests/${category}/new?type=mock&sub=${encodeURIComponent(grp.name)}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21b731]/10 text-[#21b731] border border-[#21b731]/20 font-black text-[9px] uppercase tracking-widest hover:bg-[#21b731] hover:text-white transition-all"
                                            title={`Add Mock Test to ${grp.name}`}
                                        >
                                            <Plus size={11} /> Mock
                                        </Link>
                                        <Link
                                            to={`/admin/mocktests/${category}/new?type=grand&sub=${encodeURIComponent(grp.name)}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 font-black text-[9px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                                            title={`Add Grand Test to ${grp.name}`}
                                        >
                                            <Trophy size={11} /> Grand
                                        </Link>
                                    </div>
                                </div>

                                {/* Tests grid */}
                                <AnimatePresence initial={false}>
                                    {!collapsed[grp.name] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                                {grp.tests.map((test, i) => (
                                                    <TestCard
                                                        key={test._id}
                                                        test={test}
                                                        index={i}
                                                        category={category}
                                                        onDelete={handleDelete}
                                                        onToggle={handleTogglePublish}
                                                        navigate={navigate}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── SINGLE TEST CARD ── */
function TestCard({ test, index, category, onDelete, onToggle, navigate }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 400, damping: 30 }}
            className={`group relative bg-white border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col
                ${test.isGrandTest ? 'border-amber-100' : 'border-slate-100'}`}
        >
            {/* Header */}
            <div className="pt-3 px-3 pb-2 bg-slate-50/50 border-b border-slate-50">
                <div className="flex justify-between items-start">
                    <div className="w-9 h-9 rounded-full bg-white shadow-sm p-1 flex items-center justify-center border border-slate-100 overflow-hidden">
                        <img
                            src={test.thumbnail ? getImageUrl(test.thumbnail)
                                : (test.category?.icon || test.category?.image)
                                    ? getImageUrl(test.category.icon || test.category.image)
                                    : "/logo.png"}
                            alt={test.title}
                            onError={handleImageError}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 text-[7px] font-bold rounded-full
                            ${test.isPublished
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                            {test.isPublished ? "LIVE" : "DRAFT"}
                        </span>
                        <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 text-[6.5px] font-black rounded-full text-white
                                ${test.isGrandTest ? "bg-amber-500" : "bg-[#21b731]"}`}>
                                {test.isGrandTest ? "GRAND" : "MOCK"}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[6.5px] font-black rounded-full text-white
                                ${test.isFree ? "bg-blue-500" : "bg-indigo-600"}`}>
                                {test.isFree ? "FREE" : "PAID"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-black text-[#3e4954] text-[12px] line-clamp-2 min-h-[2rem] group-hover:text-[#21b731] transition-colors leading-tight mb-2">
                    {test.title}
                </h3>

                <div className="grid grid-cols-3 gap-1 border-t border-slate-50 pt-2 mb-3">
                    <div className="text-center">
                        <div className="text-[9px] font-black text-[#3e4954]">{test.durationMinutes || "—"}m</div>
                        <div className="text-[6.5px] font-bold text-slate-400 uppercase">Time</div>
                    </div>
                    <div className="text-center border-x border-slate-100">
                        <div className="text-[9px] font-black text-[#3e4954]">{test.totalMarks || 0}</div>
                        <div className="text-[6.5px] font-bold text-slate-400 uppercase">Marks</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] font-black text-[#3e4954]">{test.totalQuestions || 0}</div>
                        <div className="text-[6.5px] font-bold text-slate-400 uppercase">MCQs</div>
                    </div>
                </div>

                <div className="mt-auto space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => navigate(`/admin/mocktests/${category}/edit/${test._id}`)}
                            className="flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 text-[8px] font-bold hover:bg-slate-100 transition-all"
                        >
                            <Edit size={10} /> Edit
                        </button>
                        <button
                            onClick={() => navigate(`/admin/mocktests/${test._id}/questions`)}
                            className="flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] font-bold hover:bg-indigo-100 transition-all"
                        >
                            <Layers size={10} /> Ques
                        </button>
                    </div>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => onToggle(test._id, test.isPublished)}
                            className={`flex-1 py-1.5 text-[8px] font-bold border transition-all flex items-center justify-center gap-1
                                ${test.isPublished
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                    : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"}`}
                        >
                            {test.isPublished ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Publish</>}
                        </button>
                        <button
                            onClick={() => onDelete(test._id)}
                            className="px-2 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
