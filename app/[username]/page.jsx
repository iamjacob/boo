"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Filter, Books } from "./boooks/";
import { useBooksStore } from "../../stores/useBooksStore";
import { useMenuStore } from "../../stores/useMenuStore";
import { gsap } from "gsap";
import Experience from "./Experience";
import Header from "../Header";
import init from "./boooks.json";
import BottomNav from "./BottomNav";
import Search from "../Search";
import Add from "./Add";
import Timeline from "./timeline/Timeline";
import Levels from "./Levels";
import { useLevelStore } from "../../stores/useLevelStore";
import { useOpenBookStore } from "../../stores/useOpenBookStore";
import { useCameraStore } from "../../stores/useCameraStore";

import TornadoSystem from "./TornadoSystem";
import ThrowCoins from "./ThrowCoins";

// import Map from "../maps/";


export default function Page() {
  const level = useLevelStore((s) => s.level);
  const levelUp = useLevelStore((s) => s.levelUp);
  const levelDown = useLevelStore((s) => s.levelDown);
  
  const bookRefs = useRef({}); // Store refs by book id
  const tornadoRef = useRef(null);
  const [tornadoActive, setTornadoActive] = useState(false);
  
  // Shelf configuration with calculated heights
  const SHELF_CONFIG = useMemo(() => ({
    levels: [
      { id: 1, y: -1.43, baseHeight: -1.8 },  // Bottom shelf
      { id: 2, y: -0.41, baseHeight: -0.8 },   // Second shelf  
      { id: 3, y: 0.655, baseHeight: 0.2 },    // Third shelf
      { id: 4, y: 1.5, baseHeight: 1.2 }       // Top shelf
    ],
    fillOrder: [3, 2, 4, 1], // Middle shelf first, then outward
    radius: 6.5,
    shelfThickness: 0.08
  }), []);

  // Pre-calculated positions for each shelf
  const shelfPositions = useMemo(() => {
    return [
      { id: 1, positions: [
        { x: -1.373081, z: -6.353318 }, { x: -0.848035, z: -6.444442 }, 
        { x: -0.178521, z: -6.497548 }, { x: 0.504387, z: -6.480401 },
        { x: 1.103153, z: -6.405705 }, { x: 1.520536, z: -6.31965 }, 
        { x: -1.826509, z: -6.238098 }
      ]},
      { id: 2, positions: [
        { x: -1.927214, z: -6.207725 }, { x: -1.489202, z: -6.327107 },
        { x: -0.861802, z: -6.442616 }, { x: 0.724871, z: -6.459455 },
        { x: 1.389435, z: -6.349761 }, { x: 1.856746, z: -6.229165 },
        { x: 0.150142, z: -6.498266 }, { x: -0.415756, z: -6.48669 }
      ]},
      { id: 3, positions: [
        { x: -1.84528, z: -6.232571 }, { x: -1.72178, z: -6.267813 },
        { x: -1.242111, z: -6.380216 }, { x: -0.786191, z: -6.452279 },
        { x: -0.37393, z: -6.489235 }, { x: 0.039865, z: -6.499958 },
        { x: 0.690422, z: -6.463228 }, { x: 1.239148, z: -6.380792 },
        { x: 1.89737, z: -6.216911 }
      ]},
      { id: 4, positions: [
        { x: -0.73149, z: -6.458709 }, { x: -0.379287, z: -6.488924 },
        { x: -0.018833, z: -6.499973 }, { x: 0.437679, z: -6.485248 },
        { x: 1.051364, z: -6.414408 }, { x: 1.508958, z: -6.322424 },
        { x: -1.34512, z: -6.359296 }
      ]}
    ];
  }, []);
  
  // Utility functions for book positioning
  const calculateBookHeight = (book) => {
    const scale = book.scale || { height: 1.5 };
    const shelfLevel = SHELF_CONFIG.levels.find(level => 
      Math.abs((book.position?.y || 0) - level.y) < 0.5
    );
    const baseY = shelfLevel ? shelfLevel.baseHeight : 0;
    return baseY + (scale.height / 2) + SHELF_CONFIG.shelfThickness;
  };

  const getShelfPositions = (shelfId) => {
    const shelfData = shelfPositions.find(s => s.id === shelfId);
    const shelfConfig = SHELF_CONFIG.levels.find(l => l.id === shelfId);
    return { 
      positions: shelfData?.positions || [], 
      yLevel: shelfConfig?.y || 0 
    };
  };

  const generateFallbackPosition = (index, shelfY) => {
    const angle = (index * 0.8) + Math.PI;
    return {
      x: Math.cos(angle) * SHELF_CONFIG.radius,
      y: shelfY,
      z: Math.sin(angle) * SHELF_CONFIG.radius
    };
  };
  
  // Book positioning logic
  const assignFilteredPositions = (matchingBooks) => {
    const positions = [];
    let booksPlaced = 0;
    
    for (const shelfId of SHELF_CONFIG.fillOrder) {
      const { positions: shelfSpots, yLevel } = getShelfPositions(shelfId);
      const capacity = shelfSpots.length;
      
      for (let i = 0; i < capacity && booksPlaced < matchingBooks.length; i++) {
        const book = matchingBooks[booksPlaced];
        const position = shelfSpots[i] || generateFallbackPosition(i, yLevel);
        
        positions.push({
          id: book.id,
          position: { x: position.x, y: yLevel, z: position.z }
        });
        
        booksPlaced++;
      }
      
      if (booksPlaced >= matchingBooks.length) break;
    }
    
    return positions;
  };

  const returnToOriginalPositions = () => {
    return books.map(book => ({
      id: book.id,
      position: book.position || { x: 0, y: 0, z: 0 }
    }));
  };
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const {setBooksFromJson} = useBooksStore();
  
  // // const isInit = 
   useEffect(()=>{
     setBooksFromJson(init)
  },[])

  const books = useBooksStore((s) => s.books);
  const searchOpen = useMenuStore((s) => s.searchOpen);
  const add = useMenuStore((s) => s.add);
  const dnaTimeline = useMenuStore((s) => s.dnaTimeline);
  const geo = useMenuStore((s) => s.geo);
  const activeOpenBook = useOpenBookStore((s) => s.activeOpenBook);
  const { setZoom, setPosition, setOrbitRules } = useCameraStore();
  const throwCoins = useMenuStore((s) => s.throwCoins);
  // const filter = useMenuStore((s) => s.FilterOpen);

  // Main filtering handler - clean and simple
  const handleFilter = (mainCat, subCat) => {
    setSelectedMainCat(mainCat);
    setSelectedSubCat(subCat);
    
    // Show all books in original positions
    if (mainCat === "All" && !subCat) {
      animateBooksToNewPositions(returnToOriginalPositions());
      return;
    }
    
    // Filter matching books
    const matchingBooks = books.filter(book => {
      const mainMatch = mainCat === "All" || book.categories?.main?.includes(mainCat);
      const subMatch = !subCat || book.categories?.sub?.includes(subCat);
      return mainMatch && subMatch;
    });
    
    // Generate positions for all books
    const filteredPositions = assignFilteredPositions(matchingBooks);
    const hiddenPositions = books
      .filter(book => !matchingBooks.includes(book))
      .map(book => ({
        id: book.id,
        position: { 
          ...book.position, 
          y: (book.position?.y || 0) + 1, 
          z: -21 
        }
      }));
    
    animateBooksToNewPositions([...filteredPositions, ...hiddenPositions]);
  };



  function animateBooksToNewPositions(newBooks) {
    newBooks.forEach((newBook) => {
      const mesh = bookRefs.current[newBook.id];
      if (mesh) {
        const bookData = books.find(book => book.id === newBook.id);
        const isGoingBehind = newBook.position.z === -21;
        const randomDelay = Math.random() * 0.8; // Random delay between 0-400ms
        
        gsap.to(mesh.position, {
          x: newBook.position.x,
          y: newBook.position.y,
          z: newBook.position.z,
          duration: 2,
          delay: randomDelay,
          ease: "power2.out",
        });
        
        if (isGoingBehind) {
          // Scale to 0 when going behind with staggered delay
          gsap.to(mesh.scale, {
            x: 0, 
            y: 0,
            z: 0,
            duration: 1,
            delay: randomDelay,
            ease: "power2.in",
          });
        } else {
          // Scale back to original size when returning to shelf with staggered delay
          gsap.to(mesh.scale, {
            x: bookData?.scale?.width || 1,
            y: bookData?.scale?.height || 1.5,
            z: bookData?.scale?.thickness || 0.2,
            duration: 1.5,
            delay: 0.5 + randomDelay, // Base delay + random stagger
            ease: "back.out(1.7)",
          });
        }
      }
    });
  }


  // Tornado configuration
  const tornadoConfig = useMemo(() => {
    const bookCount = books.length;
    return {
      bookCount,
      height: Math.max(15, Math.min(25, bookCount * 0.05)) / 1.5,
      radius: Math.max(6, Math.min(12, bookCount * 0.025)) / 3,
      rotationSpeed: 8 // Duration for one full rotation
    };
  }, [books]);

  // Handle tornado activation/deactivation
  useEffect(() => {
    if (geo) {
      // Configure camera for tornado view
      setZoom(0.8);
      setPosition([0, 12, 25]);
      setOrbitRules({
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        minAzimuthAngle: undefined,
        maxAzimuthAngle: undefined,
        enablePan: true,
        minDistance: 8,
        maxDistance: 100,
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
      });

      // Activate tornado
      setTornadoActive(true);
    } else {
      // Deactivate tornado and return books to original positions
      setTornadoActive(false);
      
      // Animate back to shelf positions
      books.forEach((book) => {
        const mesh = bookRefs.current[book.id];
        if (mesh && book.position) {
          // Kill all ongoing animations for this mesh
          gsap.killTweensOf(mesh.rotation);
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);
          
          gsap.to(mesh.position, {
            x: book.position.x,
            y: book.position.y,
            z: book.position.z,
            duration: 2,
            ease: "power2.out",
          });
          
          // Reset rotation
          if (book.rotation) {
            gsap.to(mesh.rotation, {
              x: book.rotation.x,
              y: book.rotation.y,
              z: book.rotation.z,
              duration: 2,
              ease: "power2.out",
            });
          }

          // Reset scale
          gsap.to(mesh.scale, {
            x: book.scale?.width || 1,
            y: book.scale?.height || 1.5,
            z: book.scale?.thickness || 0.2,
            duration: 2,
            ease: "power2.out",
          });
        }
      });

      // Reset camera to original settings
      setZoom(3.5);
      setPosition([0, 0.0001, 5]);
      setOrbitRules({
        minPolarAngle: -Math.PI / 2,
        maxPolarAngle: Math.PI / 2,
        minAzimuthAngle: undefined,
        maxAzimuthAngle: undefined,
        enablePan: false,
        minDistance: 0,
        maxDistance: 16,
        enableDamping: true,
        dampingFactor: 0.4,
        enableZoom: true,
      });
    }
  }, [geo, books, setZoom, setPosition, setOrbitRules]);


  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <Header />
      <Experience drag={drag} setDrag={setDrag}>
        {/* Tornado System - only active when geo is true */}
        {tornadoActive && (
          <group position={[0, -8, 0]}>    {/* Center (current) */}
          <TornadoSystem
            ref={tornadoRef}
            bookCount={tornadoConfig.bookCount}
            height={8}
            radius={tornadoConfig.radius}
            rotationSpeed={tornadoConfig.rotationSpeed}
            books={books}
            bookRefs={bookRefs}
          />
        </group>
        )}

        {throwCoins ? (
          <ThrowCoins 
            books={books}
            bookRefs={bookRefs}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedMainCat={selectedMainCat}
            selectedSubCat={selectedSubCat}
            drag={drag}
            setDrag={setDrag}
          />
        ) : (
          <>
            {/* Regular Books without physics */}
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
          </>
        )}

      </Experience>

      {searchOpen && (<div className="flex justify-center items-center absolute top-0 left-0 w-screen h-screen"><Search /></div>)}

      {add && <Add />}

      {dnaTimeline && <Timeline />}

      {/* Level system with confetti */}
      <Levels />

      {/* FilterMenu */}
      <Filter
        books={books}
        selectedMainCat={selectedMainCat}
        setSelectedMainCat={setSelectedMainCat}
        selectedSubCat={selectedSubCat}
        setSelectedSubCat={setSelectedSubCat}
        onFilter={handleFilter}
      />

      {!activeOpenBook && <BottomNav />}
    </div>
  );
}
