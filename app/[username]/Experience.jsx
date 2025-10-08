"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import * as THREE from 'three';
import Shelves from "./shelves/Shelves";
import ShelvesSquare from "./secrets/ShelvesSquare";
import ShelfZoom from "./components/ShelfZoom";
import ShelfCameraController from "./components/ShelfCameraController";
import ShelfHighlight from "./components/ShelfHighlight";
import ShelfZoomUI from "./components/ShelfZoomUI";
import { gsap } from "gsap";
import { useCameraStore } from "../../stores/useCameraStore";
import { useShelfZoomStore } from "../../stores/useShelfZoomStore";
import Lighting from "./Lighting";
import OpenBook from "./openbook/OpenBook";
import Menu from "./Menu";
import ReadingNow from "./reading/ReadingNow";
import BookMenu from './openbook/BookMenu';

import Levels from "./Levels";
import FullScreen from '../Fullscreen'

import { useMenuStore } from "../../stores/useMenuStore";
import { useOpenBookStore } from "../../stores/useOpenBookStore";
import { useParticleStore } from "../../stores/useParticleStore";
import { useBooksStore } from "../../stores/useBooksStore";

import CameraIntro from "./components/CameraIntro";
import ParticleFormation from "./components/ParticleFormation";
import Book from "./components/Book";

import LiveScanner from "./LiveScanner";

export const Experience = ({ 
  children, 
  drag, 
  setDrag, 
  onClick,
  isLongPressing,
  onLongPressStart,
  onLongPressEnd,
  onDragToggle
}) => {
  const zoom = useCameraStore((s) => s.zoom);
  const rotation = useCameraStore((s) => s.rotation);
  const position = useCameraStore((s) => s.position);
  const smooth = useCameraStore((s) => s.smooth);
  const setOrbitRules = useCameraStore((s) => s.setOrbitRules);
  const scannerActive = useMenuStore((s) => s.scannerActive);
  // const isScannerShowing = useMenuStore((s) => s.Scanner);
  // const isShelfZoomed = useShelfZoomStore((s) => s.isShelfZoomed);
  // const setZoom = useCameraStore((s) => s.setZoom);
  // const setRotation = useCameraStore((s) => s.setRotation);
  //const setPosition = useCameraStore((s) => s.setPosition);
  // const setSmooth = useCameraStore((s) => s.setSmooth);

  const isReadingNow = useMenuStore((s) => s.ReadingNow);
  const isSecretShowing = useMenuStore((s) => s.Secret);
  const isBookOpen = useMenuStore((s) => s.isBookOpen);
  const openBookId = useOpenBookStore((s) => s.openBookId);
  const activeOpenBook = useOpenBookStore((s) => s.activeOpenBook);
  const animateBack = useOpenBookStore((s) => s.animateBack);
  const throwCoins = useMenuStore((s) => s.throwCoins);

  // Particle formation state
  const isFormingBook = useParticleStore((s) => s.isFormingBook);
  const formingBookData = useParticleStore((s) => s.formingBookData);
  const completeBookFormation = useParticleStore((s) => s.completeBookFormation);
  const addBook = useBooksStore((s) => s.addBook);
  
  // State for showing the formed book
  const [formedBook, setFormedBook] = useState(null);

  // Long press functionality for drag mode
  const longPressTimer = useRef(null);
  const isDraggingBook = useRef(false);

  const handleBackgroundPointerDown = (e) => {
    e.stopPropagation();
    
    // Start long press for drag activation
    onLongPressStart();
    longPressTimer.current = setTimeout(() => {
      onDragToggle(true);
      onLongPressEnd();
      console.log('🚀 Long press completed - Drag mode activated!');
    }, 800); // 800ms like iOS
  };

  const handleBackgroundPointerUp = (e) => {
    e.stopPropagation();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      onLongPressEnd();
    }
  };

  const handleBackgroundPointerLeave = (e) => {
    e.stopPropagation();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      onLongPressEnd();
    }
  };

  const handleDragModeExit = (e) => {
    e.stopPropagation();
    
    // Add a small delay to ensure book interactions have a chance to take precedence
    setTimeout(() => {
      onDragToggle(false);
      console.log('🛑 Tap to exit drag mode');
    }, 50);
  };

  // Console log drag state changes
  useEffect(() => {
    console.log(`🎯 Drag mode ${drag ? 'ACTIVATED' : 'DEACTIVATED'}`);
  }, [drag]);

  const handleBookFormation = (bookData) => {
    console.log('📖 Book formation complete, showing book:', bookData);
    setFormedBook(bookData);
  };

  const handleParticleComplete = (updatedBookData) => {
    console.log('🎯 Particle animation complete, adding book to shelf:', updatedBookData);
    
    // Clear the formed book (remove the temporary one)
    setFormedBook(null);
    
    // Add the final book to the shelf
    if (updatedBookData) {
      addBook(updatedBookData);
    }
    completeBookFormation();
  };

  useEffect(() => {
  // const openBookId = useOpenBookStore((s) => s.openBookId);
    setOrbitRules({
      minPolarAngle: Math.PI / 2 - Math.PI / 14,
      maxPolarAngle: Math.PI / 2 + Math.PI / 14,
      minAzimuthAngle: -Math.PI / 14,
      maxAzimuthAngle: Math.PI / 14,
    });
  }, []);

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

  //const [drag, setDrag] = useState(false);
  const controlsRef = useRef();
  const cameraRef = useRef();

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

  // Sync camera live with Zustand store (but skip during shelf zoom transitions)
  const { isTransitioning } = useShelfZoomStore();
  useEffect(() => {
    const camera = cameraRef.current;

    if (!camera || isTransitioning) return; // Skip camera sync during transitions
    // Fallback/default if position is not a valid array
    const safePosition =
      Array.isArray(position) && position.length === 3
        ? position
        : [0, 0.0001, 5];
    const safeRotation =
      Array.isArray(rotation) && rotation.length === 3 ? rotation : [0, 0, 0];
    camera.position.set(...safePosition);
    camera.rotation.set(...safeRotation);
    camera.zoom = typeof zoom === "number" ? zoom : 3.5;
    camera.updateProjectionMatrix();
  }, [position, rotation, zoom, isTransitioning]);


  // Splash screen removal
  useEffect(() => {
    const splash = document.getElementById("splash");
    // will be added to a global loader later
    // header get.content lenghth from fetch 
    // read length content-length 
    // const header = document.getElementById("header");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      
      {/* <LighterWithControls /> */}
      <Canvas
        className="fixed top-0 left-0 w-screen h-screen bg-gray-900"
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


        {!throwCoins && (
          <>
            <Shelves />
            {/* <ShelfCameraController /> */}
            {/* <ShelfHighlight /> */}
            {/* <ShelfZoomUI /> */}
          </>
        )}

        {scannerActive && <LiveScanner />}

        {isReadingNow && <ReadingNow />}

        {isSecretShowing && (
          <group position={[0, 0, 4]}>
            <ShelvesSquare />
          </group>
        )}

        {/* {isBookOpen && <OpenBook />} */}
        {/* {console.log("openBookId", openBookId)} */}

        {activeOpenBook && <OpenBook bookId={openBookId} />}
        {/* {activeOpenBook && <Html><div onClick={() => animateBack()}>closeBook</div></Html>} */}

        {/* Particle Formation Effect */}
        {isFormingBook && formingBookData && (
          <ParticleFormation
            bookData={formingBookData}
            isActive={isFormingBook}
            onBookFormed={handleBookFormation}
            onComplete={handleParticleComplete}
          />
        )}
        
        {/* Show the formed book during pause */}
        {formedBook && (
          <Book
            id={`forming-${formedBook.id || 'temp'}`}
            bookID={formedBook.id || 'temp'}
            scale={[formedBook.scale?.width || 0.4, formedBook.scale?.height || 0.75, formedBook.scale?.thickness || 0.2]}
            initialPosition={[0, 0, 0]}
            initialRotation={[0, 0, 0]}
            cover={formedBook.cover}
            title={formedBook.title}
            bookObject={formedBook}
            drag={false}
            setDrag={() => {}}
            selectedBook={null}
            setSelectedBook={() => {}}
            otherBooks={[]}
          />
        )}

        {/* {isScannerShowing && } */}

        {children}

        {/* Invisible background for click-outside detection and long press */}
        <mesh
          position={[0, 0, -10]}
          onClick={onClick}
          onPointerDown={!drag ? handleBackgroundPointerDown : undefined}
          onPointerUp={!drag ? handleBackgroundPointerUp : undefined}
          onPointerLeave={!drag ? handleBackgroundPointerLeave : undefined}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Exit drag mode mesh - only active during drag mode */}
        {/* Temporarily disabled to prevent interference with book dragging */}
        {false && drag && (
          <mesh 
            position={[0, 0, -9]} 
            onPointerDown={handleDragModeExit}
            >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

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

        <Lighting />
        <Stars />
        {/* <CameraIntro /> */}
      </Canvas>

      <Menu drag={drag} setDrag={setDrag} resetCamera={resetCamera} />

     {activeOpenBook && <BookMenu />}


         <Levels /> 

    </div>
  );
};

export default Experience;
