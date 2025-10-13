"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Filter, Books } from "./boooks/";
import { useBooksStore } from "../../stores/useBooksStore";
import { useBookInfoStore } from "../../stores/useBookInfoStore";
import { gsap } from "gsap";
import Experience from "./Experience";
import Header from "../Header";
import init from "./boooks.json";
import BottomNav from "./BottomNav";
import BottomNavDrag from "./BottomNavDrag";
import Search from "../Search";
import Add from "./AddReal";
import Timeline from "./timeline/Timeline";
import Levels from "./Levels";
import { useLevelStore } from "../../stores/useLevelStore";
import { useOpenBookStore } from "../../stores/useOpenBookStore";
import { useCameraStore } from "../../stores/useCameraStore";
import { useMenuStore } from "../../stores/useMenuStore";

import TornadoSystem from "./TornadoSystem";
import ThrowCoins from "./ThrowCoins";

// import Map from "../maps/";

import BookForm from "./components/book_form_stepper";
//

export default function Page() {
  const level = useLevelStore((s) => s.level);
  const levelUp = useLevelStore((s) => s.levelUp);
  const levelDown = useLevelStore((s) => s.levelDown);
  const addOpen = useMenuStore((s) => s.add);
  
  const {
    selectedBook: infoBook,
    showBookInfo,
    hideBookInfo,
  } = useBookInfoStore();

  // Debug logging
  // console.log('Book info state:', { showBookInfo, infoBook: infoBook?.title });

  const bookRefs = useRef({}); // Store refs by book id
  const tornadoRef = useRef(null);
  const [tornadoActive, setTornadoActive] = useState(false);

  // Shelf configuration with calculated heights
  const SHELF_CONFIG = useMemo(
    () => ({
      levels: [
        { id: 1, y: -1.43, baseHeight: -1.8 }, // Bottom shelf
        { id: 2, y: -0.41, baseHeight: -0.8 }, // Second shelf
        { id: 3, y: 0.655, baseHeight: 0.2 }, // Third shelf
        { id: 4, y: 1.5, baseHeight: 1.2 }, // Top shelf
      ],
      fillOrder: [3, 2, 4, 1], // Middle shelf first, then outward
      radius: 6.5,
      shelfThickness: 0.08,
    }),
    []
  );

  // Pre-calculated positions for each shelf
  const shelfPositions = useMemo(() => {
    return [
      {
        id: 1,
        positions: [
          { x: -1.373081, z: -6.353318 },
          { x: -0.848035, z: -6.444442 },
          { x: -0.178521, z: -6.497548 },
          { x: 0.504387, z: -6.480401 },
          { x: 1.103153, z: -6.405705 },
          { x: 1.520536, z: -6.31965 },
          { x: -1.826509, z: -6.238098 },
        ],
      },
      {
        id: 2,
        positions: [
          { x: -1.927214, z: -6.207725 },
          { x: -1.489202, z: -6.327107 },
          { x: -0.861802, z: -6.442616 },
          { x: 0.724871, z: -6.459455 },
          { x: 1.389435, z: -6.349761 },
          { x: 1.856746, z: -6.229165 },
          { x: 0.150142, z: -6.498266 },
          { x: -0.415756, z: -6.48669 },
        ],
      },
      {
        id: 3,
        positions: [
          { x: -1.84528, z: -6.232571 },
          { x: -1.72178, z: -6.267813 },
          { x: -1.242111, z: -6.380216 },
          { x: -0.786191, z: -6.452279 },
          { x: -0.37393, z: -6.489235 },
          { x: 0.039865, z: -6.499958 },
          { x: 0.690422, z: -6.463228 },
          { x: 1.239148, z: -6.380792 },
          { x: 1.89737, z: -6.216911 },
        ],
      },
      {
        id: 4,
        positions: [
          { x: -0.73149, z: -6.458709 },
          { x: -0.379287, z: -6.488924 },
          { x: -0.018833, z: -6.499973 },
          { x: 0.437679, z: -6.485248 },
          { x: 1.051364, z: -6.414408 },
          { x: 1.508958, z: -6.322424 },
          { x: -1.34512, z: -6.359296 },
        ],
      },
    ];
  }, []);

  // Utility functions for book positioning
  const calculateBookHeight = (book) => {
    const scale = book.scale || { height: 1.5 };
    const shelfLevel = SHELF_CONFIG.levels.find(
      (level) => Math.abs((book.position?.y || 0) - level.y) < 0.5
    );
    const baseY = shelfLevel ? shelfLevel.baseHeight : 0;
    return baseY + scale.height / 2 + SHELF_CONFIG.shelfThickness;
  };

  const getShelfPositions = (shelfId) => {
    const shelfData = shelfPositions.find((s) => s.id === shelfId);
    const shelfConfig = SHELF_CONFIG.levels.find((l) => l.id === shelfId);
    return {
      positions: shelfData?.positions || [],
      yLevel: shelfConfig?.y || 0,
    };
  };

  const generateFallbackPosition = (index, shelfY) => {
    const angle = index * 0.8 + Math.PI;
    return {
      x: Math.cos(angle) * SHELF_CONFIG.radius,
      y: shelfY,
      z: Math.sin(angle) * SHELF_CONFIG.radius,
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
          position: { x: position.x, y: yLevel, z: position.z },
        });

        booksPlaced++;
      }

      if (booksPlaced >= matchingBooks.length) break;
    }

    return positions;
  };

  const returnToOriginalPositions = () => {
    return books.map((book) => ({
      id: book.id,
      position: book.position || { x: 0, y: 0, z: 0 },
    }));
  };

  // Stack books function - creates beautiful stack like in the image
  const createStackPositions = () => {
    const stackCenter = { x: 0, y: -1.5, z: 0 }; // Start at -1.5 like before
    const maxOffset = 0.1; // Small offset for natural look
    let currentHeight = stackCenter.y;

    return books.map((book, index) => {
      // Get actual book thickness for proper stacking
      const bookThickness = book.scale?.thickness || 0.2;

      // Create slight random variations for natural stacking (only X/Z, no rotation)
      const randomOffsetX = (Math.random() - 0.5) * maxOffset;
      const randomOffsetZ = (Math.random() - 0.5) * maxOffset;

      // Calculate position for this book
      const position = {
        x: stackCenter.x + randomOffsetX,
        y: currentHeight + bookThickness / 2, // Center the book at this height
        z: stackCenter.z + randomOffsetZ,
      };

      // Add this book's thickness for the next book
      currentHeight += bookThickness;

      return {
        id: book.id,
        position,
        rotation: {
          x: Math.PI / 2, // 90 degrees - lay the book flat
          y: Math.PI, // 180 degrees - align all spines in same direction
          z: 0,
        },
      };
    });
  };

  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const { setBooksFromJson } = useBooksStore();

  // iOS-style long press to activate drag mode
  const longPressTimer = useRef(null);
  const visualIndicatorTimer = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showVisualIndicator, setShowVisualIndicator] = useState(false);

  // Handle long press start with delayed visual feedback
  const handleLongPressStart = () => {
    setIsLongPressing(true);
    // Delay showing visual indicator by 150ms
    visualIndicatorTimer.current = setTimeout(() => {
      setShowVisualIndicator(true);
    }, 150);
  };

  // Handle long press end
  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    setShowVisualIndicator(false);
    if (visualIndicatorTimer.current) {
      clearTimeout(visualIndicatorTimer.current);
      visualIndicatorTimer.current = null;
    }
  };

  // // const isInit =
  useEffect(() => {
    setBooksFromJson(init);
  }, []);

  const books = useBooksStore((s) => s.books);
  const searchOpen = useMenuStore((s) => s.searchOpen);
  const add = useMenuStore((s) => s.add);
  const dnaTimeline = useMenuStore((s) => s.dnaTimeline);
  const geo = useMenuStore((s) => s.geo);
  const stackBooks = useMenuStore((s) => s.stackBooks);
  const activeOpenBook = useOpenBookStore((s) => s.activeOpenBook);
  const { setZoom, setPosition, setOrbitRules } = useCameraStore();
  const throwCoins = useMenuStore((s) => s.throwCoins);
  const profileOpen = useMenuStore((s) => s.profileOpen);

  // Add event listener for book stacking from Menu component
  useEffect(() => {
    const handleStackBooks = (event) => {
      const { stackPositions } = event.detail;
      console.log(
        "📚 Received stack books event with positions:",
        stackPositions
      );

      // Update camera rules for stack view
      setOrbitRules({
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        minAzimuthAngle: undefined,
        maxAzimuthAngle: undefined,
        enablePan: true,
        minDistance: 4,
        maxDistance: 20,
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
      });

      // Animate books to stack positions with beautiful staggered effect
      stackPositions.forEach((stackBook, index) => {
        const mesh = bookRefs.current[stackBook.id];
        if (mesh) {
          // Kill all ongoing animations for this mesh
          gsap.killTweensOf(mesh.rotation);
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);

          // Staggered animation delay for dramatic effect
          const staggerDelay = index * 0.08; // 80ms between each book

          gsap.to(mesh.position, {
            x: stackBook.position.x,
            y: stackBook.position.y,
            z: stackBook.position.z,
            duration: 1.5 + Math.random() * 0.5, // Slightly random duration
            delay: staggerDelay,
            ease: "power3.out",
          });

          // Animate rotation for natural stacking look
          if (stackBook.rotation) {
            gsap.to(mesh.rotation, {
              x: stackBook.rotation.x,
              y: stackBook.rotation.y,
              z: stackBook.rotation.z,
              duration: 1.5,
              delay: staggerDelay,
              ease: "power2.out",
            });
          }

          // Ensure scale is correct
          const book = books.find((b) => b.id === stackBook.id);
          gsap.to(mesh.scale, {
            x: book?.scale?.width || 1,
            y: book?.scale?.height || 1.5,
            z: book?.scale?.thickness || 0.2,
            duration: 1.5,
            delay: staggerDelay,
            ease: "back.out(1.2)",
          });
        }
      });
    };

    // Add event listener
    window.addEventListener("stackBooks", handleStackBooks);

    // Cleanup
    return () => {
      window.removeEventListener("stackBooks", handleStackBooks);
    };
  }, [books, setOrbitRules]);

  // Watch for profile state changes to return books to shelf when profile closes
  useEffect(() => {
    if (!profileOpen) {
      // Profile was closed, return books to their original shelf positions
      console.log("📚 Profile closed, returning books to shelf...");

      // Reset camera rules to original shelf view
      setOrbitRules({
        minPolarAngle: Math.PI / 2 - Math.PI / 14,
        maxPolarAngle: Math.PI / 2 + Math.PI / 14,
        minAzimuthAngle: -Math.PI / 14,
        maxAzimuthAngle: Math.PI / 14,
        dampingFactor: 0.05,
        enablePan: false,
        minDistance: 3,
        maxDistance: 8,
        enableDamping: true,
        enableZoom: true,
      });

      // Return books to original shelf positions
      books.forEach((book, index) => {
        const mesh = bookRefs.current[book.id];
        if (mesh && book.position) {
          // Kill all ongoing animations for this mesh
          gsap.killTweensOf(mesh.rotation);
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);

          // Reverse staggered animation (from top of stack down)
          const reverseIndex = books.length - index - 1;
          const staggerDelay = reverseIndex * 0.06; // Faster return animation

          gsap.to(mesh.position, {
            x: book.position.x,
            y: book.position.y,
            z: book.position.z,
            duration: 2,
            delay: staggerDelay,
            ease: "power2.out",
          });

          // Reset rotation to original shelf rotation
          if (book.rotation) {
            gsap.to(mesh.rotation, {
              x: book.rotation.x,
              y: book.rotation.y,
              z: book.rotation.z,
              duration: 2,
              delay: staggerDelay,
              ease: "power2.out",
            });
          }

          // Reset scale to original
          gsap.to(mesh.scale, {
            x: book?.scale?.width || 1,
            y: book?.scale?.height || 1.5,
            z: book?.scale?.thickness || 0.2,
            duration: 2,
            delay: staggerDelay,
            ease: "back.out(1.2)",
          });
        }
      });
    }
  }, [profileOpen, books, setOrbitRules]);

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
    const matchingBooks = books.filter((book) => {
      const mainMatch =
        mainCat === "All" || book.categories?.main?.includes(mainCat);
      const subMatch = !subCat || book.categories?.sub?.includes(subCat);
      return mainMatch && subMatch;
    });

    // Generate positions for all books
    const filteredPositions = assignFilteredPositions(matchingBooks);
    const hiddenPositions = books
      .filter((book) => !matchingBooks.includes(book))
      .map((book) => ({
        id: book.id,
        position: {
          ...book.position,
          y: (book.position?.y || 0) + 1,
          z: -21,
        },
      }));

    animateBooksToNewPositions([...filteredPositions, ...hiddenPositions]);
  };

  function animateBooksToNewPositions(newBooks) {
    newBooks.forEach((newBook) => {
      const mesh = bookRefs.current[newBook.id];
      if (mesh) {
        const bookData = books.find((book) => book.id === newBook.id);
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
      rotationSpeed: 8, // Duration for one full rotation
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

  // Handle stack books activation/deactivation
  useEffect(() => {
    if (stackBooks) {
      // Configure camera for stack view
      setZoom(2.5);
      setPosition([0, 2, 8]);
      setOrbitRules({
        minPolarAngle: 0,
        maxPolarAngle: Math.PI / 2,
        minAzimuthAngle: undefined,
        maxAzimuthAngle: undefined,
        enablePan: true,
        minDistance: 4,
        maxDistance: 20,
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
      });

      // Create stacked positions
      const stackPositions = createStackPositions();

      // Animate books to stack positions with beautiful staggered effect
      stackPositions.forEach((stackBook, index) => {
        const mesh = bookRefs.current[stackBook.id];
        if (mesh) {
          // Kill all ongoing animations for this mesh
          gsap.killTweensOf(mesh.rotation);
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);

          // Staggered animation delay for dramatic effect
          const staggerDelay = index * 0.08; // 80ms between each book

          gsap.to(mesh.position, {
            x: stackBook.position.x,
            y: stackBook.position.y,
            z: stackBook.position.z,
            duration: 1.5 + Math.random() * 0.5, // Slightly random duration
            delay: staggerDelay,
            ease: "power3.out",
          });

          // Animate rotation for natural stacking look
          if (stackBook.rotation) {
            gsap.to(mesh.rotation, {
              x: stackBook.rotation.x,
              y: stackBook.rotation.y,
              z: stackBook.rotation.z,
              duration: 1.5,
              delay: staggerDelay,
              ease: "power2.out",
            });
          }

          // Ensure scale is correct
          const book = books.find((b) => b.id === stackBook.id);
          gsap.to(mesh.scale, {
            x: book?.scale?.width || 1,
            y: book?.scale?.height || 1.5,
            z: book?.scale?.thickness || 0.2,
            duration: 1.5,
            delay: staggerDelay,
            ease: "back.out(1.2)",
          });
        }
      });
    } else {
      // Return books to original shelf positions
      books.forEach((book, index) => {
        const mesh = bookRefs.current[book.id];
        if (mesh && book.position) {
          // Kill all ongoing animations for this mesh
          gsap.killTweensOf(mesh.rotation);
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);

          // Reverse staggered animation (from top of stack down)
          const reverseIndex = books.length - index - 1;
          const staggerDelay = reverseIndex * 0.06; // Faster return animation

          gsap.to(mesh.position, {
            x: book.position.x,
            y: book.position.y,
            z: book.position.z,
            duration: 2,
            delay: staggerDelay,
            ease: "power2.out",
          });

          // Reset rotation
          if (book.rotation) {
            gsap.to(mesh.rotation, {
              x: book.rotation.x,
              y: book.rotation.y,
              z: book.rotation.z,
              duration: 2,
              delay: staggerDelay,
              ease: "power2.out",
            });
          }

          // Reset scale
          gsap.to(mesh.scale, {
            x: book.scale?.width || 1,
            y: book.scale?.height || 1.5,
            z: book.scale?.thickness || 0.2,
            duration: 2,
            delay: staggerDelay,
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
  }, [stackBooks, books, setZoom, setPosition, setOrbitRules]);

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      {!activeOpenBook && <Header />}

      {/* Long press visual indicator */}
      {showVisualIndicator && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                Hold to activate drag mode...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Drag mode indicator - moved to bottom */}
      {/* {drag && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Drag Mode Active</span>
            {selectedBook && (
              <span className="text-sm opacity-75">
                {selectedBook.title}
              </span>
            )}
            <button
              onClick={() => setDrag(false)}
              className="ml-2 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              title="Exit drag mode"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )} */}

      <Experience
        drag={drag}
        setDrag={setDrag}
        isLongPressing={isLongPressing}
        onLongPressStart={handleLongPressStart}
        onLongPressEnd={handleLongPressEnd}
        onDragToggle={(newDragState) => setDrag(newDragState)}
        onClick={(e) => {
          // Close book info when clicking on 3D scene background
          if (showBookInfo) {
            hideBookInfo();
          }
        }}
      >
        {/* Tornado System - only active when geo is true */}
        {tornadoActive && (
          <group position={[0, -8, 0]}>
            {" "}
            {/* Center (current) */}
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

      {/* Debug info */}
      {/* {showBookInfo && (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          DEBUG: showBookInfo = {showBookInfo.toString()}, book = {infoBook?.title || 'none'}
        </div>
      )} */}

      {/* Book Info Overlay */}
      {showBookInfo && infoBook && (
        <div className="absolute bottom-4 left-4 pointer-events-auto clickable-element">
          <div className="bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/30 text-white max-w-xs relative clickable-element">
            {/* Close button */}
            {/* <button
              onClick={hideBookInfo}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors text-lg"
            >
              ✕
            </button> */}

            {/* Open book button */}
            <button
              onClick={() => {
                const { toggleBook, setBookObject } =
                  useOpenBookStore.getState();
                toggleBook(infoBook);
                setBookObject(infoBook);
                hideBookInfo(); // Close info overlay when opening book
              }}
              className="absolute top-2 right-8 text-white/60 hover:text-white transition-colors text-sm"
              title="Open Book"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"
              >
                <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                <path d="m21 3-9 9" />
                <path d="M15 3h6v6" />
              </svg>
            </button>

            <h3 className="font-semibold text-sm mb-1 pr-12">
              {infoBook.title || "Untitled"}
            </h3>
            {infoBook.author && (
              <p className="text-xs text-gray-300">by {infoBook.author}</p>
            )}
            {infoBook.year && (
              <p className="text-xs text-gray-400">{infoBook.year}</p>
            )}
            {infoBook.categories?.main && (
              <div className="mt-2 flex flex-wrap gap-1">
                {infoBook.categories.main.map((cat, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/20 px-2 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="flex justify-center items-center absolute top-0 left-0 w-screen h-screen clickable-element">
          <Search />
        </div>
      )}

      {addOpen && (
        <div className="clickable-element">
          <BookForm />
          {/* <Add /> */}
        </div>
      )}

      {dnaTimeline && (
        <div className="clickable-element">
          <Timeline />
        </div>
      )}

      {/* Level system with confetti */}
      <div className="clickable-element">
        <Levels />
      </div>

      {/* FilterMenu */}
      <div className="clickable-element">
        <Filter
          books={books}
          selectedMainCat={selectedMainCat}
          setSelectedMainCat={setSelectedMainCat}
          selectedSubCat={selectedSubCat}
          setSelectedSubCat={setSelectedSubCat}
          onFilter={handleFilter}
        />
      </div>

      {!activeOpenBook && !addOpen && !drag && (
        <div className="clickable-element">
          <BottomNav />
        </div>
      )}

      {drag && (
        <div className="clickable-element">
          <BottomNavDrag />
        </div>
      )}

    </div>
  );
}
