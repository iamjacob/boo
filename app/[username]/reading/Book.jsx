"use client";
import React, { useRef, useMemo, Suspense, useState } from "react";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import * as THREE from "three";
import useSafeLoader from "../components/useSafeLoader";
import { useCameraStore } from "../../../stores/useCameraStore";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

function skewBoxGeometry(geometry, skew = 0.05) {
  const m = new THREE.Matrix4();
  m.set(
    1, 0, skew, 0, // X skewed by Z
    0, 1, 0,   0,
    0, 0, 1,   0,
    0, 0, 0,   1
  );
  geometry.applyMatrix4(m);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}



const Book = ({ book, position, rotation, readPos }) => {
  const setOrbitRules = useCameraStore((s) => s.setOrbitRules);
  const setPosition = useCameraStore((s) => s.setPosition);

  const { title, author, cover, lastPage, lastRead, pages } = book || {};
  const meshRef = useRef();
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);

  const width = book.scale.width;
  const thickness = book.scale.thickness;
  const height = book.scale.height;

  // const { getPageImage } = usePDFToImage(pdf || "./sample.pdf");

  const openDegrees = 1;
  const pageThickness = thickness / pages;
  const rightThickness = pageThickness * (pages - lastPage);
  const leftThickness = pageThickness * lastPage;

  useCursor(
    hoveredRef.current || draggingRef.current,
    draggingRef.current ? "grabbing" : "grab"
  );

  const textures = [
    useSafeLoader("./books/booktexture.png"),
    // useSafeLoader(cover?.spine || "./books/covers/000.jpg"),
    useSafeLoader(book.cover.front || "./books/covers/000.jpg"),
    useSafeLoader("./books/booktexture.png"),
    useSafeLoader("./books/booktexture.png"),
    // useSafeLoader(cover?.front || "./books/covers/000.jpg"),
    useSafeLoader(book.cover.front || "./books/covers/000.jpg"),
    // useSafeLoader(cover?.back || "./books/covers/000.jpg"),
    useSafeLoader(book.cover.front || "./books/covers/000.jpg"),
  ];

  // extrude geometry bruger 3 materialer
  const pageMaterials = [
    new THREE.MeshStandardMaterial({ map: textures[1] }), // front
    new THREE.MeshStandardMaterial({ map: textures[5] }), // back
    new THREE.MeshStandardMaterial({ color: "white" }), // sider
  ];

  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );

  const skewAmount = useMemo(() => {
    return thickness / 2 / width;
  }, [thickness, width]);

  const offsetX = (skewAmount * height) / 2; // half shift at the top

  return (
    <Suspense fallback={"loading"}>
      <group
        // ref={groupRef}
        position={position}
        rotation={rotation}
      >
        {/* Front cover - right pages */}
        <group
          // ref={rightPageRef}
          position={[-width * 0.5, 0, thickness * 0.5]}
          rotation={[0, -openDegrees, 0]}
        >
          <mesh
            position={[width / 2, 0, -rightThickness / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              // ref={(g) => g && skewBoxGeometry(g, +skewAmount)}
              args={[width, height, rightThickness]}
            />

            {[
              // right, left, top, bottom, front, back
              materials[2], // right
              materials[2], // left
              materials[2], // top
              materials[2], // bottom
              materials[1], // front (cover)
              materials[2], // back
            ].map((mat, i) => (
              <primitive key={i} object={mat} attach={`material-${i}`} />
            ))}
          </mesh>
        </group>

        {/* Back cover - left pages */}
        <group
          // ref={leftPageRef}
          position={[-width * 0.5, 0, -thickness * 0.5]}
          rotation={[0, openDegrees, 0]}
        >
          <mesh
            position={[width / 2 , 0, leftThickness / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              // ref={(g) => g && skewBoxGeometry(g, -skewAmount)}
              args={[width, height, leftThickness]}
            />
            {[
              // right, left, top, bottom, front, back
              materials[2], // right
              materials[2], // left
              materials[2], // top
              materials[2], // bottom
              materials[2], // back
              materials[5], // back (cover)
            ].map((mat, i) => (
              <primitive key={i} object={mat} attach={`material-${i}`} />
            ))}
          </mesh>
        </group>

        {/* Spine */}
        <mesh
          // ref={spinePageRef}
          position={[-width * 0.5, 0, 0]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.001, height, thickness]} />
          <primitive object={materials[4]} attach="material" />
        </mesh>
      </group>

      <Html
        center
        distanceFactor={10}
        position={[position[0], position[1] - height, position[2]]}
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex w-[150px] justify-between gap-2 my-2 hidden">
          <div className="backdrop-blur-sm bg-black/30 text-white rounded-md p-2 text-[12px] text-center">
            <a
              href="#"
              onClick={() => {
                setPosition(readPos);
                setOrbitRules({
                  minPolarAngle: 0,
                  maxPolarAngle: Math.PI,
                  minAzimuthAngle: -Infinity,
                  maxAzimuthAngle: Infinity,
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-open-icon lucide-book-open"
              >
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
          </div>

          <div className="backdrop-blur-sm bg-black/30 text-white rounded-md p-2 text-[12px] text-center">
            <a
              href="#"
              onClick={() => {
                setPosition([0, 0, 0]);
                setOrbitRules({
                  minPolarAngle: Math.PI / 2 - Math.PI / 14,
                  maxPolarAngle: Math.PI / 2 + Math.PI / 14,
                  minAzimuthAngle: -Math.PI / 14,
                  maxAzimuthAngle: Math.PI / 14,
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-undo2-icon lucide-undo-2"
              >
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
            </a>
          </div>
        </div>

        <div className="w-[150px] backdrop-blur-sm bg-black/30 text-white rounded-md p-2 text-[12px] text-center">
          {`Last Read: ${formatDate(lastRead)}`}
        </div>

        {/* lastPage: {lastPage} / {pages} <br /> */}
        {/* {title} <br /> */}
        {/* by {author} */}

      </Html>
    </Suspense>
  );
};
export default Book;
