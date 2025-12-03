"use client";

const AuditLimitModal = ({ isOpen, onClose, onRequestMore, auditCount, auditLimit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full  max-h-[90vh] overflow-y-auto">
                {/* Icon Header */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg mb-4">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Audit Limit Reached</h2>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-gray-600">Your Usage</span>
                            <span className="text-2xl font-bold text-gray-800">
                                {auditCount} / {auditLimit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(auditCount / auditLimit) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            You've used all <span className="font-bold">{auditLimit}</span> of your free audits.
                            To continue using our GA4 Auditor tool, please reach out to our team.
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <div className="flex">
                                <svg
                                    className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Need more audits?</p>
                                    <p>Contact us to discuss upgrading your plan or getting additional audit credits.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={onRequestMore}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg"
                        >
                            <div className="flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                Request More Audits
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLimitModal;