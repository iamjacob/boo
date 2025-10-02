"use client";
import React, { useState, useRef, useEffect } from 'react';

const CircularRotationControl = ({ 
  value = 0, 
  onChange, 
  color = "#ffffff",
  size = 80 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX, clientY) => {
    if (!containerRef.current || !onChange) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let newAngle = Math.atan2(deltaY, deltaX);
    
    // Normalize to 0-2π range
    if (newAngle < 0) newAngle += 2 * Math.PI;
    
    onChange(newAngle);
  };

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Convert angle from radians to degrees for display
  const angleDegrees = Math.round((angle * 180) / Math.PI);
  const normalizedAngle = (angleDegrees + 360) % 360;

  const radius = size * 0.3;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedAngle / 360) * circumference;
  
  const handleX = size/2 + Math.sin((normalizedAngle * Math.PI) / 180) * radius;
  const handleY = size/2 - Math.cos((normalizedAngle * Math.PI) / 180) * radius;

  // Color mapping for different axes
  const axisColors = {
    x: "#ef4444", // Red
    y: "#3b82f6", // Blue  
    z: "#8b5cf6"  // Purple
  };

  const currentColor = axisColors[axis] || color;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Axis selector */}
      <div className="flex gap-2">
        {['x', 'y', 'z'].map((a) => (
          <button
            key={a}
            onClick={() => onAxisChange(a)}
            className={`w-10 h-10 border text-xs font-medium tracking-widest transition-all duration-300 rounded-full ${
              axis === a
                ? 'border-white bg-white bg-opacity-10 text-white'
                : 'border-white border-opacity-20 text-white text-opacity-40 hover:text-opacity-60'
            }`}
          >
            {a.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Circular slider */}
      <div 
        ref={containerRef}
        className="relative"
        style={{ touchAction: 'none' }}
        onTouchMove={handleTouchMove}
      >
        <svg width={size} height={size}>
          <defs>
            <linearGradient id={`progressGrad-${axis}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={currentColor} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          
          {/* Track circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            opacity="0.1"
          />
          
          {/* Progress circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={`url(#progressGrad-${axis})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            className="transition-all duration-75"
          />
          
          {/* Angle text */}
          <text
            x={size/2}
            y={size/2 + 8}
            textAnchor="middle"
            className="text-3xl font-extralight fill-white"
            style={{ userSelect: 'none', letterSpacing: '-0.02em' }}
          >
            {normalizedAngle}°
          </text>
          
          {/* Draggable handle */}
          <g
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="transition-transform duration-75"
          >
            <circle
              cx={handleX}
              cy={handleY}
              r="6"
              fill={currentColor}
              opacity="0.9"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onAngleChange(axis, 0)}
          className="px-4 py-1 border border-white border-opacity-20 text-white text-xs font-light tracking-wide hover:bg-white hover:bg-opacity-5 transition-all duration-300 rounded-full"
        >
          RESET
        </button>
        <button
          onClick={() => onAngleChange(axis, angle + (Math.PI / 4))} // +45 degrees
          className="px-4 py-1 border border-white border-opacity-20 text-white text-xs font-light tracking-wide hover:bg-white hover:bg-opacity-5 transition-all duration-300 rounded-full"
        >
          +45°
        </button>
      </div>

      {/* Rotation output */}
      <div className="text-white text-opacity-60 text-xs font-light tracking-wider">
        rotate{axis.toUpperCase()}({normalizedAngle}°)
      </div>
    </div>
  );
};

export default CircularRotationControl;