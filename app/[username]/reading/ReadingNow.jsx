import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import BooksStand from "./BooksStand";
import reading from "../Reading.json";

const ReadingNow = () => {
  const BOOK_STAND_COUNT = 8;
  const RADIUS = 1.2;
  const [toggleReading, setToggleReading] = useState(true);
  const [toggleCones, setToggleCones] = useState(true);
  const [activeBookstand, setActiveBookstand] = useState(0);
  
  const { camera } = useThree();

// ...existing code...
  useEffect(() => {
    // Create timeline
    const tl = gsap.timeline();
    
    // Store initial camera position
    const initialPosition = { ...camera.position };
    const orbitRadius = 5; // Increased orbit radius
    
    // First: Zoom out
    tl.to(camera.position, {
      x: initialPosition.x,
      y: initialPosition.y - 2, // Move up a bit
      z: initialPosition.z + 7, // Move back to zoom out
      duration: 1.5,
      ease: "power2.out"
    })
    // Then: 360° orbit animation + PI/2 more
    .fromTo({}, 
      { 
        rotation: -Math.PI/2 // Starting angle
      },
      {
        rotation: Math.PI * 2 + Math.PI / 2, // 360° + 90° more
        duration: 5,
        ease: "power2.inOut",
        onUpdate: function() {
          const angle = this.targets()[0].rotation;
          
          camera.position.x = Math.cos(angle) * orbitRadius;
          camera.position.z = Math.sin(angle) * orbitRadius;
          camera.lookAt(0, 0, 0); // Always look at center
        }
      }
    );
    
    // Cleanup function
    return () => {
      tl.kill();
    };
  }, [camera]);
// ...existing code...

  return (
    <>
      {/* {toggleReading && */}

      {toggleCones && (
        <group rotation={[0,-Math.PI/2,0]}>
          {reading.map((book, index) => {
            const angle = (index / BOOK_STAND_COUNT) * 2 * Math.PI;
            const x = Math.cos(angle) * RADIUS;
            const z = Math.sin(angle) * RADIUS;
            return (
              <BooksStand
                key={index}
                position={[x, 0, z]}
                rotation={[0, -angle + Math.PI / 2, 0]}
                active={index === activeBookstand}
                book={book}
                index={index}
              />
            );
          })}
        </group>
      )}
    </>
  );
};

export default ReadingNow;