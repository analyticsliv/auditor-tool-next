"use client";

import React, { useEffect } from "react";
import { signOut } from "next-auth/react";
import AuthWrapper from "./Components/AuthWrapper";

const Home = () => {
  // useEffect(() => {
  //   const session = localStorage.getItem("session");
  //   const accessToken = localStorage.getItem("accessToken");

  //   if (!session || !accessToken) {
  //     window.location.href = "/login";
  //   }
  // }, []);

  const handleSignOut = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("accessToken");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Welcome to GA4 Auditor Tool</h1>
        <p className="mt-4 text-lg">You are signed in!</p>
        <button
          onClick={handleSignOut}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </AuthWrapper>
  );
};

export default Home;