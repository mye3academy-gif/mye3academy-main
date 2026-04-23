import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <StaticPageLayout 
      title="Contact Support" 
      subtitle="We are here to help you. Reach out to us for any technical issues, billing queries, or general feedback."
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* CONTACT INFO */}
        <div className="space-y-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Get in Touch</h2>
            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
              Have a question or need assistance? Our support team is available 
              Monday to Friday, 9:00 AM to 6:00 PM IST.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase text-[8px] tracking-widest mb-0.5">Email Us</h4>
                <p className="text-slate-600 text-[13px] md:text-base font-bold break-all">support@mye3academy.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase text-[8px] tracking-widest mb-0.5">Call Us</h4>
                <p className="text-slate-600 text-[13px] md:text-base font-bold">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase text-[8px] tracking-widest mb-0.5">Visit Us</h4>
                <p className="text-slate-600 text-[13px] md:text-base font-bold leading-relaxed">
                  MYE 3 Academy,<br />
                  Digital Sector, Suite 404,<br />
                  Hyderabad, Telangana - 500081
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK CONTACT FORM (UI Only) */}
        <div className="bg-slate-50 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 tracking-tight">Send a Message</h2>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com"
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
              <textarea 
                rows="4"
                placeholder="How can we help you today?"
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium resize-none"
              ></textarea>
            </div>

            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group">
              <span>Send Message</span>
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
