"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Users, Activity, Plus, Trash2, Lock, MessageSquare,
    BarChart3, Calendar, Inbox,
} from 'lucide-react';
import { useRole } from '../utils/useRole';
import {
    Button, AsyncButton, StatusPill, Card, ProgressBar,
    Modal, EmptyState, PageHeader, Tabs, Toast, useToast,
    Stat, DataTable, THead, TBody, Tr, Th, Td,
    Skeleton, SkeletonRow, SkeletonStats, Field, Input, Tag,
} from '../Components/ui';

export default function AgencyDashboardPage() {
    const router = useRouter();
    const { status } = useSession();
    const { role, loading: roleLoading } = useRole();
    const toast = useToast();

    const [tab, setTab] = useState('team');
    const [data, setData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteBusy, setInviteBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const load = async () => {
        try {
            const [u, l] = await Promise.all([
                fetch('/api/agency/users').then(r => r.json()),
                fetch('/api/agency/logs').then(r => r.json()),
            ]);
            if (u.error) throw new Error(u.error);
            setData(u);
            setLogs(l.logs || []);
        } catch (e) {
            toast.show(e.message || 'Failed to load', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (status === 'authenticated' && role === 'agencyAdmin') load();
    }, [status, role, router]);

    if (status !== 'authenticated' || roleLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Skeleton width={140} height={11} className="mb-3" />
                    <Skeleton width={320} height={36} />
                </div>
                <SkeletonStats count={3} />
                <Card><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></Card>
            </div>
        );
    }

    if (role !== 'agencyAdmin') {
        return (
            <div className="max-w-md mx-auto mt-20">
                <Card className="p-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-100">
                        <Lock size={20} strokeWidth={1.75} className="text-purple-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">This area is reserved for agency administrators.</p>
                    <Button onClick={() => router.push('/')}>Go home</Button>
                </Card>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Skeleton width={140} height={11} className="mb-3" />
                    <Skeleton width={320} height={36} />
                </div>
                <SkeletonStats count={3} />
                <Card><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></Card>
            </div>
        );
    }

    const a = data.agency;
    const auditLimit = a.auditLimitOverride ?? a.auditLimit;
    const chatLimit = a.chatbotLimitOverride ?? a.chatbotLimit;
    const acceptedTeam = data.users || [];
    const pending = data.pendingInvites || [];
    const seatsUsed = acceptedTeam.length;
    const tabsConfig = [
        { value: 'team', label: 'Team',     count: seatsUsed + pending.length, icon: Users },
        { value: 'logs', label: 'Activity', count: logs.length,                icon: Activity },
    ];

    const handleInvite = async () => {
        if (!inviteEmail) { toast.show('Email is required', 'error'); return; }
        setInviteBusy(true);
        try {
            const res = await fetch('/api/invitations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: 'agencyUser' }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error);
            toast.show(`Invitation sent to ${inviteEmail}`, 'success');
            setInviteEmail('');
            setInviteOpen(false);
            await load();
        } catch (e) {
            toast.show(e.message, 'error');
        } finally {
            setInviteBusy(false);
        }
    };

    const handleDelete = async (email) => {
        const res = await fetch(`/api/agency/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
        if (!res.ok) { const d = await res.json(); toast.show(d.error, 'error'); return; }
        toast.show('Member removed', 'success');
        setConfirmDelete(null);
        load();
    };

    const handleRevoke = async (invitationId) => {
        const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' });
        if (!res.ok) { const d = await res.json(); toast.show(d.error, 'error'); return; }
        toast.show('Invitation revoked', 'success');
        load();
    };

    const resetDays = Math.max(0, Math.ceil((new Date(a.quotaResetDate) - Date.now()) / 86400000));

    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader
                eyebrow={`Agency · ${a.plan.toUpperCase()}`}
                title={a.name}
                subtitle={<>Pooled quota across <span className="text-gray-900 font-medium">{seatsUsed}</span> active seat{seatsUsed === 1 ? '' : 's'}</>}
                right={
                    seatsUsed + pending.length < a.seatLimit && (
                        <Button onClick={() => setInviteOpen(true)} icon={<Plus size={14} strokeWidth={2.25} />}>
                            Invite teammate
                        </Button>
                    )
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatWithBar label="Audits" used={a.auditCount} limit={auditLimit} icon={BarChart3} />
                <StatWithBar label="Chatbot messages" used={a.chatbotCount} limit={chatLimit} icon={MessageSquare} />
                <Stat
                    label="Renewal"
                    value={resetDays}
                    sub={`days until ${new Date(a.quotaResetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${seatsUsed}/${a.seatLimit} seats used`}
                    icon={Calendar}
                    tone={resetDays <= 5 ? 'warn' : 'neutral'}
                />
            </div>

            <Tabs tabs={tabsConfig} value={tab} onChange={setTab} />

            {/* TEAM */}
            {tab === 'team' && (
                <Card>
                    {acceptedTeam.length === 0 && pending.length === 0 ? (
                        <EmptyState icon={Users} title="No teammates yet"
                            description="Invite your first teammate to share your agency's pooled audits and chatbot messages."
                            action={<Button onClick={() => setInviteOpen(true)} icon={<Plus size={14} strokeWidth={2.25} />}>Invite teammate</Button>} />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>Member</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th align="right">Actions</Th>
                            </THead>
                            <TBody>
                                {acceptedTeam.map(u => {
                                    const roleLabel = (u.role || 'user').replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <Tr key={u.email}>
                                            <Td>
                                                <div className="font-semibold text-gray-900">{u.name || u.email}</div>
                                                {u.name && <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>}
                                            </Td>
                                            <Td><Tag>{roleLabel}</Tag></Td>
                                            <Td><StatusPill status="active" /></Td>
                                            <Td nowrap>
                                                <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </Td>
                                            <Td align="right">
                                                {u.role !== 'agencyAdmin' && (
                                                    <Button size="xs" variant="ghostRed" icon={<Trash2 size={12} strokeWidth={2} />}
                                                        onClick={() => setConfirmDelete({ email: u.email })}>Remove</Button>
                                                )}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                                {pending.map(p => {
                                    const roleLabel = (p.role || '').replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <Tr key={p._id} muted>
                                            <Td><span className="font-semibold text-gray-700">{p.email}</span></Td>
                                            <Td><Tag>{roleLabel}</Tag></Td>
                                            <Td><StatusPill status={p.invitationStatus} /></Td>
                                            <Td nowrap>
                                                <span className="text-xs text-gray-500">invited {new Date(p.invitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </Td>
                                            <Td align="right">
                                                {p.invitationStatus === 'pending' && (
                                                    <AsyncButton size="xs" variant="ghostRed" onClick={() => handleRevoke(p.invitationId)}>Revoke</AsyncButton>
                                                )}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </TBody>
                        </DataTable>
                    )}
                </Card>
            )}

            {/* LOGS */}
            {tab === 'logs' && (
                <Card>
                    {logs.length === 0 ? (
                        <EmptyState icon={Inbox} title="No activity yet" description="Audit runs, chatbot messages and team changes will appear here." />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>When</Th><Th>Who</Th><Th>Action</Th><Th>Details</Th>
                            </THead>
                            <TBody>
                                {logs.map(l => (
                                    <Tr key={l._id}>
                                        <Td nowrap><span className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString()}</span></Td>
                                        <Td><span className="text-gray-800">{l.userEmail}</span></Td>
                                        <Td><Tag>{l.action}</Tag></Td>
                                        <Td><span className="text-xs text-gray-500 block max-w-md truncate">{l.metadata ? JSON.stringify(l.metadata) : ''}</span></Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </DataTable>
                    )}
                </Card>
            )}

            <Modal open={inviteOpen} onClose={() => setInviteOpen(false)}
                title="Invite teammate" subtitle="They'll share your agency's pooled quota once they accept."
                footer={<>
                    <Button variant="secondary" onClick={() => setInviteOpen(false)} disabled={inviteBusy}>Cancel</Button>
                    <Button onClick={handleInvite} loading={inviteBusy}>Send invite</Button>
                </>}>
                <Field label="Teammate email">
                    <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
                </Field>
            </Modal>

            <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove member"
                footer={<>
                    <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                    <AsyncButton variant="dangerSolid" onClick={() => handleDelete(confirmDelete.email)}>Remove</AsyncButton>
                </>}>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Permanently remove <strong className="text-gray-900">{confirmDelete?.email}</strong> from your team?
                    They'll lose access immediately. Activity logs and pooled counts are preserved.
                </p>
            </Modal>

            <Toast toast={toast.toast} onClose={toast.dismiss} />
        </div>
    );
}

/* Composite stat: large value + progress bar */
function StatWithBar({ label, used, limit, icon: Icon }) {
    const pct = limit ? (used / limit) * 100 : 0;
    const valueColor = pct >= 90 ? 'text-rose-600' : pct >= 70 ? 'text-amber-600' : 'text-gray-900';
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</span>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                        <Icon size={15} strokeWidth={2} className="text-purple-600" />
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
                <span className={`text-3xl font-bold tabular-nums tracking-tight ${valueColor}`}>{used}</span>
                <span className="text-sm text-gray-400 tabular-nums">/ {limit}</span>
            </div>
            <ProgressBar used={used} limit={limit} />
            <div className="text-[11px] text-gray-500 mt-2 tabular-nums">
                {Math.max(0, limit - used)} remaining · {Math.round(pct)}% used
            </div>
        </div>
    );
}
