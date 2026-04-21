import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import {
  Plus, Edit2, Trash2, Crown, Tag, Calendar, ChevronRight,
  CheckCircle, X, Layers, BookOpen, IndianRupee, Clock
} from "lucide-react";

const EMPTY_FORM = {
  name: "", description: "", price: "", discountPrice: "",
  validityDays: 365, categoryToUnlock: "", isPublished: true,
  extraAttempts: 0,
};

const SubscriptionsManage = () => {
  const [plans, setPlans]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, catRes] = await Promise.all([
        api.get("/api/admin/subscriptions"),
        api.get("/api/admin/categories"),
      ]);
      setPlans(plansRes.data.plans || []);
      setCategories(catRes.data.categories || []);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || "",
      validityDays: p.validityDays,
      categoryToUnlock: p.categories?.[0]?._id || "",
      isPublished: p.isPublished !== false,
      extraAttempts: p.extraAttempts ?? 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Plan name is required");
    if (!formData.price || Number(formData.price) <= 0) return toast.error("Price must be > 0");
    if (!formData.categoryToUnlock)
      return toast.error("Select a category to unlock");

    const payload = {
      ...formData,
      categories: formData.categoryToUnlock ? JSON.stringify([formData.categoryToUnlock]) : "[]",
      extraAttempts: Number(formData.extraAttempts) || 0,
    };

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/api/admin/subscriptions/${editId}`, payload);
        toast.success("Plan updated!");
      } else {
        await api.post("/api/admin/subscriptions", payload);
        toast.success("Plan created!");
      }
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/subscriptions/${id}`);
      toast.success("Plan deleted");
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const activeCount   = plans.filter(p => p.isPublished !== false).length;
  const inactiveCount = plans.length - activeCount;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Crown size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Subscription Plans</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium ml-[52px]">
            Manage pass-based access to categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="px-3 py-1 text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
              {activeCount} Active
            </span>
            {inactiveCount > 0 && (
              <span className="px-3 py-1 text-xs font-black bg-slate-100 text-slate-500 rounded-full">
                {inactiveCount} Inactive
              </span>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-slate-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} />
            New Plan
          </button>
        </div>
      </div>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Crown size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-base">
                    {editId ? "Edit Plan" : "Create New Plan"}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Fill the details below</p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Plan Name + Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="text"
                    placeholder="e.g. Banking Yearly Pass"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                    <div className="flex items-center gap-1"><Clock size={11} />Validity (Days)</div>
                  </label>
                  <input
                    required type="number" min="1"
                    value={formData.validityDays}
                    onChange={e => setFormData({ ...formData, validityDays: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of what this plan includes..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all resize-none"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                    <div className="flex items-center gap-1"><IndianRupee size={11} />Price (₹) <span className="text-red-500">*</span></div>
                  </label>
                  <input
                    required type="number" min="1"
                    placeholder="999"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number" min="0"
                    placeholder="799 (optional)"
                    value={formData.discountPrice}
                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
              </div>

              {/* What does this plan unlock */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-amber-600" />
                  <span className="text-xs font-black text-amber-800 uppercase tracking-widest">What Does This Plan Unlock?</span>
                </div>
                <p className="text-xs text-amber-700 font-medium mb-3">
                  Unlock a full Category (all tests inside it).
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <select
                      value={formData.categoryToUnlock}
                      onChange={e => setFormData({ ...formData, categoryToUnlock: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 bg-white"
                    >
                      <option value="">— Select Category —</option>
                      {categories.map(c => (
                         <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Extra Attempts for Subscribers */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-600 font-black text-xs">🔁</span>
                  <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Extra Attempts for Subscribers</span>
                </div>
                <p className="text-xs text-blue-700 font-medium mb-3">
                  Subscribers get this many <strong>extra</strong> attempts per test on top of the test's default limit.<br />
                  <span className="text-blue-500">Set -1 for unlimited attempts.</span>
                </p>
                <input
                  type="number"
                  min="-1"
                  value={formData.extraAttempts}
                  onChange={e => setFormData({ ...formData, extraAttempts: e.target.value })}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 bg-white"
                  placeholder="0"
                />
                <p className="text-[10px] text-blue-400 font-bold mt-1.5">0 = no bonus | 1+ = extra | -1 = unlimited</p>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-700">Published</p>
                  <p className="text-xs text-slate-400">Students can see and buy this plan</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.isPublished ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${formData.isPublished ? "left-6" : "left-0.5"}`}
                  />
                </button>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-200/50 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {saving ? "Saving..." : editId ? "Update Plan" : "Create Plan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Delete this plan?</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Students who already bought it will keep access, but no new purchases possible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN CARDS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-52 bg-white animate-pulse rounded-2xl border border-slate-100" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-4">
            <Crown size={36} className="text-amber-300" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2">No Plans Yet</h3>
          <p className="text-slate-400 text-sm font-medium max-w-xs mb-6">
            Create your first subscription plan to let students unlock entire categories with a single pass.
          </p>
          <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-200/50">
            <Plus size={16} /> Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map(plan => {
            const effectivePrice = plan.discountPrice > 0 ? plan.discountPrice : plan.price;
            const hasDiscount    = plan.discountPrice > 0 && plan.discountPrice < plan.price;
            const unlocksCat    = plan.categories?.length > 0;

            return (
              <div
                key={plan._id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Top strip */}
                <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500" />

                <div className="p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Crown size={14} className="text-amber-500 shrink-0" />
                        <h3 className="font-black text-slate-800 text-base leading-tight truncate">{plan.name}</h3>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">{plan.description}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.isPublished !== false ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500"}`}>
                      {plan.isPublished !== false ? "Live" : "Draft"}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <IndianRupee size={11} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-800">₹{effectivePrice}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through">₹{plan.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</span>
                      </div>
                      <span className="text-lg font-black text-slate-800">{plan.validityDays}d</span>
                    </div>
                  </div>

                  {/* What it unlocks */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unlocks</p>
                    {unlocksCat ? (
                      <div className="flex flex-wrap gap-1.5">
                        {plan.categories.map(cat => (
                          <span key={cat._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[11px] font-bold">
                            <Layers size={10} />
                            {cat.name} (All Tests)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Nothing configured</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                    <button
                      onClick={() => openEdit(plan)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-black text-[11px] uppercase tracking-wider transition-colors"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(plan._id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-black text-[11px] uppercase tracking-wider transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsManage;
