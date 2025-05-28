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

  const user = getUserSession();
  const router = useRouter();

  useEffect(() => {
    if (!hasFetchedAccounts) {
      // Fetch accounts only if they haven’t been fetched before
      const userData = { given_name: user };
      setLoadingAccounts(true);
      fetchAccountSummaries(userData, router).finally(() =>
        setLoadingAccounts(false)
      );
    } else {
      setLoadingAccounts(false);
    }
  }, [fetchAccountSummaries, hasFetchedAccounts]);

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

    setTimeout(() => {
      setReadyToRunAudit(true);
      setAuditCompleted(false);
      setAuditRunCompleted(false);
      router.push("/auditPreview");
    }, 500);
  };

  return (
    <AuthWrapper>
      <div className="p-6 flex flex-col items-center gap-3">
        <h1 className="text-2xl mb-4">Select Account and Property</h1>

        <div className="relative mb-4 w-[400px]" ref={dropdownRef}>
          <div
            className={`pl-2.5 pr-1 py-1.5 border border-[#7380ec] rounded-[8px] w-full flex justify-between items-center bg-white ${
              loadingAccounts ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !loadingAccounts && setDropdownOpen(!dropdownOpen)}
          >
            <span>
              {loadingAccounts
                ? "Loading accounts..."
                : selectedAccount
                ? selectedAccount?.displayName
                : "- Select an account -"}
            </span>
            <span className="text-gray-500">
              <img
                src="/Dropdown.png"
                alt="DropDown arrow"
                className="h-2.5 w-2.5"
              />
            </span>
          </div>

          {dropdownOpen && !loadingAccounts && (
            <div className="absolute z-10 border border-gray-400 bg-white rounded w-full mt-0 max-h-60 overflow-y-auto">
              <div className="sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="Search account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-2 py-1 border-b border-b-gray-400 w-full"
                />
              </div>
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
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {account?.displayName}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Property Dropdown */}
        <select
          onChange={handleProperty}
          disabled={!accountSelected || loadingProperties}
          value={selectedProperty?.name || ""}
          className={`p-2 border border-[#7380ec] rounded-[8px] mb-4 w-[400px] disabled:cursor-not-allowed`}
        >
          <option value="">
            {loadingProperties
              ? "Loading properties..."
              : "- Select a property -"}
          </option>
          {properties?.map((property) => (
            <option key={property?.name} value={property?.name}>
              {property?.displayName}
            </option>
          ))}
        </select>

        {/* date range picker */}
        <div className="mb-6 w-[400px] bg-white p-4 rounded-xl shadow flex flex-col gap-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Select a 30-day Date Range
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                maxDate={new Date()}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7380ec]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                maxDate={new Date()}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7380ec]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            !accountSelected ||
            !selectedProperty ||
            loadingAccounts ||
            loadingProperties ||
            loading
          }
          className={`p-2 w-[400px] rounded-[8px] ${
            accountSelected &&
            selectedProperty &&
            !loadingAccounts &&
            !loadingProperties &&
            !loading
              ? "bg-[#7380ec] hover:bg-[#6d79e5] text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>
    </AuthWrapper>
  );
};

export default Home;
