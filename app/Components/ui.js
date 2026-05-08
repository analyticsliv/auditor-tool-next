"use client";

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/* ---------- Spinner ---------- */

export function Spinner({ size = 14, className = '' }) {
    return (
        <span
            className={`inline-block align-[-2px] border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
            style={{ width: size, height: size }}
        />
    );
}

/* ---------- Buttons ---------- */

const VARIANTS = {
    primary:
        'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:text-gray-100 dark:disabled:from-slate-700 dark:disabled:via-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400 shadow-sm hover:shadow-md',
    secondary:
        'bg-surface text-content border border-line-strong hover:bg-surface-hover hover:border-line-strong disabled:bg-surface-hover disabled:text-content-subtle disabled:border-line',
    danger:
        'bg-surface text-danger border border-danger/30 hover:bg-danger-muted hover:border-danger/50 disabled:bg-surface-hover disabled:text-content-subtle',
    dangerSolid:
        'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 shadow-sm',
    ghost:
        'text-content hover:bg-surface-hover disabled:text-content-subtle',
    ghostAccent:
        'text-purple-600 hover:bg-purple-50 disabled:text-content-subtle dark:text-purple-400 dark:hover:bg-purple-500/10',
    ghostRed:
        'text-danger hover:bg-danger-muted disabled:text-content-subtle',
};

const SIZES = {
    xs: 'px-2 py-1 text-[11px] rounded-md',
    sm: 'px-2.5 py-1 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-sm rounded-xl',
};

export function Button({
    children, onClick, type = 'button', disabled = false, loading = false,
    variant = 'primary', size = 'md', className = '', icon = null,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 ${SIZES[size]} ${VARIANTS[variant]} ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            {loading && <Spinner size={size === 'sm' || size === 'xs' ? 11 : 13} />}
            {!loading && icon}
            {children}
        </button>
    );
}

export function AsyncButton({ onClick, ...rest }) {
    const [loading, setLoading] = useState(false);
    const handle = async (e) => {
        if (loading) return;
        setLoading(true);
        try { await onClick?.(e); } finally { setLoading(false); }
    };
    return <Button {...rest} onClick={handle} loading={loading} />;
}

/* ---------- Status pill ---------- */

const STATUS_TONES = {
    accepted: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500 dark:bg-emerald-400' },
    active:   { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500 dark:bg-emerald-400' },
    pending:  { bg: 'bg-amber-50 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500 dark:bg-amber-400' },
    expired:  { bg: 'bg-surface-hover',                     text: 'text-content-muted',                    dot: 'bg-content-subtle' },
    revoked:  { bg: 'bg-rose-50 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-300',       dot: 'bg-rose-500 dark:bg-rose-400' },
    rejected: { bg: 'bg-rose-50 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-300',       dot: 'bg-rose-500 dark:bg-rose-400' },
    suspended:{ bg: 'bg-rose-50 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-300',       dot: 'bg-rose-500 dark:bg-rose-400' },
};

export function StatusPill({ status, className = '' }) {
    if (!status) return null;
    const tone = STATUS_TONES[status] || { bg: 'bg-surface-hover', text: 'text-content-muted', dot: 'bg-content-subtle' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider rounded-full ${tone.bg} ${tone.text} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
            {status}
        </span>
    );
}

/* ---------- Card ---------- */

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-surface border border-line rounded-2xl shadow-sm ${className}`}>
            {children}
        </div>
    );
}

/* ---------- Progress ---------- */

export function ProgressBar({ used = 0, limit = 0, height = 6 }) {
    const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
    let gradient = 'from-blue-500 via-purple-500 to-pink-500';
    if (pct >= 90) gradient = 'from-rose-500 to-orange-500';
    else if (pct >= 70) gradient = 'from-amber-400 to-orange-400';
    return (
        <div className="w-full bg-surface-hover rounded-full overflow-hidden" style={{ height }}>
            <div className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out rounded-full`} style={{ width: `${pct}%` }} />
        </div>
    );
}

/* ---------- Stat callout ---------- */

export function Stat({ label, value, sub, accent, icon: Icon, tone = 'neutral' }) {
    const valueColor =
        tone === 'warn' ? 'text-amber-600 dark:text-amber-400' :
        tone === 'danger' ? 'text-rose-600 dark:text-rose-400' :
        tone === 'accent' ? 'text-purple-600 dark:text-purple-400' :
        'text-content';
    return (
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-line-strong transition-all">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase tracking-wider text-content-subtle font-semibold">{label}</span>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-pink-500/15 flex items-center justify-center">
                        <Icon size={15} strokeWidth={2} className="text-purple-600 dark:text-purple-400" />
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-bold tabular-nums tracking-tight ${valueColor}`}>{value}</span>
                {accent != null && <span className="text-sm text-content-subtle tabular-nums">/ {accent}</span>}
            </div>
            {sub && <div className="text-xs text-content-subtle mt-1.5">{sub}</div>}
        </div>
    );
}

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" style={{ animation: 'ui-fadeIn 180ms ease-out' }} />
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${maxWidth} bg-surface-elevated border border-line sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden`}
                style={{ animation: 'ui-modalIn 220ms cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
                {title && (
                    <div className="px-6 pt-5 pb-4 border-b border-line flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-content leading-tight">{title}</h3>
                            {subtitle && <p className="text-sm text-content-subtle mt-1">{subtitle}</p>}
                        </div>
                        <button onClick={onClose} className="text-content-subtle hover:text-content hover:bg-surface-hover rounded-lg p-1.5 transition-colors" aria-label="Close">
                            <X size={16} strokeWidth={2} />
                        </button>
                    </div>
                )}
                <div className="p-6 text-content">{children}</div>
                {footer && (
                    <div className="px-6 py-4 bg-surface-muted border-t border-line flex justify-end gap-2">{footer}</div>
                )}
            </div>
            <style jsx global>{`
                @keyframes ui-fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes ui-modalIn {
                    from { opacity: 0; transform: translateY(8px) scale(0.985) }
                    to { opacity: 1; transform: translateY(0) scale(1) }
                }
            `}</style>
        </div>
    );
}

/* ---------- Empty state ---------- */

export function EmptyState({ title, description, icon: Icon, action }) {
    return (
        <div className="text-center py-16 px-6">
            {Icon && (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-pink-500/15 border border-purple-100 dark:border-purple-500/20">
                    <Icon size={22} strokeWidth={1.75} className="text-purple-600 dark:text-purple-400" />
                </div>
            )}
            <h3 className="text-base font-semibold text-content mb-1.5">{title}</h3>
            {description && <p className="text-sm text-content-subtle max-w-sm mx-auto leading-relaxed">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

/* ---------- Page header ---------- */

export function PageHeader({ eyebrow, title, subtitle, right }) {
    return (
        <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    {eyebrow && (
                        <div className="text-[11px] uppercase tracking-[0.14em] text-purple-600 dark:text-purple-400 font-semibold mb-2">{eyebrow}</div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold text-content tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-content-subtle mt-1.5">{subtitle}</p>}
                </div>
                {right && <div className="flex items-center gap-2 mb-1">{right}</div>}
            </div>
            <div className="mt-5 h-px w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
        </div>
    );
}

/* ---------- Tabs (underline rail with sliding indicator) ---------- */

export function Tabs({ tabs, value, onChange }) {
    const railRef = useRef(null);
    const [indicator, setIndicator] = useState({ x: 0, w: 0 });

    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;
        const active = rail.querySelector(`[data-tab="${value}"]`);
        if (!active) return;
        const railRect = rail.getBoundingClientRect();
        const r = active.getBoundingClientRect();
        setIndicator({ x: r.left - railRect.left, w: r.width });
    }, [value, tabs]);

    return (
        <div className="relative border-b border-line mb-6">
            <div ref={railRef} className="flex gap-6 relative">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = value === t.value;
                    return (
                        <button
                            key={t.value}
                            data-tab={t.value}
                            onClick={() => onChange(t.value)}
                            className={`pb-3 pt-1 inline-flex items-center gap-2 text-sm transition-colors ${active ? 'text-content font-semibold' : 'text-content-subtle hover:text-content font-medium'}`}
                        >
                            {Icon && <Icon size={15} strokeWidth={1.75} />}
                            <span className="capitalize">{t.label}</span>
                            {typeof t.count === 'number' && (
                                <span className={`text-[10.5px] tabular-nums px-1.5 py-px rounded-full font-medium ${active ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-surface-hover text-content-subtle'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    );
                })}
                <div
                    className="absolute -bottom-px h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-300 ease-out rounded-full"
                    style={{ transform: `translateX(${indicator.x}px)`, width: indicator.w }}
                />
            </div>
        </div>
    );
}

/* ---------- Tables ---------- */

export function DataTable({ children, className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-sm">{children}</table>
        </div>
    );
}

export function THead({ children }) {
    return (
        <thead className="bg-surface-muted">
            <tr className="border-b border-line">{children}</tr>
        </thead>
    );
}

export function Th({ children, align = 'left', className = '' }) {
    const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <th className={`px-5 py-3 ${alignCls} text-[11px] font-semibold uppercase tracking-wider text-content-subtle ${className}`}>
            {children}
        </th>
    );
}

export function TBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function Tr({ children, className = '', muted = false }) {
    return (
        <tr className={`border-b border-line last:border-0 transition-colors ${muted ? 'bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10' : 'hover:bg-surface-muted'} ${className}`}>
            {children}
        </tr>
    );
}

export function Td({ children, align = 'left', nowrap = false, className = '' }) {
    const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <td className={`px-5 py-3.5 ${alignCls} ${nowrap ? 'whitespace-nowrap' : ''} text-content ${className}`}>
            {children}
        </td>
    );
}

/* ---------- Skeleton loaders ---------- */

export function Skeleton({ width = '100%', height = 12, className = '' }) {
    return (
        <span
            className={`inline-block rounded skeleton-shimmer ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonRow({ cols = 5 }) {
    return (
        <tr className="border-b border-line last:border-0">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <Skeleton width={`${40 + ((i * 13) % 50)}%`} height={10} />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonTable({ cols = 5, rows = 4 }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
                </tbody>
            </table>
        </div>
    );
}

export function SkeletonStats({ count = 4 }) {
    return (
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
                    <Skeleton width="40%" height={9} className="mb-3" />
                    <Skeleton width="55%" height={28} />
                </div>
            ))}
        </div>
    );
}

/* ---------- Toast ---------- */

export function Toast({ toast, onClose }) {
    if (!toast) return null;
    const tone =
        toast.kind === 'error' ? { bar: 'bg-rose-500' } :
        toast.kind === 'success' ? { bar: 'bg-emerald-500' } :
        { bar: 'bg-purple-500' };
    return (
        <div className="fixed bottom-6 right-6 z-[60]" style={{ animation: 'ui-toastIn 220ms ease-out' }}>
            <div className="bg-surface-elevated border border-line rounded-xl pl-4 pr-3 py-3 flex items-center gap-3 max-w-sm shadow-lg">
                <span className={`w-1 h-7 rounded-full flex-shrink-0 ${tone.bar}`} />
                <span className="text-sm text-content">{toast.message}</span>
                <button onClick={onClose} className="text-content-subtle hover:text-content p-0.5" aria-label="Dismiss">
                    <X size={14} strokeWidth={2} />
                </button>
            </div>
            <style jsx global>{`
                @keyframes ui-toastIn {
                    from { opacity: 0; transform: translateY(8px) }
                    to { opacity: 1; transform: translateY(0) }
                }
            `}</style>
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState(null);
    const show = (message, kind = 'info') => {
        setToast({ message, kind });
        setTimeout(() => setToast(null), 4200);
    };
    return { toast, setToast, show, dismiss: () => setToast(null) };
}

/* ---------- Form primitives ---------- */

export function Field({ label, hint, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-content mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-xs text-content-subtle mt-1.5">{hint}</p>}
        </div>
    );
}

export function Input(props) {
    return (
        <input
            {...props}
            className={`w-full bg-surface border border-line-strong rounded-lg px-3 py-2 text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors ${props.className || ''}`}
        />
    );
}

export function Select(props) {
    return (
        <select
            {...props}
            className={`w-full bg-surface border border-line-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors ${props.className || ''}`}
        />
    );
}

/* ---------- Pagination ---------- */

// Build the visible page list with ellipses. Window size is fixed (3 numbers
// around current), so the total visible page-count never grows past 7 entries:
//   first + leftEllipsis + 3-page window + rightEllipsis + last
// At the edges the window slides without expanding.
function buildPageList(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    let start, end;
    if (current <= 3) {
        // Left edge: window 2..4, right ellipsis only.
        start = 2;
        end = 4;
    } else if (current >= total - 2) {
        // Right edge: window total-3..total-1, left ellipsis only.
        start = total - 3;
        end = total - 1;
    } else {
        // Middle: 3-page window around current.
        start = current - 1;
        end = current + 1;
    }

    const list = [1];
    if (start > 2) list.push('left-ellipsis');
    for (let i = start; i <= end; i++) list.push(i);
    if (end < total - 1) list.push('right-ellipsis');
    list.push(total);
    return list;
}

export function Pagination({ page, total, onChange, pageSize = 10, totalItems = null, className = '' }) {
    if (!total || total < 2) return null;
    const safePage = Math.min(Math.max(1, page), total);
    const pages = buildPageList(safePage, total);

    const go = (p) => {
        if (p < 1 || p > total || p === safePage) return;
        onChange(p);
    };

    return (
        <div className={`flex items-center justify-between gap-3 px-5 py-3 border-t border-line ${className}`}>
            <div className="text-[11px] text-content-subtle">
                {totalItems != null ? (
                    <>
                        Showing <span className="text-content font-medium tabular-nums">{Math.min((safePage - 1) * pageSize + 1, totalItems)}</span>
                        –<span className="text-content font-medium tabular-nums">{Math.min(safePage * pageSize, totalItems)}</span>
                        {' '}of <span className="text-content font-medium tabular-nums">{totalItems}</span>
                    </>
                ) : (
                    <>Page <span className="text-content font-medium tabular-nums">{safePage}</span> of <span className="text-content font-medium tabular-nums">{total}</span></>
                )}
            </div>
            <nav className="inline-flex items-center gap-1" aria-label="Pagination">
                <button
                    type="button"
                    onClick={() => go(safePage - 1)}
                    disabled={safePage === 1}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-line text-content hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>

                {pages.map((p, idx) => {
                    if (typeof p === 'string') {
                        return (
                            <span key={`${p}-${idx}`} className="inline-flex items-center justify-center w-8 h-8 text-content-subtle text-xs select-none">
                                ···
                            </span>
                        );
                    }
                    const active = p === safePage;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => go(p)}
                            aria-current={active ? 'page' : undefined}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-[12.5px] font-medium tabular-nums transition-colors ${
                                active
                                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-sm'
                                    : 'border border-line text-content hover:bg-surface-hover'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() => go(safePage + 1)}
                    disabled={safePage === total}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-line text-content hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </nav>
        </div>
    );
}

/* ---------- Tag ---------- */

export function Tag({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-surface-hover text-content rounded-md capitalize ${className}`}>
            {children}
        </span>
    );
}
