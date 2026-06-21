import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Wallet, Banknote, Save, CheckCircle, Loader } from "lucide-react";

const PaymentGatewaySettings = () => {
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/api/admin/payment-settings");
      // Pick Razorpay specifically as our main gateway
      const razorpayGateway = data.find(g => g.name === "Razorpay") || data[0];
      setGateway(razorpayGateway);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load payment settings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setGateway(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const toastId = toast.loading(`Saving Settings...`);
    try {
      await api.put("/api/admin/payment-settings", {
        name: gateway.name,
        // We always force the active status in the backend anyway
        isActive: true,
        keyId: gateway.keyId,
        keySecret: gateway.keySecret,
        currency: gateway.currency,
        isTestMode: gateway.isTestMode,
        themeColor: gateway.themeColor
      });
      toast.success(`Payment Settings Updated Successfully!`, { id: toastId });
      fetchSettings();
    } catch (error) {
      toast.error("Update failed", { id: toastId });
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 flex justify-center items-center"><Loader className="animate-spin mr-2"/> Loading Payment Settings...</div>;
  if (!gateway) return <div className="p-10 text-center text-red-500">Gateway configuration missing in DB.</div>;

  return (
    <div className="px-6 py-4 max-w-4xl mx-auto font-sans">
      <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <Wallet className="text-blue-600" size={24} /> Payment Hub Settings
      </h2>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        
        {/* TOP TOGGLE HEADER */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-black text-gray-800">Mock vs Real Payments</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5 opacity-80">
              Easily toggle between testing mode and actual money collection
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span className={`text-xs font-black tracking-widest uppercase ${gateway.isTestMode ? "text-orange-500" : "text-gray-400"}`}>
               Mock Payment
            </span>
            <button
              onClick={() => handleChange("isTestMode", !gateway.isTestMode)}
              className={`w-16 h-8 flex items-center rounded-full p-1 transition-all duration-300 shadow-inner ${
                !gateway.isTestMode ? "bg-green-500" : "bg-orange-400"
              }`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                !gateway.isTestMode ? "translate-x-8" : "translate-x-0"
              }`} />
            </button>
            <span className={`text-xs font-black tracking-widest uppercase ${!gateway.isTestMode ? "text-green-600" : "text-gray-400"}`}>
               Real Payment
            </span>
          </div>
        </div>

        {/* DYNAMIC CONTENT BASED ON TOGGLE */}
        {gateway.isTestMode ? (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-8 rounded-xl mb-8 text-center transition-all duration-500">
            <Banknote size={48} className="mx-auto mb-4 opacity-50" />
            <h4 className="font-black text-xl uppercase tracking-wider">Mock Mode is Active</h4>
            <p className="text-sm mt-3 opacity-80 max-w-lg mx-auto">
              Students will <b>not</b> be charged real money. A dummy payment order will be created and marked as successful automatically. Perfect for testing your app flow.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-8 rounded-xl mb-8 transition-all duration-500">
            <h4 className="font-black text-green-800 text-lg mb-6 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle size={22} /> Live Payment Mode Active
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-green-900 tracking-widest mb-2 opacity-70 uppercase">
                  Live API Key
                </label>
                <input
                  type="text"
                  value={gateway.keyId}
                  onChange={(e) => handleChange("keyId", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all"
                  placeholder="rzp_live_xxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-green-900 tracking-widest mb-2 opacity-70 uppercase">
                  Live Secret Key
                </label>
                <input
                  type="password"
                  value={gateway.keySecret}
                  onChange={(e) => handleChange("keySecret", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-green-200 bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all"
                  placeholder="****************"
                />
                <p className="text-[10px] text-green-700 mt-2 font-bold uppercase tracking-wider opacity-70">Keep empty to retain existing secret.</p>
              </div>
            </div>
          </div>
        )}

        {/* COMMON SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-xs font-black text-gray-700 tracking-widest mb-2 opacity-70 uppercase">Currency</label>
              <select
                value={gateway.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-700 tracking-widest mb-2 opacity-70 uppercase">Gateway Theme Color</label>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-gray-200 w-max">
                    <input 
                        type="color" 
                        value={gateway.themeColor}
                        onChange={(e) => handleChange("themeColor", e.target.value)}
                        className="h-8 w-12 p-0.5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-gray-600 font-black text-xs tracking-widest uppercase pr-3">{gateway.themeColor}</span>
                </div>
            </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
                onClick={handleSave}
                className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 px-8 rounded shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest"
            >
                <Save size={16} /> Save Payment Settings
            </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentGatewaySettings;