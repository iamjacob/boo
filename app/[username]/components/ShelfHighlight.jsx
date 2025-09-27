import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useShelfZoomStore } from '../../../stores/useShelfZoomStore';
import * as THREE from 'three';

const ShelfHighlight = () => {
  const { isZoomed, selectedShelf } = useShelfZoomStore();
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current && isZoomed && selectedShelf !== null) {
      // Animate the highlight ring
      ringRef.current.rotation.z += 0.01;
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ringRef.current.scale.setScalar(scale);
    }
  });
  
  if (!isZoomed || selectedShelf === null) return null;
  
  // Position the highlight at the selected shelf
  const shelfY = selectedShelf - 1; // Shelf positions: -1, 0, 1, 2
  const position = [0, shelfY - 0.8, 0]; // Match shelf group position offset
  
  return (
    <group position={position}>
      <mesh 
        ref={ringRef}
        rotation={[Math.PI / 2, 0, 0]}
      >
        {/* Highlight ring geometry */}
        <ringGeometry args={[7.2, 7.5, 32]} />
        <meshBasicMaterial 
          color="#4fc3f7" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Subtle glow effect */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[6.8, 7.7, 32]} />
        <meshBasicMaterial 
          color="#4fc3f7" 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default ShelfHighlight;