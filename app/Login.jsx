import { useEffect, useState } from "react";
import BoooksHeart from "./BoooksHeart";
import {useAuthStore} from '../stores/useAuthStore';

const Login = ({setLoginModal}) => {
  const [authMethod, setAuthMethod] = useState("magic");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  let isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  let setLogin = useAuthStore((state) => state.setLogin);
let setUser = useAuthStore((state) => state.setUser); // Use setUser instead of setLogin

  const handleLogin = () => {

    //setLogin(false); // Close the login modal after login
    
    // Implement login logic here
    const emailInput = document.getElementById("email");
    const email = emailInput ? emailInput.value : "";
    const passwordInput = document.querySelector('input[type="password"]');
    const password = passwordInput ? passwordInput.value : "";
    console.log(email);
    console.log(password);

    emailInput.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
      }
    });

    if (passwordInput) {
      passwordInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          console.log(password);
          event.preventDefault();
          handleLogin();
        }
      });
    }

    if (authMethod === "magic") {
      if (email === "iam@jacobg.me") {
        console.log("Successful magic login");
        // Set user data instead of just login status
        setUser({ email: email, loginMethod: "magic" });
        setLoginModal(false);
      }
    } else if (authMethod === "password") {
      if (password === "2310") {
        console.log("Successful password login");
        // Set user data instead of just login status
        setUser({ email: email, loginMethod: "password" });
        setLoginModal(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleLogin();

      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [authMethod]);



    return (
          <div
            onClick={() => setLoginModal(false)}
            className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black/30 backdrop-blur-sm rounded-3xl shadow-[0_11px_34px_0_rgba(0,0,0,0.2)] border border-red-500 border-[4px] w-full max-w-md mx-auto transform transition-all duration-300 hover:shadow-3xl"
            >

              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center flex flex-col">
                {/* <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-2xl mx-auto mb-4 shadow-lg shadow-blue-500/25 flex items-center justify-center"> */}
                {/* <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div> */}
                <div className="holder flex justify-around">
                  <div className="-rotate-45 absolute top-[-53px]">
                    <BoooksHeart width="45" height="45" />
                  </div>
                </div>
                {/* </div> */}
                <h1 className="text-2xl font-light text-[#999] mb-2">
                  Velkommen
                </h1>
                {/* <p className="text-slate-500 text-sm font-light">
                  Sign in to continue
                </p> */}
              </div>

              {/* Form */}
              <div className="px-8 pb-8 space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <input
                    placeholder="Email address"
                    type="email"
                    id="email"
                    className="bg-white/30 w-full px-4 py-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200 shadow-sm"
                  />
                </div>

              {/* Password field (conditional) */}
                {authMethod === "password" && (
                  <>
                  <div className="space-y-2">
                    <input
                      placeholder="Password"
                      type="password"
                      className="w-full px-4 py-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500/30 transition-all duration-200 shadow-sm"
                    />
                  </div>
                   {/* <div className="space-y-2">
                    -- MORE --
                  </div> */}
                  </>
                )}



                {/* Authentication Method */}
                <div className="space-y-3">
                  <p className="text-slate-600 text-sm font-medium text-center">
                    Choose authentication method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {setAuthMethod("magic");handleLogin()}}
                      className={`cursor-pointer px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
                        authMethod === "magic"
                          ? "bg-red-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      ✨ Magic Link
                    </button>
                    <button
                      onClick={() => setAuthMethod("password")}
                      className={`px-4 py-3 cursor-pointer text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
                        authMethod === "password"
                          ? "bg-gray-900 text-white shadow-lg shadow-slate-700/25"
                          : "bg-gray-900 text-slate-600 hover:bg-gray-800"
                      }`}
                    >
                      Password
                    </button>
                  </div>
                </div>

               

                {/* Stay logged in - ASK ON VERIFICATION IF FEEL SAFE*/}
                {/* <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="stayin"
                      checked={stayLoggedIn}
                      onChange={(e) => setStayLoggedIn(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setStayLoggedIn(!stayLoggedIn)}
                      className={`w-5 h-5 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                        stayLoggedIn
                          ? "bg-blue-500 border-blue-500 shadow-sm"
                          : "bg-white border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {stayLoggedIn && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <label
                    htmlFor="stayin"
                    className="text-slate-600 text-sm cursor-pointer"
                  >
                    Keep me signed in
                  </label>
                </div> */}

               

                {/* Footer */}
                <div className="text-center pt-4 border-t border-slate-200/60">
                  <p className="text-slate-500 text-xs">
                    By continuing, you agree to our terms
                  </p>
                </div>
              </div>
            </div>
          </div>
  )
}

export default Login