"use client";
import React, { useRef, useMemo, Suspense, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import gsap from "gsap";
import useSafeLoader from "../components/useSafeLoader";

import { useCameraStore } from "../../../stores/useCameraStore";
// import { openDB } from "idb";
// import BookDimensionControls from "./Dimensions"
// import RainbowAurora from './RainbowAurora'


// initialPosition = [-2.79, -0.61, -5.87],
  // initialRotation = [0, 0, 0],
  // shelfRadius = 6.5,
  // otherBooks = [],
  // bookID,
  // cover,
  // selectedBook = 0, // 


const Book = ({
  book,
  id,
  color = "red",
  scale,
  position,
  rotation,
  readPos
  
}) => {

  const setOrbitRules = useCameraStore((s) => s.setOrbitRules);
    // const setZoom = useCameraStore((s) => s.setZoom);
    // const setRotation = useCameraStore((s) => s.setRotation);
  const setPosition = useCameraStore((s) => s.setPosition);

  // Example: Access book properties
  const { title, author, cover } = book || {};
  const { raycaster, camera, size } = useThree();
  const meshRef = useRef();
  // const positionRef = useRef(new THREE.Vector3(...position));
  //const rotationRef = useRef(initialRotation);
  // const rotationRef = useRef(new THREE.Euler(...rotation));
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const mouseVecRef = useRef(new THREE.Vector2()); // ✅ UseRef (No reallocation)
  const intersectionVecRef = useRef(new THREE.Vector3()); // ✅ UseRef (No reallocation)
  const longPressTimer = useRef(); // ✅ Timer reference for long press
  //Why does this not auto update sometimes I have to press twice?
  const currentPlace = useRef("home");
  // const [drag, setDrag] = useState(false);

  const switchPlace = (place) => {
    currentPlace.current = place;
  };

  // const handlePointerDown = () => {
  //   //setSelectedBook(bookID); // ✅ Updates the selected book in `Bookshelf`
  //   longPressTimer.current = setTimeout(() => {
  //     switchPlace("positionAndRotate");
  //   }, 500); // ✅ Long press detection (500ms)
  // };

  // const handlePointerUp = () => {
  //   clearTimeout(longPressTimer.current); // ✅ Clear the timer
  //   setTimeout(() => {
  //     switchPlace("home");
  //   }, 6000);
  // };

  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );

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
    useSafeLoader(book.cover.front|| "./books/covers/000.jpg"),
  ];

  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );
  //saveToDB();
  //console.log(meshRef.current.scale.set(1,1,1))
  return (


    <Suspense fallback={"loading"}>
      <mesh
        ref={meshRef}
        //Should I press this 1 second for it to be active or something like??
        // I need something so bind wont be affected by double click
        // {...bind()} // ✅ Enable drag only if selected
        // {...(drag ? bind() : {})}
        // //{...(showPivot ? bind() : {})}
        // onDoubleClick={() => {
        //   //meshRef.current.position.set(0, 0, 0);
        //   //alert(bookID);
        //   handleRotationChange("y", 0);
        //   handleRotationChange("x", 0);
        //   handleRotationChange("z", 0);
        // }}


        scale={[book.scale.width, book.scale.height, book.scale.thickness]}
        position={position}
        rotation={rotation}
        onPointerEnter={() => (hoveredRef.current = true)}
        onPointerLeave={() => (hoveredRef.current = false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
        <meshBasicMaterial color={color} />
        {materials.map((material, i) => (
          <primitive key={`${book.id}-material-${i}`} object={material} attach={`material-${i}`} />
        ))}
      </mesh>

<Html center distanceFactor={10} position={position}>
  <a href="#" onClick={() => {
    setPosition(readPos)
    setOrbitRules({
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
    });
  }}>

  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-icon lucide-book-open"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
  </a>
 <a href="#" onClick={() => {
    setPosition([0,0,0])
    setOrbitRules({
      minPolarAngle: Math.PI / 2 - Math.PI / 14,
      maxPolarAngle: Math.PI / 2 + Math.PI / 14,
      minAzimuthAngle: -Math.PI / 14,
      maxAzimuthAngle: Math.PI / 14,
    });
  }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo2-icon lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
  </a>

</Html>

      {/* {selectedBook === bookID && currentPlace.current === "positionAndRotate" && ( */}
        {/* <PivotControls
          anchor={[0, -0.5, 0]}
          depthTest={false}
          lineWidth={2}
          axisColors={["#9381ff", "#ff4d6d", "#3ae374"]}
          fixed={true}
          scale={100}
          onDrag={(e) => {
            e.stopPropagation();
            const { axis, offset } = e;
            if (axis === "X") handleRotationChange("x", offset[0]);
            if (axis === "Y") handleRotationChange("y", offset[1]);
            if (axis === "Z") handleRotationChange("z", offset[2]);
          }}
        >
      
        </PivotControls> */}
      {/* // )} */}
      {/* {selectedBook === bookID && ( */}
      {/* <RainbowAurora/> */}
        {/* <Html center distanceFactor={10} position={positionRef.current}>
          safadsf
           <div className="bg-white/90 backdrop-blur-md text-xs px-2 py-1 rounded-md border border-gray-200">
            <div>Position: {positionRef.current.x.toFixed(2)}, {positionRef.current.y.toFixed(2)}, {positionRef.current.z.toFixed(2)}</div>
            <div>Rotation: {(rotationRef.current.x * (180 / Math.PI)).toFixed(1)}°, {(rotationRef.current.y
  * (180 / Math.PI)).toFixed(1)}°, {(rotationRef.current.z * (180 / Math.PI)).toFixed(1)}°</div>
          </div> 
        </Html> */}
      {/* // )} */}


    </Suspense>



  );
};
export default Book;
