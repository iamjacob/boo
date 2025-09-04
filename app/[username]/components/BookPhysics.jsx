import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import { Html, useCursor, PivotControls } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import gsap from "gsap";
import useBookExperienceStore from "../../../stores/experience/useBookExperienceStore";
import useShelvesStore from "../../../stores/shelves/useShelvesStore";
import { useBookDragHandler, isShelfOwner } from "./BookDragHandler";
import { authService } from "../../../lib/auth";
import { getBookCoverUrl, getBookImageByType } from "../../../lib/image-utils";

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
  const { selectedShelf } = useShelvesStore();
  const { isBookOpen, isTransitioning } = useBookExperienceStore();

  // Load book textures with fallback - same as regular Book component
  const [textures, setTextures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the best available cover images for different book faces (same as regular Book)
  const bookImages = useMemo(() => {
    console.log(`📸 BookPhysics ${bookID} processing images. Book data:`, book);
    
    if (book) {
      const images = {
        front: getBookImageByType(book, 'front', 'medium'),
        spine: getBookImageByType(book, 'spine', 'medium'),
        back: getBookImageByType(book, 'back', 'medium'),
      };
      console.log(`📸 BookPhysics ${bookID} images:`, images);
      return images;
    }
    // Fallback to the cover prop or default
    const fallbackCover = cover || "./books/covers/000.jpg";
    console.log(`📸 BookPhysics ${bookID} using fallback cover:`, fallbackCover);
    return {
      front: fallbackCover,
      spine: fallbackCover,
      back: fallbackCover,
    };
  }, [book, cover, bookID]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Use the same texture URLs as regular Book component
    const textureUrls = [
      bookImages.spine, // right
      bookImages.spine, // left
      "./books/booktexture.png", // top
      "./books/booktexture.png", // bottom
      bookImages.front, // front
      bookImages.back, // back
    ];

    const loadTextures = async () => {
      try {
        const loadedTextures = await Promise.all(
          textureUrls.map(url => 
            new Promise((resolve) => {
              loader.load(
                url,
                resolve,
                undefined,
                () => {
                  // Fallback to a basic texture
                  const canvas = document.createElement('canvas');
                  canvas.width = canvas.height = 256;
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = color || '#8B4513';
                  ctx.fillRect(0, 0, 256, 256);
                  const texture = new THREE.CanvasTexture(canvas);
                  resolve(texture);
                }
              );
            })
          )
        );
        setTextures(loadedTextures);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading textures:', error);
        setIsLoading(false);
      }
    };

    loadTextures();
  }, [bookImages, color]);

  // Configure textures
  const configureredTextures = useMemo(() => {
    if (!textures || !Array.isArray(textures)) return [];
    
    return textures.map((texture) => {
      if (texture) {
        texture.flipY = false;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
      }
      return texture;
    });
  }, [textures]);

  // Update cursor on hover
  useCursor(isHovered && !isDragging && !isTransitioning);

  // Handle book selection
  const handleBookClick = (e) => {
    e.stopPropagation();
    if (isTransitioning) return;
    
    if (selectedBook === bookID) {
      // Double-click behavior: open book
      onBookOpen(bookID);
    } else {
      // Single-click behavior: select book
      setSelectedBook(bookID);
    }
  };

  // Create book geometry
  const bookGeometry = useMemo(() => {
    const [width, height, depth] = scale;
    return new THREE.BoxGeometry(width, height, depth);
  }, [scale]);

  // Create book materials - same order as regular Book component
  const bookMaterials = useMemo(() => {
    if (!configureredTextures || configureredTextures.length === 0) {
      // Fallback materials if textures fail to load
      return [
        new THREE.MeshStandardMaterial({ color: color }), // right (spine)
        new THREE.MeshStandardMaterial({ color: color }), // left (spine)
        new THREE.MeshStandardMaterial({ color: "#f5f5f5" }), // top (pages)
        new THREE.MeshStandardMaterial({ color: "#f5f5f5" }), // bottom (pages)
        new THREE.MeshStandardMaterial({ color: color }), // front
        new THREE.MeshStandardMaterial({ color: color }), // back
      ];
    }
    
    const [spineRightTex, spineLeftTex, topTex, bottomTex, frontTex, backTex] = configureredTextures;
    
    return [
      new THREE.MeshStandardMaterial({ map: spineRightTex || null }), // right (spine)
      new THREE.MeshStandardMaterial({ map: spineLeftTex || null }), // left (spine)
      new THREE.MeshStandardMaterial({ map: topTex || null }), // top (pages)
      new THREE.MeshStandardMaterial({ map: bottomTex || null }), // bottom (pages)
      new THREE.MeshStandardMaterial({ map: frontTex || null }), // front
      new THREE.MeshStandardMaterial({ map: backTex || null }), // back
    ];
  }, [configureredTextures, color]);

  // Debug: Log textures being loaded (same as regular Book)
  useEffect(() => {
    console.log(`📸 BookPhysics ${bookID} textures:`, {
      spine: bookImages.spine,
      front: bookImages.front,
      back: bookImages.back,
      texturesLoaded: textures.length
    });
  }, [bookImages, textures, bookID]);

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

  // Show loading only if textures are still loading
  if (isLoading) {
    return (
      <RigidBody
        type="dynamic"
        position={initialPosition}
        rotation={initialRotation}
        colliders={false}
        mass={1}
        name={`book-${bookID}`}
      >
        <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
        <mesh geometry={bookGeometry}>
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
    );
  }

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
          geometry={bookGeometry}
          material={bookMaterials}
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
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};

export default BookPhysics;
