import React from 'react';
import { Html } from '@react-three/drei';

const FloatingBookDragMenu = ({ 
  visible, 
  meshRef, 
  camera, 
  onViewChange,
  onCustomRotate,
  onRotateBy
}) => {
  if (!visible || !meshRef.current) return null;

  const bookPosition = meshRef.current.position;

  return (
    <Html
      center={true}
      distanceFactor={8}
      position={[bookPosition.x, bookPosition.y + 1.5, bookPosition.z]}
      style={{
        pointerEvents: 'auto',
        zIndex: 1000
      }}
    >
      <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/20">
        {/* Front View */}
        <button
          onClick={() => onViewChange('front')}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors text-white text-xs"
          title="Front View"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <rect x="9" y="8" width="6" height="8" rx="1"/>
          </svg>
          <span>Front</span>
        </button>

        {/* Spine View */}
        <button
          onClick={() => onViewChange('spine')}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors text-white text-xs"
          title="Spine View"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="2" width="12" height="20" rx="2"/>
            <rect x="9" y="5" width="2" height="14"/>
          </svg>
          <span>Spine</span>
        </button>

        {/* Rotate Left 10° */}
        <button
          onClick={() => onRotateBy('y', -10)}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors text-white text-xs"
          title="Rotate Left 10°"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 2v6h6"/>
            <path d="m2.5 8 4.5-4.5c.036-.034 1.5-1.5 5.5-1.5 3.5 0 7 2 7 5.5s-3.5 5.5-7 5.5c-1.5 0-3-.5-4-1"/>
          </svg>
          <span>-10°</span>
        </button>

        {/* Rotate Right 10° */}
        <button
          onClick={() => onRotateBy('y', 10)}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors text-white text-xs"
          title="Rotate Right 10°"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6"/>
            <path d="m21.5 8-4.5-4.5c-.036-.034-1.5-1.5-5.5-1.5-3.5 0-7 2-7 5.5s3.5 5.5 7 5.5c1.5 0 3-.5 4-1"/>
          </svg>
          <span>+10°</span>
        </button>

        {/* Custom Rotate */}
        <button
          onClick={onCustomRotate}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors text-white text-xs"
          title="Custom Rotate"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2"/>
            <path d="m15.194 13.707 3.814 1.86-1.86 3.814"/>
            <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/>
          </svg>
          <span>Custom</span>
        </button>
      </div>
    </Html>
  );
};

export default FloatingBookDragMenu;