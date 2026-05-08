import React from 'react'
import AuthWrapper from '../Components/AuthWrapper'

const Page = () => {
    return (
        <AuthWrapper>
            <div className="flex h-[70dvh] 2xl:h-[80dvh] items-center justify-center bg-surface-hover">
                <div className="text-center animate-fadeIn">
                    <h1 className="text-4xl 2xl:text-5xl font-bold text-content mb-4">🚀 Coming Soon!</h1>
                    <p className="text-sm 2xl:text-lg text-content-muted">Account page is currently under development. Stay tuned for exciting updates!</p>
                </div>
            </div>
        </AuthWrapper>
    )
}

export default Page
