import React, { useState } from "react";
import { Smile, Frown, Calendar, Info, Clock } from "lucide-react";
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
      <div className="text-center text-[#7380ec] font-extrabold text-[1.8rem]">
        {selectedAccount?.displayName || accountNameFromAudit || "Account"} Google Analytics Audit Report
      </div>
      <div className="parent-div bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg rounded-3xl p-10 mt-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-gray-800 font-extrabold text-[1.8rem] text-center">
            Information
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-center">
          {/* Status Indicators */}
          <div className="lg:col-span-2 space-y-4">

            {/* Status Cards */}
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${status === "fine"
                  ? "bg-green-50 border-green-200 shadow-md"
                  : "bg-white border-slate-200 hover:border-green-200"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500" >
                    <Smile className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Everything is Fine
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${status === "fine"
                  ? "bg-red-50 border-red-200 shadow-md"
                  : "bg-white border-slate-200 hover:border-red-200"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-500">
                    <Frown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      There is Some Issue
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Range Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Date Range Information
                  </h3>
                  <p className="text-sm text-blue-700">
                    We are using 30 days of data in most reports, except anomaly
                    detection reports.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Display */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Date Range</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">
                    Start Date:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {startDate}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">
                    End Date:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {endDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="parent-div bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div className="bg-gradient-to-r from-[#a0a0ff] via-[#9999ff] to-[#9a9aff] px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              {/* <h1 className="text-4xl font-bold tracking-tight text-center"> */}
              <h1 className="text-white font-extrabold text-[1.8rem] text-center">
                In Review
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
                <div className="group p-5 w-[50%] bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                          Account
                        </h3>
                        <div className="h-px bg-slate-300 flex-1"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 truncate mb-2 h-8">
                          {selectedAccount?.displayName || accountNameFromAudit || "Not Selected"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">
                            ID:
                          </span>
                          <div className="px-2 py-1 flex items-center justify-center bg-slate-200 text-slate-700 rounded text-xs font-mono">
                            {accountId || accountIdFromAudit || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="group p-5 w-[50%] bg-gradient-to-r from-slate-50 to-green-50 rounded-2xl border border-slate-200 hover:border-green-300 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                          Property
                        </h3>
                        <div className="h-px bg-slate-300 flex-1"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 truncate mb-2 h-8">
                          {selectedProperty?.displayName || propertyNameFromAudit || "Not Selected"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">
                            ID:
                          </span>
                          <div className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-mono">
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
