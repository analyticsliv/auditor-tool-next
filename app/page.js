"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "./store/useAccountStore";
import { signOut, useSession } from "next-auth/react";
import AuthWrapper from "./Components/AuthWrapper";
import { getUserSession } from "./utils/user";
import { callApis } from "./utils/callApis";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { addDays, subDays } from "date-fns";

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
  } = useAccountStore();
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);

  const isValidDateRange = (start, end) => {
    if (!start || !end) return false;
    const diff = moment(end).diff(moment(start), "days");
    const today = moment().endOf("day");
    return diff === 29 && moment(end).isSameOrBefore(today);
  };

  const updateDateRangeInStore = (newStart, newEnd) => {
    setDateRange(
      moment(newStart).format("YYYY-MM-DD"),
      moment(newEnd).format("YYYY-MM-DD")
    );
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

  const dropdownRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const user = getUserSession();
  const router = useRouter();

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

  const handleSubmit = async () => {
    if (!isValidDateRange(startDate, endDate)) {
      alert("Please select a valid 30-day date range before submitting.");
      return;
    }

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
      <div className="flex flex-col">

        {/* Header */}
        <div className="text-center flex-shrink-0">
          <div className="flex justify-center items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 2xl:w-12 h-10 2xl:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-2 2xl:mb-3 shadow-lg">
              <svg className="w-5 2xl:w-6 h-5 2xl:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Analytics Setup</h1>
          </div>
          <p className="text-gray-600 text-sm">Configure your account and property settings</p>
        </div>

        {/* Main Content Area - Split Layout */}
        <div className="flex w-full flex-col md:flex-row gap-4 px-4 p-6 overflow-hidden">

          {/* Left Panel - Account & Property */}
          <div className="md:w-[50%] 2xl:flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 2xl:py-6 flex flex-col 2xl:justify-between">
            <div className="flex items-center mb-4 2xl:mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-10h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Account & Property</h2>
            </div>

            <div className="space-y-3 2xl:space-y-6 flex-1">
              {/* Account Selection */}
              <div className="space-y-1.5 2xl:space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Google Analytics Account
                </label>

                <div className="relative" ref={dropdownRef}>
                  <div
                    className={`px-4 py-3 border-2 border-gray-200 rounded-xl w-full flex justify-between items-center bg-white transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 ${loadingAccounts ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                      }`}
                    onClick={() => !loadingAccounts && setDropdownOpen(!dropdownOpen)}
                  >
                    <span className={`${selectedAccount ? "text-gray-800" : "text-gray-500"} text-sm`}>
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
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {dropdownOpen && !loadingAccounts && (
                    <div className="absolute z-20 mt-2 border border-gray-200 bg-white rounded-xl w-full shadow-xl max-h-48 2xl:h-64 overflow-hidden">
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
                            className="pl-10 pr-4 py-1 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-32 overflow-y-auto">
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
                              className="px-4 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors duration-150 text-sm"
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
              <div className="space-y-1.5 2xl:space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Property
                </label>

                <div className="relative">
                  <select
                    onChange={handleProperty}
                    disabled={!accountSelected || loadingProperties}
                    value={selectedProperty?.name || ""}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl w-full bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200 hover:border-blue-300 text-sm"
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

              {/* Status Indicators */}
              <div className="bg-gray-50 rounded-lg px-4 py-2 2xl:py-4 mt-auto">
                <div className="space-y-2 2xl:space-y-4">
                  <div className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded-full mr-3 ${accountSelected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={accountSelected ? 'text-green-700' : 'text-gray-500'}>
                      Account {accountSelected ? 'Selected' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded-full mr-3 ${selectedProperty ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={selectedProperty ? 'text-green-700' : 'text-gray-500'}>
                      Property {selectedProperty ? 'Selected' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Date Range */}
          <div className="md:w-[50%] 2xl:flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 2xl:py-6 flex flex-col">
            <div className="flex items-center mb-3 2xl:mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Date Range</h2>
            </div>

            <div className="space-y-3 2xl:space-y-4 flex-1">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
                <div className="space-y-4">
                  <div className="flex justify-center items-center gap-5 w-full">
                    <div className="space-y-1.5 2xl:space-y-6 w-[50%]">
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleDateChange(new Date(e.target.value))}
                          max={moment(maxStartDate).format('YYYY-MM-DD')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 2xl:space-y-6 w-[50%]">
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={endDate ? moment(endDate).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleEmdDateChange(new Date(e.target.value))}
                          max={moment(maxEndDate).format('YYYY-MM-DD')}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                <svg className="w-4 h-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Date Range Requirements:</p>
                  <ul className="space-y-[1px] 2xl:space-y-1">
                    <li>• Must be exactly 30 days</li>
                    <li>• Cannot include today or yesterday</li>
                    <li>• End date automatically adjusts</li>
                  </ul>
                </div>
              </div>

              {/* Date Status */}
              <div className="bg-gray-50 rounded-lg py-2 px-4 mt-auto">
                <div className="flex items-center text-sm">
                  <div className={`w-3 h-3 rounded-full mr-3 ${startDate && endDate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={startDate && endDate ? 'text-green-700' : 'text-gray-500'}>
                    Date Range {startDate && endDate ? 'Configured' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Button */}
        <div className="flex-shrink-0 px-4">
          <div className="w-max mx-auto">
            <button
              onClick={handleSubmit}
              disabled={
                !accountSelected ||
                !selectedProperty ||
                loadingAccounts ||
                loadingProperties ||
                loading
              }
              className={`w-full py-2 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 shadow-lg ${accountSelected &&
                selectedProperty &&
                !loadingAccounts &&
                !loadingProperties &&
                !loading
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-200 shadow-blue-200"
                : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-gray-100"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Continue to Audit</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Home;











// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useAccountStore } from "./store/useAccountStore";
// import { signOut, useSession } from "next-auth/react";
// import AuthWrapper from "./Components/AuthWrapper";
// import { getUserSession } from "./utils/user";
// import { callApis } from "./utils/callApis";
// import { useRouter } from "next/navigation";

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import moment from "moment";
// import { addDays, subDays } from "date-fns";

// const Home = () => {
//   const {
//     accounts,
//     properties,
//     selectedAccount,
//     selectedProperty,
//     accountSelected,
//     propertySelected,
//     fetchAccountSummaries,
//     fetchPropertySummaries,
//     selectAccount,
//     selectProperty,
//     loading,
//     setLoading,
//     hasFetchedAccounts,
//     setAuditCompleted,
//     setReadyToRunAudit,
//     setAuditRunCompleted,
//     setDateRange,
//     dateRange,
//   } = useAccountStore();
//   const [startDate, setStartDate] = useState(dateRange.startDate);
//   const [endDate, setEndDate] = useState(dateRange.endDate);

//   const isValidDateRange = (start, end) => {
//     if (!start || !end) return false;
//     const diff = moment(end).diff(moment(start), "days");
//     const today = moment().endOf("day");
//     return diff === 29 && moment(end).isSameOrBefore(today);
//   };

//   const updateDateRangeInStore = (newStart, newEnd) => {
//     setDateRange(
//       moment(newStart).format("YYYY-MM-DD"),
//       moment(newEnd).format("YYYY-MM-DD")
//     );
//   };

//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [loadingAccounts, setLoadingAccounts] = useState(true);
//   const [loadingProperties, setLoadingProperties] = useState(false);

//   const dropdownRef = useRef(null);

//   const user = getUserSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (!hasFetchedAccounts && session) {
//       // Fetch accounts only if they haven’t been fetched before
//       const userData = { given_name: user };
//       setLoadingAccounts(true);
//       fetchAccountSummaries(userData, router).finally(() =>
//         setLoadingAccounts(false)
//       );
//     } else {
//       setLoadingAccounts(false);
//     }
//   }, [fetchAccountSummaries, hasFetchedAccounts, session]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleAccount = (account) => {
//     selectAccount(account);
//     setLoadingProperties(true);
//     fetchPropertySummaries(account?.account).finally(() =>
//       setLoadingProperties(false)
//     );
//     setDropdownOpen(false);
//   };

//   const handleProperty = (e) => {
//     const propertyName = e.target.value;
//     if (propertyName === "") {
//       selectProperty(null);
//     } else {
//       const property = properties?.find((prop) => prop.name === propertyName);
//       selectProperty(property);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!isValidDateRange(startDate, endDate)) {
//       alert("Please select a valid 30-day date range before submitting.");
//       return;
//     }

//     const formattedStart = moment(startDate).format("YYYY-MM-DD");
//     const formattedEnd = moment(endDate).format("YYYY-MM-DD");

//     await setDateRange(formattedStart, formattedEnd);

//     useAccountStore.getState().setAuditData("__dateRange__", {
//       startDate: formattedStart,
//       endDate: formattedEnd,
//     });

//     setTimeout(() => {
//       setReadyToRunAudit(true);
//       setAuditCompleted(false);
//       setAuditRunCompleted(false);
//       router.push("/auditPreview");
//     }, 500);
//   };
//   const today = new Date();

//   const maxStartDate = subDays(today, 31);
//   const maxEndDate = subDays(today, 2);

//   const handleDateChange = (date) => {
//     setStartDate(date)
//     setEndDate(addDays(date, 29))
//   }

//   const handleEmdDateChange = (date) => {
//     setEndDate(date)
//     setStartDate(subDays(date, 29))
//   }


//   return (
//     <AuthWrapper>
//       <div className="p-6 flex flex-col items-center gap-3">
//         <h1 className="text-2xl mb-4">Select Account and Property</h1>

//         <div className="relative mb-4 w-[400px]" ref={dropdownRef}>
//           <div
//             className={`pl-2.5 pr-1 py-1.5 border border-[#7380ec] rounded-[8px] w-full flex justify-between items-center bg-white ${loadingAccounts ? "cursor-not-allowed" : "cursor-pointer"
//               }`}
//             onClick={() => !loadingAccounts && setDropdownOpen(!dropdownOpen)}
//           >
//             <span>
//               {loadingAccounts
//                 ? "Loading accounts..."
//                 : selectedAccount
//                   ? selectedAccount?.displayName
//                   : "- Select an account -"}
//             </span>
//             <span className="text-gray-500">
//               <img
//                 src="/Dropdown.png"
//                 alt="DropDown arrow"
//                 className="h-2.5 w-2.5"
//               />
//             </span>
//           </div>

//           {dropdownOpen && !loadingAccounts && (
//             <div className="absolute z-10 border border-gray-400 bg-white rounded w-full mt-0 max-h-60 overflow-y-auto">
//               <div className="sticky top-0 bg-white z-10">
//                 <input
//                   type="text"
//                   placeholder="Search account..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="px-2 py-1 border-b border-b-gray-400 w-full"
//                 />
//               </div>
//               {accounts
//                 ?.filter((acc) =>
//                   acc?.displayName
//                     ?.toLowerCase()
//                     ?.includes(searchTerm.toLowerCase())
//                 )
//                 ?.map((account) => (
//                   <div
//                     key={account?.account}
//                     onClick={() => handleAccount(account)}
//                     className="p-2 hover:bg-gray-100 cursor-pointer"
//                   >
//                     {account?.displayName}
//                   </div>
//                 ))}
//             </div>
//           )}
//         </div>

//         {/* Property Dropdown */}
//         <select
//           onChange={handleProperty}
//           disabled={!accountSelected || loadingProperties}
//           value={selectedProperty?.name || ""}
//           className={`p-2 border border-[#7380ec] rounded-[8px] mb-4 w-[400px] disabled:cursor-not-allowed`}
//         >
//           <option value="">
//             {loadingProperties
//               ? "Loading properties..."
//               : "- Select a property -"}
//           </option>
//           {properties?.map((property) => (
//             <option key={property?.name} value={property?.name}>
//               {property?.displayName}
//             </option>
//           ))}
//         </select>

//         {/* date range picker */}
//         <div className="mb-6 w-[400px] bg-white p-4 rounded-xl shadow flex flex-col gap-4 border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">
//             Select a 30-day Date Range
//           </h2>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex flex-col">
//               <label className="text-sm text-gray-700 mb-1">Start Date</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={handleDateChange}
//                 // maxDate={new Date()}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={maxStartDate}
//                 dateFormat="yyyy-MM-dd"
//                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7380ec]"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-sm text-gray-700 mb-1">End Date</label>
//               <DatePicker
//                 selected={endDate}
//                 onChange={handleEmdDateChange}
//                 maxDate={maxEndDate}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 dateFormat="yyyy-MM-dd"
//                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7380ec]"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={
//             !accountSelected ||
//             !selectedProperty ||
//             loadingAccounts ||
//             loadingProperties ||
//             loading
//           }
//           className={`p-2 w-[400px] rounded-[8px] ${accountSelected &&
//             selectedProperty &&
//             !loadingAccounts &&
//             !loadingProperties &&
//             !loading
//             ? "bg-[#7380ec] hover:bg-[#6d79e5] text-white"
//             : "bg-gray-300 text-gray-600 cursor-not-allowed"
//             }`}
//         >
//           {loading ? "Loading..." : "Submit"}
//         </button>
//       </div>
//     </AuthWrapper>
//   );
// };

// export default Home;
