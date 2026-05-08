"use client";

import AuthWrapper from "../Components/AuthWrapper";
import { useSession, signOut } from "next-auth/react";
import { useUsage } from "../utils/useUsage";
import { useRole } from "../utils/useRole";
import { useRouter } from "next/navigation";
import {
    User as UserIcon, Mail, ShieldCheck, BarChart3, Bot,
    Building2, Calendar, LogOut, ArrowRight, Sparkles,
    RefreshCw, AlertCircle, ExternalLink, Settings,
} from "lucide-react";

const ORANGE = "#F97316";
const BLUE   = "#1A73E8";
const SLATE  = "#0F172A";

const anim = (delay = 0) => ({
    animation: "rise-in 700ms cubic-bezier(0.22,1,0.36,1) both",
    animationDelay: `${delay}ms`,
});

const prettyRole = (r) => {
    if (r === "agencyAdmin") return "Agency Admin";
    if (r === "agencyUser")  return "Team Member";
    if (r === "superadmin")  return "Super Admin";
    if (r === "freeUser")    return "Free User";
    return r || "—";
};

const prettyPlan = (p) => {
    if (!p) return "—";
    if (p === "free")     return "Free";
    if (p === "pro")      return "Pro";
    if (p === "premium")  return "Premium";
    if (p === "unlimited") return "Unlimited";
    return p[0].toUpperCase() + p.slice(1);
};

export default function AccountPage() {
    const { data: session, status } = useSession();
    const { usage, loading: usageLoading, error: usageError, refetch } = useUsage();
    const { role, loading: roleLoading } = useRole();
    const router = useRouter();

    const user = session?.user || {};
    const isAuthLoading = status === "loading";
    const isDataLoading = usageLoading || roleLoading;

    const handleSignOut = async () => {
        try { localStorage.removeItem("accessToken"); } catch {}
        try { localStorage.removeItem("session"); } catch {}
        await signOut({ callbackUrl: "/" });
    };

    return (
        <AuthWrapper>
            <div className="relative w-full min-h-full bg-surface-muted overflow-hidden">
                <Backdrop />

                <div className="relative z-10 mx-auto w-full max-w-[1100px] 3xl:max-w-[1300px] px-5 sm:px-8 lg:px-12 py-8 lg:py-10">

                    {/* Tiny breadcrumb header — same as /home */}
                    <div className="flex items-center justify-between gap-4 mb-5" style={anim(0)}>
                        <div className="flex items-center gap-2.5">
                            <span className="block w-1 h-5 rounded-sm" style={{ backgroundColor: ORANGE }} />
                            <span className="text-[10.5px] uppercase tracking-[0.22em] font-bold text-content-subtle">
                                Account · profile &amp; usage
                            </span>
                        </div>
                        {!isDataLoading && role && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-surface"
                                 style={{ borderColor: "rgb(var(--border))" }}>
                                <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: BLUE }} />
                                <span className="text-[12px] font-bold text-content">{prettyRole(role)}</span>
                            </div>
                        )}
                    </div>

                    {/* PROFILE CARD */}
                    <section style={anim(120)}>
                        <ProfileCard
                            user={user}
                            role={role}
                            plan={usage?.plan}
                            loading={isAuthLoading}
                        />
                    </section>

                    {/* USAGE — audit + chatbot side by side */}
                    <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div style={anim(220)}>
                            <UsageCard
                                title="Audits"
                                subtitle="This month"
                                icon={BarChart3}
                                color={ORANGE}
                                data={usage?.audit}
                                loading={isDataLoading}
                            />
                        </div>
                        <div style={anim(300)}>
                            <UsageCard
                                title="Chatbot queries"
                                subtitle="This month"
                                icon={Bot}
                                color={BLUE}
                                data={usage?.chatbot}
                                loading={isDataLoading}
                            />
                        </div>
                    </section>

                    {/* MEMBERSHIP / RESET / PLAN INFO */}
                    <section className="mt-6" style={anim(400)}>
                        <MembershipCard
                            usage={usage}
                            role={role}
                            loading={isDataLoading}
                            error={usageError}
                            onRefresh={refetch}
                        />
                    </section>

                    {/* ACTIONS */}
                    <section className="mt-6" style={anim(500)}>
                        <ActionsCard
                            role={role}
                            onSignOut={handleSignOut}
                            onGoAgency={() => router.push("/agency")}
                            onGoDashboard={() => router.push("/dashboard")}
                            onGoHome={() => router.push("/home")}
                        />
                    </section>

                    {/* Footer line */}
                    <div className="mt-8 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-content-subtle"
                         style={anim(640)}>
                        <p className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: BLUE }} />
                            Read-only access · no data leaves your account
                        </p>
                        <p className="truncate">
                            Signed in as <span className="text-content font-semibold">{user?.email || "—"}</span>
                        </p>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}

/* ============================================================
   SUBTLE BACKDROP — dot grid + corner accents (same as home)
   ============================================================ */
function Backdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
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
            <div className="absolute top-0 left-0 w-1.5 h-32 hidden lg:block" style={{ backgroundColor: ORANGE }} />
            <div className="absolute top-0 left-0 w-32 h-1.5 hidden lg:block" style={{ backgroundColor: ORANGE }} />
            <div className="absolute bottom-0 right-0 w-1.5 h-32 hidden lg:block" style={{ backgroundColor: BLUE }} />
            <div className="absolute bottom-0 right-0 w-32 h-1.5 hidden lg:block" style={{ backgroundColor: BLUE }} />
        </div>
    );
}

/* ============================================================
   PROFILE CARD
   ============================================================ */
function ProfileCard({ user, role, plan, loading }) {
    return (
        <article className="relative rounded-2xl border-2 border-line bg-surface overflow-hidden shadow-[0_24px_60px_-28px_rgba(15,23,42,0.20)]">
            {/* Top brand stripe — solid blocks, no gradient */}
            <div className="flex h-[3px] rounded-t-2xl overflow-hidden">
                <div className="flex-[3]" style={{ backgroundColor: ORANGE }} />
                <div className="flex-[2]" style={{ backgroundColor: BLUE }} />
                <div className="flex-1" style={{ backgroundColor: SLATE }} />
            </div>

            <div className="p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                    {loading ? (
                        <span className="block w-20 h-20 rounded-2xl skeleton-shimmer" />
                    ) : user?.image ? (
                        <img
                            src={user.image}
                            alt={user?.name || "Avatar"}
                            className="w-20 h-20 rounded-2xl object-cover"
                            style={{ border: `3px solid ${ORANGE}` }}
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                             style={{ backgroundColor: ORANGE }}>
                            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    {/* Pulse status dot */}
                    {!loading && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center"
                              style={{ backgroundColor: BLUE }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </span>
                    )}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <>
                            <span className="block h-5 w-48 skeleton-shimmer rounded mb-2" />
                            <span className="block h-3.5 w-64 skeleton-shimmer rounded" />
                        </>
                    ) : (
                        <>
                            <h2 className="text-[20px] sm:text-[22px] font-bold text-content tracking-tight">
                                {user?.name || (user?.email?.split('@')[0]) || "User"}
                            </h2>
                            <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-content-muted">
                                <Mail size={13} strokeWidth={2.4} className="text-content-subtle" />
                                <span className="truncate">{user?.email || "—"}</span>
                            </div>
                        </>
                    )}

                    {/* Role + Plan badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {role && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.14em] border-2"
                                  style={{ borderColor: `${ORANGE}55`, backgroundColor: `${ORANGE}0F`, color: ORANGE }}>
                                <ShieldCheck size={11} strokeWidth={2.5} />
                                {prettyRole(role)}
                            </span>
                        )}
                        {plan && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.14em] border-2"
                                  style={{ borderColor: `${BLUE}55`, backgroundColor: `${BLUE}0F`, color: BLUE }}>
                                <Sparkles size={11} strokeWidth={2.5} />
                                {prettyPlan(plan)} plan
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ============================================================
   USAGE CARD — audit or chatbot
   ============================================================ */
function UsageCard({ title, subtitle, icon: Icon, color, data, loading }) {
    const used = data?.used ?? 0;
    const limit = data?.limit;
    const isUnlimited = !!data?.unlimited;
    const remaining = isUnlimited
        ? null
        : (limit != null ? Math.max(0, limit - used) : null);
    const pct = isUnlimited
        ? 100
        : (limit ? Math.min(100, (used / limit) * 100) : 0);

    // Color shifts to red as user approaches limit
    const barColor = isUnlimited
        ? color
        : pct >= 90 ? "#EF4444"
        : pct >= 70 ? "#F97316"
        : color;

    return (
        <article className="relative rounded-2xl border-2 border-line bg-surface p-5 lg:p-6 h-full overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                         style={{ backgroundColor: color }}>
                        <Icon size={18} strokeWidth={2.4} />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-content tracking-tight">{title}</h3>
                        <p className="text-[11.5px] text-content-subtle uppercase tracking-[0.12em] font-semibold">{subtitle}</p>
                    </div>
                </div>
                {!loading && isUnlimited && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.14em] border-2"
                          style={{ borderColor: `${color}55`, backgroundColor: `${color}0F`, color }}>
                        <Sparkles size={10} strokeWidth={2.5} />
                        Unlimited
                    </span>
                )}
            </div>

            {loading ? (
                <>
                    <span className="block h-7 w-24 skeleton-shimmer rounded mb-2" />
                    <span className="block h-2 w-full skeleton-shimmer rounded mb-3" />
                    <span className="block h-3 w-32 skeleton-shimmer rounded" />
                </>
            ) : isUnlimited ? (
                <>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-bold tabular-nums text-content tracking-tight text-[34px] leading-none" style={{ color }}>
                            {used}
                        </span>
                        <span className="text-content-subtle text-sm">used</span>
                    </div>
                    <p className="mt-3 text-[12.5px] text-content-muted leading-snug">
                        No monthly cap on your account. Use it freely.
                    </p>
                </>
            ) : (
                <>
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-bold tabular-nums text-content tracking-tight text-[30px] leading-none">
                                {used}
                            </span>
                            <span className="text-content-subtle text-sm">/ {limit ?? "—"}</span>
                        </div>
                        <span className="text-[10.5px] font-mono tabular-nums font-bold uppercase tracking-[0.14em]"
                              style={{ color: barColor }}>
                            {Math.round(pct)}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-line overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                             style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>

                    <p className="mt-3 text-[12.5px] text-content-muted">
                        {remaining != null ? (
                            <>
                                <span className="font-semibold text-content tabular-nums">{remaining}</span> remaining this month
                            </>
                        ) : "—"}
                    </p>
                </>
            )}
        </article>
    );
}

/* ============================================================
   MEMBERSHIP CARD — agency / personal + reset date
   ============================================================ */
function MembershipCard({ usage, role, loading, error, onRefresh }) {
    if (loading) {
        return (
            <article className="rounded-2xl border-2 border-line bg-surface p-5 lg:p-6">
                <span className="block h-4 w-32 skeleton-shimmer rounded mb-3" />
                <span className="block h-6 w-64 skeleton-shimmer rounded mb-2" />
                <span className="block h-3 w-48 skeleton-shimmer rounded" />
            </article>
        );
    }

    if (error) {
        return (
            <article className="rounded-2xl border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5 lg:p-6 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-[14px] font-bold text-red-800 dark:text-red-200">Couldn't load account details</h3>
                    <p className="text-[12.5px] text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
                <button onClick={onRefresh}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-red-300 dark:border-red-500/40 text-[12px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <RefreshCw size={12} strokeWidth={2.4} /> Retry
                </button>
            </article>
        );
    }

    const isAgency = !!usage?.agencyId;
    const resetDate = usage?.resetDate ? new Date(usage.resetDate) : null;
    const resetStr = resetDate
        ? resetDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
        : "—";

    // Days until reset (rough)
    let daysToReset = null;
    if (resetDate) {
        const ms = resetDate.getTime() - Date.now();
        daysToReset = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }

    return (
        <article className="rounded-2xl border-2 border-line bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 lg:px-6 py-3.5 border-b-2 border-line bg-surface-muted/40">
                <div className="inline-flex items-center gap-2">
                    <span className="text-[10.5px] uppercase tracking-[0.18em] font-bold" style={{ color: ORANGE }}>
                        Membership
                    </span>
                </div>
                {resetDate && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-content-subtle">
                        <Calendar size={12} strokeWidth={2.4} />
                        Renews <span className="font-mono tabular-nums text-content font-semibold">{resetStr}</span>
                    </span>
                )}
            </div>

            <div className="p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Type */}
                <Stat
                    label="Account type"
                    value={isAgency ? "Agency member" : "Personal"}
                    icon={isAgency ? Building2 : UserIcon}
                    color={isAgency ? BLUE : ORANGE}
                />
                {/* Agency name (or just "—" for personal) */}
                <Stat
                    label="Agency"
                    value={usage?.agencyName || "—"}
                    icon={Building2}
                    color={BLUE}
                    muted={!isAgency}
                />
                {/* Days until renewal */}
                <Stat
                    label="Renewal in"
                    value={daysToReset != null ? `${daysToReset} ${daysToReset === 1 ? "day" : "days"}` : "—"}
                    icon={Calendar}
                    color={ORANGE}
                />
            </div>

            {/* Plan-tier blurb */}
            <div className="px-5 lg:px-6 pb-5 lg:pb-6">
                <PlanBlurb plan={usage?.plan} role={role} agencyName={usage?.agencyName} />
            </div>
        </article>
    );
}

function Stat({ label, value, icon: Icon, color, muted }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                 style={{ backgroundColor: muted ? "rgb(var(--border-strong))" : color }}>
                <Icon size={15} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
                <div className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-content-subtle">{label}</div>
                <div className={`text-[14.5px] font-bold mt-0.5 truncate ${muted ? "text-content-subtle" : "text-content"}`}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function PlanBlurb({ plan, role, agencyName }) {
    if (!plan) return null;
    let msg = null;
    if (role === "superadmin") {
        msg = "You have unlimited access across the platform.";
    } else if (plan === "free") {
        msg = "You're on the Free plan — 3 audits and 10 chatbot queries per month. Upgrade for higher limits.";
    } else if (plan === "pro") {
        msg = `You're on the Pro plan${agencyName ? ` via ${agencyName}` : ""} — 30 audits, 50 chatbot queries, 5 team seats.`;
    } else if (plan === "premium") {
        msg = `You're on the Premium plan${agencyName ? ` via ${agencyName}` : ""} — 50 audits, 75 chatbot queries, 15 team seats.`;
    } else if (plan === "unlimited") {
        msg = "You have unlimited access on this account.";
    }
    if (!msg) return null;
    return (
        <div className="rounded-lg border border-line bg-surface-muted/40 px-4 py-3 text-[12.5px] text-content-muted leading-relaxed flex items-start gap-2.5">
            <Sparkles size={13} className="shrink-0 mt-0.5" style={{ color: ORANGE }} strokeWidth={2.4} />
            <span>{msg}</span>
        </div>
    );
}

/* ============================================================
   ACTIONS CARD — quick links + sign out
   ============================================================ */
function ActionsCard({ role, onSignOut, onGoAgency, onGoDashboard, onGoHome }) {
    const links = [
        { label: "Open home", icon: Settings, onClick: onGoHome, color: ORANGE },
        role === "agencyAdmin" && { label: "Open agency dashboard", icon: Building2, onClick: onGoAgency, color: BLUE },
        role === "superadmin"  && { label: "Open control center", icon: Building2, onClick: onGoDashboard, color: BLUE },
        { label: "Email support", icon: Mail, href: "mailto:support@analyticsliv.com", external: true, color: BLUE },
    ].filter(Boolean);

    return (
        <article className="rounded-2xl border-2 border-line bg-surface overflow-hidden">
            <div className="px-5 lg:px-6 py-3.5 border-b-2 border-line bg-surface-muted/40">
                <span className="text-[10.5px] uppercase tracking-[0.18em] font-bold" style={{ color: ORANGE }}>
                    Quick actions
                </span>
            </div>

            <div className="p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((l) => {
                    const Inner = (
                        <span className="flex items-center gap-3 w-full">
                            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                                  style={{ backgroundColor: l.color }}>
                                <l.icon size={15} strokeWidth={2.4} />
                            </span>
                            <span className="flex-1 text-[13.5px] font-semibold text-content text-left">{l.label}</span>
                            {l.external
                                ? <ExternalLink size={14} className="text-content-subtle" />
                                : <ArrowRight size={14} className="text-content-subtle" />}
                        </span>
                    );
                    return l.href ? (
                        <a key={l.label} href={l.href}
                           className="rounded-lg border border-line p-3 hover:border-content-subtle/40 hover:bg-surface-muted/40 transition-all">
                            {Inner}
                        </a>
                    ) : (
                        <button key={l.label} onClick={l.onClick}
                                className="rounded-lg border border-line p-3 hover:border-content-subtle/40 hover:bg-surface-muted/40 transition-all">
                            {Inner}
                        </button>
                    );
                })}

                {/* Sign out — danger styling, full width across grid */}
                <button onClick={onSignOut}
                        className="sm:col-span-2 inline-flex items-center justify-center gap-2 h-11 rounded-lg border-2 text-[13.5px] font-bold transition-colors
                                   border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400
                                   hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/50">
                    <LogOut size={15} strokeWidth={2.4} />
                    Sign out
                </button>
            </div>
        </article>
    );
}
