import { useState, useEffect } from 'react';

export default function SideNavigation() {
  const [hoveringLeft, setHoveringLeft] = useState(false);
  const [hoveringRight, setHoveringRight] = useState(false);
  const [leftCounter, setLeftCounter] = useState(0);
  const [rightCounter, setRightCounter] = useState(0);

  useEffect(() => {
    let interval;
    if (hoveringLeft) {
      interval = setInterval(() => {
        setLeftCounter((prev) => {
          console.log(`left: ${prev + 1}`);
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [hoveringLeft]);

  useEffect(() => {
    let interval;
    if (hoveringRight) {
      interval = setInterval(() => {
        setRightCounter((prev) => {
          console.log(`right: ${prev + 1}`);
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [hoveringRight]);

  return (
    <>
      {/* Left Arrow */}
      <aside
        className="fixed left-0 top-[5%] h-[90vh] w-[4%] m-[3vh_1vh] flex items-center justify-around rounded-lg border border-neutral-800 bg-black/50 transition-all duration-200 cursor-pointer hover:bg-black/20 hover:border hover:border-neutral-800"
        onPointerOver={() => setHoveringLeft(true)}
        onPointerOut={() => setHoveringLeft(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          className="scale-150 hover:fill-black"
          fill="#e8eaed"
        >
          <path d="M440-280v-400L240-480l200 200Zm80 160h80v-720h-80v720Z" />
        </svg>
      </aside>

      {/* Right Arrow */}
      <aside
        className="fixed right-0 top-[5%] h-[90vh] w-[4%] m-[3vh_1vh] flex items-center justify-around rounded-lg border border-neutral-800 bg-black/50 transition-all duration-200 cursor-pointer hover:bg-black/20 hover:border hover:border-neutral-800"
        onPointerOver={() => setHoveringRight(true)}
        onPointerOut={() => setHoveringRight(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          className="scale-150 hover:fill-black"
          fill="#e8eaed"
        >
          <path d="M360-120v-720h80v720h-80Zm160-160v-400l200 200-200 200Z" />
        </svg>
      </aside>

      {/* Navigation Sidebar */}
      <nav className="fixed top-[40%] right-[2%] flex flex-col items-center gap-1 bg-black/40 p-2 rounded-xl border border-transparent">
        <img src="https://jacobg.me/logo.php?color=FF0000" alt="Logo" className="w-[30px]" />
        {[
          "M856-390 570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM513-160l286-286-353-354H160v286l353 354Z",
          "M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z",
          "M320-40q-33 0-56.5-23.5T240-120v-720q0-33 23.5-56.5T320-920h320q33 0 56.5 23.5T720-840v720q0 33-23.5 56.5T640-40H320Zm0-80h320v-720H320v720Zm160-440q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0-80q-17 0-28.5-11.5T440-680q0-17 11.5-28.5T480-720q17 0 28.5 11.5T520-680q0 17-11.5 28.5T480-640Zm-80 240q17 0 28.5-11.5T440-440q0-17-11.5-28.5T400-480q-17 0-28.5 11.5T360-440q0 17 11.5 28.5T400-400Zm160 0q17 0 28.5-11.5T600-440q0-17-11.5-28.5T560-480q-17 0-28.5 11.5T520-440q0 17 11.5 28.5T560-400ZM400-280q17 0 28.5-11.5T440-320q0-17-11.5-28.5T400-360q-17 0-28.5 11.5T360-320q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320q0-17-11.5-28.5T560-360q-17 0-28.5 11.5T520-320q0 17 11.5 28.5T560-280ZM400-160q17 0 28.5-11.5T440-200q0-17-11.5-28.5T400-240q-17 0-28.5 11.5T360-200q0 17 11.5 28.5T400-160Zm160 0q17 0 28.5-11.5T600-200q0-17-11.5-28.5T560-240q-17 0-28.5 11.5T520-200q0 17 11.5 28.5T560-160Z",
          "M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
        ].map((d, i) => (
          <a key={i} href="#" className="rounded-lg border border-neutral-800 hover:border-white p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e8eaed"
            >
              <path d={d} />
            </svg>
          </a>
        ))}
      </nav>
    </>
  );
}
