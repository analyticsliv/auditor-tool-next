"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Building2, ArrowRight, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Card, Spinner } from '../../Components/ui';

export default function AgencyWelcomePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/usage', { credentials: 'include', cache: 'no-store' });
                const d = await res.json();
                if (!cancelled) setUsage(d);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [status, refreshKey]);

    /* -------- Render states -------- */

    if (status === 'loading') {
        return (
            <Centered>
                <Card className="max-w-md w-full p-10 text-center">
                    <Spinner size={20} />
                </Card>
            </Centered>
        );
    }

    // Not signed in
    if (status === 'unauthenticated') {
        return (
            <Centered>
                <Card className="max-w-md w-full overflow-hidden">
                    <Header icon={Building2} title="You're an Agency Admin" subtitle="Sign in to access your agency dashboard." />
                    <div className="p-6">
                        <p className="text-sm text-content-muted leading-relaxed mb-5">
                            Use Google sign-in with the email address that received this invite. Your dashboard
                            and pooled quota are already set up for you.
                        </p>
                        <Button onClick={() => signIn('google', { callbackUrl: '/agency/welcome' })} className="w-full" size="lg">
                            Sign in with Google
                        </Button>
                    </div>
                </Card>
            </Centered>
        );
    }

    if (loading || !usage) {
        return (
            <Centered>
                <Card className="max-w-md w-full p-10 text-center">
                    <Spinner size={20} />
                </Card>
            </Centered>
        );
    }

    const role = usage.role;
    const isAgencyAdmin = role === 'agencyAdmin';
    const isAgencyUser  = role === 'agencyUser';
    const isSuperAdmin  = role === 'superadmin';
    const hasAgency     = !!usage.agencyId;

    return (
        <Centered>
            <Card className="max-w-md w-full overflow-hidden">
                <Header
                    icon={isAgencyAdmin || isAgencyUser ? CheckCircle2 : AlertCircle}
                    title={isAgencyAdmin ? "You're all set" : isAgencyUser ? "Welcome to the team" : isSuperAdmin ? "Signed in as Super Admin" : "Account ready"}
                    subtitle={
                        usage.agencyName
                            ? `Welcome to ${usage.agencyName}.`
                            : isSuperAdmin
                              ? 'You can manage all agencies from the control center.'
                              : 'Your account is active.'
                    }
                />
                <div className="p-6 space-y-4">
                    <div className="bg-surface-muted border border-line rounded-xl p-4 space-y-2">
                        <Row label="Signed in" value={session.user.email} />
                        <Row label="Role" value={prettyRole(role)} />
                        {usage.agencyName && <Row label="Agency" value={usage.agencyName} />}
                        {usage.plan && usage.plan !== 'unlimited' && <Row label="Plan" value={(usage.plan || '').toUpperCase()} />}
                        {usage.audit?.limit != null && <Row label="Audit limit" value={usage.audit.limit} />}
                        {usage.chatbot?.limit != null && <Row label="Chatbot limit" value={usage.chatbot.limit} />}
                    </div>

                    {/* Primary CTA: depends on role */}
                    {isAgencyAdmin && (
                        <Button onClick={() => router.push('/agency')} className="w-full" size="lg" icon={<ArrowRight size={14} strokeWidth={2.25} />}>
                            Open agency dashboard
                        </Button>
                    )}
                    {isAgencyUser && (
                        <Button onClick={() => router.push('/home')} className="w-full" size="lg" icon={<ArrowRight size={14} strokeWidth={2.25} />}>
                            Go to home
                        </Button>
                    )}
                    {isSuperAdmin && (
                        <Button onClick={() => router.push('/dashboard')} className="w-full" size="lg" icon={<ArrowRight size={14} strokeWidth={2.25} />}>
                            Open control center
                        </Button>
                    )}
                    {!isAgencyAdmin && !isAgencyUser && !isSuperAdmin && !hasAgency && (
                        <>
                            <p className="text-sm text-content-muted leading-relaxed bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3">
                                Your role hasn't been linked to an agency yet. If you were just added as admin, give it a few seconds and try refresh.
                            </p>
                            <div className="flex gap-2">
                                <Button onClick={refresh} className="flex-1" variant="secondary" icon={<RefreshCw size={14} strokeWidth={2} />}>
                                    Refresh
                                </Button>
                                <Button onClick={() => router.push('/home')} className="flex-1" variant="ghost">
                                    Go home
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Always-available account switch */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/agency/welcome' })}
                        className="w-full text-center text-xs text-content-subtle hover:text-content transition-colors mt-2"
                    >
                        Not you? Sign out & switch account
                    </button>
                </div>
            </Card>
        </Centered>
    );
}

function Centered({ children }) {
    return <div className="min-h-[80vh] flex items-center justify-center p-6">{children}</div>;
}

function Header({ icon: Icon, title, subtitle }) {
    return (
        <div className="relative p-6 text-white overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
            {/* Solid corner accents — matches the landing/home page brand language */}
            <div aria-hidden className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#F97316' }} />
            <div aria-hidden className="absolute top-0 left-0 h-1.5 w-20" style={{ backgroundColor: '#F97316' }} />
            <div aria-hidden className="absolute bottom-0 right-0 w-1.5 h-10" style={{ backgroundColor: '#1A73E8' }} />
            <div aria-hidden className="absolute bottom-0 right-0 h-1.5 w-20" style={{ backgroundColor: '#1A73E8' }} />

            <div className="relative">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 text-white"
                     style={{ backgroundColor: '#F97316' }}>
                    <Icon size={20} strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm gap-3">
            <span className="text-content-subtle flex-shrink-0">{label}</span>
            <span className="font-medium text-content text-right truncate">{value}</span>
        </div>
    );
}

function prettyRole(role) {
    if (role === 'agencyAdmin') return 'Agency Admin';
    if (role === 'agencyUser')  return 'Team Member';
    if (role === 'superadmin')  return 'Super Admin';
    if (role === 'freeUser')    return 'Free User';
    return role || '—';
}
