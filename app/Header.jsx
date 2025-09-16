"use client";
import { useState } from "react";
import BoooksFull from "./BoooksFull";
import BookMenuButton from "./Boookmenu";
import Sidenav from "./Sidenav";
import Login from "./Login";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState(false);


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

          <div className="absolute z-[101] cursor-pointer flex items-center">
            {/* <BoooksHeart /> */}

            <a className="p-3" href="/">
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
            <a onClick={() => setMenu(!menu)} href="#menu" className="h-[40px]">
              <BookMenuButton />
            </a>
        </div>


      {/* <Login/>  */}
      {login && (<Login setLogin={setLogin} />)}
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

      {/* {menu && (
        <div
          className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
          onClick={() => setMenu(false)}
        ></div>
      )} */}

      <Sidenav menu={menu} />
      
      {/* </div> */}
      {/* )} */}
    </>
  );
}
