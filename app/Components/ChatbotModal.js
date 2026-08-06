"use client";

/* ================================================================== *
 *  UnifiedAIAssistant
 *  ------------------------------------------------------------------
 *  Idea A — one FAB, one modal, one shared account/property selector.
 *  Inside, a small mode switch flips between:
 *     • "assistant" → GA4 Assistant  (useChatbot,  HTTP Q&A)
 *     • "autofix"   → Auto-fix Agent (useAuditAgent, WebSocket agent)
 *
 *  The two features keep their own backends/hooks (they can't share a
 *  single message thread), but to the user it feels like one panel:
 *  the account + property you pick is shared, and the Assistant has a
 *  "Run a full audit" chip that jumps straight into audit mode.
 *
 *  Exports:
 *     • UnifiedAIModal   — the modal (control open/close yourself)
 *     • UnifiedAILauncher — FAB + modal wired together (drop-in)
 *     • default = UnifiedAILauncher
 * ================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccountStore } from "../store/useAccountStore";
import { useAuditAgent, ALLOWED_ACCOUNT } from "../utils/useAuditAgent";
import { useChatbot } from "../utils/useChatbot";
import { useUsage } from "../utils/useUsage";
import ChatbotLimitModal from "./ChatbotLimitModal";
import UsageBanner from "./UsageBanner";
import {
    Bot, MessageCircle, X, Send, Sparkles, AlertCircle, CheckCircle2, XCircle,
    ChevronDown, Search, Building2, BarChart3, Wrench, Maximize2, Minimize2,
    Wand2, ListChecks, ShieldAlert, ArrowRight, CheckSquare, Square, Info, Loader2,
    TrendingUp, Eye, Target, Zap, ShieldCheck,
} from "lucide-react";

const ORANGE = "#F97316";
const BLUE = "#1A73E8";
const SLATE = "#0F172A";
const GREEN = "#16A34A";
const RED = "#DC2626";
const AMBER = "#D97706";

/* ------------------------------------------------------------------ *
 * Shared parsing helpers (from the audit agent)
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
 * Audit sub-components (unchanged from AuditAgentModal)
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

/* ================================================================== *
 * MAIN — Unified modal
 * ================================================================== */
const UnifiedAIModal = ({ isOpen, onClose }) => {
    /* ---- mode: which feature is on screen ---- */
    const [mode, setMode] = useState("assistant"); // 'assistant' | 'autofix'
    const isAssistant = mode === "assistant";

    /* ---- shared account / property ---- */
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [properties, setProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [accountsError, setAccountsError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const propertyId = selectedProperty?.name?.split("/")[1];

    /* ---- account store ---- */
    const accounts = useAccountStore((s) => s.accounts);
    const hasFetchedAccounts = useAccountStore((s) => s.hasFetchedAccounts);
    const fetchPropertySummaries = useAccountStore((s) => s.fetchPropertySummaries);
    const ensureAccountsFetched = useAccountStore((s) => s.ensureAccountsFetched);

    // Auto-fix is restricted to ALLOWED_ACCOUNT; assistant sees everything.
    const visibleAccounts = useMemo(() => {
        const all = accounts || [];
        return isAssistant ? all : all.filter((a) => a?.account === ALLOWED_ACCOUNT);
    }, [accounts, isAssistant]);

    /* ---- assistant (chatbot) hook ---- */
    const { usage, refetch: refetchUsage } = useUsage(isOpen);
    const {
        messages: chatMessages, isLoading: chatLoading, sendMessage: sendChat,
        clearMessages, limitReached, limitInfo, dismissLimit,
    } = useChatbot(refetchUsage);
    const blockedByLimit = usage?.chatbot && !usage.chatbot.unlimited && usage.chatbot.blocked;

    /* ---- auto-fix (audit agent) hook ---- */
    const {
        status, messages: auditMessages, awaitingYesNo,
        connect, sendMessage: sendAudit, disconnect,
    } = useAuditAgent();
    const auditBusy = status === "connecting" || status === "connected";
    const connected = status === "connected";
    const [auditAwaiting, setAuditAwaiting] = useState(false);
    const [auditLabel, setAuditLabel] = useState("Working…");

    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    /* ---- scroll to bottom on new content ---- */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, auditMessages, auditAwaiting, mode]);

    /* ---- focus input when assistant is active ---- */
    useEffect(() => {
        if (isOpen && isAssistant) inputRef.current?.focus();
    }, [isOpen, isAssistant]);

    /* ---- fetch accounts once when opened ---- */
    useEffect(() => {
        if (!isOpen || hasFetchedAccounts) return;
        let cancelled = false;
        setAccountsError(null);
        setLoadingAccounts(true);
        ensureAccountsFetched()
            .then((res) => {
                if (cancelled) return;
                if (!res.ok) {
                    setAccountsError(
                        res.reason === "auth" || res.reason === "no-session"
                            ? "Your Google session expired. Please sign in again."
                            : res.reason === "empty"
                                ? "No GA4 accounts are linked to this email."
                                : "Couldn't load your GA4 accounts. Try again in a moment."
                    );
                }
            })
            .finally(() => setLoadingAccounts(false));
        return () => { cancelled = true; };
    }, [isOpen, hasFetchedAccounts, ensureAccountsFetched]);

    const retryAccountsFetch = async () => {
        setAccountsError(null);
        setLoadingAccounts(true);
        const res = await ensureAccountsFetched();
        if (!res.ok) {
            setAccountsError(
                res.reason === "auth" || res.reason === "no-session"
                    ? "Your Google session expired. Please sign in again."
                    : res.reason === "empty"
                        ? "No GA4 accounts are linked to this email."
                        : "Couldn't load your GA4 accounts. Try again."
            );
        }
        setLoadingAccounts(false);
    };

    /* ---- close account dropdown on outside click ---- */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---- when the audit produces a reply, clear its "awaiting" spinner ---- */
    useEffect(() => {
        const last = auditMessages[auditMessages.length - 1];
        if (last && last.role !== "user" && last.role !== "system") setAuditAwaiting(false);
    }, [auditMessages]);

    /* ---- if the selected account isn't valid for the new mode, reset it ---- */
    useEffect(() => {
        if (!selectedAccount) return;
        const stillValid = visibleAccounts.some((a) => a?.account === selectedAccount?.account);
        if (!stillValid) {
            setSelectedAccount(null);
            setSelectedProperty(null);
            setProperties([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    /* ================= audit-derived memos ================= */
    const lastAuditId = useMemo(() => {
        let id = null;
        for (const m of auditMessages) {
            const p = parseAgentPayload(m);
            if (p?.type === "audit_result") {
                const hasItems = (p.auto_fixable?.length || 0) > 0 || (p.manual_required?.length || 0) > 0;
                if (hasItems) id = m.id;
            }
        }
        return id;
    }, [auditMessages]);

    const lastFixResultId = useMemo(() => {
        let id = null;
        for (const m of auditMessages) {
            const p = parseAgentPayload(m);
            if (p?.type === "fix_result") {
                const has = (p.fixed?.length || 0) + (p.failed?.length || 0) + (p.pending_manual?.length || 0);
                if (has > 0) id = m.id;
            }
        }
        return id;
    }, [auditMessages]);

    const autoFixableItems = useMemo(() => {
        if (!lastAuditId) return [];
        for (const m of auditMessages) {
            if (m.id !== lastAuditId) continue;
            const p = parseAgentPayload(m);
            return p?.auto_fixable || [];
        }
        return [];
    }, [auditMessages, lastAuditId]);

    const fixedForLatestAudit = useMemo(() => {
        const set = new Set();
        if (!lastAuditId) return set;
        let after = false;
        for (const m of auditMessages) {
            if (m.id === lastAuditId) { after = true; continue; }
            if (!after) continue;
            const p = parseAgentPayload(m);
            if (p?.type === "fix_result") (p.fixed || []).forEach((f) => { if (f?.issue) set.add(f.issue); });
        }
        return set;
    }, [auditMessages, lastAuditId]);

    /* ================= handlers ================= */
    const handleAccountSelect = async (account) => {
        setSelectedAccount(account);
        setSelectedProperty(null);
        setDropdownOpen(false);
        setLoadingProperties(true);
        try {
            const props = await fetchPropertySummaries(account?.account);
            setProperties(props || []);
        } catch {
            setProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    const handlePropertySelect = (e) => {
        const name = e.target.value;
        setSelectedProperty(name ? properties.find((p) => p.name === name) : null);
    };

    // assistant send
    const handleSendChat = async () => {
        if (!inputMessage.trim() || !propertyId || chatLoading || blockedByLimit) return;
        const q = inputMessage;
        setInputMessage("");
        await sendChat(q, propertyId);
    };

    const handleRecommendedQuestion = (question) => {
        if (!propertyId || chatLoading || blockedByLimit) return;
        setInputMessage(question);
        sendChat(question, propertyId).finally(() => setInputMessage(""));
    };

    // audit send / start
    const sendAuditMsg = (text, label = "Thinking…") => {
        setAuditLabel(label);
        setAuditAwaiting(true);
        sendAudit(text);
    };

    const startAudit = () => {
        if (!propertyId || auditBusy) return;
        setAuditLabel("Scanning your GA4 configuration…");
        setAuditAwaiting(true);
        connect(propertyId);
    };

    const handleSendAuditInput = () => {
        if (!inputMessage.trim() || !connected) return;
        sendAuditMsg(inputMessage, "Thinking…");
        setInputMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            isAssistant ? handleSendChat() : (connected ? handleSendAuditInput() : startAudit());
        }
    };

    // the "chat → audit" bridge
    const goRunAudit = () => {
        setInputMessage("");
        setMode("autofix");
    };

    const handleClose = () => {
        clearMessages();
        if (auditBusy) disconnect();
        setAuditAwaiting(false);
        setInputMessage("");
        setIsFullscreen(false);
        onClose();
    };

    if (!isOpen) return null;

    /* ---- header theme by mode ---- */
    const accent = isAssistant ? ORANGE : BLUE;
    const auditStatusPill =
        status === "connected" ? { text: "Live", color: GREEN }
        : status === "connecting" ? { text: "Connecting…", color: BLUE }
        : status === "error" ? { text: "Error", color: RED }
        : { text: "Disconnected", color: "rgb(var(--content-subtle))" };

    const lastAuditIsProgress = parseAgentPayload(auditMessages[auditMessages.length - 1])?.type === "progress";
    const showAuditLoading = !lastAuditIsProgress && (status === "connecting" || auditAwaiting || (connected && auditMessages.length === 0));

    const starters = [
        { icon: Eye, text: "Active users yesterday", query: "How many active users yesterday?", accent: ORANGE },
        { icon: TrendingUp, text: "Top traffic sources", query: "Show top traffic sources", accent: BLUE },
        { icon: BarChart3, text: "Most viewed pages", query: "What are the most viewed pages?", accent: ORANGE },
        { icon: Target, text: "Conversion trends", query: "Show conversion rate trends", accent: BLUE },
    ];

    return (
        <div className={`fixed inset-0 z-50 flex bg-black/55 backdrop-blur-sm ${isFullscreen ? "" : "items-center justify-center p-2 2xl:p-4"}`}>
            <div className={`bg-surface shadow-2xl flex flex-col overflow-hidden border-2 border-line ${isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[90vh] rounded-2xl 2xl:rounded-3xl"}`}>

                {/* ============== HEADER ============== */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ backgroundColor: SLATE }}>
                    {/* corner accents swap with mode */}
                    <div aria-hidden className="absolute top-0 left-0 w-1 2xl:w-1.5 h-full" style={{ backgroundColor: accent }} />
                    <div aria-hidden className="absolute top-0 left-0 h-1 2xl:h-1.5 w-16 2xl:w-24" style={{ backgroundColor: accent }} />
                    <div aria-hidden className="absolute bottom-0 right-0 w-1 2xl:w-1.5 h-9 2xl:h-12" style={{ backgroundColor: isAssistant ? BLUE : ORANGE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 h-1 2xl:h-1.5 w-16 2xl:w-24" style={{ backgroundColor: isAssistant ? BLUE : ORANGE }} />

                    <div className="relative px-3.5 py-3 2xl:px-6 2xl:py-5 flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 2xl:gap-3 min-w-0">
                            <div className="w-9 h-9 2xl:w-12 2xl:h-12 rounded-lg 2xl:rounded-xl flex items-center justify-center text-white shadow-md shrink-0" style={{ backgroundColor: accent }}>
                                {isAssistant
                                    ? <Bot className="w-4 h-4 2xl:w-[22px] 2xl:h-[22px]" strokeWidth={2.2} />
                                    : <Wrench className="w-4 h-4 2xl:w-[22px] 2xl:h-[22px]" strokeWidth={2.2} />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 2xl:gap-2 flex-wrap">
                                    <h2 className="text-sm 2xl:text-xl font-bold text-white tracking-tight">
                                        {isAssistant ? "GA4 Assistant" : "GA4 Auto-fix AI Agent"}
                                    </h2>
                                    {isAssistant ? (
                                        <>
                                            <span className="inline-flex items-center gap-1 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                                style={{ borderColor: "rgba(249,115,22,0.4)", backgroundColor: "rgba(249,115,22,0.15)", color: ORANGE }}>
                                                <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                                                Live
                                            </span>
                                            {usage?.chatbot && !usage.chatbot.unlimited && (
                                                <span className="inline-flex items-center gap-1 2xl:gap-1.5 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                                    style={{ borderColor: "rgba(26,115,232,0.4)", backgroundColor: "rgba(26,115,232,0.15)", color: "#93C5FD" }}>
                                                    <BarChart3 className="w-2.5 h-2.5 2xl:w-[10px] 2xl:h-[10px]" strokeWidth={2.5} />
                                                    <span className="font-mono tabular-nums normal-case tracking-normal">{usage.chatbot.used} / {usage.chatbot.limit}</span>
                                                    <span>used</span>
                                                </span>
                                            )}
                                            {usage?.chatbot?.unlimited && (
                                                <span className="inline-flex items-center gap-1 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                                    style={{ borderColor: "rgba(26,115,232,0.4)", backgroundColor: "rgba(26,115,232,0.15)", color: "#93C5FD" }}>
                                                    <Sparkles className="w-2.5 h-2.5 2xl:w-[10px] 2xl:h-[10px]" strokeWidth={2.5} />
                                                    Unlimited
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 2xl:gap-1.5 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                            style={{ borderColor: `${auditStatusPill.color}66`, backgroundColor: `${auditStatusPill.color}1F`, color: auditStatusPill.color }}>
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: auditStatusPill.color }} />
                                            {auditStatusPill.text}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-300 text-[10px] 2xl:text-[12.5px] mt-0.5 truncate">
                                    {selectedProperty
                                        ? (isAssistant
                                            ? <>Analytics for: <span className="text-white font-semibold">{selectedProperty.displayName}</span></>
                                            : <>Auditing: <span className="text-white font-semibold">{selectedProperty.displayName}</span></>)
                                        : "Select an account & property to start"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 2xl:gap-1 shrink-0">
                            <button onClick={() => setIsFullscreen((f) => !f)} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />}
                            </button>
                            <button onClick={handleClose} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors" aria-label="Close">
                                <X className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ============== MODE SWITCH ============== */}
                <div className="bg-surface px-3 pt-3 2xl:px-5 2xl:pt-4 flex-shrink-0">
                    <div className="inline-flex p-1 rounded-xl border-2 border-line bg-surface-muted/50 w-full sm:w-auto">
                        {[
                            { key: "assistant", label: "Assistant", icon: MessageCircle, color: ORANGE },
                            { key: "autofix", label: "Auto-fix agent", icon: Wrench, color: BLUE },
                        ].map((t) => {
                            const on = mode === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setMode(t.key)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 2xl:px-4 h-8 2xl:h-9 rounded-lg text-[12px] 2xl:text-[13px] font-bold transition-all"
                                    style={on
                                        ? { backgroundColor: t.color, color: "#fff", boxShadow: `0 6px 14px -6px ${t.color}` }
                                        : { color: "rgb(var(--content-subtle))" }}
                                >
                                    <t.icon className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" strokeWidth={2.3} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ============== SHARED ACCOUNT / PROPERTY BAR ============== */}
                <div className="bg-surface-muted/40 px-3 py-3 2xl:px-5 2xl:py-4 border-b-2 border-line flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2 2xl:gap-3">
                        {/* account */}
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <label className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1 2xl:mb-1.5 block">Account</label>
                            {loadingAccounts ? (
                                <div className="w-full h-8 2xl:h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3">
                                    <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                </div>
                            ) : accountsError ? (
                                <div className="w-full rounded-lg border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-2 2xl:p-2.5 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                                    <span className="text-[11px] 2xl:text-[12px] text-red-700 dark:text-red-300 flex-1 leading-snug">{accountsError}</span>
                                    <button type="button" onClick={retryAccountsFetch} className="text-[10px] 2xl:text-[11px] font-bold uppercase tracking-[0.12em] px-1.5 2xl:px-2 py-0.5 2xl:py-1 rounded border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0">Retry</button>
                                </div>
                            ) : visibleAccounts.length === 0 ? (
                                <div className="w-full rounded-lg border-2 border-line bg-surface-muted/50 p-2 2xl:p-2.5 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                                    <span className="text-[11px] 2xl:text-[12px] text-content-muted flex-1 leading-snug">
                                        {isAssistant ? "No GA4 accounts linked to this email." : "No auditable account available."}
                                    </span>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} disabled={!isAssistant && auditBusy}
                                    className="w-full flex items-center justify-between gap-2 px-3 h-8 2xl:h-10 rounded-lg border-2 bg-surface text-[12px] 2xl:text-[13px] transition-all hover:border-content-subtle/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={dropdownOpen ? { borderColor: accent, boxShadow: `0 0 0 3px ${accent}2E` } : { borderColor: "rgb(var(--border))" }}>
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Building2 className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] shrink-0" style={selectedAccount ? { color: accent } : { color: "rgb(var(--content-subtle))" }} />
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
                                        {(() => {
                                            const filtered = visibleAccounts.filter((acc) => acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase()));
                                            if (filtered.length === 0) return <div className="px-3 py-4 text-center text-[11px] 2xl:text-[12.5px] text-content-subtle">No matches</div>;
                                            return filtered.map((account) => {
                                                const active = selectedAccount?.account === account?.account;
                                                return (
                                                    <button type="button" key={account?.account} onClick={() => handleAccountSelect(account)}
                                                        className="w-full text-left px-2.5 2xl:px-3 py-2 2xl:py-2.5 text-[12px] 2xl:text-[13px] flex items-center gap-2.5 hover:bg-surface-hover transition-colors"
                                                        style={active ? { backgroundColor: `${accent}14`, color: accent, fontWeight: 600 } : {}}>
                                                        <span className="w-1 h-1 2xl:w-1.5 2xl:h-1.5 rounded-full" style={{ backgroundColor: active ? accent : "rgb(var(--border-strong))" }} />
                                                        <span className="truncate flex-1">{account?.displayName}</span>
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* property */}
                        <div className="flex-1">
                            <label className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1 2xl:mb-1.5 block">Property</label>
                            <div className="relative">
                                {loadingProperties ? (
                                    <div className="w-full h-8 2xl:h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3">
                                        <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                    </div>
                                ) : (
                                    <>
                                        <select onChange={handlePropertySelect} disabled={!selectedAccount || (!isAssistant && auditBusy)} value={selectedProperty?.name || ""}
                                            className="w-full appearance-none rounded-lg border-2 bg-surface h-8 2xl:h-10 pl-8 2xl:pl-9 pr-8 2xl:pr-9 text-[12px] 2xl:text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ borderColor: "rgb(var(--border))", color: selectedProperty ? "rgb(var(--content))" : "rgb(var(--content-subtle))", fontWeight: selectedProperty ? 600 : 400 }}>
                                            <option value="">{!selectedAccount ? "Select account first" : "Select property"}</option>
                                            {properties?.map((property) => (<option key={property?.name} value={property?.name}>{property?.displayName}</option>))}
                                        </select>
                                        <BarChart3 className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] pointer-events-none absolute left-2.5 2xl:left-3 top-1/2 -translate-y-1/2" style={selectedProperty ? { color: accent } : { color: "rgb(var(--content-subtle))" }} />
                                        <ChevronDown className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 pointer-events-none absolute right-2.5 2xl:right-3 top-1/2 -translate-y-1/2 text-content-muted" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* quota banner — assistant only */}
                {isAssistant && usage?.chatbot && !usage.chatbot.unlimited && (
                    <UsageBanner used={usage.chatbot.used} limit={usage.chatbot.limit} kind="messages" />
                )}

                {/* ============== MESSAGES ============== */}
                <div className="flex-1 overflow-y-auto p-3 2xl:p-6 space-y-2.5 2xl:space-y-4 bg-surface-muted">
                    {isAssistant ? (
                        /* ---------- ASSISTANT THREAD ---------- */
                        chatMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="relative w-14 h-14 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl flex items-center justify-center mb-3 2xl:mb-5 shadow-lg" style={{ backgroundColor: ORANGE }}>
                                    <MessageCircle className="w-6 h-6 2xl:w-9 2xl:h-9 text-white" strokeWidth={2.2} />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 2xl:w-6 2xl:h-6 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: BLUE }}>
                                        <Sparkles className="w-2.5 h-2.5 2xl:w-3 2xl:h-3" strokeWidth={2.5} />
                                    </span>
                                </div>
                                <h3 className="text-base 2xl:text-xl font-bold text-content mb-1.5 2xl:mb-2 tracking-tight">Welcome to GA4 Assistant</h3>
                                <p className="text-content-muted text-[12px] 2xl:text-[13.5px] max-w-md mb-4 2xl:mb-6 leading-relaxed px-2">
                                    {selectedProperty
                                        ? "Ask anything about your Google Analytics data — or run a full audit in one click."
                                        : "Please select an account and property above to start chatting."}
                                </p>
                                {selectedProperty && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 2xl:gap-2.5 max-w-2xl w-full">
                                        {starters.map((s) => (
                                            <button key={s.text} onClick={() => handleRecommendedQuestion(s.query)}
                                                className="group px-3 2xl:px-4 py-2.5 2xl:py-3 bg-surface border-2 rounded-lg 2xl:rounded-xl text-left transition-all hover:-translate-y-0.5"
                                                style={{ borderColor: "rgb(var(--border))" }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgb(var(--border))"; }}>
                                                <div className="flex items-center gap-2 2xl:gap-2.5">
                                                    <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: s.accent }}>
                                                        <s.icon className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                                                    </span>
                                                    <span className="text-[12px] 2xl:text-[13px] font-semibold text-content">{s.text}</span>
                                                </div>
                                            </button>
                                        ))}
                                        {/* the bridge into audit mode */}
                                        <button onClick={goRunAudit}
                                            className="group px-3 2xl:px-4 py-2.5 2xl:py-3 border-2 rounded-lg 2xl:rounded-xl text-left transition-all hover:-translate-y-0.5 md:col-span-2"
                                            style={{ borderColor: `${BLUE}55`, backgroundColor: `${BLUE}0D` }}>
                                            <div className="flex items-center gap-2 2xl:gap-2.5">
                                                <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center text-white shrink-0" style={{ backgroundColor: BLUE }}>
                                                    <Wrench className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                                                </span>
                                                <span className="text-[12px] 2xl:text-[13px] font-semibold" style={{ color: BLUE }}>Run a full GA4 audit &amp; auto-fix issues</span>
                                                <ArrowRight className="w-3.5 h-3.5 ml-auto" style={{ color: BLUE }} />
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {chatMessages.map((message) => (
                                    <div key={message.id}>
                                        {message.type === "user" ? (
                                            <div className="flex justify-end">
                                                <div className="rounded-2xl rounded-tr-sm px-3 2xl:px-4 py-2 2xl:py-2.5 max-w-[85%] 2xl:max-w-[80%] shadow-md text-white" style={{ backgroundColor: ORANGE }}>
                                                    <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                </div>
                                            </div>
                                        ) : message.type === "error" ? (
                                            <div className="flex justify-start">
                                                <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 max-w-[85%] 2xl:max-w-[80%]">
                                                    <div className="flex items-start gap-1.5 2xl:gap-2">
                                                        <AlertCircle className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-[11px] 2xl:text-[13px] leading-relaxed">{message.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-start">
                                                <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 max-w-[90%] 2xl:max-w-[80%] shadow-sm">
                                                    <div className="flex items-start gap-2 2xl:gap-2.5">
                                                        <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: BLUE }}>
                                                            <Bot className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed text-content whitespace-pre-wrap">{message.content}</p>
                                                            {message.data?.ga4_dataframe && message.data.ga4_dataframe.length > 0 && (
                                                                <div className="mt-2 2xl:mt-3 p-2.5 2xl:p-3 rounded-lg border" style={{ borderColor: `${BLUE}40`, backgroundColor: `${BLUE}10` }}>
                                                                    <div className="flex items-center gap-1 2xl:gap-1.5 mb-1.5 2xl:mb-2">
                                                                        <BarChart3 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" style={{ color: BLUE }} />
                                                                        <p className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE }}>Data summary</p>
                                                                    </div>
                                                                    {message.data.ga4_dataframe.map((row, idx) => (
                                                                        <div key={idx} className="text-[10px] 2xl:text-[11.5px] text-content">
                                                                            {Object.entries(row).map(([key, value]) => (
                                                                                <span key={key} className="mr-2 2xl:mr-3"><strong>{key}:</strong> {value}</span>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {message.data?.response_time && (
                                                                <p className="text-[9px] 2xl:text-[10.5px] text-content-subtle mt-1.5 2xl:mt-2 inline-flex items-center gap-1">
                                                                    <Zap className="w-2.5 h-2.5 2xl:w-[10px] 2xl:h-[10px]" strokeWidth={2.4} />
                                                                    Responded in {message.data.response_time.toFixed(2)}s
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {message.recommendedQuestions && message.recommendedQuestions.length > 0 && (
                                                        <div className="mt-2 2xl:mt-3 pt-2 2xl:pt-3 border-t border-line">
                                                            <div className="flex items-center gap-1 2xl:gap-1.5 mb-1.5 2xl:mb-2">
                                                                <Sparkles className="w-2.5 h-2.5 2xl:w-[11px] 2xl:h-[11px]" style={{ color: ORANGE }} strokeWidth={2.5} />
                                                                <p className="text-[9px] 2xl:text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ORANGE }}>You might also ask</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 2xl:gap-1.5">
                                                                {message.recommendedQuestions.map((question, idx) => (
                                                                    <button key={idx} onClick={() => handleRecommendedQuestion(question)}
                                                                        className="px-2.5 2xl:px-3 py-1 2xl:py-1.5 rounded-full text-[10px] 2xl:text-[11.5px] font-semibold border-2 transition-colors"
                                                                        style={{ borderColor: idx % 2 === 0 ? `${ORANGE}55` : `${BLUE}55`, color: idx % 2 === 0 ? ORANGE : BLUE, backgroundColor: idx % 2 === 0 ? `${ORANGE}0D` : `${BLUE}0D` }}>
                                                                        {question}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 shadow-sm">
                                            <div className="flex items-center gap-2 2xl:gap-2.5">
                                                <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: BLUE }}>
                                                    <span className="animate-spin rounded-full h-3 w-3 2xl:h-3.5 2xl:w-3.5 border-2 border-white border-t-transparent" />
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="w-1 h-1 2xl:w-1.5 2xl:h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ORANGE, animationDelay: "0ms" }} />
                                                    <span className="w-1 h-1 2xl:w-1.5 2xl:h-1.5 rounded-full animate-bounce" style={{ backgroundColor: BLUE, animationDelay: "150ms" }} />
                                                    <span className="w-1 h-1 2xl:w-1.5 2xl:h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ORANGE, animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    ) : (
                        /* ---------- AUTO-FIX THREAD ---------- */
                        auditMessages.length === 0 && !showAuditLoading ? (
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
                                {auditMessages.map((message) => {
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
                                        const isStartingNotice = /starting the audit/i.test(message.text || "");
                                        const isLast = message.id === auditMessages[auditMessages.length - 1]?.id;
                                        if (isStartingNotice && !isLast) return null;
                                        return (
                                            <div key={message.id} className="flex justify-center">
                                                <span className="text-[10px] 2xl:text-[11.5px] text-content-subtle italic">{message.text}</span>
                                            </div>
                                        );
                                    }
                                    const payload = parseAgentPayload(message);
                                    if (payload?.type === "progress") {
                                        const isLast = message.id === auditMessages[auditMessages.length - 1]?.id;
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
                                                active={isLatest && connected} busy={auditAwaiting}
                                                onSubmit={(cmd, count) => sendAuditMsg(cmd, count === 0 ? "Skipping fixes…" : "Applying selected fixes…")} />
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
                                                active={isLatestFix && connected} busy={auditAwaiting}
                                                onSubmit={(cmd, count) => sendAuditMsg(cmd, count === 0 ? "Skipping fixes…" : "Applying selected fixes…")} />
                                        );
                                    }
                                    if (payload?.type === "chat") return <ChatCard key={message.id} payload={payload} />;

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
                                {showAuditLoading && <LoadingBubble label={auditLabel} />}
                            </>
                        )
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ============== AUTO-FIX QUICK REPLIES ============== */}
                {!isAssistant && connected && (
                    <div className="px-3 2xl:px-4 pt-2 2xl:pt-3 flex items-center gap-1.5 2xl:gap-2 flex-shrink-0">
                        {awaitingYesNo && (
                            <>
                                <button onClick={() => sendAuditMsg("yes", "Applying fix…")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-white inline-flex items-center gap-1 2xl:gap-1.5" style={{ backgroundColor: GREEN }}>
                                    <CheckCircle2 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" /> Yes, fix it
                                </button>
                                <button onClick={() => sendAuditMsg("no", "Skipping…")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold border-2" style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}>
                                    <XCircle className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 inline -mt-0.5 mr-1" /> No, skip
                                </button>
                            </>
                        )}
                        <button onClick={() => { setAuditAwaiting(false); disconnect(); }}
                            className="ml-auto px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-content-subtle hover:bg-surface-hover transition-colors">
                            End session
                        </button>
                    </div>
                )}

                {/* ============== INPUT / START ============== */}
                <div className="p-3 2xl:p-4 bg-surface border-t-2 border-line flex-shrink-0">
                    {isAssistant ? (
                        <>
                            <div className="flex gap-2">
                                <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress}
                                    placeholder={blockedByLimit ? "Message limit reached" : (propertyId ? "Ask a question about your analytics..." : "Please select a property first")}
                                    disabled={!propertyId || chatLoading || blockedByLimit}
                                    className="flex-1 px-3 2xl:px-4 h-9 2xl:h-11 rounded-xl border-2 text-[12px] 2xl:text-[13.5px] focus:outline-none transition-colors disabled:bg-surface-hover disabled:cursor-not-allowed text-content placeholder:text-content-subtle"
                                    style={{ borderColor: "rgb(var(--border-strong))" }}
                                    onFocus={(e) => { if (!e.target.disabled) { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.18)"; } }}
                                    onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border-strong))"; e.target.style.boxShadow = "none"; }} />
                                <button onClick={handleSendChat} disabled={!inputMessage.trim() || !propertyId || chatLoading || blockedByLimit}
                                    className="px-3.5 2xl:px-5 h-9 2xl:h-11 rounded-xl font-bold text-[12px] 2xl:text-[13.5px] text-white inline-flex items-center gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    style={{ backgroundColor: ORANGE, boxShadow: "0 10px 22px -8px rgba(249,115,22,0.55)" }}>
                                    {chatLoading ? (<><span className="animate-spin rounded-full h-3.5 w-3.5 2xl:h-4 2xl:w-4 border-2 border-white border-t-transparent" /><span>Sending</span></>) : (<><span>Send</span><Send className="w-3.5 h-3.5 2xl:w-[15px] 2xl:h-[15px]" strokeWidth={2.4} /></>)}
                                </button>
                            </div>
                            {!propertyId && (
                                <p className="text-[10px] 2xl:text-[11.5px] text-red-600 dark:text-red-400 mt-1.5 2xl:mt-2 inline-flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 2xl:w-[13px] 2xl:h-[13px]" strokeWidth={2.4} />
                                    Please select an account and property above before asking questions
                                </p>
                            )}
                            {propertyId && !blockedByLimit && (
                                <div className="mt-1.5 2xl:mt-2 flex items-center justify-between">
                                    <span className="text-[9px] 2xl:text-[10.5px] text-content-subtle inline-flex items-center gap-1 2xl:gap-1.5">
                                        <ShieldCheck className="w-2.5 h-2.5 2xl:w-[11px] 2xl:h-[11px]" style={{ color: BLUE }} strokeWidth={2.4} />
                                        Read-only access · queries metered live
                                    </span>
                                    {usage?.chatbot && !usage.chatbot.unlimited && (
                                        <span className="text-[9px] 2xl:text-[10.5px] font-mono tabular-nums text-content-subtle font-semibold">
                                            {usage.chatbot.used} / {usage.chatbot.limit} this month
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {!connected ? (
                                <button onClick={startAudit} disabled={!propertyId || auditBusy}
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
                                    <button onClick={handleSendAuditInput} disabled={!inputMessage.trim()}
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
                        </>
                    )}
                </div>
            </div>

            {/* chatbot limit modal (assistant only) */}
            <ChatbotLimitModal
                isOpen={isAssistant && (limitReached || blockedByLimit)}
                onClose={dismissLimit}
                onRequestMore={() => { window.location.href = "mailto:data.analytics@analyticsliv.com?subject=Chatbot%20limit%20increase"; }}
                chatbotCount={limitInfo?.chatbotCount ?? usage?.chatbot?.used ?? 0}
                chatbotLimit={limitInfo?.chatbotLimit ?? usage?.chatbot?.limit ?? 0}
            />
        </div>
    );
};

/* ================================================================== *
 * Single FAB launcher (drop-in) — replaces your two old FABs
 * ================================================================== */
export const UnifiedAILauncher = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Open GA4 AI"
                    className="fixed bottom-5 right-5 2xl:bottom-6 2xl:right-6 z-40 w-14 h-14 2xl:w-16 2xl:h-16 rounded-full flex items-center justify-center text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    style={{ backgroundColor: ORANGE, boxShadow: "0 12px 26px -8px rgba(249,115,22,0.6)" }}
                >
                    <Sparkles className="w-6 h-6 2xl:w-7 2xl:h-7" strokeWidth={2.2} />
                </button>
            )}
            <UnifiedAIModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
};

export { UnifiedAIModal };
export default UnifiedAILauncher;