"use client"

import React from 'react'
import AuthWrapper from '../Components/AuthWrapper'
import { signOut } from 'next-auth/react';

const page = () => {
    const handleSignOut = () => {
        localStorage.removeItem("session");
        localStorage.removeItem("accessToken");
        signOut({ callbackUrl: "/login" });
    };
    return (
        <AuthWrapper>
            <div>
                Dashbaord
            </div>
            <button onClick={() => signIn("google")} className="bg-[#1A73E8] h-[56px] w-[200px] flex relative items-center justify-center mt-10 rounded-md">
                <img src='/google1.png' alt="Google logo" className="pr-[12px] h-[30px] w-[41px]" />
                <p>Sign in with Google</p>
            </button>
            <button
                onClick={() => handleSignOut()}
                className="mt-6 bg-red-500 text-white px-6 py-2 rounded"
            >
                Sign Out
            </button>
        </AuthWrapper>
    )
}

export default page
