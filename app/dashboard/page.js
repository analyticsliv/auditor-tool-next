"use client";

import { useEffect, useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Building2, Users, Mail, Activity, Plus, Settings2,
    Trash2, UserPlus2, Lock, Inbox, ChevronRight,
    User as UserIcon, Clock, AlertCircle,
} from 'lucide-react';
import { useRole } from '../utils/useRole';
import {
    Button, AsyncButton, StatusPill, Card, ProgressBar,
    Modal, EmptyState, PageHeader, Tabs, Toast, useToast,
    Stat, DataTable, THead, TBody, Tr, Th, Td,
    Skeleton, SkeletonRow, SkeletonStats, Field, Input, Select, Tag,
    Pagination,
} from '../Components/ui';

const PER_PAGE = 10;

export default function SuperAdminDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { role, loading: roleLoading } = useRole();
    const toast = useToast();

    const [tab, setTab] = useState('agencies');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Reset page to 1 whenever the active tab changes so the user always lands
    // on the first page of the new dataset.
    useEffect(() => { setPage(1); }, [tab]);
    const [agencies, setAgencies] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [invitations, setInvitations] = useState([]);

    const [creatingOpen, setCreatingOpen] = useState(false);
    const [creating, setCreating] = useState({ name: '', plan: 'pro', adminEmail: '' });
    const [creatingBusy, setCreatingBusy] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(null);
    const [overrideTarget, setOverrideTarget] = useState(null);
    const [inviteAdminTarget, setInviteAdminTarget] = useState(null);
    const [inviteAdminEmail, setInviteAdminEmail] = useState('');

    // Per-row expand state for the agency table — superadmin can drill into
    // each agency to see its members and pending invites without leaving
    // the page.
    const [expandedAgencies, setExpandedAgencies] = useState(() => new Set());
    const toggleAgencyExpand = (id) => {
        setExpandedAgencies(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const loadAll = async () => {
        try {
            const [a, u, l, i] = await Promise.all([
                fetch('/api/admin/agencies').then(r => r.json()),
                fetch('/api/admin/users').then(r => r.json()),
                fetch('/api/admin/logs').then(r => r.json()),
                fetch('/api/invitations').then(r => r.json()),
            ]);
            setAgencies(a.agencies || []);
            setUsers(u.users || []);
            setLogs(l.logs || []);
            setInvitations(i.invitations || []);
        } catch (e) {
            toast.show(e.message || 'Failed to load', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/');
        if (status === 'authenticated' && role === 'superadmin') loadAll();
    }, [status, role, router]);

    const tabsConfig = useMemo(() => ([
        { value: 'agencies',    label: 'Agencies',    count: agencies.length,     icon: Building2 },
        { value: 'users',       label: 'Users',       count: users.length,        icon: Users },
        { value: 'invitations', label: 'Invitations', count: invitations.filter(i => i.status === 'pending').length, icon: Mail },
        { value: 'logs',        label: 'Activity',    count: logs.length,         icon: Activity },
    ]), [agencies, users, invitations, logs]);

    /* -------- Pre-render gates -------- */

    if (status !== 'authenticated' || roleLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Skeleton width={140} height={11} className="mb-3" />
                    <Skeleton width={360} height={36} />
                </div>
                <SkeletonStats count={4} />
                <Card><table className="w-full"><tbody><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></tbody></table></Card>
            </div>
        );
    }

    if (role !== 'superadmin') {
        return (
            <div className="max-w-md mx-auto mt-20">
                <Card className="p-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border-2"
                         style={{ borderColor: 'rgba(249,115,22,0.35)', backgroundColor: 'rgba(249,115,22,0.08)' }}>
                        <Lock size={20} strokeWidth={2} style={{ color: '#F97316' }} />
                    </div>
                    <h1 className="text-xl font-bold text-content mb-2">Access denied</h1>
                    <p className="text-sm text-content-subtle mb-6 leading-relaxed">This area is reserved for super administrators.</p>
                    <Button onClick={() => router.push('/home')}>Go home</Button>
                </Card>
            </div>
        );
    }

    /* -------- Action handlers -------- */

    const createAgency = async () => {
        if (!creating.name || !creating.adminEmail) {
            toast.show('Name and admin email are required', 'error'); return;
        }
        setCreatingBusy(true);
        try {
            const res = await fetch('/api/admin/agencies', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creating),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || 'Failed');
            const adminMsg = d.adminPreExisting
                ? `Promoted ${creating.adminEmail} to agency admin.`
                : `Agency created. ${creating.adminEmail} can now sign in to access it.`;
            toast.show(d.emailSent ? `${adminMsg} Welcome email sent.` : adminMsg, 'success');
            setCreating({ name: '', plan: 'pro', adminEmail: '' });
            setCreatingOpen(false);
            await loadAll();
        } catch (e) {
            toast.show(e.message, 'error');
        } finally {
            setCreatingBusy(false);
        }
    };

    const saveOverride = async () => {
        const t = overrideTarget;
        const url = t.kind === 'agency'
            ? `/api/admin/agencies/${t.id}`
            : `/api/admin/users/${encodeURIComponent(t.email)}`;
        // Build the patch body — only include `plan` and `resetCounts` for
        // agency targets (users don't have plans in this app).
        const body = {
            auditLimitOverride: t.auditLimitOverride === '' ? null : Number(t.auditLimitOverride),
            chatbotLimitOverride: t.chatbotLimitOverride === '' ? null : Number(t.chatbotLimitOverride),
        };
        if (t.kind === 'agency') {
            // Send plan only when it actually changed so the backend keeps
            // the existing audit/chatbot counters intact.
            if (t.plan && t.plan !== t.originalPlan) {
                body.plan = t.plan;
                if (t.resetCounts) body.resetCounts = true;
            }
        }
        const res = await fetch(url, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) { const d = await res.json(); toast.show(d.error, 'error'); return; }
        toast.show(body.plan ? 'Plan & limits updated' : 'Limits updated', 'success');
        setOverrideTarget(null);
        loadAll();
    };

    const doDelete = async () => {
        const t = confirmDelete;
        const url = t.kind === 'agency'
            ? `/api/admin/agencies/${t.id}`
            : `/api/admin/users/${encodeURIComponent(t.email)}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) { const d = await res.json(); toast.show(d.error, 'error'); return; }
        toast.show(`${t.kind === 'agency' ? 'Agency' : 'User'} deleted`, 'success');
        setConfirmDelete(null);
        loadAll();
    };

    const sendAdminInvite = async () => {
        if (!inviteAdminEmail) { toast.show('Email is required', 'error'); return; }
        const res = await fetch('/api/invitations', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteAdminEmail, role: 'agencyAdmin', agencyId: inviteAdminTarget.agencyId }),
        });
        const d = await res.json();
        if (!res.ok) { toast.show(d.error, 'error'); return; }
        toast.show(`Invite sent to ${inviteAdminEmail}`, 'success');
        setInviteAdminTarget(null);
        setInviteAdminEmail('');
        loadAll();
    };

    const revokeInvite = async (invitationId) => {
        const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' });
        if (!res.ok) { const d = await res.json(); toast.show(d.error, 'error'); return; }
        toast.show('Invitation revoked', 'success');
        loadAll();
    };

    /* -------- Derived stats -------- */

    const pendingInvitesCount = invitations.filter(i => i.status === 'pending').length;
    const totalAuditPool = agencies.reduce((s, a) => s + (a.auditLimitOverride ?? a.auditLimit ?? 0), 0);
    const totalAuditUsed = agencies.reduce((s, a) => s + (a.auditCount ?? 0), 0);

    /* -------- Pagination slices -------- */

    const sliceFor = (arr) => arr.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pagedAgencies    = sliceFor(agencies);
    const pagedUsers       = sliceFor(users);
    const pagedInvitations = sliceFor(invitations);
    const pagedLogs        = sliceFor(logs);
    const totalForTab = {
        agencies: agencies.length,
        users: users.length,
        invitations: invitations.length,
        logs: logs.length,
    }[tab] || 0;
    const totalPages = Math.max(1, Math.ceil(totalForTab / PER_PAGE));

    return (
        <div className="max-w-7xl mx-auto">
            <PageHeader
                eyebrow="Super admin"
                title="Control center"
                subtitle={<>Signed in as <span className="text-content font-medium">{session.user.email}</span></>}
                right={
                    <Button onClick={() => setCreatingOpen(true)} icon={<Plus size={14} strokeWidth={2.25} />}>
                        New agency
                    </Button>
                }
            />

            {/* Stat callouts */}
            {loading ? (
                <SkeletonStats count={4} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Stat label="Agencies" value={agencies.length} icon={Building2} />
                    <Stat label="Users" value={users.length} icon={Users} />
                    <Stat label="Pending invites" value={pendingInvitesCount} icon={Mail} tone={pendingInvitesCount > 0 ? 'warn' : 'neutral'} />
                    <Stat label="Audit pool" value={totalAuditUsed} accent={totalAuditPool} icon={Activity}
                        sub={totalAuditPool ? `${Math.round((totalAuditUsed / totalAuditPool) * 100)}% used across all agencies` : 'no agencies yet'} />
                </div>
            )}

            <Tabs tabs={tabsConfig} value={tab} onChange={setTab} />

            {/* AGENCIES */}
            {tab === 'agencies' && (
                <Card>
                    {loading ? (
                        <table className="w-full"><tbody><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /></tbody></table>
                    ) : agencies.length === 0 ? (
                        <EmptyState icon={Building2} title="No agencies yet"
                            description="Create your first agency and invite an admin to get started."
                            action={<Button onClick={() => setCreatingOpen(true)} icon={<Plus size={14} strokeWidth={2.25} />}>New agency</Button>} />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>Agency</Th><Th>Plan</Th><Th>Seats</Th><Th>Audits</Th><Th>Chatbot</Th><Th>Resets</Th><Th align="right">Actions</Th>
                            </THead>
                            <TBody>
                                {pagedAgencies.map(a => {
                                    const al = a.auditLimitOverride ?? a.auditLimit;
                                    const cl = a.chatbotLimitOverride ?? a.chatbotLimit;
                                    const acceptedAdmin = a.hasAdmin;
                                    const isExpanded = expandedAgencies.has(a.agencyId);
                                    return (
                                        <Fragment key={a.agencyId}>
                                        <Tr>
                                            <Td>
                                                <div className="flex items-start gap-2.5">
                                                    {/* Drill-in chevron — rotates 90° when expanded.
                                                        Provides a clean affordance for opening the
                                                        agency's user list without an extra column. */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAgencyExpand(a.agencyId)}
                                                        aria-expanded={isExpanded}
                                                        aria-label={isExpanded ? 'Collapse agency details' : 'Expand agency details'}
                                                        className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-md border border-line text-content-muted hover:text-content hover:border-content-subtle/50 hover:bg-surface-muted/60 transition-colors flex-shrink-0"
                                                        style={isExpanded ? { borderColor: '#F97316', color: '#F97316', backgroundColor: 'rgba(249,115,22,0.06)' } : undefined}
                                                    >
                                                        <ChevronRight size={13} strokeWidth={2.4}
                                                            className="transition-transform duration-300"
                                                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                                                    </button>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-content">{a.name}</div>
                                                        {acceptedAdmin ? (
                                                            <div className="text-xs text-content-subtle mt-0.5">{a.adminEmails?.[0]}</div>
                                                        ) : a.pendingAdminInvite ? (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <StatusPill status="pending" />
                                                                <span className="text-xs text-content-subtle">{a.pendingAdminInvite.email}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">no admin assigned</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td>
                                                {/* Plan is a read-only badge in the table.
                                                    Edit it via the Override modal so that
                                                    audit/chatbot/seat limits update in lockstep. */}
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-[0.06em]"
                                                    style={{
                                                        backgroundColor: a.plan === 'premium' ? 'rgba(26,115,232,0.10)' : 'rgba(249,115,22,0.10)',
                                                        color:           a.plan === 'premium' ? '#1A73E8' : '#F97316',
                                                        border:          `1px solid ${a.plan === 'premium' ? 'rgba(26,115,232,0.35)' : 'rgba(249,115,22,0.35)'}`,
                                                    }}>
                                                    {a.plan}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="tabular-nums text-sm text-content">{a.seatsUsed}<span className="text-content-subtle">/{a.seatLimit}</span></span>
                                            </Td>
                                            <Td className="min-w-[160px]">
                                                <div className="text-xs tabular-nums text-content-muted mb-1.5">{a.auditCount}<span className="text-content-subtle"> / {al}</span></div>
                                                <ProgressBar used={a.auditCount} limit={al} />
                                            </Td>
                                            <Td className="min-w-[160px]">
                                                <div className="text-xs tabular-nums text-content-muted mb-1.5">{a.chatbotCount}<span className="text-content-subtle"> / {cl}</span></div>
                                                <ProgressBar used={a.chatbotCount} limit={cl} />
                                            </Td>
                                            <Td nowrap>
                                                <span className="text-xs text-content-subtle">{new Date(a.quotaResetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </Td>
                                            <Td align="right" nowrap>
                                                <div className="inline-flex items-center gap-1">
                                                    {!acceptedAdmin && !a.pendingAdminInvite && (
                                                        <Button size="xs" variant="ghost" icon={<UserPlus2 size={12} strokeWidth={2} />}
                                                            onClick={() => { setInviteAdminTarget(a); setInviteAdminEmail(''); }}>Invite admin</Button>
                                                    )}
                                                    {acceptedAdmin && (
                                                        <Button size="xs" variant="ghostAccent" icon={<Settings2 size={12} strokeWidth={2} />}
                                                            onClick={() => setOverrideTarget({
                                                                kind: 'agency',
                                                                id: a.agencyId,
                                                                name: a.name,
                                                                plan: a.plan,
                                                                originalPlan: a.plan,
                                                                resetCounts: false,
                                                                auditLimitOverride: a.auditLimitOverride ?? '',
                                                                chatbotLimitOverride: a.chatbotLimitOverride ?? '',
                                                            })}>Override</Button>
                                                    )}
                                                    <Button size="xs" variant="ghostRed" icon={<Trash2 size={12} strokeWidth={2} />}
                                                        onClick={() => setConfirmDelete({ kind:'agency', id:a.agencyId, label:a.name })}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>

                                        {/* Expanded detail row — accordion-style smooth open.
                                            Always rendered so the grid-rows transition can animate
                                            both directions; visibility is controlled by isExpanded. */}
                                        <tr className="bg-surface-muted/30">
                                            <td colSpan={7} className="p-0 border-b border-line">
                                                <div
                                                    className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <AgencyDetailPanel
                                                            agency={a}
                                                            users={users}
                                                            invitations={invitations}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        </Fragment>
                                    );
                                })}
                            </TBody>
                        </DataTable>
                    )}
                    {!loading && agencies.length > 0 && (
                        <Pagination page={page} total={totalPages} onChange={setPage} pageSize={PER_PAGE} totalItems={agencies.length} />
                    )}
                </Card>
            )}

            {/* USERS */}
            {tab === 'users' && (
                <Card>
                    {loading ? (
                        <table className="w-full"><tbody><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /></tbody></table>
                    ) : users.length === 0 ? (
                        <EmptyState icon={Users} title="No users yet"
                            description="Once invited users accept and sign in, they'll appear here with their usage." />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>User</Th><Th>Role</Th><Th>Agency</Th><Th>Audits</Th><Th>Chatbot</Th><Th>Last login</Th><Th align="right">Actions</Th>
                            </THead>
                            <TBody>
                                {pagedUsers.map(u => {
                                    const isAgency = !!u.agency;
                                    const al = isAgency ? (u.agency.auditLimitOverride ?? u.agency.auditLimit) : (u.auditLimitOverride ?? u.auditLimit);
                                    const cl = isAgency ? (u.agency.chatbotLimitOverride ?? u.agency.chatbotLimit) : (u.chatbotLimitOverride ?? u.chatbotLimit);
                                    const ac = isAgency ? u.agency.auditCount : u.auditCount;
                                    const cc = isAgency ? u.agency.chatbotCount : u.chatbotCount;
                                    const roleLabel = (u.role || 'user').replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <Tr key={u._id || u.email}>
                                            <Td>
                                                <div className="font-semibold text-content">{u.name || u.email}</div>
                                                {u.name && <div className="text-xs text-content-subtle mt-0.5">{u.email}</div>}
                                            </Td>
                                            <Td><Tag>{roleLabel}</Tag></Td>
                                            <Td>{u.agency?.name ? <span className="text-content">{u.agency.name}</span> : <span className="text-content-subtle">—</span>}</Td>
                                            <Td className="min-w-[140px]">
                                                <div className="text-xs tabular-nums text-content-muted mb-1">
                                                    {ac}<span className="text-content-subtle"> / {al}</span>
                                                    {isAgency && <span className="ml-1.5 text-content-subtle text-[10px]">pool</span>}
                                                </div>
                                                <ProgressBar used={ac} limit={al} />
                                            </Td>
                                            <Td className="min-w-[140px]">
                                                <div className="text-xs tabular-nums text-content-muted mb-1">
                                                    {cc}<span className="text-content-subtle"> / {cl}</span>
                                                    {isAgency && <span className="ml-1.5 text-content-subtle text-[10px]">pool</span>}
                                                </div>
                                                <ProgressBar used={cc} limit={cl} />
                                            </Td>
                                            <Td nowrap>
                                                <span className="text-xs text-content-subtle">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</span>
                                            </Td>
                                            <Td align="right" nowrap>
                                                <div className="inline-flex items-center gap-1">
                                                    {!isAgency && (
                                                        <Button size="xs" variant="ghostAccent" icon={<Settings2 size={12} strokeWidth={2} />}
                                                            onClick={() => setOverrideTarget({ kind:'user', email:u.email, name:u.email, auditLimitOverride:u.auditLimitOverride ?? '', chatbotLimitOverride:u.chatbotLimitOverride ?? '' })}>Override</Button>
                                                    )}
                                                    <Button size="xs" variant="ghostRed" icon={<Trash2 size={12} strokeWidth={2} />}
                                                        onClick={() => setConfirmDelete({ kind:'user', email:u.email, label:u.email })}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </TBody>
                        </DataTable>
                    )}
                    {!loading && users.length > 0 && (
                        <Pagination page={page} total={totalPages} onChange={setPage} pageSize={PER_PAGE} totalItems={users.length} />
                    )}
                </Card>
            )}

            {/* INVITATIONS */}
            {tab === 'invitations' && (
                <Card>
                    {loading ? (
                        <table className="w-full"><tbody><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /></tbody></table>
                    ) : invitations.length === 0 ? (
                        <EmptyState icon={Mail} title="No invitations sent" description="Invitations to agency admins or members will be tracked here." />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>Email</Th><Th>Role</Th><Th>Agency</Th><Th>Invited by</Th><Th>Status</Th><Th>Expires</Th><Th align="right">Actions</Th>
                            </THead>
                            <TBody>
                                {pagedInvitations.map(i => {
                                    const agency = agencies.find(a => a.agencyId === i.agencyId);
                                    const roleLabel = (i.role || '').replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <Tr key={i._id}>
                                            <Td><span className="font-semibold text-content">{i.email}</span></Td>
                                            <Td><Tag>{roleLabel}</Tag></Td>
                                            <Td>{agency?.name ? <span className="text-content">{agency.name}</span> : <span className="text-content-subtle text-xs">—</span>}</Td>
                                            <Td><span className="text-xs text-content-muted">{i.invitedBy}</span></Td>
                                            <Td><StatusPill status={i.status} /></Td>
                                            <Td nowrap><span className="text-xs text-content-subtle">{new Date(i.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></Td>
                                            <Td align="right">
                                                {i.status === 'pending' && (
                                                    <AsyncButton size="xs" variant="ghostRed" onClick={() => revokeInvite(i._id)}>Revoke</AsyncButton>
                                                )}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </TBody>
                        </DataTable>
                    )}
                    {!loading && invitations.length > 0 && (
                        <Pagination page={page} total={totalPages} onChange={setPage} pageSize={PER_PAGE} totalItems={invitations.length} />
                    )}
                </Card>
            )}

            {/* LOGS */}
            {tab === 'logs' && (
                <Card>
                    {loading ? (
                        <table className="w-full"><tbody><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></tbody></table>
                    ) : logs.length === 0 ? (
                        <EmptyState icon={Inbox} title="No activity yet" description="Audit runs, chatbot messages, invites and admin actions appear here." />
                    ) : (
                        <DataTable>
                            <THead>
                                <Th>When</Th><Th>Who</Th><Th>Agency</Th><Th>Action</Th><Th>Details</Th>
                            </THead>
                            <TBody>
                                {pagedLogs.map(l => (
                                    <Tr key={l._id}>
                                        <Td nowrap><span className="text-xs text-content-subtle">{new Date(l.createdAt).toLocaleString()}</span></Td>
                                        <Td><span className="text-content">{l.userEmail}</span></Td>
                                        <Td><span className="text-xs text-content-subtle">{l.agencyId || '—'}</span></Td>
                                        <Td><Tag>{l.action}</Tag></Td>
                                        <Td><span className="text-xs text-content-subtle block max-w-md truncate">{l.metadata ? JSON.stringify(l.metadata) : ''}</span></Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </DataTable>
                    )}
                    {!loading && logs.length > 0 && (
                        <Pagination page={page} total={totalPages} onChange={setPage} pageSize={PER_PAGE} totalItems={logs.length} />
                    )}
                </Card>
            )}

            {/* Modals */}
            <Modal open={creatingOpen} onClose={() => setCreatingOpen(false)}
                title="New agency" subtitle="Provision a workspace and assign its admin."
                footer={<>
                    <Button variant="secondary" onClick={() => setCreatingOpen(false)} disabled={creatingBusy}>Cancel</Button>
                    <Button onClick={createAgency} loading={creatingBusy}>Create &amp; invite</Button>
                </>}>
                <div className="space-y-4">
                    <Field label="Agency name">
                        <Input value={creating.name} onChange={e => setCreating(s => ({ ...s, name: e.target.value }))} placeholder="Acme Marketing" />
                    </Field>
                    <Field label="Admin email" hint="This user becomes the agency admin immediately. They sign in with Google using this email.">
                        <Input type="email" value={creating.adminEmail} onChange={e => setCreating(s => ({ ...s, adminEmail: e.target.value }))} placeholder="admin@acme.com" />
                    </Field>
                    <Field label="Plan">
                        <Select value={creating.plan} onChange={e => setCreating(s => ({ ...s, plan: e.target.value }))}>
                            <option value="pro">Pro — 30 audits · 50 chats · 5 seats</option>
                            <option value="premium">Premium — 50 audits · 75 chats · 15 seats</option>
                        </Select>
                    </Field>
                </div>
            </Modal>

            <Modal open={!!overrideTarget} onClose={() => setOverrideTarget(null)}
                title={overrideTarget?.kind === 'agency' ? 'Plan & limits' : 'Override limits'}
                subtitle={overrideTarget?.name}
                footer={<>
                    <Button variant="secondary" onClick={() => setOverrideTarget(null)}>Cancel</Button>
                    <AsyncButton onClick={saveOverride}>
                        {overrideTarget?.kind === 'agency' && overrideTarget?.plan !== overrideTarget?.originalPlan
                            ? 'Save plan & limits'
                            : 'Save override'}
                    </AsyncButton>
                </>}>
                {overrideTarget && (
                    <div className="space-y-4">
                        {/* Plan picker — only for agency targets. Changing plan
                            also resets seatLimit/auditLimit/chatbotLimit to the
                            new plan defaults via the PATCH endpoint. */}
                        {overrideTarget.kind === 'agency' && (() => {
                            const planDefs = {
                                pro:     { auditLimit: 30, chatbotLimit: 50, seatLimit: 5 },
                                premium: { auditLimit: 50, chatbotLimit: 75, seatLimit: 15 },
                            };
                            const def = planDefs[overrideTarget.plan];
                            const planChanged = overrideTarget.plan !== overrideTarget.originalPlan;
                            return (
                                <>
                                    <Field label="Plan" hint="Changing the plan auto-fills the audit & chatbot override inputs below with that plan's defaults. You can still tweak the inputs afterwards without affecting this dropdown.">
                                        <Select
                                            value={overrideTarget.plan}
                                            onChange={(e) => {
                                                const nextPlan = e.target.value;
                                                const nextDef = planDefs[nextPlan];
                                                // One-way binding: plan → inputs.
                                                // Selecting a plan auto-populates the override inputs
                                                // with that plan's defaults so the admin sees what
                                                // the agency will get. The reverse direction (typing
                                                // in the inputs) does NOT touch this dropdown.
                                                setOverrideTarget(t => ({
                                                    ...t,
                                                    plan: nextPlan,
                                                    auditLimitOverride: nextDef ? String(nextDef.auditLimit) : t.auditLimitOverride,
                                                    chatbotLimitOverride: nextDef ? String(nextDef.chatbotLimit) : t.chatbotLimitOverride,
                                                }));
                                            }}
                                        >
                                            <option value="pro">Pro — 30 audits · 50 chats · 5 seats</option>
                                            <option value="premium">Premium — 50 audits · 75 chats · 15 seats</option>
                                        </Select>
                                    </Field>

                                    {/* Live preview of plan-derived totals */}
                                    {def && (
                                        <div className="rounded-lg border border-line bg-surface-muted/40 px-4 py-3">
                                            <div className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-content-subtle mb-2">
                                                {planChanged ? 'New plan totals' : 'Current plan totals'}
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <div className="text-content-subtle">Audits</div>
                                                    <div className="font-bold text-content tabular-nums text-base mt-0.5">{def.auditLimit}/mo</div>
                                                </div>
                                                <div>
                                                    <div className="text-content-subtle">Chatbot</div>
                                                    <div className="font-bold text-content tabular-nums text-base mt-0.5">{def.chatbotLimit}/mo</div>
                                                </div>
                                                <div>
                                                    <div className="text-content-subtle">Seats</div>
                                                    <div className="font-bold text-content tabular-nums text-base mt-0.5">{def.seatLimit}</div>
                                                </div>
                                            </div>
                                            {planChanged && (
                                                <label className="mt-3 flex items-start gap-2 text-xs text-content cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!overrideTarget.resetCounts}
                                                        onChange={(e) => setOverrideTarget(t => ({ ...t, resetCounts: e.target.checked }))}
                                                        className="mt-0.5 accent-[#F97316]"
                                                    />
                                                    <span>
                                                        Also reset <strong>audit & chatbot usage counters to 0</strong> for this agency.
                                                        <span className="block text-content-subtle mt-0.5">
                                                            Skip this if the agency has already consumed quota you want to preserve.
                                                        </span>
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        <Field label="Audit limit override" hint="Leave blank to revert to plan default.">
                            <Input type="number" min="0" value={overrideTarget.auditLimitOverride}
                                onChange={(e) => setOverrideTarget(t => ({ ...t, auditLimitOverride: e.target.value }))} />
                        </Field>
                        <Field label="Chatbot limit override" hint="Leave blank to revert to plan default.">
                            <Input type="number" min="0" value={overrideTarget.chatbotLimitOverride}
                                onChange={(e) => setOverrideTarget(t => ({ ...t, chatbotLimitOverride: e.target.value }))} />
                        </Field>
                    </div>
                )}
            </Modal>

            <Modal open={!!inviteAdminTarget} onClose={() => setInviteAdminTarget(null)}
                title="Invite admin" subtitle={inviteAdminTarget?.name}
                footer={<>
                    <Button variant="secondary" onClick={() => setInviteAdminTarget(null)}>Cancel</Button>
                    <AsyncButton onClick={sendAdminInvite}>Send invite</AsyncButton>
                </>}>
                <Field label="Admin email">
                    <Input type="email" value={inviteAdminEmail} onChange={(e) => setInviteAdminEmail(e.target.value)} placeholder="admin@agency.com" />
                </Field>
            </Modal>

            <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirm deletion"
                footer={<>
                    <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                    <AsyncButton variant="dangerSolid" onClick={doDelete}>Delete</AsyncButton>
                </>}>
                <p className="text-sm text-content-muted leading-relaxed">
                    Permanently delete <strong className="text-content">{confirmDelete?.label}</strong>?
                    Activity logs and pooled counts are preserved. This action cannot be undone.
                </p>
            </Modal>

            <Toast toast={toast.toast} onClose={toast.dismiss} />
        </div>
    );
}

/* ============================================================
   AGENCY DETAIL PANEL
   Expanded accordion content shown when superadmin clicks the
   chevron on an agency row. Pulls users/invitations from the
   already-loaded dashboard state — no extra fetch needed.
   ============================================================ */
function AgencyDetailPanel({ agency, users, invitations }) {
    const ORANGE = '#F97316';
    const BLUE   = '#1A73E8';

    const members = (users || []).filter(u => u?.agency?.agencyId === agency.agencyId
        || u?.agencyId === agency.agencyId);
    // Only surface invitations that are still actionable. Anything revoked,
    // expired, or already accepted is captured in the Activity log instead.
    const pending = (invitations || []).filter(i =>
        i.agencyId === agency.agencyId && i.status === 'pending'
    );

    const admins = members.filter(u => u.role === 'agencyAdmin');
    const teamMembers = members.filter(u => u.role !== 'agencyAdmin');
    const hasOverride = agency.auditLimitOverride != null || agency.chatbotLimitOverride != null;

    return (
        <div className="px-5 py-4 border-l-[3px]" style={{ borderLeftColor: ORANGE }}>
            {/* Two-column body: members left, pending invites right.
                Quick stats (members count, pending count, audits, chatbot)
                are intentionally not duplicated here — they're already
                visible in the parent agency row. */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3">

                {/* MEMBERS */}
                <DetailList
                    icon={Users}
                    title={`Members · ${members.length}${agency.seatLimit ? ` / ${agency.seatLimit}` : ''}`}
                    accent={ORANGE}
                    items={[...admins, ...teamMembers]}
                    empty="No accepted members yet."
                    renderItem={(u) => (
                        <li key={u.email} className="px-3 py-2 flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-white shrink-0"
                                 style={{ backgroundColor: u.role === 'agencyAdmin' ? ORANGE : BLUE }}>
                                <UserIcon size={11} strokeWidth={2.4} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-semibold text-content truncate leading-tight">{u.email}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-content-subtle mt-0.5 leading-tight">
                                    <span className="uppercase tracking-[0.12em] font-bold"
                                          style={{ color: u.role === 'agencyAdmin' ? ORANGE : BLUE }}>
                                        {u.role === 'agencyAdmin' ? 'Admin' : 'Team'}
                                    </span>
                                    {u.lastLogin && (
                                        <>
                                            <span className="opacity-50">·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={9} strokeWidth={2.4} />
                                                {new Date(u.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    )}
                />

                {/* PENDING INVITES — pending status only; revoked/expired filtered out */}
                <DetailList
                    icon={Mail}
                    title={`Pending invites · ${pending.length}`}
                    accent={pending.length > 0 ? ORANGE : 'rgb(var(--border-strong))'}
                    items={pending}
                    empty="No pending invitations."
                    renderItem={(i) => (
                        <li key={i._id || i.email} className="px-3 py-2">
                            <div className="text-[12px] font-semibold text-content truncate leading-tight">{i.email}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-content-subtle mt-0.5 leading-tight">
                                <span className="uppercase tracking-[0.12em] font-bold" style={{ color: ORANGE }}>
                                    {i.role === 'agencyAdmin' ? 'Admin' : 'Team'}
                                </span>
                                {i.expiresAt && (
                                    <>
                                        <span className="opacity-50">·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock size={9} strokeWidth={2.4} />
                                            exp {new Date(i.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </>
                                )}
                            </div>
                        </li>
                    )}
                />
            </div>

            {/* Override flag — hidden by request. Kept for reference in case
                we want to re-enable it later. The `hasOverride` constant
                above still computes the value if any other UI ever needs it. */}
            {/*
            {hasOverride && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.14em] border"
                     style={{ borderColor: 'rgba(249,115,22,0.35)', backgroundColor: 'rgba(249,115,22,0.08)', color: ORANGE }}>
                    <AlertCircle size={10} strokeWidth={2.5} />
                    Custom limits override active
                </div>
            )}
            */}
        </div>
    );
}

/* Compact list card used by the agency detail panel — narrow header bar,
   tight rows, hidden when empty list still renders an inline empty state. */
function DetailList({ icon: Icon, title, accent, items, empty, renderItem }) {
    return (
        <div className="rounded-md border border-line bg-surface overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-line bg-surface-muted/40">
                <Icon size={12} style={{ color: accent }} strokeWidth={2.4} />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-content">{title}</span>
            </div>
            {items.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11.5px] text-content-subtle">{empty}</div>
            ) : (
                <ul className="divide-y divide-line max-h-[180px] overflow-y-auto">
                    {items.map(renderItem)}
                </ul>
            )}
        </div>
    );
}
