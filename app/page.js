"use client"
import React, { useEffect, useState } from "react";
import image1 from "../public/Audit_Logo_r.png";
import image2 from "../public/Group 35 1.png"
import image3 from "../public/Group 36 1.png"
import image4 from "../public/Group 37 1.png"
import image5 from "../public/Decore.png"
import image6 from "../public/image.png"
import image7 from "../public/automation 1.png"
import image8 from "../public/data-analysis 1.png"
import image9 from "../public/Group 3915.png"
import image10 from "../public/google1.png"
import Image from "next/image";
const GA4AuditorTool = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    website: "",
    contact: "",
    query: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThankYouVisible, setIsThankYouVisible] = useState(false);

  const baseUrlForBackend = "https://audit-backend.onrender.com";

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken && accessToken.length > 10) {
      window.location.href = "/profile.html";
    }

    const preventZoom = (event) => {
      if (
        event.ctrlKey &&
        ["=", "+", "-", "_", "Hyphen", "Add", "Subtract"].includes(event.key)
      ) {
        event.preventDefault();
        showToastMessage();
      }
    };

    const preventMouseWheelZoom = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        showToastMessage();
      }
    };

    document.addEventListener("keydown", preventZoom);
    window.addEventListener("wheel", preventMouseWheelZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", preventZoom);
      window.removeEventListener("wheel", preventMouseWheelZoom);
    };
  }, []);

  const showToastMessage = () => {
    const toast = document.createElement("div");
    toast.textContent =
      "Zooming is disabled on this page for an optimal viewing experience.";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#ff4d4d";
    toast.style.color = "#fff";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "1000";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsThankYouVisible(true);
      setFormState({
        firstName: "",
        lastName: "",
        email: "",
        website: "",
        contact: "",
        query: "",
      });
    }, 3000);
  };

  return (
<>
    <div >

      {/* Taking left and right component as 1 component  */}
      <div className="h-[1/2] ">
        {/* Component present in the left */}
        <div className="flex flex-col w-1/3 h-full place-items-center justify-items-start mt-10">
          {/* Image component */}
          <div className="flex items-center">
            <Image src={image1} alt="GA4 Auditor Tool Logo" className="w-20 top-[43px]" />
            <p className="font-[700] text-[40px] ">
              GA4 Auditor Tool
            </p>
          </div>

          {/* Component with 4 elements (3p tags and 1 button) */}
          <div className="flex flex-col mt-[60px]">
            <p className="text-[30px]">
              Welcome to
            </p>
            <p className="text-[#EF611A] text-[45px] font-[700]">
              GA4 Auditor Tool
            </p>
            <p className="w-[388px] h-[120px] mt-10 text-black">
              GA4 audit automation tools can help you automatically check your Google Analytics 4 (GA4) setup for accuracy and efficiency. They analyse your data and configuration, identifying potential issues like missing data, duplicate entries, or incorrect tracking codes.
            </p>
            <button className="bg-[#1A73E8] h-[56px] w-[270px] flex relative items-center justify-center mt-10 rounded-md">
                <Image src={image10} className="pr-[12px] h-[30px] w-[42px]" />
                <p>Sign in with Google</p>
            </button>
          </div>
        </div>


        {/* Taking right side 3 elements as one component */}
        <div>

        </div>
      </div>




      {/* Taking the bottom rectangle as 1 component */}
      <div>

      </div>
    </div>

{
  isModalOpen && (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={handleModalToggle}>&times;</button>
        <h2 className="text-xl font-bold text-center mb-4">Contact Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="firstName"
              value={formState.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600"
            />
            <input
              type="text"
              name="lastName"
              value={formState.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600"
            />
          </div>
          <input
            type="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-2 mb-4 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600"
          />
          <textarea
            name="query"
            value={formState.query}
            onChange={handleInputChange}
            placeholder="Your Query"
            className="w-full p-2 mb-4 border-2 border-gray-300 focus:outline-none focus:border-blue-600 resize-none"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-500">
            isSubmitting ? "Submitting..." : "Submit"
          </button>
        </form>
      </div>
    </div>
  )
}
</>
  )
};
export default GA4AuditorTool;








  // <div className="w-screen">
  //   <div className="flex h-screen overflow-hidden w-full">
  //     <div className="w-full flex flex-col justify-center items-center p-8">
  //       <div className="flex items-center gap-8 ">
  //         
  //       </div>
  //       <div className="flex flex-row ">
  //         
  //         
  //        
  //         <div className="w-[590px] h-[36px] absolute top-[784px] left-[425px] gap-0 font-poppins text-[24px] font-semibold leading-[36px] text-center text-[#14183E] underline underline-offset-[2px] decoration-[from-font] decoration-skip-ink-none">
  //           These tools can save you time and effort by using
  //         </div>

  //       <Image src={image5} alt="Shadow of image" className="w-[692px] h-[819px]  top-[-114px] left-[1025px] gap-0 shadow-[0px_4px_4px_0px_#00000040]"/>
  //       <Image src={image6} alt="The image"className="w-[873px] h-[554.57px]  top-[170px] left-[507px] gap-0"/>
  //       <Image src={image7} alt="Shadow of image" className="w-[95px] h-[95px]  top-[927px] left-[257px] gap-0"/>
  //       <Image src={image8} alt="Shadow of image" className="w-[95px] h-[95px]  top-[927px] left-[692px] gap-0"/>
  //       <Image src={image9} alt="Shadow of image" className="w-[95px] h-[95px]  top-[927px] left-[1116px] gap-0"/>
        
      
      
      // </div >

  // {/* Modal */ }