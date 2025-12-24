"use client";

import { useState, useEffect, useRef } from "react";
import { useChatbot } from "../utils/useChatbot";
import { useAccountStore } from "../store/useAccountStore";

const ChatbotModal = ({ isOpen, onClose }) => {
    const [inputMessage, setInputMessage] = useState("");
    const { messages, isLoading, sendMessage, clearMessages } = useChatbot();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Separate state for chatbot selections (independent from home page)
    const [chatbotSelectedAccount, setChatbotSelectedAccount] = useState(null);
    const [chatbotSelectedProperty, setChatbotSelectedProperty] = useState(null);
    const [chatbotProperties, setChatbotProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Get accounts from store (already fetched on home page)
    const { accounts, fetchPropertySummaries } = useAccountStore();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
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
        setChatbotSelectedProperty(null); // Reset property when account changes
        setDropdownOpen(false);
        setLoadingProperties(true);

        try {
            // Fetch properties for selected account
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

    const handleSend = async () => {
        if (!inputMessage.trim() || !chatbotSelectedProperty || isLoading) return;

        const propertyId = chatbotSelectedProperty?.name?.split('/')[1];
        await sendMessage(inputMessage, propertyId);
        setInputMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRecommendedQuestion = async (question) => {
        if (!chatbotSelectedProperty) return;

        setInputMessage(question);
        const propertyId = chatbotSelectedProperty?.name?.split('/')[1];
        await sendMessage(question, propertyId);
        setInputMessage("");
    };

    const handleClose = () => {
        clearMessages();
        setInputMessage("");
        onClose();
    };

    if (!isOpen) return null;

    const propertyId = chatbotSelectedProperty?.name?.split('/')[1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">GA4 Assistant</h2>
                                <p className="text-white/80 text-sm mt-0.5">
                                    {chatbotSelectedProperty ? `Analytics for: ${chatbotSelectedProperty.displayName}` : "Select account & property to start chatting"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Account & Property Selection Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b-2 border-blue-100 flex-shrink-0">
                    <div className="flex gap-3">
                        {/* Account Dropdown */}
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Account</label>
                            <div
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl w-full flex justify-between items-center bg-white transition-all duration-200 hover:border-blue-400 cursor-pointer"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span className={`${chatbotSelectedAccount ? "text-gray-800 font-medium" : "text-gray-500"} text-sm`}>
                                    {chatbotSelectedAccount ? chatbotSelectedAccount.displayName : "Select account"}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {dropdownOpen && (
                                <div className="absolute z-20 mt-1 border border-gray-200 bg-white rounded-xl w-full shadow-2xl max-h-64 overflow-hidden">
                                    <div className="sticky top-0 bg-white z-10 p-2 border-b border-gray-100">
                                        <input
                                            type="text"
                                            placeholder="Search accounts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-3 pr-3 py-1.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {accounts
                                            ?.filter((acc) =>
                                                acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase())
                                            )
                                            ?.map((account) => (
                                                <div
                                                    key={account?.account}
                                                    onClick={() => handleAccountSelect(account)}
                                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 text-sm"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                        {account?.displayName}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property Dropdown */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Property</label>
                            <div className="relative">
                                <select
                                    onChange={handlePropertySelect}
                                    disabled={!chatbotSelectedAccount || loadingProperties}
                                    value={chatbotSelectedProperty?.name || ""}
                                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl w-full bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200 hover:border-blue-400 text-sm font-medium text-gray-700"
                                >
                                    <option value="">
                                        {loadingProperties ? "Loading properties..." : !chatbotSelectedAccount ? "Select account first" : "Select property"}
                                    </option>
                                    {chatbotProperties?.map((property) => (
                                        <option key={property?.name} value={property?.name}>
                                            {property?.displayName}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {loadingProperties && (
                                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to GA4 Assistant!</h3>
                            <p className="text-gray-600 max-w-md mb-6">
                                {chatbotSelectedProperty
                                    ? "Ask me anything about your Google Analytics data. I can help you understand your metrics, analyze trends, and answer questions about your website performance."
                                    : "Please select an account and property above to start chatting with the assistant."
                                }
                            </p>
                            {chatbotSelectedProperty && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                                    <button
                                        onClick={() => handleRecommendedQuestion("How many active users yesterday?")}
                                        className="px-4 py-3 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left"
                                    >
                                        <span className="text-sm font-semibold text-gray-700">📊 Active users yesterday</span>
                                    </button>
                                    <button
                                        onClick={() => handleRecommendedQuestion("Show top traffic sources")}
                                        className="px-4 py-3 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all text-left"
                                    >
                                        <span className="text-sm font-semibold text-gray-700">🔍 Top traffic sources</span>
                                    </button>
                                    <button
                                        onClick={() => handleRecommendedQuestion("What are the most viewed pages?")}
                                        className="px-4 py-3 bg-white border-2 border-pink-200 rounded-xl hover:border-pink-400 hover:shadow-md transition-all text-left"
                                    >
                                        <span className="text-sm font-semibold text-gray-700">📄 Most viewed pages</span>
                                    </button>
                                    <button
                                        onClick={() => handleRecommendedQuestion("Show conversion rate trends")}
                                        className="px-4 py-3 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all text-left"
                                    >
                                        <span className="text-sm font-semibold text-gray-700">📈 Conversion trends</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id}>
                                {message.type === "user" ? (
                                    <div className="flex justify-end">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-lg">
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ) : message.type === "error" ? (
                                    <div className="flex justify-start">
                                        <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl rounded-tl-sm px-5 py-3 max-w-[80%]">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[80%] shadow-md">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                                                        {message.content}
                                                    </p>

                                                    {/* Show GA4 Data if available */}
                                                    {message.data?.ga4_dataframe && message.data.ga4_dataframe.length > 0 && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <p className="text-xs font-semibold text-blue-900 mb-2">📊 Data Summary:</p>
                                                            {message.data.ga4_dataframe.map((row, idx) => (
                                                                <div key={idx} className="text-xs text-blue-800">
                                                                    {Object.entries(row).map(([key, value]) => (
                                                                        <span key={key} className="mr-3">
                                                                            <strong>{key}:</strong> {value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Response Time */}
                                                    {message.data?.response_time && (
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            ⚡ Responded in {message.data.response_time.toFixed(2)}s
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Recommended Questions */}
                                            {message.recommendedQuestions && message.recommendedQuestions.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">💡 You might also ask:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {message.recommendedQuestions.map((question, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleRecommendedQuestion(question)}
                                                                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all"
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

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t-2 border-gray-200 flex-shrink-0">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={propertyId ? "Ask a question about your analytics..." : "Please select a property first"}
                            disabled={!propertyId || isLoading}
                            className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputMessage.trim() || !propertyId || isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>

                    {!propertyId && (
                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Please select an account and property above before asking questions
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatbotModal;