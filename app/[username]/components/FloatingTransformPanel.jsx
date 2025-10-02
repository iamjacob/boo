"use client";
import React, { useState, useRef, useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const FloatingTransformPanel = ({
  visible,
  bookPosition,
  meshRef,
  onClose,
  onSwapBook,
  onHoldBook,
  onMoveToPosition,
  bookId,
  bookTitle = "Unknown Book",
  camera // Add camera prop for proper positioning
}) => {
  const [liveRotation, setLiveRotation] = useState({ x: 0, y: 0, z: 0 });
  const [livePosition, setLivePosition] = useState({ x: 0, y: 0, z: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isAbove, setIsAbove] = useState(true);
  const panelRef = useRef();

  // Calculate panel position based on book position and screen bounds
  useEffect(() => {
    if (!visible || !bookPosition) return;

    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Project book position to screen coordinates if camera is available
    let screenY = 0.5; // Default to middle
    
    if (camera) {
      const tempVector = new THREE.Vector3(...bookPosition);
      tempVector.project(camera);
      
      // Convert from NDC (-1 to 1) to screen coordinates (0 to 1)
      screenY = (1 - tempVector.y) / 2;
    } else {
      // Fallback: use world Y position as approximation
      screenY = bookPosition[1] > 0 ? 0.3 : 0.7;
    }
    
    // Determine if panel should be above or below based on screen position
    const shouldBeAbove = screenY < 0.5; // If book is in upper half, put panel below
    setIsAbove(!shouldBeAbove);
    
    // Calculate panel position with more spacing
    const offsetY = shouldBeAbove ? 2.5 : -2.5; // Increased spacing
    const offsetX = 0; // Could add horizontal offset based on screen edges
    
    setPanelPosition([
      bookPosition[0] + offsetX,
      bookPosition[1] + offsetY,
      bookPosition[2]
    ]);
  }, [visible, bookPosition, camera]);

  // Initialize with current mesh values
  useEffect(() => {
    if (visible && meshRef && meshRef.current) {
      setLiveRotation({
        x: meshRef.current.rotation.x,
        y: meshRef.current.rotation.y,
        z: meshRef.current.rotation.z
      });
      setLivePosition({
        x: meshRef.current.position.x,
        y: meshRef.current.position.y,
        z: meshRef.current.position.z
      });
    }
  }, [visible, meshRef]);

  const handleRotationChange = (axis, value) => {
    const newRotation = { ...liveRotation, [axis]: parseFloat(value) };
    setLiveRotation(newRotation);
    
    if (meshRef && meshRef.current) {
      // Use set method instead of direct assignment
      const mesh = meshRef.current;
      if (axis === 'x') {
        mesh.rotation.set(parseFloat(value), mesh.rotation.y, mesh.rotation.z);
      } else if (axis === 'y') {
        mesh.rotation.set(mesh.rotation.x, parseFloat(value), mesh.rotation.z);
      } else if (axis === 'z') {
        mesh.rotation.set(mesh.rotation.x, mesh.rotation.y, parseFloat(value));
      }
    }
  };

  const handlePositionChange = (axis, value) => {
    const newPosition = { ...livePosition, [axis]: parseFloat(value) };
    setLivePosition(newPosition);
    
    if (meshRef && meshRef.current) {
      // Use set method instead of direct assignment
      const mesh = meshRef.current;
      if (axis === 'x') {
        mesh.position.set(parseFloat(value), mesh.position.y, mesh.position.z);
      } else if (axis === 'y') {
        mesh.position.set(mesh.position.x, parseFloat(value), mesh.position.z);
      } else if (axis === 'z') {
        mesh.position.set(mesh.position.x, mesh.position.y, parseFloat(value));
      }
    }
  };

  const resetTransforms = () => {
    const resetRot = { x: 0, y: 0, z: 0 };
    const resetPos = { x: 0, y: 0, z: 0 };
    
    setLiveRotation(resetRot);
    setLivePosition(resetPos);
    
    if (meshRef && meshRef.current) {
      // Use set methods instead of direct assignment
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.position.set(0, 0, 0);
    }
  };

  if (!visible) return null;

  return (
    <Html
      center={false}
      distanceFactor={8}
      position={panelPosition}
      style={{
        pointerEvents: 'auto',
        zIndex: 1000
      }}
    >
      {/* Custom styles for the panel */}
      <style jsx>{`
        .transform-panel {
          transform: ${isAbove ? 'translateY(-100%)' : 'translateY(0)'};
        }
        
        .position-slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .position-slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .position-slider:focus {
          outline: none;
        }
      `}</style>

      <div
        ref={panelRef}
        className={`
          transform-panel
          bg-black/95 backdrop-blur-lg border border-white/30 
          rounded-2xl shadow-2xl p-6 w-[380px]
        `}
        style={{
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Transform Book</h3>
            <p className="text-white/60 text-sm">{bookTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Rotation Controls */}
        <div className="space-y-4 mb-6">
          <h4 className="text-white/90 font-medium text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M21 5c0 1.66-4 3-9 3S3 6.66 3 5"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            Rotation Control
          </h4>
          
          {/* Rotation Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/70 mb-1">X-Rotation: {(liveRotation.x * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={liveRotation.x}
                onChange={(e) => handleRotationChange('x', e.target.value)}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((liveRotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((liveRotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">Y-Rotation: {(liveRotation.y * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={liveRotation.y}
                onChange={(e) => handleRotationChange('y', e.target.value)}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((liveRotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((liveRotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">Z-Rotation: {(liveRotation.z * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={liveRotation.z}
                onChange={(e) => handleRotationChange('z', e.target.value)}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((liveRotation.z + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((liveRotation.z + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Position Controls */}
        <div className="space-y-4 mb-6">
          <h4 className="text-white/90 font-medium text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 12l10 10 10-10-10-10z"/>
              <path d="M12 6v12"/>
              <path d="M6 12h12"/>
            </svg>
            Position
          </h4>
          
          {/* X Position */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>X</span>
              <span>{livePosition.x.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.01}
              value={livePosition.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((livePosition.x + 10) / 20) * 100}%, rgba(255,255,255,0.2) ${((livePosition.x + 10) / 20) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Y Position */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Y</span>
              <span>{livePosition.y.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.01}
              value={livePosition.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((livePosition.y + 5) / 10) * 100}%, rgba(255,255,255,0.2) ${((livePosition.y + 5) / 10) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Z Position */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Z</span>
              <span>{livePosition.z.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.01}
              value={livePosition.z}
              onChange={(e) => handlePositionChange('z', e.target.value)}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer position-slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((livePosition.z + 10) / 20) * 100}%, rgba(255,255,255,0.2) ${((livePosition.z + 10) / 20) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
        </div>

        {/* Move Actions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-white/90 font-medium text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="5,9 2,12 5,15"/>
              <polyline points="9,5 12,2 15,5"/>
              <polyline points="15,19 12,22 9,19"/>
              <polyline points="19,9 22,12 19,15"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="12" y1="2" x2="12" y2="22"/>
            </svg>
            Move Book
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSwapBook?.(bookId)}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5"/>
                <path d="M8 21H3v-5"/>
                <path d="M21 8l-5-5H3v5l5 5"/>
                <path d="M3 16l5 5h13v-5l-5-5"/>
              </svg>
              Swap
            </button>
            
            <button
              onClick={() => onHoldBook?.(bookId)}
              className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              Hold
            </button>
          </div>

          <button
            onClick={() => onMoveToPosition?.(bookId, livePosition)}
            className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 text-xs rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Move to Position
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetTransforms}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Html>
  );
};

export default FloatingTransformPanel;