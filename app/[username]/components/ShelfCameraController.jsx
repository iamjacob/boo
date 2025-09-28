import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useShelfZoomStore } from '../../../stores/useShelfZoomStore';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useControls, button } from 'leva';

const ShelfCameraController = () => {
  const { camera, gl } = useThree();
  const { isZoomed, selectedShelf, getCurrentCameraSettings, isTransitioning, zoomToShelf, zoomOut, updateShelfZoomPosition } = useShelfZoomStore();
  const previousState = useRef({ isZoomed: false, selectedShelf: null });
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const orbitControlsRef = useRef(null);
  
  // Get current shelf positions from store
  const { shelfZoomPositions } = useShelfZoomStore();
  
  // Simplified Leva controls - just target Y and zoom distance
  const cameraControls = useControls('Simple Camera', {
    // Simple controls - what shelf to look at and zoom distance
    'Target Y (Which Shelf)': { value: 0, min: -2, max: 2, step: 0.05 },
    'Camera Z (Zoom)': { value: 2.5, min: 1, max: 8, step: 0.1 },
    
    // Copy current settings
    'Copy Settings': button(() => {
      const settings = `Target Y: ${cameraControls['Target Y (Which Shelf)']}, Z: ${cameraControls['Camera Z (Zoom)']}`;
      navigator.clipboard.writeText(settings);
      console.log('📋 Copied:', settings);
    }),
  });

  // Display current shelf positions
  const positionDisplay = useControls('Current Shelf Positions', {
    'Shelf 0 Target Y': { value: shelfZoomPositions[0]?.target[1] || 0, disabled: true },
    'Shelf 0 Camera Z': { value: shelfZoomPositions[0]?.position[2] || 0, disabled: true },
    'Shelf 1 Target Y': { value: shelfZoomPositions[1]?.target[1] || 0, disabled: true },
    'Shelf 1 Camera Z': { value: shelfZoomPositions[1]?.position[2] || 0, disabled: true },
    'Shelf 2 Target Y': { value: shelfZoomPositions[2]?.target[1] || 0, disabled: true },
    'Shelf 2 Camera Z': { value: shelfZoomPositions[2]?.position[2] || 0, disabled: true },
    'Shelf 3 Target Y': { value: shelfZoomPositions[3]?.target[1] || 0, disabled: true },
    'Shelf 3 Camera Z': { value: shelfZoomPositions[3]?.position[2] || 0, disabled: true },
    
    // Load shelf position into live controls
    'Load Shelf 0': button(() => {
      // This would need Leva's set function, but we can console.log for now
      console.log('📖 Shelf 0:', { 
        targetY: shelfZoomPositions[0]?.target[1], 
        cameraZ: shelfZoomPositions[0]?.position[2] 
      });
    }),
    'Load Shelf 1': button(() => {
      console.log('📖 Shelf 1:', { 
        targetY: shelfZoomPositions[1]?.target[1], 
        cameraZ: shelfZoomPositions[1]?.position[2] 
      });
    }),
    'Load Shelf 2': button(() => {
      console.log('📖 Shelf 2:', { 
        targetY: shelfZoomPositions[2]?.target[1], 
        cameraZ: shelfZoomPositions[2]?.position[2] 
      });
    }),
    'Load Shelf 3': button(() => {
      console.log('📖 Shelf 3:', { 
        targetY: shelfZoomPositions[3]?.target[1], 
        cameraZ: shelfZoomPositions[3]?.position[2] 
      });
    }),
    
    // Animation settings
    animationDuration: { value: 0.8, min: 0.1, max: 3.0, step: 0.1 },
    easing: { 
      value: 'power3.out', 
      options: ['power1.out', 'power2.out', 'power3.out', 'power4.out', 'back.out', 'elastic.out', 'bounce.out'] 
    },
    
    // Current shelf controls (only show when zoomed)
    ...(isZoomed && selectedShelf !== null ? {
      [`Shelf ${selectedShelf} Position`]: {
        value: getCurrentCameraSettings().position,
        step: 0.1
      },
      [`Shelf ${selectedShelf} Target`]: {
        value: getCurrentCameraSettings().target,
        step: 0.1
      },
      [`Shelf ${selectedShelf} FOV`]: {
        value: getCurrentCameraSettings().fov,
        min: 10,
        max: 120,
        step: 1
      },
      'Update This Shelf': button(() => {
        const settings = getCurrentCameraSettings();
        updateShelfZoomPosition(
          selectedShelf,
          cameraControls[`Shelf ${selectedShelf} Position`],
          cameraControls[`Shelf ${selectedShelf} Target`],
          cameraControls[`Shelf ${selectedShelf} FOV`]
        );
        console.log(`📝 Updated Shelf ${selectedShelf} settings:`, {
          position: cameraControls[`Shelf ${selectedShelf} Position`],
          target: cameraControls[`Shelf ${selectedShelf} Target`],
          fov: cameraControls[`Shelf ${selectedShelf} FOV`]
        });
      })
    } : {}),
    
    // Load shelf positions into live controls
    'Load Shelf 0': button(() => {
      const settings = useShelfZoomStore.getState().shelfZoomPositions[0];
      // Update Leva controls to match shelf 0 position
      // Note: This will trigger the live update effect
    }),
    'Load Shelf 1': button(() => {
      const settings = useShelfZoomStore.getState().shelfZoomPositions[1];
      // These would need to be implemented with Leva's set function
    }),
    'Load Shelf 2': button(() => {
      const settings = useShelfZoomStore.getState().shelfZoomPositions[2];
    }),
    'Load Shelf 3': button(() => {
      const settings = useShelfZoomStore.getState().shelfZoomPositions[3];
    }),
    
    // Save current simple settings to shelf
    'Save to Shelf 0': button(() => {
      const targetY = cameraControls['Target Y (Which Shelf)'];
      const z = cameraControls['Camera Z (Zoom)'];
      updateShelfZoomPosition(0, [0, 0, z], [0, targetY, 0], 60);
      console.log(`💾 Saved to Shelf 0: Target Y=${targetY}, Camera Z=${z}`);
    }),
    'Save to Shelf 1': button(() => {
      const targetY = cameraControls['Target Y (Which Shelf)'];
      const z = cameraControls['Camera Z (Zoom)'];
      updateShelfZoomPosition(1, [0, 0, z], [0, targetY, 0], 60);
      console.log(`💾 Saved to Shelf 1: Target Y=${targetY}, Camera Z=${z}`);
    }),
    'Save to Shelf 2': button(() => {
      const targetY = cameraControls['Target Y (Which Shelf)'];
      const z = cameraControls['Camera Z (Zoom)'];
      updateShelfZoomPosition(2, [0, 0, z], [0, targetY, 0], 60);
      console.log(`💾 Saved to Shelf 2: Target Y=${targetY}, Camera Z=${z}`);
    }),
    'Save to Shelf 3': button(() => {
      const targetY = cameraControls['Target Y (Which Shelf)'];
      const z = cameraControls['Camera Z (Zoom)'];
      updateShelfZoomPosition(3, [0, 0, z], [0, targetY, 0], 60);
      console.log(`💾 Saved to Shelf 3: Target Y=${targetY}, Camera Z=${z}`);
    }),
    
    // Quick navigation buttons (using smooth animations)
    'Go to Shelf 0': button(() => zoomToShelf(0)),
    'Go to Shelf 1': button(() => zoomToShelf(1)),
    'Go to Shelf 2': button(() => zoomToShelf(2)),
    'Go to Shelf 3': button(() => zoomToShelf(3)),
    'Zoom Out': button(() => zoomOut()),
    
    // Debug info
    currentShelf: { value: selectedShelf ?? 'None', disabled: true },
    isZoomedIn: { value: isZoomed, disabled: true },
    isTransitioning: { value: isTransitioning, disabled: true },
  });
  
  // Find OrbitControls reference
  useEffect(() => {
    const controls = gl.domElement.parentElement?.querySelector('[data-drei="orbit-controls"]');
    if (controls && controls.__three_obj) {
      orbitControlsRef.current = controls.__three_obj;
    }
  }, [gl]);

  // Simple live camera updates - fixed camera position, variable target
  useEffect(() => {
    if (!isTransitioning) {
      // Camera position: Fixed at center, only Z changes for zoom
      camera.position.set(
        0, // X always 0
        0, // Y always 0 (camera stays level)
        cameraControls['Camera Z (Zoom)']
      );
      
      // Target: look at different shelf Y positions
      const target = new THREE.Vector3(0, cameraControls['Target Y (Which Shelf)'], 0);
      camera.lookAt(target);
      
      // Update OrbitControls target
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.copy(target);
        orbitControlsRef.current.update();
      }
      
      console.log('📹 Simple camera update:', {
        targetY: cameraControls['Target Y (Which Shelf)'],
        cameraZ: cameraControls['Camera Z (Zoom)']
      });
    }
  }, [
    cameraControls['Target Y (Which Shelf)'],
    cameraControls['Camera Z (Zoom)'],
    camera,
    isTransitioning
  ]);

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
      
      // Temporarily disable OrbitControls during animation to prevent conflicts
      const orbitControls = orbitControlsRef.current;
      const wasEnabled = orbitControls?.enabled;
      if (orbitControls) {
        orbitControls.enabled = false;
        console.log('🔒 OrbitControls disabled for smooth animation');
      }
      
      // Animate camera position with customizable settings from Leva
      gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: cameraControls.animationDuration,
        ease: cameraControls.easing,
        onUpdate: () => {
          // Update camera lookAt during animation
          camera.lookAt(targetRef.current);
          // Update OrbitControls target if available
          if (orbitControls) {
            orbitControls.target.copy(targetRef.current);
          }
        },
        onComplete: () => {
          console.log('📹 Camera animation complete');
          camera.lookAt(targetRef.current);
          // Re-enable OrbitControls after animation
          if (orbitControls && wasEnabled) {
            orbitControls.target.copy(targetRef.current);
            orbitControls.update();
            orbitControls.enabled = true;
            console.log('🔓 OrbitControls re-enabled');
          }
        }
      });
      
      // Animate camera FOV if it's a PerspectiveCamera
      if (camera.isPerspectiveCamera) {
        gsap.to(camera, {
          fov: settings.fov,
          duration: cameraControls.animationDuration,
          ease: cameraControls.easing,
          onUpdate: () => {
            camera.updateProjectionMatrix();
          }
        });
      }
      
      // Update previous state
      previousState.current = { ...currentState };
    }
  }, [isZoomed, selectedShelf, camera, getCurrentCameraSettings, cameraControls.animationDuration, cameraControls.easing]);
  
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