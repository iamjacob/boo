"use client";
import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, CameraControls, Gltf, useGLTF, Html } from "@react-three/drei";
// import { Stars, OrbitControls } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useEffect } from "react";

// import { degToRad } from "three/src/math/MathUtils.js";
// import { Godray } from "./Godray";
// import { WebGPURenderer } from "three/webgpu";

import BooksStand from "./components/BooksStand";
import Shelves from "./Shelves";
import OpenBook from "./components/OpenBook_test";
// import { Physics } from "@react-three/rapier";
// import useShelvesStore from "../../stores/shelves/useShelvesStore";
// import useBookExperienceStore from "../../stores/experience/useBookExperienceStore";
// import Book from "./components/Book_test";
// import BookPhysics from "./components/BookPhysics";
// import ShelvesPhysics from "./components/ShelvesPhysics";
// import Floor from "./components/Floor";
// import BackgroundWall from "./components/BackgroundWall";

export const Experience = ({children}) => {
  const BOOK_STAND_COUNT = 8;
  const RADIUS = 3;
  const [activeBookstand, setActiveBookstand] = useState(0);
  const [orbitControls, setOrbitControls] = useState(null);

  const CameraZoom = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.zoom = 3.5;
      camera.updateProjectionMatrix();
    }, [camera]);
    return null;
  };

  // Move camera to active bookstand
  useEffect(() => {
    if (!orbitControls) return;
    const angle = (activeBookstand / BOOK_STAND_COUNT) * 2 * Math.PI;
    const x = Math.cos(angle) * RADIUS * 2.2;
    const z = Math.sin(angle) * RADIUS * 2.2;
    orbitControls.target.set(0, 0, 0);
    orbitControls.object.position.set(x, 0.5, z);
    orbitControls.update();
  }, [activeBookstand, orbitControls]);

  // Swipe support
  useEffect(() => {
    let startX = null;
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          setActiveBookstand((prev) => (prev - 1 + BOOK_STAND_COUNT) % BOOK_STAND_COUNT);
        } else {
          setActiveBookstand((prev) => (prev + 1) % BOOK_STAND_COUNT);
        }
      }
      startX = null;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  const StudioLighting = () => (
    <>
    <ambientLight intensity={1} />
    <directionalLight position={[0, 10, 0]} intensity={1.5} />
    <directionalLight position={[10, 10, 5]} intensity={0.5} />
    <directionalLight position={[-10, -10, -5]} intensity={0.3} />
    <directionalLight position={[-10, -10, -5]} intensity={30} color={"#ff0000"}/>
  </>
);


// const controls = useThree((state) => state.controls);
// const animate = async () => {
//   controls.setLookAt(0, 0.5, -5, 0, 1.5, -2);
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   controls.smoothTime = 0.8;
//   await controls.setLookAt(5, 2, -5, 0, 2, -2, true);
//   controls.smoothTime = 0.4;
//   await controls.setLookAt(-5, 0.5, 5, -1, 2, -2, true);
// };

// useEffect(() => {
//   if (!controls) {
//     return;
//   }
//   animate();
// }, [controls]);


// const [isLoading, setIsLoading] = useState(true);
// const { setShelvesFromData, selectedShelf } = useShelvesStore();
// const { selectedBook, isBookOpen, isOpenBookVisible, openedBook, selectBook, openBook } = useBookExperienceStore();
// const canvasRef = useRef(null);

  // useEffect(() => {
    //   if (shelvesData?.shelves && userData?.books) {
      //     setShelvesFromData(shelvesData.shelves, shelvesData.shelfSlug);
      //     setIsLoading(false);
      //   }
      // }, [shelvesData, userData, setShelvesFromData]);
      
      // const getBookDataById = (bookID) => {
        //   const book = userData.books.find((b) => b.id === bookID);
        //   if (!book) return null;
        //   return {
          //     bookID: book.id,
          //     title: book.title,
          //     cover: book.coverImages[0] || "https://example.com/default.jpg",
          //     dimensions: book.scale || [0.4, 0.7, 0.2],
          //     pages: book.pageCount || 200,
          //     position: book.position || [0, -0.43, -6.5],
          //     rotation: book.rotation || [0, 0, 0],
          //   };
          // };
          
          // const handleBookSelection = (bookID) => {
            //   selectBook(bookID);
            // };
            
            // const handleBookOpen = (bookID) => {
              //   const bookData = getBookDataById(bookID);
              //   if (bookData) {
  //     openBook(bookData);
  //   }
  // };
  
  // if (isLoading) {
    //   return <div>Loading...</div>;
    // }
    
    const [frameloop, setFrameloop] = useState("never");
    
    
    useEffect(() => {
      const splash = document.getElementById("splash");
      
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, []);
    
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas className="fixed top-0 left-0 w-full h-full bg-gray-900"
          camera={{ position: [0, 0, 5], fov: 75 }}>
          {Array.from({ length: BOOK_STAND_COUNT }).map((_, i) => {
            const angle = (i / BOOK_STAND_COUNT) * 2 * Math.PI;
            const x = Math.cos(angle) * RADIUS;
            const z = Math.sin(angle) * RADIUS;
            return (
              <BooksStand key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}
                active={i === activeBookstand} />
            );
          })}

          <Shelves />

          <Html position={[12,8,2]} center>
            <div className="text-white text-3xl">Welcome to the 3D Boooks Experience</div>
          </Html>
          <Html position={[-12,8,2]} center>
            <div className="text-white text-3xl w-fit">Add a new scene</div>
          </Html>
          <Html position={[0,8,-12]} center>
            <div className="text-white text-3xl w-fit">History (infinite shelf)</div>
          </Html>
          <Html position={[0,8,12]} center>
            <div className="text-white text-3xl w-fit">Maps</div>
          </Html>

          {children}

          <CameraZoom />
          <OrbitControls
            ref={setOrbitControls}
            enableDamping={true}
            dampingFactor={0.4}
            enableZoom={true}
            minDistance={2}
            minPolarAngle={-Math.PI / 2}
          />
          <StudioLighting />
          <Stars />
        </Canvas>
        {/* Navigation UI */}
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, pointerEvents: 'auto' }}>
          <button
            style={{ padding: '12px 18px', fontSize: 24, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand((prev) => (prev - 1 + BOOK_STAND_COUNT) % BOOK_STAND_COUNT)}
            aria-label="Previous Bookstand"
          >←</button>
          <button
            style={{ padding: '12px 18px', fontSize: 24, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand(0)}
            aria-label="Home"
          >HOME</button>
          <button
            style={{ padding: '12px 18px', fontSize: 24, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand((prev) => (prev + 1) % BOOK_STAND_COUNT)}
            aria-label="Next Bookstand"
          >→</button>
        </div>
      </div>
    );
};

export default Experience;