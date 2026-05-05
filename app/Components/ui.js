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
        'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:text-gray-100 shadow-sm hover:shadow-md',
    secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200',
    danger:
        'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 disabled:bg-gray-100 disabled:text-gray-400',
    dangerSolid:
        'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 shadow-sm',
    ghost:
        'text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
    ghostAccent:
        'text-purple-600 hover:bg-purple-50 disabled:text-gray-400',
    ghostRed:
        'text-red-600 hover:bg-red-50 disabled:text-gray-400',
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
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    active:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
    expired:  { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400' },
    revoked:  { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
    rejected: { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
    suspended:{ bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
};

export function StatusPill({ status, className = '' }) {
    if (!status) return null;
    const tone = STATUS_TONES[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
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
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
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
        <div className="w-full bg-gray-100 rounded-full overflow-hidden" style={{ height }}>
            <div className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out rounded-full`} style={{ width: `${pct}%` }} />
        </div>
    );
}

/* ---------- Stat callout ---------- */

export function Stat({ label, value, sub, accent, icon: Icon, tone = 'neutral' }) {
    const valueColor =
        tone === 'warn' ? 'text-amber-600' :
        tone === 'danger' ? 'text-rose-600' :
        tone === 'accent' ? 'text-purple-600' :
        'text-gray-900';
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
            <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-bold tabular-nums tracking-tight ${valueColor}`}>{value}</span>
                {accent != null && <span className="text-sm text-gray-400 tabular-nums">/ {accent}</span>}
            </div>
            {sub && <div className="text-xs text-gray-500 mt-1.5">{sub}</div>}
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
                className={`relative w-full ${maxWidth} bg-white border border-gray-200 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden`}
                style={{ animation: 'ui-modalIn 220ms cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
                {title && (
                    <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-colors" aria-label="Close">
                            <X size={16} strokeWidth={2} />
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
                {footer && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">{footer}</div>
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-100">
                    <Icon size={22} strokeWidth={1.75} className="text-purple-600" />
                </div>
            )}
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
            {description && <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">{description}</p>}
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
                        <div className="text-[11px] uppercase tracking-[0.14em] text-purple-600 font-semibold mb-2">{eyebrow}</div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
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
        <div className="relative border-b border-gray-200 mb-6">
            <div ref={railRef} className="flex gap-6 relative">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = value === t.value;
                    return (
                        <button
                            key={t.value}
                            data-tab={t.value}
                            onClick={() => onChange(t.value)}
                            className={`pb-3 pt-1 inline-flex items-center gap-2 text-sm transition-colors ${active ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800 font-medium'}`}
                        >
                            {Icon && <Icon size={15} strokeWidth={1.75} />}
                            <span className="capitalize">{t.label}</span>
                            {typeof t.count === 'number' && (
                                <span className={`text-[10.5px] tabular-nums px-1.5 py-px rounded-full font-medium ${active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
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
        <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">{children}</tr>
        </thead>
    );
}

export function Th({ children, align = 'left', className = '' }) {
    const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <th className={`px-5 py-3 ${alignCls} text-[11px] font-semibold uppercase tracking-wider text-gray-500 ${className}`}>
            {children}
        </th>
    );
}

export function TBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function Tr({ children, className = '', muted = false }) {
    return (
        <tr className={`border-b border-gray-100 last:border-0 transition-colors ${muted ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-gray-50'} ${className}`}>
            {children}
        </tr>
    );
}

export function Td({ children, align = 'left', nowrap = false, className = '' }) {
    const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <td className={`px-5 py-3.5 ${alignCls} ${nowrap ? 'whitespace-nowrap' : ''} ${className}`}>
            {children}
        </td>
    );
}

/* ---------- Skeleton loaders ---------- */

export function Skeleton({ width = '100%', height = 12, className = '' }) {
    return (
        <span
            className={`inline-block rounded ${className}`}
            style={{
                width, height,
                background: 'linear-gradient(90deg, #F1F5F9 0%, #F8FAFC 50%, #F1F5F9 100%)',
                backgroundSize: '200% 100%',
                animation: 'ui-shimmer 1.4s ease-in-out infinite',
            }}
        />
    );
}

export function SkeletonRow({ cols = 5 }) {
    return (
        <tr className="border-b border-gray-100 last:border-0">
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
            <style jsx global>{`
                @keyframes ui-shimmer {
                    0% { background-position: 200% 0 }
                    100% { background-position: -200% 0 }
                }
            `}</style>
        </div>
    );
}

export function SkeletonStats({ count = 4 }) {
    return (
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <Skeleton width="40%" height={9} className="mb-3" />
                    <Skeleton width="55%" height={28} />
                </div>
            ))}
            <style jsx global>{`
                @keyframes ui-shimmer {
                    0% { background-position: 200% 0 }
                    100% { background-position: -200% 0 }
                }
            `}</style>
        </div>
    );
}

/* ---------- Toast ---------- */

export function Toast({ toast, onClose }) {
    if (!toast) return null;
    const tone =
        toast.kind === 'error' ? { bar: 'bg-rose-500', icon: 'text-rose-500' } :
        toast.kind === 'success' ? { bar: 'bg-emerald-500', icon: 'text-emerald-500' } :
        { bar: 'bg-purple-500', icon: 'text-purple-500' };
    return (
        <div className="fixed bottom-6 right-6 z-[60]" style={{ animation: 'ui-toastIn 220ms ease-out' }}>
            <div className="bg-white border border-gray-200 rounded-xl pl-4 pr-3 py-3 flex items-center gap-3 max-w-sm shadow-lg">
                <span className={`w-1 h-7 rounded-full flex-shrink-0 ${tone.bar}`} />
                <span className="text-sm text-gray-800">{toast.message}</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-0.5" aria-label="Dismiss">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
        </div>
    );
}

export function Input(props) {
    return (
        <input
            {...props}
            className={`w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors ${props.className || ''}`}
        />
    );
}

export function Select(props) {
    return (
        <select
            {...props}
            className={`w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors ${props.className || ''}`}
        />
    );
}

/* ---------- Tag ---------- */

export function Tag({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700 rounded-md capitalize ${className}`}>
            {children}
        </span>
    );
}
