"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "../store/useAccountStore";
import { useSession } from "next-auth/react";
import AuthWrapper from "../Components/AuthWrapper";
import { getUserSession } from "../utils/user";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { addDays, subDays } from "date-fns";
import {
  ChevronDown, Search, ShoppingBag, ArrowUpRight,
  CheckCircle2, Sparkles, ShieldCheck,
  BarChart3, Building2, Calendar,
} from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import AuditLimitModal from "../Components/AuditLimitModal";
import ContactFormModal from "../Components/ContactFormModal";
import { checkAuditCount } from "../utils/Auditcountutils";
import { toast } from "../store/useToastStore";
import { useUsageStore } from "../store/useUsageStore";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono-tech" });

const ORANGE = "#F97316";
const BLUE   = "#1A73E8";
const SLATE  = "#0F172A";

const Home = () => {
  const {
    accounts, properties, selectedAccount, selectedProperty,
    accountSelected, fetchAccountSummaries, fetchPropertySummaries,
    selectAccount, selectProperty, loading, hasFetchedAccounts,
    setAuditCompleted, setReadyToRunAudit, setAuditRunCompleted,
    setDateRange, dateRange, isEcommerce, setIsEcommerce,
  } = useAccountStore();
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);
  const [auditCount, setAuditCount] = useState(0);
  const [auditLimit, setAuditLimit] = useState(5);
  const [auditCountLoading, setAuditCountLoading] = useState(true);
  const auditCountFetchedRef = useRef(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [checkingAuditLimit, setCheckingAuditLimit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const isValidDateRange = (start, end) => {
    if (!start || !end) return false;
    const diff = moment(end).diff(moment(start), "days");
    const today = moment().endOf("day");
    return diff === 29 && moment(end).isSameOrBefore(today);
  };

  const { data: session, status } = useSession();
  const dropdownRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const user = getUserSession();
  const router = useRouter();

  const role = useUsageStore((s) => s.role);
  const usageLoading = useUsageStore((s) => s.loading);
  const isUnlimited = role === "superadmin";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status]);

  useEffect(() => {
    if (!session?.user?.email) return;
    if (auditCountFetchedRef.current) return;
    auditCountFetchedRef.current = true;
    setAuditCountLoading(true);
    (async () => {
      try {
        const result = await checkAuditCount(session.user.email);
        if (result.success) {
          setAuditCount(result.data.auditCount);
          setAuditLimit(result.data.auditLimit);
        }
      } finally {
        setAuditCountLoading(false);
      }
    })();
  }, [session?.user?.email]);

  useEffect(() => {
    if (hasFetchedAccounts) {
      setLoadingAccounts(false);
      return;
    }
    if (status !== "authenticated" || !session) {
      setLoadingAccounts(true);
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setLoadingAccounts(true);
    const userData = { given_name: user };
    fetchAccountSummaries(userData, router).finally(() => setLoadingAccounts(false));
  }, [status, session?.user?.email, hasFetchedAccounts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccount = (account) => {
    selectAccount(account);
    setLoadingProperties(true);
    fetchPropertySummaries(account?.account).finally(() =>
      setLoadingProperties(false)
    );
    setDropdownOpen(false);
  };

  const handleProperty = (e) => {
    const propertyName = e.target.value;
    if (propertyName === "") selectProperty(null);
    else {
      const property = properties?.find((prop) => prop.name === propertyName);
      selectProperty(property);
    }
  };

  const handleSubmit = async () => {
    if (!isValidDateRange(startDate, endDate)) {
      toast.error("Please select a valid 30-day date range before submitting.");
      return;
    }
    setCheckingAuditLimit(true);
    const result = await checkAuditCount(session?.user?.email);
    if (!result.success) {
      toast.error("Failed to verify audit limit. Please try again.");
      setCheckingAuditLimit(false);
      return;
    }
    setAuditCount(result.data.auditCount);
    setAuditLimit(result.data.auditLimit);
    if (result.data.hasReachedLimit) {
      setShowLimitModal(true);
      setCheckingAuditLimit(false);
      return;
    }
    setCheckingAuditLimit(false);
    const formattedStart = moment(startDate).format("YYYY-MM-DD");
    const formattedEnd = moment(endDate).format("YYYY-MM-DD");
    await setDateRange(formattedStart, formattedEnd);
    useAccountStore.getState().setAuditData("__dateRange__", {
      startDate: formattedStart,
      endDate: formattedEnd,
    });
    setTimeout(() => {
      setReadyToRunAudit(true);
      setAuditCompleted(false);
      setAuditRunCompleted(false);
      router.push("/auditPreview");
    }, 500);
  };

  const today = new Date();
  const maxStartDate = subDays(today, 31);
  const maxEndDate = subDays(today, 2);
  const handleDateChange = (date) => { setStartDate(date); setEndDate(addDays(date, 29)); };
  const handleEmdDateChange = (date) => { setEndDate(date); setStartDate(subDays(date, 29)); };

  const auditUsagePct = auditLimit ? Math.min(100, (auditCount / auditLimit) * 100) : 0;
  const usageNearLimit = auditCount >= auditLimit;

  const stepDone = {
    account: !!accountSelected,
    property: !!selectedProperty,
    range: !!(startDate && endDate),
  };
  const stepsCompleted = Object.values(stepDone).filter(Boolean).length;

  const canSubmit =
    accountSelected && selectedProperty && !loadingAccounts &&
    !loadingProperties && !loading && !checkingAuditLimit;

  return (
    <AuthWrapper>
      {/* ============================================================
          HOME — Audit Setup Console
          Brand-matched: orange + blue + slate, no gradients,
          per-item load animations, analytics wallpaper backdrop.
          ============================================================ */}
      <div className={`${mono.variable} relative w-full min-h-full text-content bg-surface-muted overflow-hidden`}>

        <Backdrop />

        <div className="relative z-10 mx-auto w-full max-w-[1180px] 3xl:max-w-[1380px] px-5 sm:px-8 lg:px-12 py-8 lg:py-10">

          {/* ────────── MINIMAL HEADER ──────────
               Tiny breadcrumb-style strip — just enough context to anchor
               the page. The form below is the focus, not the title. */}
          <div className="flex items-center justify-between gap-4 mb-5" style={anim(0)}>
            <div className="flex items-center gap-2.5">
              <span className="block w-1 h-5 rounded-sm" style={{ backgroundColor: ORANGE }} />
              <span className="[font-family:var(--font-mono-tech)] text-[10.5px] uppercase tracking-[0.22em] font-bold text-content-subtle">
                Setup · audit health check
              </span>
            </div>

            {/* Compact role pill — just identity, no big widget */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-surface"
              style={{ borderColor: "rgb(var(--border))" }}>
              <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: isUnlimited ? ORANGE : BLUE }} />
              <span className="[font-family:var(--font-mono-tech)] text-[9.5px] uppercase tracking-[0.18em] font-bold text-content-subtle">role</span>
              <span className="text-[12px] font-bold text-content">{role || "user"}</span>
            </div>
          </div>

          {/* ────────── MAIN FORM — the page is the form ────────── */}
          {/* relative z-20 elevates the whole form (and its dropdown) above
              the footer below — both sections create their own stacking
              contexts via the rise-in transform, and we need the form on top. */}
          <section style={anim(120)} className="relative z-20">
            <ConsoleCard
              isUnlimited={isUnlimited}
              auditCount={auditCount}
              auditLimit={auditLimit}
              auditUsagePct={auditUsagePct}
              auditCountLoading={auditCountLoading}
              usageLoading={usageLoading}
              usageNearLimit={usageNearLimit}
              stepDone={stepDone}
              stepsCompleted={stepsCompleted}
              accounts={accounts}
              properties={properties}
              selectedAccount={selectedAccount}
              selectedProperty={selectedProperty}
              accountSelected={accountSelected}
              loadingAccounts={loadingAccounts}
              loadingProperties={loadingProperties}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleAccount={handleAccount}
              handleProperty={handleProperty}
              dropdownRef={dropdownRef}
              startDate={startDate}
              endDate={endDate}
              handleDateChange={handleDateChange}
              handleEmdDateChange={handleEmdDateChange}
              maxStartDate={maxStartDate}
              maxEndDate={maxEndDate}
              isEcommerce={isEcommerce}
              setIsEcommerce={setIsEcommerce}
              handleSubmit={handleSubmit}
              canSubmit={canSubmit}
              loading={loading}
              checkingAuditLimit={checkingAuditLimit}
            />
          </section>

          {/* Footer */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-content-subtle"
            style={anim(820)}>
            <p className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: BLUE }} />
              Read-only access · no data leaves your account
            </p>
            <p className="truncate">
              Signed in as <span className="text-content font-semibold">{session?.user?.email || "—"}</span>
            </p>
          </div>
        </div>
      </div>

      <AuditLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onRequestMore={() => { setShowLimitModal(false); setShowContactModal(true); }}
        auditCount={auditCount}
        auditLimit={auditLimit}
      />
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        userEmail={session?.user?.email}
      />
      {/* Chatbot button + modal are now mounted globally in layout.js so they
          appear on every authenticated route — no need to render them here. */}
    </AuthWrapper>
  );
};

/* ============================================================
   ANIMATION HELPERS
   ============================================================ */

// Inline style for staggered fade-up using existing rise-in keyframe
const anim = (delay = 0) => ({
  animation: "rise-in 700ms cubic-bezier(0.22,1,0.36,1) both",
  animationDelay: `${delay}ms`,
});

/* ============================================================
   BACKDROP — subtle dot grid + soft brand glows
   ============================================================ */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.10]"
        style={{
          backgroundImage: "radial-gradient(rgba(15,23,42,0.55) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
        }} />
      <div className="absolute inset-0 opacity-0 dark:opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)",
        }} />
      {/* Solid blocks corner accents */}
      <div className="absolute top-0 left-0 w-1.5 h-32 hidden lg:block" style={{ backgroundColor: ORANGE }} />
      <div className="absolute top-0 left-0 w-32 h-1.5 hidden lg:block" style={{ backgroundColor: ORANGE }} />
      <div className="absolute bottom-0 right-0 w-1.5 h-32 hidden lg:block" style={{ backgroundColor: BLUE }} />
      <div className="absolute bottom-0 right-0 w-32 h-1.5 hidden lg:block" style={{ backgroundColor: BLUE }} />
    </div>
  );
}

/* ============================================================
   QUOTA DIAL — orange/blue, no gradient
   ============================================================ */
function QuotaDial({ count, limit, pct, isUnlimited, loading, near }) {
  const size = 80;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const endAngle = 405;
  const sweep = 270;
  const filledSweep = isUnlimited ? sweep : (pct / 100) * sweep;

  const polarToXY = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arcPath = (start, end) => {
    const [x1, y1] = polarToXY(start);
    const [x2, y2] = polarToXY(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const accent = isUnlimited ? ORANGE : near ? "#EF4444" : ORANGE;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke="rgb(var(--border))" strokeWidth={stroke} strokeLinecap="round" />
        {!loading && (
          <path d={arcPath(startAngle, startAngle + Math.max(2, filledSweep))} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
            style={{ transition: "stroke 0.3s, d 0.7s" }} />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {loading ? (
          <span className="block h-5 w-9 skeleton-shimmer rounded-sm" />
        ) : isUnlimited ? (
          <>
            <span className="text-[26px] leading-none font-bold" style={{ color: ORANGE }}>∞</span>
            <span className="mt-0.5 [font-family:var(--font-mono-tech)] text-[8px] tracking-[0.18em] uppercase text-content-subtle font-bold">unltd</span>
          </>
        ) : (
          <>
            <span className="text-[20px] leading-none font-bold tabular-nums text-content">{count}</span>
            <span className="mt-0.5 [font-family:var(--font-mono-tech)] text-[8.5px] tracking-[0.18em] uppercase text-content-subtle font-bold">of {limit}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN FORM CARD
   ============================================================ */
function ConsoleCard(p) {
  return (
    <article className="relative rounded-2xl border-2 border-line bg-surface shadow-[0_24px_60px_-28px_rgba(15,23,42,0.20)]">
      {/* Top brand stripe — solid blocks. Rounded so it follows the
          card's top corners now that the parent isn't overflow-clipped. */}
      <div className="flex h-[3px] rounded-t-2xl overflow-hidden">
        <div className="flex-[3]" style={{ backgroundColor: ORANGE }} />
        <div className="flex-[2]" style={{ backgroundColor: BLUE }} />
        <div className="flex-1" style={{ backgroundColor: SLATE }} />
      </div>

      {/* HEADER */}
      <div className="relative flex items-start sm:items-center gap-5 px-7 py-6 border-b border-line flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            style={{ backgroundColor: ORANGE }}>
            <Sparkles size={10} strokeWidth={2.5} />
            Configure
          </div>
          <h2 className="text-[22px] 3xl:text-[26px] font-bold text-content tracking-tight leading-tight mt-2">
            Configure your audit
          </h2>
          <p className="text-[13px] 3xl:text-[14px] text-content-muted mt-1 leading-snug">
            Read-only Google Analytics access · 30-day setup window
          </p>
        </div>

        {/* Right side: step ribbon + quota dial */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl border border-line bg-surface-muted/40">
            <div className="flex items-center gap-1.5">
              {[p.stepDone.account, p.stepDone.property, p.stepDone.range].map((d, i) => (
                <span key={i} className="block h-1.5 rounded-full transition-all"
                  style={{
                    width: d ? 24 : 6,
                    backgroundColor: d ? BLUE : "rgb(var(--border-strong))",
                  }} />
              ))}
            </div>
            <div className="text-[11.5px] text-content-muted">
              <span className="font-bold text-content">{p.stepsCompleted}</span>
              <span className="text-content-subtle"> / 3</span>
            </div>
          </div>

          {/* Compact quota dial */}
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-line">
            <QuotaDial
              count={p.auditCount}
              limit={p.auditLimit}
              pct={p.auditUsagePct}
              isUnlimited={p.isUnlimited}
              loading={p.auditCountLoading || p.usageLoading}
              near={p.usageNearLimit}
            />
            <div className="text-right">
              <div className="[font-family:var(--font-mono-tech)] text-[9.5px] uppercase tracking-[0.18em] font-bold text-content-subtle">
                Quota
              </div>
              <div className="text-[10.5px] text-content-subtle font-medium">
                this month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INPUTS */}
      <div className="px-7 py-7 grid grid-cols-1 lg:grid-cols-2 gap-x-7 gap-y-6">
        {/* Account wrapper has highest z-index so its dropdown paints above
            the Window/Modules row stacking contexts created by their own
            translate3d transforms. */}
        <div style={anim(560)} className="relative z-30">
          <FieldRow n="01" label="Account" done={p.stepDone.account}>
            <AccountField {...p} />
          </FieldRow>
        </div>
        <div style={anim(620)} className="relative z-20">
          <FieldRow n="02" label="Property" done={p.stepDone.property}>
            <PropertyField {...p} />
          </FieldRow>
        </div>
        <div style={anim(680)}>
          <FieldRow n="03" label="Window" done={p.stepDone.range} hint="Exactly 30 days · excludes today &amp; yesterday">
            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Start" value={p.startDate} max={moment(p.maxStartDate).format("YYYY-MM-DD")} onChange={p.handleDateChange} />
              <DateInput label="End" value={p.endDate} max={moment(p.maxEndDate).format("YYYY-MM-DD")} onChange={p.handleEmdDateChange} />
            </div>
          </FieldRow>
        </div>
        <div style={anim(740)}>
          <FieldRow n="04" label="Modules">
            <EcomToggle isEcommerce={p.isEcommerce} setIsEcommerce={p.setIsEcommerce} />
          </FieldRow>
        </div>
      </div>

      {/* EXECUTE STRIP */}
      <div className="relative px-7 py-5 border-t-2 border-line flex items-center justify-between gap-4 flex-wrap rounded-b-2xl" style={{ backgroundColor: SLATE }}>
        {/* Left: live status */}
        <div className="flex items-center gap-3 text-white">
          <span className="block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: p.canSubmit ? ORANGE : "rgba(255,255,255,0.3)" }} />
          <span className="[font-family:var(--font-mono-tech)] text-[10.5px] uppercase tracking-[0.18em] font-bold">
            {p.canSubmit ? "Ready to launch" : `${p.stepsCompleted} of 3 ready`}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ backgroundColor: "rgba(26,115,232,0.18)", color: "#93C5FD", border: "1px solid rgba(26,115,232,0.35)" }}>
            <ShieldCheck size={11} strokeWidth={2.5} />
            Read-only
          </span>
        </div>

        <button
          onClick={p.handleSubmit}
          disabled={!p.canSubmit}
          className={`group inline-flex items-center justify-center gap-2 h-11 3xl:h-12 px-6 3xl:px-7 rounded-xl text-[13.5px] 3xl:text-[14px] font-bold transition-all ${
            p.canSubmit ? "text-white hover:-translate-y-0.5" : "cursor-not-allowed"
          }`}
          style={p.canSubmit
            ? { backgroundColor: ORANGE, boxShadow: "0 14px 30px -10px rgba(249,115,22,0.55)" }
            : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
        >
          {p.loading || p.checkingAuditLimit ? (
            <>
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/80 border-t-transparent" />
              Verifying
            </>
          ) : (
            <>
              Run health checks
              <ArrowUpRight size={15} strokeWidth={2.6} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   FIELD ROW
   ============================================================ */
function FieldRow({ n, label, done, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold tabular-nums transition-all`}
          style={done
            ? { backgroundColor: BLUE, color: "white" }
            : { backgroundColor: "rgba(15,23,42,0.06)", color: "rgb(var(--content-muted))", border: "1px solid rgb(var(--border))" }}>
          {done ? <CheckCircle2 size={11} strokeWidth={3} /> : n}
        </span>
        <span className="text-[12px] font-bold uppercase tracking-[0.10em] text-content">
          {label}
        </span>
        {hint && (
          <>
            <span className="flex-1 h-px bg-line ml-1" />
            <span className="[font-family:var(--font-mono-tech)] text-[9.5px] uppercase tracking-[0.14em] text-content-subtle font-semibold" dangerouslySetInnerHTML={{ __html: hint }} />
          </>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ============================================================
   ACCOUNT FIELD
   ============================================================ */
function AccountField(p) {
  return (
    <div className="relative" ref={p.dropdownRef}>
      <button
        type="button"
        onClick={() => !p.loadingAccounts && p.setDropdownOpen(!p.dropdownOpen)}
        disabled={p.loadingAccounts}
        aria-busy={p.loadingAccounts}
        className={`w-full flex items-center justify-between gap-3 h-11 px-3.5 rounded-lg border-2 text-[13.5px] transition-all bg-surface ${
          p.loadingAccounts ? "cursor-not-allowed border-line" : "hover:border-content-subtle/40"
        }`}
        style={p.dropdownOpen ? { borderColor: ORANGE, boxShadow: `0 0 0 3px rgba(249,115,22,0.18)` } : { borderColor: "rgb(var(--border))" }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Building2 size={14} strokeWidth={2.4} className={p.selectedAccount ? "" : "text-content-subtle"} style={p.selectedAccount ? { color: ORANGE } : {}} />
          {p.loadingAccounts ? (
            <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
          ) : (
            <span className={`truncate ${p.selectedAccount ? "font-semibold text-content" : "text-content-subtle"}`}>
              {p.selectedAccount?.displayName || "Select an account"}
            </span>
          )}
        </div>
        {p.loadingAccounts ? (
          <span className="block h-4 w-4 skeleton-shimmer rounded-full flex-shrink-0" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-content-muted flex-shrink-0 transition-transform ${p.dropdownOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {p.dropdownOpen && !p.loadingAccounts && (
        <div className="absolute z-30 left-0 right-0 w-full rounded-xl border-2 border-line bg-surface-elevated shadow-[0_24px_50px_-12px_rgba(15,23,42,0.25)] overflow-hidden bottom-[calc(100%+6px)] 2xl:bottom-auto 2xl:top-[calc(100%+6px)]">
          <div className="p-2 border-b-2 border-line">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-subtle" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={p.searchTerm}
                onChange={(e) => p.setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 rounded-md text-[13px] bg-surface-muted border-2 border-line placeholder:text-content-subtle focus:outline-none transition-all"
                onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
                onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border))"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>
          <div className="max-h-80 lg:max-h-[100px] xl:max-h-[200px] 2xl:max-h-[250px] overflow-y-auto py-1">
            {p.accounts
              ?.filter((acc) => acc?.displayName?.toLowerCase().includes(p.searchTerm.toLowerCase()))
              ?.map((account) => {
                const active = p.selectedAccount?.account === account?.account;
                return (
                  <button
                    type="button"
                    key={account?.account}
                    onClick={() => p.handleAccount(account)}
                    className="w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors hover:bg-surface-hover"
                    style={active ? { backgroundColor: "rgba(249,115,22,0.08)", color: ORANGE, fontWeight: 600 } : {}}>
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: active ? ORANGE : "rgb(var(--border-strong))" }} />
                    <span className="truncate flex-1">{account?.displayName}</span>
                    {active && <CheckCircle2 className="w-4 h-4" style={{ color: ORANGE }} />}
                  </button>
                );
              })}
            {p.accounts?.filter((acc) => acc?.displayName?.toLowerCase().includes(p.searchTerm.toLowerCase())).length === 0 && (
              <div className="px-3 py-5 text-center text-[12.5px] text-content-subtle">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PROPERTY FIELD
   ============================================================ */
function PropertyField(p) {
  if (p.loadingProperties) {
    return (
      <div className="w-full flex items-center justify-between gap-3 h-11 px-3.5 rounded-lg border-2 border-line cursor-not-allowed bg-surface">
        <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
        <span className="block h-4 w-4 skeleton-shimmer rounded-full flex-shrink-0" />
      </div>
    );
  }
  return (
    <div className="relative">
      <select
        onChange={p.handleProperty}
        disabled={!p.accountSelected}
        value={p.selectedProperty?.name || ""}
        className="w-full appearance-none rounded-lg border-2 bg-surface h-11 pl-9 pr-9 text-[13.5px] disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:outline-none"
        style={{
          borderColor: "rgb(var(--border))",
          color: p.selectedProperty ? "rgb(var(--content))" : "rgb(var(--content-subtle))",
          fontWeight: p.selectedProperty ? 600 : 400,
        }}
        onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
        onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border))"; e.target.style.boxShadow = "none"; }}
      >
        <option value="">{!p.accountSelected ? "Select an account first" : "Select a property"}</option>
        {p.properties?.map((property) => (
          <option key={property?.name} value={property?.name}>{property?.displayName}</option>
        ))}
      </select>
      <BarChart3 size={14} strokeWidth={2.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={p.selectedProperty ? { color: ORANGE } : { color: "rgb(var(--content-subtle))" }} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
    </div>
  );
}

/* ============================================================
   DATE INPUT
   ============================================================ */
function DateInput({ label, value, max, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1.5 [font-family:var(--font-mono-tech)] text-[9.5px] tracking-[0.14em] uppercase text-content-subtle font-bold pointer-events-none">{label}</span>
      <Calendar size={13} strokeWidth={2.4} className="absolute right-3 top-2.5 text-content-subtle pointer-events-none" />
      <input
        type="date"
        value={value ? moment(value).format("YYYY-MM-DD") : ""}
        onChange={(e) => onChange(new Date(e.target.value))}
        max={max}
        className="w-full h-[54px] pt-5 pb-1 px-3 rounded-lg border-2 border-line bg-surface text-[13px] focus:outline-none transition-colors tabular-nums hover:border-content-subtle/40 text-content"
        onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
        onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border))"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

/* ============================================================
   ECOMMERCE TOGGLE
   ============================================================ */
function EcomToggle({ isEcommerce, setIsEcommerce }) {
  return (
    <label
      htmlFor="ecommerce"
      className="group flex items-center justify-between gap-3 px-3.5 h-[54px] rounded-lg border-2 cursor-pointer transition-all"
      style={isEcommerce
        ? { borderColor: ORANGE, backgroundColor: "rgba(249,115,22,0.06)" }
        : { borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--surface))" }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-colors text-white"
          style={{ backgroundColor: isEcommerce ? ORANGE : "rgba(15,23,42,0.06)", color: isEcommerce ? "white" : "rgb(var(--content-muted))" }}>
          <ShoppingBag size={15} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-content leading-tight">E-commerce</div>
          <div className="text-[11.5px] text-content-subtle leading-tight truncate">Funnels · items · transactions</div>
        </div>
      </div>
      <Switch checked={isEcommerce} onChange={setIsEcommerce} id="ecommerce" />
    </label>
  );
}

function Switch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      className="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors"
      style={{ backgroundColor: checked ? ORANGE : "rgb(var(--border-strong))" }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

export default Home;
