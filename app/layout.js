"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccountStore } from "./store/useAccountStore";
import { Home, BarChart, LayoutDashboard, User, FileText, LogOut, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import Loader from "./Components/loader";
import { useRole } from "./utils/useRole";
import ThemeProvider from "./Components/ThemeProvider";
import ThemeToggle from "./Components/ThemeToggle";
import GlobalToast from "./Components/GlobalToast";
import GlobalChatbotButton from "./Components/GlobalChatbotButton";
import GlobalAuditAgentButton from "./Components/GlobalAuditAgentButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/* RootLayout only sets up providers — auth-aware UI lives in <AppShell />
   so it can read next-auth's reactive useSession() instead of relying on
   a stale localStorage snapshot. */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <SessionProvider>
            <AppShell>{children}</AppShell>
            <GlobalToast />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function AppShell({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicLanding = pathname === "/";
  const isAuditById = pathname === "/previous-audit";
  // Semi-public routes — reachable without auth so users coming from email
  // links can see the page and its built-in "Sign in with Google" CTA.
  // /agency, /dashboard, /home and other protected pages bounce unauthenticated
  // users back to "/" as before.
  const isAgencyWelcome = pathname === "/agency/welcome";
  const isInviteAccept  = !!pathname?.startsWith("/invite/");
  const isLegalPage     = pathname === "/privacy" || pathname === "/terms";
  const isOpenAccess    = isPublicLanding || isAgencyWelcome || isInviteAccept || isLegalPage;

  const { auditData, endApiData } = useAccountStore();
  const { role, loading: roleLoading } = useRole();

  const [toggle, setToggle] = useState(false);

  // Role is fetched async via useRole(). Until it resolves, neither
  // "Dashboard" nor "Agency" can be rendered — that's why the role-specific
  // sidebar item used to briefly disappear on fresh sign-in. Reserve the slot
  // with a skeleton placeholder so it's always present.
  const roleSlot =
    roleLoading
      ? { skeleton: true, label: "role" }
      : role === "superadmin"
        ? { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" }
        : role === "agencyAdmin"
          ? { icon: <Building2 size={20} />, label: "Agency", path: "/agency" }
          : null;

  const menuItems = [
    { icon: <Home size={20} />, label: "Home", path: "/home" },
    { icon: <BarChart size={20} />, label: "Audit Preview", path: "/auditPreview" },
    roleSlot,
    { icon: <User size={20} />, label: "Account Details", path: "/account" },
    { icon: <FileText size={20} />, label: "All Audits", path: "/previousAudit" },
  ].filter(Boolean);

  const wrapperClass = pathname === "/home" ? "h-full" : "p-6";

  /* Single source of truth for routing decisions: next-auth status.
     - status === "loading"      → wait, render nothing or loader
     - status === "authenticated" + isPublicLanding → push to /home
     - status === "unauthenticated" + protected     → push to /
     Use router.replace so the back button doesn't rewind through redirects. */
  useEffect(() => {
    if (status === "loading") return;
    if (isPublicLanding && status === "authenticated") {
      router.replace("/home");
    } else if (!isOpenAccess && status === "unauthenticated") {
      // Protected routes bounce unauthenticated users to landing.
      // Open-access routes (welcome, invite) handle their own sign-in UI.
      router.replace("/");
    }
  }, [status, isPublicLanding, isOpenAccess, router]);

  const handleSignOut = async () => {
    try { localStorage.removeItem("accessToken"); } catch {}
    try { localStorage.removeItem("session"); } catch {}
    // Let next-auth handle the redirect itself in one atomic step. This sets
    // status to "unauthenticated" + navigates to "/" without a flicker loop.
    await signOut({ callbackUrl: "/" });
  };

  /* ---------- Render ---------- */

  // While next-auth is restoring the session — render a single loader.
  // Skip the full-screen loader for any open-access page (landing / welcome /
  // invite); each renders its own page-level loading UI, so a layout-level
  // spinner here would just flash on top of theirs.
  if (status === "loading" && !isOpenAccess) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center py-10">
        <Loader />
      </div>
    );
  }

  // Public landing — no chrome, no loader. If the user is already
  // authenticated we render nothing (the redirect effect above is in flight
  // and will navigate to /home momentarily). Without this guard the entire
  // marketing page mounts, fires its own redirect, and can crash on its way
  // out because some children assume an unauthenticated context.
  if (isPublicLanding) {
    if (status === "authenticated") return null;
    return <div>{children}</div>;
  }

  // Semi-public flows (welcome, invite-accept) render WITHOUT the
  // sidebar/header chrome — they're standalone pages with their own
  // sign-in CTA. They must work for both authenticated and unauthenticated
  // visitors (since users typically arrive from an email link before
  // signing in).
  if (isAgencyWelcome || isInviteAccept || isLegalPage) {
    return <div>{children}</div>;
  }

  // Protected route but not yet authenticated — render nothing while the
  // redirect effect bounces us to "/". Avoids any flash of protected UI.
  if (status === "unauthenticated") return null;

  if (isAuditById) return <div className="px-[5%] py-10">{children}</div>;

  const user = session?.user || {};
  const disableMenus = Object.keys(auditData)?.length === 0 && Object.keys(endApiData).length === 0;

  return (
    <main className="flex flex-col h-screen bg-surface-muted">
      {/* ========== HEADER ==========
          Clean white header with subtle border, indigo→cyan accent line.
          Modern SaaS-feel: minimal, restrained, no warm-beige tints. */}
      <header className="relative shrink-0">
        {/* Solid 3-block brand stripe — matches landing/home pages, no gradient */}
        <div className="absolute inset-x-0 top-0 h-[2px] flex">
          <div className="flex-[3]" style={{ backgroundColor: "#F97316" }} />
          <div className="flex-[2]" style={{ backgroundColor: "#1A73E8" }} />
          <div className="flex-1"   style={{ backgroundColor: "#0F172A" }} />
        </div>
        <div className="px-6 py-2.5 bg-surface border-b border-line flex justify-between items-center">
          {/* Wordmark — same composition as the / route navbar:
              "GA4" in brand blue, "Auditor" in brand orange. No dot, no
              competing size mixes; one weight, one size, two colours. */}
          <Link href="/home" className="inline-flex items-center gap-2.5 group">
            <img src="/Audit_Logo_r.png" alt="GA4 Auditor Tool" className="h-8 w-auto" />
            <span className="font-bold tracking-tight text-[15px] xl:text-base flex items-center gap-1">
              <span style={{ color: "#1A73E8" }}>GA4</span>
              <span style={{ color: "#F97316" }}>Auditor</span>
            </span>
          </Link>

          {/* Welcome pill */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-line text-[12.5px]">
            <span className="text-content-subtle">Welcome,</span>
            <span className="font-semibold text-content">{user?.name?.split(' ')?.[0] || '—'}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-[13px] font-semibold text-content">{user?.name}</div>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-content-subtle font-medium">{role || 'user'}</div>
            </div>
            <div className="relative">
              {user?.image ? (
                <img src={user?.image} alt={user?.name || ''} className="rounded-full w-9 h-9 object-cover ring-2 ring-indigo-500/15 dark:ring-indigo-400/25" />
              ) : (
                <div className="rounded-full bg-content/[0.06] p-2 text-content w-9 h-9 flex items-center justify-center">
                  <User strokeWidth={2.20} size={20} />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>
          </div>
        </div>
      </header>

      {/* ========== BODY ROW ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR
            Pure white surface, indigo active state, cool slate hover.
            Active item: indigo left accent + indigo-50 bg + indigo text. */}
        <aside className={`${toggle ? "w-[72px]" : "w-[180px] xl:w-[208px] 2xl:w-[228px]"} shrink-0 transition-[width] duration-200 bg-surface border-r border-line flex flex-col`}>
          {/* Brand strip */}
          <div className="px-3 py-3.5 border-b border-line">
            <div className={`flex items-center gap-2.5 ${toggle ? "justify-center" : ""}`}>
              <span className="block w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-400" />
              {!toggle && (
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-content-subtle font-semibold">Navigator</span>
              )}
            </div>
          </div>

          <nav className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 pt-3 px-2 space-y-1 overflow-y-auto">
              {menuItems?.map((item) => {
                // Skeleton placeholder while role is being fetched.
                if (item?.skeleton) {
                  return (
                    <div key="role-skeleton"
                      className={`relative flex items-center gap-3 ${toggle ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg`}>
                      <span className="block w-5 h-5 rounded-md skeleton-shimmer shrink-0" />
                      {!toggle && <span className="block h-3 flex-1 max-w-[80%] skeleton-shimmer rounded" />}
                    </div>
                  );
                }
                // Agency-admin's Agency page is a navigation destination, not
                // an audit-result page — so it should NEVER be disabled by
                // the missing-audit-data guard. Same logic for the other
                // top-level destinations already in this whitelist.
                const isDisabled = disableMenus
                  && item?.label !== "Home"
                  && item?.label !== "Dashboard"
                  && item?.label !== "Agency"
                  && item?.label !== "Account Details"
                  && item?.label !== "All Audits";
                const isActive = pathname === item.path;
                return (
                  <Link key={item?.path} href={isDisabled ? "#" : item?.path}>
                    <div
                      title={toggle ? item?.label : undefined}
                      className={`relative group flex items-center gap-3 ${toggle ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg transition-all duration-150
                        ${isActive
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                          : "text-content-muted hover:text-content hover:bg-surface-hover dark:hover:bg-white/[0.04]"}
                        ${isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                      <span className={`shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                        {item?.icon}
                      </span>
                      {!toggle && (
                        <span className={`text-[13px] xl:text-[13.5px] truncate ${isActive ? "font-semibold" : "font-medium"}`}>
                          {item?.label}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom utility group */}
            <div className="border-t border-line px-2 py-3 space-y-1.5">
              <button
                onClick={handleSignOut}
                title={toggle ? "Sign out" : undefined}
                className={`group flex items-center gap-3 ${toggle ? "justify-center px-0" : "px-3"} py-2.5 text-[13px] font-medium rounded-lg w-full text-content-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors`}
              >
                <LogOut size={18} />
                {!toggle && <span>Sign out</span>}
              </button>

              <button
                onClick={() => setToggle((v) => !v)}
                title={toggle ? "Expand sidebar" : "Collapse sidebar"}
                className="flex items-center justify-center w-full h-7 rounded-md bg-surface-muted hover:bg-surface-hover dark:hover:bg-white/[0.06] border border-line text-content-muted hover:text-content transition-colors"
              >
                {toggle ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN content area */}
        <main className="flex-1 overflow-auto bg-surface-muted text-content">
          <div className={wrapperClass}>{children}</div>
        </main>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="shrink-0 bg-surface border-t border-line px-6 py-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-content-subtle">
          <span className="font-mono uppercase tracking-[0.18em]">© {new Date().getFullYear()}</span>
          <span className="opacity-40">|</span>
          <span>powered by</span>
          <strong className="text-content font-semibold">AnalyticsLiv</strong>
          <span className="opacity-40 mx-1">|</span>
          <Link href="/privacy" className="hover:text-content transition-colors">Privacy</Link>
          <span className="opacity-40">·</span>
          <Link href="/terms" className="hover:text-content transition-colors">Terms</Link>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-content-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono uppercase tracking-[0.18em]">operational</span>
          </span>
          <span className="opacity-40">|</span>
          <span className="font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded border border-line">v1.0</span>
        </div>
      </footer>

      {/* Global chatbot + audit agent buttons — present on every authenticated
          route except the print-friendly /previous-audit (handled by
          isAuditById guard above which short-circuits before this render). */}
      <GlobalChatbotButton />
      <GlobalAuditAgentButton />
    </main>
  );
}
