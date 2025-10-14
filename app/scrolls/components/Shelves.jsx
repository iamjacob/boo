"use client";
import React, { useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Stars } from "@react-three/drei";

// Importing images
// import ColorMap from './Wood051_1K-JPG_Color.jpg';
// import NormalMap from './Wood051_1K-JPG_NormalDX.jpg';
// import RoughnessMap from './Wood051_1K-JPG_Roughness.jpg';

const Shelves = () => {
  const books = {};

  function SetBackground() {
    const { scene } = useThree();
    useEffect(() => {
      scene.background = new THREE.Color("black");
    }, [scene]);
    return null;
  }

  function SetCameraPosition() {
    const { camera } = useThree();

    useEffect(() => {
      camera.position.set(0, 0, 0);
      // Optionally, if you need to force the camera to look somewhere:
      camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
  }

  const shelfTextures = useLoader(THREE.TextureLoader, [
    "/shelf/Wood051_1K-JPG_Color.jpg",
    "/shelf/Wood051_1K-JPG_NormalDX.jpg",
    "/shelf/Wood051_1K-JPG_Roughness.jpg",
  ]);

  // Prepare geometry and set texture params once
  const Shelf = React.useMemo(() => {
    const [colorMap, normalMap, roughnessMap] = shelfTextures;

    [colorMap, normalMap, roughnessMap].forEach((map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(1, 1);
      map.needsUpdate = true;
    });

    // Create a reusable geometry for the shelf ring
    const outerRadius = 7;
    const innerRadius = 6;
    const segments = 64;

    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: false,
      steps: 1,
      curveSegments: segments,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const Material = (
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        side={THREE.DoubleSide}
      />
    );

    return { geometry, Material };
    // shelfTextures intentionally excluded from deps to avoid re-creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SetCameraPosition />
      <group position={[0, -0.8, 4]}>
        <mesh position={[0, -1, 0]} rotation={[(Math.PI / 180) * 90, 0, 0]}>
          <primitive object={Shelf.geometry} attach="geometry" />
          {Shelf.Material}
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[(Math.PI / 180) * 90, 0, 0]}>
          <primitive object={Shelf.geometry} attach="geometry" />
          {Shelf.Material}
        </mesh>
        <mesh position={[0, 1, 0]} rotation={[(Math.PI / 180) * 90, 0, 0]}>
          <primitive object={Shelf.geometry} attach="geometry" />
          {Shelf.Material}
        </mesh>
        <mesh position={[0, 2, 0]} rotation={[(Math.PI / 180) * 90, 0, 0]}>
          <primitive object={Shelf.geometry} attach="geometry" />
          {Shelf.Material}
        </mesh>
        <SetBackground />

        

        <Stars />
      </group>
    </>
  );
};

export default Shelves;
