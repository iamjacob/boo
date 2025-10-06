import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';

const FormedBook = ({ bookData, position = [0, 0, 0] }) => {
  const groupRef = useRef();
  
  // Create texture from cover image (with error handling)
  const coverTexture = useMemo(() => {
    if (!bookData?.cover) return null;
    try {
      return new THREE.TextureLoader().load(
        bookData.cover,
        undefined,
        undefined,
        () => console.warn('Failed to load book cover:', bookData.cover)
      );
    } catch (error) {
      console.warn('Error loading book cover:', error);
      return null;
    }
  }, [bookData?.cover]);
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  const bookDimensions = useMemo(() => ({
    width: bookData?.scale?.width || 0.4,
    height: bookData?.scale?.height || 0.75,
    thickness: bookData?.scale?.thickness || 0.2
  }), [bookData]);

  const bookColor = useMemo(() => {
    // Use book color or derive from cover
    if (bookData?.color) return bookData.color;
    return "#8B4513"; // Default brown book color
  }, [bookData]);

  return (
    <group ref={groupRef} position={position}>
      {/* Main book body */}
      <mesh>
        <boxGeometry args={[bookDimensions.width, bookDimensions.height, bookDimensions.thickness]} />
        <meshStandardMaterial 
          color={bookColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Front cover */}
      <mesh position={[0, 0, bookDimensions.thickness / 2 + 0.001]}>
        <planeGeometry args={[bookDimensions.width * 0.95, bookDimensions.height * 0.95]} />
        <meshStandardMaterial 
          map={coverTexture}
          color={coverTexture ? "white" : bookColor}
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>
      
      {/* Back cover (optional) */}
      <mesh position={[0, 0, -bookDimensions.thickness / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[bookDimensions.width * 0.95, bookDimensions.height * 0.95]} />
        <meshStandardMaterial 
          color={bookColor}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Spine */}
      <mesh position={[-bookDimensions.width / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[bookDimensions.thickness * 0.9, bookDimensions.height * 0.9]} />
        <meshStandardMaterial 
          color={bookColor}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Title on spine (if available) */}
      {bookData?.title && (
        <mesh position={[-bookDimensions.width / 2 - 0.002, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[bookDimensions.thickness * 0.8, 0.05]} />
          <meshStandardMaterial 
            color="white"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
};

export default FormedBook;