"use client";

import { useState, useEffect, useRef } from "react";
import { useChatbot } from "../utils/useChatbot";
import { useAccountStore } from "../store/useAccountStore";
import { useUsage } from "../utils/useUsage";
import ChatbotLimitModal from "./ChatbotLimitModal";
import UsageBanner from "./UsageBanner";
import {
    MessageCircle, X, ChevronDown, Search, Sparkles, Send,
    AlertCircle, Bot, BarChart3, TrendingUp, Eye, Target,
    Zap, ShieldCheck, Building2,
} from "lucide-react";

const ORANGE = "#F97316";
const BLUE   = "#1A73E8";
const SLATE  = "#0F172A";

const ChatbotModal = ({ isOpen, onClose }) => {
    const [inputMessage, setInputMessage] = useState("");
    const { usage, refetch: refetchUsage } = useUsage(isOpen);
    const { messages, isLoading, sendMessage, clearMessages, limitReached, limitInfo, dismissLimit } = useChatbot(refetchUsage);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [chatbotSelectedAccount, setChatbotSelectedAccount] = useState(null);
    const [chatbotSelectedProperty, setChatbotSelectedProperty] = useState(null);
    const [chatbotProperties, setChatbotProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);

    const { accounts, fetchPropertySummaries } = useAccountStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

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
        setChatbotSelectedAccount(account);
        setChatbotSelectedProperty(null);
        setDropdownOpen(false);
        setLoadingProperties(true);
        try {
            const properties = await fetchPropertySummaries(account?.account);
            setChatbotProperties(properties || []);
        } catch (error) {
            console.error("Error fetching properties:", error);
            setChatbotProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    const handlePropertySelect = (e) => {
        const propertyName = e.target.value;
        if (propertyName === "") {
            setChatbotSelectedProperty(null);
        } else {
            const property = chatbotProperties?.find((prop) => prop.name === propertyName);
            setChatbotSelectedProperty(property);
        }
    };

    const blockedByLimit = usage?.chatbot && !usage.chatbot.unlimited && usage.chatbot.blocked;

    const handleSend = async () => {
        if (!inputMessage.trim() || !chatbotSelectedProperty || isLoading || blockedByLimit) return;
        const propertyId = chatbotSelectedProperty?.name?.split('/')[1];
        const queryToSend = inputMessage;
        setInputMessage("");                       // clear immediately so user sees the lock
        await sendMessage(queryToSend, propertyId);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRecommendedQuestion = (question) => {
        if (!chatbotSelectedProperty || isLoading || blockedByLimit) return;
        const propertyId = chatbotSelectedProperty?.name?.split('/')[1];
        // Show the question in the input box so the user sees what was sent,
        // then fire-and-forget the call. sendMessage flips isLoading immediately
        // so the send button locks in the same render.
        setInputMessage(question);
        sendMessage(question, propertyId).finally(() => setInputMessage(""));
    };

    const handleClose = () => {
        clearMessages();
        setInputMessage("");
        onClose();
    };

    if (!isOpen) return null;

    const propertyId = chatbotSelectedProperty?.name?.split('/')[1];

    // Recommended starter questions — alternating orange/blue accents
    const starters = [
        { icon: Eye,        text: "Active users yesterday",     query: "How many active users yesterday?",    accent: ORANGE },
        { icon: TrendingUp, text: "Top traffic sources",        query: "Show top traffic sources",            accent: BLUE   },
        { icon: BarChart3,  text: "Most viewed pages",          query: "What are the most viewed pages?",     accent: ORANGE },
        { icon: Target,     text: "Conversion trends",          query: "Show conversion rate trends",         accent: BLUE   },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border-2 border-line">

                {/* ============== HEADER — solid slate with orange/blue corner accents ============== */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ backgroundColor: SLATE }}>
                    {/* Corner accents — match landing/home page styling */}
                    <div aria-hidden className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute top-0 left-0 h-1.5 w-24" style={{ backgroundColor: ORANGE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 w-1.5 h-12" style={{ backgroundColor: BLUE }} />
                    <div aria-hidden className="absolute bottom-0 right-0 h-1.5 w-24" style={{ backgroundColor: BLUE }} />

                    {/* Subtle dot grid in header */}
                    <div aria-hidden className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                        }} />

                    <div className="relative px-6 py-5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Bot avatar — solid orange */}
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                                style={{ backgroundColor: ORANGE }}>
                                <Bot size={22} strokeWidth={2.2} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-xl font-bold text-white tracking-tight">GA4 Assistant</h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                        style={{ borderColor: "rgba(249,115,22,0.4)", backgroundColor: "rgba(249,115,22,0.15)", color: ORANGE }}>
                                        <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                                        Live
                                    </span>
                                    {/* Chatbot quota pill — always visible (unless unlimited) */}
                                    {usage?.chatbot && !usage.chatbot.unlimited && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                            style={{ borderColor: "rgba(26,115,232,0.4)", backgroundColor: "rgba(26,115,232,0.15)", color: "#93C5FD" }}>
                                            <BarChart3 size={10} strokeWidth={2.5} />
                                            <span className="font-mono tabular-nums normal-case tracking-normal">
                                                {usage.chatbot.used} / {usage.chatbot.limit}
                                            </span>
                                            <span>used</span>
                                        </span>
                                    )}
                                    {usage?.chatbot?.unlimited && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.16em] border"
                                            style={{ borderColor: "rgba(26,115,232,0.4)", backgroundColor: "rgba(26,115,232,0.15)", color: "#93C5FD" }}>
                                            <Sparkles size={10} strokeWidth={2.5} />
                                            Unlimited
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-300 text-[12.5px] mt-0.5">
                                    {chatbotSelectedProperty
                                        ? <>Analytics for: <span className="text-white font-semibold">{chatbotSelectedProperty.displayName}</span></>
                                        : "Select an account & property to start chatting"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                            aria-label="Close chatbot"
                        >
                            <X size={20} strokeWidth={2.2} />
                        </button>
                    </div>
                </div>

                {/* ============== ACCOUNT / PROPERTY BAR ============== */}
                <div className="bg-surface-muted/40 px-5 py-4 border-b-2 border-line flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Account dropdown */}
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1.5">Account</label>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full flex items-center justify-between gap-2 px-3.5 h-10 rounded-lg border-2 bg-surface text-[13px] transition-all hover:border-content-subtle/40"
                                style={dropdownOpen
                                    ? { borderColor: ORANGE, boxShadow: "0 0 0 3px rgba(249,115,22,0.18)" }
                                    : { borderColor: "rgb(var(--border))" }}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Building2 size={14} strokeWidth={2.4}
                                        style={chatbotSelectedAccount ? { color: ORANGE } : { color: "rgb(var(--content-subtle))" }} />
                                    <span className={`truncate ${chatbotSelectedAccount ? "font-semibold text-content" : "text-content-subtle"}`}>
                                        {chatbotSelectedAccount?.displayName || "Select account"}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`text-content-muted shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute z-30 mt-1.5 w-full rounded-xl border-2 border-line bg-surface-elevated shadow-[0_24px_50px_-12px_rgba(15,23,42,0.25)] overflow-hidden">
                                    <div className="p-2 border-b-2 border-line">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
                                            <input
                                                type="text"
                                                placeholder="Search accounts..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-3 h-9 rounded-md text-[13px] bg-surface-muted border-2 border-line placeholder:text-content-subtle focus:outline-none transition-all"
                                                onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
                                                onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border))"; e.target.style.boxShadow = "none"; }}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {accounts
                                            ?.filter((acc) => acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase()))
                                            ?.map((account) => {
                                                const active = chatbotSelectedAccount?.account === account?.account;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={account?.account}
                                                        onClick={() => handleAccountSelect(account)}
                                                        className="w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors hover:bg-surface-hover"
                                                        style={active ? { backgroundColor: "rgba(249,115,22,0.08)", color: ORANGE, fontWeight: 600 } : {}}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: active ? ORANGE : "rgb(var(--border-strong))" }} />
                                                        <span className="truncate flex-1">{account?.displayName}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property select */}
                        <div className="flex-1">
                            <label className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-content-subtle mb-1.5">
                                Property
                                {loadingProperties && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-px rounded text-[9.5px] font-bold normal-case tracking-normal"
                                        style={{ backgroundColor: `${ORANGE}1A`, color: ORANGE }}>
                                        <span className="animate-spin rounded-full h-2.5 w-2.5 border-[1.5px] border-current border-t-transparent" />
                                        Loading
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                {loadingProperties ? (
                                    /* Skeleton state — shimmer bar gives a clear "data is coming" cue */
                                    <div className="w-full h-10 rounded-lg border-2 border-line bg-surface flex items-center pl-9 pr-9 cursor-wait">
                                        <BarChart3 size={14} strokeWidth={2.4} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
                                        <span className="block h-3 w-2/3 skeleton-shimmer rounded" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" style={{ color: ORANGE }} />
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            onChange={handlePropertySelect}
                                            disabled={!chatbotSelectedAccount}
                                            value={chatbotSelectedProperty?.name || ""}
                                            className="w-full appearance-none rounded-lg border-2 bg-surface h-10 pl-9 pr-9 text-[13px] disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:outline-none"
                                            style={{
                                                borderColor: "rgb(var(--border))",
                                                color: chatbotSelectedProperty ? "rgb(var(--content))" : "rgb(var(--content-subtle))",
                                                fontWeight: chatbotSelectedProperty ? 600 : 400,
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; }}
                                            onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border))"; e.target.style.boxShadow = "none"; }}
                                        >
                                            <option value="">
                                                {!chatbotSelectedAccount ? "Select account first" : "Select property"}
                                            </option>
                                            {chatbotProperties?.map((property) => (
                                                <option key={property?.name} value={property?.name}>
                                                    {property?.displayName}
                                                </option>
                                            ))}
                                        </select>
                                        <BarChart3 size={14} strokeWidth={2.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                                            style={chatbotSelectedProperty ? { color: ORANGE } : { color: "rgb(var(--content-subtle))" }} />
                                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quota banner — re-renders whenever usage refetches after each msg */}
                {usage?.chatbot && !usage.chatbot.unlimited && (
                    <UsageBanner used={usage.chatbot.used} limit={usage.chatbot.limit} kind="messages" />
                )}

                {/* ============== MESSAGES AREA ============== */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-muted">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            {/* Welcome icon — solid orange square (no gradient) */}
                            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                                style={{ backgroundColor: ORANGE }}>
                                <MessageCircle size={36} className="text-white" strokeWidth={2.2} />
                                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md"
                                    style={{ backgroundColor: BLUE }}>
                                    <Sparkles size={12} strokeWidth={2.5} />
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-content mb-2 tracking-tight">Welcome to GA4 Assistant</h3>
                            <p className="text-content-muted text-[13.5px] max-w-md mb-6 leading-relaxed">
                                {chatbotSelectedProperty
                                    ? "Ask anything about your Google Analytics data — I can analyze trends, compare metrics, and answer questions about performance."
                                    : "Please select an account and property above to start chatting."}
                            </p>

                            {chatbotSelectedProperty && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-2xl w-full">
                                    {starters.map((s) => (
                                        <button
                                            key={s.text}
                                            onClick={() => handleRecommendedQuestion(s.query)}
                                            className="group px-4 py-3 bg-surface border-2 rounded-xl text-left transition-all hover:-translate-y-0.5"
                                            style={{ borderColor: "rgb(var(--border))" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgb(var(--border))"; }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                                                    style={{ backgroundColor: s.accent }}>
                                                    <s.icon size={14} strokeWidth={2.4} />
                                                </span>
                                                <span className="text-[13px] font-semibold text-content">{s.text}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id}>
                                {message.type === "user" ? (
                                    <div className="flex justify-end">
                                        {/* User bubble — solid orange */}
                                        <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-md text-white"
                                            style={{ backgroundColor: ORANGE }}>
                                            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ) : message.type === "error" ? (
                                    <div className="flex justify-start">
                                        <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-[13px] leading-relaxed">{message.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                                            <div className="flex items-start gap-2.5">
                                                {/* Bot avatar — solid blue (no gradient) */}
                                                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white"
                                                    style={{ backgroundColor: BLUE }}>
                                                    <Bot size={14} strokeWidth={2.4} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13.5px] leading-relaxed text-content whitespace-pre-wrap">
                                                        {message.content}
                                                    </p>

                                                    {/* GA4 data — solid blue accent panel */}
                                                    {message.data?.ga4_dataframe && message.data.ga4_dataframe.length > 0 && (
                                                        <div className="mt-3 p-3 rounded-lg border"
                                                            style={{ borderColor: `${BLUE}40`, backgroundColor: `${BLUE}10` }}>
                                                            <div className="flex items-center gap-1.5 mb-2">
                                                                <BarChart3 size={12} style={{ color: BLUE }} />
                                                                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE }}>
                                                                    Data summary
                                                                </p>
                                                            </div>
                                                            {message.data.ga4_dataframe.map((row, idx) => (
                                                                <div key={idx} className="text-[11.5px] text-content">
                                                                    {Object.entries(row).map(([key, value]) => (
                                                                        <span key={key} className="mr-3">
                                                                            <strong>{key}:</strong> {value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {message.data?.response_time && (
                                                        <p className="text-[10.5px] text-content-subtle mt-2 inline-flex items-center gap-1">
                                                            <Zap size={10} strokeWidth={2.4} />
                                                            Responded in {message.data.response_time.toFixed(2)}s
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {message.recommendedQuestions && message.recommendedQuestions.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-line">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Sparkles size={11} style={{ color: ORANGE }} strokeWidth={2.5} />
                                                        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ORANGE }}>
                                                            You might also ask
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {message.recommendedQuestions.map((question, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleRecommendedQuestion(question)}
                                                                className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold border-2 transition-colors"
                                                                style={{
                                                                    borderColor: idx % 2 === 0 ? `${ORANGE}55` : `${BLUE}55`,
                                                                    color:        idx % 2 === 0 ? ORANGE : BLUE,
                                                                    backgroundColor: idx % 2 === 0 ? `${ORANGE}0D` : `${BLUE}0D`,
                                                                }}
                                                            >
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
                        ))
                    )}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-surface border-2 border-line rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white"
                                        style={{ backgroundColor: BLUE }}>
                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ORANGE, animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: BLUE, animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: ORANGE, animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ============== INPUT AREA ============== */}
                <div className="p-4 bg-surface border-t-2 border-line flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                blockedByLimit ? "Message limit reached"
                                : (propertyId ? "Ask a question about your analytics..." : "Please select a property first")
                            }
                            disabled={!propertyId || isLoading || blockedByLimit}
                            className="flex-1 px-4 h-11 rounded-xl border-2 text-[13.5px] focus:outline-none transition-colors disabled:bg-surface-hover disabled:cursor-not-allowed text-content placeholder:text-content-subtle"
                            style={{ borderColor: "rgb(var(--border-strong))" }}
                            onFocus={(e) => { if (!e.target.disabled) { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.18)`; } }}
                            onBlur={(e) => { e.target.style.borderColor = "rgb(var(--border-strong))"; e.target.style.boxShadow = "none"; }}
                        />
                        {/* Send button — solid orange (no gradient) */}
                        <button
                            onClick={handleSend}
                            disabled={!inputMessage.trim() || !propertyId || isLoading || blockedByLimit}
                            className="px-5 h-11 rounded-xl font-bold text-[13.5px] text-white inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{
                                backgroundColor: ORANGE,
                                boxShadow: "0 10px 22px -8px rgba(249,115,22,0.55)",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Sending</span>
                                </>
                            ) : (
                                <>
                                    <span>Send</span>
                                    <Send size={15} strokeWidth={2.4} />
                                </>
                            )}
                        </button>
                    </div>

                    {!propertyId && (
                        <p className="text-[11.5px] text-red-600 dark:text-red-400 mt-2 inline-flex items-center gap-1.5">
                            <AlertCircle size={13} strokeWidth={2.4} />
                            Please select an account and property above before asking questions
                        </p>
                    )}

                    {propertyId && !blockedByLimit && (
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10.5px] text-content-subtle inline-flex items-center gap-1.5">
                                <ShieldCheck size={11} style={{ color: BLUE }} strokeWidth={2.4} />
                                Read-only access · queries metered live
                            </span>
                            {usage?.chatbot && !usage.chatbot.unlimited && (
                                <span className="text-[10.5px] font-mono tabular-nums text-content-subtle font-semibold">
                                    {usage.chatbot.used} / {usage.chatbot.limit} this month
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ChatbotLimitModal
                isOpen={limitReached || blockedByLimit}
                onClose={dismissLimit}
                onRequestMore={() => { window.location.href = 'mailto:data.analytics@analyticsliv.com?subject=Chatbot%20limit%20increase'; }}
                chatbotCount={limitInfo?.chatbotCount ?? usage?.chatbot?.used ?? 0}
                chatbotLimit={limitInfo?.chatbotLimit ?? usage?.chatbot?.limit ?? 0}
            />
        </div>
    );
};

export default ChatbotModal;
