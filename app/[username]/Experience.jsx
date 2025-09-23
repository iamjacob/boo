"use client";
import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import Shelves from "./shelves/Shelves";
import ShelvesSquare from "./secrets/ShelvesSquare";
import { gsap } from "gsap";
import { useCameraStore } from "../../stores/useCameraStore";
import Lighting from "./Lighting";
import OpenBook from "./components/OpenBook";
import Menu from "./Menu";
import ConfettiDopamine from "./components/ConfettiDopamine";
import ReadingNow from "./reading/ReadingNow";

import { useMenuStore } from "../../stores/useMenuStore";

export const Experience = ({ children, drag, setDrag }) => {
  const zoom = useCameraStore((s) => s.zoom);
  const rotation = useCameraStore((s) => s.rotation);
  const position = useCameraStore((s) => s.position);
  const smooth = useCameraStore((s) => s.smooth);
  const setOrbitRules = useCameraStore((s) => s.setOrbitRules);
  // const setZoom = useCameraStore((s) => s.setZoom);
  // const setRotation = useCameraStore((s) => s.setRotation);
  //const setPosition = useCameraStore((s) => s.setPosition);
  // const setSmooth = useCameraStore((s) => s.setSmooth);

  const isReadingNow = useMenuStore((s) => s.ReadingNow);
  const isSecretShowing = useMenuStore((s) => s.Secret);

  useEffect(() => {
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

  // Sync camera live with Zustand store
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
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
  }, [position, rotation, zoom]);

  useEffect(() => {
    const splash = document.getElementById("splash");

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


        <Shelves />

        {isReadingNow && <ReadingNow />}
        {isSecretShowing && (
          <group position={[0, 0, 4]}>
            <ShelvesSquare />
          </group>
        )}

        {/* <OpenBook /> */}


        {/* {isScannerShowing && } */}

        {children}

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
      </Canvas>

      <Menu drag={drag} setDrag={setDrag} resetCamera={resetCamera} />
      {/*
       *
       *
       *           LEVEL STIGNING!
       *
       *
       * */}

      {/* Level stigning fra useStore */}
      {/* Hvis i 7 sekunder medmindre lukkes */}
      {/* 
{
"newLevel":true,
"level":useLevelStore().get new level live!,
"unlocks":[],
"text":setting[level].leveltekst,
"status":sidenSidst(this.user from last level to this level (read x, all recordings since lastLevel datetime)),
"":,
}
 */}
      {/* <ConfettiDopamine
        // images={[
        //   "/favicon/apple-touch-icon.png",
        // ]}
      /> */}
    </div>
  );
};

export default Experience;
