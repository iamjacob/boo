import React, { useRef } from 'react'
import { useMenuStore } from "../../stores/useMenuStore";
import { useBooksStore } from "../../stores/useBooksStore";
import { useCameraStore } from "../../stores/useCameraStore";

export const Menu = ({ resetCamera }) => {
  const { toggleProfile, profileOpen } = useMenuStore();
  const { books } = useBooksStore();
  const { setOrbitRules, setPosition, setZoom } = useCameraStore();
  const clickTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  // Create stack positions similar to the main page implementation
  const createStackPositions = () => {
    const stackCenter = { x: 0, y: -1.5, z: 0 }; // Center of the stack
    const maxOffset = 0.1; // Small offset for natural look
    let currentHeight = stackCenter.y;

    return books.map((book, index) => {
      // Get actual book thickness for proper stacking
      const bookThickness = book.scale?.thickness || 0.2;
      
      // Create slight random variations for natural stacking (only X/Z, no rotation)
      const randomOffsetX = (Math.random() - 0.5) * maxOffset;
      const randomOffsetZ = (Math.random() - 0.5) * maxOffset;
      
      // Calculate position for this book
      const position = {
        x: stackCenter.x + randomOffsetX,
        y: currentHeight + (bookThickness / 2), // Center the book at this height
        z: stackCenter.z + randomOffsetZ
      };
      
      // Add this book's thickness for the next book
      currentHeight += bookThickness;
      
      return {
        id: book.id,
        position,
        rotation: {
          x: Math.PI / 2, // 90 degrees - lay the book flat
          y: Math.PI, // 180 degrees - align all spines in same direction
          z: 0
        }
      };
    });
  };

  const stackBooks = () => {
    console.log('📚 Stacking books...');
    
    // Update camera rules for stack view
    setOrbitRules({
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: undefined,
      maxAzimuthAngle: undefined,
      enablePan: true,
      minDistance: 4,
      maxDistance: 20,
      enableDamping: true,
      dampingFactor: 0.05,
      enableZoom: true,
    });

    // Create stacked positions
    const stackPositions = createStackPositions();
    
    // Since we don't have direct access to bookRefs here, 
    // we'll need to trigger this through a global event or store
    // For now, let's dispatch a custom event that the main page can listen to
    window.dispatchEvent(new CustomEvent('stackBooks', { 
      detail: { stackPositions } 
    }));
  };

  const adjustCameraForProfile = () => {
    console.log('📷 Adjusting camera for profile view...');
    
    // Set camera position for better profile view
    setPosition([3, 2, 8]); // Move camera up and to the right for better angle
    setZoom(1.2); // Zoom out a bit for better overview
    
    // Update camera rules for profile view
    setOrbitRules({
      minPolarAngle: Math.PI / 6, // 30 degrees
      maxPolarAngle: Math.PI / 2.5, // 72 degrees
      minAzimuthAngle: -Math.PI / 3, // -60 degrees
      maxAzimuthAngle: Math.PI / 3, // 60 degrees
      enablePan: true,
      minDistance: 5,
      maxDistance: 15,
      enableDamping: true,
      dampingFactor: 0.08,
      enableZoom: true,
    });
  };

  const handleProfileImageClick = () => {
    clickCountRef.current += 1;
    
    if (clickCountRef.current === 1) {
      // First click - start timer
      clickTimeoutRef.current = setTimeout(() => {
        // Single click action - reset camera
        resetCamera();
        clickCountRef.current = 0;
      }, 300);
    } else if (clickCountRef.current === 2) {
      // Double click detected
      clearTimeout(clickTimeoutRef.current);
      clickCountRef.current = 0;
      
      if (profileOpen) {
        // If profile is open, just toggle it (close)
        toggleProfile();
      } else {
        // If profile is closed, stack books, adjust camera, and show profile
        stackBooks();
        adjustCameraForProfile();
        toggleProfile();
      }
    }
  };

  const showProfile = ()=>{
    // show profile menu
    // const if camera is not centered then show reset camera button
    
    // and if it is centered then make menu overlay come in

//Should be overlay menu from the top? :D


  }




  return (
      <div className="flex fixed top-1/2 right-4 flex-col gap-4 z-50">

        <div onClick={handleProfileImageClick} className="cursor-pointer hover:bg-gray-700 transition ">

          <img className='h-[25px] w-[25px] rounded-full border border-red-500 border-[2px]' src="./assets/images/profile_image.jpeg" alt="username" />
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-orbit-icon lucide-orbit"
          >
            <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
            <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
          </svg> */}
        </div>

        {/* <div
          onClick={() => {
            setDrag(!drag);
          }}
          className="move"
        >
          {drag ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-hand-icon lucide-hand"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-hand-grab-icon lucide-hand-grab"
            >
              <path d="M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
              <path d="M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" />
              <path d="M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" />
            </svg>
          )}
        </div> */}

       
      </div>
  )
}

export default Menu