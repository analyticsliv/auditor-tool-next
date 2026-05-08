import React, { useState } from "react";
import { Smile, Frown, Meh, Calendar, Info, Clock } from "lucide-react";
import { useAccountStore } from "../store/useAccountStore";
import moment from "moment";
import { Eye, Building, Globe, ChevronRight } from "lucide-react";

const InfoComponent = ({ previousAudit }) => {
  const [status, setStatus] = useState("fine");
  const {
    selectedAccount,
    selectedProperty,
    accountId,
    propertyId,
    dateRange,
    accountNameFromAudit,
    accountIdFromAudit,
    propertyNameFromAudit,
    propertyIdFromAudit,
    auditData
  } = useAccountStore();

  const endDate = previousAudit ? auditData?.__dateRange__?.endDate : dateRange?.endDate;
  const startDate = previousAudit ? auditData?.__dateRange__?.startDate : dateRange?.startDate;

  return (
    <div>
      <div className="text-center text-[#7380ec] dark:text-[#a0a8ff] font-extrabold text-[1.8rem]">
        {selectedAccount?.displayName || accountNameFromAudit || "Account"} Google Analytics Audit Report
      </div>
      <div className="parent-div bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-line shadow-lg rounded-3xl p-10 mt-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/15 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-content font-extrabold text-[1.8rem] text-center">
            Information
          </h1>
        </div>

        <div className="grid grid-cols-4 xl:grid-cols-5 gap-6 items-center">
          {/* Status Indicators */}
          <div className="col-span-2 xl:col-span-3 space-y-4">

            {/* Status Cards */}
            <div className="space-y-5">
              <div
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${status === "fine"
                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 shadow-md"
                  : "bg-surface border-line hover:border-green-200 dark:hover:border-green-500/30"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500" >
                    <Smile className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-content">
                      Everything is Fine
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 ${status === "fine"
                  ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 shadow-md"
                  : "bg-surface border-line"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-500">
                    <Meh className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-content">
                      Needs Attention
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 ${status === "fine"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 shadow-md"
                  : "bg-surface border-line"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-500">
                    <Frown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-content">
                      There is Some Issue
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Date Range Display */}
          <div className="col-span-2 bg-surface rounded-xl border border-line p-4 h-fit">
            <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We are using 30 days of data in most reports, except anomaly
                detection reports.
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-content-muted" />
              <h3 className="font-semibold text-content">Date Range</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-line bg-surface-hover rounded-lg">
                  <span className="text-sm font-medium text-content-muted">
                    Start Date:
                  </span>
                  <span className="font-semibold text-content">
                    {startDate}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 border border-line bg-surface-hover rounded-lg">
                  <span className="text-sm font-medium text-content-muted">
                    End Date:
                  </span>
                  <span className="font-semibold text-content">
                    {endDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="parent-div bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="bg-surface rounded-3xl shadow-2xl border border-line">
          <div className="bg-gradient-to-r from-[#a0a0ff] via-[#9999ff] to-[#9a9aff] dark:from-[#4c4c8a] dark:via-[#454580] dark:to-[#404075] px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              {/* <h1 className="text-4xl font-bold tracking-tight text-center"> */}
              <h1 className="text-white font-extrabold text-[1.8rem] text-center">
                Account and Property Configuration
              </h1>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full"></div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Account Information */}
              <div className="flex w-full items-center gap-14">
                <div className="group p-5 w-[50%] bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/60 dark:to-blue-950/40 rounded-2xl border border-line hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/15 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-500/25 transition-colors">
                      <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-content-muted uppercase tracking-wide">
                          Account
                        </h3>
                        <div className="h-px bg-line-strong flex-1"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-content truncate mb-2 h-8">
                          {selectedAccount?.displayName || accountNameFromAudit || "Not Selected"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-content-subtle">
                            ID:
                          </span>
                          <div className="px-2 py-1 flex items-center justify-center bg-surface-hover text-content rounded text-xs font-mono">
                            {accountId || accountIdFromAudit || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="group p-5 w-[50%] bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800/60 dark:to-green-950/40 rounded-2xl border border-line hover:border-green-300 dark:hover:border-green-500/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-500/15 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-500/25 transition-colors">
                      <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-content-muted uppercase tracking-wide">
                          Property
                        </h3>
                        <div className="h-px bg-line-strong flex-1"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-content truncate mb-2 h-8">
                          {selectedProperty?.displayName || propertyNameFromAudit || "Not Selected"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-content-subtle">
                            ID:
                          </span>
                          <div className="px-2 py-1 bg-surface-hover text-content rounded text-xs font-mono">
                            {propertyId || propertyIdFromAudit || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoComponent;
