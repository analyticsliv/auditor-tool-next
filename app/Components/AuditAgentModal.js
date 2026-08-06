"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccountStore } from "../store/useAccountStore";
import { useAuditAgent, ALLOWED_ACCOUNT } from "../utils/useAuditAgent";
import {
    Bot, X, Send, Sparkles, AlertCircle, CheckCircle2, XCircle,
    ChevronDown, Search, Building2, BarChart3, Wrench, Maximize2, Minimize2,
    Wand2, ListChecks, ShieldAlert, ArrowRight, Square, CheckSquare, Info, Loader2,
} from "lucide-react";

const ORANGE = "#F97316";
const BLUE = "#1A73E8";
const SLATE = "#0F172A";
const GREEN = "#16A34A";
const RED = "#DC2626";
const AMBER = "#D97706";

/* ------------------------------------------------------------------ *
 * 1. PARSER
 * ------------------------------------------------------------------ */
const KNOWN_TYPES = new Set(["audit_result", "fix_result", "chat", "progress"]);

function parseAgentPayload(message) {
    if (!message) return null;
    const preParsed = message.data || message.payload || message.json;
    if (preParsed && typeof preParsed === "object" && KNOWN_TYPES.has(preParsed.type)) return preParsed;
    const raw = typeof message.text === "string" ? message.text.trim() : "";
    if (!raw.startsWith("{") && !raw.startsWith("[")) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && KNOWN_TYPES.has(parsed.type)) return parsed;
    } catch { /* not JSON */ }
    return null;
}

function renderRichText(text) {
    if (typeof text !== "string") return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} className="font-semibold text-content">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
    );
}

/* ------------------------------------------------------------------ *
 * Shared: a selectable auto-fixable row (checkbox)
 * ------------------------------------------------------------------ */
const SelectableRow = ({ title, currentValue, recommendedValue, detail, checked, disabled, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`w-full flex items-start gap-2.5 rounded-lg border-2 px-2.5 2xl:px-3 py-2 text-left transition-all ${
            checked ? "bg-surface-muted/60" : "bg-surface"
        } ${disabled ? "cursor-default opacity-80" : "hover:border-line"}`}
        style={{ borderColor: checked ? BLUE : "rgb(var(--border))" }}
    >
        <span className="mt-0.5 shrink-0" style={{ color: checked ? BLUE : "rgb(var(--content-subtle))" }}>
            {checked ? <CheckSquare className="w-4 h-4" strokeWidth={2.2} /> : <Square className="w-4 h-4" strokeWidth={2.2} />}
        </span>
        <span className="min-w-0 flex-1">
            <span className="block text-[12px] 2xl:text-[13px] font-semibold text-content">{title}</span>
            {(currentValue || recommendedValue) ? (
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] 2xl:text-[12px] flex-wrap">
                    {currentValue && <span className="text-content-subtle line-through">{currentValue}</span>}
                    <ArrowRight className="w-3 h-3 shrink-0" style={{ color: GREEN }} />
                    <span className="font-semibold" style={{ color: GREEN }}>{recommendedValue}</span>
                </span>
            ) : detail ? (
                <span className="mt-0.5 block text-[11px] 2xl:text-[12px] text-content-muted leading-relaxed">{detail}</span>
            ) : null}
        </span>
    </button>
);

/* ------------------------------------------------------------------ *
 * 2. LOADING BUBBLE
 * ------------------------------------------------------------------ */
const LoadingBubble = ({ label = "Working…" }) => (
    <div className="flex justify-start">
        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2.5 2xl:py-3 max-w-[90%] shadow-sm">
            <div className="flex items-center gap-2.5 2xl:gap-3">
                <div className="relative w-6 h-6 2xl:w-7 2xl:h-7 shrink-0">
                    <span className="absolute inset-0 rounded-md animate-ping opacity-40" style={{ backgroundColor: BLUE }} />
                    <div className="relative w-full h-full rounded-md flex items-center justify-center text-white" style={{ backgroundColor: BLUE }}>
                        <Wrench className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-white animate-pulse" style={{ backgroundColor: ORANGE }}>
                        <Sparkles className="w-1.5 h-1.5" strokeWidth={2.6} />
                    </span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[12px] 2xl:text-[13px] font-semibold text-content">{label}</span>
                    <div className="flex items-center gap-1">
                        {[0, 1, 2].map((d) => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: BLUE, animationDelay: `${d * 0.15}s` }} />
                        ))}
                        <span className="ml-2 block h-2 w-24 2xl:w-36 rounded skeleton-shimmer" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ------------------------------------------------------------------ *
 * 3. AUDIT RESULT CARD — Pending vs Fixed
 * ------------------------------------------------------------------ */
const AuditResultCard = ({ payload, fixedIssues, active, busy, onSubmit }) => {
    const autoFixable = payload.auto_fixable || [];
    const manual = payload.manual_required || [];

    const isFixed = (item) => !!fixedIssues && fixedIssues.has(item.issue);
    const pendingItems = autoFixable.filter((i) => !isFixed(i));
    const fixedItems = autoFixable.filter((i) => isFixed(i));
    const pendingIds = pendingItems.map((i) => i.id);
    const pendingSig = pendingIds.join(",");

    const [selected, setSelected] = useState(() => new Set(pendingIds));
    useEffect(() => {
        setSelected(new Set(pendingSig ? pendingSig.split(",").map(Number) : []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSig]);

    const interactive = active && !busy;
    const toggle = (id) => {
        if (!interactive) return;
        setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const allSelected = pendingItems.length > 0 && selected.size === pendingItems.length;
    const toggleAll = () => { if (!interactive) return; setSelected(allSelected ? new Set() : new Set(pendingIds)); };
    const submitSelected = () => {
        if (!interactive || selected.size === 0) return;
        onSubmit([...selected].sort((a, b) => a - b).join(","), selected.size);
    };
    const allDone = autoFixable.length > 0 && pendingItems.length === 0;

    return (
        <div className="flex justify-start">
            <div className="w-full max-w-[95%] 2xl:max-w-[90%] bg-surface border-2 border-line rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-3 2xl:px-4 py-2.5 2xl:py-3 border-b-2 border-line">
                    <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: allDone ? GREEN : BLUE }}>
                        <ListChecks className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] 2xl:text-[14px] font-bold text-content leading-tight">Audit complete</p>
                        <p className="text-[10px] 2xl:text-[11.5px] text-content-subtle">
                            {fixedItems.length > 0
                                ? `${fixedItems.length} fixed · ${pendingItems.length} pending · ${manual.length} manual`
                                : `${autoFixable.length} auto-fixable · ${manual.length} need manual action`}
                        </p>
                    </div>
                </div>

                {pendingItems.length > 0 && (
                    <div className="px-3 2xl:px-4 py-2.5 2xl:py-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE }}>
                                {fixedItems.length > 0 ? `Pending (${pendingItems.length})` : "Auto-fixable"}
                            </span>
                            {interactive && (
                                <button onClick={toggleAll} className="text-[10px] 2xl:text-[11.5px] font-semibold hover:underline" style={{ color: BLUE }}>
                                    {allSelected ? "Clear all" : "Select all"}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1.5 2xl:space-y-2">
                            {pendingItems.map((item) => (
                                <SelectableRow
                                    key={item.id}
                                    title={item.issue}
                                    currentValue={item.current_value}
                                    recommendedValue={item.recommended_value}
                                    checked={selected.has(item.id)}
                                    disabled={!interactive}
                                    onToggle={() => toggle(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {fixedItems.length > 0 && (
                    <div className={`px-3 2xl:px-4 pb-2.5 2xl:pb-3 ${pendingItems.length > 0 ? "" : "pt-2.5 2xl:pt-3"}`}>
                        <span className="block mb-2 text-[9.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: GREEN }}>
                            Fixed ({fixedItems.length})
                        </span>
                        <div className="space-y-1.5 2xl:space-y-2">
                            {fixedItems.map((item) => (
                                <div key={item.id} className="w-full flex items-start gap-2.5 rounded-lg border-2 px-2.5 2xl:px-3 py-2" style={{ borderColor: `${GREEN}40`, backgroundColor: `${GREEN}0F` }}>
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} strokeWidth={2.3} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[12px] 2xl:text-[13px] font-semibold text-content">{item.issue}</span>
                                        <span className="mt-0.5 block text-[11px] 2xl:text-[12px] font-semibold" style={{ color: GREEN }}>
                                            {item.recommended_value ? `Now: ${item.recommended_value}` : "Applied"}
                                        </span>
                                    </span>
                                    <span className="shrink-0 self-center text-[9px] 2xl:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: GREEN, backgroundColor: `${GREEN}1F` }}>Done</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {manual.length > 0 && (
                    <div className="px-3 2xl:px-4 pb-2.5 2xl:pb-3">
                        <span className="block mb-2 text-[9.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: AMBER }}>Manual action required</span>
                        <div className="space-y-1.5 2xl:space-y-2">
                            {manual.map((item) => (
                                <div key={item.id} className="rounded-lg border-2 px-2.5 2xl:px-3 py-2" style={{ borderColor: `${AMBER}40`, backgroundColor: `${AMBER}0F` }}>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: AMBER }} strokeWidth={2.3} />
                                        <span className="text-[12px] 2xl:text-[13px] font-semibold text-content">{item.issue}</span>
                                    </div>
                                    <p className="mt-1 text-[11px] 2xl:text-[12px] text-content-muted leading-relaxed">{item.steps}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-3 2xl:px-4 py-2.5 2xl:py-3 border-t-2 border-line bg-surface-muted/40">
                    {allDone ? (
                        <p className="text-[11px] 2xl:text-[12.5px] font-semibold inline-flex items-center gap-1.5" style={{ color: GREEN }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> All auto-fixable issues fixed
                        </p>
                    ) : active ? (
                        <div className="flex items-center gap-2">
                            <button onClick={submitSelected} disabled={selected.size === 0 || busy}
                                className="flex-1 h-8 2xl:h-9 rounded-lg font-bold text-[11.5px] 2xl:text-[13px] text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                                style={{ backgroundColor: BLUE }}>
                                <Wand2 className="w-3.5 h-3.5" strokeWidth={2.3} />
                                {selected.size === 0 ? "Select issues to fix" : `Fix ${selected.size} selected`}
                            </button>
                            <button onClick={() => onSubmit("none", 0)} disabled={busy}
                                className="px-3 h-8 2xl:h-9 rounded-lg font-bold text-[11.5px] 2xl:text-[13px] border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}>Skip</button>
                        </div>
                    ) : (
                        <p className="text-[11px] 2xl:text-[12.5px] text-content-subtle inline-flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            {pendingItems.length > 0 ? `${pendingItems.length} still pending — reconnect to fix.` : "This audit is no longer active."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ *
 * 4. FIX RESULT CARD — auto-fixable (fixed/failed/pending-selectable) + manual
 *
 * `autoFixableItems` is the latest audit's auto_fixable array; we use it both
 * to split the backend's mixed pending_manual bucket AND to resolve each
 * still-pending issue back to its numeric id so it can be re-fixed from here.
 * ------------------------------------------------------------------ */
const FixResultCard = ({ payload, autoFixableItems = [], active, busy, onSubmit }) => {
    const fixed = payload.fixed || [];
    const failed = payload.failed || [];
    const pendingRaw = payload.pending_manual || [];

    const idByIssue = useMemo(() => new Map(autoFixableItems.map((i) => [i.issue, i.id])), [autoFixableItems]);
    const itemByIssue = useMemo(() => new Map(autoFixableItems.map((i) => [i.issue, i])), [autoFixableItems]);
    const autoNames = useMemo(() => new Set(autoFixableItems.map((i) => i.issue)), [autoFixableItems]);
    const fixedNames = new Set(fixed.map((i) => i.issue));
    const failedNames = new Set(failed.map((i) => i.issue));

    const stillFixable = pendingRaw.filter((i) => autoNames.has(i.issue) && !fixedNames.has(i.issue) && !failedNames.has(i.issue));
    const trulyManual = pendingRaw.filter((i) => !autoNames.has(i.issue) && !fixedNames.has(i.issue));

    // ids we can actually submit (resolved from the audit)
    const fixableIds = stillFixable.map((i) => idByIssue.get(i.issue)).filter((v) => v != null);
    const fixableSig = fixableIds.join(",");

    const [selected, setSelected] = useState(() => new Set(fixableIds));
    useEffect(() => {
        setSelected(new Set(fixableSig ? fixableSig.split(",").map(Number) : []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fixableSig]);

    const interactive = active && !busy && fixableIds.length > 0;
    const toggle = (id) => {
        if (!interactive) return;
        setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const allSel = fixableIds.length > 0 && selected.size === fixableIds.length;
    const toggleAll = () => { if (!interactive) return; setSelected(allSel ? new Set() : new Set(fixableIds)); };
    const submitSelected = () => {
        if (!interactive || selected.size === 0) return;
        onSubmit([...selected].sort((a, b) => a - b).join(","), selected.size);
    };

    const fixedCount = payload.total_fixed ?? fixed.length;
    const pendingCount = stillFixable.length + failed.length;
    const manualCount = trulyManual.length;

    const Row = ({ icon, color, title, detail }) => (
        <div className="flex items-start gap-2 rounded-lg border-2 px-2.5 2xl:px-3 py-2" style={{ borderColor: `${color}40`, backgroundColor: `${color}0F` }}>
            <span className="mt-0.5 shrink-0" style={{ color }}>{icon}</span>
            <div className="min-w-0">
                <span className="block text-[12px] 2xl:text-[13px] font-semibold text-content">{title}</span>
                {detail && <span className="block mt-0.5 text-[11px] 2xl:text-[12px] text-content-muted leading-relaxed">{detail}</span>}
            </div>
        </div>
    );

    return (
        <div className="flex justify-start">
            <div className="w-full max-w-[95%] 2xl:max-w-[90%] bg-surface border-2 border-line rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-3 2xl:px-4 py-2.5 2xl:py-3 border-b-2 border-line">
                    <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: GREEN }}>
                        <CheckCircle2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] 2xl:text-[14px] font-bold text-content leading-tight">Fixes applied</p>
                        <p className="text-[10px] 2xl:text-[11.5px] text-content-subtle">
                            {fixedCount} fixed · {pendingCount} pending · {manualCount} manual
                        </p>
                    </div>
                </div>

                <div className="px-3 2xl:px-4 py-2.5 2xl:py-3 space-y-3">
                    {/* AUTO-FIXABLE region */}
                    {(fixed.length > 0 || failed.length > 0 || stillFixable.length > 0) && (
                        <div className="space-y-1.5 2xl:space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE }}>
                                    Auto-fixable · {fixedCount} fixed · {pendingCount} pending
                                </span>
                                {interactive && (
                                    <button onClick={toggleAll} className="text-[10px] 2xl:text-[11.5px] font-semibold hover:underline" style={{ color: BLUE }}>
                                        {allSel ? "Clear all" : "Select all"}
                                    </button>
                                )}
                            </div>

                            {fixed.map((item) => (
                                <Row key={`f-${item.id}`} color={GREEN} icon={<CheckCircle2 className="w-4 h-4" strokeWidth={2.2} />} title={item.issue} detail={item.message} />
                            ))}
                            {failed.map((item) => (
                                <Row key={`x-${item.id}`} color={RED} icon={<XCircle className="w-4 h-4" strokeWidth={2.2} />} title={item.issue} detail={item.message || "Failed to apply."} />
                            ))}

                            {/* still-pending auto-fixable — selectable if we resolved an id */}
                            {stillFixable.map((item, idx) => {
                                const id = idByIssue.get(item.issue);
                                const auditItem = itemByIssue.get(item.issue);
                                if (id == null) {
                                    return <Row key={`s-${idx}`} color={BLUE} icon={<Wand2 className="w-4 h-4" strokeWidth={2.2} />} title={item.issue} detail={item.steps} />;
                                }
                                return (
                                    <SelectableRow
                                        key={`s-${id}`}
                                        title={item.issue}
                                        currentValue={auditItem?.current_value}
                                        recommendedValue={auditItem?.recommended_value}
                                        detail={item.steps}
                                        checked={selected.has(id)}
                                        disabled={!interactive}
                                        onToggle={() => toggle(id)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* MANUAL region */}
                    {trulyManual.length > 0 && (
                        <div className="space-y-1.5 2xl:space-y-2">
                            <span className="block text-[9.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: AMBER }}>
                                Manual action required · {manualCount}
                            </span>
                            {trulyManual.map((item, idx) => (
                                <Row key={`m-${idx}`} color={AMBER} icon={<ShieldAlert className="w-4 h-4" strokeWidth={2.2} />} title={item.issue} detail={item.steps} />
                            ))}
                        </div>
                    )}
                </div>

                {/* action bar — fix directly from here */}
                {active && fixableIds.length > 0 && (
                    <div className="px-3 2xl:px-4 py-2.5 2xl:py-3 border-t-2 border-line bg-surface-muted/40 flex items-center gap-2">
                        <button onClick={submitSelected} disabled={selected.size === 0 || busy}
                            className="flex-1 h-8 2xl:h-9 rounded-lg font-bold text-[11.5px] 2xl:text-[13px] text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{ backgroundColor: BLUE }}>
                            <Wand2 className="w-3.5 h-3.5" strokeWidth={2.3} />
                            {selected.size === 0 ? "Select issues to fix" : `Fix ${selected.size} selected`}
                        </button>
                        <button onClick={() => onSubmit("none", 0)} disabled={busy}
                            className="px-3 h-8 2xl:h-9 rounded-lg font-bold text-[11.5px] 2xl:text-[13px] border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}>Skip</button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ *
 * 5. CHAT CARD
 * ------------------------------------------------------------------ */
const ChatCard = ({ payload }) => (
    <div className="flex justify-start">
        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 max-w-[90%] 2xl:max-w-[85%] shadow-sm">
            <div className="flex items-start gap-2 2xl:gap-2.5">
                <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: BLUE }}>
                    <Bot className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                </div>
                <div className="text-[12px] 2xl:text-[13.5px] leading-relaxed text-content whitespace-pre-wrap flex-1 min-w-0">
                    {renderRichText(payload.message)}
                </div>
            </div>
        </div>
    </div>
);

/* ------------------------------------------------------------------ *
 * MAIN MODAL
 * ------------------------------------------------------------------ */
const AuditAgentModal = ({ isOpen, onClose }) => {
    const { status, messages, awaitingYesNo, connect, sendMessage, disconnect } = useAuditAgent();

    const [inputMessage, setInputMessage] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [properties, setProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [accountsError, setAccountsError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [awaitingResponse, setAwaitingResponse] = useState(false);
    const [loadingLabel, setLoadingLabel] = useState("Working…");

    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    const accounts = useAccountStore((s) => s.accounts);
    const visibleAccounts = (accounts || []).filter((a) => a?.account === ALLOWED_ACCOUNT);
    const hasFetchedAccounts = useAccountStore((s) => s.hasFetchedAccounts);
    const fetchPropertySummaries = useAccountStore((s) => s.fetchPropertySummaries);
    const ensureAccountsFetched = useAccountStore((s) => s.ensureAccountsFetched);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, awaitingResponse]);

    useEffect(() => {
        if (!isOpen || hasFetchedAccounts) return;
        setLoadingAccounts(true);
        setAccountsError(null);
        ensureAccountsFetched()
            .then((res) => { if (!res.ok) setAccountsError("Couldn't load your GA4 accounts. Try again."); })
            .finally(() => setLoadingAccounts(false));
    }, [isOpen, hasFetchedAccounts, ensureAccountsFetched]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const last = messages[messages.length - 1];
        if (last && last.role !== "user" && last.role !== "system") setAwaitingResponse(false);
    }, [messages]);

    // Latest non-empty audit is the interactive one.
    const lastAuditId = useMemo(() => {
        let id = null;
        for (const m of messages) {
            const p = parseAgentPayload(m);
            if (p?.type === "audit_result") {
                const hasItems = (p.auto_fixable?.length || 0) > 0 || (p.manual_required?.length || 0) > 0;
                if (hasItems) id = m.id;
            }
        }
        return id;
    }, [messages]);

    // Latest non-empty fix_result — the one that stays interactive.
    const lastFixResultId = useMemo(() => {
        let id = null;
        for (const m of messages) {
            const p = parseAgentPayload(m);
            if (p?.type === "fix_result") {
                const has = (p.fixed?.length || 0) + (p.failed?.length || 0) + (p.pending_manual?.length || 0);
                if (has > 0) id = m.id;
            }
        }
        return id;
    }, [messages]);

    // Latest audit's auto_fixable array — used to split fix_result buckets and
    // to resolve pending issue-names back to numeric ids.
    const autoFixableItems = useMemo(() => {
        if (!lastAuditId) return [];
        for (const m of messages) {
            if (m.id !== lastAuditId) continue;
            const p = parseAgentPayload(m);
            return p?.auto_fixable || [];
        }
        return [];
    }, [messages, lastAuditId]);

    // Issue-names fixed by any fix_result after the latest audit.
    const fixedForLatestAudit = useMemo(() => {
        const set = new Set();
        if (!lastAuditId) return set;
        let after = false;
        for (const m of messages) {
            if (m.id === lastAuditId) { after = true; continue; }
            if (!after) continue;
            const p = parseAgentPayload(m);
            if (p?.type === "fix_result") (p.fixed || []).forEach((f) => { if (f?.issue) set.add(f.issue); });
        }
        return set;
    }, [messages, lastAuditId]);

    const handleAccountSelect = async (account) => {
        setSelectedAccount(account);
        setSelectedProperty(null);
        setDropdownOpen(false);
        setLoadingProperties(true);
        try {
            const props = await fetchPropertySummaries(account?.account);
            setProperties(props || []);
        } finally {
            setLoadingProperties(false);
        }
    };

    const handlePropertySelect = (e) => {
        const name = e.target.value;
        setSelectedProperty(name ? properties.find((p) => p.name === name) : null);
    };

    const propertyId = selectedProperty?.name?.split("/")[1];
    const isBusy = status === "connecting" || status === "connected";
    const connected = status === "connected";

    const statusPill =
        status === "connected" ? { text: "Live", color: GREEN }
        : status === "connecting" ? { text: "Connecting…", color: BLUE }
        : status === "error" ? { text: "Error", color: RED }
        : { text: "Disconnected", color: "rgb(var(--content-subtle))" };

    const send = (text, label = "Thinking…") => {
        setLoadingLabel(label);
        setAwaitingResponse(true);
        sendMessage(text);
    };

    const handleStart = () => {
        if (!propertyId || isBusy) return;
        setLoadingLabel("Scanning your GA4 configuration…");
        setAwaitingResponse(true);
        connect(propertyId);
    };

    const handleSend = () => {
        if (!inputMessage.trim() || !connected) return;
        send(inputMessage, "Thinking…");
        setInputMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClose = () => {
        if (isBusy) disconnect();
        setIsFullscreen(false);
        setAwaitingResponse(false);
        onClose();
    };

    const lastIsProgress = parseAgentPayload(messages[messages.length - 1])?.type === "progress";
    const showLoading = !lastIsProgress && (status === "connecting" || awaitingResponse || (connected && messages.length === 0));

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex bg-black/55 backdrop-blur-sm ${isFullscreen ? "" : "items-center justify-center p-2 2xl:p-4"}`}>
            <div className={`bg-surface shadow-2xl flex flex-col overflow-hidden border-2 border-line ${isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[90vh] rounded-2xl 2xl:rounded-3xl"}`}>

                {/* ============== HEADER ============== */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ backgroundColor: SLATE }}>
                    <div aria-hidden className="absolute top-0 left-0 w-1 2xl:w-1.5 h-full" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute top-0 left-0 h-1 2xl:h-1.5 w-16 2xl:w-24" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 w-1 2xl:w-1.5 h-9 2xl:h-12" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 h-1 2xl:h-1.5 w-16 2xl:w-24" style={{ backgroundColor: ORANGE }} />
                    <div className="relative px-3.5 py-3 2xl:px-6 2xl:py-5 flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 2xl:gap-3 min-w-0">
                            <div className="w-9 h-9 2xl:w-12 2xl:h-12 rounded-lg 2xl:rounded-xl flex items-center justify-center text-white shadow-md shrink-0" style={{ backgroundColor: BLUE }}>
                                <Wrench className="w-4 h-4 2xl:w-[22px] 2xl:h-[22px]" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 2xl:gap-2 flex-wrap">
                                    <h2 className="text-sm 2xl:text-xl font-bold text-white tracking-tight">GA4 Auto-fix AI Agent</h2>
                                    <span className="inline-flex items-center gap-1 2xl:gap-1.5 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                        style={{ borderColor: `${statusPill.color}66`, backgroundColor: `${statusPill.color}1F`, color: statusPill.color }}>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusPill.color }} />
                                        {statusPill.text}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[10px] 2xl:text-[12.5px] mt-0.5 truncate">
                                    {selectedProperty ? <>Auditing: <span className="text-white font-semibold">{selectedProperty.displayName}</span></> : "Select an account & property to start"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 2xl:gap-1 shrink-0">
                            <button onClick={() => setIsFullscreen((f) => !f)} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />}
                            </button>
                            <button onClick={handleClose} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors" aria-label="Close audit agent">
                                <X className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ============== ACCOUNT / PROPERTY BAR ============== */}
                <div className="bg-surface-muted/40 px-3 py-3 2xl:px-5 2xl:py-4 border-b-2 border-line flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2 2xl:gap-3">
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <label className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1 2xl:mb-1.5 block">Account</label>
                            {loadingAccounts ? (
                                <div className="w-full h-8 2xl:h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3">
                                    <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                </div>
                            ) : accountsError ? (
                                <div className="w-full rounded-lg border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-2 2xl:p-2.5 text-[11px] 2xl:text-[12px] text-red-700 dark:text-red-300">{accountsError}</div>
                            ) : (
                                <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} disabled={isBusy}
                                    className="w-full flex items-center justify-between gap-2 px-3 h-8 2xl:h-10 rounded-lg border-2 bg-surface text-[12px] 2xl:text-[13px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ borderColor: "rgb(var(--border))" }}>
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Building2 className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] shrink-0" style={selectedAccount ? { color: BLUE } : { color: "rgb(var(--content-subtle))" }} />
                                        <span className={`truncate ${selectedAccount ? "font-semibold text-content" : "text-content-subtle"}`}>{selectedAccount?.displayName || "Select account"}</span>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-content-muted shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                            )}
                            {dropdownOpen && !loadingAccounts && !accountsError && visibleAccounts.length > 0 && (
                                <div className="absolute z-30 mt-1.5 w-full rounded-xl border-2 border-line bg-surface-elevated shadow-xl overflow-hidden">
                                    <div className="p-1.5 2xl:p-2 border-b-2 border-line">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] absolute left-2.5 top-1/2 -translate-y-1/2 text-content-subtle" />
                                            <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-8 2xl:pl-9 pr-3 h-8 2xl:h-9 rounded-md text-[12px] 2xl:text-[13px] bg-surface-muted border-2 border-line focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {visibleAccounts.filter((acc) => acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase())).map((account) => (
                                            <button type="button" key={account?.account} onClick={() => handleAccountSelect(account)}
                                                className="w-full text-left px-2.5 2xl:px-3 py-2 2xl:py-2.5 text-[12px] 2xl:text-[13px] flex items-center gap-2.5 hover:bg-surface-hover transition-colors">
                                                <span className="truncate flex-1">{account?.displayName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1 2xl:mb-1.5 block">Property</label>
                            <div className="relative">
                                {loadingProperties ? (
                                    <div className="w-full h-8 2xl:h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3">
                                        <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                    </div>
                                ) : (
                                    <>
                                        <select onChange={handlePropertySelect} disabled={!selectedAccount || isBusy} value={selectedProperty?.name || ""}
                                            className="w-full appearance-none rounded-lg border-2 bg-surface h-8 2xl:h-10 pl-8 2xl:pl-9 pr-8 2xl:pr-9 text-[12px] 2xl:text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ borderColor: "rgb(var(--border))" }}>
                                            <option value="">{!selectedAccount ? "Select account first" : "Select property"}</option>
                                            {properties?.map((property) => (<option key={property?.name} value={property?.name}>{property?.displayName}</option>))}
                                        </select>
                                        <BarChart3 className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] pointer-events-none absolute left-2.5 2xl:left-3 top-1/2 -translate-y-1/2" style={selectedProperty ? { color: BLUE } : { color: "rgb(var(--content-subtle))" }} />
                                        <ChevronDown className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 pointer-events-none absolute right-2.5 2xl:right-3 top-1/2 -translate-y-1/2 text-content-muted" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============== MESSAGES ============== */}
                <div className="flex-1 overflow-y-auto p-3 2xl:p-6 space-y-2.5 2xl:space-y-4 bg-surface-muted">
                    {messages.length === 0 && !showLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-14 h-14 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl flex items-center justify-center mb-3 2xl:mb-5 shadow-lg" style={{ backgroundColor: BLUE }}>
                                <Wrench className="w-6 h-6 2xl:w-8 2xl:h-8 text-white" strokeWidth={2.2} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 2xl:w-6 2xl:h-6 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: ORANGE }}>
                                    <Sparkles className="w-2.5 h-2.5 2xl:w-3 2xl:h-3" strokeWidth={2.5} />
                                </span>
                            </div>
                            <h3 className="text-base 2xl:text-xl font-bold text-content mb-1.5 2xl:mb-2 tracking-tight">Run an automated GA4 audit</h3>
                            <p className="text-content-muted text-[12px] 2xl:text-[13.5px] max-w-md leading-relaxed px-2">
                                {selectedProperty ? "Click Start Audit below. The agent will check your configuration and ask before applying any fix." : "Select an account and property above, then start the audit."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => {
                                if (message.role === "user") {
                                    return (
                                        <div key={message.id} className="flex justify-end">
                                            <div className="rounded-2xl rounded-tr-sm px-3 2xl:px-4 py-2 2xl:py-2.5 max-w-[85%] 2xl:max-w-[80%] shadow-md text-white" style={{ backgroundColor: ORANGE }}>
                                                <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (message.role === "system") {
                                    // The "starting the audit" connect notice is transient — show it
                                    // only while it's the last message (still configuring), then hide
                                    // once a result arrives. Errors / "session ended" always show.
                                    const isStartingNotice = /starting the audit/i.test(message.text || "");
                                    const isLast = message.id === messages[messages.length - 1]?.id;
                                    if (isStartingNotice && !isLast) return null;
                                    return (
                                        <div key={message.id} className="flex justify-center">
                                            <span className="text-[10px] 2xl:text-[11.5px] text-content-subtle italic">{message.text}</span>
                                        </div>
                                    );
                                }

                                const payload = parseAgentPayload(message);

                                if (payload?.type === "progress") {
                                    // Progress is a transient loader: show it (big) only while it's
                                    // the last message; hide it as soon as a real result arrives.
                                    const isLast = message.id === messages[messages.length - 1]?.id;
                                    if (!isLast) return null;
                                    return <LoadingBubble key={message.id} label={payload.message || "Working…"} />;
                                }
                                if (payload?.type === "audit_result") {
                                    const autoList = payload.auto_fixable || [];
                                    const manList = payload.manual_required || [];
                                    if (autoList.length === 0 && manList.length === 0) {
                                        return (
                                            <div key={message.id} className="flex justify-center">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] 2xl:text-[12.5px] font-semibold" style={{ color: GREEN }}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {payload.message || "Audit complete — no remaining issues."}
                                                </span>
                                            </div>
                                        );
                                    }
                                    const isLatest = message.id === lastAuditId;
                                    return (
                                        <AuditResultCard key={message.id} payload={payload}
                                            fixedIssues={isLatest ? fixedForLatestAudit : new Set()}
                                            active={isLatest && connected} busy={awaitingResponse}
                                            onSubmit={(cmd, count) => send(cmd, count === 0 ? "Skipping fixes…" : "Applying selected fixes…")} />
                                    );
                                }
                                if (payload?.type === "fix_result") {
                                    const fixedList = payload.fixed || [];
                                    const failedList = payload.failed || [];
                                    const pendingList = payload.pending_manual || [];
                                    if (fixedList.length === 0 && failedList.length === 0 && pendingList.length === 0) {
                                        return (
                                            <div key={message.id} className="flex justify-center">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] 2xl:text-[12.5px] text-content-subtle italic">
                                                    <Info className="w-3.5 h-3.5" />
                                                    {payload.message || "Nothing to apply."}
                                                </span>
                                            </div>
                                        );
                                    }
                                    const isLatestFix = message.id === lastFixResultId;
                                    return (
                                        <FixResultCard key={message.id} payload={payload}
                                            autoFixableItems={autoFixableItems}
                                            active={isLatestFix && connected} busy={awaitingResponse}
                                            onSubmit={(cmd, count) => send(cmd, count === 0 ? "Skipping fixes…" : "Applying selected fixes…")} />
                                    );
                                }
                                if (payload?.type === "chat") {
                                    return <ChatCard key={message.id} payload={payload} />;
                                }

                                return (
                                    <div key={message.id} className="flex justify-start">
                                        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 max-w-[90%] 2xl:max-w-[85%] shadow-sm">
                                            <div className="flex items-start gap-2 2xl:gap-2.5">
                                                <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: BLUE }}>
                                                    <Bot className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                                                </div>
                                                <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed text-content whitespace-pre-wrap flex-1 min-w-0">{message.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {showLoading && <LoadingBubble label={loadingLabel} />}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ============== QUICK REPLIES ============== */}
                {connected && (
                    <div className="px-3 2xl:px-4 pt-2 2xl:pt-3 flex items-center gap-1.5 2xl:gap-2 flex-shrink-0">
                        {awaitingYesNo && (
                            <>
                                <button onClick={() => send("yes", "Applying fix…")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-white inline-flex items-center gap-1 2xl:gap-1.5" style={{ backgroundColor: GREEN }}>
                                    <CheckCircle2 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" /> Yes, fix it
                                </button>
                                <button onClick={() => send("no", "Skipping…")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold border-2" style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}>
                                    <XCircle className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 inline -mt-0.5 mr-1" /> No, skip
                                </button>
                            </>
                        )}
                        <button onClick={() => { setAwaitingResponse(false); disconnect(); }}
                            className="ml-auto px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-content-subtle hover:bg-surface-hover transition-colors">
                            End session
                        </button>
                    </div>
                )}

                {/* ============== INPUT / START ============== */}
                <div className="p-3 2xl:p-4 bg-surface border-t-2 border-line flex-shrink-0">
                    {!connected ? (
                        <button onClick={handleStart} disabled={!propertyId || isBusy}
                            className="w-full h-9 2xl:h-11 rounded-xl font-bold text-[12px] 2xl:text-[13.5px] text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{ backgroundColor: BLUE, boxShadow: "0 10px 22px -8px rgba(26,115,232,0.55)" }}>
                            {status === "connecting" ? (<><Loader2 className="animate-spin h-3.5 w-3.5 2xl:h-4 2xl:w-4" /> Connecting…</>) : (<><Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" /> Start audit</>)}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress}
                                placeholder="Type a message or use the buttons above..."
                                className="flex-1 px-3 2xl:px-4 h-9 2xl:h-11 rounded-xl border-2 text-[12px] 2xl:text-[13.5px] focus:outline-none transition-colors text-content placeholder:text-content-subtle"
                                style={{ borderColor: "rgb(var(--border-strong))" }} />
                            <button onClick={handleSend} disabled={!inputMessage.trim()}
                                className="px-3.5 2xl:px-5 h-9 2xl:h-11 rounded-xl font-bold text-[12px] 2xl:text-[13.5px] text-white inline-flex items-center gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: BLUE }}>
                                Send <Send className="w-3.5 h-3.5 2xl:w-[15px] 2xl:h-[15px]" strokeWidth={2.4} />
                            </button>
                        </div>
                    )}
                    {!propertyId && !connected && (
                        <p className="text-[10px] 2xl:text-[11.5px] text-red-600 dark:text-red-400 mt-1.5 2xl:mt-2 inline-flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 2xl:w-[13px] 2xl:h-[13px]" strokeWidth={2.4} />
                            Please select an account and property above before starting
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditAgentModal;