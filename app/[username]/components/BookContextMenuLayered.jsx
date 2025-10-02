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
  onRemoveFromShelf,
  onDeleteBook,
  bookId,
  bookTitle = "Unknown Book", // New prop for book title
  bookCover = "./books/covers/000.jpg", // New prop for book cover
  bookAuthor = "Unknown Author", // New prop for book author
  meshRef = null, // New prop: reference to the book mesh for live updates
  isOnRightSide = false,
  isOwnerShelf = true, // New prop: true if this is the user's own shelf
  isLoggedIn = true    // New prop: true if user is logged in
}) => {
  const menuRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // Track which submenu is open
  const [isMobile, setIsMobile] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ side: 'right', offsetY: 0 });
  
  // Live rotation controls state
  const [liveRotation, setLiveRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the menu or any of its submenus
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Check if we're clicking on a submenu element (for desktop mode)
        const submenuElements = document.querySelectorAll('[data-submenu]');
        let clickedInsideSubmenu = false;
        
        submenuElements.forEach(submenu => {
          if (submenu.contains(event.target)) {
            clickedInsideSubmenu = true;
          }
        });
        
        if (!clickedInsideSubmenu) {
          setOpenSubmenu(null); // Close any open submenu
          onClose();
        }
      }
    };

    if (visible) {
      // Add a longer delay to prevent immediate closure when menu first appears
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('pointerdown', handleClickOutside);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('pointerdown', handleClickOutside);
      };
    } else {
      // Reset submenu state when menu is hidden
      setOpenSubmenu(null);
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

  // Calculate smart submenu positioning
  const calculateSubmenuPosition = (menuItemIndex) => {
    if (!menuRef.current) return { side: 'right', offsetY: 0 };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Submenu dimensions (estimated based on content)
    const submenuWidth = 240; // Wider for rotation controls
    const submenuHeight = 300; // Taller for controls
    
    let side = 'right';
    let offsetY = 0;

    // Check horizontal space (more sophisticated)
    const rightSpaceAvailable = viewportWidth - menuRect.right;
    const leftSpaceAvailable = menuRect.left;
    
    if (isOnRightSide) {
      // If main menu is on right side of screen, prefer left submenu
      side = leftSpaceAvailable > submenuWidth + 20 ? 'left' : 'right';
    } else {
      // If main menu is on left side, prefer right submenu
      side = rightSpaceAvailable > submenuWidth + 20 ? 'right' : 'left';
    }
    
    // Double-check the chosen side has enough space
    if (side === 'right' && rightSpaceAvailable < submenuWidth + 20) {
      side = 'left';
    } else if (side === 'left' && leftSpaceAvailable < submenuWidth + 20) {
      side = 'right';
    }

    // Check vertical space and adjust if needed
    const menuItemY = menuRect.top + (menuItemIndex * 48); // Approximate item height
    const submenuBottom = menuItemY + submenuHeight;
    
    if (submenuBottom > viewportHeight - 20) {
      // Calculate how much to offset upward
      offsetY = viewportHeight - submenuBottom - 40;
    }
    
    // Also check if submenu would go above viewport
    if (menuItemY + offsetY < 20) {
      offsetY = 20 - menuItemY;
    }

    return { side, offsetY };
  };

  const getMenuItems = () => {
    if (isOwnerShelf) {
      // User's own shelf - full control options
      return [
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
          submenu: [
            {
              label: "Edit Metadata",
              action: (bookId) => onEditBook(bookId, "metadata")
            },
            {
              label: "Change Cover",
              action: (bookId) => onEditBook(bookId, "cover")
            },
            {
              label: "Add Notes",
              action: (bookId) => onEditBook(bookId, "notes")
            },
            {
              type: "divider"
            },
            {
              label: "Book Properties",
              action: (bookId) => onEditBook(bookId, "properties")
            }
          ]
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
          label: "Transform",
          submenu: [
            {
              label: "Edit Position",
              action: (bookId) => onEditRotation(bookId, "position")
            },
            {
              label: "Live Transform Control",
              action: (bookId) => onEditRotation(bookId, "live-transform")
            },
            {
              type: "divider"
            },
            {
              label: "Reset Position",
              action: (bookId) => onEditRotation(bookId, "reset-position")
            },
            {
              label: "Reset Rotation",
              action: (bookId) => onEditRotation(bookId, "reset-rotation")
            }
          ]
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="24" y2="13"/>
              <line x1="20" y1="12" x2="24" y2="16"/>
            </svg>
          ),
          label: "Organize",
          submenu: [
            {
              label: "Move to Collection",
              action: (bookId) => onAddToCollection(bookId, "move")
            },
            {
              label: "Copy to Collection",
              action: (bookId) => onAddToCollection(bookId, "copy")
            },
            {
              type: "divider"
            },
            {
              label: "Mark as Read",
              action: (bookId) => onEditBook(bookId, "mark-read")
            },
            {
              label: "Mark as Favorite",
              action: (bookId) => onEditBook(bookId, "mark-favorite")
            }
          ]
        },
        {
          type: "divider"
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
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          ),
          label: "Remove from Shelf",
          action: (bookId) => {
            onRemoveFromShelf?.(bookId);
            onClose();
          }
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
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6V20c0,1-1,2-2,2H7c-1,0-2-1-2-2V6M8,6V4c0-1,1-2,2-2h4c1,0,2,1,2,2V2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          ),
          label: "Delete Book",
          action: (bookId) => {
            if (confirm("Are you sure you want to permanently delete this book?")) {
              onDeleteBook?.(bookId);
              onClose();
            }
          },
          destructive: true
        }
      ];
    } else if (isLoggedIn) {
      // Logged in user viewing someone else's shelf
      return [
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
          label: "Add to My Library",
          submenu: [
            {
              label: "Reading List",
              action: (bookId) => onAddToCollection(bookId, "reading")
            },
            {
              label: "Want to Read",
              action: (bookId) => onAddToCollection(bookId, "wishlist")
            },
            {
              label: "Favorites",
              action: (bookId) => onAddToCollection(bookId, "favorites")
            },
            {
              type: "divider"
            },
            {
              label: "Create New Collection...",
              action: (bookId) => onAddToCollection(bookId, "new")
            }
          ]
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
          ),
          label: "Add to Wishlist",
          action: (bookId) => {
            onAddToCollection(bookId, "wishlist");
            onClose();
          }
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
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          ),
          label: "Share Book",
          action: (bookId) => {
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
            onClose();
          }
        }
      ];
    } else {
      // Guest user (not logged in)
      return [
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          ),
          label: "Sign in to Add",
          action: () => {
            // Redirect to login or open login modal
            window.location.href = "/login";
          }
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
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          ),
          label: "Share Book",
          action: (bookId) => {
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
            onClose();
          }
        },
        {
          type: "divider"
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          ),
          label: "Create Account",
          action: () => {
            // Redirect to signup or open signup modal
            window.location.href = "/signup";
          }
        }
      ];
    }
  };

  const menuItems = getMenuItems();

  const renderMenuItem = (item, index, isSubmenu = false) => {
    if (item.type === "divider") {
      return (
        <div 
          key={`divider-${index}`} 
          className="h-px bg-white/20 mx-2 my-1"
        />
      );
    }

    // Special rendering for rotation controls
    if (item.isRotationControl) {
      return (
        <div key={index} className="p-4 space-y-3">
          <div className="text-white/90 text-sm font-medium mb-3">
            Live Rotation Control
          </div>
          
          {/* X Rotation Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>X Rotation</span>
              <span>{(liveRotation.x * (180 / Math.PI)).toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={liveRotation.x}
              onChange={(e) => {
                const newX = parseFloat(e.target.value);
                setLiveRotation(prev => ({ ...prev, x: newX }));
                if (meshRef && meshRef.current) {
                  meshRef.current.rotation.x = newX;
                }
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((liveRotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((liveRotation.x + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Y Rotation Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Y Rotation</span>
              <span>{(liveRotation.y * (180 / Math.PI)).toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={liveRotation.y}
              onChange={(e) => {
                const newY = parseFloat(e.target.value);
                setLiveRotation(prev => ({ ...prev, y: newY }));
                if (meshRef && meshRef.current) {
                  meshRef.current.rotation.y = newY;
                }
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((liveRotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) ${((liveRotation.y + Math.PI) / (2 * Math.PI)) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setLiveRotation({ x: 0, y: 0, z: 0 });
                if (meshRef && meshRef.current) {
                  meshRef.current.rotation.set(0, 0, 0);
                }
              }}
              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setIsLiveMode(false);
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      );
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenu === index;

    return (
      <div
        key={index}
        className="relative"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 text-white text-sm font-medium
            hover:bg-white/15 transition-all duration-200
            cursor-pointer select-none
            ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${isSubmenuOpen ? 'bg-white/10' : ''}
            ${item.destructive ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : ''}
            group
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.disabled) {
              if (hasSubmenu) {
                // Calculate position and toggle submenu on click
                const pos = calculateSubmenuPosition(index);
                setSubmenuPosition(pos);
                setOpenSubmenu(isSubmenuOpen ? null : index);
              } else if (item.action) {
                // Execute action for items without submenu
                item.action(bookId);
                onClose();
              }
            }
          }}
          disabled={item.disabled}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <span className="text-white/70 group-hover:text-white transition-colors duration-200">
                {item.icon}
              </span>
            )}
            <span className="whitespace-nowrap text-white/90 group-hover:text-white transition-colors duration-200">
              {item.label}
            </span>
          </div>
          
          {hasSubmenu && (
            <span className={`text-white/50 group-hover:text-white/80 transition-all duration-200 ${isSubmenuOpen ? 'rotate-90' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </span>
          )}
        </button>

        {/* Submenu - Mobile: Replace main menu, Desktop: Side panel */}
        {hasSubmenu && isSubmenuOpen && (
          <>
            {isMobile ? (
              // Mobile: Full replacement submenu
              <div className="absolute inset-0 z-20" data-submenu>
                <div
                  className="
                    flex flex-col gap-0 p-1 w-full
                    bg-black/90 backdrop-blur-md border border-white/20 
                    rounded-xl shadow-2xl
                  "
                  style={{
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Back button */}
                  <button
                    className="
                      flex items-center gap-3 px-4 py-3 text-white text-sm font-medium
                      hover:bg-white/15 transition-all duration-200
                      cursor-pointer select-none border-b border-white/10 rounded-t-xl
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSubmenu(null);
                    }}
                  >
                    <span className="text-white/70">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"/>
                      </svg>
                    </span>
                    <span className="text-white/90">Back</span>
                  </button>
                  
                  {/* Submenu title */}
                  <div className="px-4 py-2 text-white/60 text-xs font-medium border-b border-white/10">
                    {item.label}
                  </div>
                  
                  {/* Submenu items */}
                  {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, true))}
                </div>
              </div>
            ) : (
              // Desktop: Side panel submenu
              <div 
                className={`
                  absolute z-10
                  transition-all duration-200 ease-out
                  ${isSubmenuOpen 
                    ? 'opacity-100 visible pointer-events-auto' 
                    : 'opacity-0 invisible pointer-events-none'
                  }
                  ${submenuPosition.side === 'left' ? 'right-full mr-1' : 'left-full ml-1'}
                `}
                style={{
                  top: `${submenuPosition.offsetY}px`
                }}
                data-submenu
              >
                <div
                  className="
                    flex flex-col gap-0 p-1 min-w-[240px] max-h-[70vh] overflow-y-auto
                    bg-black/90 backdrop-blur-md border border-white/20 
                    rounded-xl shadow-2xl
                  "
                  style={{
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!visible) return null;

  return (
    <>
      {/* Custom styles for range sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    
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
          flex flex-col gap-0 p-1 w-[280px] min-h-[200px]
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
        {/* Book Header with Thumbnail */}
        <div className="px-3 py-3 border-b border-white/10 bg-white/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            {/* Book Cover Thumbnail */}
            <div className="flex-shrink-0 w-12 h-16 bg-gray-800 rounded border border-white/20 overflow-hidden shadow-lg">
              <img
                src={bookCover}
                alt={bookTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "./books/covers/000.jpg"; // Fallback image
                }}
              />
            </div>
            
            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium truncate">
                  {bookTitle}
                </span>
              </div>
              
              <div className="text-white/60 text-xs truncate mb-1">
                by {bookAuthor}
              </div>
              
              <div className="text-white/40 text-xs">
                ID: {bookId}
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        {menuItems.map((item, index) => renderMenuItem(item, index))}
        
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
    </>
  );
};

export default BookContextMenu;