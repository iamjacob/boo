"use client";
import { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {Stars, OrbitControls} from "@react-three/drei";
import ChunkedAudioPlayer from "../ChunkedAudioPlayer";
import BooksStand from "./components/BooksStand";
import FullScreen from "../Fullscreen";
import { useControls } from "leva";
import Shelves from "./Shelves";
import { gsap } from "gsap";
// import {useCameraStore} from '../stores/useCameraStore'
import { useCameraStore } from '../../stores/useCameraStore'

//zoom: 3.5,
//rotation: [0, 0, 0],

// import {LighterWithControls, Lighter} from "./lighterHelper";
// import { Stars, OrbitControls } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useEffect } from "react";
// import { degToRad } from "three/src/math/MathUtils.js";
// import { Godray } from "./Godray";
// import { WebGPURenderer } from "three/webgpu";
// import OpenBook from "./components/OpenBook_test";

// import { Physics } from "@react-three/rapier";
// import useShelvesStore from "../../stores/shelves/useShelvesStore";
// import useBookExperienceStore from "../../stores/experience/useBookExperienceStore";
// import Book from "./components/Book_test";
// import BookPhysics from "./components/BookPhysics";
// import ShelvesPhysics from "./components/ShelvesPhysics";
// import Floor from "./components/Floor";
// import BackgroundWall from "./components/BackgroundWall";
// import { LighterWithControls, Lighter } from "./lighterHelper";

export const Experience = ({ children, drag, setDrag }) => {

// Inside Experience component
const zoom = useCameraStore((s) => s.zoom);
const rotation = useCameraStore((s) => s.rotation);
const position = useCameraStore((s) => s.position);
const setZoom = useCameraStore((s) => s.setZoom);
const setRotation = useCameraStore((s) => s.setRotation);
const setPosition = useCameraStore((s) => s.setPosition);
const smooth = useCameraStore((s) => s.smooth);
const setSmooth = useCameraStore((s) => s.setSmooth);

const setOrbitRules = useCameraStore((s) => s.setOrbitRules);

useEffect(() => {
    setOrbitRules({
      minPolarAngle: Math.PI / 2 - Math.PI / 14,
      maxPolarAngle: Math.PI / 2 + Math.PI / 14,
      minAzimuthAngle: -Math.PI / 14,
      maxAzimuthAngle: Math.PI / 14,
    });

}, [setOrbitRules]);

const {
  minPolarAngle,
  maxPolarAngle,
  minAzimuthAngle,
  maxAzimuthAngle,
  dampingFactor,
  enablePan,
  minDistance,
  maxDistance,
  enableDamping,
  enableZoom,
} = useCameraStore();

// console.log('setOrbitRules:', setOrbitRules);
// console.log('useCameraStore:', useCameraStore);

  const BOOK_STAND_COUNT = 8;
  const RADIUS = 3;

  const [activeBookstand, setActiveBookstand] = useState(0);
  const [orbitControls, setOrbitControls] = useState(null);
  const [toggleReading, setToggleReading] = useState(null);
  const [music, setMusic] = useState(null);

  //const [drag, setDrag] = useState(false);
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
  };

  const resetCamera = () => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    // Temporarily disable controls damping
    const prevDamping = controls.enableDamping;
    controls.enableDamping = false;

    if (smooth) {
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
    } else {
      camera.position.set(0, 0.0002, 5);
      controls.target.set(0, 0, 0);
      controls.update();
      controls.enableDamping = prevDamping;
    }
  };

  // BIG CAMERA SCENE

  // Move camera to active bookstand
  // Animate camera movement to active bookstand using GSAP

  // useEffect(() => {
  //   if (!orbitControls) return;
  //   const angle = (activeBookstand / BOOK_STAND_COUNT) * 2 * Math.PI;
  //   const x = Math.cos(angle) * RADIUS * 2.2;
  //   const z = Math.sin(angle) * RADIUS * 2.2;

  //   if (smooth) {
  //     gsap.to(orbitControls.object.position, {
  //       x,
  //       y: 0.5,
  //       z,
  //       duration: 1,
  //       onUpdate: () => {
  //         orbitControls.target.set(0, 0, 0);
  //         orbitControls.update();
  //       },
  //     });
  //   } else {
  //     orbitControls.object.position.set(x, 0.5, z);
  //     orbitControls.target.set(0, 0, 0);
  //     orbitControls.update();
  //   }
  // }, [activeBookstand, orbitControls, smooth]);

  // // Swipe support
  // useEffect(() => {
  //   let startX = null;
  //   const handleTouchStart = (e) => {
  //     startX = e.touches[0].clientX;
  //   };
  //   const handleTouchEnd = (e) => {
  //     if (startX === null) return;
  //     const endX = e.changedTouches[0].clientX;
  //     const diff = endX - startX;
  //     if (Math.abs(diff) > 50) {
  //       if (diff > 0) {
  //         setActiveBookstand(
  //           (prev) => (prev - 1 + BOOK_STAND_COUNT) % BOOK_STAND_COUNT
  //         );
  //       } else {
  //         setActiveBookstand((prev) => (prev + 1) % BOOK_STAND_COUNT);
  //       }
  //     }
  //     startX = null;
  //   };
  //   window.addEventListener("touchstart", handleTouchStart);
  //   window.addEventListener("touchend", handleTouchEnd);
  //   return () => {
  //     window.removeEventListener("touchstart", handleTouchStart);
  //     window.removeEventListener("touchend", handleTouchEnd);
  //   };
  // }, []);

  const StudioLighting = () => (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 10, 0]} intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <directionalLight position={[-10, -10, -5]} intensity={2} />
    </>
  );

  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  // Sync camera live with Zustand store
useEffect(() => {
  const camera = cameraRef.current;
  if (!camera) return;
  // Fallback/default if position is not a valid array
  const safePosition = Array.isArray(position) && position.length === 3
    ? position
    : [0, 0.0001, 5];
  const safeRotation = Array.isArray(rotation) && rotation.length === 3
    ? rotation
    : [0, 0, 0];
  camera.position.set(...safePosition);
  camera.rotation.set(...safeRotation);
  camera.zoom = typeof zoom === 'number' ? zoom : 3.5;
  camera.updateProjectionMatrix();
}, [position, rotation, zoom]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* <LighterWithControls /> */}
      <Canvas
        className="fixed top-0 left-0 w-full h-full bg-gray-900"
        camera={{
          position,
          rotation,
          fov: 75,
          zoom,
        }}
        frameloop="always"
        onCreated={({ camera }) => {
          cameraRef.current = camera; // 👈 store camera reference
          camera.updateProjectionMatrix();
        }}
      >

        {/* <Lighter /> */}
        {toggleReading &&
          Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / BOOK_STAND_COUNT) * 2 * Math.PI;
            const x = Math.cos(angle) * RADIUS;
            const z = Math.sin(angle) * RADIUS;
            return (
              <BooksStand
                key={i}
                position={[x, 0, z]}
                rotation={[0, -angle + Math.PI / 2, 0]}
                active={i === activeBookstand}
              />
            );
          })}

        <Shelves />

        {children}

        {/* <OrbitControls
          minPolarAngle={-Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          // minAzimuthAngle={Math.PI/2}
          // maxAzimuthAngle={Math.PI/2}
          dampingFactor={0.4}
          enablePan={false}
          ref={controlsRef}
          minDistance={4}
          maxDistance={8}
          enableDamping
          enableZoom
        /> */}

        
<OrbitControls
  minPolarAngle={minPolarAngle}
  maxPolarAngle={maxPolarAngle}
  minAzimuthAngle={minAzimuthAngle}
  maxAzimuthAngle={maxAzimuthAngle}
  dampingFactor={dampingFactor}
  enablePan={enablePan}
  ref={controlsRef}
  minDistance={minDistance}
  maxDistance={maxDistance}
  enableDamping={enableDamping}
  enableZoom={enableZoom}
/>
        <StudioLighting />
        <Stars />

        {/* minPolarAngle, maxPolarAngle, and minAzimuthAngle, maxAzimuthAngle */}
        {/* <Lighter intensity={0.5} position={[-5, 5, 5]} color="white" /> */}
        {/* Pointer light with helper and Leva controls */}
        {/* <LighterWithControls /> */}
      </Canvas>



{/* <div className="fixed top-40 right-8 z-50 flex gap-2 bg-black/40 p-2 rounded text-white">
  <button onClick={() => setZoom(Math.max(zoom - 0.1, 2))}>-</button>
  <span>Zoom: {zoom.toFixed(2)}</span>
  <button onClick={() => setZoom(Math.min(zoom + 0.1, 5))}>+</button>
  <button onClick={() => setRotation([rotation[0], rotation[1] - 0.05, rotation[2]])}>⟲</button>
  <button onClick={() => setRotation([rotation[0], rotation[1] + 0.05, rotation[2]])}>⟳</button>
  <button onClick={() => setSmooth(smooth)}>{smooth ? 'Smooth: On' : 'Smooth: Off'}</button>
</div> */}

       <div className="flex fixed bottom-32 right-4 flex-col gap-4 z-50">
        <div onClick={toggleCones} className="cursor-pointer">
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
            className="lucide lucide-cone-icon lucide-cone"
          >
            <path d="m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98" />
            <ellipse cx="12" cy="19" rx="9" ry="3" />
          </svg>
        </div>

        <div onClick={resetCamera} className="cursor-pointer">
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

        <div onClick={()=>{setDrag(!drag)}} className="move">
          {drag ? (
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
              className="lucide lucide-hand-icon lucide-hand"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          ) : (
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
              className="lucide lucide-hand-grab-icon lucide-hand-grab"
            >
              <path d="M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
              <path d="M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" />
              <path d="M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" />
            </svg>
          )}
        </div>

        <div onClick={()=>{setMusic(music ? false : true)}} className="move">
          {music ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause-icon lucide-pause">
              <rect x="14" y="3" width="5" height="18" rx="1"/>
              <rect x="5" y="3" width="5" height="18" rx="1"/>
            </svg>
          ): (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-icon lucide-play">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </div>
        
        <div className="cursor-pointer">
          <FullScreen />
        </div>
      </div>

<ChunkedAudioPlayer play={music} /> 

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
