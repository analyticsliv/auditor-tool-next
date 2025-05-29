import React from 'react'

const Loader = () => {
    return (
        <div>
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 animate-ping" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Loader
