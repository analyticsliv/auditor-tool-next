"use client";

const ChatbotLimitModal = ({ isOpen, onClose, onRequestMore, chatbotCount, chatbotLimit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Chatbot Limit Reached</h2>
                </div>

                <div className="p-8">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-gray-600">Messages used</span>
                            <span className="text-2xl font-bold text-gray-800">
                                {chatbotCount} / {chatbotLimit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (chatbotCount / chatbotLimit) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            You've used all <span className="font-bold">{chatbotLimit}</span> chatbot messages for this period.
                            Reach out to our team to continue.
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Need more messages?</p>
                                <p>Contact us at <a className="underline" href="mailto:data.analytics@analyticsliv.com">data.analytics@analyticsliv.com</a> to upgrade your plan.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={onRequestMore}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotLimitModal;
