"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";

import Experience from "./Experience";
import Header from "../Header";
import books from "./boooks.json";
import BottomNav from "./BottomNav";
// import newBookPositions from "./boooks-code.json";
import { Menu, Books } from "./boooks/";

// import { useLevelStore } from "../../stores/useLevelStore";

export default function Page() {
  // const level = useLevelStore((s) => s.level);
  // const levelUp = useLevelStore((s) => s.levelUp);
  // const levelDown = useLevelStore((s) => s.levelDown);
  
  const bookRefs = useRef({}); // Store refs by book id

  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);

  const [selectedMainCat, setSelectedMainCat] = useState('All');
  const [selectedSubCat, setSelectedSubCat] = useState(null);

  // Filtering/animation handler: always animate all books, never filter render
  const handleFilter = (mainCat, subCat) => {
    setSelectedMainCat(mainCat);
    setSelectedSubCat(subCat);
    // Animate all books: matching to filter stay, others fly away
    const newPositions = books.map(book => {
      const basePos = book.position || { x: 0, y: 0, z: 0 };
      const mainMatch = mainCat === "All" || book.categories?.main?.includes(mainCat);
      const subMatch = !subCat || book.categories?.sub?.includes(subCat);
      if (mainMatch && subMatch) {
        return { id: book.id, position: { ...basePos } };
      } else {
        return { id: book.id, position: { ...basePos, y: 14 } };
      }
    });
    animateBooksToNewPositions(newPositions);
  };


    function animateBooksToNewPositions(newBooks) {
    newBooks.forEach((newBook) => {
      const mesh = bookRefs.current[newBook.id];
      if (mesh) {
        gsap.to(mesh.position, {
          x: newBook.position.x,
          y: newBook.position.y,
          z: newBook.position.z,
          duration: 2,
          ease: "power2.out",
        });
      }
    });
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header />
      <Experience drag={drag} setDrag={setDrag} >

        <Books
          books={books}
          selectedMainCat={selectedMainCat}
          selectedSubCat={selectedSubCat}
          bookRefs={bookRefs}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          drag={drag}
          setDrag={setDrag}
        />


      </Experience>


         <Menu
        books={books}
        selectedMainCat={selectedMainCat}
        setSelectedMainCat={setSelectedMainCat}
        selectedSubCat={selectedSubCat}
        setSelectedSubCat={setSelectedSubCat}
        onFilter={handleFilter}
        />

      <BottomNav />

    </div>
  );
}
