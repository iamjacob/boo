"use client";

import { useState, useRef, useMemo,useEffect } from "react";
import { gsap } from "gsap";
import Experience from "./Experience";
import Header from "../Header";
import init from "./boooks.json";
import BottomNav from "./BottomNav";
import { Filter, Books } from "./boooks/";
import Search from "../Search";
import Add from "./Add";
import { useMenuStore } from "../../stores/useMenuStore";
import { useBooksStore } from "../../stores/useBooksStore";
import Timeline from "./timeline/Timeline";

// import { useLevelStore } from "../../stores/useLevelStore";

export default function Page() {
  // const level = useLevelStore((s) => s.level);
  // const levelUp = useLevelStore((s) => s.levelUp);
  // const levelDown = useLevelStore((s) => s.levelDown);
  const {setBooksFromJson} = useBooksStore();


  const bookRefs = useRef({}); // Store refs by book id
  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState(null);



  // // const isInit = 
   useEffect(()=>{
     setBooksFromJson(init)
  },[])

  // console.log('is init ' + isInit)

  const books = useBooksStore((s) => s.books);
  const searchOpen = useMenuStore((s) => s.searchOpen);
  const add = useMenuStore((s) => s.add);
  const dnaTimeline = useMenuStore((s) => s.dnaTimeline);

  // Filtering/animation handler: always animate all books, never filter render
  const handleFilter = (mainCat, subCat) => {
    setSelectedMainCat(mainCat);
    setSelectedSubCat(subCat);
    // Animate all books: matching to filter stay, others fly away
    const newPositions = books.map((book) => {
      const basePos = book.position || { x: 0, y: 0, z: 0 };
      const mainMatch =
        mainCat === "All" || book.categories?.main?.includes(mainCat);
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

  const geo = useMenuStore((s) => s.geo);

  // Calculate tornado target positions for each book
  const tornadoPositions = useMemo(() => {
    const bookCount = books.length;
    const height = 10;
    const radius = 4;
    return books.map((book, i) => {
      const t = i / (bookCount - 1);
      const r = radius * (1 - Math.pow(t, 1.2));
      const angle = t * Math.PI * 16;
      const x = r * Math.cos(angle);
      const y = height * (1 - t);
      const z = r * Math.sin(angle);
      return {
        id: book.id,
        position: [x, y, z],
        rotation: [0, Math.atan2(Math.cos(angle), -Math.sin(angle)), t * Math.PI * 0.5],
      };
    });
  }, [books]);

  // Animate books to tornado positions when geo changes to true
  useEffect(() => {
    if (geo) {
      // gsap.to(mesh.rotation on the tornado!!!! 360degress wuhuuuu! :D
      tornadoPositions.forEach((tp) => {
        const mesh = bookRefs.current[tp.id];
        if (mesh) {
          gsap.to(mesh.position, {
            x: tp.position[0],
            y: tp.position[1],
            z: tp.position[2],
            duration: 2,
            ease: "power2.out",
          });
          gsap.to(mesh.rotation, {
            x: tp.rotation[0],
            y: tp.rotation[1],
            z: tp.rotation[2],
            duration: 2,
            ease: "power2.out",
          });
        }
      });
    } else {
      // Animate back to shelf positions
      books.forEach((book) => {
        const mesh = bookRefs.current[book.id];
        if (mesh && book.position) {
          gsap.to(mesh.position, {
            x: book.position.x,
            y: book.position.y,
            z: book.position.z,
            duration: 2,
            ease: "power2.out",
          });
          if (book.rotation) {
            gsap.to(mesh.rotation, {
              x: book.rotation.x,
              y: book.rotation.y,
              z: book.rotation.z,
              duration: 2,
              ease: "power2.out",
            });
          }
        }
      });
    }
  }, [geo, tornadoPositions, books]);


  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header />
      <Experience drag={drag} setDrag={setDrag}>
        {/* Always render Books, animate positions with GSAP */}
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

      {searchOpen && (<div className="flex justify-center items-center absolute top-0 left-0 w-screen h-screen"><Search /></div>)}

      {add && <Add />}

      {dnaTimeline && <Timeline />}

      {/* FilterMenu */}
      <Filter
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
