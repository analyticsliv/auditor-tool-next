'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    History, Search, ExternalLink, Building2, BarChart3,
    Calendar, RefreshCw, FileText, AlertCircle,
} from 'lucide-react';
import { AllAudit } from '../utils/allAudit';
import { Pagination } from '../Components/ui';

const ITEMS_PER_PAGE = 10;
const ORANGE = '#F97316';
const BLUE = '#1A73E8';

const PreviousAudit = () => {
    const [audits, setAudits] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        (async () => {
            setLoading(true);
            try {
                const data = await AllAudit();
                setAudits(data || []);
            } catch (error) {
                console.error('Failed to fetch audits:', error);
            }
            setLoading(false);
        })();
    }, []);

    const handleView = (id) => {
        window.open(`/previous-audit?id=${id}`, '_blank');
    };

    const filteredAudits = useMemo(() => {
        const q = search.toLowerCase();
        return audits
            .filter((a) =>
                a?.accountName?.toLowerCase().includes(q) ||
                a?.propertyName?.toLowerCase().includes(q)
            )
            .slice()
            .reverse();
    }, [audits, search]);

    const totalPages = Math.max(1, Math.ceil(filteredAudits.length / ITEMS_PER_PAGE));
    const paginatedAudits = filteredAudits.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [search]);

    return (
        <div className="relative w-full min-h-full bg-surface-muted overflow-hidden">
            <div className="relative z-10 mx-auto w-full max-w-[1200px] 3xl:max-w-[1400px] px-5 sm:px-8 lg:px-12 py-8 lg:py-10">

                {/* Breadcrumb header — matches /account */}
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                        <span className="block w-1 h-5 rounded-sm" style={{ backgroundColor: ORANGE }} />
                        <span className="text-[10.5px] uppercase tracking-[0.22em] font-bold text-content-subtle">
                            History · previous audits
                        </span>
                    </div>
                    {!loading && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-surface"
                             style={{ borderColor: 'rgb(var(--border))' }}>
                            <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BLUE }} />
                            <span className="text-[12px] font-bold text-content tabular-nums">
                                {filteredAudits.length} {filteredAudits.length === 1 ? 'audit' : 'audits'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title card */}
                <section className="rounded-2xl border-2 border-line bg-surface overflow-hidden shadow-[0_24px_60px_-28px_rgba(15,23,42,0.20)]">
                    {/* Top stripe */}
                    <div className="flex h-[3px]">
                        <div className="flex-[3]" style={{ backgroundColor: ORANGE }} />
                        <div className="flex-[2]" style={{ backgroundColor: BLUE }} />
                        <div className="flex-1" style={{ backgroundColor: '#0F172A' }} />
                    </div>

                    <div className="p-4 lg:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center text-white"
                                 style={{ backgroundColor: BLUE }}>
                                <History size={18} strokeWidth={2.4} />
                            </div>
                            <div>
                                <h1 className="text-[17px] lg:text-[20px] 2xl:text-[22px] font-bold text-content tracking-tight">
                                    All Audits
                                </h1>
                                <p className="text-[11.5px] lg:text-[12.5px] text-content-muted">
                                    Browse and re-open audits you have run previously.
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-[360px]">
                            <Search size={14} strokeWidth={2.4}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by account or property name"
                                className="w-full h-10 pl-9 pr-3 rounded-lg border-2 bg-surface text-[13px] placeholder:text-content-subtle focus:outline-none transition-all"
                                style={{ borderColor: 'rgb(var(--border))' }}
                                onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgb(var(--border))'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border-t-2 border-line">
                        <table className="min-w-full">
                            <thead className="bg-surface-muted/40 border-b-2 border-line">
                                <tr className="text-[9.5px] 2xl:text-[10.5px] uppercase tracking-[0.14em] text-content-subtle">
                                    <th className="px-3 2xl:px-5 py-2.5 2xl:py-3 text-left font-bold">Account</th>
                                    <th className="px-3 2xl:px-5 py-2.5 2xl:py-3 text-left font-bold">Property</th>
                                    <th className="px-3 2xl:px-5 py-2.5 2xl:py-3 text-left font-bold">Created</th>
                                    <th className="px-3 2xl:px-5 py-2.5 2xl:py-3 text-left font-bold">Updated</th>
                                    <th className="px-3 2xl:px-5 py-2.5 2xl:py-3 text-right font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4"><div className="h-3 2xl:h-3.5 skeleton-shimmer rounded w-3/4" /></td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4"><div className="h-3 2xl:h-3.5 skeleton-shimmer rounded w-2/3" /></td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4"><div className="h-3 2xl:h-3.5 skeleton-shimmer rounded w-1/2" /></td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4"><div className="h-3 2xl:h-3.5 skeleton-shimmer rounded w-1/2" /></td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4"><div className="h-7 2xl:h-8 skeleton-shimmer rounded w-20 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : paginatedAudits.length > 0 ? (
                                    paginatedAudits.map((audit) => (
                                        <tr key={audit?._id} className="text-[11.5px] 2xl:text-[13px] hover:bg-surface-muted/50 transition-colors">
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4 text-content">
                                                <span className="inline-flex items-center gap-1.5 2xl:gap-2">
                                                    <Building2 size={12} strokeWidth={2.4} style={{ color: BLUE }} className="shrink-0" />
                                                    <span className="font-semibold truncate">{audit?.accountName}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4 text-content">
                                                <span className="inline-flex items-center gap-1.5 2xl:gap-2">
                                                    <BarChart3 size={12} strokeWidth={2.4} style={{ color: ORANGE }} className="shrink-0" />
                                                    <span className="truncate">{audit?.propertyName}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4 text-content-muted tabular-nums whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar size={11} strokeWidth={2.4} className="text-content-subtle shrink-0" />
                                                    <FormattedDate value={audit?.createdAt} />
                                                </span>
                                            </td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4 text-content-muted tabular-nums whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <RefreshCw size={11} strokeWidth={2.4} className="text-content-subtle shrink-0" />
                                                    <FormattedDate value={audit?.updatedAt} />
                                                </span>
                                            </td>
                                            <td className="px-3 2xl:px-5 py-3 2xl:py-4 text-right">
                                                <button
                                                    onClick={() => handleView(audit?._id)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 2xl:px-3 py-1 2xl:py-1.5 rounded-md text-white text-[11px] 2xl:text-[12px] font-semibold transition-opacity hover:opacity-90"
                                                    style={{ backgroundColor: BLUE }}
                                                >
                                                    View
                                                    <ExternalLink size={11} strokeWidth={2.4} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                                     style={{ backgroundColor: `${ORANGE}1A`, color: ORANGE }}>
                                                    {search ? <AlertCircle size={20} strokeWidth={2.4} /> : <FileText size={20} strokeWidth={2.4} />}
                                                </div>
                                                <p className="text-[14px] font-bold text-content">
                                                    {search ? 'No matches' : 'No audits yet'}
                                                </p>
                                                <p className="text-[12.5px] text-content-muted mt-1 max-w-[320px]">
                                                    {search
                                                        ? 'Try a different account or property name.'
                                                        : 'Run your first audit from the home page to see it here.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination — shared component used by /dashboard */}
                    {!loading && totalPages > 1 && (
                        <Pagination
                            page={currentPage}
                            total={totalPages}
                            onChange={setCurrentPage}
                            pageSize={ITEMS_PER_PAGE}
                            totalItems={filteredAudits.length}
                        />
                    )}
                </section>
            </div>
        </div>
    );
};

export default PreviousAudit;

/* Compact-on-small / full-on-2xl date renderer. Below 2xl we show
   `DD MMM YY · HH:mm` so the cell stays on a single line; from 2xl up we
   show the full locale string. Two spans + responsive `hidden` toggles
   means no JS resize listener. */
function FormattedDate({ value }) {
    if (!value) return null;
    const d = new Date(value);
    const compact = d.toLocaleString(undefined, {
        day: '2-digit', month: 'short', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
    const full = d.toLocaleString();
    return (
        <>
            <span className="2xl:hidden">{compact}</span>
            <span className="hidden 2xl:inline">{full}</span>
        </>
    );
}
