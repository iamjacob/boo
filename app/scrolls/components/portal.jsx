import { CameraControls, Html, RoundedBox, useCursor } from "@react-three/drei";
// import { BookOpen, Eye, Earth, ChevronDown } from "lucide-react";
import * as THREE from "three";
import { easing } from "maath";
import { useFrame, useThree } from "@react-three/fiber";
import {
  //MeshReflectorMaterial,
  MeshPortalMaterial,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  SpotLightHelperComponent,
  DirectionalLightHelperComponent,
} from "./LightHelpers";
import { gsap } from "gsap";

import Frame from "./frame";
import Shelves from "./../../[username]/components/Shelves";
import Book from "./../../[username]/components/Book";
import booksData from "./../../[username]/boooks.json";

export const Portal = ({id}) => {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  useCursor(hovered);
  
  // Get camera from the parent Canvas context
  const { camera } = useThree();

  // Create refs for the lights
  const spotLightRef = useRef();
  const directionalLightRef = useRef();

  useEffect(() => {
    if (!camera) return;
    
    let gsapTween = null;
    
    if (active === id) {
      // Portal is active - zoom in the camera for better view
      gsapTween = gsap.to(camera, {
        zoom: 4.5, // Higher zoom like main experience
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      });

      // Also animate camera position for proper framing
      gsap.to(camera.position, {
        z: 2, // Closer to portal content
        duration: 1.2,
        ease: "power2.out",
      });
    } else {
      // Portal is not active - return to overview position
      gsapTween = gsap.to(camera, {
        zoom: 1, // Overview zoom
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      });

      gsap.to(camera.position, {
        z: 2.5, // Original position from Short.tsx
        duration: 1.2,
        ease: "power2.out",
      });
    }

    // Cleanup function to kill GSAP tween if component unmounts
    return () => {
      if (gsapTween) {
        gsapTween.kill();
      }
    };
  }, [active, id, camera]);

  return (
    <>
      {/* Lights with helpers */}
      {/* <spotLight ref={spotLightRef} position={[0, 0, 3]} intensity={0.3} />
      <SpotLightHelperComponent lightRef={spotLightRef} />

      <DirectionalLightHelperComponent
        lightRef={directionalLightRef}
        size={10}
      /> */}

      <LibStage
        id={id}
        active={active}
        setActive={setActive}
        hovered={true}
        setHovered={setHovered}
      />
    </>
  );
};

const LibStage = ({
  id,
  active,
  setActive,
  // hovered,
  setHovered,
  ...props
}) => {
  const portalMaterial = useRef();
  
  // Books state for the portal
  const [selectedBook, setSelectedBook] = useState(null);
  const [drag, setDrag] = useState(false);
  const bookRefs = useRef({});
  
  // Custom double-click handling refs
  const clickTimeoutRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const DOUBLE_CLICK_DELAY = 300; // milliseconds

  // Cleanup timeouts on unmount to prevent DOM errors
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      // Clear book refs to prevent memory leaks
      if (bookRefs.current) {
        bookRefs.current = {};
      }
    };
  }, []);

  // Get books from books.json - use original positions from array
  const portalBooks = useMemo(() => {
    if (!booksData || !Array.isArray(booksData)) {
      console.warn('Books data not loaded or invalid');
      return [];
    }
    
    // Use exactly the same positions as in the main experience
    return booksData.slice(0, 15).map((book, index) => {
      return {
        ...book,
        // Keep original positions exactly as they are in the JSON
        position: {
          x: book.position?.x || 0,
          y: book.position?.y || 0,
          z: book.position?.z || 0
        },
        scale: {
          width: book.scale?.width || 0.3,
          height: book.scale?.height || 0.44,
          thickness: book.scale?.thickness || 0.07
        },
        rotation: {
          x: book.rotation?.x || 0,
          y: book.rotation?.y || 0,
          z: book.rotation?.z || 0
        },
        cover: {
          front: book.cover?.front || "./books/covers/000.jpg",
          back: book.cover?.back || "./books/covers/000.jpg",
          spine: book.cover?.spine || "./books/covers/000.jpg",
        }
      };
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;
    
    if (timeDiff < DOUBLE_CLICK_DELAY) {
      // Double click detected!
      console.log('🎯 Double-click detected on portal!');
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      setActive(active === id ? null : id);
    } else {
      // First click - wait to see if there's a second one
      lastClickTimeRef.current = now;
      clickTimeoutRef.current = setTimeout(() => {
        // Single click action (if needed)
        console.log('👆 Single click on portal');
        clickTimeoutRef.current = null;
      }, DOUBLE_CLICK_DELAY);
    }
  }, [active, id, setActive]);

  // Smoothly ease the "blend" property of your MeshPortalMaterial every frame.
  useFrame((_state, delta) => {
    if (!portalMaterial.current) return;
    const worldOpen = active === id;
    easing.damp(portalMaterial.current, "blend", worldOpen ? 1 : 0, 0.4, delta);
  });

  // const myBookData = {
  //   cover: {
  //     front: "./books/covers/000.jpg",
  //     back: "./books/covers/000.jpg",
  //     spine: "./books/covers/000.jpg",
  //   },
  // };

  return (
    <group {...props}>
      <Html transform
          className="text-black text-[4px] top-[-20px] absolute left-1/2 -translate-x-1/2"
        >
          {id}
        </Html>
      <RoundedBox
        name={id}
        scale={0.5}
        args={[2, 3, 0.001]}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(id)}
        onPointerLeave={() => setHovered(null)}
        className="cursor-pointer"
      >
        

        <MeshPortalMaterial
          side={THREE.FrontSide}
          ref={portalMaterial}
          blend={active === id ? 1 : 0}
        >
          <Suspense loading={"loading"}>
            <mesh position={[0, 0, 0]}>
              <ambientLight />
              <Shelves position={[0, 0, 0]} />

              {/* Books loop from books.json */}
              {portalBooks.length > 0 ? portalBooks.map((book, index) => (
                <Book
                  key={`portal-${id}-book-${book.id}`} // Unique key to prevent React conflicts
                  ref={el => {
                    if (el && bookRefs.current && book.id) {
                      bookRefs.current[book.id] = el;
                    }
                  }}
                  bookID={book.id}
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
                  shelfRadius={3} // Smaller radius for portal
                  otherBooks={portalBooks.filter((b) => b.id !== book.id)}
                  id={book.id}
                  cover={book.cover?.front || "./books/covers/000.jpg"}
                  selectedBook={selectedBook}
                  setSelectedBook={setSelectedBook}
                  drag={drag}
                  setDrag={setDrag}
                  bookObject={book}
                  title={book.title || "Untitled"}
                  author={book.author || "Unknown Author"}
                />
              )) : (
                // Fallback if no books loaded
                <Html center className="text-white text-xs">
                  Loading books...
                </Html>
              )}

              {/* Exit button when portal is active */}
              {active === id && (
                <Html 
                  transform 
                  position={[0.8, 1.2, 0.1]} 
                  className="pointer-events-auto"
                  style={{ userSelect: 'none' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActive(null);
                    }}
                    className="w-8 h-8 bg-black/80 hover:bg-black/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-white/40"
                    title="Exit Portal"
                    style={{ 
                      fontSize: '16px',
                      lineHeight: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </Html>
              )}

            </mesh>
          </Suspense>
        </MeshPortalMaterial>

        <Frame />
      </RoundedBox>

      {/* if mobile then this else this ${} */}
          
      {/* <Html transform className="touch-auto">
      <div className={` relative z-[50000] scale-[0.2] right-[-60px] top-[0vh] flex flex-col gap-2 pointer-events-none text-center gap-4 items-center touch-none`}>
                <BoooksHeart width="30" height="30"/>
                <Eye className="w-6 h-6 text-black" />
                200M views <br />
                s<SquareLibrary className="w-6 h-6 text-black" />
                books read 
                <BookOpen className="w-6 h-6 text-black" />
                reading now
                <Calendar className="w-6 h-6 text-black" />
                born 
                <Earth className="w-6 h-6 text-black" />
                location
                <ChevronDown/>
              </div>
      </Html> */}
    </group>
  );
};
