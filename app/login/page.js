"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ContactModal from "../Components/contactModal";

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      localStorage.setItem("session", JSON.stringify(session));

      // Get the callback URL from query params, or default to home page
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl') || '/';

      router.push(callbackUrl);
    }
  }, [session, router]);


  return (
    <>
      <div className="pl-[8%]   mt-[-70px] justify-between">
        <div className="flex justify-between items-center mt-20">
          {/* Logo and name */}
          <div className="flex justify-between items-center gap-4">
            <img src='/Audit_Logo_r.png' alt="GA4 Auditor Tool Logo" className="w-10 top-[33px]" />
            <p className="font-[700] text-[30px] ">
              GA4 Auditor Tool
            </p>
          </div>
          {/* Contact Us button */}
          <button onClick={() => setIsModalOpen(true)} type="submit" className="bg-white border-[#1A73E8] border-2 h-[56px] w-[200px] flex relative items-center justify-center rounded-md z-10 right-[50px] " >
            <img src='/contact-us.png' alt="contact us" className="pr-[12px] h-[30px] w-[42px]" />
            <p>Contact Us</p>
          </button>

          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />

        </div>
      </div>

      <div>
        <div className="pl-[8%] flex items-center justify-between -mt-10">
          {/* Component with 4 elements (3p tags and 1 button) */}
          <div className="flex flex-col mt-[10px]">
            <p className="text-[30px]">
              Welcome to
            </p>
            <p className="text-[#EF611A] text-[45px] font-[700]">
              GA4 Auditor Tool
            </p>
            <p className="w-[388px] mt-10 text-black">
              GA4 audit automation tools can help you automatically check your Google Analytics 4 (GA4) setup for accuracy and efficiency. They analyse your data and configuration, identifying potential issues like missing data, duplicate entries, or incorrect tracking codes.
            </p>
            <button onClick={() => signIn("google")} className="bg-[#1A73E8] h-[56px] w-[200px] flex relative items-center justify-center mt-10 rounded-md text-white">
              <img src='/google1.png' alt="Google logo" className="pr-[12px] h-[30px] w-[41px]" />
              <p>Sign in with Google</p>
            </button>
          </div>
          <div>
            <img src='/image.png' alt="The image" className="w-[873px] h-[554.57px] mt-12 z-10 pr-10
             relative" />
          </div>
        </div>
        <div>
          {/* Taking orange shadow behind the image as one component */}
          <div className="relative">
            <img src='/Decore.png' alt="Shadow of image" className="right-0 bottom-[50px] -z-10 absolute " />
          </div>
        </div>

        {/* Taking the bottom rectangle as 1 component */}
        <div className=" justify-center mt-7">
          <p className="text-center text-[#14183E] font-semibold text-[24px]">
            These tool can save you time and effort by using</p>
          <div className="flex mt-16 mb-20 justify-evenly ">
            <div className="flex flex-col border-[1px] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
              <img src='/automation 1.png' alt="1st card" className="w-[95px] h-[95px] " />
              <div className="text-center text-[#1E1D4C] font-[700] ">
                <p className="text-center">Automating</p> <p>repetitive tasks</p>
              </div>
            </div>
            <div className="flex flex-col border-[1px] border-[#F2F2F2] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
              <img src='/data-analysis 1.png' alt="2nd card" className="w-[95px] h-[95px] " />
              <div className="text-center text-[#1E1D4C] font-[700] ">
                <p className="text-center">Improving </p> <p>data reliability</p>
              </div>
            </div>
            <div className="flex flex-col border-[1px] border-[#F2F2F2] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
              <img src='/Group 3915.png' alt="3rd card" className="w-[95px] h-[95px] " />
              <div className="text-center text-[#1E1D4C] font-[700] ">
                <p className="text-center">Providing
                </p> <p>actionable insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
};

export default Login;
