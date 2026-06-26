"use client";

import { useEffect, useRef, useState } from "react";
import { useAccountStore } from "../store/useAccountStore";
import { useAuditAgent, ALLOWED_ACCOUNT } from "../utils/useAuditAgent";
import {
    Bot, X, Send, Sparkles, AlertCircle, CheckCircle2, XCircle,
    ChevronDown, Search, Building2, BarChart3, Wrench,
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden border-2 border-line">

                {/* ============== HEADER ============== */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ backgroundColor: SLATE }}>
                    <div aria-hidden className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute top-0 left-0 h-1.5 w-24" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 w-1.5 h-12" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 h-1.5 w-24" style={{ backgroundColor: ORANGE }} />

                    <div className="relative px-6 py-5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: BLUE }}>
                                <Wrench size={22} strokeWidth={2.2} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-xl font-bold text-white tracking-tight">GA4 Auto-Fix Agent</h2>
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                        style={{ borderColor: `${statusPill.color}66`, backgroundColor: `${statusPill.color}1F`, color: statusPill.color }}
                                    >
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusPill.color }} />
                                        {statusPill.text}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[12.5px] mt-0.5">
                                    {selectedProperty
                                        ? <>Auditing: <span className="text-white font-semibold">{selectedProperty.displayName}</span></>
                                        : "Select an account & property to start"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                            aria-label="Close audit agent"
                        >
                            <X size={20} strokeWidth={2.2} />
                        </button>
                    </div>
                </div>

                {/* ============== ACCOUNT / PROPERTY BAR ============== */}
                <div className="bg-surface-muted/40 px-5 py-4 border-b-2 border-line flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <label className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1.5 block">Account</label>
                            {loadingAccounts ? (
                                <div className="w-full h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3.5">
                                    <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                </div>
                            ) : accountsError ? (
                                <div className="w-full rounded-lg border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-2.5 text-[12px] text-red-700 dark:text-red-300">
                                    {accountsError}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    disabled={isBusy}
                                    className="w-full flex items-center justify-between gap-2 px-3.5 h-10 rounded-lg border-2 bg-surface text-[13px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ borderColor: "rgb(var(--border))" }}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Building2 size={14} style={selectedAccount ? { color: BLUE } : { color: "rgb(var(--content-subtle))" }} />
                                        <span className={`truncate ${selectedAccount ? "font-semibold text-content" : "text-content-subtle"}`}>
                                            {selectedAccount?.displayName || "Select account"}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className={`text-content-muted shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                            )}

                            {dropdownOpen && !loadingAccounts && !accountsError && visibleAccounts.length > 0 && (
                                <div className="absolute z-30 mt-1.5 w-full rounded-xl border-2 border-line bg-surface-elevated shadow-xl overflow-hidden">
                                    <div className="p-2 border-b-2 border-line">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
                                            <input
                                                type="text"
                                                placeholder="Search accounts..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-3 h-9 rounded-md text-[13px] bg-surface-muted border-2 border-line focus:outline-none"
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
                                                    className="w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2.5 hover:bg-surface-hover transition-colors"
                                                >
                                                    <span className="truncate flex-1">{account?.displayName}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1.5 block">Property</label>
                            <div className="relative">
                                {loadingProperties ? (
                                    <div className="w-full h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-3.5">
                                        <span className="block h-3 flex-1 max-w-[60%] skeleton-shimmer rounded" />
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            onChange={handlePropertySelect}
                                            disabled={!selectedAccount || isBusy}
                                            value={selectedProperty?.name || ""}
                                            className="w-full appearance-none rounded-lg border-2 bg-surface h-10 pl-9 pr-9 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ borderColor: "rgb(var(--border))" }}
                                        >
                                            <option value="">{!selectedAccount ? "Select account first" : "Select property"}</option>
                                            {properties?.map((property) => (
                                                <option key={property?.name} value={property?.name}>{property?.displayName}</option>
                                            ))}
                                        </select>
                                        <BarChart3 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={selectedProperty ? { color: BLUE } : { color: "rgb(var(--content-subtle))" }} />
                                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============== MESSAGES ============== */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-muted">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ backgroundColor: BLUE }}>
                                <Wrench size={32} className="text-white" strokeWidth={2.2} />
                                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: ORANGE }}>
                                    <Sparkles size={12} strokeWidth={2.5} />
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-content mb-2 tracking-tight">Run an automated GA4 audit</h3>
                            <p className="text-content-muted text-[13.5px] max-w-md leading-relaxed">
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
                                        <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-md text-white" style={{ backgroundColor: ORANGE }}>
                                            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>
                                ) : message.role === "system" ? (
                                    <div className="flex justify-center">
                                        <span className="text-[11.5px] text-content-subtle italic">{message.text}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: BLUE }}>
                                                    <Bot size={14} strokeWidth={2.4} />
                                                </div>
                                                <p className="text-[13.5px] leading-relaxed text-content whitespace-pre-wrap flex-1 min-w-0">
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
                    <div className="px-4 pt-3 flex items-center gap-2 flex-shrink-0">
                        {awaitingYesNo && (
                            <>
                                <button
                                    onClick={() => sendMessage("yes")}
                                    className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold text-white inline-flex items-center gap-1.5"
                                    style={{ backgroundColor: "#16A34A" }}
                                >
                                    <CheckCircle2 size={14} /> Yes, fix it
                                </button>
                                <button
                                    onClick={() => sendMessage("no")}
                                    className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold border-2"
                                    style={{ borderColor: "rgb(var(--border-strong))", color: "rgb(var(--content))" }}
                                >
                                    <XCircle size={14} className="inline -mt-0.5 mr-1" /> No, skip
                                </button>
                            </>
                        )}
                        <button
                            onClick={disconnect}
                            className="ml-auto px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold text-content-subtle hover:bg-surface-hover transition-colors"
                        >
                            End session
                        </button>
                    </div>
                )}

                {/* ============== INPUT / START ============== */}
                <div className="p-4 bg-surface border-t-2 border-line flex-shrink-0">
                    {!connected ? (
                        <button
                            onClick={handleStart}
                            disabled={!propertyId || isBusy}
                            className="w-full h-11 rounded-xl font-bold text-[13.5px] text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{ backgroundColor: BLUE, boxShadow: "0 10px 22px -8px rgba(26,115,232,0.55)" }}
                        >
                            {status === "connecting" ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Connecting…
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} /> Start audit
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
                                className="flex-1 px-4 h-11 rounded-xl border-2 text-[13.5px] focus:outline-none transition-colors text-content placeholder:text-content-subtle"
                                style={{ borderColor: "rgb(var(--border-strong))" }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputMessage.trim()}
                                className="px-5 h-11 rounded-xl font-bold text-[13.5px] text-white inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: BLUE }}
                            >
                                Send <Send size={15} strokeWidth={2.4} />
                            </button>
                        </div>
                    )}

                    {!propertyId && !connected && (
                        <p className="text-[11.5px] text-red-600 dark:text-red-400 mt-2 inline-flex items-center gap-1.5">
                            <AlertCircle size={13} strokeWidth={2.4} />
                            Please select an account and property above before starting
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditAgentModal;
