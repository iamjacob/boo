"use client";
import React, { useState, useRef, useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const BookContextMenu = ({
  visible,
  position,
  onClose,
  onAddToCollection,
  onEditBook,
  onEditRotation,
  bookId,
  isOnRightSide = false
}) => {
  const menuRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (visible) {
      // Add a small delay to prevent immediate closure when menu first appears
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('pointerdown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('pointerdown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      
      // Hide animation timing
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);

      return () => {
        clearTimeout(animationTimer);
      };
    }
  }, [visible]);

  const menuItems = [
    {
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="24" y2="13"/>
          <line x1="20" y1="12" x2="24" y2="16"/>
        </svg>
      ),
      label: "Add to Collection",
      action: onAddToCollection
    },
    {
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      ),
      label: "Edit Book",
      action: onEditBook
    },
    {
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M21 5c0 1.66-4 3-9 3S3 6.66 3 5"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      ),
      label: "Edit Rotation",
      action: onEditRotation
    }
  ];

  if (!visible) return null;

  return (
    <Html
      center={false}
      distanceFactor={10}
      position={position}
      style={{
        transform: `translate3d(${isOnRightSide ? '-150px' : '30px'}, -70px, 0)`,
        pointerEvents: 'auto',
        zIndex: 1000
      }}
    >
      <div
        ref={menuRef}
        className={`
          flex flex-col gap-0 p-1 min-w-[160px]
          bg-black/90 backdrop-blur-md border border-white/20 
          rounded-xl shadow-2xl
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
        `}
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu items */}
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`
              flex items-center gap-3 px-4 py-3 text-white text-sm font-medium
              hover:bg-white/15 transition-all duration-200
              cursor-pointer select-none
              ${index === 0 ? 'rounded-t-xl' : ''}
              ${index === menuItems.length - 1 ? 'rounded-b-xl' : ''}
              group
            `}
            onClick={(e) => {
              e.stopPropagation();
              item.action?.(bookId);
              onClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <span className="text-white/70 group-hover:text-white transition-colors duration-200">
              {item.icon}
            </span>
            <span className="whitespace-nowrap text-white/90 group-hover:text-white transition-colors duration-200">
              {item.label}
            </span>
          </button>
        ))}
        
        {/* Small indicator triangle */}
        <div 
          className={`
            absolute top-8 w-0 h-0
            ${isOnRightSide 
              ? 'right-[-6px] border-l-[6px] border-l-black/90 border-t-[6px] border-b-[6px] border-t-transparent border-b-transparent' 
              : 'left-[-6px] border-r-[6px] border-r-black/90 border-t-[6px] border-b-[6px] border-t-transparent border-b-transparent'
            }
          `}
        />
      </div>
    </Html>
  );
};

export default BookContextMenu;