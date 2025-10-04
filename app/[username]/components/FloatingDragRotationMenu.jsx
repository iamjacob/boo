import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * FloatingDragRotationMenu - A small menu that follows the book during drag
 * and provides real-time X, Y, Z rotation controls
 */
const FloatingDragRotationMenu = ({ 
  visible, 
  meshRef, 
  camera,
  onRotationChange,
  initialRotation = { x: 0, y: 0, z: 0 }
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [position, setPosition] = useState([0, 0, 0]);
  const animationRef = useRef();

  // Follow the book position during drag
  useEffect(() => {
    if (!visible || !meshRef?.current) return;

    const updatePosition = () => {
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);
      
      // Position the menu slightly above and to the right of the book
      setPosition([
        worldPosition.x + 1.5,
        worldPosition.y + 0.8,
        worldPosition.z
      ]);
      
      animationRef.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, meshRef]);

  // Update rotation when initialRotation changes
  useEffect(() => {
    setRotation(initialRotation);
  }, [initialRotation]);

  const handleRotationChange = (axis, value) => {
    const newRotation = { ...rotation, [axis]: value };
    setRotation(newRotation);
    
    if (onRotationChange) {
      onRotationChange(axis, value);
    }
  };

  const resetRotation = () => {
    const resetRot = { x: 0, y: 0, z: 0 };
    setRotation(resetRot);
    if (onRotationChange) {
      onRotationChange('x', 0);
      onRotationChange('y', 0);
      onRotationChange('z', 0);
    }
  };

  if (!visible) return null;

  // Inline styles for sliders to avoid styled-jsx issues
  const sliderStyles = {
    base: {
      width: '100%',
      height: '6px',
      borderRadius: '3px',
      appearance: 'none',
      cursor: 'pointer',
      outline: 'none'
    }
  };

  return (
    <Html
      center={false}
      distanceFactor={8}
      position={position}
      style={{
        pointerEvents: 'auto',
        zIndex: 1000,
        transform: 'translate3d(-50%, -50%, 0)'
      }}
    >
      <div
        className="flex flex-col gap-2 p-3 min-w-[200px] bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl transition-all duration-200 ease-out"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between text-white/90 text-xs font-medium border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Live Rotation</span>
          </div>
          <button
            onClick={resetRotation}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors cursor-pointer"
            title="Reset rotation"
          >
            Reset
          </button>
        </div>

        {/* X Rotation Control */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>X Axis</span>
            <span className="text-red-400">{(rotation.x * (180 / Math.PI)).toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.05}
            value={rotation.x}
            onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
            style={{
              ...sliderStyles.base,
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((rotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((rotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Y Rotation Control */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>Y Axis</span>
            <span className="text-green-400">{(rotation.y * (180 / Math.PI)).toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.05}
            value={rotation.y}
            onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
            style={{
              ...sliderStyles.base,
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((rotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((rotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Z Rotation Control */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>Z Axis</span>
            <span className="text-blue-400">{(rotation.z * (180 / Math.PI)).toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.05}
            value={rotation.z}
            onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
            style={{
              ...sliderStyles.base,
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((rotation.z + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((rotation.z + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>
      </div>
    </Html>
  );
};

export default FloatingDragRotationMenu;