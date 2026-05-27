"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  ArrowUpRight, ArrowRight, Menu, X, Check, Sparkles, ShieldCheck,
  BarChart3, Zap, Activity, Database, Building2, FileText,
  ShoppingBag, Bot, Gauge, ChevronLeft, ChevronRight,
  Mail, LineChart as LineIcon, Plus,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import ThemeToggle from "./Components/ThemeToggle";

/* ============================================================
   PUBLIC LANDING — /
   - Solid orange (#F97316) + solid blue (#1A73E8) + slate
   - Zero gradients (no bg-gradient, no gradient text, no shine)
   - Each section has a distinct card / layout treatment
   - Sticky nav with on-scroll shadow
   - Hero: 5-card chart carousel (anomaly, findings, funnel, area, radar)
   ============================================================ */

const ORANGE = "#F97316";
const BLUE   = "#1A73E8";
const SLATE  = "#0F172A";

/* ============================================================
   useInView — fires once when element scrolls into viewport.
   Used to trigger entrance animations on each section.
   ============================================================ */
function useInView(threshold = 0.15, rootMargin = "0px 0px -80px 0px") {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current || shown) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [shown, threshold, rootMargin]);
  return [ref, shown];
}

/* Wraps a child with fade-up reveal animation that fires on scroll.
   `delay` (ms) staggers reveals when used in sequence. */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, shown] = useInView();
  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform`}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : "translate3d(0,32px,0)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/* ============================================================
   RevealGroup / RevealChild — share a single observer for many
   nested elements. Each child specifies its own delay so every
   item (eyebrow, headline, button, tile, list item) floats in
   independently as the group enters the viewport.
   ============================================================ */
const RevealCtx = createContext({ shown: false });

function RevealGroup({ children, threshold = 0.15, className = "", as: Tag = "div", style }) {
  const [ref, shown] = useInView(threshold);
  return (
    <RevealCtx.Provider value={{ shown }}>
      <Tag ref={ref} className={className} style={style}>{children}</Tag>
    </RevealCtx.Provider>
  );
}

function RevealChild({
  children,
  delay = 0,
  distance = 18,
  duration = 650,
  className = "",
  as: Tag = "div",
  style,
}) {
  const { shown } = useContext(RevealCtx);
  return (
    <Tag
      className={`${className} will-change-transform`}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${distance}px,0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

export default function Landing() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/home");
  }, [status, router]);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchasePlan, setPurchasePlan] = useState("Pro");

  const openPurchase = (plan) => { setPurchasePlan(plan); setPurchaseOpen(true); };

  return (
    <div className="relative min-h-screen w-full bg-surface-muted text-content overflow-x-hidden">
      <Backdrop />

      <Nav onLogin={() => signIn("google", { callbackUrl: "/home" })} />
      {/* Spacer matches fixed-nav height so first section starts below it */}
      <div aria-hidden className="h-16 lg:h-[72px] 3xl:h-20" />

      <Hero onLogin={() => signIn("google", { callbackUrl: "/home" })} />

      <Stats />

      <Features />

      <HowItWorks onLogin={() => signIn("google", { callbackUrl: "/home" })} />

      <MidCTA onLogin={() => signIn("google", { callbackUrl: "/home" })} />

      <Pricing
        onLogin={() => signIn("google", { callbackUrl: "/home" })}
        onPurchase={openPurchase}
      />

      <FAQ />

      <FinalCTA
        onLogin={() => signIn("google", { callbackUrl: "/home" })}
        onPurchase={() => openPurchase("Pro")}
      />

      <Footer />

      <PurchaseModal open={purchaseOpen} plan={purchasePlan} onClose={() => setPurchaseOpen(false)} />
    </div>
  );
}

/* ============================================================
   BACKDROP — clean dot grid mask, no color blobs
   ============================================================ */

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.20] dark:opacity-[0.10]"
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
    </div>
  );
}

/* ============================================================
   FLUID CONTAINER
   ============================================================ */
function Container({ children, className = "", narrow = false }) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 3xl:px-28 4xl:px-40 ${narrow ? "max-w-[1100px]" : "max-w-[1500px] xl:max-w-[1700px] 2xl:max-w-[1900px] 3xl:max-w-[2400px] 4xl:max-w-[2800px]"} ${className}`}>
      {children}
    </div>
  );
}

/* ============================================================
   NAV — sticky, with on-scroll shadow
   ============================================================ */
function Nav({ onLogin }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-surface/95 backdrop-blur-xl border-b border-line shadow-[0_2px_12px_rgba(15,23,42,0.05)]" : "bg-surface/85 backdrop-blur-md border-b border-line/40"}`}>
      <Container className="h-16 lg:h-[72px] 3xl:h-20 flex items-center justify-between">
        <a href="#top" className="inline-flex items-center gap-2.5 group">
          <img src="/Audit_Logo_r.png" alt="GA4 Auditor Tool" className="h-9 3xl:h-11 w-auto" />
          <span className="font-bold tracking-tight text-[15px] 3xl:text-[18px] flex items-center gap-1">
            <span style={{ color: BLUE }}>GA4</span>
            <span style={{ color: ORANGE }}>Auditor</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="relative px-3.5 py-2 text-sm 3xl:text-base font-medium text-content-muted hover:text-content rounded-md transition-colors group">
              {l.label}
              <span className="absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] bg-[#F97316] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={onLogin}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 3xl:h-10 px-4 text-sm font-medium text-content hover:bg-surface-hover rounded-md transition-colors">
            Sign in
          </button>
          <BrandButton onClick={onLogin} compact>Start free</BrandButton>
          <button onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-surface-hover text-content"
            aria-label="Open menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="md:hidden border-t border-line bg-surface/95 backdrop-blur-xl">
          <Container className="py-3 flex flex-col">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-content rounded-md hover:bg-surface-hover">
                {l.label}
              </a>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   HERO — copy left, chart carousel right (5 charts)
   ============================================================ */
function Hero({ onLogin }) {
  return (
    <section id="top" className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 3xl:pt-28 3xl:pb-36">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.05fr] 3xl:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 3xl:gap-24 items-center">
          <div className="animate-rise-in">
            <div className="inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs 3xl:text-sm font-semibold"
              style={{ borderColor: ORANGE, color: ORANGE, backgroundColor: "rgba(249,115,22,0.06)" }}>
              <Sparkles size={13} strokeWidth={2.5} />
              Audit your GA4 in minutes — not days
            </div>

            <h1 className="mt-5 font-bold tracking-[-0.035em] leading-[1.02] text-content text-[clamp(2.4rem,5vw,4.4rem)] 3xl:text-[clamp(4.2rem,4.5vw,6rem)]">
              The <span style={{ color: ORANGE }}>signal</span> beneath
              <br className="hidden sm:block" /> your <span style={{ color: BLUE }}>analytics.</span>
            </h1>

            <p className="mt-5 text-content-muted text-base sm:text-lg 3xl:text-xl max-w-xl 3xl:max-w-2xl leading-relaxed">
              A precision health check for Google Analytics 4 — surfaces misconfigurations,
              anomalies and tracking gaps with clear, actionable findings. Built for marketers,
              analysts and agency teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <BrandButton onClick={onLogin}>
                Try for free <ArrowUpRight size={16} strokeWidth={2.4} />
              </BrandButton>
              <CTAOutline onClick={onLogin}>
                Sign in to explore <ArrowRight size={15} strokeWidth={2.4} />
              </CTAOutline>
              <CTAGhost href="#pricing">See pricing</CTAGhost>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { k: "No credit card", color: ORANGE },
                { k: "Read-only access", color: BLUE },
                { k: "50+ checks", color: ORANGE },
                { k: "Built-in chatbot", color: BLUE },
              ].map((t) => (
                <div key={t.k} className="flex items-center gap-2 text-xs 3xl:text-sm text-content-muted">
                  <span className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: t.color }}>
                    <Check size={10} className="text-white" strokeWidth={3.5} />
                  </span>
                  {t.k}
                </div>
              ))}
            </div>
          </div>

          <ChartCarousel />
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   CHART CAROUSEL — 5 distinct chart cards
   ============================================================ */
function ChartCarousel() {
  const [scopeRef, inView] = useInView(0.25);
  const slides = [
    { tag: "Anomalies", title: "Conversion anomaly detection", subtitle: "30-day window · auto-flagged", chart: <AnomalyChart /> },
    { tag: "Findings",  title: "Audit findings by category",   subtitle: "8 categories · severity stacked", chart: <FindingsBar /> },
    { tag: "Funnel",    title: "Purchase funnel integrity",    subtitle: "View → cart → checkout → purchase", chart: <FunnelChart /> },
    { tag: "Coverage",  title: "Category health radar",        subtitle: "0–100 score across all dimensions", chart: <HealthRadar /> },
    { tag: "Score",     title: "Overall health breakdown",     subtitle: "Pass · attention · critical", chart: <HealthDonut /> },
  ];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Per-slide reveal: each chart only mounts the first time its slide is active
  // AFTER the carousel has scrolled into view. Once mounted, it stays mounted
  // so we never replay the fill animation on revisits.
  const [seen, setSeen] = useState(() => slides.map(() => false));
  useEffect(() => {
    if (!inView) return;
    setSeen((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  }, [idx, inView]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div ref={scopeRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      className="relative animate-rise-in" style={{ animationDelay: "120ms" }}>

      <div className="relative animate-float">
        <div className="rounded-2xl bg-surface border-2 border-line shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Top brand bar — solid blocks (no gradients) */}
          <div className="flex h-1.5">
            <div className="flex-[3]" style={{ backgroundColor: ORANGE }} />
            <div className="flex-[2]" style={{ backgroundColor: BLUE }} />
            <div className="flex-1" style={{ backgroundColor: SLATE }} />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-line flex items-start justify-between gap-3">
            <div className="min-h-[44px] flex-1">
              {slides.map((s, i) => (
                <div key={i}
                  className={`transition-all duration-300 ${i === idx ? "opacity-100 translate-y-0" : "absolute opacity-0 -translate-y-1 pointer-events-none"}`}>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                    style={{ backgroundColor: ORANGE }}>
                    {s.tag}
                  </div>
                  <div className="text-[13.5px] font-bold text-content mt-1">{s.title}</div>
                  <div className="text-[11.5px] text-content-subtle">{s.subtitle}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={prev} aria-label="Previous"
                className="w-7 h-7 rounded-md border border-line text-content-muted hover:text-content hover:border-content-subtle flex items-center justify-center transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={next} aria-label="Next"
                className="w-7 h-7 rounded-md border border-line text-content-muted hover:text-content hover:border-content-subtle flex items-center justify-center transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Chart stage — each chart mounts the first time ITS slide is active */}
          <div className="relative h-[320px] sm:h-[360px] 3xl:h-[420px]">
            {slides.map((s, i) => (
              <div key={i}
                className={`absolute inset-0 p-4 transition-opacity duration-500 ease-out ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {seen[i] ? s.chart : null}
              </div>
            ))}
            {!seen[idx] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-content-subtle animate-pulse">
                  Loading preview…
                </div>
              </div>
            )}
          </div>

          {/* Footer ticker */}
          <div className="px-5 py-3 border-t border-line flex items-center justify-between text-[11px] text-content-subtle">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
              Live preview · sample data
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6" : "w-1.5"}`}
                  style={{ backgroundColor: i === idx ? ORANGE : "rgb(var(--border-strong))" }} />
              ))}
            </div>
            <span className="font-mono tabular-nums">{idx + 1}/{slides.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   CHARTS — solid colors only
   ============================================================ */

const tooltipStyle = {
  backgroundColor: "rgb(var(--surface-elevated))",
  border: "1px solid rgb(var(--border))",
  borderRadius: "8px",
  fontSize: "11.5px",
  color: "rgb(var(--content))",
};
const tickStyle = { fill: "rgb(var(--chart-axis))", fontSize: 10 };

function AnomalyChart() {
  const data = Array.from({ length: 30 }, (_, i) => {
    const base = 4.2 + Math.sin(i / 3) * 0.6;
    const anomaly = i === 18 ? -2.4 : i === 22 ? 1.6 : 0;
    return { d: `D${i + 1}`, rate: +(base + anomaly).toFixed(2), expected: +base.toFixed(2) };
  });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="rgb(var(--chart-grid))" strokeDasharray="3 3" />
        <XAxis dataKey="d" tick={tickStyle} axisLine={{ stroke: "rgb(var(--chart-grid))" }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={[0, 7]} />
        <Tooltip contentStyle={tooltipStyle} />
        <ReferenceLine y={4.2} stroke={SLATE} strokeDasharray="4 4" strokeOpacity={0.45} />
        <Line type="monotone" dataKey="expected" stroke={SLATE} strokeOpacity={0.4} strokeWidth={1.5} dot={false} animationDuration={1600} />
        <Line type="monotone" dataKey="rate" stroke={ORANGE} strokeWidth={2.5} animationDuration={2000} animationEasing="ease-out"
          dot={({ cx, cy, payload, index }) => {
            const isAnomaly = Math.abs(payload.rate - payload.expected) > 1.5;
            return <circle key={`dot-${index}`} cx={cx} cy={cy} r={isAnomaly ? 5 : 2.5}
              fill={isAnomaly ? "#ef4444" : ORANGE}
              stroke="rgb(var(--surface))" strokeWidth={isAnomaly ? 2 : 1} />;
          }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function FindingsBar() {
  const data = [
    { c: "Tracking",     pass: 12, warn: 3, fail: 1 },
    { c: "Attribution",  pass: 6,  warn: 2, fail: 2 },
    { c: "Events",       pass: 9,  warn: 4, fail: 1 },
    { c: "E-commerce",   pass: 7,  warn: 1, fail: 0 },
    { c: "Retention",    pass: 4,  warn: 2, fail: 1 },
    { c: "Engagement",   pass: 8,  warn: 2, fail: 0 },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke="rgb(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="c" tick={tickStyle} axisLine={{ stroke: "rgb(var(--chart-grid))" }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
        <Bar dataKey="pass" name="Pass" stackId="a" fill={BLUE} animationDuration={1400} animationBegin={100} />
        <Bar dataKey="warn" name="Watch" stackId="a" fill={ORANGE} animationDuration={1400} animationBegin={300} />
        <Bar dataKey="fail" name="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1400} animationBegin={500} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Funnel — horizontal stacked bars. Each bar fills from 0% to its
   target width on mount. Mount only happens after carousel reveal,
   so the user sees the bars sweep in once. */
function FunnelChart() {
  const steps = [
    { label: "Sessions",     value: 100, count: "428,150", color: ORANGE },
    { label: "Add to cart",  value: 38,  count: "162,697", color: "#FB923C" },
    { label: "Checkout",     value: 22,  count: "94,193",  color: BLUE },
    { label: "Purchase",     value: 14,  count: "59,941",  color: "#3B82F6" },
  ];
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full w-full flex flex-col justify-center gap-2.5 px-2 py-1">
      {steps.map((s, i) => {
        const drop = i > 0 ? steps[i - 1].value - s.value : null;
        return (
          <div key={s.label} className="relative">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[11.5px] font-bold text-content">{s.label}</span>
              <div className="flex items-center gap-2">
                {drop !== null && (
                  <span className="text-[10px] font-mono tabular-nums font-semibold" style={{ color: ORANGE }}>
                    −{drop}%
                  </span>
                )}
                <span className="text-[10.5px] font-mono tabular-nums text-content-muted">{s.count}</span>
              </div>
            </div>
            <div className="relative h-7 w-full rounded-md bg-line/60 dark:bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-md flex items-center justify-end pr-2.5"
                style={{
                  width: filled ? `${s.value}%` : "0%",
                  backgroundColor: s.color,
                  transition: "width 1100ms cubic-bezier(0.22,1,0.36,1)",
                  transitionDelay: `${i * 140}ms`,
                }}
              >
                <span className="text-[10.5px] font-bold text-white font-mono tabular-nums opacity-90">{s.value}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HealthRadar() {
  const data = [
    { axis: "Tracking",    score: 88 },
    { axis: "Attribution", score: 72 },
    { axis: "Events",      score: 81 },
    { axis: "E-com",       score: 65 },
    { axis: "Retention",   score: 78 },
    { axis: "Engagement",  score: 92 },
    { axis: "Streams",     score: 85 },
    { axis: "Identity",    score: 70 },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
        <PolarGrid stroke="rgb(var(--chart-grid))" />
        <PolarAngleAxis dataKey="axis" tick={{ ...tickStyle, fontSize: 10.5, fontWeight: 600 }} />
        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Radar dataKey="score" stroke={ORANGE} fill={ORANGE} fillOpacity={0.22} strokeWidth={2.5} animationDuration={2000} animationEasing="ease-out" isAnimationActive />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function HealthDonut() {
  const data = [
    { name: "Pass", value: 52, fill: BLUE },
    { name: "Watch", value: 17, fill: ORANGE },
    { name: "Critical", value: 6, fill: "#ef4444" },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const passPct = Math.round((data[0].value / total) * 100);
  return (
    <div className="grid grid-cols-2 gap-4 h-full items-center">
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="58%" outerRadius="92%" startAngle={90} endAngle={-270} paddingAngle={2} stroke="rgb(var(--surface))" strokeWidth={2} animationDuration={1800} animationEasing="ease-out">
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-bold tabular-nums text-content tracking-tight leading-none text-[36px]">
            {passPct}<span className="text-[18px] text-content-subtle">%</span>
          </div>
          <div className="text-[9.5px] tracking-[0.18em] uppercase text-content-subtle font-semibold mt-1">Pass rate</div>
        </div>
      </div>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-line bg-surface-muted/40">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.fill }} />
            <span className="text-[12.5px] font-semibold text-content">{d.name}</span>
            <span className="ml-auto font-mono tabular-nums text-[14px] font-bold text-content">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   STATS — horizontal ticker style (no cards, solid blocks)
   ============================================================ */
function Stats() {
  const stats = [
    { k: "50+",    l: "Health checks",    icon: ShieldCheck, color: ORANGE },
    { k: "30/90d", l: "Anomaly window",   icon: Activity,    color: BLUE },
    { k: "8",      l: "Audit categories", icon: BarChart3,   color: ORANGE },
    { k: "GA4",    l: "Built-in chatbot", icon: Bot,         color: BLUE },
  ];
  return (
    <section className="relative border-y-2 border-line bg-surface">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 90}>
            <div className="flex items-center gap-4 px-4 lg:px-6 py-7 group">
              <div className="w-12 h-12 lg:w-14 lg:h-14 3xl:w-16 3xl:h-16 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{ backgroundColor: s.color }}>
                <s.icon size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div className="font-bold text-content tracking-tight text-2xl sm:text-3xl 3xl:text-4xl">{s.k}</div>
                <div className="text-[10.5px] 3xl:text-xs tracking-[0.16em] uppercase text-content-subtle font-semibold mt-0.5">{s.l}</div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   FEATURES — "ledger entry" style, NOT uniform cards.
   2-column rows, accent rail, big slate number, content beside.
   ============================================================ */
function Features() {
  const cards = [
    { icon: Database,    title: "Data streams & properties",    desc: "Validates property setup, data streams, retention windows and timezone integrity.", color: ORANGE },
    { icon: ShieldCheck, title: "Attribution & domains",        desc: "Confirms attribution model, cross-domain tracking and active hostnames.", color: BLUE },
    { icon: Zap,         title: "Events & key events",          desc: "Audits event taxonomy, key events, parameters and missing conventions.", color: ORANGE },
    { icon: BarChart3,   title: "Conversion anomaly sweep",     desc: "90-day rolling anomaly detection across conversions and engagement metrics.", color: BLUE },
    { icon: ShoppingBag, title: "E-commerce integrity",         desc: "Funnels, item-level data, transaction IDs, duplicates and revenue health.", color: ORANGE },
    { icon: Gauge,       title: "Engagement & retention",       desc: "Session quality, engagement rate, retention cohorts and bounce signals.", color: BLUE },
    { icon: Bot,         title: "GA4 chatbot built-in",         desc: "Ask any GA4 question — best-practice answers without leaving the app.", color: ORANGE },
    { icon: FileText,    title: "Branded PDF report",           desc: "Export the full audit as a print-ready PDF, in light theme regardless of UI mode.", color: BLUE },
  ];

  return (
    <section id="features" className="relative py-20 lg:py-28 3xl:py-36">
      <Container>
        <SectionHeader
          eyebrow="Capabilities"
          title="Eight categories. One health check."
          subtitle="Everything we test sits inside one of these audit dimensions, surfaced as discrete findings you can fix."
        />

        {/* Ledger entries — not cards, just rows with rails */}
        <div className="mt-14 lg:mt-16 grid md:grid-cols-2 gap-x-10 lg:gap-x-16 3xl:gap-x-24 gap-y-0">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 80 + Math.floor(i / 2) * 60}>
              <LedgerRow index={i} {...c} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function LedgerRow({ index, icon: Icon, title, desc, color }) {
  const [hover, setHover] = useState(false);
  const num = String(index + 1).padStart(2, "0");
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative grid grid-cols-[auto_auto_1fr] gap-5 lg:gap-7 py-7 lg:py-8 border-b border-line last:border-b-0 md:[&:nth-last-child(2)]:border-b-0 transition-colors hover:bg-surface/40 dark:hover:bg-white/[0.02]"
    >
      {/* Left rail — solid color block, grows on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
        style={{ backgroundColor: hover ? color : "transparent" }} />

      {/* Big slate index number */}
      <div className="font-bold pl-3 tabular-nums leading-none text-[44px] 3xl:text-[56px] tracking-tight transition-colors duration-300 select-none w-[60px] 3xl:w-[80px]"
        style={{ color: hover ? color : "rgb(var(--content-subtle))", opacity: hover ? 1 : 0.35 }}>
        {num}
      </div>

      {/* Icon block */}
      <div className="w-12 h-12 3xl:w-14 3xl:h-14 rounded-lg flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: hover ? color : "transparent",
          border: `2px solid ${color}`,
          color: hover ? "white" : color,
        }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 pl-1">
        <h3 className="text-[16px] 3xl:text-[18px] font-bold text-content tracking-tight">{title}</h3>
        <p className="mt-1.5 text-[13.5px] 3xl:text-[15px] text-content-muted leading-relaxed">{desc}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold transition-opacity duration-300"
          style={{ color, opacity: hover ? 1 : 0 }}>
          Included on every plan <ArrowRight size={12} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HOW IT WORKS — sequential rail-fill timeline
   - Centered nodes in zero-gap 3-col grid (rail at 16.667/83.333% aligns)
   - Steps complete every 2s; check shows briefly (~2s) then reverts to number
   - Each step has a mini "live" UI preview with equal heights
   ============================================================ */
function HowItWorks({ onLogin }) {
  const [sectionRef, inView] = useInView(0.2);
  const [progress, setProgress] = useState(0);
  const [showCheck, setShowCheck] = useState([false, false, false]);
  // Guard against StrictMode double-invocation (which made the timeline run twice).
  const ranRef = useRef(false);

  useEffect(() => {
    if (!inView || ranRef.current) return;
    ranRef.current = true;
    const timers = [];
    const completeStep = (i, delay) => {
      timers.push(setTimeout(() => {
        setProgress(i + 1);
        setShowCheck((prev) => { const next = [...prev]; next[i] = true; return next; });
        timers.push(setTimeout(() => {
          setShowCheck((prev) => { const next = [...prev]; next[i] = false; return next; });
        }, 2000));
      }, delay));
    };
    // 1.5s lead-in so user fully reads the section before step 1 starts.
    // Step gaps remain tight so step 3 doesn't feel late.
    completeStep(0, 1500);
    completeStep(1, 3200);
    completeStep(2, 4400);
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const steps = [
    { n: "01", icon: Building2, title: "Connect your GA4",  desc: "Sign in with Google. Read-only access to your account and property metadata. No data ever leaves Google.", color: ORANGE, Preview: SignInPreview },
    { n: "02", icon: Activity,  title: "Run health checks", desc: "Pick a property and a 30-day window. Our engine runs all 50+ checks across 8 categories in under a minute.", color: BLUE,   Preview: ScanPreview },
    { n: "03", icon: LineIcon,  title: "Act on findings",   desc: "Export a branded PDF, share with your team, or ask the built-in GA4 chatbot how to fix any specific issue.", color: ORANGE, Preview: ResultPreview },
  ];

  const railPct = progress === 0 ? 0 : progress === 1 ? 50 : 100;

  return (
    <section id="how" ref={sectionRef} className="relative py-20 lg:py-28 3xl:py-36 bg-surface">
      <Container>
        <SectionHeader
          eyebrow="Workflow"
          title="From login to insights in three steps."
          subtitle="No agents, no scripts, no infrastructure. Just sign in and read."
        />

        <div className="mt-16 lg:mt-20 relative">
          {/* Rail — gap-0 grid means cell centers are at 16.667 / 50 / 83.333 % exactly */}
          <div aria-hidden className="hidden md:block absolute top-[44px] left-[16.667%] right-[16.667%] h-[3px] bg-line/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{
                width: `${railPct}%`,
                backgroundColor: progress >= 2 ? BLUE : ORANGE,
                transition: "width 1400ms cubic-bezier(0.22,1,0.36,1), background-color 800ms ease",
              }} />
          </div>

          {/* Scanner pulse traveling along the rail */}
          {inView && progress < 3 && (
            <div aria-hidden className="hidden md:block absolute top-[42px] h-[7px] w-[7px] rounded-full pointer-events-none -translate-x-1/2"
              style={{
                left: `calc(16.667% + (${railPct} / 100) * 66.666%)`,
                backgroundColor: progress >= 2 ? BLUE : ORANGE,
                boxShadow: `0 0 0 5px ${progress >= 2 ? "rgba(26,115,232,0.22)" : "rgba(249,115,22,0.28)"}`,
                transition: "left 1400ms cubic-bezier(0.22,1,0.36,1)",
              }} />
          )}

          <div className="grid md:grid-cols-3 relative" style={{ gap: 0 }}>
            {steps.map((s, i) => {
              const complete = progress > i;
              const active   = progress === i;
              const pending  = progress < i;
              const ringColor = complete || active ? s.color : "rgb(var(--border-strong))";
              const showingCheck = complete && showCheck[i];

              return (
                <div key={s.n} className="relative flex flex-col items-center text-center px-3 lg:px-5">
                  {/* Numbered ring node */}
                  <div className="relative z-10">
                    <div
                      className="w-[88px] h-[88px] rounded-full border-[3px] flex items-center justify-center font-mono tabular-nums text-[26px] font-bold relative"
                      style={{
                        borderColor: ringColor,
                        color: complete ? "white" : ringColor,
                        backgroundColor: complete ? s.color : "rgb(var(--surface))",
                        transform: active ? "scale(1.05)" : "scale(1)",
                        transition: "border-color 600ms ease, background-color 600ms ease, color 600ms ease, transform 600ms cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    >
                      {/* Cross-fade between check and number */}
                      <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                        style={{ opacity: showingCheck ? 1 : 0 }}>
                        <Check size={30} strokeWidth={3} />
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                        style={{ opacity: showingCheck ? 0 : 1 }}>
                        {s.n}
                      </span>
                    </div>
                    {/* Pulse ring while active */}
                    {active && (
                      <span aria-hidden className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: s.color, opacity: 0.22, animationDuration: "1.6s" }} />
                    )}
                  </div>

                  {/* Step status pill */}
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      color: complete ? s.color : pending ? "rgb(var(--content-subtle))" : s.color,
                      backgroundColor: complete ? `${s.color}14` : pending ? "rgb(var(--surface-muted))" : `${s.color}14`,
                      border: `1px solid ${complete ? s.color : pending ? "rgb(var(--border))" : s.color}`,
                      transition: "color 500ms, background-color 500ms, border-color 500ms",
                    }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: complete ? s.color : pending ? "rgb(var(--border-strong))" : s.color }} />
                    {complete ? "Complete" : active ? "Running" : "Pending"}
                  </div>

                  <div className="mt-3 max-w-md">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <s.icon size={18} strokeWidth={2.4} style={{ color: s.color }} />
                      <h3 className="text-[17px] 3xl:text-[19px] font-bold text-content tracking-tight">{s.title}</h3>
                    </div>
                    <p className="text-[13.5px] 3xl:text-[15px] text-content-muted leading-relaxed">{s.desc}</p>
                  </div>

                  {/* Mini preview — fixed height across all 3 steps */}
                  <div
                    className="mt-5 w-full max-w-md min-h-[200px] flex"
                    style={{
                      opacity: complete || active ? 1 : 0.35,
                      transform: complete || active ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 800ms ease, transform 800ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                  >
                    <div className="w-full">
                      <s.Preview color={s.color} active={complete} running={active} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <BrandButton onClick={onLogin}>Sign in to explore <ArrowUpRight size={16} strokeWidth={2.4} /></BrandButton>
        </div>
      </Container>
    </section>
  );
}

/* Mini UI previews — equal heights, slower internal animations.
   Wrapper ensures uniform height (180px) across all three steps. */

function PreviewShell({ children }) {
  return (
    <div className="rounded-xl border-2 border-line bg-surface-muted/50 p-4 h-[180px] flex flex-col">
      {children}
    </div>
  );
}

function SignInPreview({ color, active }) {
  return (
    <PreviewShell>
      <div className="text-[9.5px] uppercase tracking-[0.18em] font-bold text-content-subtle mb-2.5">OAuth · read-only</div>
      <div className="rounded-lg bg-surface border border-line px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-white border border-line flex items-center justify-center shrink-0">
          {/* Google G — official OAuth branding mark */}
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path fill="#4285F4" d="M21.35 11.1H12v2.7h5.35c-.25 1.5-1.7 4.4-5.35 4.4-3.2 0-5.85-2.65-5.85-5.85S8.8 6.5 12 6.5c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.65 3.95 14.55 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.6-.05-1.05-.15-1.55z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[11.5px] font-semibold text-content truncate">Continue with Google</div>
          <div className="text-[9.5px] text-content-subtle truncate">analytics.readonly · analytics.edit</div>
        </div>
        <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0"
          style={{ backgroundColor: color, transform: active ? "scale(1)" : "scale(0)" }}>
          <Check size={12} strokeWidth={3} className="text-white" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-line bg-surface px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-[0.14em] font-bold text-content-subtle">Account</div>
          <div className="text-[11px] font-semibold text-content truncate">AnalyticsLiv LLP</div>
        </div>
        <div className="rounded-md border border-line bg-surface px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-[0.14em] font-bold text-content-subtle">Property</div>
          <div className="text-[11px] font-semibold text-content truncate">GA4-12345</div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between text-[10px] text-content-subtle">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={11} style={{ color }} strokeWidth={2.4} /> Encrypted
        </span>
        <span className="font-mono tabular-nums">scope · 1</span>
      </div>
    </PreviewShell>
  );
}

function ScanPreview({ color, active, running }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!running && !active) return;
    let raf, cancelled = false;
    const start = performance.now();
    const duration = active ? 400 : 1800;
    const target   = active ? 100 : 78;
    const tick = (t) => {
      if (cancelled) return;
      const e = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - e, 3);
      setPct(Math.round(target * eased));
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [running, active]);

  // Pre-placed "detected items" around the radar that reveal as scan progresses
  const items = [
    { x:  18, y: -22, c: BLUE,      at: 14 },
    { x: -28, y:   8, c: BLUE,      at: 26 },
    { x:   6, y:  30, c: ORANGE,    at: 38 },
    { x:  30, y:  14, c: BLUE,      at: 50 },
    { x: -12, y: -28, c: "#EF4444", at: 62 },
    { x: -34, y:  -6, c: BLUE,      at: 74 },
    { x:  24, y: -10, c: BLUE,      at: 86 },
    { x:  -8, y:  16, c: ORANGE,    at: 96 },
  ];

  // Currently-scanning category, derived from pct
  const phase =
    pct < 25 ? "Property config" :
    pct < 50 ? "Attribution model" :
    pct < 75 ? "Event taxonomy" :
    pct < 95 ? "E-commerce flows" : "Engagement signals";

  const passDone  = items.filter((it) => pct >= it.at && it.c === BLUE).length;
  const watchDone = items.filter((it) => pct >= it.at && it.c === ORANGE).length;
  const critDone  = items.filter((it) => pct >= it.at && it.c === "#EF4444").length;

  return (
    <PreviewShell>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[9.5px] uppercase tracking-[0.18em] font-bold text-content-subtle">Engine sweep</div>
        <div className="inline-flex items-center gap-1.5">
          <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          <span className="text-[10.5px] font-mono tabular-nums font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>

      <div className="flex items-stretch gap-3 flex-1 min-h-0">
        {/* Radar — left */}
        <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
          <svg viewBox="-50 -50 100 100" width="96" height="96" aria-hidden>
            <defs>
              <radialGradient id={`radar-bg-${color.replace("#","")}`} cx="0" cy="0" r="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={color} stopOpacity="0.20" />
                <stop offset="80%" stopColor={color} stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`radar-sweep-${color.replace("#","")}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Background fill + concentric rings + crosshair */}
            <circle r="46" fill={`url(#radar-bg-${color.replace("#","")})`} />
            {[46, 32, 18, 6].map((r) => (
              <circle key={r} r={r} fill="none" stroke={color} strokeOpacity={r === 46 ? 0.35 : 0.18} strokeWidth="0.8" />
            ))}
            <line x1="-46" y1="0" x2="46" y2="0" stroke={color} strokeOpacity="0.12" strokeWidth="0.8" />
            <line x1="0" y1="-46" x2="0" y2="46" stroke={color} strokeOpacity="0.12" strokeWidth="0.8" />

            {/* Detected items — fade in as pct crosses their threshold */}
            {items.map((it, i) => {
              const visible = pct >= it.at;
              return (
                <g key={i} style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease" }}>
                  <circle cx={it.x} cy={it.y} r="6" fill={it.c} fillOpacity="0.18" />
                  <circle cx={it.x} cy={it.y} r="2.2" fill={it.c} />
                </g>
              );
            })}

            {/* Sweep beam — rotates continuously via SVG animateTransform */}
            <g>
              <path d="M 0 0 L 46 0 A 46 46 0 0 1 32.5 32.5 Z"
                fill={`url(#radar-sweep-${color.replace("#","")})`} />
              <line x1="0" y1="0" x2="46" y2="0" stroke={color} strokeWidth="1.4" strokeOpacity="0.85" strokeLinecap="round" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate"
                from="0 0 0" to="360 0 0" dur="3.2s" repeatCount="indefinite" />
            </g>

            {/* Center dot */}
            <circle r="3" fill="rgb(var(--surface))" stroke={color} strokeWidth="1.5" />
            <circle r="1.4" fill={color} />
          </svg>
        </div>

        {/* Right info column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <div>
            <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-content-subtle leading-none">Now scanning</div>
            <div className="mt-1 text-[12.5px] font-bold text-content truncate flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full animate-pulse shrink-0" style={{ backgroundColor: color }} />
              {phase}
            </div>
          </div>

          {/* Compact severity counters — single row, no boxes */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {[
              { l: "Pass",  v: passDone,  c: BLUE },
              { l: "Watch", v: watchDone, c: ORANGE },
              { l: "Crit",  v: critDone,  c: "#EF4444" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-1 min-w-0">
                <span className="block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.c }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color: s.c }}>{s.l}</span>
                <span className="text-[11px] font-mono tabular-nums font-bold text-content">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1.5 pt-1.5 flex items-center justify-between text-[10px] text-content-subtle border-t border-line">
        <span className="inline-flex items-center gap-1">
          <Activity size={11} style={{ color }} strokeWidth={2.4} /> Live audit
        </span>
        <span className="font-mono tabular-nums">{Math.round(pct * 0.5)} / 50 done</span>
      </div>
    </PreviewShell>
  );
}

function ResultPreview({ color, active }) {
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!active) return;
    setRevealed(true);
    let raf, cancelled = false;
    const start = performance.now();
    const duration = 1400;
    const target = 84;
    const tick = (t) => {
      if (cancelled) return;
      const e = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - e, 3);
      setScore(Math.round(target * eased));
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [active]);

  // SVG arc math for circular score ring
  const r = 24;
  const C = 2 * Math.PI * r;
  const dashOffset = C - (score / 100) * C;

  // Mock findings — short, real-sounding audit insights
  const findings = [
    { sev: "fix",   color: BLUE,     label: "Cross-domain tracking", count: "1" },
    { sev: "watch", color: ORANGE,   label: "Event taxonomy",        count: "4" },
    { sev: "crit",  color: "#EF4444",label: "Checkout funnel",       count: "1" },
  ];

  return (
    <PreviewShell>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9.5px] uppercase tracking-[0.18em] font-bold text-content-subtle">Audit complete</div>
        <div className="inline-flex items-center gap-1 text-[9.5px] font-mono tabular-nums font-bold uppercase tracking-[0.12em]" style={{ color }}>
          <Check size={10} strokeWidth={3} /> Pass
        </div>
      </div>

      {/* Score donut + findings list */}
      <div className="flex items-center gap-3.5">
        {/* Circular score ring */}
        <div className="relative w-[64px] h-[64px] shrink-0">
          <svg width="64" height="64" className="-rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--border))" strokeWidth="6" />
            <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={revealed ? dashOffset : C}
              style={{ transition: "stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[16px] font-bold tabular-nums leading-none" style={{ color }}>{score}</div>
            <div className="text-[7.5px] font-bold uppercase tracking-tight text-content-subtle leading-none mt-0.5">/100</div>
          </div>
        </div>

        {/* Findings list */}
        <div className="flex-1 min-w-0 space-y-[5px]">
          {findings.map((f, i) => (
            <div key={f.label}
              className="flex items-center gap-1.5 text-[10.5px]"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 150 + 600}ms`,
              }}>
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: f.color }} />
              <span className="font-semibold text-content truncate flex-1">{f.label}</span>
              <span className="font-mono tabular-nums text-[9.5px]" style={{ color: f.color }}>·{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severity proportions bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 flex h-[5px] rounded-full overflow-hidden bg-line">
          <div style={{ width: revealed ? "70%" : "0%", backgroundColor: BLUE, transition: "width 1200ms cubic-bezier(0.22,1,0.36,1) 200ms" }} />
          <div style={{ width: revealed ? "23%" : "0%", backgroundColor: ORANGE, transition: "width 1200ms cubic-bezier(0.22,1,0.36,1) 400ms" }} />
          <div style={{ width: revealed ? "7%"  : "0%", backgroundColor: "#EF4444", transition: "width 1200ms cubic-bezier(0.22,1,0.36,1) 600ms" }} />
        </div>
        <span className="text-[9px] font-mono tabular-nums text-content-subtle uppercase tracking-[0.12em]">75 found</span>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-content-subtle border-t border-line">
        <span className="inline-flex items-center gap-1.5">
          <FileText size={11} style={{ color }} strokeWidth={2.4} />
          <span className="font-semibold text-content">Download report</span>
        </span>
        <span className="inline-flex items-center gap-1 font-mono tabular-nums">
          <ArrowUpRight size={10} strokeWidth={2.5} style={{ color }} />
          PDF
        </span>
      </div>
    </PreviewShell>
  );
}

/* ============================================================
   MID CTA — deep slate canvas with orange + blue accents
   Premium feel; orange used as accent, not background flood
   ============================================================ */
function MidCTA({ onLogin }) {
  const metrics = [
    { k: "47s",  l: "Avg. audit time", color: ORANGE },
    { k: "12k+", l: "Audits run",      color: BLUE },
    { k: "98%",  l: "Recommend it",    color: ORANGE },
    { k: "8",    l: "Categories scanned", color: BLUE },
  ];
  return (
    <section className="relative py-14 lg:py-20 3xl:py-24">
      <Container>
        <RevealGroup className="relative rounded-3xl overflow-hidden text-white" style={{ backgroundColor: SLATE }}>
            {/* Solid color block accents — orange L-corner top-left, blue corner bottom-right */}
            <div aria-hidden className="absolute top-0 left-0 w-[6px] h-full" style={{ backgroundColor: ORANGE }} />
            <div aria-hidden className="absolute top-0 left-0 h-[6px] w-[120px]" style={{ backgroundColor: ORANGE }} />
            <div aria-hidden className="absolute bottom-0 right-0 w-[6px] h-[120px]" style={{ backgroundColor: BLUE }} />
            <div aria-hidden className="absolute bottom-0 right-0 h-[6px] w-[120px]" style={{ backgroundColor: BLUE }} />

            {/* Subtle dot grid texture for depth, no gradient */}
            <div aria-hidden className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }} />

            {/* ── FULL-BLEED ANALYTICS WALLPAPER — spans the entire card ───────
                 Visible across the whole canvas, with content layered on top */}
            <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* L1: dashed grid covering the full width */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-[0.18]">
                {[20, 40, 60, 80].map((y) => (
                  <line key={`gh-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.5" strokeWidth="0.15" strokeDasharray="0.6 1.2" vectorEffect="non-scaling-stroke" />
                ))}
                {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((x) => (
                  <line key={`gv-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="white" strokeOpacity="0.5" strokeWidth="0.15" strokeDasharray="0.6 1.2" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>

              {/* L2: large dual-area chart spanning full card width */}
              <svg viewBox="0 0 800 220" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="midcta-area-orange" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"  stopColor={ORANGE} stopOpacity="0.50" />
                    <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="midcta-area-blue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"  stopColor={BLUE} stopOpacity="0.40" />
                    <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Orange area (upper trace) */}
                <path
                  d="M 0,160 L 50,150 L 100,156 L 150,130 L 200,138 L 250,108 L 300,118 L 350,90 L 400,100 L 450,72 L 500,82 L 550,58 L 600,68 L 650,46 L 700,58 L 750,38 L 800,50 L 800,220 L 0,220 Z"
                  fill="url(#midcta-area-orange)" />
                <polyline
                  points="0,160 50,150 100,156 150,130 200,138 250,108 300,118 350,90 400,100 450,72 500,82 550,58 600,68 650,46 700,58 750,38 800,50"
                  fill="none" stroke={ORANGE} strokeWidth="1.6" strokeOpacity="0.65" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                {/* Blue area (lower trace) */}
                <path
                  d="M 0,190 L 50,178 L 100,184 L 150,166 L 200,176 L 250,156 L 300,164 L 350,144 L 400,150 L 450,128 L 500,134 L 550,114 L 600,124 L 650,102 L 700,110 L 750,90 L 800,98 L 800,220 L 0,220 Z"
                  fill="url(#midcta-area-blue)" />
                <polyline
                  points="0,190 50,178 100,184 150,166 200,176 250,156 300,164 350,144 400,150 450,128 500,134 550,114 600,124 650,102 700,110 750,90 800,98"
                  fill="none" stroke={BLUE} strokeWidth="1.6" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* L3: bar cluster — moved to CENTER-TOP so it's visible, not behind cards */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-end gap-[4px] opacity-60">
                {[18, 28, 22, 36, 20, 32, 26, 40, 24, 44, 30, 48, 28, 38].map((h, i) => (
                  <div key={i} className="w-[4px] rounded-sm"
                    style={{ height: `${h}px`, backgroundColor: i % 3 === 0 ? ORANGE : i % 3 === 1 ? BLUE : "rgba(255,255,255,0.45)" }} />
                ))}
              </div>

              {/* L4: donut indicator — center-left to avoid right-side cards */}
              <svg viewBox="-25 -25 50 50" className="absolute top-1/2 left-[44%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 opacity-55">
                <circle r="18" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="3" />
                <circle r="18" fill="none" stroke={ORANGE} strokeOpacity="0.85" strokeWidth="3"
                  strokeDasharray={`${0.84 * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
                  strokeDashoffset={2 * Math.PI * 18 * 0.25}
                  strokeLinecap="round" />
                <text x="0" y="3" textAnchor="middle" fill="white" fillOpacity="0.9" fontSize="11" fontWeight="700">84</text>
              </svg>

              {/* L5: log lines — bottom-center */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] leading-[1.55] text-white/50 select-none whitespace-pre text-center">
{`> tracking      OK    > attribution    OK    > events       OK
> ecommerce     ··    > retention      ··    > engagement   ··
> 50/50 checks  ✓    · sweep  47.2s    · health-score   84/100`}
              </div>

              {/* L6: floating data labels at center positions */}
              <div className="absolute top-[28%] left-[36%] font-mono text-[11px] font-bold opacity-70" style={{ color: ORANGE }}>
                +12.4%
              </div>
              <div className="absolute top-[58%] left-[28%] font-mono text-[10px] font-semibold opacity-65" style={{ color: BLUE }}>
                GA4-12345
              </div>
              <div className="absolute top-[14%] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] font-bold text-white/55">
                sessions · 30-day window
              </div>

              {/* L7: scatter dots — distributed across center */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-50">
                {[
                  [22, 32], [38, 22], [48, 38], [56, 28], [62, 44],
                  [30, 64], [44, 70], [52, 60], [60, 76], [68, 66],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="0.7" fill={i % 2 === 0 ? ORANGE : BLUE} vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            </div>

            <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 p-8 sm:p-12 lg:p-14 3xl:p-20 z-10">
              {/* Left: heading + button — each item floats in independently */}
              <div>
                <RevealChild delay={0}>
                  <div className="inline-flex items-center gap-2 text-[10.5px] tracking-[0.22em] uppercase font-bold mb-4 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(249,115,22,0.15)", color: ORANGE, border: `1px solid rgba(249,115,22,0.35)` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                    Ready when you are
                  </div>
                </RevealChild>

                <RevealChild delay={120} as="h3" className="text-3xl sm:text-4xl 3xl:text-5xl font-bold tracking-[-0.02em] leading-[1.08]">
                  Your first audit takes
                  <br />
                  <span className="relative inline-block mt-1">
                    <span style={{ color: ORANGE }}>less than a minute.</span>
                    <span aria-hidden className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full" style={{ backgroundColor: BLUE, opacity: 0.6 }} />
                  </span>
                </RevealChild>

                <RevealChild delay={260} as="p" className="mt-5 text-slate-300 text-[14.5px] 3xl:text-base max-w-md leading-relaxed">
                  No agents to install, no SDKs to configure. Sign in with Google, pick a property, and our engine sweeps 50+ checks across 8 audit categories.
                </RevealChild>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <RevealChild delay={400}>
                    <button onClick={onLogin}
                      className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl font-bold text-[14px] text-white hover:-translate-y-0.5 transition-all flex-shrink-0"
                      style={{ backgroundColor: ORANGE, boxShadow: "0 14px 30px -8px rgba(249,115,22,0.5)" }}>
                      Start free now
                      <ArrowUpRight size={16} strokeWidth={2.6} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </RevealChild>
                  <RevealChild delay={500}>
                    <button onClick={onLogin}
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-xl font-semibold text-[13.5px] text-white border-2 transition-colors hover:bg-white/5"
                      style={{ borderColor: BLUE, color: "white" }}>
                      <span className="inline-flex items-center gap-2">
                        Sign in with Google
                        <ArrowRight size={14} strokeWidth={2.4} />
                      </span>
                    </button>
                  </RevealChild>
                </div>

                <RevealChild delay={620}>
                  <div className="mt-4 inline-flex items-center gap-2 text-[12px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={13} strokeWidth={3} style={{ color: ORANGE }} /> No credit card
                    </span>
                    <span className="opacity-50">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={13} strokeWidth={3} style={{ color: BLUE }} /> Read-only access
                    </span>
                  </div>
                </RevealChild>
              </div>

              {/* Right: just the 2x2 metric grid — wallpaper now lives full-bleed
                   on the parent card, so it stays visible in the center area
                   instead of being hidden behind these tiles. */}
              <div className="relative flex items-center">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {metrics.map((m, i) => (
                    <RevealChild key={m.l} delay={300 + i * 130} distance={22}>
                      <div className="rounded-xl border bg-[rgba(15,23,42,0.82)] backdrop-blur-md p-4 lg:p-5 3xl:p-6 transition-all hover:bg-[rgba(15,23,42,0.92)] hover:-translate-y-0.5"
                        style={{ borderColor: `${m.color}66` }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-slate-400">{m.l}</span>
                        </div>
                        <div className="font-bold tracking-tight text-2xl 3xl:text-3xl" style={{ color: m.color }}>{m.k}</div>
                      </div>
                    </RevealChild>
                  ))}
                </div>
              </div>
            </div>
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ============================================================
   PRICING — solid colors, Pro highlighted with thick orange border
   ============================================================ */
function Pricing({ onLogin, onPurchase }) {
  // Numbers below match app/config/plans.js — keep these in sync if the
  // backend plan definitions change so marketing never overpromises.
  const plans = [
    {
      name: "Free", price: "0", cadence: "forever", highlight: false, color: SLATE,
      tagline: "Get a feel for the tool. No credit card.",
      features: [
        "3 audits / month",
        "10 chatbot queries / month",
        "1 seat",
        "All 8 audit categories",
        "30-day setup window",
        "PDF export",
      ],
      cta: { label: "Start free", action: "login" },
    },
    {
      name: "Pro", price: "49", cadence: "/ month", highlight: true, color: ORANGE,
      tagline: "Everything a marketer needs.",
      features: [
        "30 audits / month",
        "50 chatbot queries / month",
        "5 team seats",
        "30 / 90-day anomaly sweep",
        "Branded PDF reports",
        "Email support",
      ],
      cta: { label: "Get Pro", action: "purchase" },
    },
    {
      name: "Premium", price: "149", cadence: "/ month", highlight: false, color: BLUE,
      tagline: "For agencies and large analytics teams.",
      features: [
        "50 audits / month",
        "75 chatbot queries / month",
        "15 team seats",
        "Multi-property + agency workspace",
        "Priority support",
        "Custom report templates",
      ],
      cta: { label: "Get Premium", action: "purchase" },
    },
  ];

  return (
    <section id="pricing" className="relative py-20 lg:py-28 3xl:py-36">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Plans for every team."
          subtitle="Start free. Upgrade when you need deeper checks, more audits, or team collaboration."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-5 lg:gap-7 3xl:gap-10 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 140} className="h-full">
              <PricingCard plan={p} onLogin={onLogin} onPurchase={onPurchase} />
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-xs 3xl:text-sm text-content-subtle">
          Need a custom plan or volume pricing?{" "}
          <button onClick={() => onPurchase("Custom")} className="font-semibold hover:underline" style={{ color: ORANGE }}>
            Talk to sales
          </button>.
        </p>
      </Container>
    </section>
  );
}

function PricingCard({ plan: p, onLogin, onPurchase }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, scale: 1 });

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    setTilt({
      rx: -py * 8,
      ry:  px * 10,
      mx: (x / rect.width) * 100,
      my: (y / rect.height) * 100,
      scale: 1.015,
    });
  };
  const reset = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, scale: 1 });

  return (
    <div className="relative h-full flex flex-col" style={{ perspective: "1200px" }}>
      {p.highlight && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-white z-20 shadow-md"
          style={{ backgroundColor: ORANGE }}>
          <Sparkles size={11} /> Most popular
        </span>
      )}
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={`flex-1 relative rounded-2xl p-7 lg:p-8 3xl:p-10 bg-surface overflow-hidden will-change-transform ${
          p.highlight ? "border-[3px]" : "border-2 border-line"
        }`}
        style={{
          borderColor: p.highlight ? ORANGE : undefined,
          transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale}) translateZ(0)`,
          transformStyle: "preserve-3d",
          transition: "transform 250ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms ease",
          boxShadow: p.highlight
            ? `0 ${30 + Math.abs(tilt.rx) * 2}px ${70 + Math.abs(tilt.ry) * 4}px -30px rgba(249,115,22,0.45)`
            : `0 ${20 + Math.abs(tilt.rx) * 1.5}px ${50 + Math.abs(tilt.ry) * 3}px -30px rgba(15,23,42,0.20)`,
        }}
      >
        {/* Cursor-tracked glare layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(280px circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.20), transparent 60%)`,
            mixBlendMode: "soft-light",
            opacity: tilt.scale > 1 ? 1 : 0,
          }}
        />

        {/* Floating depth layer — content lifts above background on hover.
            Each child element floats in independently as the card scrolls in. */}
        <RevealGroup className="relative" style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
          {/* Plan tab */}
          <RevealChild delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: p.color }}>
              {p.name}
            </div>
          </RevealChild>

          {/* Price */}
          <RevealChild delay={120}>
            <div className="mt-5 flex items-baseline gap-1">
              {p.price === "0" ? (
                <span className="font-bold text-content tracking-tight text-5xl 3xl:text-6xl">$0</span>
              ) : (
                <>
                  <span className="text-content-muted text-2xl font-semibold align-top mr-0.5">$</span>
                  <span className="font-bold tracking-tight text-5xl 3xl:text-6xl text-content">{p.price}</span>
                </>
              )}
              <span className="text-content-subtle text-sm 3xl:text-base ml-1.5">{p.cadence}</span>
            </div>
          </RevealChild>

          <RevealChild delay={220} as="p" className="mt-1.5 text-[12.5px] 3xl:text-[13.5px] text-content-subtle">
            {p.tagline}
          </RevealChild>

          {/* Divider */}
          <RevealChild delay={300}>
            <div className="mt-5 h-px bg-line" />
          </RevealChild>

          <ul className="mt-5 space-y-2.5">
            {p.features.map((f, i) => (
              <RevealChild key={f} delay={360 + i * 70} as="li"
                className="flex items-start gap-2.5 text-[13px] 3xl:text-[14.5px] text-content">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: p.color }}>
                  <Check size={10} strokeWidth={3.5} />
                </span>
                <span>{f}</span>
              </RevealChild>
            ))}
          </ul>

          <RevealChild delay={360 + p.features.length * 70 + 80}>
            <button onClick={() => p.cta.action === "login" ? onLogin() : onPurchase(p.name)}
              className={`mt-7 w-full inline-flex items-center justify-center gap-2 h-12 3xl:h-14 rounded-xl font-semibold text-sm 3xl:text-base transition-all ${p.highlight ? "text-white hover:-translate-y-0.5" : "border-2 border-line-strong text-content hover:bg-surface-hover"}`}
              style={p.highlight ? { backgroundColor: ORANGE } : {}}>
              {p.cta.label}
              <ArrowRight size={15} strokeWidth={2.4} />
            </button>
          </RevealChild>
        </RevealGroup>
      </div>
    </div>
  );
}

/* ============================================================
   FAQ — split layout: left index, right open content
   ============================================================ */
function FAQ() {
  const faqs = [
    { q: "What does the audit actually check?", a: "Property configuration, data streams, retention windows, attribution settings, cross-domain tracking, event taxonomy, key events, e-commerce integrity, conversion anomalies over a 90-day window, and engagement signals — 50+ individual checks across 8 categories." },
    { q: "Does the tool need write access to my GA4?", a: "No. We use Google's read-only OAuth scope. We can read account, property, and report metadata; we cannot modify anything in your GA4." },
    { q: "Where does my data live?", a: "Audit metadata is stored in our database to enable history and PDF exports. The underlying GA4 data stays in Google — we read it through your OAuth token at audit time and don't replicate it." },
    { q: "How does the GA4 chatbot work?", a: "Built-in. Ask any GA4 question — best-practice setup, event design, attribution, anomalies. The chatbot is included in every plan, with a generous limit on Pro and Premium." },
    { q: "Can I export the audit?", a: "Yes — branded PDF export is available on every plan. The PDF always renders in light theme regardless of your UI preference, so it prints cleanly." },
    { q: "Do you offer a free trial?", a: "Free plan, not a trial. 3 audits and 10 chatbot queries per month, no credit card required, no expiry. Upgrade when you outgrow it." },
  ];
  const [active, setActive] = useState(0);
  return (
    <section id="faq" className="relative py-20 lg:py-28 3xl:py-36">
      <Container>
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          subtitle="Anything we miss? Reach out — we usually reply within a day."
        />

        <div className="mt-14 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 3xl:gap-20">
          {/* Left: numbered question index */}
          <Reveal>
          <div className="space-y-1">
            {faqs.map((f, i) => {
              const isActive = active === i;
              return (
                <button key={i} onClick={() => setActive(i)}
                  className={`group w-full text-left flex items-start gap-4 p-4 lg:p-5 rounded-lg border-2 transition-all ${isActive ? "border-[#F97316] bg-surface" : "border-transparent hover:bg-surface/60"}`}>
                  <span className={`shrink-0 font-mono tabular-nums text-[14px] font-bold w-8 text-right transition-colors ${isActive ? "" : "text-content-subtle"}`}
                    style={isActive ? { color: ORANGE } : {}}>
                    0{i+1}
                  </span>
                  <span className={`text-[14.5px] leading-snug transition-colors ${isActive ? "text-content font-semibold" : "text-content-muted group-hover:text-content"}`}>
                    {f.q}
                  </span>
                </button>
              );
            })}
          </div>
          </Reveal>

          {/* Right: open answer — each block floats in independently */}
          <RevealGroup className="rounded-2xl border-2 border-line bg-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full z-10" style={{ backgroundColor: ORANGE }} />

            {/* Header band */}
            <RevealChild delay={120}>
              <div className="flex items-center justify-between px-7 lg:px-9 py-4 border-b-2 border-line bg-surface-muted/40">
                <div className="text-[10.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ORANGE }}>
                  Question {String(active + 1).padStart(2, "0")} / {String(faqs.length).padStart(2, "0")}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-content-subtle">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                  Live answer
                </div>
              </div>
            </RevealChild>

            {/* Body */}
            <div className="px-7 lg:px-9 py-7 lg:py-8">
              <RevealChild delay={240} as="h3" className="text-xl lg:text-2xl 3xl:text-3xl font-bold text-content tracking-tight leading-tight">
                {faqs[active].q}
              </RevealChild>

              <RevealChild delay={360} as="p" className="mt-4 text-[14.5px] 3xl:text-[16px] text-content-muted leading-relaxed">
                {faqs[active].a}
              </RevealChild>

              {/* Inline keyword chips */}
              <RevealChild delay={480}>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(() => {
                    const tags = ["Read-only", "OAuth", "GA4", "PDF", "Free plan", "50+ checks", "8 categories"];
                    const picks = tags
                      .filter((t) => faqs[active].a.toLowerCase().includes(t.toLowerCase()) || faqs[active].q.toLowerCase().includes(t.toLowerCase()))
                      .slice(0, 4);
                    return (picks.length ? picks : tags.slice(0, 3)).map((t, i) => (
                      <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-md border"
                        style={{
                          color: i % 2 === 0 ? ORANGE : BLUE,
                          borderColor: i % 2 === 0 ? "rgba(249,115,22,0.35)" : "rgba(26,115,232,0.35)",
                          backgroundColor: i % 2 === 0 ? "rgba(249,115,22,0.06)" : "rgba(26,115,232,0.06)",
                        }}>
                        {t}
                      </span>
                    ));
                  })()}
                </div>
              </RevealChild>

              <RevealChild delay={600}>
                <div className="mt-6 flex items-center gap-3 p-3.5 rounded-lg bg-surface-muted/60 border border-line">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: BLUE }}>
                    <Mail size={15} strokeWidth={2.4} />
                  </div>
                  <div className="flex-1 text-[12.5px] text-content-muted">
                    Didn't find your answer? Email us — we usually reply within a day.
                  </div>
                  <a href="mailto:support@analyticsliv.com"
                    className="hidden sm:inline-flex shrink-0 items-center gap-1 text-[12px] font-bold hover:underline"
                    style={{ color: BLUE }}>
                    Contact <ArrowUpRight size={12} strokeWidth={2.5} />
                  </a>
                </div>
              </RevealChild>
            </div>

            {/* Footer nav */}
            <RevealChild delay={760}>
              <div className="flex items-center justify-between px-7 lg:px-9 py-3.5 border-t-2 border-line bg-surface-muted/40">
                <button onClick={() => setActive((a) => (a - 1 + faqs.length) % faqs.length)}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-content-muted hover:text-content transition-colors">
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="text-[11px] font-mono tabular-nums text-content-subtle">
                  {String(active + 1).padStart(2, "0")} / {String(faqs.length).padStart(2, "0")}
                </span>
                <button onClick={() => setActive((a) => (a + 1) % faqs.length)}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold transition-colors hover:opacity-80"
                  style={{ color: ORANGE }}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </RevealChild>
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   FINAL CTA — split layout: big headline + 3 stat tiles + CTA stack
   No empty space. Dense and purposeful.
   ============================================================ */
function FinalCTA({ onLogin, onPurchase }) {
  const tiles = [
    { k: "<1 min", l: "Time to first audit", icon: Activity },
    { k: "0",      l: "Setup steps required", icon: Plus },
    { k: "Read-only", l: "Google OAuth scope", icon: ShieldCheck },
  ];
  return (
    <section className="relative py-20 lg:py-28 3xl:py-32 bg-surface border-t-2 border-line">
      <Container>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 3xl:gap-24 items-center">
          {/* Left: headline + tiles — each item floats in independently */}
          <RevealGroup>
            <RevealChild delay={0}>
              <div className="text-[10.5px] uppercase tracking-[0.22em] font-bold mb-3" style={{ color: ORANGE }}>
                Ship cleaner data
              </div>
            </RevealChild>

            <RevealChild delay={120} as="h2" className="font-bold text-content tracking-[-0.03em] text-3xl sm:text-5xl 3xl:text-6xl leading-[1.05]">
              Stop guessing your <span style={{ color: ORANGE }}>GA4</span> setup.
            </RevealChild>

            <RevealChild delay={260} as="p" className="mt-5 text-content-muted max-w-xl 3xl:text-lg leading-relaxed">
              Run a precision health check, fix what's broken, ship cleaner data. Your team will thank you.
            </RevealChild>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tiles.map((t, i) => (
                <RevealChild key={t.l} delay={400 + i * 110}>
                  <div className="border-l-[3px] pl-4 py-2" style={{ borderColor: i === 1 ? BLUE : ORANGE }}>
                    <t.icon size={16} strokeWidth={2.4} style={{ color: i === 1 ? BLUE : ORANGE }} />
                    <div className="mt-1.5 font-bold text-content tracking-tight text-xl 3xl:text-2xl">{t.k}</div>
                    <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-content-subtle mt-0.5">{t.l}</div>
                  </div>
                </RevealChild>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <RevealChild delay={760}>
                <BrandButton onClick={onLogin}>Start free <ArrowUpRight size={16} strokeWidth={2.4} /></BrandButton>
              </RevealChild>
              <RevealChild delay={860}>
                <CTAOutline onClick={onPurchase}>Talk to sales <Mail size={15} strokeWidth={2.4} /></CTAOutline>
              </RevealChild>
            </div>
          </RevealGroup>

          {/* Right: live audit panel preview, dense — each row floats in independently */}
          <RevealGroup className="relative">
            <div className="rounded-2xl border-2 border-line bg-surface overflow-hidden shadow-xl">
              <RevealChild delay={120}>
                <div className="px-5 py-3 border-b-2 border-line flex items-center justify-between" style={{ backgroundColor: SLATE }}>
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                    <span className="text-[11px] uppercase tracking-[0.18em] font-bold">Audit · running</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-white/70 tabular-nums">47.2s</span>
                </div>
              </RevealChild>

              <div className="divide-y divide-line">
                {[
                  { c: "Tracking",    v: "12 / 16", ok: 12, warn: 3, fail: 1 },
                  { c: "Attribution", v: "6 / 10",  ok: 6,  warn: 2, fail: 2 },
                  { c: "Events",      v: "9 / 14",  ok: 9,  warn: 4, fail: 1 },
                  { c: "E-commerce",  v: "7 / 8",   ok: 7,  warn: 1, fail: 0 },
                  { c: "Engagement",  v: "8 / 10",  ok: 8,  warn: 2, fail: 0 },
                ].map((row, i) => {
                  const total = row.ok + row.warn + row.fail;
                  return (
                    <RevealChild key={row.c} delay={240 + i * 110}>
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-semibold text-content">{row.c}</span>
                          <span className="text-[12px] font-mono tabular-nums text-content-muted">{row.v}</span>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-line">
                          <div style={{ width: `${row.ok / total * 100}%`, backgroundColor: BLUE }} />
                          <div style={{ width: `${row.warn / total * 100}%`, backgroundColor: ORANGE }} />
                          <div style={{ width: `${row.fail / total * 100}%`, backgroundColor: "#ef4444" }} />
                        </div>
                      </div>
                    </RevealChild>
                  );
                })}
              </div>

              <RevealChild delay={900}>
                <div className="px-5 py-4 border-t-2 border-line flex items-center justify-between bg-surface-muted/40">
                  <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-content-subtle">Health score</div>
                  <div className="font-bold text-content tabular-nums text-3xl">84<span className="text-content-subtle text-lg ml-1">/ 100</span></div>
                </div>
              </RevealChild>
            </div>
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="border-t-2 border-line bg-surface">
      <Container className="py-10 3xl:py-14 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/Audit_Logo_r.png" alt="GA4 Auditor Tool" className="h-7 3xl:h-9 w-auto" />
          <span className="font-bold tracking-tight 3xl:text-lg flex items-center gap-1">
            <span style={{ color: BLUE }}>GA4</span>
            <span style={{ color: ORANGE }}>Auditor</span>
          </span>
          <span className="text-content-subtle text-xs 3xl:text-sm ml-2">© {new Date().getFullYear()} AnalyticsLiv</span>
        </div>
        <div className="flex items-center gap-5 text-xs 3xl:text-sm text-content-muted">
          <a href="#features" className="hover:text-[#F97316] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#F97316] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#F97316] transition-colors">FAQ</a>
          <a href="/privacy" className="hover:text-[#1A73E8] transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-[#1A73E8] transition-colors">Terms</a>
          <a href="mailto:support@analyticsliv.com" className="hover:text-[#1A73E8] transition-colors">Support</a>
        </div>
      </Container>
    </footer>
  );
}

/* ============================================================
   PURCHASE MODAL
   ============================================================ */
function PurchaseModal({ open, plan, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", contact: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ name: "", email: "", contact: "", message: `I'm interested in the ${plan} plan. Please share pricing and onboarding details.` });
      setStatus(null);
    }
  }, [open, plan]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "Thanks! We'll reach out within a few hours." });
        setTimeout(onClose, 2500);
      } else {
        setStatus({ type: "error", message: data.error || "Something went wrong" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Failed to submit. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-surface-elevated border-2 border-line sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-rise-in">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: ORANGE }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-white/85">Purchase enquiry</div>
              <h3 className="text-xl font-bold mt-0.5">Get the {plan} plan</h3>
            </div>
            <button onClick={onClose} className="text-white/85 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <p className="text-[13px] text-white/85 mt-2">Fill in your details — our team will share pricing and onboard you.</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <FieldRow label="Full name" required>
            <input type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe" className="modal-input" />
          </FieldRow>
          <FieldRow label="Work email" required>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@company.com" className="modal-input" />
          </FieldRow>
          <FieldRow label="Contact number" required>
            <input type="tel" required value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="+1 555 0123" className="modal-input" />
          </FieldRow>
          <FieldRow label="Message" required>
            <textarea required rows={3} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="modal-input resize-none" />
          </FieldRow>

          {status && (
            <div className={`text-[12.5px] px-3 py-2 rounded-lg border ${status.type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300"}`}>
              {status.message}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-xl border-2 border-line-strong text-content font-semibold hover:bg-surface-hover transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={busy}
              className="flex-[1.2] h-11 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:opacity-95"
              style={{ backgroundColor: ORANGE }}>
              {busy ? (<><span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/80 border-t-transparent" /> Sending...</>) : (<>Submit enquiry <ArrowUpRight size={15} strokeWidth={2.4} /></>)}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-input {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border-radius: 0.625rem;
            border: 1px solid rgb(var(--border));
            background: rgb(var(--surface));
            color: rgb(var(--content));
            font-size: 13.5px;
            transition: border-color 150ms, box-shadow 150ms;
          }
          .modal-input:focus {
            outline: none;
            border-color: #F97316;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18);
          }
          .modal-input::placeholder { color: rgb(var(--content-subtle)); }
        `}</style>
      </div>
    </div>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-content mb-1.5">
        {label} {required && <span style={{ color: ORANGE }}>*</span>}
      </span>
      {children}
    </label>
  );
}

/* ============================================================
   Shared atoms
   ============================================================ */

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <Reveal>
      <div className="max-w-2xl 3xl:max-w-3xl">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="block w-6 h-[2px]" style={{ backgroundColor: ORANGE }} />
          <span className="text-[10.5px] 3xl:text-xs tracking-[0.22em] uppercase font-bold" style={{ color: ORANGE }}>{eyebrow}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl 3xl:text-5xl font-bold text-content tracking-[-0.03em] leading-tight">{title}</h2>
        {subtitle && <p className="mt-3 text-content-muted text-[14.5px] 3xl:text-base leading-relaxed">{subtitle}</p>}
      </div>
    </Reveal>
  );
}

function BrandButton({ children, onClick, compact = false }) {
  return (
    <button onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 ${compact ? "h-9 3xl:h-10 px-4 3xl:px-5 text-sm" : "h-11 3xl:h-13 px-6 3xl:px-7 text-sm 3xl:text-base"}`}
      style={{ backgroundColor: ORANGE, boxShadow: "0 14px 30px -10px rgba(249,115,22,0.55)" }}>
      {children}
    </button>
  );
}

function CTAOutline({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center justify-center gap-2 h-11 3xl:h-13 px-6 3xl:px-7 rounded-xl font-semibold text-sm 3xl:text-base border-2 border-line-strong bg-surface text-content hover:border-[#F97316] hover:text-[#F97316] transition-colors">
      {children}
    </button>
  );
}

function CTAGhost({ children, href, onClick }) {
  const Comp = href ? "a" : "button";
  return (
    <Comp href={href} onClick={onClick}
      className="inline-flex items-center justify-center gap-2 h-11 3xl:h-13 px-4 3xl:px-5 rounded-xl font-medium text-sm 3xl:text-base text-content-muted hover:text-[#F97316] hover:bg-surface-hover transition-colors">
      {children}
    </Comp>
  );
}
