/**
 * Book Component - 3D Interactive Book in Shelf Experience
 * 
 * Feature  // 🔒 OWNERSHIP: Enable drag only if user owns the shelf
  const isDragEnabled = isOwner;
  
  // Debug: Log ownership status with detailed shelf inspectionDrag & Drop: Only enabled if user owns the shelf (via BookDragHandler)
 * - ✅ Smooth Animations: Showcase/return animations with GSAP
 * - ✅ Ownership Check: Uses auth service and shelf data to determine editing permissions
 * - ✅ Visual Feedback: Cursor changes and hover states
 * - ✅ Double-click Actions: Open book or select book functionality
 * - ✅ Position Persistence: Saves position/rotation changes to database
 * 
 * Drag Logic: Extracted to BookDragHandler.js for clean separation
 * Authentication: Uses authService.getCurrentUser() and isShelfOwner() utility
 */

"use client";
import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import useSafeLoader from "./useSafeLoader";
import useBookExperienceStore from "../../../stores/experience/useBookExperienceStore";
import useShelvesStore from "../../../stores/shelves/useShelvesStore";
import { useBookDragHandler, isShelfOwner } from "./BookDragHandler";
import { authService } from "../../../lib/auth";
import { getBookCoverUrl, getBookImageByType } from "../../../lib/image-utils";
import { updateBookPosition } from "../../utils/shelf-utils";

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
  book, // ✅ Add book object to access full book data
  selectedBook = null, // ✅ Currently selected book ID
  previouslySelectedBook = null, // ✅ Previously selected book ID for smooth transitions
  setSelectedBook, // ✅ Function to update selection
  onBookOpen, // ✅ Function to handle book opening
  userData, // ✅ Add userData prop to access current user info
}) => {
  const { raycaster, camera, size } = useThree();
  const meshRef = useRef();
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  const rotationRef = useRef(new THREE.Euler(...initialRotation));
  
  // Zustand store for visibility coordination
  const { isBookOpen, isOpenBookVisible, openedBook, isBookAnimating } = useBookExperienceStore();

  // Get current shelf and user for ownership check
  const { selectedShelf } = useShelvesStore();

  // Consolidated ownership logic with fallback
  const currentUserId = userData?.user?.id || authService.getCurrentUser()?.id;
  const shelfOwnerId = selectedShelf?.userId || selectedShelf?.ownerId || null;
  const isOwner = Boolean(currentUserId && shelfOwnerId && currentUserId === shelfOwnerId);

  // Enable drag only if user owns the shelf
  const isDragEnabled = isOwner;

  // Check if the shelf is draggable
  const isDraggable = selectedShelf?.userId === userData?.user?.id;

  // Enhanced debug logging
  useEffect(() => {
    console.log(`📖 Book ${bookID} ownership status:`, {
      currentUserId,
      shelfOwnerId,
      isOwner,
      isDragEnabled,
      selectedShelf,
      shelfFields: selectedShelf ? Object.keys(selectedShelf) : 'no shelf',
    });
  }, [selectedShelf, currentUserId, isOwner, isDragEnabled, bookID]);

  // Enhanced debug logging for draggable status
  useEffect(() => {
    console.log(`📖 Book ${bookID} draggable status:`, {
      isDraggable,
      selectedShelf,
      userId: userData?.user?.id,
      shelfUserId: selectedShelf?.userId
    });
  }, [isDraggable, selectedShelf, userData?.user?.id, bookID]);

  // Store original position for smooth return animations
  const originalPosition = useRef(new THREE.Vector3(...initialPosition));
  const originalRotation = useRef(new THREE.Euler(...initialRotation));

  // Define showcase position (matches OpenBook position exactly)
  const showcasePosition = useRef(new THREE.Vector3(0, 0.4, 0));
  const showcaseRotation = useRef(new THREE.Euler(0, 0.4, 0));

  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const mouseVecRef = useRef(new THREE.Vector2()); // ✅ UseRef (No reallocation)
  const intersectionVecRef = useRef(new THREE.Vector3()); // ✅ UseRef (No reallocation)

  const pivotRef = useRef();
  const longPressTimer = useRef();

  const [showPivot, setShowPivot] = useState(false);

  // Shared plane for raycasting
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );

  const shelfLevels = useMemo(() => [-1, 0, 1, 2], []);

  // UI state management
  const currentPlace = useRef("home");
  const switchPlace = (place) => {
    currentPlace.current = place;
  };

  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Function to share book URL
  const shareableUrl = `${window.location.origin}/b/${bookID}`;

  const handleShareUrl = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 3000);
      setTimeout(() => switchPlace("home"), 3000);
    });
  };

  // Cursor management for drag interactions
  useCursor(
    hoveredRef.current || draggingRef.current,
    draggingRef.current ? "grabbing" : "grab"
  );

  /** 🏆 Select Book on Long Press */
  const handlePointerDown = () => {
    setSelectedBook(bookID); // ✅ Updates the selected book in `Bookshelf`
    longPressTimer.current = setTimeout(() => {
      switchPlace("positionAndRotate");
    }, 500); // ✅ Long press detection (500ms)
  };

  const handlePointerUp = () => {
    setTimeout(() => {
      switchPlace("home");
    }, 6000);
  };

  // Database save function for position updates
  const saveToDB = async () => {
    requestIdleCallback(async () => {
      if (!meshRef.current || !selectedShelf?.id) {
        console.warn("⚠️ Cannot save: missing mesh or shelf ID");
        return;
      }

      console.log("📍 Saving book position:", meshRef.current.position.toArray());
      console.log("🔄 Saving book rotation:", meshRef.current.rotation.toArray());

      try {
        // Save position and rotation to the database
        const result = await updateBookPosition(
          bookID,
          selectedShelf.id,
          meshRef.current.position.toArray(),
          meshRef.current.rotation.toArray()
        );
        
        if (result.success) {
          console.log(`✅ Book ${bookID} position/rotation saved to DB!`);
        } else {
          console.error(`❌ Failed to save book ${bookID}:`, result.error);
        }
      } catch (error) {
        console.error(`💥 Error saving book ${bookID}:`, error);
      }


      // TODO: Implement actual API call to save position/rotation to backend
    });
  };

  // Initialize drag handler (only if user owns the shelf)
  const dragBinding = useBookDragHandler({
    meshRef,
    positionRef,
    rotationRef,
    draggingRef,
    mouseVecRef,
    intersectionVecRef,
    plane,
    scale,
    shelfRadius,
    otherBooks,
    shelfLevels,
    handlePointerDown,
    handlePointerUp,
    saveToDB,
    isOwner: isDraggable, // Use isDraggable to enable/disable drag
  });

  // Debug: Log what dragBinding contains
  useEffect(() => {
    console.log(`🐛 Book ${bookID} dragBinding debug:`, {
      isOwner,
      isDragEnabled,
      dragBindingKeys: Object.keys(dragBinding),
      hasDragHandlers: !!dragBinding.onPointerDown,
      dragBindingObject: dragBinding
    });
  }, [dragBinding, isOwner, isDragEnabled, bookID]);

  // Add debug logging to verify isDraggable behavior
  useEffect(() => {
    console.log(`🛠️ Debugging isDraggable for Book ${bookID}:`, {
      isDraggable,
      selectedShelf,
      userId: userData?.user?.id,
      shelfUserId: selectedShelf?.userId
    });
  }, [isDraggable, selectedShelf, userData?.user?.id, bookID]);

  // Animation functions
  const animateToShowcase = () => {
    if (!meshRef.current) return;
    
    console.log(`📖 Animating book ${bookID} to showcase position`);
    console.log(`  From position:`, originalPosition.current);
    console.log(`  To position:`, showcasePosition.current);
    console.log(`  From rotation:`, originalRotation.current);
    console.log(`  To rotation: (0, 0.4, 0)`);
    
    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf(meshRef.current.position);
    gsap.killTweensOf(meshRef.current.rotation);
    gsap.killTweensOf(meshRef.current.scale);
    
    gsap.to(meshRef.current.position, {
      x: showcasePosition.current.x,
      y: showcasePosition.current.y,
      z: showcasePosition.current.z,
      duration: 1.2,
      ease: "power3.out",
    });
    
    // Smooth rotation to y: 0.4
    gsap.to(meshRef.current.rotation, {
      x: 0,
      y: Math.PI,
      z: 0.45,
      duration: 1.2,
      ease: "power3.out",
    });
    // Slightly scale up for emphasis
    gsap.to(meshRef.current.scale, {
      x: scale[0],
      y: scale[1],
      z: scale[2],
      duration: 1.2,
      ease: "power3.out",
    });
  };

  const animateToOriginal = () => {
    if (!meshRef.current) return;
    
    console.log(`📚 Returning book ${bookID} to original position`);
    console.log(`  From position: (0, 0.4, 0)`);
    console.log(`  To position:`, originalPosition.current);
    console.log(`  From rotation: (0, 0.4, 0)`);
    console.log(`  To rotation:`, originalRotation.current);
    
    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf(meshRef.current.position);
    gsap.killTweensOf(meshRef.current.rotation);
    gsap.killTweensOf(meshRef.current.scale);
    
    gsap.to(meshRef.current.position, {
      x: originalPosition.current.x,
      y: originalPosition.current.y,
      z: originalPosition.current.z,
      duration: 1.2,
      ease: "power3.out",
    });
    
    // Smooth rotation back to original shelf rotation
    gsap.to(meshRef.current.rotation, {
      x: originalRotation.current.x,
      y: originalRotation.current.y,
      z: originalRotation.current.z,
      duration: 1.2,
      ease: "power3.out",
    });
    
    // Return to original scale
    gsap.to(meshRef.current.scale, {
      x: scale[0],
      y: scale[1],
      z: scale[2],
      duration: 1.2,
      ease: "power3.out",
    });
  };

  // Handle all book animations and visibility in one place
  useEffect(() => {
    if (!meshRef.current) return;
    
    const isThisBookOpen = openedBook?.bookID === bookID;
    const isCurrentlySelected = selectedBook === bookID;
    const wasSelected = previouslySelectedBook === bookID;
    
    console.log(`📖 Book ${bookID} state:`, {
      isThisBookOpen,
      isCurrentlySelected,
      wasSelected,
      isOpenBookVisible,
      isBookAnimating
    });
    
    if (isThisBookOpen) {
      // This book is the one being opened/closed
      if (!isOpenBookVisible && isBookAnimating) {
        // Either opening (animate to showcase) or closing (animate back)
        if (selectedBook === bookID) {
          // Opening: animate to showcase
          console.log(`🎬 Book ${bookID} opening - animating to showcase`);
          meshRef.current.visible = true;
          animateToShowcase();
        } else {
          // Closing: animate back to shelf
          console.log(`🏠 Book ${bookID} closing - returning to shelf`);
          meshRef.current.visible = true;
          animateToOriginal();
        }
      } else if (isOpenBookVisible) {
        // OpenBook is visible - hide this book
        console.log(`👻 Book ${bookID} hiding for OpenBook`);
        meshRef.current.visible = false;
      }
    } else {
      // This book is not the opened one - handle regular selection
      meshRef.current.visible = true;
      
      if (isCurrentlySelected && !wasSelected) {
        console.log(`✨ Book ${bookID} selected - showcase`);
        animateToShowcase();
      } else if (!isCurrentlySelected && wasSelected) {
        console.log(`📚 Book ${bookID} deselected - return`);
        animateToOriginal();
      }
    }
  }, [selectedBook, previouslySelectedBook, openedBook, isOpenBookVisible, isBookAnimating, bookID]);

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

    // Update rotation reference
    if (axis === "x") rotationRef.current.x = value;
    if (axis === "y") rotationRef.current.y = value;
    if (axis === "z") rotationRef.current.z = value;

    // GSAP Animation
    gsap.to(meshRef.current.rotation, {
      [axis]: rotationRef.current[axis],
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        saveToDB(); // Call save function properly
      },
    });
  };

  // Texture loading and materials
  // Get the best available cover images for different book faces
  const bookImages = useMemo(() => {
    console.log(`📸 Book ${bookID} processing images. Book data:`, book);
    
    if (book) {
      const images = {
        front: getBookImageByType(book, 'front', 'medium'),
        spine: getBookImageByType(book, 'spine', 'medium'),
        back: getBookImageByType(book, 'back', 'medium'),
      };
      console.log(`📸 Book ${bookID} images:`, images);
      return images;
    }
    // Fallback to the cover prop or default
    const fallbackCover = cover || "./books/covers/000.jpg";
    console.log(`📸 Book ${bookID} using fallback cover:`, fallbackCover);
    return {
      front: fallbackCover,
      spine: fallbackCover,
      back: fallbackCover,
    };
  }, [book, cover, bookID]);
  
  // Book faces mapping:
  // 0: Spine (left side)
  // 1: Front cover (right side)
  // 2: Top
  // 3: Bottom
  // 4: Back cover (left side - inside)
  // 5: Right side
  const textures = [
    useSafeLoader("./books/booktexture.png"), // Top
    useSafeLoader(bookImages.spine), // Spine texture
    useSafeLoader(bookImages.front), // Front cover
    useSafeLoader("./books/booktexture.png"), // Right side
    useSafeLoader(bookImages.back), // Back cover
    useSafeLoader("./books/booktexture.png"), // Bottom
  ];

  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );
  
  // Debug: Log textures being loaded
  useEffect(() => {
    console.log(`📸 Book ${bookID} textures:`, {
      spine: bookImages.spine,
      front: bookImages.front,
      back: bookImages.back,
      texturesLoaded: textures.length
    });
  }, [bookImages, textures, bookID]);
  //saveToDB();
//console.log(meshRef.current.scale.set(1,1,1))
  return (
    <Suspense fallback={"loading"}>
      <mesh
        ref={meshRef}
        {...dragBinding} // 🔑 Apply drag binding (only if user owns shelf)
        onDoubleClick={(e) => {
          e.stopPropagation(); // Prevent drag interference
          console.log(`🖱️ Double-clicked book ${bookID} (drag enabled: ${isOwner})`);
          if (onBookOpen) {
            onBookOpen(bookID);
          } else {
            setSelectedBook(bookID);
          }
        }}
        scale={scale}
        position={positionRef.current}
        rotation={rotationRef.current}
        onPointerEnter={(e) => {
          if (!draggingRef.current) { // Only change cursor if not dragging
            hoveredRef.current = true;
          }
        }}
        onPointerLeave={(e) => {
          if (!draggingRef.current) { // Only change cursor if not dragging
            hoveredRef.current = false;
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* //I need architechture that loads alll books asap, put wireframe till image is loaded and then fade in? */}
        <meshBasicMaterial color={color} />
        {materials.map((material, i) => (
          <primitive key={i} object={material} attach={`material-${i}`} />
        ))}
      </mesh>
    </Suspense>
  );
};
export default Book;
