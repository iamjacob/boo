"use client";

import { useEffect, useState, useRef } from "react";
import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import Book from "./components/Book";

import Footer from "../Footer";
// import PointerLightWithControls from "./PointerLight";

import Joystick from "./components/Joystick";
import BoooksHeart from "../BoooksHeart";

import { useLevelStore } from '../../stores/useLevelStore';


export default function Page() {

 const level = useLevelStore((s) => s.level);
          const levelUp = useLevelStore((s) => s.levelUp);
          const levelDown = useLevelStore((s) => s.levelDown);


  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);
  const [share, setShare] = useState(false);

  const username = "malte"; // hardcoded for now
  const loggedIn = true; // hardcoded for now
  const loggedInUser = "malte"; // hardcoded for now

  const [onHardPress, setOnHardPress] = useState(false);
  const [music, setMusic] = useState(false);
  // const [top, setTop] = useState();
  // const [left, setLeft] = useState();

  // // Use a ref for timer to avoid closure issues
  // const timerRef = useRef();

  // const handlePointerDown = (e) => {
  //   timerRef.current = setTimeout(() => {
  //     const { clientX, clientY } = e;
  //     setLeft(`${clientX}px`);
  //     setTop(`${clientY}px`);
  //     setOnHardPress(true);
  //   }, 800);
  // };

  // //meant to be pop up opener and nice style extra buttons
  // const handlePointerUp = () => {
  //   clearTimeout(timerRef.current);
  //   if (onHardPress) {
  //    //start animation here

  //     //setOnHardPress(false);
  //     // Vibrate for 200 milliseconds

  //     if (navigator.vibrate) {
  //       navigator.vibrate(200);
  //       // Vibrate in a pattern: vibrate, pause, vibrate
  //       navigator.vibrate([100, 50, 100]);
  //     }
  //     // music ? setMusic(false) : setMusic(true);
  //   }
  // };

  return (
    <div className="fixed top-0 left-0 w-full h-full">
    {/* <div onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} className="fixed top-0 left-0 w-full h-full"> */}
      <Header />
      <Experience drag={drag} setDrag={setDrag}>
        {/* <Joystick/> */}

        {books.map((book, index) => {
          return (
            <Book
              key={book.id}
              {...book}
              scale={[
                book.scale.width,
                book.scale.height,
                book.scale.thickness,
              ]}
              initialPosition={[
                book.position.x,
                book.position.y,
                book.position.z,
              ]}
              initialRotation={[
                book.rotation.x,
                book.rotation.y,
                book.rotation.z,
              ]}
              shelfRadius={6}
              otherBooks={books.filter((b) => b.id !== book.id)}
              id={book.id}
              cover={book.cover.front}
              selectedBook={selectedBook}
              setSelectedBook={setSelectedBook}
              drag={drag}
              setDrag={setDrag}
            />
          );
        })}

        {/* <Lighther/> */}
      </Experience>



{/* 
         {onHardPress ? (
          <div
            className={`absolute ${onHardPress && 'fade-in'} z-50 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur p-6 rounded-xl border border-white/30 flex flex-col items-center justify-center gap-4 max-w-[80vw]`}
            style={{ top: top, left: left, position: 'absolute' }}
          >
            <div onClick={() => setOnHardPress(false)} className="absolute top-0 right-0 text-white bg-black/50 p-2 rounded-full">X</div>
            <a href="#apps"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shapes-icon lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg></a>
            <a href="#like">
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
                className="lucide lucide-heart-icon lucide-heart"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </a>
          </div>
         ) : null} */}


      <div className="absolute z-50 right-0 bottom-[4px] w-screen left-0 flex justify-center items-center">
       {share && 
       (
      <div className="absolute z-50 right-0 bottom-[60px] w-screen left-0 flex justify-center items-center">
        <nav class="flex w-[fit-content] justify-between items-center gap-8 p-4 m-2 bg-black/20 backdrop-blur rounded-lg">
        
        <a href="#instagram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
        <a href="#facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook-icon lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a> 
      <a href="#url"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></a>
      </nav>
      </div>
       )
       }
       
        <nav className="flex w-[fit-content] justify-between items-center gap-8 p-4 m-2 bg-black/20 backdrop-blur rounded-[44px] px-6">
          <a href="#heart" className="relative bottom-[2px]">
            <BoooksHeart width="24" height="24" />
          </a>
          <a href="#center">
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
          <a href="#align/tune/calibrate">
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
          </a>
{/* 
          {loggedIn && loggedInUser === username ? (
            <>
              <a href="#plus">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-cross-icon lucide-cross"
                >
                  <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
                </svg>
              </a>
              <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shapes-icon lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg></a>
            </>
          ) : (
            <></>
          )} 
*/}


          {/* <a href="#share" onClick={() => share ? setShare(false) : setShare(true)}> */}
          <a href="#share">
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
          </a>
         
          {/* Level navigation buttons */}
          {/* <button onClick={levelDown} className="px-3 py-1 rounded bg-black/40 text-white">Level -</button>
          <span className="px-2 text-white">Level: {level}</span>
          <button onClick={levelUp} className="px-3 py-1 rounded bg-black/40 text-white">Level +</button>
        */}
        </nav> 
      </div>


      {/* <PointerLightWithControls /> */}
      {/* <Footer /> */}
    </div>
  );
}
