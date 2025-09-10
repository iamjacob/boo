"use client";
import { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
  CameraControls,
  Gltf,
  useGLTF,
  Html,
} from "@react-three/drei";
// import { Stars, OrbitControls } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useEffect } from "react";

// import { degToRad } from "three/src/math/MathUtils.js";
// import { Godray } from "./Godray";
// import { WebGPURenderer } from "three/webgpu";

import BooksStand from "./components/BooksStand";
import Shelves from "./Shelves";
// import OpenBook from "./components/OpenBook_test";
import { gsap } from "gsap";
import { useControls } from "leva";
// import { Physics } from "@react-three/rapier";
// import useShelvesStore from "../../stores/shelves/useShelvesStore";
// import useBookExperienceStore from "../../stores/experience/useBookExperienceStore";
// import Book from "./components/Book_test";
// import BookPhysics from "./components/BookPhysics";
// import ShelvesPhysics from "./components/ShelvesPhysics";
// import Floor from "./components/Floor";
// import BackgroundWall from "./components/BackgroundWall";

export const Experience = ({ children }) => {
  const BOOK_STAND_COUNT = 8;
  const RADIUS = 3;
  const [activeBookstand, setActiveBookstand] = useState(0);
  const [orbitControls, setOrbitControls] = useState(null);

  const [toggleReading, setToggleReading] = useState(null);
  const controlsRef = useRef();
  const cameraRef = useRef();

  // const CameraZoom = () => {
  //   const { camera } = useThree();
  //   useEffect(() => {
  //     camera.zoom = 3.5;
  //     camera.updateProjectionMatrix();
  //   }, [camera]);
  //   return null;
  // };

const toggleCones = () => {
  setToggleReading(!toggleReading);
}

const resetCamera = () => {
  const controls = controlsRef.current;
  const camera = cameraRef.current;
  if (!controls || !camera) return;

  // Temporarily disable controls damping
  const prevDamping = controls.enableDamping;
  controls.enableDamping = false;

  gsap.to(camera.position, {
    x: 0,
    y: 0.0002,
    z: 5,
    duration: 1.2,
    ease: "power2.out",
    onUpdate: () => {
      controls.target.set(0, 0, 0);
      controls.update();
    },
    onComplete: () => {
      controls.enableDamping = prevDamping; // restore damping
    },
  });
};


  // BIG CAMERA SCENE

  // Move camera to active bookstand
  // Animate camera movement to active bookstand using GSAP

  useEffect(() => {
    if (!orbitControls) return;
    const angle = (activeBookstand / BOOK_STAND_COUNT) * 2 * Math.PI;
    const x = Math.cos(angle) * RADIUS * 2.2;
    const z = Math.sin(angle) * RADIUS * 2.2;

    // Animate camera position
    gsap.to(orbitControls.object.position, {
      x,
      y: 0.5,
      z,
      duration: 1,
      onUpdate: () => {
        orbitControls.target.set(0, 0, 0);
        orbitControls.update();
      },
    });
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
          setActiveBookstand(
            (prev) => (prev - 1 + BOOK_STAND_COUNT) % BOOK_STAND_COUNT
          );
        } else {
          setActiveBookstand((prev) => (prev + 1) % BOOK_STAND_COUNT);
        }
      }
      startX = null;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const StudioLighting = () => (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 10, 0]} intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={30}
        color={"#ff0000"}
      />
    </>
  );

  // const handleBookSelection = (bookID) => {
  //   selectBook(bookID);
  // };

  // const handleBookOpen = (bookID) => {
  //   const bookData = getBookDataById(bookID);
  //   if (bookData) {
  //     openBook(bookData);
  //   }
  // };

  const [frameloop, setFrameloop] = useState("never");

  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);


// // add leva controls for camera rotation
// const { cameraRotateX, cameraRotateY, cameraRotateZ } = useControls('Camera Rotation', {
//   cameraRotateX: { value: 0.002, min: -Math.PI, max: Math.PI, step: 0.01 },
//   cameraRotateY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
//   cameraRotateZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
// });

// const rotateLEVA = [cameraRotateX, cameraRotateY, cameraRotateZ];

// // Update camera rotation live when LEVA controls change
// useEffect(() => {
//   if (cameraRef.current) {
//     cameraRef.current.rotation.set(cameraRotateX, cameraRotateY, cameraRotateZ);
//     cameraRef.current.updateProjectionMatrix();
//   }
// }, [cameraRotateX, cameraRotateY, cameraRotateZ]);



  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        className="fixed top-0 left-0 w-full h-full bg-gray-900"
        camera={{ position: [0, 0.0002, 5], rotation: [0, 0, 0], fov: 75, zoom: 3.5 }}
        frameloop="always"
        onCreated={({ camera }) => {
          cameraRef.current = camera; // 👈 store camera reference
          camera.updateProjectionMatrix();
        }}
      >

        {toggleReading && (
          Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / BOOK_STAND_COUNT) * 2 * Math.PI;
            const x = Math.cos(angle) * RADIUS;
            const z = Math.sin(angle) * RADIUS;
            return (
              <BooksStand key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}
                active={i === activeBookstand} />
            );
          })
        )}

        {/* <OpenBook
          book={readingNow}
          position={[0, -1.5, -2]}
          rotation={[-0.1, 0, 0]}
          scale={[0.7, 0.7, 0.7]}
        />
         */}
         

        <Shelves />

        {/* <Html position={[12,8,2]} center>
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
          </Html> */}

        {children}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.4}
          enableZoom
          minDistance={2}
          maxDistance={20}
        />

        {/* <CameraZoom />
          <OrbitControls
            ref={setOrbitControls}
            enableDamping={true}
            dampingFactor={0.4}
            enableZoom={true}
            minDistance={2}
            minPolarAngle={-Math.PI / 2}
          /> */}
        <StudioLighting />
        <Stars />
      </Canvas>

      <div
        onClick={resetCamera}
        className="absolute bottom-22 right-10 z-50 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-orbit-icon lucide-orbit"
        >
          <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
          <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
        </svg>
      </div>

      <div onClick={toggleCones} className="absolute bottom-44 right-10 z-50 cursor-pointer">

        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cone-icon lucide-cone"><path d="m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98"/><ellipse cx="12" cy="19" rx="9" ry="3"/></svg>
      </div>

      {/* Navigation UI
         <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, pointerEvents: 'auto' }}>
          <button
            style={{ padding: '12px 18px', fontSize: 20, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand((prev) => (prev - 1 + BOOK_STAND_COUNT) % BOOK_STAND_COUNT)}
            aria-label="Previous Bookstand"
          >←</button>
          <button
            style={{ padding: '12px 18px', fontSize: 20, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand(0)}
            aria-label="Home"
          >HOME</button>
          <button
            style={{ padding: '12px 18px', fontSize: 20, borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setActiveBookstand((prev) => (prev + 1) % BOOK_STAND_COUNT)}
            aria-label="Next Bookstand"
          >→</button>
        </div>  */}
    </div>
  );
};

export default Experience;
