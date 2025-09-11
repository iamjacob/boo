"use client";

import { useState } from "react";
import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import Book from "./components/Book";

import Footer from "../Footer";
// import PointerLightWithControls from "./PointerLight";

import Joystick from "./components/Joystick";
import BoooksHeart from "../BoooksHeart";

export default function Page() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full h-full">
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
<div className="absolute z-50 right-0 left-0 bottom-4 m-4 mx-10 rounded flex justify-center items-center p-4 bg-black/20 backdrop-blur">
<nav class="flex justify-between items-center gap-8">

  <a href="#"><BoooksHeart width="24" height="24"/></a>
  <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cross-icon lucide-cross"><path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z"/></svg></a>
  <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg></a>
  <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></a>
  <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat2-icon lucide-repeat-2"><path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/></svg></a>
</nav>
</div>

  {/* <PointerLightWithControls /> */}
  <Footer />
    </div>
  );
}
