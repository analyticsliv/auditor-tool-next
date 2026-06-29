"use client";

import { useEffect, useRef, useState } from "react";
import { useAccountStore } from "../store/useAccountStore";
import { useAuditAgent, ALLOWED_ACCOUNT } from "../utils/useAuditAgent";
import {
    Bot, X, Send, Sparkles, AlertCircle, CheckCircle2, XCircle,
    ChevronDown, Search, Building2, BarChart3, Wrench, Maximize2, Minimize2,
} from "lucide-react";

const ORANGE = "#F97316";
const BLUE = "#1A73E8";
const SLATE = "#0F172A";

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

    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    const accounts = useAccountStore((s) => s.accounts);
    const visibleAccounts = (accounts || []).filter((a) => a?.account === ALLOWED_ACCOUNT);
    const hasFetchedAccounts = useAccountStore((s) => s.hasFetchedAccounts);
    const fetchPropertySummaries = useAccountStore((s) => s.fetchPropertySummaries);
    const ensureAccountsFetched = useAccountStore((s) => s.ensureAccountsFetched);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!isOpen || hasFetchedAccounts) return;
        setLoadingAccounts(true);
        setAccountsError(null);
        ensureAccountsFetched()
            .then((res) => {
                if (!res.ok) setAccountsError("Couldn't load your GA4 accounts. Try again.");
            })
            .finally(() => setLoadingAccounts(false));
    }, [isOpen, hasFetchedAccounts, ensureAccountsFetched]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        status === "connected" ? { text: "Live", color: "#16A34A" }
        : status === "connecting" ? { text: "Connecting…", color: BLUE }
        : status === "error" ? { text: "Error", color: "#DC2626" }
        : { text: "Disconnected", color: "rgb(var(--content-subtle))" };

    const handleStart = () => {
        if (!propertyId || isBusy) return;
        connect(propertyId);
    };

    const handleSend = () => {
        if (!inputMessage.trim() || !connected) return;
        sendMessage(inputMessage);
        setInputMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClose = () => {
        // Cover "connecting" too — closing mid-handshake would otherwise leak
        // the socket: it stays open in the background with no one able to see
        // or answer a yes/no prompt once the modal is gone.
        if (isBusy) disconnect();
        setIsFullscreen(false);
        onClose();
    };

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
                                    <span
                                        className="inline-flex items-center gap-1 2xl:gap-1.5 px-1.5 2xl:px-2 py-0.5 rounded text-[8px] 2xl:text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                        style={{ borderColor: `${statusPill.color}66`, backgroundColor: `${statusPill.color}1F`, color: statusPill.color }}
                                    >
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusPill.color }} />
                                        {statusPill.text}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[10px] 2xl:text-[12.5px] mt-0.5 truncate">
                                    {selectedProperty
                                        ? <>Auditing: <span className="text-white font-semibold">{selectedProperty.displayName}</span></>
                                        : "Select an account & property to start"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 2xl:gap-1 shrink-0">
                            <button
                                onClick={() => setIsFullscreen((f) => !f)}
                                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors"
                                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                                {isFullscreen
                                    ? <Minimize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />
                                    : <Maximize2 className="w-3.5 h-3.5 2xl:w-5 2xl:h-5" strokeWidth={2.2} />}
                            </button>
                            <button
                                onClick={handleClose}
                                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-1.5 2xl:p-2 transition-colors"
                                aria-label="Close audit agent"
                            >
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
                                <div className="w-full rounded-lg border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-2 2xl:p-2.5 text-[11px] 2xl:text-[12px] text-red-700 dark:text-red-300">
                                    {accountsError}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    disabled={isBusy}
                                    className="w-full flex items-center justify-between gap-2 px-3 h-8 2xl:h-10 rounded-lg border-2 bg-surface text-[12px] 2xl:text-[13px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ borderColor: "rgb(var(--border))" }}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Building2 className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] shrink-0" style={selectedAccount ? { color: BLUE } : { color: "rgb(var(--content-subtle))" }} />
                                        <span className={`truncate ${selectedAccount ? "font-semibold text-content" : "text-content-subtle"}`}>
                                            {selectedAccount?.displayName || "Select account"}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-content-muted shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                            )}

                            {dropdownOpen && !loadingAccounts && !accountsError && visibleAccounts.length > 0 && (
                                <div className="absolute z-30 mt-1.5 w-full rounded-xl border-2 border-line bg-surface-elevated shadow-xl overflow-hidden">
                                    <div className="p-1.5 2xl:p-2 border-b-2 border-line">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 2xl:w-[14px] 2xl:h-[14px] absolute left-2.5 top-1/2 -translate-y-1/2 text-content-subtle" />
                                            <input
                                                type="text"
                                                placeholder="Search accounts..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-8 2xl:pl-9 pr-3 h-8 2xl:h-9 rounded-md text-[12px] 2xl:text-[13px] bg-surface-muted border-2 border-line focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {visibleAccounts
                                            .filter((acc) => acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase()))
                                            .map((account) => (
                                                <button
                                                    type="button"
                                                    key={account?.account}
                                                    onClick={() => handleAccountSelect(account)}
                                                    className="w-full text-left px-2.5 2xl:px-3 py-2 2xl:py-2.5 text-[12px] 2xl:text-[13px] flex items-center gap-2.5 hover:bg-surface-hover transition-colors"
                                                >
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
                                        <select
                                            onChange={handlePropertySelect}
                                            disabled={!selectedAccount || isBusy}
                                            value={selectedProperty?.name || ""}
                                            className="w-full appearance-none rounded-lg border-2 bg-surface h-8 2xl:h-10 pl-8 2xl:pl-9 pr-8 2xl:pr-9 text-[12px] 2xl:text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ borderColor: "rgb(var(--border))" }}
                                        >
                                            <option value="">{!selectedAccount ? "Select account first" : "Select property"}</option>
                                            {properties?.map((property) => (
                                                <option key={property?.name} value={property?.name}>{property?.displayName}</option>
                                            ))}
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
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-14 h-14 2xl:w-20 2xl:h-20 rounded-xl 2xl:rounded-2xl flex items-center justify-center mb-3 2xl:mb-5 shadow-lg" style={{ backgroundColor: BLUE }}>
                                <Wrench className="w-6 h-6 2xl:w-8 2xl:h-8 text-white" strokeWidth={2.2} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 2xl:w-6 2xl:h-6 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: ORANGE }}>
                                    <Sparkles className="w-2.5 h-2.5 2xl:w-3 2xl:h-3" strokeWidth={2.5} />
                                </span>
                            </div>
                            <h3 className="text-base 2xl:text-xl font-bold text-content mb-1.5 2xl:mb-2 tracking-tight">Run an automated GA4 audit</h3>
                            <p className="text-content-muted text-[12px] 2xl:text-[13.5px] max-w-md leading-relaxed px-2">
                                {selectedProperty
                                    ? "Click Start Audit below. The agent will check your configuration and ask before applying any fix."
                                    : "Select an account and property above, then start the audit."}
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id}>
                                {message.role === "user" ? (
                                    <div className="flex justify-end">
                                        <div className="rounded-2xl rounded-tr-sm px-3 2xl:px-4 py-2 2xl:py-2.5 max-w-[85%] 2xl:max-w-[80%] shadow-md text-white" style={{ backgroundColor: ORANGE }}>
                                            <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>
                                ) : message.role === "system" ? (
                                    <div className="flex justify-center">
                                        <span className="text-[10px] 2xl:text-[11.5px] text-content-subtle italic">{message.text}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-3 2xl:px-4 py-2 2xl:py-3 max-w-[90%] 2xl:max-w-[85%] shadow-sm">
                                            <div className="flex items-start gap-2 2xl:gap-2.5">
                                                <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: BLUE }}>
                                                    <Bot className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" strokeWidth={2.4} />
                                                </div>
                                                <p className="text-[12px] 2xl:text-[13.5px] leading-relaxed text-content whitespace-pre-wrap flex-1 min-w-0">
                                                    {message.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ============== QUICK REPLIES — Yes/No only while the agent is
                     actually asking a yes/no question; End session always available. ============== */}
                {connected && (
                    <div className="px-3 2xl:px-4 pt-2 2xl:pt-3 flex items-center gap-1.5 2xl:gap-2 flex-shrink-0">
                        {awaitingYesNo && (
                            <>
                                <button
                                    onClick={() => sendMessage("yes")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-white inline-flex items-center gap-1 2xl:gap-1.5"
                                    style={{ backgroundColor: "#16A34A" }}
                                >
                                    <CheckCircle2 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" /> Yes, fix it
                                </button>
                                <button
                                    onClick={() => sendMessage("no")}
                                    className="px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold border-2"
                                    style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}
                                >
                                    <XCircle className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 inline -mt-0.5 mr-1" /> No, skip
                                </button>
                            </>
                        )}
                        <button
                            onClick={disconnect}
                            className="ml-auto px-2.5 2xl:px-3.5 py-1 2xl:py-1.5 rounded-lg text-[11px] 2xl:text-[12.5px] font-bold text-content-subtle hover:bg-surface-hover transition-colors"
                        >
                            End session
                        </button>
                    </div>
                )}

                {/* ============== INPUT / START ============== */}
                <div className="p-3 2xl:p-4 bg-surface border-t-2 border-line flex-shrink-0">
                    {!connected ? (
                        <button
                            onClick={handleStart}
                            disabled={!propertyId || isBusy}
                            className="w-full h-9 2xl:h-11 rounded-xl font-bold text-[12px] 2xl:text-[13.5px] text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{ backgroundColor: BLUE, boxShadow: "0 10px 22px -8px rgba(26,115,232,0.55)" }}
                        >
                            {status === "connecting" ? (
                                <>
                                    <span className="animate-spin rounded-full h-3.5 w-3.5 2xl:h-4 2xl:w-4 border-2 border-white border-t-transparent" />
                                    Connecting…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" /> Start audit
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message or use the buttons above..."
                                className="flex-1 px-3 2xl:px-4 h-9 2xl:h-11 rounded-xl border-2 text-[12px] 2xl:text-[13.5px] focus:outline-none transition-colors text-content placeholder:text-content-subtle"
                                style={{ borderColor: "rgb(var(--border-strong))" }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputMessage.trim()}
                                className="px-3.5 2xl:px-5 h-9 2xl:h-11 rounded-xl font-bold text-[12px] 2xl:text-[13.5px] text-white inline-flex items-center gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: BLUE }}
                            >
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
