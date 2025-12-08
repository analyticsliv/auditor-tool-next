"use client";

import { useAccountStore } from "../store/useAccountStore";

const AnalyzerResults = () => {
  const { analyzerData } = useAccountStore();

  if (!analyzerData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-semibold">No analyzer data available</p>
          <p className="text-sm mt-2">Run an audit to see analysis results</p>
        </div>
      </div>
    );
  }

  const { executiveSummary, table, keyRisks, keyRiskBuckets } = analyzerData;

  // Get risk level color
  const getRiskColor = (risk) => {
    const riskLower = risk?.toLowerCase() || '';
    if (riskLower.includes('high')) return 'text-red-600 bg-red-50 border-red-200';
    if (riskLower.includes('medium') || riskLower.includes('moderate')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('fully') || statusLower.includes('implemented')) return 'text-green-700 bg-green-100';
    if (statusLower.includes('partial')) return 'text-orange-700 bg-orange-100';
    if (statusLower.includes('not') || statusLower.includes('missing')) return 'text-red-700 bg-red-100';
    return 'text-blue-700 bg-blue-100';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Executive Summary</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-2">Overall Score</p>
            <p className="text-4xl font-bold text-blue-600">{executiveSummary?.overallScore}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-2">Health Status</p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRiskColor(executiveSummary?.health)}`}>
              <span className="text-xl font-bold">{executiveSummary?.health}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Details Table */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h3 className="text-2xl font-bold text-white">Audit Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {table && table.length > 0 && Object.keys(table[0]).map((key) => (
                  <th key={key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table?.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {Object.entries(row).map(([key, value], idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {key === 'implementationStatus' ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
                          {value}
                        </span>
                      ) : key === 'businessRiskLevel' ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(value)}`}>
                          {value}
                        </span>
                      ) : key === 'score' ? (
                        <span className={`font-bold ${value >= 8 ? 'text-green-600' : value >= 5 ? 'text-orange-600' : 'text-red-600'}`}>
                          {value}/10
                        </span>
                      ) : (
                        <span className="text-gray-800 font-medium">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Risks */}
      {keyRisks && keyRisks.length > 0 && (
        <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-red-800">Key Risks</h3>
          </div>
          <ul className="space-y-2">
            {keyRisks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-red-700">
                <span className="text-red-500 mt-1">•</span>
                <span className="font-medium">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Risk Buckets */}
      {keyRiskBuckets && keyRiskBuckets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Risk Breakdown</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyRiskBuckets.map((bucket, index) => (
              <div key={index} className={`rounded-xl p-4 border-2 ${getRiskColor(bucket.risk)}`}>
                <p className="font-bold text-lg mb-2">{bucket.bucket}</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Risk:</strong> {bucket.risk}</p>
                  <p><strong>Area:</strong> {bucket.exampleArea}</p>
                  <p><strong>Status:</strong> {bucket.exampleStatus}</p>
                  <p><strong>Score:</strong> {bucket.exampleScore}/10</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzerResults;