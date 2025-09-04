import { useDrag } from "@use-gesture/react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Custom hook for handling book drag interactions
 * Only applies drag behavior when user owns the shelf
 * 
 * @param {Object} params - Configuration object
 * @param {React.RefObject} params.meshRef - Reference to the book mesh
 * @param {React.RefObject} params.positionRef - Reference to position vector
 * @param {React.RefObject} params.rotationRef - Reference to rotation euler
 * @param {React.RefObject} params.draggingRef - Reference to dragging state
 * @param {React.RefObject} params.mouseVecRef - Reference to mouse vector
 * @param {React.RefObject} params.intersectionVecRef - Reference to intersection vector
 * @param {THREE.Plane} params.plane - Intersection plane for raycasting
 * @param {Array} params.scale - Book scale [x, y, z]
 * @param {number} params.shelfRadius - Radius of the shelf circle
 * @param {Array} params.otherBooks - Array of other book positions for collision detection
 * @param {Array} params.shelfLevels - Available shelf Y positions
 * @param {Function} params.handlePointerDown - Callback for pointer down
 * @param {Function} params.handlePointerUp - Callback for pointer up
 * @param {Function} params.saveToDB - Callback to save position to database
 * @param {boolean} params.isOwner - Whether the current user owns this shelf
 * @returns {Object} Drag binding object or empty object if not owner
 */
export const useBookDragHandler = ({
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
  isOwner = false
}) => {
  const { raycaster, camera, size } = useThree();

  const constrainToCircle = (x, z, r) => {
    const angle = Math.atan2(z, x);
    return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle };
  };

  const checkCollision = (newPos) => {
    const minDistanceSq = 0.36; // Avoids sqrt calculation for performance
    return otherBooks.some(({ x, z }) => {
      const dx = newPos.x - x;
      const dz = newPos.z - z;
      return dx * dx + dz * dz < minDistanceSq;
    });
  };

  const dragBinding = useDrag(
    ({ event, active, movement: [, my] }) => {
      console.log(`🐛 Drag event triggered! Active: ${active}, Movement: ${my}`);
      event.stopPropagation();
      draggingRef.current = active;

      if (!meshRef.current) return;

      if (active) {
        handlePointerDown();
        mouseVecRef.current.set(
          (event.clientX / size.width) * 2 - 1,
          -(event.clientY / size.height) * 2 + 1
        );
        raycaster.setFromCamera(mouseVecRef.current, camera);

        // Only first index in array on raycaster/one object
        plane.constant = -positionRef.current.y;
        if (!raycaster.ray.intersectPlane(plane, intersectionVecRef.current))
          return;
      } else {
        handlePointerUp();
      }

      // ...existing drag logic...
      const { x, z, angle } = constrainToCircle(
        intersectionVecRef.current.x,
        intersectionVecRef.current.z,
        active ? 5.5 : shelfRadius
      );

      let newPos = new THREE.Vector3(x, intersectionVecRef.current.y, z);

      if (checkCollision(newPos)) newPos.copy(positionRef.current);

      const closestShelf = shelfLevels.reduce((prev, curr) =>
        Math.abs(curr - positionRef.current.y) <
        Math.abs(prev - positionRef.current.y)
          ? curr
          : prev
      );

      if (!active && Math.abs(my) > 50) {
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

      let correctedY = newPos.y - (scale[1] / 2 + 0.08);
      newPos.y = correctedY - my * 0.007;

      if (active) {
        meshRef.current.position.lerp(newPos, 0.2);
        meshRef.current.rotation.y = -angle + rotationRef.current.y;
      } else {
        gsap.to(meshRef.current.position, {
          x: newPos.x,
          y: correctedY,
          z: newPos.z,
          duration: 0.8,
          ease: "power4.out",
          overwrite: true,
          onComplete: () => {
            console.log('x', newPos.x, 'y', correctedY, 'z', newPos.z);
            saveToDB();
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
    },
    {
      threshold: 2,
      pointerEvents: true,
      filterTaps: true,
      rubberband: 0.15,
    }
  );

  // // TEST: Let's see what useDrag actually returns
  // console.log(`🔍 useDrag import:`, useDrag);
  // console.log(`🔍 useDrag result:`, dragBinding);
  // console.log(`🔍 useDrag result type:`, typeof dragBinding);
  // console.log(`🔍 useDrag result constructor:`, dragBinding?.constructor?.name);
  // console.log(`🔍 useDrag result keys:`, Object.keys(dragBinding || {}));
  // console.log(`🔍 useDrag result values:`, Object.values(dragBinding || {}));

  // // Only return drag binding if user is the owner of the shelf
  // console.log(`🐛 BookDragHandler: isOwner=${isOwner}`);
  // console.log(`🐛 BookDragHandler: dragBinding type:`, typeof dragBinding);
  // console.log(`🐛 BookDragHandler: dragBinding:`, dragBinding);
  
  // if (typeof dragBinding === 'function') {
  //   console.log(`🐛 dragBinding is a function, calling it...`);
  //   const result = isOwner ? dragBinding() : {};
  //   console.log(`🐛 dragBinding() result:`, result, 'keys:', Object.keys(result));
  //   return result;
  // } else {
  //   console.log(`🐛 dragBinding is an object with keys:`, Object.keys(dragBinding));
  //   const result = isOwner ? dragBinding : {};
  //   console.log(`🐛 BookDragHandler: returning result with keys:`, Object.keys(result));
  //   return result;
  // }
  
  // 🔧 FALLBACK: Manual bind pattern (old reliable way)
  // If useDrag doesn't work as expected, return manual event handlers
  if (isOwner && (!dragBinding || Object.keys(dragBinding).length === 0)) {
    console.log('🔧 Fallback to manual bind pattern');
    return {
      onPointerDown: (event) => {
        console.log('📋 Manual onPointerDown triggered');
        event.stopPropagation();
        handlePointerDown();
        // Start drag logic here
      },
      onPointerMove: () => {
        if (draggingRef.current) {
          console.log('📋 Manual onPointerMove triggered');
          // Drag logic here
        }
      },
      onPointerUp: (event) => {
        console.log('📋 Manual onPointerUp triggered');
        event.stopPropagation();
        handlePointerUp();
        draggingRef.current = false;
      }
    };
  }
};

/**
 * Simple utility to check if the current user owns a shelf
 * @param {Object} shelf - Shelf object with userId property
 * @param {string} currentUserId - Current user's ID
 * @returns {boolean} Whether the user owns the shelf
 */
export const isShelfOwner = (shelf, currentUserId) => {
  if (!shelf || !currentUserId) return false;
  return shelf.userId === currentUserId || shelf.ownerId === currentUserId;
};

export default useBookDragHandler;
