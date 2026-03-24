import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";

const About = () => {
  return (
    <StaticPageLayout 
      title="About MYE 3 Academy" 
      subtitle="Empowering students with AI-driven testing and personalized learning paths for exam excellence."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tight">Our Mission</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            At MYE 3 Academy, we believe that every student has the potential to excel. Our mission is to provide 
            accessible, high-quality, and AI-powered practice environments that simulate the pressure of 
            real competitive exams while offering the insights needed for constant improvement.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-black text-indigo-600 mb-4 tracking-tight">AI-Powered</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Our advanced algorithms analyze your performance in real-time to suggest focus areas.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-black text-emerald-600 mb-4 tracking-tight">Real Simulation</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Experience the exact interface and time pressure of the major national competitive exams.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-black text-amber-600 mb-4 tracking-tight">Deep Insights</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Go beyond simple scores with detailed analytics on speed, accuracy, and difficulty levels.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tight">Who We Serve</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            We partner with leading educational institutions and expert instructors across the country to 
            deliver a comprehensive library of over 10,000+ hand-picked practice questions.
          </p>
          <ul className="list-disc pl-6 space-y-4 text-slate-600 font-semibold">
            <li>Competitive entrance exams for engineering & medicine.</li>
            <li>Public sector service commissions and government jobs.</li>
            <li>Professional certification and skill-based assessments.</li>
          </ul>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default About;
