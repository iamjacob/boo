"use client";

import MovieSearch from "./Search";
import { Suspense, useEffect, useState } from "react";
import Loading from "./Loading";
import Header from './Header'

//import CameraComponent from "./Camera";

export default function Home() {
  // const [browse, setBrowse] = useState(false);
  const [camera, setCamera] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);

  // // ✅ pill toggle handler
  // ✅ Pill toggle handler
  function toggle(el: HTMLElement) {
    if (!el.classList.contains("pill-selected")) {
      el.classList.add("pill-selected");
    } else {
      el.classList.remove("pill-selected");
    }
  }

  // function toggle(el: HTMLElement) {
  //   if(!el. match class pill-selected)
  //   el.className="pill-selected"
  // else remove classname pill selected
  // document.startViewTransition(() => {
  //   const chosen = document.getElementById("chosen")!;
  //   const nonchosen = document.getElementById("nonchosen")!;

  //   if (el.parentNode?.id === "chosen") {
  //     chosen.removeChild(el);
  //     nonchosen.className="pill-selected"
  //     nonchosen.appendChild(el);
  //   } else {
  //     nonchosen.removeChild(el);
  //     nonchosen.className="pill"
  //     chosen.appendChild(el);
  //   }
  // });
  // }

  // const toggleBrowse = () => {
  //   setBrowse(!browse);
  // };

  const toggleCam = () => {
    // alert('any')
    setCamera(!camera);
  };

  return (
    <Suspense fallback={<Loading progress={50} />}>
      <div className="font-sans flex flex-col items-center justify-between h-screen">
      <Header/>

        <main className="flex flex-col h-screen justify-around">
          {/* <div className="onboarding">
              <h1
                className="text-4xl md:text-8xl font-light text-center text-transparent
                  bg-clip-text bg-gradient-to-r  from-gray-100/50 via-white to-gray-100/50 drop-shadow-sm"
              >
                Welcome to the Starry Earth Scene
              </h1>
            </div> */}

          {/* <div className="viewFromMatch"></div> */}
          {/* <div className="quick">QUICK</div> */}

          {/* ✅ pills with toggle */}

          <div className="filters flex flex-col items-center w-[80vw] md:w-[50vw]">
            <div className="search-all-inclusive">
              {/*MAIN LOGO*/}
              {/* <div className="logo w-full flex justify-around relative absolute">
                <div className="absolute bottom-[6px]">
                  <div className="-rotate-44 absolute">
                    <BoooksHeart width="150" height="150" />
                    <div>
                      <div className="">
                        <BoooksFull />
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

              <div className="btn text-center" onClick={toggleCam}>
                camera
                {/* camera toggle */}
              </div>

              {camera && (
                <div className="absolute top-0 left-0 w-screen h-[50vh] bg-gray-500 flex flex-col justify-around items-center text-center">
                  <h1>Grant access to camera</h1>
                  <div className="flex justify-around w-[200px]">
                    <button onClick={toggleCam} className="px-4 py-2 rounded-full bg-white/50 border border-2 border-white/50">Next time</button>
                    <button className="px-4 py-2 rounded-full bg-white border border-2 border-white">Now</button>
                  </div>
                </div>
              )}

              <MovieSearch />

              {/* <div className="search__field--magnifierIcon p-2">🔍</div> */}
              {/* <div className="search__options flex">
              <div className="search__options--voice">(audio)</div>
              <div className="search__options--camera">(camera)</div>
              </div> */}

              {/* <div className="filters__horizontalRuler my-5 h-[1px] w-[500px] bg-gray-400"></div> */}
            </div>
          </div>

          {/* <CameraComponent/> */}
        </main>

        {/* <div className="scroll flex flex-col items-center justify-center">
          Scroll for Scrolls
          <div className="scroll__animation">
          <div className="scroll__animation--arrow animate-bounce">⬇</div>
          </div>
          </div> */}
      </div>


      <footer className="fixed bottom-0 flex w-screen p-2 gap-4 flex-wrap items-center justify-center text-xs">
        <a href="">Vision</a>|<a href="">Non-profit</a>|<a href="">Privacy</a>
      </footer>
    </Suspense>
  );
}
