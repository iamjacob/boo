"use client";
import React, { useRef, forwardRef } from "react";
import { useCursor, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import useSafeLoader from "./useSafeLoader";

const Book = forwardRef(
  (
    {
      scale = [1, 1.5, 0.3],
      initialPosition = [0, 0, 0],
      initialRotation = [0, 0, 0],
      cover,
      spine,
      back,
      images, // Add images prop to receive transformed images
      title = "Untitled Book", // Add title prop
    },
    ref
  ) => {
    const meshRef = useRef();
    const positionRef = useRef(new THREE.Vector3(...initialPosition));
    const rotationRef = useRef(new THREE.Euler(...initialRotation));
    const hoveredRef = useRef(false);
    const draggingRef = useRef(false);

    useCursor(
      hoveredRef.current || draggingRef.current,
      draggingRef.current ? "grabbing" : "grab"
    );

    // console.log("scale[1] on render:", scale[1]);
    // console.log("scale[1]/2 on render:", scale[1]/2);

    console.log("🎨 Book component received:");
    console.log("cover:", cover);
    console.log("spine:", spine);
    console.log("back:", back);
    console.log("images object:", images);

    const textures = [
      useSafeLoader("./books/booktextureRotated.png"),
      // Use transformed images if available, otherwise fallback to default
      useSafeLoader(images?.front || cover || "./books/covers/000.jpg"),
      useSafeLoader("./books/booktexture.png"),
      useSafeLoader("./books/booktexture.png"),
      useSafeLoader(images?.spine || spine || "./books/covers/000.jpg"),
      useSafeLoader(images?.back || back || "./books/covers/000.jpg"),
    ];

    const materials = textures.map(
      (texture) => new THREE.MeshStandardMaterial({ map: texture })
    );

    return (
      <>
        <mesh
          ref={meshRef}
          scale={scale}
          position={positionRef.current}
          rotation={rotationRef.current}
        >
          <boxGeometry args={[1, 1, 1]} />
          {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
          <meshBasicMaterial color={"red"} />
          {materials.map((material, i) => (
            <primitive
              key={`${title}-material-${i}`}
              object={material}
              attach={`material-${i}`}
            />
          ))}
        </mesh>
        <OrbitControls enablePan={false} enableZoom={true} />
      </>
    );
  }
);
export default Book;
