import { Portal } from './portal';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { Mesh } from 'three';
import { BookOpen, Eye, SquareLibrary, Calendar, Earth, ChevronDown, ChevronUp } from "lucide-react";
import BoooksHeart from '../../BoooksHeart'


export function Scene({id}) {
  const meshRef = useRef<Mesh>(null);
  const { pointer } = useThree();
  const [hasOrientation, setHasOrientation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gyroRotation = useRef({ x: 0, y: 0 });
  const mouseRotation = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth <= 768);
    updateIsMobile(); // Initial check
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta && event.gamma) {
        gyroRotation.current.x = (event.beta - 90) * 0.01;
        gyroRotation.current.y = event.gamma * 0.01;
        if (!hasOrientation) setHasOrientation(true);
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        setIsPaused(prev => !prev);
      }
    };

    // Request permission for device orientation on iOS
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Update mouse rotation
    mouseRotation.current.x += (pointer.y * 0.2 - mouseRotation.current.x) * 0.1;
    mouseRotation.current.y += (pointer.x * 0.2 - mouseRotation.current.y) * 0.1;

    // Combine both rotations
    const combinedX = mouseRotation.current.x + (hasOrientation ? gyroRotation.current.x : 0);
    const combinedY = mouseRotation.current.y + (hasOrientation ? gyroRotation.current.y : 0);

    // Target rotation values
    let targetX = combinedX;
    let targetY = combinedY;

    // If not paused, slowly return to normal position
    if (!isPaused) {
      targetX *= 0.95; // Gradually reduce the rotation
      targetY *= 0.95;
    }

    // Apply smooth rotation
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.1;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#bae6fd" />
      <pointLight position={[5, -10, -5]} intensity={0.6} color="#818cf8" />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
      <pointLight position={[0, -10, 0]} intensity={0.4} color="#ffffff" />
<ambientLight intensity={2}></ambientLight>
      <mesh ref={meshRef}>
        <Portal id={id}/>
        {/*
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial
            color="#4f46e5"
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={1}
          /> 
        */}
      </mesh>

      {/* Visual indicator for pause state */}
      {/* <mesh position={[2, 2, 0]} scale={0.2}>
        <sphereGeometry />
        <meshStandardMaterial color={isPaused ? "#ef4444" : "#22c55e"} />
      </mesh> */}
      {/* Floating UI */}
      <Html translate='yes'
        className={`relative z-[50000] flex gap-4 text-center items-center touch-auto  ${isMobile ? "h-[40px] w-[320px] flex-row right-[-165px] bottom-[-235px]" : "w-[40px] h-[320px] flex-col right-[-200px] top-[-140px]"} `}
        style={{ pointerEvents: "none" }} // Prevent blocking clicks on 3D scene
      >
          <button
            title='heart'
            style={{ pointerEvents: "auto" }}
            onClick={() => console.log("Heart clicked")}
          >
            <BoooksHeart width="30" height="30" />
          </button>

          <button
            title='eye'
            style={{ pointerEvents: "auto" }}
            onClick={() => console.log("Eye clicked")}
          >
            <Eye className="w-6 h-6 text-black" />
          </button>
          {/* <span>200M views</span> */}

          {/* {!isMobile && (
            <>
              <button
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Library clicked")}
              >
                <SquareLibrary className="w-6 h-6 text-black" />
              </button>
              <span>books read</span>
            </>
          )} */}

          <button
            title='open book'
            style={{ pointerEvents: "auto" }}
            onClick={() => console.log("Book Open clicked")}
          >
            <BookOpen className="w-6 h-6 text-black" />
          </button>
          {/* <span>reading now</span> */}

          {/* {!isMobile && (
            <>
              <button
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Calendar clicked")}
              >
                <Calendar className="w-6 h-6 text-black" />
              </button>
              <span>born</span>

              <button
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Earth clicked")}
              >
                <Earth className="w-6 h-6 text-black" />
              </button>
              <span>location</span> 
              </>
)}*/}
              <button
                title='more'
                style={{ pointerEvents: "auto" }}
                onClick={() => console.log("Chevron clicked")}
              >
                <ChevronDown />
              </button>
      </Html>
    </>
  );
}