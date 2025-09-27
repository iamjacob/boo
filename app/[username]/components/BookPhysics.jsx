import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import gsap from "gsap";
import useSafeLoader from "./useSafeLoader";

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

const BookPhysics = ({
  id = "",
  color = "red",
  scale,
  initialPosition = [-2.79, -0.61, -5.87],
  initialRotation = [0, 0, 0],
  bookID,
  selectedBook,
  previouslySelectedBook,
  setSelectedBook,
  onBookOpen,
  cover,
  book,
  ...props
}) => {
  const bookRef = useRef();
  const rigidBodyRef = useRef();
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPivotControls, setShowPivotControls] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentShelf, setCurrentShelf] = useState(null);
  
  const { camera, gl } = useThree();
  
  // Use same texture loading approach as regular Book component
  const textures = [
    useSafeLoader("./books/booktextureRotated.png"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
    useSafeLoader("./books/booktexture.png"),
    useSafeLoader("./books/booktexture.png"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
    useSafeLoader(cover || "./books/covers/000.jpg"),
  ];

  // Update cursor on hover
  useCursor(isHovered && !isDragging);

  // Handle book selection
  const handleBookClick = (e) => {
    e.stopPropagation();
    
    if (selectedBook === bookID) {
      // Double-click behavior: open book
      if (onBookOpen) onBookOpen(bookID);
    } else {
      // Single-click behavior: select book
      setSelectedBook(bookID);
    }
  };

  // Create book geometry (unit size, scale applied to mesh)
  const bookGeometry = useMemo(() => {
    return new THREE.BoxGeometry(1, 1, 1);
  }, []);

  // Create book materials - same approach as regular Book component
  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );

  // Handle selection state
  useEffect(() => {
    setIsSelected(selectedBook === bookID);
  }, [selectedBook, bookID]);

  // Animation effects for selection
  useEffect(() => {
    if (!rigidBodyRef.current) return;
    
    const currentPosition = rigidBodyRef.current.translation();
    const targetY = isSelected ? currentPosition.y + 0.3 : initialPosition[1];
    
    gsap.to(rigidBodyRef.current.translation(), {
      y: targetY,
      duration: 0.3,
      ease: "power2.out",
      onUpdate: () => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation(rigidBodyRef.current.translation(), true);
        }
      }
    });
  }, [isSelected, initialPosition]);



  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={initialPosition}
      rotation={initialRotation}
      colliders={false}
      mass={1}
      name={`book-${bookID}`}
      enabledRotations={[false, true, false]} // Only allow Y-axis rotation
      enabledTranslations={[true, true, true]}
      linearDamping={0.5} // Add some damping to prevent excessive bouncing
      angularDamping={0.3} // Add angular damping for more realistic rotation
    >
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      
      <group ref={groupRef}>
        <mesh
          ref={bookRef}
          scale={scale}
          onClick={handleBookClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          castShadow
          receiveShadow
          {...props}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} />
          {materials.map((material, i) => (
            <primitive key={`${bookID}-material-${i}`} object={material} attach={`material-${i}`} />
          ))}
        </mesh>
        
        {/* Selection indicator
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.2} />
          </mesh>
        )} */}
      </group>
    </RigidBody>
  );
};

export default BookPhysics;
