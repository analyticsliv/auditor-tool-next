"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "./store/useAccountStore";
import { signOut, useSession } from "next-auth/react";
import AuthWrapper from "./Components/AuthWrapper";
import { getUserSession } from "./utils/user";
import { callApis } from "./utils/callApis";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { addDays, subDays } from "date-fns";
import AuditLimitModal from "./Components/AuditLimitModal";
import ContactFormModal from "./Components/ContactFormModal";
import { checkAuditCount } from "./utils/Auditcountutils";
import ChatbotModal from "./Components/ChatbotModal";

const Home = () => {
  const {
    accounts,
    properties,
    selectedAccount,
    selectedProperty,
    accountSelected,
    propertySelected,
    fetchAccountSummaries,
    fetchPropertySummaries,
    selectAccount,
    selectProperty,
    loading,
    setLoading,
    hasFetchedAccounts,
    setAuditCompleted,
    setReadyToRunAudit,
    setAuditRunCompleted,
    setDateRange,
    dateRange,
    isEcommerce,
    setIsEcommerce,
  } = useAccountStore();
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);
  const [auditCount, setAuditCount] = useState(0);
  const [auditLimit, setAuditLimit] = useState(5);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [checkingAuditLimit, setCheckingAuditLimit] = useState(false);

  const isValidDateRange = (start, end) => {
    if (!start || !end) return false;
    const diff = moment(end).diff(moment(start), "days");
    const today = moment().endOf("day");
    return diff === 29 && moment(end).isSameOrBefore(today);
  };

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const dropdownRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const user = getUserSession();
  const router = useRouter();

  useEffect(() => {
    const loadAuditCount = async () => {
      if (session?.user?.email) {
        const result = await checkAuditCount(session.user.email);
        if (result.success) {
          setAuditCount(result.data.auditCount);
          setAuditLimit(result.data.auditLimit);
        }
      }
    };
    loadAuditCount();
  }, [session]);

  useEffect(() => {
    if (!hasFetchedRef.current && !hasFetchedAccounts && session) {
      hasFetchedRef.current = true; // prevent future executions
      const userData = { given_name: user };
      setLoadingAccounts(true);
      fetchAccountSummaries(userData, router).finally(() =>
        setLoadingAccounts(false)
      );
    } else {
      setLoadingAccounts(false);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccount = (account) => {
    selectAccount(account);
    setLoadingProperties(true);
    fetchPropertySummaries(account?.account).finally(() =>
      setLoadingProperties(false)
    );
    setDropdownOpen(false);
  };

  const handleProperty = (e) => {
    const propertyName = e.target.value;
    if (propertyName === "") {
      selectProperty(null);
    } else {
      const property = properties?.find((prop) => prop.name === propertyName);
      selectProperty(property);
    }
  };

  // handleSubmit to check AND set state:
  const handleSubmit = async () => {
    if (!isValidDateRange(startDate, endDate)) {
      alert("Please select a valid 30-day date range before submitting.");
      return;
    }

    setCheckingAuditLimit(true);

    const result = await checkAuditCount(session?.user?.email);

    if (!result.success) {
      alert("Failed to verify audit limit. Please try again.");
      setCheckingAuditLimit(false);
      return;
    }

    // Update state with current counts
    setAuditCount(result.data.auditCount);
    setAuditLimit(result.data.auditLimit);

    if (result.data.hasReachedLimit) {
      setShowLimitModal(true);
      setCheckingAuditLimit(false);
      return;
    }

    setCheckingAuditLimit(false);

    const formattedStart = moment(startDate).format("YYYY-MM-DD");
    const formattedEnd = moment(endDate).format("YYYY-MM-DD");

    await setDateRange(formattedStart, formattedEnd);

    useAccountStore.getState().setAuditData("__dateRange__", {
      startDate: formattedStart,
      endDate: formattedEnd,
    });

    setTimeout(() => {
      setReadyToRunAudit(true);
      setAuditCompleted(false);
      setAuditRunCompleted(false);
      router.push("/auditPreview");
    }, 500);
  };

  const today = new Date();

  const maxStartDate = subDays(today, 31);
  const maxEndDate = subDays(today, 2);

  const handleDateChange = (date) => {
    setStartDate(date)
    setEndDate(addDays(date, 29))
  }

  const handleEmdDateChange = (date) => {
    setEndDate(date)
    setStartDate(subDays(date, 29))
  }

  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

        {/* Header */}
        <div className="text-center flex-shrink-0 pt-5 pb-1">
          <div className="flex justify-center items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Setup</h1>
          </div>
          <p className="text-gray-600 mt-2">Choose your account and property</p>
          <div className="mt-3 inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              Audits Used: <span className={auditCount >= auditLimit ? "text-red-600" : "text-blue-600"}>{auditCount}</span> / {auditLimit}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex w-full flex-col px-4 py-6 overflow-hidden flex-1 items-center justify-center">

          {/* Single Unified Panel */}
          <div className="bg-white/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/50 px-10 py-10 max-w-3xl w-full relative overflow-hidden">

            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

            {/* Step Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-center">
                {/* Step 1 - Account */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${accountSelected ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                    {accountSelected ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white font-bold text-lg">1</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2.5 font-semibold ${accountSelected ? 'text-green-600' : 'text-blue-600'}`}>
                    Account
                  </span>
                </div>

                {/* Connector Line */}
                <div className={`w-20 md:w-28 h-1.5 mx-3 transition-all duration-300 rounded-full ${accountSelected ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
                  }`}></div>

                {/* Step 2 - Property */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${selectedProperty ? 'bg-gradient-to-br from-green-500 to-green-600' : accountSelected ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-300'
                    }`}>
                    {selectedProperty ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`font-bold text-lg ${accountSelected ? 'text-white' : 'text-gray-500'}`}>2</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2.5 font-semibold ${selectedProperty ? 'text-green-600' : accountSelected ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    Property
                  </span>
                </div>

                {/* Connector Line */}
                <div className={`w-20 md:w-28 h-1.5 mx-3 transition-all duration-300 rounded-full ${selectedProperty ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
                  }`}></div>

                {/* Step 3 - Date Range */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${startDate && endDate ? 'bg-gradient-to-br from-green-500 to-green-600' : selectedProperty ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-300'
                    }`}>
                    {startDate && endDate ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`font-bold text-lg ${selectedProperty ? 'text-white' : 'text-gray-500'}`}>3</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2.5 font-semibold ${startDate && endDate ? 'text-green-600' : selectedProperty ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    Date Range
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-5">
              {/* Account Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Google Analytics Account
                </label>

                <div className="relative" ref={dropdownRef}>
                  <div
                    className={`px-5 py-3.5 border-2 border-gray-200 rounded-xl w-full flex justify-between items-center bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md focus-within:border-blue-500 focus-within:shadow-lg ${loadingAccounts ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                      }`}
                    onClick={() => !loadingAccounts && setDropdownOpen(!dropdownOpen)}
                  >
                    <span className={`${selectedAccount ? "text-gray-800 font-medium" : "text-gray-500"} text-sm`}>
                      {loadingAccounts ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                          Loading accounts...
                        </div>
                      ) : selectedAccount ? (
                        selectedAccount?.displayName
                      ) : (
                        "Select an account"
                      )}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {dropdownOpen && !loadingAccounts && (
                    <div className="absolute z-20 mt-0.5 border border-gray-200 bg-white rounded-xl w-full shadow-2xl max-h-72 overflow-hidden">
                      <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-100">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {accounts
                          ?.filter((acc) =>
                            acc?.displayName
                              ?.toLowerCase()
                              ?.includes(searchTerm.toLowerCase())
                          )
                          ?.map((account) => (
                            <div
                              key={account?.account}
                              onClick={() => handleAccount(account)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 text-sm"
                            >
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                {account?.displayName}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Property
                </label>

                <div className="relative">
                  <select
                    onChange={handleProperty}
                    disabled={!accountSelected || loadingProperties}
                    value={selectedProperty?.name || ""}
                    className="px-5 py-3.5 border-2 border-gray-200 rounded-xl w-full bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200 hover:border-blue-400 hover:shadow-md text-sm font-medium text-gray-700"
                  >
                    <option value="">
                      {loadingProperties ? (
                        "Loading properties..."
                      ) : !accountSelected ? (
                        "Select an account first"
                      ) : (
                        "Select a property"
                      )}
                    </option>
                    {properties?.map((property) => (
                      <option key={property?.name} value={property?.name}>
                        {property?.displayName}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {loadingProperties && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ecommerce Checkbox */}
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="ecommerce"
                      checked={isEcommerce}
                      onChange={(e) => setIsEcommerce(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="ecommerce" className="cursor-pointer flex items-center flex-1">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-800">
                        Include E-commerce Data
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Date Range Section */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date Range
                </label>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border-2 border-green-100 hover:shadow-md transition-all duration-200">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-gray-600">Start Date</label>
                      <input
                        type="date"
                        value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleDateChange(new Date(e.target.value))}
                        max={moment(maxStartDate).format('YYYY-MM-DD')}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm font-medium"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-gray-600">End Date</label>
                      <input
                        type="date"
                        value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleEmdDateChange(new Date(e.target.value))}
                        max={moment(maxEndDate).format('YYYY-MM-DD')}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Compact Date Info */}
                  <div className="flex items-center mt-4 text-xs text-blue-700 bg-blue-50/70 rounded-lg px-3 py-2.5 border border-blue-200">
                    <svg className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Must be exactly 30 days and cannot include today or yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Button */}
        <div className="flex-shrink-0 px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={
                !accountSelected ||
                !selectedProperty ||
                loadingAccounts ||
                loadingProperties ||
                loading ||
                checkingAuditLimit
              }
              className={`w-full py-3.5 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 shadow-xl ${accountSelected &&
                selectedProperty &&
                !loadingAccounts &&
                !loadingProperties &&
                !loading ||
                !checkingAuditLimit
                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white focus:ring-blue-300 shadow-blue-300/50"
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-200"
                }`}
            >
              {loading || checkingAuditLimit ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Continue to Audit</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuditLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onRequestMore={() => {
          setShowLimitModal(false);
          setShowContactModal(true);
        }}
        auditCount={auditCount}
        auditLimit={auditLimit}
      />

      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        userEmail={session?.user?.email}
      />

      <ChatbotModal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />

      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-40"
        aria-label="Open chatbot"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
      </button>
    </AuthWrapper>
  );
};

export default Home;