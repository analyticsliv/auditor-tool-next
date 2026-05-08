"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const ORANGE = "#F97316";
const BLUE   = "#1A73E8";
const SLATE  = "#0F172A";

export default function InviteAcceptPage() {
    const { token } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/invitations/accept?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to load invitation');
                setInvite(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const handleAccept = async () => {
        setAccepting(true);
        setError(null);
        try {
            const res = await fetch('/api/invitations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to accept');
            // Send each role to its appropriate landing page directly.
            const target =
                data.role === 'agencyAdmin' ? '/agency' :
                data.role === 'superadmin'  ? '/dashboard' :
                '/home';
            router.push(target);
        } catch (e) {
            setError(e.message);
        } finally {
            setAccepting(false);
        }
    };

    const inv = invite?.invitation;
    const agency = invite?.agency;
    const roleLabel = inv?.role === 'agencyAdmin' ? 'Agency Admin' : 'Team Member';
    const wrongAccount =
        status === 'authenticated' &&
        session?.user?.email &&
        inv?.email &&
        session.user.email.toLowerCase() !== inv.email.toLowerCase();

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
            <div className="bg-surface rounded-2xl shadow-xl border-2 border-line w-full max-w-md overflow-hidden">

                {/* HEADER — solid slate with brand corner accents */}
                <div className="relative px-6 py-6 text-white overflow-hidden" style={{ backgroundColor: SLATE }}>
                    <div aria-hidden className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute top-0 left-0 h-1.5 w-20" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 w-1.5 h-10" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 h-1.5 w-20" style={{ backgroundColor: BLUE }} />

                    <div className="relative">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.16em] border mb-3"
                            style={{ borderColor: "rgba(249,115,22,0.4)", backgroundColor: "rgba(249,115,22,0.12)", color: ORANGE }}>
                            <Mail size={11} strokeWidth={2.5} />
                            Invitation
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">You're invited</h1>
                        {agency?.name && (
                            <p className="text-sm text-slate-300 mt-1">
                                Join <span className="text-white font-semibold">{agency.name}</span>
                                {agency.plan ? <> &middot; {agency.plan} plan</> : null}
                            </p>
                        )}
                    </div>
                </div>

                {/* BODY */}
                <div className="p-6">
                    {loading ? (
                        <div className="py-10 flex flex-col items-center justify-center gap-3 text-content-subtle text-sm">
                            <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            Loading invitation…
                        </div>
                    ) : error && !invite ? (
                        <div className="rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 p-4 flex items-start gap-2.5">
                            <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Invitation details — clean rows, no gradient */}
                            <div className="rounded-lg border border-line bg-surface-muted/40 px-4 py-3 mb-5 space-y-2 text-sm">
                                <Row label="Invited" value={inv?.email} />
                                <Row
                                    label="Role"
                                    value={
                                        <span className="inline-flex items-center gap-1 font-bold" style={{ color: ORANGE }}>
                                            {roleLabel}
                                        </span>
                                    }
                                />
                                <Row
                                    label="Status"
                                    value={
                                        <span className="capitalize">
                                            {inv?.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 font-semibold" style={{ color: BLUE }}>
                                                    <CheckCircle2 size={12} strokeWidth={2.5} />
                                                    {inv?.status}
                                                </span>
                                            )}
                                        </span>
                                    }
                                />
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 p-3 flex items-start gap-2 text-[13px] text-red-700 dark:text-red-300">
                                    <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* CTA — three states: not signed in, signed in as wrong user, ready to accept */}
                            {status === 'loading' ? (
                                <div className="py-3 text-center text-sm text-content-subtle">Checking session…</div>
                            ) : status === 'unauthenticated' ? (
                                <>
                                    <p className="text-[13px] text-content-muted leading-relaxed mb-4">
                                        Sign in with Google using <strong className="text-content">{inv?.email}</strong> to accept this invitation.
                                    </p>
                                    <button
                                        onClick={() => signIn('google', { callbackUrl: `/invite/${token}` })}
                                        className="w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-bold text-[14px] text-white transition-all hover:-translate-y-0.5"
                                        style={{ backgroundColor: ORANGE, boxShadow: "0 14px 30px -8px rgba(249,115,22,0.5)" }}
                                    >
                                        Sign in with Google
                                        <ArrowRight size={15} strokeWidth={2.5} />
                                    </button>
                                </>
                            ) : wrongAccount ? (
                                <div className="space-y-3">
                                    <div className="rounded-lg border-2 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-[13px]">
                                        <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-amber-800 dark:text-amber-200 leading-relaxed">
                                            You're signed in as <strong>{session?.user?.email}</strong>, but this invitation is for{' '}
                                            <strong>{inv?.email}</strong>. Sign out and sign back in with the correct account.
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: `/invite/${token}` })}
                                        className="w-full h-11 rounded-xl border-2 border-line-strong text-content font-semibold hover:bg-surface-hover transition-colors text-sm"
                                    >
                                        Sign out & switch account
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAccept}
                                    disabled={accepting || inv?.status !== 'pending'}
                                    className="w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-bold text-[14px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    style={{ backgroundColor: ORANGE, boxShadow: "0 14px 30px -8px rgba(249,115,22,0.5)" }}
                                >
                                    {accepting ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            Accepting…
                                        </>
                                    ) : inv?.status === 'pending' ? (
                                        <>
                                            Accept invitation
                                            <ArrowRight size={15} strokeWidth={2.5} />
                                        </>
                                    ) : (
                                        <>Invitation {inv?.status}</>
                                    )}
                                </button>
                            )}

                            {/* Trust line — same language as the rest of the app */}
                            <div className="mt-5 pt-4 border-t border-line flex items-center justify-center gap-2 text-[11.5px] text-content-subtle">
                                <ShieldCheck size={12} style={{ color: BLUE }} strokeWidth={2.4} />
                                <span>Read-only access · no data leaves your account</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-content-subtle flex-shrink-0">{label}</span>
            <span className="font-medium text-content text-right truncate">{value || '—'}</span>
        </div>
    );
}
