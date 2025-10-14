import React, { useMemo, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import BoooksHeart from "../../BoooksHeart";


function Frame() {
  // Load textures at the top level
  const [colorMap, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
    "./experience/shelf/Wood051_1K-JPG_Color.webp",
    "./experience/shelf/Wood051_1K-JPG_NormalDX.webp",
    "./experience/shelf/Wood051_1K-JPG_Roughness.webp",
  ]);

  // Optimize textures (repeat wrapping, avoid stretching)
  useMemo(() => {
    [colorMap, normalMap, roughnessMap].forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.needsUpdate = true;
    });
  }, [colorMap, normalMap, roughnessMap]);

  // Memoize material properties to prevent re-creating on every render
  const materialProps = useMemo(
    () => ({
      map: colorMap,
      normalMap,
      roughnessMap,
    }),
    [colorMap, normalMap, roughnessMap]
  );

  // Memoize frame parts (reduces array reallocation)
  const frameParts = useMemo(
    () => [
      { position: [1, 0, 0.1], size: [0.1, 3, 0.1] },  // Right vertical
      { position: [-1, 0, 0.1], size: [0.1, 3, 0.1] }, // Left vertical
      { position: [0, 1.5, 0.1], size: [2.1, 0.1, 0.1] }, // Top horizontal
      { position: [0, -1.5, 0.1], size: [2.1, 0.1, 0.1] }, // Bottom horizontal
    ],
    []
  );

  // Prevent unnecessary re-renders using useRef
  const frameRef = useRef();

  return (
    <>
    <mesh ref={frameRef}>
      {frameParts.map((part, index) => (
        <mesh key={index} position={part.position}>
          <boxGeometry args={part.size} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
    </mesh>
       <Html
        translate="yes"
        position={[-1.15,-1.4,0]}
        rotation={[0.1,0.1,0.1]}
        className={`relative z-[5000] touch-auto `}
        style={{ pointerEvents: "none" }} // Prevent blocking clicks on 3D scene
      >
        <button
          title="heart"
          className="rotate-[-45deg] cursor-pointer"
          style={{ pointerEvents: "auto" }}
          onClick={() => console.log("Heart clicked")}
        >
          <BoooksHeart width="30" height="30" />
        </button>
      </Html>
    </>

  );
}

export default React.memo(Frame);
