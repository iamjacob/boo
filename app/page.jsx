"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import Search from "./Search";
import Loading from "./Loading";
import Header from "./Header";
import Footer from "./Footer";
import HeaderInfo from "./HeaderInfo";

import { useRouter } from "next/navigation"; // eller "next/router" afhængig af version

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  const lastTap = useRef(0);

  const handlePointerDown = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      router.push("/scanner"); // send til scanner
    }
    lastTap.current = now;
  };

  
  return (
    <Suspense fallback={<Loading progress={50} />}>
      <div
        onPointerDown={handlePointerDown}
        style={{ touchAction: "manipulation" }}
        className="font-sans flex flex-col items-center justify-between w-[100dvw] h-[100dvh]"
      >
        <Header />

        {/* Denne har nice svg's til min onboarding  */}
        {/* <HeaderInfo/> */}
        <main className="flex flex-col h-screen w-screen justify-center items-center">
          <div className="filters flex flex-col items-center w-[80vw] md:w-[50vw]">
            <div className="search-all-inclusive">
              <Search />
            </div>
          </div>
        </main>

        {/* {ai/agent/mascot} */}
        {/* <div class='speech-bubble'>Hello!</div> */}

        {/* <div className="TAG p-2 flex gap-1 items-center group cursor-pointer">
          <div
            className="border border-2 border-red-500 h-2 w-2 rounded-full group-hover:animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="border border-2 border-red-500 h-3 w-3 rounded-full group-hover:animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="border border-2 border-red-500 h-2 w-2 rounded-full group-hover:animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
        </div> */}

        {/* Denne footer skal ned i bunden af evt. in menu.. */}
        {/* <Footer /> */}
      </div>
    </Suspense>
  );
}
