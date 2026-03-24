import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";

const RefundPolicy = () => {
  return (
    <StaticPageLayout 
      title="Refund Policy" 
      subtitle="Last updated: March 24, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">1. Refund Eligibility</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We offer refunds for our test series under the following conditions:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 font-medium">
            <li>The refund request is made within 24 hours of purchase.</li>
            <li>No more than one mock test has been attempted.</li>
            <li>No content from the test series has been downloaded (if applicable).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">2. Non-Refundable Items</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Fees for certain promotional offers, bundles, or expired test series are non-refundable. 
            Additionally, refunds will not be issued for technical issues caused by the user's internet connection or device incompatibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">3. Refund Process</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            To request a refund, please email support@mye3academy.com with your order ID and the reason for the refund. 
            Once approved, the refund will be processed to the original payment method within 5-7 business days.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default RefundPolicy;
