"use client";
import React, { useRef, useMemo, Suspense, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import gsap from "gsap";
// import { openDB } from "idb";
import useSafeLoader from "./useSafeLoader";
// import BookDimensionControls from "./Dimensions"
// import RainbowAurora from './RainbowAurora'

import {
  X,
  Rotate3D,
  ArrowLeft,
  Link,
  Check,
  Move,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  NotebookPen,
  SquareArrowOutUpRightIcon,
  PencilRuler,
} from "lucide-react";

const Book = ({
  id = "",
  color = "red",
  scale,
  initialPosition = [-2.79, -0.61, -5.87],
  initialRotation = [0, 0, 0],
  shelfRadius = 6.5,
  otherBooks = [],
  bookID,
  cover,
  selectedBook = 0, // ✅ Receives the currently selected book ID
  setSelectedBook, // ✅ Function to update selection
}) => {
  const { raycaster, camera, size } = useThree();
  const meshRef = useRef();
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  //const rotationRef = useRef(initialRotation);
  const rotationRef = useRef(new THREE.Euler(...initialRotation));
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const mouseVecRef = useRef(new THREE.Vector2()); // ✅ UseRef (No reallocation)
  const intersectionVecRef = useRef(new THREE.Vector3()); // ✅ UseRef (No reallocation)

  const pivotRef = useRef();
  const longPressTimer = useRef();

  const [showPivot, setShowPivot] = useState(false);


  //Why does this not auto update sometimes I have to press twice?
  const currentPlace = useRef("home");
  const switchPlace = (place) => {
    currentPlace.current = place;
  };

  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Function to share book URL
  const shareableUrl = `${window.location.origin}/b/${bookID}`;

  const handleShareUrl = () => {
    // Generate a shareable URL - you can customize this based on your app's structure
    //const bookId = "book-123456"; // Replace with actual book ID
    //const bookId = bookID; // Replace with actual book ID

    navigator.clipboard.writeText(shareableUrl).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 3000);
      //if I keep this and the same time if doable then put together!
      setTimeout(() => switchPlace("home"), 3000);
    });
  };

  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );

  useCursor(
    hoveredRef.current || draggingRef.current,
    draggingRef.current ? "grabbing" : "grab"
  );

  const shelfLevels = useMemo(() => [-1, 0, 1, 2], []);

  /** 🏆 Select Book on Long Press */
  const handlePointerDown = () => {
    setSelectedBook(bookID); // ✅ Updates the selected book in `Bookshelf`
    longPressTimer.current = setTimeout(() => {
      switchPlace("positionAndRotate");
    }, 500); // ✅ Long press detection (500ms)
  };

  const handlePointerUp = () => {

    setTimeout(() => {
      // animate in and out
      // setSelectedBook(null);

      switchPlace("home");
      switchPlace("home");
    }, 6000);
  };

  const constrainToCircle = (x, z, r) => {
    const angle = Math.atan2(z, x);
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle };
  };

  const checkCollision = (newPos) => {
    const minDistanceSq = 0.36; // ✅ Avoids sqrt calculation for performance
    return otherBooks.some(({ x, z }) => {
      const dx = newPos.x - x;
      const dz = newPos.z - z;
      return dx * dx + dz * dz < minDistanceSq;
    });
  };

  const handleRotationChange = (axis, value) => {
    if (!meshRef.current) {
      console.error("meshRef is not defined!");
      return;
    }

    // Get constrained angle based on shelf position
    const { angle } = constrainToCircle(
      meshRef.current.position.x,
      meshRef.current.position.z,
      shelfRadius
    );

    // console.log(`🔄 Book Rotation Change [Axis: ${axis}]`);
    // console.log(`  ⏳ Input Value: ${value}`);
    // console.log(`  📏 Constrained Angle: ${angle}`);

    // Update rotation reference
    if (axis === "x") rotationRef.current.x = value;
    if (axis === "y") rotationRef.current.y = value;
    if (axis === "z") rotationRef.current.z = value;

    //console.log(`  ✅ Updated Rotation:`, rotationRef.current);

    // GSAP Animation
    gsap.to(meshRef.current.rotation, {
      [axis]: rotationRef.current[axis],
      duration: 1,
      ease: "power3.out",
      // onUpdate: () =>
      //   console.log(
      //     `🌀 Animating Rotation [${axis}]:`,
      //     meshRef.current.rotation[axis]
      //   ),
      onComplete: () => {
        //console.log(`✅ Animation Complete for [Axis: ${axis}]`);
        saveToDB(); // Call save function properly
      },
    });
  };

  //This one will have so it can update scale, note + more as well and needs to go to its own component
  const saveToDB = async () => {

    // const db = await openDB("BookDatabase", 2, {
    //   upgrade(db) {
    //     if (!db.objectStoreNames.contains("books")) {
    //       db.createObjectStore("books", { keyPath: "id" });
    //     }
    //   },
    // });

    requestIdleCallback(async () => {
      // const tx = db.transaction("books", "readwrite");
      // const book = (await tx.objectStore("books").get(bookID)) || {
      //   id: bookID,
      // };
      
      //already commented out

      // We need some check here to make sure it is correct format.
      // Then we use it in useBoooks hook!

     // book.position = meshRef.current.position.toArray();
     
      //already commented out
      //meshRef.current.toArray();
      console.log(meshRef.current.position.toArray());

      // book.rotation = [
      //   meshRef.current.position.x,
      //   meshRef.current.position.y,
      //   meshRef.current.position.z,
      // ];
      
      console.log(meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z,);

      //already commented out
      // book.scale =
      //book.rotation = [0, 0, 0];
      //book.rotation = rotationRef.current.toArray();
      //book.rotation = meshRef.current.rotation.y.toArray();
      //       console.log("Book rotation",
      // book.rotation
      //     );

      // await tx.objectStore("books").put(book);
      // await tx.done;

      //already commented out
      //console.log("Book position", positionRef.current.toArray());
      //console.log("Book rotation", rotationRef.current.toArray());
    });
  };

  const bind = useDrag(
    ({ event, active, movement: [, my], delta: [, dy] }) => {
      event.stopPropagation();
      draggingRef.current = active;

      if (!meshRef.current) return;

      if (active) {
        handlePointerDown();
        mouseVecRef.current.set(
          (event.clientX / size.width) * 2 - 1,
          -(event.clientY / size.height) * 2 + 1
        );
        raycaster.setFromCamera(mouseVecRef.current, camera);

        //only first index in array on raycaster/one object.

        plane.constant = -positionRef.current.y;
        if (!raycaster.ray.intersectPlane(plane, intersectionVecRef.current))
          return;
      } else {
        handlePointerUp();
      }

      const { x, z, angle } = constrainToCircle(
        intersectionVecRef.current.x,
        intersectionVecRef.current.z,
        active ? 5.5 : shelfRadius
      );

      let newPos = new THREE.Vector3(x, intersectionVecRef.current.y, z);

      if (checkCollision(newPos)) newPos.copy(positionRef.current);

      const closestShelf = shelfLevels.reduce((prev, curr) =>
        Math.abs(curr - positionRef.current.y) <
        Math.abs(prev - positionRef.current.y)
          ? curr
          : prev
      );

      let tiltAngle = Math.max(-0.2, Math.min(0.2, -my * 0.1));

      if (!active && Math.abs(my) > 50) {
        const index = shelfLevels.indexOf(closestShelf);
        newPos.y =
          my < 10 && index < shelfLevels.length - 1
            ? shelfLevels[index + 1]
            : my > 0 && index > 0
            ? shelfLevels[index - 1]
            : closestShelf;
      } else {
        newPos.y = closestShelf;
      }

      let correctedY = newPos.y - (scale[1] / 2 + 0.08);
      newPos.y = correctedY - my * 0.007;

      if (active) {
        meshRef.current.position.lerp(newPos, 0.2);
        // meshRef.current.rotation.x = THREE.MathUtils.lerp(
        //   meshRef.current.rotation.x,
        //   tiltAngle,
        //   0.4
        // );

        //THIS IS PERFECT DRAG WHEN SPINE!

        meshRef.current.rotation.y = -angle + rotationRef.current.y;

        //meshRef.current.rotation.x = -angle + rotationRef.current.x;

        //meshRef.current.rotation.z = -angle + rotationRef.current.z;

        //meshRef.current.position.y = meshRef.current.position.y - my*0.5;
      } else {
        gsap.to(meshRef.current.position, {
          x: newPos.x,
          y: correctedY,
          z: newPos.z,
          duration: 0.8,
          ease: "power4.out",
          overwrite: true,
          onComplete: () => {
            saveToDB();
            //console.log(newPos.x, correctedY, newPos.z,);
          },
        });

        gsap.to(meshRef.current.rotation, {
          x: 0,
          y: meshRef.current.rotation.y,
          duration: 0.8,
          ease: "power4.out",
          overwrite: true,
        });
      }

      positionRef.current.copy(newPos);
      //console.log("Live Drag Position:", [newPos.x, correctedY, newPos.z]);
      //console.log("Live Rotation:", rotationRef);

      // if (!active) {
      //   saveToDB(
      //     bookID,
      //     positionRef,
      //     meshRef.current.rotation || [0, 0, 0]
      //   );
      // }
    },
    {
      threshold: 2,
      pointerEvents: true,
      filterTaps: true,
      rubberband: 0.15,
    }
  );

  const textures = [
    useSafeLoader("./books/booktexture.png"),
    // useSafeLoader(cover?.spine || "./books/covers/000.jpg"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
    useSafeLoader("./books/booktexture.png"),
    useSafeLoader("./books/booktexture.png"),
    // useSafeLoader(cover?.front || "./books/covers/000.jpg"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
    // useSafeLoader(cover?.back || "./books/covers/000.jpg"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
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
        {...bind()} // ✅ Enable drag only if selected
        //{...(showPivot ? bind() : {})}
        onDoubleClick={() => {
          meshRef.current.position.set(0, 0, 0);
          //alert(bookID);
        }}
        scale={scale}
        position={positionRef.current}
        rotation={rotationRef.current}
        onPointerEnter={() => (hoveredRef.current = true)}
        onPointerLeave={() => (hoveredRef.current = false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
        <meshBasicMaterial color={color} />
        {materials.map((material, i) => (
          <primitive key={i} object={material} attach={`material-${i}`} />
        ))}

        {/* {showPivot && (
          <PivotControls
            ref={pivotRef}
            autoTransform={true}
            
            depthTest={false}//  ✅ Keep it visible
            disableScaling={true}
            disableSliders={true}
            disableAxes={true}
            axisColors={["#ff0000", "#00ff00", "#ff00ff"]} // ✅ RGB for better visibility
            onDrag={(e) => {
              // console.log(e)
              if (!meshRef.current) return;
              // ✅ Apply rotation only
              // Extract rotation from the Matrix4
              const quaternion = new THREE.Quaternion().setFromRotationMatrix(
                e
              );
              const currentEuler = new THREE.Euler().setFromQuaternion(
                meshRef.current.quaternion
              );

              // Convert quaternion to Euler and apply it with smoothing
              const newEuler = new THREE.Euler().setFromQuaternion(quaternion);
              const sensitivity = .21;

              // Apply damping to smooth rotation
              meshRef.current.rotation.set(
                currentEuler.x + (newEuler.x - currentEuler.x) * sensitivity,
                currentEuler.y + (newEuler.y - currentEuler.y) * sensitivity,
                currentEuler.z + (newEuler.z - currentEuler.z) * sensitivity
              );

            }}
            onDragEnd={() => {
              saveToDB();
            }} // ✅ Save rotation when dragging stops
            onPointerDown={(e) => e.stopPropagation()} // Prevent accidental deselection
          ></PivotControls>
        )} */}

         {/* {selectedBook === bookID && (
          <Html pointerEvents="none" 
          position={[meshRef.current.position.x,meshRef.current.position.y,meshRef.current.position.z+1]}>
           <div className="w-32 h-screen">
           <RainbowAurora/>
           

             {currentPlace.current === "showEdit" && 
            <>

                  <BookDimensionControls
                  mesh={meshRef}
           
                   />
</>
              }

            <div class="relative mx-auto mt-[40px] flex h-12 w-fit shrink flex-wrap items-center justify-center rounded-lg border-1/2 border-slate-200 bg-white px-5 py-1 text-sm text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 2xl:h-14 transition-all transition-colors duration-300 ease-in-out">
              <div
                className={`relative flex gap-1 transition-all duration-300 ${
                  currentPlace.current === "home" ? "block" : "hidden"
                }`}
              >
                <>
                  <button
                    title="Edit Book"
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                    onClick={() => {
                      switchPlace("showEdit")
                    }}
                  >
                    <PencilRuler/>
                  </button>

                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>

                  <button
                    title="Change book position"
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                    //onClick={() => setPositionAndRotate(!positionAndRotate)}
                    onClick={() => switchPlace("positionAndRotate")}
                  >
                    <Rotate3D/>
                  </button>

                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>

                  <button
                    title="Open book"
                    className="outline-none! relative flex cursor-pointer items-center bg-white rounded-full p-2 hover:bg-blue-800 p-1 rounded"
                  >
                    <SquareArrowOutUpRightIcon color={"#0f172b"}/>
                  </button>

                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>

                  <button
                    title="Add note"
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                    onClick={() => switchPlace("addNote")}
                    
                  >
                    <NotebookPen/>
                  </button>

                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>
                  <button
                    title="Share book"
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                    onClick={() => switchPlace("shareLinkBook")}
                  >
                    <Link/>
                    
                  </button>
                </>
              </div>

              <div
                className={`relative flex gap-1 transition-all duration-300 flex-col ${
                  currentPlace.current === "positionAndRotate"
                    ? "block"
                    : "hidden"
                }`}
              >

                <div className="flex gap-1">
                  <button
                    onClick={() => switchPlace("home")}
                    title="close"
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-[rgb(51,65,85)] p-1 rounded"
                  >
                    <ArrowLeft />
                  </button>

                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>

                  <button
                    onClick={() => setShowPivot(!showPivot)}
                    title="custom rotation"
                    className={`outline-none! relative flex cursor-pointer items-center hover:bg-[rgb(51,65,85)] ${
                      showPivot && "bg-[rgb(51,65,85)]"
                    } p-1 rounded`}
                  >
                    <Rotate3D />
                  </button>
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>

                  <button
                    title="rotate to front"
                    onClick={() => {
                      handleRotationChange("y", -Math.PI / 2);
                      handleRotationChange("y", 0);
                      handleRotationChange("z", 0);
                    }}
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="2" width="16" height="20" />
                    </svg>
                  </button>
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>
                  <button
                    title="rotate to spine"
                    onClick={() => {
                      handleRotationChange("y", 0);
                      handleRotationChange("x", 0);
                      handleRotationChange("z", 0);
                    }}
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="10" y="3" width="5" height="20" />
                    </svg>
                  </button>
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                    className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                  ></div>
                  <button
                    title="rotate to laying down"
                    onClick={() => {
                      handleRotationChange("z", Math.PI / 2);
                      handleRotationChange("y", -Math.PI);
                      // the y can change direction depending on + or minus in front of it!
                      handleRotationChange("x", -(Math.PI / 2));
                    }}
                    className="outline-none! relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="16" width="20" height="5" />
                    </svg>
                  </button>
                </div>

              </div>

              <div
                className={`relative flex gap-1 transition-all duration-300 flex-col ${
                  currentPlace.current === "dimension"
                    ? "block"
                    : "hidden"
                }`}

              >
                 <button
                  onClick={() => switchPlace("home")}
                  title="close"
                  className="outline-none! relative flex cursor-pointer items-center hover:bg-[rgb(51,65,85)] p-1 rounded"
                >
                  <ArrowLeft />
                </button>
                 <BookDimensionControls/>

              </div>

              <div
                className={`relative flex gap-1 transition-all duration-300 flex-col ${
                  currentPlace.current === "addNote"
                    ? "block"
                    : "hidden"
                }`}
              >
                 <button
                  onClick={() => switchPlace("home")}
                  title="close"
                  className="outline-none! relative flex cursor-pointer items-center hover:bg-[rgb(51,65,85)] p-1 rounded"
                >
                  <ArrowLeft />
                </button>
                


              </div>


              <div
                className={`relative flex gap-1 transition-all duration-300 ${
                  currentPlace.current === "shareLinkBook" ? "block" : "hidden"
                }`}
              >
                <button
                  onClick={() => switchPlace("home")}
                  title="close"
                  className="outline-none! relative flex cursor-pointer items-center hover:bg-[rgb(51,65,85)] p-1 rounded"
                >
                  <ArrowLeft />
                </button>

                <div
                  data-orientation="vertical"
                  aria-orientation="vertical"
                  role="separator"
                  className="my-auto w-px bg-slate-200 dark:bg-slate-700 mx-2 h-5"
                ></div>

                <input
                  className="text-black w-[350px] bg-slate-500 px-2"
                  value={shareableUrl}
                />
                <button
                  title="Share book"
                  className="outline-none relative flex cursor-pointer items-center hover:bg-blue-800 p-1 rounded"
                  onClick={handleShareUrl}
                >
                  {urlCopied ? (
                    <div className="flex items-center gap-1">
                      <Check size={24} className="text-green-500" />
                      <span className="text-xs text-green-500">
                        URL Copied!
                      </span>
                    </div>
                  ) : (
                    <Link size={24} />
                  )}
                </button>
              </div>
            </div>
            </div>
          </Html>
        )}  */}
      </mesh>
    </Suspense>
  );
};
export default Book;
