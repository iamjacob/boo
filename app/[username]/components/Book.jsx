"use client";
import React, {
  useRef,
  useEffect,
  useMemo,
  Suspense,
  useState,
  forwardRef,
  useImperativeHandle,
  use,
} from "react";
import { useOpenBookStore } from "../../../stores/useOpenBookStore";
import { useBookInfoStore } from "../../../stores/useBookInfoStore";
import { useThree, useFrame } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import gsap from "gsap";
import useBookMaterials from "./useBookMaterials";
import BookContextMenu from "./BookContextMenuLayered";
import FloatingTransformPanel from "./FloatingTransformPanel";

// import { openDB } from "idb";
// import BookDimensionControls from "./Dimensions"
// import RainbowAurora from './RainbowAurora'

const Book = forwardRef(
  (
    {
      id,
      color = "red",
      scale,
      initialPosition = [-2.79, -0.61, -5.87],
      initialRotation = [0, 0, 0],
      shelfRadius = 6.5,
      otherBooks = [],
      bookID,
      cover,
      title = "Untitled Book", // Add title prop
      selectedBook = 0, // ✅ Receives the currently selected book ID
      setSelectedBook, // ✅ Function to update selection
      drag,
      setDrag,
      // onDoubleClick,
      bookObject,
    },
    ref
  ) => {
    const { raycaster, camera, size } = useThree();
    const meshRef = useRef();
    const selectionIndicatorRef = useRef();
    const pulseIndicatorRef = useRef();

    // Context menu state
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState([0, 0, 0]);
    const [isMenuOnRightSide, setIsMenuOnRightSide] = useState(false);

    // Transform panel state
    const [showTransformPanel, setShowTransformPanel] = useState(false);
    const [transformPanelPosition, setTransformPanelPosition] = useState([
      0, 0, 0,
    ]);

    // Add this state for pulsing animation
    const [wireframePulse, setWireframePulse] = useState(0.4);

    // Click delay to prevent interference with double-click
    const clickTimeoutRef = useRef(null);
    const lastTapTimeRef = useRef(0);

    const {
      openBookId,
      setBookObject,
      closeHandler,
      animateBackBook,
      animateBackBookId,
      loadingBookId,
      toggleBook,
      closeBook,
      setLoadingBookId,
      setOpenBookId,
    } = useOpenBookStore();
    const { toggleBookInfo } = useBookInfoStore();

    useEffect(() => {
      // If this book was open and is now closed, animate back
      if (openBookId !== id && openBookId !== null) {
        // Call the close handler from Zustand before moving the book
        if (closeHandler) {
          closeHandler();
          setTimeout(() => {
            animateBackToShelf();
          }, 500); // Adjust the timeout as needed
        }
      }

      // If this book is now open, animate to showcase
      if (openBookId === id) {
        animateToShowcase();
        // console.log("bookObject: ", bookObject);
        setBookObject(bookObject);
      }
    }, [openBookId]);

    // Selection indicator animations
    useEffect(() => {
      if (selectedBook === bookID) {
        // Animate pulse effect when selected
        if (pulseIndicatorRef.current) {
          gsap.fromTo(
            pulseIndicatorRef.current.material,
            { opacity: 0.2 },
            {
              opacity: 0.6,
              duration: 0.8,
              repeat: -1,
              yoyo: true,
              ease: "power2.inOut",
            }
          );

          gsap.fromTo(
            pulseIndicatorRef.current.scale,
            { x: scale[0] * 1.1, y: scale[1] * 1.1, z: scale[2] * 1.1 },
            {
              x: scale[0] * 1.15,
              y: scale[1] * 1.15,
              z: scale[2] * 1.15,
              duration: 0.8,
              repeat: -1,
              yoyo: true,
              ease: "power2.inOut",
            }
          );
        }
      } else {
        // Stop animations when deselected
        if (pulseIndicatorRef.current) {
          gsap.killTweensOf(pulseIndicatorRef.current.material);
          gsap.killTweensOf(pulseIndicatorRef.current.scale);
        }
      }
    }, [selectedBook, bookID, scale]);

    // Animation now handled by parent (Books)
    const animateToShowcase = () => {
      if (!meshRef.current) return;

      animateBackToShelf(); // Reset first

      gsap.to(meshRef.current.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      // Smooth rotation back to original shelf rotation
      gsap.to(meshRef.current.rotation, {
        x: -0.4,
        y: -Math.PI / 2,
        z: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.to(meshRef.current.rotation, {
        x: -0.4,
        y: Math.PI * 1.5,
        z: 0,
        duration: 3,
        delay: 1.2,
        ease: "power3.out",
      });

      // Return to original scale
      gsap.to(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0,
        delay: 4.2,
        ease: "power3.out",
        onComplete: () => {
          //setOpenBookId(id); // Show OpenBook after delay
        },
      });
    };

    const animateBackToShelf = () => {
      if (!meshRef.current) return;

      // Return to original scale
      gsap.to(meshRef.current.scale, {
        x: scale[0],
        y: scale[1],
        z: scale[2],
        duration: 0.1,
        ease: "power3.out",
      });

      // Animate back to original position
      gsap.to(meshRef.current.position, {
        x: initialPosition[0],
        y: initialPosition[1],
        z: initialPosition[2],
        duration: 1.2,
        ease: "power3.out",
      });

      // Animate back to original rotation
      gsap.to(meshRef.current.rotation, {
        x: initialRotation[0],
        y: initialRotation[1],
        z: initialRotation[2],
        duration: 1.2,
        ease: "power3.out",
      });
    };

    useImperativeHandle(ref, () => meshRef.current);

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

    const handlePointerDown = (e) => {
      // Check if it's a right-click (context menu)
      if (e && e.button === 2) {
        //e.preventDefault();
        //e.stopPropagation();
        showBookContextMenu(e);
        return;
      }

      setSelectedBook(bookID); // ✅ Updates the selected book in `Bookshelf`
      longPressTimer.current = setTimeout(() => {
        showBookContextMenu(e); // Show context menu on long press
      }, 500); // ✅ Long press detection (500ms)
    };

    const showBookContextMenu = (event) => {
      if (!meshRef.current) return;

      // Get the book's world position
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);

      // Check mouse position relative to screen edges if event is available
      let isOnRightSide = false;

      if (event && event.clientX !== undefined) {
        // Get actual mouse distance from screen edges
        const screenWidth = window.innerWidth;
        const mouseX = event.clientX;
        const distanceFromLeft = mouseX;
        const distanceFromRight = screenWidth - mouseX;

        // Use mouse position: if closer to right edge, show menu on left side of book
        // This prevents menu from going off-screen
        isOnRightSide = distanceFromRight < 200; // 200px threshold from right edge
      } else {
        // Fallback: use book's screen position if no mouse event
        const screenPosition = worldPosition.clone();
        screenPosition.project(camera);
        isOnRightSide = screenPosition.x > 0.2;
      }

      setIsMenuOnRightSide(isOnRightSide);

      // Set menu position relative to book
      setContextMenuPosition([
        worldPosition.x,
        worldPosition.y + 0.3, // Slightly above the book
        worldPosition.z,
      ]);

      setShowContextMenu(true);
    };

    const hideContextMenu = () => {
      setShowContextMenu(false);
    };

    const showTransformControls = () => {
      if (!meshRef.current) return;

      // Get the book's world position
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);

      setTransformPanelPosition([
        worldPosition.x,
        worldPosition.y,
        worldPosition.z,
      ]);
      setShowTransformPanel(true);
      setShowContextMenu(false); // Hide context menu when showing transform panel
    };

    const hideTransformControls = () => {
      setShowTransformPanel(false);
    };

    // Move book functionality
    const handleSwapBook = (bookId) => {
      // console.log("Swap book:", bookId);
      // TODO: Implement book swapping logic
      // This could open a modal to select another book to swap with
      // or enter a "swap mode" where clicking another book swaps them
      alert("Swap mode activated! Click another book to swap positions.");
    };

    const handleHoldBook = (bookId) => {
      // console.log("Hold book:", bookId);
      // TODO: Implement book holding logic
      // This could temporarily "hold" the book in a virtual clipboard
      // and allow placing it elsewhere
      alert("Book held! You can now place it in a new position.");
    };

    const handleMoveToPosition = (bookId, newPosition) => {
      // console.log("Move book to position:", bookId, newPosition);
      // TODO: Implement move to specific position
      // This should animate the book to the new position
      if (meshRef.current) {
        gsap.to(meshRef.current.position, {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z,
          duration: 1,
          ease: "power3.out",
        });
      }
    };

    // Context menu handlers
    const handleAddToCollection = (bookId, collectionType) => {
      // console.log("Add to collection:", bookId, "Type:", collectionType);
      // TODO: Implement add to collection functionality
      // This could open a modal to select collections or create a new one
      switch (collectionType) {
        case "reading":
          console.log("Adding to reading list");
          break;
        case "favorites":
          console.log("Adding to favorites");
          break;
        case "wishlist":
          console.log("Adding to wishlist");
          break;
        case "new":
          console.log("Creating new collection");
          break;
        default:
          console.log("General add to collection");
      }
      hideContextMenu();
    };

    const handleEditBook = (bookId, editType) => {
      // console.log("Edit book:", bookId, "Type:", editType);
      // TODO: Implement edit book functionality
      // This could open the book editor or metadata editor
      switch (editType) {
        case "metadata":
          console.log("Opening metadata editor");
          break;
        case "cover":
          console.log("Opening cover editor");
          break;
        case "notes":
          console.log("Opening notes editor");
          break;
        case "properties":
          console.log("Opening properties panel");
          break;
        default:
          console.log("General book edit");
      }
      hideContextMenu();
    };

    const handleEditRotation = (bookId, transformType) => {
      // console.log("Transform book:", bookId, "Type:", transformType);

      switch (transformType) {
        case "position":
          switchPlace("positionAndRotate");
          setDrag(true); // Enable drag mode for positioning
          setSelectedBook(bookID);
          break;
        case "rotation":
          showTransformControls(); // Show the floating transform panel
          break;
        case "live-transform":
          showTransformControls(); // Show the floating transform panel
          break;
        case "reset-position":
          console.log("Resetting position");
          // Reset to default position
          if (meshRef.current) {
            gsap.to(meshRef.current.position, {
              x: initialPosition[0],
              y: initialPosition[1],
              z: initialPosition[2],
              duration: 1,
              ease: "power3.out",
            });
          }
          break;
        case "reset-rotation":
          console.log("Resetting rotation");
          // Reset to default rotation
          handleRotationChange("x", 0);
          handleRotationChange("y", 0);
          handleRotationChange("z", 0);
          break;
        default:
          showTransformControls(); // Default to showing transform panel
      }

      hideContextMenu();
    };

    const handlePointerUp = () => {
      clearTimeout(longPressTimer.current); // ✅ Clear the timer
      setTimeout(() => {
        switchPlace("home");
        hideContextMenu(); // Hide context menu when returning to home
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

    const shelfLevels = useMemo(() => [-1.8, -0.8, 0.2, 1.2], []); // Match actual shelf positions

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

        console.log("scale[1] during drag:", scale[1]);

        if (!meshRef.current) return;

        if (active) {
          handlePointerDown(event);
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

        // Apply height correction to position books properly on shelves
        // console.log("scale array:", scale);
        // console.log("scale[1] (height):", scale[1]);
        // console.log("scale[1]/2 (half height):", scale[1]/2);
        // console.log("newPos.y before correction (shelf level):", newPos.y);

        // Offset books to sit ON TOP of the shelf (add half height + shelf thickness)
        newPos.y = newPos.y + scale[1] / 2 + 0.08;
        // console.log("newPos.y after correction:", newPos.y);

        //newPos.y = newPos.y - (scale[1]/2) + 0.01;

        if (active) {
          meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
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
            y: newPos.y, // Use newPos.y instead of correctedY
            z: newPos.z,
            duration: 0.8,
            ease: "power4.out",
            overwrite: true,
            onComplete: () => {
              saveToDB();
              //console.log(newPos.x, newPos.y, newPos.z,);
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

    // console.log("scale[1] on render:", scale[1]);
    // console.log("scale[1]/2 on render:", scale[1]/2);

    // 🚀 Use the optimized materials hook with caching
    const { materials, isLoading, texturesLoaded, bookColor } = useBookMaterials(
      cover, 
      initialPosition, 
      bookID
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

          onPointerDown={(e) => {
            e.stopPropagation();

            const now = Date.now();
            const timeDiff = now - lastTapTimeRef.current;

            // Clear existing timeout
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }

            // Check if it's a double tap (within 400ms)
            if (timeDiff < 400 && timeDiff > 50) {
              // This is a double tap - open book immediately
              // console.log(
              //   "Double tap detected! Opening book:",
              //   bookObject?.title,
              //   "ID:",
              //   id
              // );
              toggleBook(id); // Use id instead of bookID to match useEffect
              setBookObject(bookObject);
              lastTapTimeRef.current = 0; // Reset
            } else {
              // This might be a single tap - wait to see if another comes
              clickTimeoutRef.current = setTimeout(() => {
                // console.log(
                //   "Single tap confirmed! Toggling info for:",
                //   bookObject?.title
                // );
                toggleBookInfo(bookObject);
                lastTapTimeRef.current = 0; // Reset
              }, 250);
              lastTapTimeRef.current = now;
            }

            // Also handle the original pointer down logic
            handlePointerDown(e);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            handlePointerUp();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showBookContextMenu(e);
          }}
          scale={scale}
          position={positionRef.current}
          rotation={rotationRef.current}
          onPointerEnter={() => (hoveredRef.current = true)}
          onPointerLeave={() => (hoveredRef.current = false)}
          // onDoubleClick
        >
          <boxGeometry args={[1, 1, 1]} />
          {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
          {/* <meshBasicMaterial color={color} /> */}
          {materials.map((material, i) => (
            <primitive
              key={`${bookID}-material-${i}`}
              object={material}
              attach={`material-${i}`}
            />
          ))}
        </mesh>

        {/* Context Menu */}
        <BookContextMenu
          visible={showContextMenu}
          position={contextMenuPosition}
          onClose={hideContextMenu}
          onAddToCollection={handleAddToCollection}
          onEditBook={handleEditBook}
          onEditRotation={handleEditRotation}
          bookId={bookID}
          bookTitle={title || bookObject?.title || `Book ${bookID}`}
          bookCover={
            cover || bookObject?.cover?.front || "./books/covers/000.jpg"
          }
          bookAuthor={bookObject?.author || "Unknown Author"}
          meshRef={meshRef} // Pass the mesh reference for live updates
          isOnRightSide={isMenuOnRightSide}
        />

        {/* Floating Transform Panel */}
        <FloatingTransformPanel
          visible={showTransformPanel}
          bookPosition={transformPanelPosition}
          meshRef={meshRef}
          camera={camera}
          onClose={hideTransformControls}
          onSwapBook={handleSwapBook}
          onHoldBook={handleHoldBook}
          onMoveToPosition={handleMoveToPosition}
          bookId={bookID}
          bookTitle={title || `Book ${bookID}`}
        />
      </Suspense>
    );
  }
);
export default Book;
