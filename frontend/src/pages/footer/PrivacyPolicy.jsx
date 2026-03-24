import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";

const PrivacyPolicy = () => {
  return (
    <StaticPageLayout 
      title="Privacy Policy" 
      subtitle="Last updated: March 24, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We collect information that you provide directly to us when you create an account, purchase a test series, or contact our support team.
            This may include your name, email address, phone number, and payment information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">2. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We use the information we collect to provide, maintain, and improve our services, including to process transactions and send you related information, 
            including confirmations and invoices.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 font-medium">
            <li>To personalize your learning experience.</li>
            <li>To analyze performance and improve our AI algorithms.</li>
            <li>To communicate with you about products, services, and events.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">3. Data Security</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, 
            alteration, and destruction. All transactions are processed through secure, encrypted gateways.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">4. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            If you have any questions about this Privacy Policy, please contact us at support@mye3academy.com.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default PrivacyPolicy;
