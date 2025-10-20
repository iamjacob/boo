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
  // const books = {};

  // function SetBackground() {
  //   const { scene } = useThree();
  //   useEffect(() => {
  //     scene.background = new THREE.Color("black");
  //   }, [scene]);
  //   return null;
  // }

  // function SetCameraPosition() {
  //   const { camera } = useThree();

  //   useEffect(() => {
  //     camera.position.set(0, 0, 0);
  //     // Optionally, if you need to force the camera to look somewhere:
  //     camera.lookAt(0, 0, 0);
  //   }, [camera]);

  //   return null;
  // }

  function Shelf({
    position = [0, 0, 0],
    rotation = [(Math.PI / 180) * 90, 0, 0],
  }) {
    const [colorMap, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
      "/shelf/Wood051_1K-JPG_Color.jpg",
      "/shelf/Wood051_1K-JPG_NormalDX.jpg",
      "/shelf/Wood051_1K-JPG_Roughness.jpg",
    ]);

    // Set texture wrapping and repetition
    [colorMap, normalMap, roughnessMap].forEach((map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(1, 1); // Adjust the repeat values as needed
    });

    // Create a shape for the ring
    const outerRadius = 7;
    const innerRadius = 6;
    let segments = 64;
    //const shelfDegrees = Math.PI/ 180 * 50;

    //Make this like ringGeometry so I can cut it.

    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // Extrude settings
    const extrudeSettings = {
      depth: 0.08, // Extrusion depth
      bevelEnabled: false,
      steps: 1,
      curveSegments: segments,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    return (
      <mesh position={position} rotation={rotation}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          side={THREE.DoubleSide} // Ensure both sides are visible
        />
      </mesh>
    );
  }

  return (
    <>
      {/* <SetCameraPosition /> */}
      <group position={[0, -0.8, 4]}>
        <Shelf position={[0, -1, 0]} books={books} meta={books["meta"]} />
        <Shelf position={[0, 0, 0]} />
        <Shelf position={[0, 1, 0]} />
        <Shelf position={[0, 2, 0]} />
        {/* <SetBackground /> */}

        

        <Stars />
      </group>
    </>
  );
};

export default Shelves;
