import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

const Book = ({ book, scale = [0.5, 0.7, 0.15], position = [0, 0, 0] }) => {
  const meshRef = useRef();

  // Load textures in a single call (useLoader caches by URL)
  const [
    defaultTexture,
    frontTexture,
    backTexture,
    spineTexture,
  ] = useLoader(THREE.TextureLoader, [
    "./books/booktexture.png",
    book.cover?.front || "https://jacobg.me/k.jpg",
    book.cover?.back || "https://jacobg.me/k.jpg",
    book.cover?.spine || "https://jacobg.me/k.jpg",
  ]);

  // Create materials once per Book instance; textures are cached so this is cheap
  const materials = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // right
      new THREE.MeshStandardMaterial({ map: spineTexture }), // left
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // top
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // bottom
      new THREE.MeshStandardMaterial({ map: frontTexture }), // front
      new THREE.MeshStandardMaterial({ map: backTexture }), // back
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTexture, frontTexture, backTexture, spineTexture]);

  return (
    <mesh ref={meshRef} scale={scale} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
};

export default React.memo(Book);
