"use client";
import React, { useRef, useMemo, Suspense, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import gsap from "gsap";
import useSafeLoader from "./useSafeLoader";

// import { openDB } from "idb";
// import BookDimensionControls from "./Dimensions"
// import RainbowAurora from './RainbowAurora'

const Book = ({
  id,
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
  drag,
  setDrag
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
  const longPressTimer = useRef(); // ✅ Timer reference for long press
  //Why does this not auto update sometimes I have to press twice?
  const currentPlace = useRef("home");
  // const [drag, setDrag] = useState(false);


  const switchPlace = (place) => {
    currentPlace.current = place;
  };

  const handlePointerDown = () => {
    setSelectedBook(bookID); // ✅ Updates the selected book in `Bookshelf`
    longPressTimer.current = setTimeout(() => {
      switchPlace("positionAndRotate");
    }, 500); // ✅ Long press detection (500ms)
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current); // ✅ Clear the timer
    setTimeout(() => {
      switchPlace("home");
    }, 6000);
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

    console.log(`🔄 Book Rotation Change [Axis: ${axis}]`);
    console.log(`  ⏳ Input Value: ${value}`);
    console.log(`  📏 Constrained Angle: ${angle}`);

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

      console.log(
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      );

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
        !active ? 6.5 : shelfRadius
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

      if (!active && Math.abs(my) > 8) {
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

      let correctedY = newPos.y - (scale[1] / 2) + 0.01;
      //newPos.y = newPos.y - (scale[1]/2) + 0.01;
      //newPos.y = correctedY;

      if (active) {
        meshRef.current.position.copy(newPos);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
          meshRef.current.rotation.x,
          tiltAngle,
          0.4
        );

        //THIS IS PERFECT DRAG WHEN SPINE!?

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
      threshold: 0.1,
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
        // {...bind()} // ✅ Enable drag only if selected
        {...(drag ? bind() : {})}
        //{...(showPivot ? bind() : {})}
        onDoubleClick={() => {
          //meshRef.current.position.set(0, 0, 0);
          //alert(bookID);
          handleRotationChange("y", 0);
          handleRotationChange("x", 0);
          handleRotationChange("z", 0);
        }}


        scale={scale}
        key={id}
        position={positionRef.current}
        rotation={rotationRef.current}
        onPointerEnter={() => (hoveredRef.current = true)}
        onPointerLeave={() => (hoveredRef.current = false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
        <meshBasicMaterial color={color} />
        {materials.map((material, i) => (
          <primitive key={`${id}-${i}`} object={material} attach={`material-${i}`} />
        ))}
      </mesh>
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
