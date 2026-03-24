import React from "react";
import StaticPageLayout from "../../components/common/StaticPageLayout";

const CookieSettings = () => {
  return (
    <StaticPageLayout 
      title="Cookie Settings" 
      subtitle="Last updated: March 24, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">1. What Are Cookies?</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">2. How We Use Cookies</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            We use cookies for several reasons. Some cookies are required for technical reasons for our Website to operate, 
            and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and 
            target the interests of our users to enhance the experience on our Online Property.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600 font-medium">
            <li>Essential Cookies: Required for logging in and secure transactions.</li>
            <li>Analytics Cookies: Help us understand how our site is being used.</li>
            <li>Functional Cookies: Remember your preferences and settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">3. Managing Your Cookies</h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, 
            including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default CookieSettings;
