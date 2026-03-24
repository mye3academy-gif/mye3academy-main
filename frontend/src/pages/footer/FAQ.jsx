import React from "react";
import { Link } from "react-router-dom";
import StaticPageLayout from "../../components/common/StaticPageLayout";
import { HelpCircle, ChevronRight } from "lucide-react";

/**
 * Clean, modern accordion-style FAQ component.
 */
const FAQItem = ({ question, answer }) => {
  return (
    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-6 md:p-8 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-3">
        <HelpCircle className="w-5 h-5 text-indigo-500 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
          {question}
        </h3>
      </div>
      <p className="text-slate-600 font-medium leading-relaxed ml-9">
        {answer}
      </p>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How do I purchase a test series?",
      answer: "Once you log in as a student, navigate to the 'All Test Series' page. Choose the test you want, click 'Buy Now', and follow the payment gateway instructions. Your test will be activated immediately."
    },
    {
      question: "Can I take tests on my mobile phone?",
      answer: "Yes! MYE 3 Academy is fully optimized for mobile browsers. You can also download our native app from the Play Store for a smoother experience."
    },
    {
      question: "What happens if my internet disconnects during a test?",
      answer: "Don't worry. Our platform auto-saves your progress every 30 seconds. You can resume from where you left off if you reconnect within the exam time limit."
    },
    {
      question: "Are the mock tests based on the latest syllabus?",
      answer: "Absolutely. Our expert instructors update the question banks monthly to ensure they reflect the latest patterns and difficulty levels of competitive exams."
    },
    {
      question: "How do I contact an instructor for doubt clarification?",
      answer: "Each test series has a 'Doubts' section. You can post your question there, and the assigned instructor will respond within 24-48 hours."
    }
  ];

  return (
    <StaticPageLayout 
      title="Help Center / FAQ" 
      subtitle="Find answers to common questions about our platform, payments, and technical support."
    >
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      <div className="mt-16 p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Still have questions?</h2>
          <p className="text-slate-600 font-semibold tracking-tight">We're here to help you solve your problems.</p>
        </div>
        <Link 
          to="/contact" 
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <span>Contact Support</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </StaticPageLayout>
  );
};

export default FAQ;
