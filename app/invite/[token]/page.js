"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

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
            router.push(data.role === 'agencyAdmin' ? '/agency' : '/');
        } catch (e) {
            setError(e.message);
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading invitation…</div>;
    }
    if (error && !invite) {
        return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    }

    const inv = invite?.invitation;
    const agency = invite?.agency;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">You're invited</h1>
                <p className="text-gray-600 mb-6">
                    {agency?.name ? <>Join <strong>{agency.name}</strong> ({agency.plan} plan) as a <strong>{inv?.role === 'agencyAdmin' ? 'Agency Admin' : 'Team Member'}</strong>.</> : 'Invitation details'}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                    <div className="flex justify-between mb-2"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">{inv?.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-gray-800 capitalize">{inv?.status}</span></div>
                </div>

                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

                {status === 'unauthenticated' ? (
                    <button
                        onClick={() => signIn('google', { callbackUrl: `/invite/${token}` })}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold"
                    >
                        Sign in with Google to accept
                    </button>
                ) : session?.user?.email?.toLowerCase() !== inv?.email ? (
                    <div className="text-sm text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        You are signed in as <strong>{session?.user?.email}</strong>, but this invitation is for <strong>{inv?.email}</strong>. Please sign out and sign in with the correct account.
                    </div>
                ) : (
                    <button
                        onClick={handleAccept}
                        disabled={accepting || inv?.status !== 'pending'}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
                    >
                        {accepting ? 'Accepting…' : inv?.status === 'pending' ? 'Accept invitation' : `Invitation ${inv?.status}`}
                    </button>
                )}
            </div>
        </div>
    );
}
