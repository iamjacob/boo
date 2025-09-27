import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useShelfZoomStore } from '../../../stores/useShelfZoomStore';
import * as THREE from 'three';
import { gsap } from 'gsap';

const ShelfCameraController = () => {
  const { camera } = useThree();
  const { isZoomed, selectedShelf, getCurrentCameraSettings, isTransitioning, zoomToShelf, zoomOut } = useShelfZoomStore();
  const previousState = useRef({ isZoomed: false, selectedShelf: null });
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  
  useEffect(() => {
    // Check if zoom state changed
    const currentState = { isZoomed, selectedShelf };
    const prevState = previousState.current;
    
    if (currentState.isZoomed !== prevState.isZoomed || 
        currentState.selectedShelf !== prevState.selectedShelf) {
      
      console.log('📹 Camera transition triggered:', currentState);
      
      const settings = getCurrentCameraSettings();
      const targetPosition = new THREE.Vector3(...settings.position);
      const targetLookAt = new THREE.Vector3(...settings.target);
      
      // Store the target for useFrame
      targetRef.current.copy(targetLookAt);
      
      // Animate camera position
      gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          // Update camera lookAt during animation
          camera.lookAt(targetRef.current);
        },
        onComplete: () => {
          console.log('📹 Camera animation complete');
          camera.lookAt(targetRef.current);
        }
      });
      
      // Animate camera FOV if it's a PerspectiveCamera
      if (camera.isPerspectiveCamera) {
        gsap.to(camera, {
          fov: settings.fov,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.updateProjectionMatrix();
          }
        });
      }
      
      // Update previous state
      previousState.current = { ...currentState };
    }
  }, [isZoomed, selectedShelf, camera, getCurrentCameraSettings]);
  
  // Keyboard controls for shelf navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle keys when not in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      switch (event.key) {
        case '1':
          event.preventDefault();
          zoomToShelf(0);
          break;
        case '2':
          event.preventDefault();
          zoomToShelf(1);
          break;
        case '3':
          event.preventDefault();
          zoomToShelf(2);
          break;
        case '4':
          event.preventDefault();
          zoomToShelf(3);
          break;
        case 'Escape':
          event.preventDefault();
          if (isZoomed) zoomOut();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isZoomed && selectedShelf < 3) {
            zoomToShelf(selectedShelf + 1);
          } else if (!isZoomed) {
            zoomToShelf(3); // Top shelf
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (isZoomed && selectedShelf > 0) {
            zoomToShelf(selectedShelf - 1);
          } else if (!isZoomed) {
            zoomToShelf(0); // Bottom shelf
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isZoomed, selectedShelf, zoomToShelf, zoomOut]);
  
  // Ensure camera looks at target during frame updates
  useFrame(() => {
    if (isTransitioning) {
      camera.lookAt(targetRef.current);
    }
  });
  
  return null; // This component doesn't render anything
};

export default ShelfCameraController;