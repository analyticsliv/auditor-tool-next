import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — GA4 Auditor",
  description:
    "Privacy policy for the GA4 Auditor tool by AnalyticsLiv, covering Google Analytics data handling and Limited Use compliance.",
};

const EFFECTIVE_DATE = "May 27, 2026";
const CONTACT_EMAIL = "support@analyticsliv.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LegalHeader />

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Effective {EFFECTIVE_DATE} · Applies to the GA4 Auditor tool at{" "}
            <span className="font-medium text-slate-700">
              ga4auditor.analyticsliv.com
            </span>
          </p>
        </header>

        <Section title="1. Who we are">
          <p>
            GA4 Auditor (the &ldquo;Service&rdquo;) is operated by{" "}
            <strong>ANALYTICS LIV DIGITAL LLP</strong> (&ldquo;AnalyticsLiv&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;). The Service helps users audit
            their Google Analytics 4 (GA4) properties and interact with an AI
            assistant that answers questions about their GA4 configuration.
          </p>
          <p>
            This Privacy Policy applies <em>only</em> to the GA4 Auditor tool.
            Other AnalyticsLiv products and the main analyticsliv.com website
            are governed by their own policies.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>When you sign in with Google, we receive:</p>
          <ul>
            <li>
              <strong>Profile information</strong> — your name, email address,
              and profile picture, used to identify your account.
            </li>
            <li>
              <strong>Google Analytics data</strong> — your GA4 account list,
              property configuration, data streams, events, conversions, custom
              dimensions/metrics, and audience definitions. This is read on
              demand to generate audit reports and to answer your questions in
              the in-app chatbot.
            </li>
            <li>
              <strong>OAuth tokens</strong> — Google-issued access and refresh
              tokens, stored securely so the Service can call the Google
              Analytics API on your behalf without requiring you to log in
              again on every request.
            </li>
            <li>
              <strong>Generated audit reports</strong> — the results of audits
              you run are saved to your account so you can revisit them later.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect payment information, browsing
            history outside the Service, advertising identifiers, or any data
            that is not necessary to provide the Service.
          </p>
        </Section>

        <Section title="3. Google API scopes we request">
          <p>
            The Service requests the following Google OAuth scopes. You see and
            approve each scope on the Google consent screen when you sign in:
          </p>
          <ul>
            <li>
              <code>openid</code>, <code>email</code>, <code>profile</code> —
              to identify you and create your account.
            </li>
            <li>
              <code>
                https://www.googleapis.com/auth/analytics.readonly
              </code>{" "}
              — to read your GA4 account, property, and configuration data so
              we can generate audit reports and answer chatbot questions.
            </li>
            <li>
              <code>https://www.googleapis.com/auth/analytics.edit</code> — to
              apply configuration changes <strong>only when you explicitly
                approve a recommendation inside the Service</strong> (for
              example, enabling enhanced measurement or creating a recommended
              custom dimension). We never modify your GA4 configuration
              without an explicit in-app confirmation from you.
            </li>
          </ul>
        </Section>

        <Section title="4. How we use your information">
          <ul>
            <li>To authenticate you and maintain your session.</li>
            <li>
              To fetch and analyse your GA4 configuration in order to generate
              audit reports.
            </li>
            <li>
              To answer your questions about your GA4 setup through the
              in-app AI chatbot.
            </li>
            <li>
              To save your audit reports to your account so you can view
              them again later.
            </li>
            <li>
              To apply, on your explicit request, configuration changes to
              your GA4 properties.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> use your data for advertising, do not
            sell it, do not share it with third parties for their own
            marketing, and do not use it to train generic machine-learning
            models.
          </p>
        </Section>

        <Section title="5. Google Limited Use disclosure">
          <p>
            The Service&rsquo;s use and transfer of information received from
            Google APIs to any other app will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p>
            Specifically: Google user data accessed via the
            <code> analytics.readonly</code> and <code>analytics.edit</code>{" "}
            scopes is used solely to provide and improve the user-facing
            features of the GA4 Auditor Service, and is not transferred to
            third parties except as necessary to provide those features, to
            comply with applicable law, or as part of a merger, acquisition,
            or sale of assets with notice to affected users.
          </p>
        </Section>

        <Section title="6. Use of AI / chatbot">
          <p>
            The in-app chatbot uses a third-party large language model
            provider to answer your questions about your GA4 configuration.
            When you ask a question, the relevant slice of <em>your own</em>{" "}
            GA4 data is sent to the provider as context for that single
            request. The provider is contractually prohibited from using
            this data to train their models.
          </p>
        </Section>

        <Section title="7. Data storage and retention">
          <ul>
            <li>
              Your account profile, audit reports, and OAuth refresh tokens
              are stored in a managed MongoDB database hosted in a secure
              cloud region.
            </li>
            <li>
              GA4 data fetched at audit time is processed in memory and is{" "}
              <strong>not</strong> stored beyond what is needed to render the
              resulting audit report.
            </li>
            <li>
              Audit reports are retained for as long as your account is
              active so you can revisit them later.
            </li>
            <li>
              The Service currently reads from your Google Analytics
              properties only. We do not write to, or modify, any data in
              your GA4 properties as part of the Service&rsquo;s current
              functionality.
            </li>
          </ul>
        </Section>

        <Section title="8. How to revoke access or request data deletion">
          <ul>
            <li>
              You can revoke the Service&rsquo;s access to your Google
              account at any time from{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
              >
                myaccount.google.com/permissions
              </a>
              . Once revoked, we can no longer call the Google Analytics API
              on your behalf.
            </li>
            <li>
              To request deletion of your account and the data stored about
              you, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from
              the email address you signed up with. We will action verified
              deletion requests within 30 days and confirm by email when the
              data has been removed.
            </li>
          </ul>
        </Section>

        <Section title="9. Your rights">
          <p>
            Depending on where you live, you may have the following rights
            in respect of the personal data we hold about you. We honour
            these rights for all users regardless of jurisdiction:
          </p>
          <ul>
            <li>
              <strong>Access</strong> — request a copy of the personal data
              we hold about you.
            </li>
            <li>
              <strong>Correction</strong> — ask us to correct information
              that is inaccurate or incomplete.
            </li>
            <li>
              <strong>Deletion</strong> — ask us to delete your account and
              associated data, as described in §8.
            </li>
            <li>
              <strong>Portability</strong> — receive a machine-readable copy
              of your data (e.g. your stored audit reports) so you can move
              it elsewhere.
            </li>
            <li>
              <strong>Objection / withdrawal of consent</strong> — withdraw
              your consent for us to process your data at any time, which
              you can do by revoking the Service&rsquo;s Google access
              (see §8) and emailing us to request deletion.
            </li>
            <li>
              <strong>Complaint</strong> — lodge a complaint with your local
              data-protection authority. In India, this is the Data
              Protection Board of India (under the Digital Personal Data
              Protection Act, 2023).
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will
            respond within 30 days.
          </p>
        </Section>

        <Section title="10. Cookies">
          <p>
            The Service uses a single <strong>session cookie</strong>{" "}
            (managed by NextAuth) to keep you signed in between page loads.
            This cookie is essential to the operation of the Service and
            cannot be disabled without losing the ability to use the
            Service.
          </p>
          <p>
            We do <strong>not</strong> use advertising cookies, tracking
            cookies, third-party analytics cookies, or any other cookies
            beyond what is strictly necessary to authenticate you.
          </p>
        </Section>

        <Section title="11. Security">
          <p>
            We use industry-standard measures to protect your data:
            encrypted connections (HTTPS) for all traffic, encrypted
            storage at rest, scoped database credentials, and
            least-privilege access controls for engineering staff. No
            system is perfectly secure, but in the event of a security
            incident that exposes your personal data, we will notify
            affected users without undue delay — and, in any case, within{" "}
            <strong>72 hours</strong> of confirming the incident — by email
            to the address associated with your account.
          </p>
        </Section>

        <Section title="12. Children">
          <p>
            The Service is not directed to children under 18 and we do not
            knowingly collect personal data from them. If you believe a
            child has provided personal data to the Service, please contact
            us and we will delete it.
          </p>
        </Section>

        <Section title="13. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be communicated by email or via an in-app notice
            before they take effect. The &ldquo;Effective&rdquo; date at the
            top of this page indicates when the current version was
            published.
          </p>
        </Section>

        <Section title="14. Contact and grievance officer">
          <p>
            For any questions, complaints, data-protection requests, or
            grievances relating to this Privacy Policy or your personal
            data, please contact our grievance officer at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim
            to acknowledge all such requests within 7 business days and to
            substantively resolve them within 30 days.
          </p>
          <p>
            ANALYTICS LIV DIGITAL LLP. · Ahmedabad, Gujarat, India.
          </p>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <div className="prose prose-slate prose-sm sm:prose-base mt-3 max-w-none text-slate-700 [&_a]:text-blue-600 [&_a:hover]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:mt-3 [&_p:first-child]:mt-0">
        {children}
      </div>
    </section>
  );
}

function LegalHeader() {
  return (
    <header className="relative">
      <div className="absolute inset-x-0 top-0 h-[2px] flex">
        <div className="flex-[3]" style={{ backgroundColor: "#F97316" }} />
        <div className="flex-[2]" style={{ backgroundColor: "#1A73E8" }} />
        <div className="flex-1" style={{ backgroundColor: "#0F172A" }} />
      </div>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img
              src="/Audit_Logo_r.png"
              alt="GA4 Auditor"
              className="h-8 w-auto"
            />
            <span className="font-bold tracking-tight text-[15px] flex items-center gap-1">
              <span style={{ color: "#1A73E8" }}>GA4</span>
              <span style={{ color: "#F97316" }}>Auditor</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-[13px] text-slate-600">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
            <Link
              href="/"
              className="hover:text-slate-900 font-medium text-slate-800"
            >
              Back to app →
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between text-[12px] text-slate-500">
        <span className="font-mono uppercase tracking-[0.18em]">
          © {new Date().getFullYear()} AnalyticsLiv
        </span>
        <span>
          <a
            href="https://analyticsliv.com"
            className="hover:text-slate-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            analyticsliv.com
          </a>
        </span>
      </div>
    </footer>
  );
}
