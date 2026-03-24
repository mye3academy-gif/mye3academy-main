import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";

const TermsOfService = () => {
  return (
    <StaticPageLayout 
      title="Terms of Service" 
      subtitle="Last updated: March 24, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">1. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            You agree to use our services only for lawful purposes. You must not use our website to post, transmit, or otherwise distribute any material 
            that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, or otherwise objectionable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">2. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            All content on our website is protected by copyright, trademark, and other intellectual property laws. You may not modify, publish, 
            transmit, participate in the transfer or sale of, reproduce, create derivative works from, distribute, perform, display, 
            or in any way exploit any of the content, in whole or in part.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">3. User Accounts</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            You are responsible for maintaining the confidentiality of your account information and password. You also agree to accept responsibility 
            for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">4. Termination</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, 
            for any reason, including for breach of these Terms of Service.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default TermsOfService;
