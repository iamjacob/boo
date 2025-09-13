"use client";
import { Suspense, useState } from "react";
import BoooksFull from "./BoooksFull";
import BoooksHeart from "./BoooksHeart";
import BookMenuButton from "./Boookmenu";
import Footer from "./Footer";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState(false);
  const [authMethod, setAuthMethod] = useState("magic");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const [menu, setMenu] = useState(false);

  return (
    <>
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

          <div className="absolute pt-[3px] z-[101] cursor-pointer flex items-center px-[8px]">
            {/* <BoooksHeart /> */}
            <a onClick={() => setMenu(!menu)} href="#menu" className="h-[40px]">
              <BookMenuButton />
            </a>
            <a href="/">
              <BoooksFull width="80px" height="30px" />
            </a>
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
                Start
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
            className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/30 backdrop-blur-sm rounded-3xl shadow-[0_11px_34px_0_rgba(0,0,0,0.2)] border border-red-500 border-[4px] w-full max-w-md mx-auto transform transition-all duration-300 hover:shadow-3xl"
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

      {menu && (
        <div
          className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
          onClick={() => setMenu(false)}
        ></div>
      )}
      <aside
        className={`absolute left-0 top-0 h-screen w-60 z-[100] flex flex-col rounded-lg border border-white/30 bg-black/70 text-white backdrop-blur shadow-lg
      transform transition-transform duration-300
      ${menu ? "open-menu" : "closed-menu"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logo flex pt-[3px] cursor-pointer items-center px-[8px]">
          <a onClick={() => setMenu(!menu)} href="#menu" className="h-[40px]">
            <BookMenuButton />
          </a>
          <a href="/">
            <BoooksFull width="80px" height="30px" />
          </a>
        </div>
        <ul className="mt-2 space-y-2 p-4">
          <li>
            <a href="#" className="block p-2 rounded-lg hover:bg-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-scroll-icon lucide-scroll"
              >
                <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
              </svg>{" "}
              Scrolls
            </a>
          </li>
          <li>
            <a href="#maps" className="block p-2 rounded-lg hover:bg-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-map-icon lucide-map"
              >
                <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                <path d="M15 5.764v15" />
                <path d="M9 3.236v15" />
              </svg>
              maps
            </a>

            {/* <a href="#pinOnMap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin-plus-icon lucide-map-pin-plus"
              >
                <path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" />
                <circle cx="12" cy="10" r="3" />
                <path d="M16 18h6" />
                <path d="M19 15v6" />
              </svg>
            </a> */}
          </li>

          <li>
            <a
              href="#Boookddownloaded"
              className="block p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-copy-icon lucide-book-copy"
              >
                <path d="M5 7a2 2 0 0 0-2 2v11" />
                <path d="M5.803 18H5a2 2 0 0 0 0 4h9.5a.5.5 0 0 0 .5-.5V21" />
                <path d="M9 15V4a2 2 0 0 1 2-2h9.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H11a2 2 0 0 1 0-4h10" />
              </svg>
              Boooks
            </a>
          </li>

          <li>
            <a
              href="#Boookddownloaded"
              className="block p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-history-icon lucide-history"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
              </svg>
              History
            </a>
          </li>

          <li>
            <a
              href="#section1"
              className="block p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-gift-icon lucide-gift"
              >
                <rect x="3" y="8" width="18" height="4" rx="1" />
                <path d="M12 8v13" />
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
              </svg>{" "}
              Wishlist
            </a>
            <a href="plus">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-icon lucide-plus"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="#section2"
              className="block p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-icon lucide-circle"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>{" "}
              Shelves
            </a>
            <a href="plus">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-icon lucide-plus"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="#section3"
              className="block p-2 rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-library-icon lucide-library"
              >
                <path d="m16 6 4 14" />
                <path d="M12 6v14" />
                <path d="M8 8v12" />
                <path d="M4 4v16" />
              </svg>{" "}
              Collections
            </a>
            <a href="plus">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-icon lucide-plus"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </a>
          </li>
        </ul>
        {/* <h2>Pages</h2>
            <ul> */}
        {/* <li>
              <a href="#">Tracks</a>
              <ul>
                <li>
                  <a href="#track1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-bell-ring-icon lucide-bell-ring"
                    >
                      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                      <path d="M22 8c0-2.3-.8-4.3-2-6" />
                      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
                    </svg>
                    Subcribed
                  </a>
                </li>
                <li>
                  <a href="#track2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-eye-icon lucide-eye"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>{" "}
                    Watch
                  </a>
                </li>
                <li>
                  <a href="#track3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-user-round-pen-icon lucide-user-round-pen"
                    >
                      <path d="M2 21a8 8 0 0 1 10.821-7.487" />
                      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                      <circle cx="10" cy="8" r="5" />
                    </svg>{" "}
                    Author
                  </a>
                </li>
                ¨
                <li>
                  <a href="#last">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-book-open-icon lucide-book-open"
                    >
                      <path d="M12 7v14" />
                      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </li> */}
        {/* </ul> */}
        <Footer />
      </aside>
      {/* </div> */}
      {/* )} */}
    </>
  );
}
