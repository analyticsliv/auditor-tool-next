"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

const Login = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const accessToken = session?.accessToken;
      localStorage.setItem("session", JSON.stringify(session));
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("session");
      localStorage.removeItem("accessToken");
    }
  }, [session]);

  const singout1 = async () => {
    let accessToken = localStorage.getItem('accessToken');

    const response = await fetch("https://analyticsadmin.googleapis.com/v1alpha/" + 'properties/258424009' + "/attributionSettings", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Attribution Settings');
    }

    const attSettings1 = await response.json();

  }

  return (
    <div className="login-container">
      {session ? (
        <div>
          <p>Welcome, {session.user.name}</p>
          <p>Email: {session.user.email}</p>
          <button onClick={() => signOut()} className="btn">
            Sign Out
          </button>
          <button onClick={() => singout1()} className="btn">
            API CALL
          </button>
        </div>
      ) : (
        <div>
          <p>Please log in</p>
          <button onClick={() => signIn("google")} className="btn">
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;






// import { useSession } from "next-auth/react";
// import LoginPage from "./Components/Login";

// const GA4AuditorTool = () => {
//   const { data: session } = useSession();

// "use client";

// import { signIn, signOut, useSession } from "next-auth/react";
// import { useEffect } from "react";

// const Login = () => {
//   const { data: session } = useSession();

//   useEffect(() => {
//     if (session) {
//       const accessToken = session?.accessToken;  // Access token if available
//       localStorage.setItem("session", JSON.stringify(session));
//       localStorage.setItem("accessToken", accessToken);
//     } else {
//       localStorage.removeItem("session");
//       localStorage.removeItem("accessToken");
//     }
//   }, [session]);

//   return (
//     <div className="login-container">
//       {session ? (
//         <div>
//           <p>Welcome, {session.user.name}</p>
//           <button onClick={() => signOut()} className="btn">
//             Sign Out
//           </button>
//         </div>
//       ) : (
//         <div>
//           <p>Please log in</p>
//           <button onClick={() => signIn("google")} className="btn">
//             Sign In with Google
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;