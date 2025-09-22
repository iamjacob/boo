import React, { useMemo, useRef, useState } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const Shelf = ({ position = [0, 0, 0], rotation = [-Math.PI / 2, 0, 0] }) => {
  const meshRef = useRef();
  const vaultSize = 1;

  const textures = useLoader(THREE.TextureLoader, [
    "/experience/shelf/Wood051_1K-JPG_Color.webp",
    "/experience/shelf/Wood051_1K-JPG_NormalDX.webp",
    "/experience/shelf/Wood051_1K-JPG_Roughness.webp",
  ]);

  const [colorMap, normalMap, roughnessMap] = useMemo(() => {
    textures.forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(1, 1);
    });
    return textures;
  }, [textures]);

  return (
    <group ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, -vaultSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, vaultSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -vaultSize, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const ShelvesSquare = () => {
  return (
    <group position={[0, -0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
      <Shelf position={[0, 1, 0]} />;
    </group>
  );
};

export default ShelvesSquare;
