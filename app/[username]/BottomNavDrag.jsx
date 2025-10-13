import React, { useState, useEffect } from "react";
// import { useDragStore } from "../stores/useDragStore";

const BottomNavDrag = () => {
  // const { throwCoins} = useDragStore();
  // const filter = useMenuStore((s) => s.FilterOpen);
  // const scanner = useMenuStore((s) => s.scannerActive);
  // const toggleScanner = useMenuStore((s) => s.setScannerActive);
  // const { levelUp, level, levelDown } = useLevelStore();

  return (
    <>
      <div
        className={`absolute z-1000 right-0 w-screen left-0 flex justify-center items-center bottom-1 transition-all duration-500 ease-in-out`}
      >
        <nav className="flex w-[fit-content] justify-between items-center gap-1 rounded-[44px] px-6">
          

          <a
            href="#filter"
            className={`
               "border-[#ff000050]"
             border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
            onClick={() => {
              // toggleFilter(!filter);
            }}
          >
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
              className="lucide lucide-rotate3d-icon lucide-rotate-3d"
            >
              <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" />
              <path d="m15.194 13.707 3.814 1.86-1.86 3.814" />
              <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />
            </svg>
          </a>

          <a
            href="#story"
            // onClick={() => toggleDnaTimeline()}
            className={`border-[#ff000050]"
             border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
          >
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
              className="lucide lucide-step-back-icon lucide-step-back"
            >
              <path d="M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
            </svg>
          </a>

          <div className="flex flex-col items-center gap-[2px]">
            <a
              href="#up"
              onClick={() => console.log("yup")}
              className={`border-[#ff000050]"
               p-3 backdrop-blur bg-black/20 rounded-[44px] border border-1`}
            >
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
                className="lucide rotate-[-90deg] lucide-skip-forward-icon lucide-skip-forward"
              >
                <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
              </svg>
            </a>
<a
            href="#stopDrag"
            className={`
               "border-[#ff000050]"
             border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
            onClick={() => {
              // toggleFilter(!filter);
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </a>
            <a
              href="#down"
              onClick={() => console.log("down")}
              className={`border-[#ff000050] border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
            >
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
                className="lucide rotate-[90deg] lucide-skip-forward-icon lucide-skip-forward"
              >
                <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
              </svg>
            </a>
          </div>

          <a
            href="#right"
            onClick={() => console.log("search / ???")}
            className={`border-[#ff000050] border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
          >
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
              className="lucide lucide-step-back-icon lucide-step-back rotate-180"
            >
              <path d="M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
            </svg>
          </a>
          <a
            href="#save"
            onClick={() => console.log("save?")}
            className={`border-[#ff000050] border border-1 bg-black/20 p-3 backdrop-blur rounded-[44px]`}
          >
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
              className="lucide lucide-save-icon lucide-save"
            >
              <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
              <path d="M7 3v4a1 1 0 0 0 1 1h7" />
            </svg>
          </a>
        </nav>
      </div>
    </>
  );
};

export default BottomNavDrag;
