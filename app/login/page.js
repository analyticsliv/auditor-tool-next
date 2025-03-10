"use client";

import React, { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const accessToken = session?.accessToken;
      localStorage.setItem("session", JSON.stringify(session));
      localStorage.setItem("accessToken", accessToken);
      window.location.href = "/"; // Redirect to home page
    }
  }, [session]);


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
          <button type="submit" className="bg-white border-[#1A73E8] border-2 h-[56px] w-[200px] flex relative items-center justify-center rounded-md z-10 right-[50px] " >
            <img src='/contact-us.png' alt="contact us" className="pr-[12px] h-[30px] w-[42px]" />
            <p>Contact Us</p>
          </button>
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






// "use client"
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { signIn, signOut, useSession } from "next-auth/react";

// const Login = () => {
//   const { data: session } = useSession();

//     useEffect(() => {
//       const accessToken = localStorage.getItem("accessToken");
  
//       if (accessToken && accessToken.length > 10) {
//         window.location.href = "/";
//       }
//     })

//   useEffect(() => {
//     if (session) {
//       const accessToken = session?.accessToken;
//       localStorage.setItem("session", JSON.stringify(session));
//       localStorage.setItem("accessToken", accessToken);
//     } else {
//       localStorage.removeItem("session");
//       localStorage.removeItem("accessToken");
//     }
//   }, [session]);

//     const singout1 = async () => {
//     let accessToken = localStorage.getItem('accessToken');
//     console.log("acc object",accessToken)
//     const response = await fetch("https://analyticsadmin.googleapis.com/v1alpha/" + 'properties/258424009' + "/attributionSettings", {
//       headers: { "Authorization": `Bearer ${accessToken}` }
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch Attribution Settings');
//     }

//     const attSettings1 = await response.json();

//     console.log("object aattsetting", attSettings1)
//   }
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formState, setFormState] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     website: "",
//     contact: "",
//     query: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isThankYouVisible, setIsThankYouVisible] = useState(false);

//   const baseUrlForBackend = "https://audit-backend.onrender.com";

//   useEffect(() => {
//     const accessToken = localStorage.getItem("accessToken");

//     if (accessToken && accessToken.length > 10) {
//       // window.location.href = "/";
//     }

//     const preventZoom = (event) => {
//       if (
//         event.ctrlKey &&
//         ["=", "+", "-", "_", "Hyphen", "Add", "Subtract"].includes(event.key)
//       ) {
//         event.preventDefault();
//         showToastMessage();
//       }
//     };

//     // const preventMouseWheelZoom = (event) => {
//     //   if (event.ctrlKey) {
//     //     event.preventDefault();
//     //     showToastMessage();
//     //   }
//     // };

//     // document.addEventListener("keydown", preventZoom);
//     // window.addEventListener("wheel", preventMouseWheelZoom, { passive: false });

//     // return () => {
//     //   document.removeEventListener("keydown", preventZoom);
//     //   window.removeEventListener("wheel", preventMouseWheelZoom);
//     // };
//   }, []);

//   const showToastMessage = () => {
//     const toast = document.createElement("div");
//     toast.textContent =
//       "Zooming is disabled on this page for an optimal viewing experience.";
//     toast.style.position = "fixed";
//     toast.style.bottom = "30px";
//     toast.style.left = "50%";
//     toast.style.transform = "translateX(-50%)";
//     toast.style.backgroundColor = "#ff4d4d";
//     toast.style.color = "#fff";
//     toast.style.padding = "10px 15px";
//     toast.style.borderRadius = "5px";
//     toast.style.zIndex = "1000";
//     document.body.appendChild(toast);

//     setTimeout(() => {
//       toast.remove();
//     }, 3000);
//   };

//   const handleModalToggle = () => {
//     setIsModalOpen((prev) => !prev);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     setTimeout(() => {
//       setIsSubmitting(false);
//       setIsThankYouVisible(true);
//       setFormState({
//         firstName: "",
//         lastName: "",
//         email: "",
//         website: "",
//         contact: "",
//         query: "",
//       });
//     }, 3000);
//   };
// // lg:px-[4%]
//   return (
// <>
//     <div className="pl-[8%]   mt-[-70px] justify-between">
//       <div className="flex justify-between items-center mt-20">
//         {/* Logo and name */}
//         <div className="flex justify-between items-center gap-4">
//             <img src='/Audit_Logo_r.png' alt="GA4 Auditor Tool Logo" className="w-10 top-[33px]" />
//             <p className="font-[700] text-[30px] ">
//               GA4 Auditor Tool
//             </p>
//         </div>
        
//         {/* Contact Us button */}
//             <button type="submit" className="bg-white border-[#1A73E8] border-2 h-[56px] w-[200px] flex relative items-center justify-center rounded-md z-10 right-[50px] " >
//                   <img src='/contact-us.png' alt="contact us" className="pr-[12px] h-[30px] w-[42px]" />
//                   <p>Contact Us</p>
//             </button>
//             </div>
//       </div>
    

//     <div>
     
//         <div className="pl-[8%] flex items-center justify-between -mt-10">
          

//           {/* Component with 4 elements (3p tags and 1 button) */}
//           <div className="flex flex-col mt-[10px]">
//             <p className="text-[30px]">
//               Welcome to
//             </p>
//             <p className="text-[#EF611A] text-[45px] font-[700]">
//               GA4 Auditor Tool
//             </p>
//             <p className="w-[388px] mt-10 text-black">
//               GA4 audit automation tools can help you automatically check your Google Analytics 4 (GA4) setup for accuracy and efficiency. They analyse your data and configuration, identifying potential issues like missing data, duplicate entries, or incorrect tracking codes.
//             </p>
//             <button onClick={() => signIn("google")} className="bg-[#1A73E8] h-[56px] w-[200px] flex relative items-center justify-center mt-10 rounded-md">
//                 <img src='/google1.png' alt="Google logo"className="pr-[12px] h-[30px] w-[41px]" />
//                 <p>Sign in with Google</p>
//               </button>  
//           </div>
//           <div>
//             <img src='/image.png' alt="The image" className="w-[873px] h-[554.57px] mt-12 z-10 pr-10
//              relative" />
//           </div>

// </div>





//     <div >

//       <div className="">
        
//         </div>


//         {/* Taking orange shadow behind the image as one component */}
//         <div className="relative">
            
//             <img src='/Decore.png' alt="Shadow of image" className="right-0 bottom-[50px] -z-10 absolute "/>
            
//         </div>
//       </div>




//       {/* Taking the bottom rectangle as 1 component */}
//       <div className=" justify-center mt-9">
//             <p className="text-center text-[#14183E] font-semibold text-[24px]">
//               These tool can save you time and effort by using</p>
//             <div className="flex mt-24 mb-24 shadow-custom justify-evenly ">  
//             <div className="flex flex-col border-[1px] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
//                   <img src='/automation 1.png' alt="1st card" className="w-[95px] h-[95px] "/>
//                   <div className="text-center text-[#1E1D4C] font-[700] ">
//                   <p className="text-center">Automating</p> <p>repetitive tasks</p>
//                   </div>
//             </div> 
//               <div className="flex flex-col border-[1px] border-[#F2F2F2] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
//                   <img src='/data-analysis 1.png' alt="2nd card" className="w-[95px] h-[95px] "/>
//                   <div className="text-center text-[#1E1D4C] font-[700] ">
//                   <p className="text-center">Improving </p> <p>data reliability</p>
//                   </div>
//             </div>
//             <div className="flex flex-col border-[1px] border-[#F2F2F2] rounded-3xl px-7 h-[250px] w-[220px] justify-center gap-6 items-center shadow-xl shadow-[#A8A8A8]">
//                   <img src='/Group 3915.png' alt="3rd card" className="w-[95px] h-[95px] "/>
//                   <div className="text-center text-[#1E1D4C] font-[700] ">
//                   <p className="text-center">Providing 
//                   </p> <p>actionable insights</p>
//                   </div>
//             </div>
//             </div>
//       </div>
//     </div>


// </>
//   )
// };
// export default Login;





