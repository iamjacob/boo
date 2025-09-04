import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const Shelves = () => {
  const Shelf = ({ position = [0, 0, 0], rotation = [(Math.PI / 180) * 90, 0, 0] }) => {
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

    const geometry = useMemo(() => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 7, 0, Math.PI * 2, false);

      
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, 6, 0, Math.PI * 2, true);
      shape.holes.push(holePath);

      return new THREE.ExtrudeGeometry(shape, {
        depth: 0.08,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 64,
      });
    }, []);

    return (
      <mesh position={position} rotation={rotation}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };

  return (
    <group position={[0, -0.8, 0]}>
      {[...Array(4)].map((_, i) => (
        <Shelf key={i} position={[0, i - 1, 0]} />
      ))}
    </group>
  );
};

export default Shelves;
