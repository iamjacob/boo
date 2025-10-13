"use client";
import React, {
  useRef,
  useEffect,
  useMemo,
  Suspense,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useOpenBookStore } from "../../../stores/useOpenBookStore";
import { useBookInfoStore } from "../../../stores/useBookInfoStore";
import { useThree } from "@react-three/fiber";
import { useCursor, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import useBookMaterials from "./useBookMaterials_simple";
import FloatingBlobsMenu from "./floatingBlobsMenu";
import FloatingTransformPanel from "./FloatingTransformPanel";
import FloatingDragRotationMenu from "./FloatingDragRotationMenu";
import FloatingBookDragMenu from "./FloatingBookDragMenu";

// Custom hooks for separated concerns
import {
  useBookDatabase,
  useBookDrag,
  useBookTransform
} from "./hooks";

// import { openDB } from "idb";
// import BookDimensionControls from "./Dimensions"
// import RainbowAurora from './RainbowAurora'

const Book = forwardRef(
  (
    {
      id,
      scale,
      initialPosition = [-2.79, -0.61, -5.87],
      initialRotation = [0, 0, 0],
      shelfRadius = 6.5,
      otherBooks = [],
      bookID,
      cover,
      title = "Untitled Book",
      selectedBook = 0,
      setSelectedBook,
      drag,
      setDrag,
      bookObject,
    },
    ref
  ) => {
    const { camera } = useThree();
    const meshRef = useRef();
    const selectionIndicatorRef = useRef();
    const pulseIndicatorRef = useRef();

    // Click delay to prevent interference with double-click
    const clickTimeoutRef = useRef(null);
    const lastTapTimeRef = useRef(0);

    // Current place tracking
    const currentPlace = useRef("home");

    // Track if book info was open for this book
    const bookInfoWasOpenRef = useRef(false);

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
    const { toggleBookInfo, selectedBook: bookInfoSelectedBook } = useBookInfoStore();

    // Refs for position and rotation
    const positionRef = useRef(new THREE.Vector3(...initialPosition));
    const rotationRef = useRef(new THREE.Euler(...initialRotation));
    const hoveredRef = useRef(false);

    // Initialize custom hooks
    const { saveToDB } = useBookDatabase(bookID);

    const switchPlace = (place) => {
      currentPlace.current = place;
    };

    // Database save wrapper
    const handleSave = () => {
      saveToDB(meshRef, rotationRef);
    };

    // Simple context menu replacement - just prevent default right-click
    const handleContextMenu = useCallback((e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Prevent context menu when drag mode is active
      if (drag) {
        console.log("🚫 Right-click context menu blocked - drag mode is active");
        return;
      }
    }, [drag]);

    const handleEditRotation = useCallback(() => {
      // Simple rotation edit - could be expanded later
      console.log("Edit rotation for book:", bookID);
    }, [bookID]);

    // FloatingBlobsMenu state
    const [showBlobsMenu, setShowBlobsMenu] = useState(false);
    const [blobsMenuPosition, setBlobsMenuPosition] = useState([0, 0, 0]);
    const longPressTimer = useRef(null);
    const longPressTriggered = useRef(false);

    // Long press detection for book context menu
    const handleBookPointerDown = useCallback((e) => {
      e.stopPropagation();

      // Reset long press flag
      longPressTriggered.current = false;

      // Don't show menu in drag mode
      if (drag) {
        console.log("🚫 Book menu blocked - drag mode is active");
        return;
      }

      // Select the book
      if (setSelectedBook) {
        setSelectedBook(bookID);
      }

      // Start long press timer for context menu
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true; // Mark that long press occurred
        // Calculate position for the menu relative to book
        const bookPosition = meshRef.current?.position;
        if (bookPosition) {
          setBlobsMenuPosition([
            bookPosition.x + 1, // Offset to the right
            bookPosition.y + 0.5, // Slightly above
            bookPosition.z
          ]);
          setShowBlobsMenu(true);
          console.log("📋 Book context menu activated via long press");
        }
      }, 500); // 500ms long press
    }, [drag, setSelectedBook, bookID]);

    const handleBookPointerUp = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Add a small delay to ensure long press has time to set the flag
      setTimeout(() => {
        // Reset the flag after a short delay to allow for next interaction
        longPressTriggered.current = false;
      }, 100);
    }, []);

    // Menu action handlers
    const handleAddToCollection = useCallback((bookId, collectionType) => {
      console.log("Add to collection:", bookId, "Type:", collectionType);
      setShowBlobsMenu(false);
    }, []);

    const handleEditBook = useCallback((bookId) => {
      console.log("Edit book:", bookId);
      setShowBlobsMenu(false);
    }, []);

    const handleRemoveFromShelf = useCallback((bookId) => {
      console.log("Remove from shelf:", bookId);
      setShowBlobsMenu(false);
    }, []);

    const handleDeleteBook = useCallback((bookId) => {
      console.log("Delete book:", bookId);
      setShowBlobsMenu(false);
    }, []);

    // Transform controls hook
    const {
      transformPanelProps,
      showTransformControls,
      hideTransformControls,
      handleRotationChange,
      resetPosition,
      resetRotation,
    } = useBookTransform({
      meshRef,
      rotationRef,
      initialPosition,
      initialRotation,
      bookID,
      title,
      onSave: handleSave
    });

    // Handlers for the new drag menu (must be after useBookTransform hook)
    const handleViewChange = useCallback((viewType) => {
      if (!meshRef.current) return;

      switch (viewType) {
        case 'front':
          // Rotate to show front face
          gsap.to(meshRef.current.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.out"
          });
          break;
        case 'spine':
          // Rotate to show spine
          gsap.to(meshRef.current.rotation, {
            x: 0,
            y: Math.PI / 2,
            z: 0,
            duration: 0.5,
            ease: "power2.out"
          });
          break;
      }
      
      // Update rotation reference
      setTimeout(() => {
        if (meshRef.current) {
          rotationRef.current.copy(meshRef.current.rotation);
          handleSave();
        }
      }, 500);
    }, [handleSave]);

    const handleCustomRotate = useCallback(() => {
      // Show the transform controls for custom rotation
      showTransformControls();
    }, [showTransformControls]);

    // Handler for 10-degree rotation increments
    const handleRotateBy = useCallback((axis, degrees) => {
      if (!meshRef.current) return;

      const radians = (degrees * Math.PI) / 180;
      const currentRotation = meshRef.current.rotation[axis];
      const newRotation = currentRotation + radians;

      // Animate the rotation
      gsap.to(meshRef.current.rotation, {
        [axis]: newRotation,
        duration: 0.3,
        ease: "power2.out"
      });

      // Update rotation reference to preserve during drag
      setTimeout(() => {
        if (meshRef.current) {
          rotationRef.current[axis] = newRotation;
          handleSave();
        }
      }, 300);
    }, [handleSave]);

    // Enhanced handleEditRotation to work with transform controls
    const enhancedHandleEditRotation = (bookId, transformType) => {
      switch (transformType) {
        case "position":
          switchPlace("positionAndRotate");
          setDrag(true);
          setSelectedBook(bookID);
          break;
        case "rotation":
        case "live-transform":
          showTransformControls();
          break;
        case "reset-position":
          resetPosition();
          break;
        case "reset-rotation":
          resetRotation();
          break;
        default:
          showTransformControls();
      }
      // Hide context menu after action
      if (contextMenuProps.onClose) contextMenuProps.onClose();
    };

    // Drag hook
    const { bind, isDragging, shouldEnableDrag } = useBookDrag({
      meshRef,
      positionRef,
      rotationRef,
      scale,
      shelfRadius,
      otherBooks,
      drag,
      onSave: handleSave,
      onPointerDown: (e) => {
        // Simple pointer down handler
        if (setSelectedBook) {
          setSelectedBook(bookID);
        }
      },
      onPointerUp: () => {
        // Simple pointer up handler
        console.log('Book pointer up');
      },
      onDragStart: () => {
        // Auto-select this book when dragging starts
        if (setSelectedBook) {
          setSelectedBook(bookID);
        }
      }
    });

    // Enhanced rotation change handler that also updates the floating menu
    const handleEnhancedRotationChange = (axis, value) => {
      if (!meshRef.current) return;

      // Update rotation reference
      if (axis === "x") rotationRef.current.x = value;
      if (axis === "y") rotationRef.current.y = value;
      if (axis === "z") rotationRef.current.z = value;

      // Apply rotation immediately for real-time feedback
      meshRef.current.rotation[axis] = value;
    };

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

    // Handle book info open/close animations
    useEffect(() => {
      const isOpenForThisBook = bookInfoSelectedBook?.id === bookID;
      
      if (bookInfoWasOpenRef.current && !isOpenForThisBook) {
        // Book info was closed for this book, animate back to shelf
        gsap.killTweensOf(meshRef.current.position);
        gsap.to(meshRef.current.position, {
          z: initialPosition[2],
          x: initialPosition[0],
          y: initialPosition[1],
          duration: 1,
          ease: "power3.out",
          onComplete: () => positionRef.current.copy(meshRef.current.position)
        });
      }
      
      bookInfoWasOpenRef.current = isOpenForThisBook;
    }, [bookInfoSelectedBook, bookID, initialPosition]);

    // Set initial position
    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.position.copy(positionRef.current);
      }
    }, []);

    // Book opening/closing effects
    useEffect(() => {
      // If this book was open and is now closed, animate back
      if (openBookId !== id && openBookId !== null) {
        if (closeHandler) {
          closeHandler();
          setTimeout(() => {
            animateBackToShelf();
          }, 500);
        }
      }

      // If this book is now open, animate to showcase
      if (openBookId === id) {
        animateToShowcase();
        setBookObject(bookObject);
      }
    }, [openBookId]);

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

      gsap.to(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0,
        delay: 4.2,
        ease: "power3.out",
      });
    };

    const animateBackToShelf = () => {
      if (!meshRef.current) return;

      gsap.to(meshRef.current.scale, {
        x: scale[0],
        y: scale[1],
        z: scale[2],
        duration: 0.1,
        ease: "power3.out",
      });

      gsap.to(meshRef.current.position, {
        x: initialPosition[0],
        y: initialPosition[1],
        z: initialPosition[2],
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.to(meshRef.current.rotation, {
        x: initialRotation[0],
        y: initialRotation[1],
        z: initialRotation[2],
        duration: 1.2,
        ease: "power3.out",
      });
    };

    useImperativeHandle(ref, () => meshRef.current);

    useCursor(
      hoveredRef.current || isDragging,
      isDragging ? "grabbing" : "grab"
    );

    // Normalize cover object to ensure front, back, spine are set

    const normalizePath = (path) => {
      if (!path) return "./test.png";
      return path.startsWith('./covers/') ? path.replace('./covers/', '/covers/') : path;
    };
    const normalizeCoverObject = (coverInput) => {
      // If cover is a string, use it for all sides
      if (typeof coverInput === 'string') {
        const norm = normalizePath(coverInput);
        return {
          front: norm,
          back: norm,
          spine: norm,
        };
      }
      // If cover is an object, normalize each side
      return {
        front: normalizePath(coverInput?.front || "./test.png"),
        back: normalizePath(coverInput?.back || coverInput?.front || "./test.png"),
        spine: normalizePath(coverInput?.spine || coverInput?.front || "./test.png"),
      };
    };

    const normalizedCover = useMemo(() => normalizeCoverObject(cover), [cover]);

    // Use the optimized materials hook with caching
    const { materials, isLoading, texturesLoaded, bookColor } = useBookMaterials(
      normalizedCover,
      initialPosition,
      id || bookID
    );

    //saveToDB();
    //console.log(meshRef.current.scale.set(1,1,1))

    return (
      <Suspense fallback={"loading"}>
        <mesh
          ref={meshRef}
          {...(shouldEnableDrag ? bind() : {
            onPointerDown: (e) => {
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
                toggleBook(id);
                setBookObject(bookObject);
                lastTapTimeRef.current = 0;
              } else {
                // This might be a single tap - wait to see if another comes
                clickTimeoutRef.current = setTimeout(() => {
                  // Only show book info if long press wasn't triggered
                  if (!longPressTriggered.current) {
                    toggleBookInfo(bookObject);

                    //gsap the 3d book to fly out
                    gsap.killTweensOf(meshRef.current.position);
                    gsap.to(meshRef.current.position, {
                      z: 0,
                      x: 0,
                      y: 0,
                      duration: 1,
                      ease: "power3.out",
                      onComplete: () => positionRef.current.copy(meshRef.current.position)
                    });

                    console.log("📖 Showing book info - no long press detected");
                  } else {
                    console.log("🚫 Book info blocked - long press was detected");
                  }
                  lastTapTimeRef.current = 0;
                }, 600); // Increased delay to ensure long press detection (500ms + buffer)
                lastTapTimeRef.current = now;
              }

              // Handle book menu long press
              handleBookPointerDown(e);
            },
            onPointerUp: (e) => {
              e.stopPropagation();
              // Handle book menu pointer up
              handleBookPointerUp();
            },
            onContextMenu: handleContextMenu
          })}
          scale={scale}
          rotation={rotationRef.current}
          onPointerEnter={() => {
            if (shouldEnableDrag) {
              document.body.style.cursor = 'move'; // Show move cursor when drag mode is active
            } else {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerLeave={() => document.body.style.cursor = 'auto'}
        >
          <boxGeometry args={[1, 1, 1]} />
          {materials.map((material, i) => (
            <primitive
              key={`${bookID}-material-${i}`}
              object={material}
              attach={`material-${i}`}
            />
          ))}
        </mesh>

        {/* FloatingBlobsMenu - Shows on book long press */}
        {showBlobsMenu && (
          <Html
            center={true}
            distanceFactor={5}
            position={blobsMenuPosition}
            style={{
              transform: `translate3d(0px, 0px, 0)`,
              pointerEvents: 'auto',
              zIndex: 1000
            }}
          >
            <FloatingBlobsMenu 
              visible={showBlobsMenu}
              onClose={() => setShowBlobsMenu(false)}
              onAddToCollection={handleAddToCollection}
              onEditBook={handleEditBook}
              onEditRotation={handleEditRotation}
              onRemoveFromShelf={handleRemoveFromShelf}
              onDeleteBook={handleDeleteBook}
              bookId={bookID}
            />
          </Html>
        )}

        {/* New Floating Book Drag Menu */}
        <FloatingBookDragMenu
          visible={shouldEnableDrag && selectedBook === bookID}
          meshRef={meshRef}
          camera={camera}
          onViewChange={handleViewChange}
          onCustomRotate={handleCustomRotate}
          onRotateBy={handleRotateBy}
        />

        {/* Floating Transform Panel
        <FloatingTransformPanel
          {...transformPanelProps}
          camera={camera}
        />

        <FloatingDragRotationMenu
          visible={shouldEnableDrag && selectedBook === bookID}
          meshRef={meshRef}
          camera={camera}
          onRotationChange={handleEnhancedRotationChange}
          initialRotation={{
            x: rotationRef.current.x,
            y: rotationRef.current.y,
            z: rotationRef.current.z
          }}
        /> */}
      </Suspense>
    );
  }
);
export default Book;
