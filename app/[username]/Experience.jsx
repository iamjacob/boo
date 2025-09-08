"use client";
import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, CameraControls, Gltf, useGLTF, Html } from "@react-three/drei";
// import { Stars, OrbitControls } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useEffect } from "react";

// import { degToRad } from "three/src/math/MathUtils.js";
// import { Godray } from "./Godray";
// import { WebGPURenderer } from "three/webgpu";

import BooksStand from "./components/BooksStand";
import Shelves from "./Shelves";
import OpenBook from "./components/OpenBook_test";
// import { Physics } from "@react-three/rapier";
// import useShelvesStore from "../../stores/shelves/useShelvesStore";
// import useBookExperienceStore from "../../stores/experience/useBookExperienceStore";
// import Book from "./components/Book_test";
// import BookPhysics from "./components/BookPhysics";
// import ShelvesPhysics from "./components/ShelvesPhysics";
// import Floor from "./components/Floor";
// import BackgroundWall from "./components/BackgroundWall";

export const Experience = () => {
      const BOOK_STAND_COUNT = 8;
      const RADIUS = 3;

  const CameraZoom = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.zoom = 3.5;
      camera.updateProjectionMatrix();
    }, [camera]);
    return null;
  };
  
  const StudioLighting = () => (
    <>
    <ambientLight intensity={1} />
    <directionalLight position={[0, 10, 0]} intensity={1.5} />
    <directionalLight position={[10, 10, 5]} intensity={0.5} />
    <directionalLight position={[-10, -10, -5]} intensity={0.3} />
    <directionalLight position={[-10, -10, -5]} intensity={30} color={"#ff0000"}/>
  </>
);


// const controls = useThree((state) => state.controls);
// const animate = async () => {
//   controls.setLookAt(0, 0.5, -5, 0, 1.5, -2);
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   controls.smoothTime = 0.8;
//   await controls.setLookAt(5, 2, -5, 0, 2, -2, true);
//   controls.smoothTime = 0.4;
//   await controls.setLookAt(-5, 0.5, 5, -1, 2, -2, true);
// };

// useEffect(() => {
//   if (!controls) {
//     return;
//   }
//   animate();
// }, [controls]);


// const [isLoading, setIsLoading] = useState(true);
// const { setShelvesFromData, selectedShelf } = useShelvesStore();
// const { selectedBook, isBookOpen, isOpenBookVisible, openedBook, selectBook, openBook } = useBookExperienceStore();
// const canvasRef = useRef(null);

  // useEffect(() => {
    //   if (shelvesData?.shelves && userData?.books) {
      //     setShelvesFromData(shelvesData.shelves, shelvesData.shelfSlug);
      //     setIsLoading(false);
      //   }
      // }, [shelvesData, userData, setShelvesFromData]);
      
      // const getBookDataById = (bookID) => {
        //   const book = userData.books.find((b) => b.id === bookID);
        //   if (!book) return null;
        //   return {
          //     bookID: book.id,
          //     title: book.title,
          //     cover: book.coverImages[0] || "https://example.com/default.jpg",
          //     dimensions: book.scale || [0.4, 0.7, 0.2],
          //     pages: book.pageCount || 200,
          //     position: book.position || [0, -0.43, -6.5],
          //     rotation: book.rotation || [0, 0, 0],
          //   };
          // };
          
          // const handleBookSelection = (bookID) => {
            //   selectBook(bookID);
            // };
            
            // const handleBookOpen = (bookID) => {
              //   const bookData = getBookDataById(bookID);
              //   if (bookData) {
  //     openBook(bookData);
  //   }
  // };
  
  // if (isLoading) {
    //   return <div>Loading...</div>;
    // }
    
    const [frameloop, setFrameloop] = useState("never");
    
    
    useEffect(() => {
      const splash = document.getElementById("splash");
      
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, []);
    
    return (
      
      <Canvas className="fixed top-0 left-0 w-full h-full bg-gray-900" 
      // shadows
      camera={{ position: [0, 0, 5], fov: 75 }}
      // frameloop={frameloop}
      // flat
      // gl={(canvas) => {
        //   const renderer = new WebGPURenderer({
          //     canvas,
          //     powerPreference: "high-performance",
          //     antialias: true,
          //     alpha: false,
          //     stencil: false,
          //     shadowMap: true,
          //   });
          //   renderer.init().then(() => {
            //     setFrameloop("always");
            //   });
            //   return renderer;
            // }}
            >

      {Array.from({ length: BOOK_STAND_COUNT }).map((_, i) => {
        const angle = (i / BOOK_STAND_COUNT) * 2 * Math.PI;
        const x = Math.cos(angle) * RADIUS;
        const z = Math.sin(angle) * RADIUS;
        return (
          <BooksStand key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]} />
        );
      })}

      {/* make camera from center to rotate to each bookstand */}
      {/* Make 'HOME' button that centers user + cam again */}
      {/* Make moving man maps and on shelf!!! */}


        {/* <Floor /> */}
        {/* <BackgroundWall debug={false} /> */}
        {/* <ShelvesPhysics />*/}

        <Shelves/>

        <Html  position={[12,8,2]} center>
          <div className="text-white text-3xl">Welcome to the 3D Boooks Experience</div>
        </Html>


        <Html  position={[-12,8,2]} center>
          <div className="text-white text-3xl w-fit">Add a new scene</div>
        </Html>

        <Html  position={[0,8,-12]} center>
          <div className="text-white text-3xl w-fit">History (infinite shelf)</div>
        </Html>

        <Html  position={[0,8,12]} center>
          <div className="text-white text-3xl w-fit">Maps</div>
        </Html>

        {/* {children} */}
      



        {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}

      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={'red'} />
        </mesh> */}
        {/* {materials.map((material, i) => (
          <primitive key={i} object={material} attach={`material-${i}`} />
        ))} */}



      {/* <OpenBook/> */}
      {/* </Physics> */}

      <CameraZoom />
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.4}
        enableZoom={true}
        minDistance={2}
        //maxDistance={12}
        minPolarAngle={-Math.PI / 2}
        // maxPolarAngle={Math.PI / 2}
        />

      <StudioLighting />
      <Stars />
    </Canvas>
  );
};

export default Experience;