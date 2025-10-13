import { useRef, useMemo, useCallback } from 'react';
import { useDrag } from "@use-gesture/react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Custom hook to handle all drag-related functionality for books
 * Includes collision detection, shelf positioning, and drag constraints
 */
export const useBookDrag = ({
  meshRef,
  positionRef,
  rotationRef,
  scale,
  shelfRadius = 6.5,
  otherBooks = [],
  drag = false,
  onSave,
  onPointerDown,
  onPointerUp,
  onDragStart
}) => {
  const { raycaster, camera, size } = useThree();
  
  // Refs for drag state
  const draggingRef = useRef(false);
  const mouseVecRef = useRef(new THREE.Vector2());
  const intersectionVecRef = useRef(new THREE.Vector3());

  // Memoized values
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );

  const shelfLevels = useMemo(() => [-1.8, -0.8, 0.2, 1.2], []); // Match actual shelf positions

  /**
   * Constrain position to circular shelf
   */
  const constrainToCircle = useCallback((x, z, r) => {
    const angle = Math.atan2(z, x);
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle };
  }, []);

  /**
   * Check for collisions with other books
   */
  const checkCollision = useCallback((newPos) => {
    const minDistanceSq = 0.36; // Avoids sqrt calculation for performance
    return otherBooks.some(({ x, z }) => {
      const dx = newPos.x - x;
      const dz = newPos.z - z;
      return dx * dx + dz * dz < minDistanceSq;
    });
  }, [otherBooks]);

  /**
   * Get the closest shelf level to a given Y position
   */
  const getClosestShelfLevel = useCallback((currentY) => {
    return shelfLevels.reduce((prev, curr) =>
      Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
    );
  }, [shelfLevels]);

  /**
   * Calculate corrected Y position for book to sit on top of shelf
   */
  const getCorrectedYPosition = useCallback((shelfLevel) => {
    return shelfLevel + scale[1] / 2 + 0.08; // Offset to sit ON TOP of shelf
  }, [scale]);

  /**
   * Main drag binding with all logic
   */
  const bind = useDrag(
    ({ event, active, movement: [, my], delta: [, dy] }) => {
      event.stopPropagation();
      
      if (!meshRef.current) return;

      if (active) {
        // Start drag
        if (onPointerDown) onPointerDown(event);
        
        // Call onDragStart callback to auto-select the book (only on first activation)
        if (onDragStart && !draggingRef.current) {
          onDragStart();
        }
        
        draggingRef.current = true;
        
        mouseVecRef.current.set(
          (event.clientX / size.width) * 2 - 1,
          -(event.clientY / size.height) * 2 + 1
        );
        raycaster.setFromCamera(mouseVecRef.current, camera);

        plane.constant = -positionRef.current.y;

        if (!raycaster.ray.intersectPlane(plane, intersectionVecRef.current))
          return;
      } else {
        // End drag
        if (onPointerUp) onPointerUp();
        draggingRef.current = false;
      }

      // Calculate new position constrained to circle
      const { x, z, angle } = constrainToCircle(
        intersectionVecRef.current.x,
        intersectionVecRef.current.z,
        !active ? 6.5 : shelfRadius
      );

      let newPos = new THREE.Vector3(x, intersectionVecRef.current.y, z);

      // Check for collisions and revert if necessary
      if (checkCollision(newPos)) {
        newPos.copy(positionRef.current);
      }

      // Determine target shelf level
      const closestShelf = getClosestShelfLevel(positionRef.current.y);
      let tiltAngle = Math.max(-0.2, Math.min(0.2, -my * 0.1));

      // Handle shelf switching based on vertical movement
      if (!active && Math.abs(my) > 8) {
        const index = shelfLevels.indexOf(closestShelf);
        if (my < 30 && index < shelfLevels.length - 1) {
          newPos.y = shelfLevels[index + 1];
        } else if (my > 0 && index > 0) {
          newPos.y = shelfLevels[index - 1];
        } else {
          newPos.y = closestShelf;
        }
      } else {
        newPos.y = closestShelf;
      }

      // Apply height correction to position books properly on shelves
      newPos.y = getCorrectedYPosition(newPos.y);

      if (active) {
        // During drag - immediate updates
        meshRef.current.position.set(newPos.x, newPos.y, newPos.z);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
          meshRef.current.rotation.x,
          tiltAngle,
          0.4
        );

        // Perfect drag when spine facing out
        meshRef.current.rotation.y = -angle + rotationRef.current.y;
      } else {
        // End of drag - smooth animation
        gsap.to(meshRef.current.position, {
          x: newPos.x,
          y: newPos.y,
          z: newPos.z,
          duration: 0.8,
          ease: "power4.out",
          overwrite: true,
          onComplete: () => {
            const { x, y, z } = meshRef.current.position;
      console.log('Book position on pointer leave:', x, y, z);
            if (onSave) onSave(); // Save both position and rotation changes
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

      // Update position reference
      positionRef.current.copy(newPos);
    },
    {
      threshold: 0.1,
      pointerEvents: true,
      filterTaps: true,
      rubberband: 0.15,
    }
  );

  return {
    bind, // Always return the bind function
    isDragging: draggingRef.current,
    constrainToCircle,
    checkCollision,
    getClosestShelfLevel,
    getCorrectedYPosition,
    shouldEnableDrag: drag // Return the drag state for conditional use
  };
};

export default useBookDrag;