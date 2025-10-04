import { useState, useCallback } from 'react';
import * as THREE from "three";
import gsap from "gsap";

/**
 * Custom hook to handle transform panel and rotation controls for books
 * Manages transform panel state, rotation changes, and position updates
 */
export const useBookTransform = ({
  meshRef,
  rotationRef,
  initialPosition,
  initialRotation,
  bookID,
  title,
  onSave
}) => {
  // Transform panel state
  const [showTransformPanel, setShowTransformPanel] = useState(false);
  const [transformPanelPosition, setTransformPanelPosition] = useState([0, 0, 0]);

  /**
   * Show transform controls panel
   */
  const showTransformControls = useCallback(() => {
    if (!meshRef.current) return;

    // Get the book's world position
    const worldPosition = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPosition);

    setTransformPanelPosition([
      worldPosition.x,
      worldPosition.y,
      worldPosition.z,
    ]);
    setShowTransformPanel(true);
  }, [meshRef]);

  /**
   * Hide transform controls panel
   */
  const hideTransformControls = useCallback(() => {
    setShowTransformPanel(false);
  }, []);

  /**
   * Handle rotation changes with animation
   */
  const handleRotationChange = useCallback((axis, value) => {
    if (!meshRef.current) {
      console.error("meshRef is not defined!");
      return;
    }

    console.log(`🔄 Book Rotation Change [Axis: ${axis}]`);
    console.log(`  ⏳ Input Value: ${value}`);

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
        console.log(`✅ Animation Complete for [Axis: ${axis}]`);
        if (onSave) onSave();
      },
    });
  }, [meshRef, rotationRef, onSave]);

  /**
   * Reset position to initial values
   */
  const resetPosition = useCallback(() => {
    if (!meshRef.current || !initialPosition) return;

    console.log("Resetting position to:", initialPosition);
    gsap.to(meshRef.current.position, {
      x: initialPosition[0],
      y: initialPosition[1],
      z: initialPosition[2],
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        if (onSave) onSave();
      }
    });
  }, [meshRef, initialPosition, onSave]);

  /**
   * Reset rotation to initial values
   */
  const resetRotation = useCallback(() => {
    if (!meshRef.current || !initialRotation) return;

    console.log("Resetting rotation to:", initialRotation);
    
    // Update rotation reference
    rotationRef.current.x = initialRotation[0];
    rotationRef.current.y = initialRotation[1];
    rotationRef.current.z = initialRotation[2];

    gsap.to(meshRef.current.rotation, {
      x: initialRotation[0],
      y: initialRotation[1],
      z: initialRotation[2],
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        if (onSave) onSave();
      }
    });
  }, [meshRef, rotationRef, initialRotation, onSave]);

  /**
   * Move book to a specific position
   */
  const handleMoveToPosition = useCallback((bookId, newPosition) => {
    console.log("Move book to position:", bookId, newPosition);
    
    if (meshRef.current && newPosition) {
      gsap.to(meshRef.current.position, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        duration: 1,
        ease: "power3.out",
        onComplete: () => {
          if (onSave) onSave();
        }
      });
    }
  }, [meshRef, onSave]);

  /**
   * Swap book functionality placeholder
   */
  const handleSwapBook = useCallback((bookId) => {
    console.log("Swap book:", bookId);
    // TODO: Implement book swapping logic
    alert("Swap mode activated! Click another book to swap positions.");
  }, []);

  /**
   * Hold book functionality placeholder
   */
  const handleHoldBook = useCallback((bookId) => {
    console.log("Hold book:", bookId);
    // TODO: Implement book holding logic
    alert("Book held! You can now place it in a new position.");
  }, []);

  // Transform panel props for the component
  const transformPanelProps = {
    visible: showTransformPanel,
    bookPosition: transformPanelPosition,
    meshRef: meshRef,
    onClose: hideTransformControls,
    onSwapBook: handleSwapBook,
    onHoldBook: handleHoldBook,
    onMoveToPosition: handleMoveToPosition,
    bookId: bookID,
    bookTitle: title || `Book ${bookID}`
  };

  return {
    // State
    showTransformPanel,
    transformPanelPosition,
    
    // Actions
    showTransformControls,
    hideTransformControls,
    
    // Transform handlers
    handleRotationChange,
    resetPosition,
    resetRotation,
    handleMoveToPosition,
    handleSwapBook,
    handleHoldBook,
    
    // Props for transform panel component
    transformPanelProps
  };
};

export default useBookTransform;