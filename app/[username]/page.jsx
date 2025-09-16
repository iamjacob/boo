"use client";

import { useEffect, useState, useRef } from "react";
import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import Book from "./components/Book";

import Footer from "../Footer";
// import PointerLightWithControls from "./PointerLight";

import Joystick from "./components/Joystick";

import BottomNav from "./BottomNav";

import { useLevelStore } from "../../stores/useLevelStore";

export default function Page() {
  const level = useLevelStore((s) => s.level);
  const levelUp = useLevelStore((s) => s.levelUp);
  const levelDown = useLevelStore((s) => s.levelDown);

  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);

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

      <BottomNav />

      {/* <PointerLightWithControls /> */}
      {/* <Footer /> */}
    </div>
  );
}
