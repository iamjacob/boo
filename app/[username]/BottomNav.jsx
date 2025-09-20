import React, { useState } from "react";
import BoooksHeart from "../BoooksHeart";
import { Cast, CastIcon, Fullscreen } from "lucide-react";
import FullScreen from "../Fullscreen";
const BottomNav = () => {
  const [share, setShare] = useState(false);

  return (
    <>
    <div className="absolute z-50 right-0 bottom-0 w-screen left-0 flex justify-center items-center">
      {share && (
        <div className="absolute z-50 right-0 bottom-[0px] w-screen left-0 flex justify-center items-center">
          <nav className="flex w-[fit-content] justify-between items-center p-1 bg-black/20 backdrop-blur rounded-lg">
            <a href="#instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram-icon lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="#facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook-icon lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#url">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-link-icon lucide-link"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          </nav>
        </div>
      )}

      <nav className="flex w-[fit-content] justify-between items-center gap-1 rounded-[44px] px-6">
       
    
        {/* <a href="#align/tune/calibrate">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-house-icon lucide-house"
          >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </a> */}

        {/* 
          {loggedIn && loggedInUser === username ? (<>    ) : ( )} 
        */}

{/* <CastIcon color="#fff" height={24} width={24}/> */}
{/* <FullScreen/> */}
        <a href="#story"  className=" bg-black/20 p-3 backdrop-blur rounded-[44px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="bg-green-5 rotate-45"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#fff"
          >
            <path d="M200-40v-40q0-139 58-225.5T418-480q-102-88-160-174.5T200-880v-40h80v40q0 11 .5 20.5T282-840h396q1-10 1.5-19.5t.5-20.5v-40h80v40q0 139-58 225.5T542-480q102 88 160 174.5T760-80v40h-80v-40q0-11-.5-20.5T678-120H282q-1 10-1.5 19.5T280-80v40h-80Zm138-640h284q13-19 22.5-38t17.5-42H298q8 22 17.5 41.5T338-680Zm142 148q20-17 39-34t36-34H405q17 17 36 34t39 34Zm-75 172h150q-17-17-36-34t-39-34q-20 17-39 34t-36 34ZM298-200h364q-8-22-17.5-41.5T622-280H338q-13 19-22.5 38T298-200Z" />
          </svg>
        </a>


<div className="flex flex-col gap-[2px]">
  
        <a href="#readingNowz"  className=" bg-black/20 p-3 backdrop-blur rounded-[44px] border border-1 border-[#ff000050]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#fff"
            >
            <path d="M480-60q-72-68-165-104t-195-36v-440q101 0 194 36.5T480-498q73-69 166-105.5T840-640v440q-103 0-195.5 36T480-60Zm0-104q63-47 134-75t146-37v-276q-73 13-143.5 52.5T480-394q-66-66-136.5-105.5T200-552v276q75 9 146 37t134 75Zm0-436q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-760q0-33-23.5-56.5T480-840q-33 0-56.5 23.5T400-760q0 33 23.5 56.5T480-680Zm0-80Zm0 366Z" />
          </svg>
        </a>
          <a href="#plus"  className="p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-cross-icon lucide-cross"
              >
              <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
            </svg>
          </a>


            </div>

    <a href="#search" className=" bg-black/20 p-3 backdrop-blur rounded-[44px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-search-icon lucide-search"
          >
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
          </svg>
        </a>


        {/* <a href="#share" onClick={() => share ? setShare(false) : setShare(true)}> */}
        {/* <a href="#share" onClick={() => setShare(!share)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-repeat2-icon lucide-repeat-2"
          >
            <path d="m2 9 3-3 3 3" />
            <path d="M13 18H7a2 2 0 0 1-2-2V6" />
            <path d="m22 15-3 3-3-3" />
            <path d="M11 6h6a2 2 0 0 1 2 2v10" />
          </svg>
        </a> */}

        {/* Level navigation buttons */}
          {/* <button onClick={levelDown} className="px-3 py-1 rounded bg-black/40 text-white">Level -</button>
          <span className="px-2 text-white">Level: {level}</span>
          <button onClick={levelUp} className="px-3 py-1 rounded bg-black/40 text-white">Level +</button>
         */}
      </nav>
    </div>
    {/* bg-[#d100f645]  */}
      <div className="sideflow fixed right-[8px] top-[50vh] p-1 rounded-full bg-[#d100f610]">
        <a href="#menu-profile">
         <BoooksHeart/>
        </a>
      </div>
    </>

  );
};

export default BottomNav;
