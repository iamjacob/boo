"use client";
import { useState } from "react";
import BoooksFull from "./BoooksFull";
import BookMenuButton from "./Boookmenu";
import Sidenav from "./Sidenav";
import Login from "./Login";
import Time from "./Time";
import {useAuthStore} from '../stores/useAuthStore';
import { useUserStore } from "../stores/useUserStore";
export default function Header() {
  

      let isLoggedIn = useAuthStore((state) => state.isLoggedIn);
      let setLogin = useAuthStore((state) => state.setLogin);

      const coins = useUserStore((state) => state.coins);

      const [menu, setMenu] = useState(false);
      const [login, setLoginModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 flex justify-between w-screen h-[40px] gap-2 m-1">
        <div className="menu flex cursor-pointer items-center">
         
          <div className="absolute z-[101] cursor-pointer flex items-center">
            {/* <BoooksHeart /> */}

            <a className="p-3" href="/">
              <BoooksFull width="80px" height="30px" />
            </a>
          </div>
        </div>

        {/* LOGIN OR TIME */}
        {login && <Login setLoginModal={setLoginModal} />}
        {isLoggedIn ? <Time /> : null}

        <div className="time flex gap-1 items-center">

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
                  setLoginModal(true);

                }}
                // className="login login bg-white/10 text-white cursor-pointer border border-2 border-red-500 rounded-full my-2 px-2 text-[12px]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z"
                    stroke="#fff"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21"
                    stroke="#fff"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div className="flex">
              {/* <div
                onClick={() => {
                  setLogin(false);
                }}
                className="login cursor-pointer border border-2 border-red-500 rounded-full px-2 my-2 text-[12px]"
              >
                logout
              </div> */}

              {/* <div onClick={()=>{setIsLoggedIn(false)}} className="login cursor-pointer border border-2 border-red-500 rounded-full px-2 my-2 text-[12px]"> */}
              {/* </div> */}
              {/* <div className="flex">
                <Time />
                {/* <Compass /> */}
              </div> 
          )}


          {/* <div className="TAG flex px-1 py-[0px] my-[0px] justify-around items-center">
              <div className="border border-1 border-black-100 h-[4px] w-[4px] rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
              <div className="border border-1 border-black-100 h-1 w-1 rounded-full"></div>
              </div> */}
              {isLoggedIn && (
                

              <div style={{
            background: 'rgba(0,0,0,0.5)',
            color: coins > 0 ? '#ffd700' : '#ff6b6b',
            padding: '4px 8px',
            borderRadius: '8px',
            zIndex: 1000,
            fontSize: '12px',
            fontWeight: 'bold',
            border: `1px solid ${coins > 0 ? '#ffd70050' : '#ff000050'}`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            🪙 {coins}
            {/* {coins === 0 && (
                <span>No coins left!</span>
            )} */}
          </div>
          )}

          <a onClick={() => setMenu(!menu)} href="#menu" className="h-[40px]">
            <BookMenuButton />
          </a>
        </div>

        {/* <Login/>  */}


        <>
        {/* {(isLoggedIn === false) } */}
        
        </>
      

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
