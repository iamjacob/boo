"use client";
import { Suspense, useState } from "react";

import BoooksFull from "./BoooksFull";
import BoooksHeart from "./BoooksHeart";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [login, setLogin] = useState(false);
  const [authMethod, setAuthMethod] = useState("magic");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-100 flex justify-between w-screen h-[40px] gap-2 m-1">
      <div className="menu flex cursor-pointer items-center">
        {/* <div className="cursor-pointer border border-2 border-red-500 rounded-full px-2 my-2 text-[12px]">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dna-icon lucide-dna"><path d="m10 16 1.5 1.5"/><path d="m14 8-1.5-1.5"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m16.5 10.5 1 1"/><path d="m17 6-2.891-2.891"/><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="m20 9 .891.891"/><path d="M3.109 14.109 4 15"/><path d="m6.5 12.5 1 1"/><path d="m7 18 2.891 2.891"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/></svg>
</div> */}

        {/* <div className="TAG flex flex-col p-[4px] my-[3px] justify-around items-center h-[26px] mx-2">
              <div className="border border-1 border-red-500 h-[4px] w-[4px] rounded-full"></div>
              <div className="border border-1 border-red-500 h-1 w-1 rounded-full"></div>
              <div className="border border-1 border-red-500 h-1 w-1 rounded-full"></div>
            </div> */}

        <div className="pt-[3px] cursor-pointer flex items-center pl-[14px]">
          {/* <BoooksHeart /> */}

          <BoooksFull width="80px" height="30px" />
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg> */}
        </div>
      </div>

      {/* LOGIN OR TIME */}
      <div className="time flex gap-4 pr-[14px] items-center">
        {!isLoggedIn ? (
          <>
            {/* <div
                onClick={() => {
                  setIsLoggedIn(true);
                  //toggleLogin()
                }}
                className="login bg-white/10 text-white cursor-pointer border border-2 border-red-500 rounded-full my-2 px-2 text-[12px]"
              >
                Login
              </div> */}
            <div
              onClick={() => {
                //setIsLoggedIn(true);
                setLogin(!login);
              }}
              // className="login login bg-white/10 text-white cursor-pointer border border-2 border-red-500 rounded-full my-2 px-2 text-[12px]"
              className="control"
           >
              next
            </div>
          </>
        ) : (
          <div className="flex">
            <div
              onClick={() => {
                setIsLoggedIn(false);
              }}
              className="login cursor-pointer border border-2 border-red-500 rounded-full px-2 my-2 text-[12px]"
            >
              logout
            </div>

            {/* <div onClick={()=>{setIsLoggedIn(false)}} className="login cursor-pointer border border-2 border-red-500 rounded-full px-2 my-2 text-[12px]"> */}
            {/* </div> */}
            <div className="flex">
              {/* <Compass /> */}
              <Time />
            </div>
          </div>
        )}

        {/* <div className="TAG flex px-1 py-[0px] my-[0px] justify-around items-center">
              <div className="border border-1 border-black-100 h-[4px] w-[4px] rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
            </div> */}
      </div>

      {login && (
        <div
          onClick={() => setLogin(!login)}
          className="fixed inset-0 bg-white/10 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/30 backdrop-blur-sm rounded-3xl shadow-[0_11px_34px_0_rgba(0,0,0,0.2)] border border-white/50 w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300 hover:shadow-3xl"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center flex flex-col">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-2xl mx-auto mb-4 shadow-lg shadow-blue-500/25 flex items-center justify-center"> */}
              {/* <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div> */}
              <div className="holder flex justify-around">
                <div className="-rotate-45 absolute">
                  <BoooksHeart width="45" height="45" />
                </div>
              </div>
              {/* </div> */}
              <h1 className="text-2xl font-light text-slate-800 mb-2">
                Velkommen
              </h1>
              <p className="text-slate-500 text-sm font-light">
                Sign in to continue
              </p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8 space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <input
                  placeholder="Email address"
                  type="email"
                  className="w-full px-4 py-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Authentication Method */}
              <div className="space-y-3">
                <p className="text-slate-600 text-sm font-medium text-center">
                  Choose authentication method
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAuthMethod("magic")}
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

              {/* Password field (conditional) */}
              {authMethod === "password" && (
                <div className="space-y-2">
                  <input
                    placeholder="Password"
                    type="password"
                    className="w-full px-4 py-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500/30 transition-all duration-200 shadow-sm"
                  />
                </div>
              )}

              {/* Stay logged in */}
              <div className="flex items-center space-x-3">
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
              </div>

              {/* Submit Button */}
              <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-slate-600 text-white rounded-2xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200">
                {authMethod === "magic" ? "Send Magic Link" : "Sign In"}
              </button>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-slate-200/60">
                <p className="text-slate-500 text-xs">
                  By continuing, you agree to our terms
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {login && (
                <div onClick={() => {
                  //setIsLoggedIn(true);
                  setLogin(!login)
                }} className="absolute top-0 left-0 w-screen h-screen backdrop-blur-xs flex flex-col justify-around items-center text-center">
                  <div className="flex flex-col text-black w-[50vw] h-[50vh]">

                  <h1>Login</h1>
                  <div className="flex justify-around w-[200px]">
                    <input placeholder="email" type="email"/>
                    via
                    <button>Magic</button>
                    <button>Password</button>
                  </div>
                </div>
                  </div>
              )} */}
    </header>
  );
}
