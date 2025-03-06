'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccountStore } from './store/useAccountStore';
import { signOut } from "next-auth/react";
import AuthWrapper from "./Components/AuthWrapper";
import { getUserSession } from './utils/user';

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
    selectProperty
  } = useAccountStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const dropdownRef = useRef(null);

  const userName = getUserSession();

  useEffect(() => {
    const userData = { given_name: userName?.user?.name };
    setLoadingAccounts(true);
    fetchAccountSummaries(userData).finally(() => setLoadingAccounts(false));
  }, [fetchAccountSummaries]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("accessToken");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthWrapper>
      <div className="p-6 flex flex-col items-center gap-3">
        <h1 className="text-2xl mb-4">Select Account and Property</h1>

        <div className="relative mb-4 w-[400px]" ref={dropdownRef}>
          <div
            className={`p-2 border border-[#7380ec] rounded-[8px] w-full flex justify-between items-center ${loadingAccounts ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !loadingAccounts && setDropdownOpen(!dropdownOpen)}
          >
            <span>
              {loadingAccounts ? 'Loading accounts...' : selectedAccount ? selectedAccount.displayName : '- Select an account -'}
            </span>
            <span className="text-gray-500">▾</span>
          </div>

          {dropdownOpen && !loadingAccounts && (
            <div className="absolute z-10 border border-gray-400 bg-white rounded w-full mt-0 max-h-60 overflow-y-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-2 py-1 border-b border-b-gray-400 w-full"
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div>
                {accounts.filter(acc => acc?.displayName?.toLowerCase()?.includes(searchTerm.toLowerCase()))?.map(account => (
                  <div
                    key={account?.account}
                    onClick={() => {
                      selectAccount(account);
                      setLoadingProperties(true);
                      fetchPropertySummaries(account.account).finally(() => setLoadingProperties(false));
                      setDropdownOpen(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {account?.displayName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Dropdown */}
        <select
          onChange={(e) => {
            const property = properties.find(prop => prop.name === e.target.value);
            selectProperty(property);
          }}
          disabled={!accountSelected || loadingProperties}
          className={`p-2 border border-[#7380ec] rounded-[8px] mb-4 w-[400px] disabled:cursor-not-allowed`}
        >
          <option value="">
            {loadingProperties ? 'Loading properties...' : '- Select a property -'}
          </option>
          {properties?.map(property => (
            <option key={property?.name} value={property?.name}>
              {property?.displayName}
            </option>
          ))}
        </select>

        {/* Submit Button */}
        <button
          onClick={() => alert(`Account: ${selectedAccount?.displayName}\nProperty: ${selectedProperty?.displayName}`)}
          disabled={!accountSelected || !propertySelected || loadingAccounts || loadingProperties}
          className={`p-2 w-[400px] rounded-[8px] ${accountSelected && propertySelected && !loadingAccounts && !loadingProperties ? 'bg-[#7380ec] hover:bg-[#6d79e5] text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Submit
        </button>
      </div>
    </AuthWrapper>
  );
};

export default Home;
