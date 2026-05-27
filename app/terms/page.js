import Link from "next/link";

export const metadata = {
  title: "Terms of Service — GA4 Auditor",
  description:
    "Terms of service for the GA4 Auditor tool by AnalyticsLiv.",
};

const EFFECTIVE_DATE = "May 27, 2026";
const CONTACT_EMAIL = "support@analyticsliv.com";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LegalHeader />

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Effective {EFFECTIVE_DATE} · Applies to the GA4 Auditor tool at{" "}
            <span className="font-medium text-slate-700">
              ga4auditor.analyticsliv.com
            </span>
          </p>
        </header>

        <Section title="1. Acceptance">
          <p>
            By signing in to or using GA4 Auditor (the &ldquo;Service&rdquo;),
            you agree to these Terms of Service (the &ldquo;Terms&rdquo;). If
            you do not agree, do not use the Service. The Service is provided
            by <strong>ANALYTICS LIV DIGITAL LLP</strong>{" "}
            (&ldquo;AnalyticsLiv&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>
        </Section>

        <Section title="2. What the Service does">
          <p>
            GA4 Auditor connects to your Google Analytics 4 account, reads your
            configuration, and:
          </p>
          <ul>
            <li>Generates audit reports highlighting configuration issues and recommendations.</li>
            <li>Provides an AI chatbot that answers questions about your GA4 setup.</li>
            <li>
              Applies configuration changes to your GA4 properties{" "}
              <strong>only when you explicitly approve a recommendation</strong>{" "}
              inside the Service.
            </li>
          </ul>
        </Section>

        <Section title="3. Your Google account and authorisation">
          <p>
            The Service uses Google OAuth to access your Google Analytics
            data. You must have the right to access the GA4 properties you
            connect — by signing in you confirm that you do. You can revoke
            our access at any time from{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Service to access Google Analytics data you are not
              authorised to view or modify.
            </li>
            <li>
              Attempt to reverse-engineer, scrape, overload, or otherwise
              disrupt the Service.
            </li>
            <li>
              Use the Service to build a competing product, or to resell
              access to it without our written permission.
            </li>
            <li>
              Use the Service in a way that violates Google&rsquo;s{" "}
              <a
                href="https://developers.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                API Terms of Service
              </a>{" "}
              or any applicable law.
            </li>
          </ul>
        </Section>

        <Section title="5. Plans, quotas, and pricing">
          <p>
            Free accounts may have usage limits (number of audits per period,
            chatbot messages per period, etc.) shown inside the Service. Paid
            plans, if any, are described at the point of purchase. We may
            change limits or pricing with reasonable notice; existing prepaid
            periods will be honoured at the original price.
          </p>
        </Section>

        <Section title="6. Changes you authorise to your GA4 configuration">
          <p>
            When you explicitly accept a recommendation, the Service will
            apply that change to your GA4 property using the
            <code> analytics.edit</code> scope. You are responsible for
            reviewing each change before approving it. We are not liable for
            configuration changes you authorised.
          </p>
        </Section>

        <Section title="7. Service availability">
          <p>
            We try to keep the Service running smoothly but provide it on an
            &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may
            suspend or interrupt the Service for maintenance, security, or
            other operational reasons. The Service depends on the Google
            Analytics API and other third-party services; outages in those
            systems are outside our control.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            Audit recommendations and chatbot answers are provided for
            informational purposes only. They may be incomplete or incorrect
            and should be reviewed by a qualified analyst before acting on
            them. The Service is not a substitute for professional analytics
            advice.
          </p>
          <p>
            To the maximum extent permitted by law, AnalyticsLiv disclaims
            all warranties, express or implied, including warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, AnalyticsLiv will not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or for any loss of profits, revenue, data, or
            goodwill arising from your use of the Service. Our total
            aggregate liability for any claim relating to the Service is
            limited to the amount you paid us in the 12 months preceding the
            claim, or, if you are on a free plan, USD 100.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            You may stop using the Service and revoke its access to your
            Google account at any time. We may suspend or terminate your
            access if you violate these Terms or use the Service in a way
            that risks harm to other users, Google, or us. On termination,
            our right to access your Google data ends and your stored audit
            data is deleted as described in our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Material changes
            will be communicated by email or an in-app notice before they
            take effect. Continued use of the Service after the effective
            date constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="12. Governing law">
          <p>
            These Terms are governed by the laws of India, without regard to
            its conflict-of-laws principles. The courts located in
            Ahmedabad, Gujarat will have exclusive jurisdiction over any
            disputes arising out of or relating to these Terms or the
            Service.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these Terms:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p>
            ANALYTICS LIV DIGITAL LLP · Ahmedabad, Gujarat, India.
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
