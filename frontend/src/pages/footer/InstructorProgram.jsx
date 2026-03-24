import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";
import { GraduationCap, Award, BarChart3, Users } from "lucide-react";

const InstructorProgram = () => {
  return (
    <StaticPageLayout 
      title="Instructor Program" 
      subtitle="Join a community of elite educators and reach thousands of students across the nation."
    >
      <div className="space-y-16">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Why Teach with MYE 3 Academy?</h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            We provide the tools, the audience, and the technology. You provide the expertise and the content. 
            Together, we can bridge the gap in quality education for competitive exams.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex gap-6">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0 h-fit">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Monetize Expertise</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Create premium test series and courses. Earn industry-leading commission on every sale.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex gap-6">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0 h-fit">
              <BarChart3 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Advanced Analytics</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Understand student pain points with detailed heatmaps and accuracy statistics for your questions.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex gap-6">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 shrink-0 h-fit">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Massive Reach</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Your content will be available to thousands of registered students from premium institutions.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex gap-6">
            <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shrink-0 h-fit">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Platform Support</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Enjoy 24/7 technical support and a dedicated account manager to help you scale your digital presence.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl font-black mb-6 tracking-tight">Ready to Become an Instructor?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
            The application process takes less than 5 minutes. Apply today and our team will review your profile.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg">
              Apply Now
            </button>
            <button className="px-10 py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 transition-all border border-indigo-400">
              View Guidelines
            </button>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default InstructorProgram;
