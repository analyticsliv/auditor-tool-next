"use client";

import { useAccountStore } from "../store/useAccountStore";

const AnalyzerResults = () => {
  const { analyzerData } = useAccountStore();

  if (!analyzerData) {
    return (
      <div className="bg-surface rounded-2xl shadow-lg p-8 border-2 border-line">
        <div className="text-center text-content-subtle">
          <svg className="w-16 h-16 mx-auto mb-4 text-content-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-semibold">No analyzer data available</p>
          <p className="text-sm mt-2">Run an audit to see analysis results</p>
        </div>
      </div>
    );
  }

  const { executiveSummary, table, keyRisks, keyRiskBuckets, aiSummary } = analyzerData;

  // Filter out "Old UA Code" from table
  const filteredTable = table?.filter(row =>
    row.auditArea !== "Old UA Code"
  ) || [];

  // Filter out "Old UA Code" from keyRisks
  const filteredKeyRisks = keyRisks?.filter(risk =>
    !risk.toLowerCase().includes('old ua code')
  ) || [];

  // Filter out "Old UA Code" from keyRiskBuckets
  const filteredKeyRiskBuckets = keyRiskBuckets?.filter(bucket =>
    bucket.exampleArea !== "Old UA Code"
  ) || [];

  // Get risk level color
  const getRiskColor = (risk) => {
    const riskLower = risk?.toLowerCase() || '';
    if (riskLower.includes('high')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30';
    if (riskLower.includes('medium') || riskLower.includes('moderate')) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30';
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('fully') || statusLower.includes('implemented')) return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/15';
    if (statusLower.includes('partial')) return 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/15';
    if (statusLower.includes('not') || statusLower.includes('missing')) return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/15';
    if (statusLower.includes('error') || statusLower.includes('issue')) return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/15';
    if (statusLower.includes('functional')) return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/15';
    return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/15';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 rounded-2xl shadow-lg p-8 border-2 border-blue-200 dark:border-blue-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-content">Executive Summary</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl p-6 shadow-md border border-line">
            <p className="text-sm font-semibold text-content-muted mb-2">Overall Score</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{executiveSummary?.overallScore}</p>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-md border border-line">
            <p className="text-sm font-semibold text-content-muted mb-2">Health Status</p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRiskColor(executiveSummary?.health)}`}>
              <span className="text-xl font-bold">{executiveSummary?.health}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Details Table */}
      <div className="bg-surface rounded-2xl shadow-lg border-2 border-line overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h3 className="text-2xl font-bold text-white">Audit Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-muted border-b-2 border-line">
              <tr>
                {filteredTable && filteredTable.length > 0 && Object.keys(filteredTable[0]).map((key) => (
                  <th key={key} className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredTable?.map((row, index) => (
                <tr key={index} className="hover:bg-surface-muted transition-colors">
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
                        <span className={`font-bold ${value >= 8 ? 'text-green-600 dark:text-green-400' : value >= 5 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                          {value}/10
                        </span>
                      ) : (
                        <span className="text-content font-medium">{value}</span>
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
      {filteredKeyRisks && filteredKeyRisks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200">Key Risks</h3>
          </div>
          <ul className="space-y-2">
            {filteredKeyRisks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-red-700 dark:text-red-300">
                <span className="text-red-500 mt-1">•</span>
                <span className="font-medium">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Risk Buckets */}
      {filteredKeyRiskBuckets && filteredKeyRiskBuckets.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-lg p-6 border-2 border-line">
          <h3 className="text-xl font-bold text-content mb-4">Risk Breakdown</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKeyRiskBuckets.map((bucket, index) => (
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

      {/* AI Summary */}
      {aiSummary && (
        <div className="mt-6 bg-surface rounded-xl p-6 shadow-md border border-line">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-xl font-semibold text-content-muted mb-1">AI Summary</p>
              <p className="text-content text-base max-xl:text-sm">{aiSummary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzerResults;