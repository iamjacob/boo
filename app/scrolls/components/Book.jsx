import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

const Book = ({ book, scale = [0.5, 0.7, 0.15], position = [0, 0, 0] }) => {
  const meshRef = useRef();

  // Load textures using THREE.TextureLoader.
  // (You can replace useLoader with your custom useSafeLoader if needed.)
  const defaultTexture = useLoader(
    THREE.TextureLoader,
    "./books/booktexture.png"
  );
  const frontTexture = useLoader(
    THREE.TextureLoader,
    book.cover?.front || "https://jacobg.me/k.jpg"
  );
  const backTexture = useLoader(
    THREE.TextureLoader,
    book.cover?.back || "https://jacobg.me/k.jpg"
  );
  // Optionally, load a spine texture if needed:
  const spineTexture = useLoader(
    THREE.TextureLoader,
    book.cover?.spine || "https://jacobg.me/k.jpg"
  );

  // Create an array of materials for each face of the box geometry.
  // Box geometry face order: right, left, top, bottom, front, back.
  // Here, we use the default texture for most faces,
  // and the frontTexture/backTexture for the covers.
  const materials = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // right
      new THREE.MeshStandardMaterial({ map: spineTexture }), // left
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // top
      new THREE.MeshStandardMaterial({ map: defaultTexture }), // bottom
      new THREE.MeshStandardMaterial({ map: frontTexture }),   // front
      new THREE.MeshStandardMaterial({ map: backTexture }),    // back
    ];
  }, [defaultTexture, frontTexture, backTexture]);

  return (
    <mesh ref={meshRef} scale={scale} position={position}>
      {/* A simple box geometry (1 x 1 x 1) that gets scaled */}
      <boxGeometry args={[1, 1, 1]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
};

export default Book;
