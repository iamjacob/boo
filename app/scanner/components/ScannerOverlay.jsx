import React, { useRef, useEffect, useState } from "react";
import { DoubleSide } from "three";
import { gsap } from "gsap";
import { Html } from "@react-three/drei";

const ScannerOverlay = ({isBookOpen, isDJOpen, isDJ}) => {
  const leftPageRef = useRef();
  const rightPageRef = useRef();
  const spinePageRef = useRef();

  const DJleftPageRef = useRef();
  const DJrightPageRef = useRef();
  const DJspinePageRef = useRef();
  const DJleftPageFlipRef = useRef();
  const DJrightPageFlipRef = useRef();

  const pagesGroupRef = useRef();
  const pageRefs = useRef([]);

  const [pages, setPages] = useState(20);

  const [currentPage, setCurrentPage] = useState(0);

  const [hoveredPage, setHoveredPage] = useState(null);
  const [pagesToFlip, setPagesToFlip] = useState(1);
  const [bookOpen, setBookOpen] = useState(0);

  const [isOpen, setIsOpen] = useState(isBookOpen);

  /* Gets dynamic when possible */
  /* [0.5, 0.7, 0.07] */
  //     const width = dimensions[0];
  //   const thickness = dimensions[2];
  //   const height = dimensions[1];

  const width = 0.5;
  const thickness = 0.07;
  const height = 0.7;
  const openDegrees = 1;

const pageThickness = thickness / pages;

  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  // const groupRef = useRef();
  // const { isOpenBookVisible } = useBookExperienceStore();
  const glassMaterialProps = {
    color: "#ffffff",
    transparent: true,
    opacity: 0.25,
    roughness: 0,
    metalness: 0,
    reflectivity: 1,
    transmission: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    ior: 1.5,
    side: DoubleSide,
  };


  // Unified open/close logic for book and dustjacket
  const handleOpenClose = (openBook, openDJ) => {
    // Book open/close
    if (openBook) {
      gsap.to(rightPageRef.current.rotation, {
        y: -openDegrees,
        duration: 0.4,
      });
      gsap.to(leftPageRef.current.rotation, {
        y: openDegrees,
        duration: 0.4,
      });
      for (let i = 0; i < pages; i++) {
        const page = pageRefs.current[i];
        if (page) {
          gsap.to(page.rotation, {
            y: i >= currentPage ? openDegrees : -openDegrees,
            duration: 0.5 - 0.0001 * i,
          });
        }
      }
      setBookOpen(1);
      setIsOpen(true);
    } else {
      for (let i = 0; i < pages; i++) {
        const page = pageRefs.current[i];
        if (page) {
          gsap.to(page.rotation, {
            y: 0,
            duration: 0.4,
          });
        }
      }
      gsap.to(rightPageRef.current.rotation, {
        y: 0,
        duration: 0.5,
      });
      gsap.to(leftPageRef.current.rotation, {
        y: 0,
        duration: 0.5,
      });
      setBookOpen(0);
      setIsOpen(false);
    }

    // Dustjacket open/close
    if (isDJ) {
      if (openDJ) {
        gsap.to(DJrightPageRef.current.rotation, {
          y: -openDegrees,
          duration: 0.4,
        });
        gsap.to(DJleftPageRef.current.rotation, {
          y: openDegrees,
          duration: 0.4,
        });
        gsap.to(DJrightPageFlipRef.current.rotation, {
          y: -openDegrees+0.1,
          duration: 0.4,
        });
        gsap.to(DJleftPageFlipRef.current.rotation, {
          y: openDegrees-0.1,
          duration: 0.4,
        });
        for (let i = 0; i < pages; i++) {
          const page = pageRefs.current[i];
          if (page) {
            gsap.to(page.rotation, {
              y: i >= currentPage ? openDegrees : -openDegrees,
              duration: 0.5 - 0.001 * i,
            });
          }
        }
        setBookOpen(1);
      } else {
        gsap.to(DJrightPageRef.current.rotation, {
          y: 0,
          duration: 0.5,
        });
        gsap.to(DJleftPageRef.current.rotation, {
          y: 0,
          duration: 0.5,
        });
        gsap.to(DJrightPageFlipRef.current.rotation, {
          y: 0,
          duration: 0.4,
        });
        gsap.to(DJleftPageFlipRef.current.rotation, {
          y: 0,
          duration: 0.4,
        });
        setBookOpen(0);
      }
    }
  };


  const flippin = (foldTo) => {
    console.log(foldTo);
    // Rotate pages based on whether they are before or after the fold point
    for (let i = 0; i < pages; i++) {
      const page = pageRefs.current[i];
      if (page) {
        gsap.to(page.rotation, {
          y: i >= foldTo ? openDegrees : -openDegrees, // Flip left or right based on foldTo
          duration: 0.5 - 0.0001 * i, // Adjust duration for cascading effect
          ease: "power1.inOut",
        });
      }
    }

    // Set the current page for tracking, based on foldTo
    setCurrentPage(foldTo);
  };


// Unified effect for open/close
useEffect(() => {
  handleOpenClose(isBookOpen, isDJOpen);
}, [isBookOpen, isDJOpen]);



  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowRight") {
        flipForward();
      } else if (event.key === "ArrowLeft") {
        flipBackward();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentPage]);

  const flipForward = () => {
    if (currentPage >= pages - pagesToFlip) return;
    const targetPage = Math.min(currentPage + pagesToFlip, pages - 1);
    open();
    flippin(targetPage);
  };

  const flipBackward = () => {
    if (currentPage <= 0) return;
    const targetPage = Math.max(currentPage - pagesToFlip, 0);
    open();
    flippin(targetPage);
  };

  return (
    <>
 
{/* Dust jacket */}
      {/* Front cover */}
      {isDJ && (
      <group position={[-.1, 0, 0]}>
      <group
        ref={DJrightPageRef}
        position={[-width * 0.5, 0, thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* Front cover flip */}
      <group
        ref={DJrightPageFlipRef}
        position={[-width * 0.5, 0, thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width*0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width/2, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* DJ Back cover */}
      <group
        ref={DJleftPageRef}
        position={[-width * 0.5, 0, -thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* DJ left flip */}
      <group
        ref={DJleftPageFlipRef}
        position={[-width * 0.5, 0, -thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width/2, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>


      {/* Spine */}
      <mesh
        ref={DJspinePageRef}
        position={[-width * 0.5, 0, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.001, height, thickness + 0.001]} />
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>
</group>
)}

{/* BOOK */}

      {/* Front cover */}
      <group
        ref={rightPageRef}
        position={[-width * 0.5, 0, thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* Back cover */}
      <group
        ref={leftPageRef}
        position={[-width * 0.5, 0, -thickness * 0.5]}
        rotation={[0, 0, 0]}
      >
        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.001]} />
          <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
      </group>

      {/* Spine */}
      <mesh
        ref={spinePageRef}
        position={[-width * 0.5, 0, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.001, height, thickness]} />
        <meshPhysicalMaterial {...glassMaterialProps} />
      </mesh>

      <group ref={pagesGroupRef} position={[0.001, 1, 0]}>
          {Array.from({ length: pages }).map((_, index) => (
            <group
              key={`page-${index}`}
              ref={(el) => (pageRefs.current[index] = el)}
              position={[
                -width / 2,
                -1,
                //index * pageThickness - thickness * 0.5,
                index * -pageThickness + thickness * 0.5,
              ]}
              rotation={[0, 0, 0]}
            >
              <mesh
                castShadow
                receiveShadow
                onPointerEnter={() => setHoveredPage(index)}
                onPointerLeave={() => setHoveredPage(null)}
                onClick={() => setCurrentPage(index)}
                position={[width / 2, 0, 0]}
              >
                <boxGeometry args={[width, height, pageThickness]} />
                <meshPhysicalMaterial {...glassMaterialProps} />

              </mesh>
            </group>
          ))}
        </group>

      <Html>
        <button
          onClick={flipBackward}
          style={{ position: "absolute", top: 20, left: 20, zIndex: 100 }}
          disabled={currentPage === 0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={currentPage === 0 ? "rgba(255,0,0,0.1)" : "red"}
          >
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </button>

        <div
          style={{
            width: "fit",
            position: "absolute",
            top: 20,
            left: 60,
            zIndex: 100,
          }}
        >
          <div className="rotate-45">
            {bookOpen ? (
              <button onClick={() => handleOpenClose(false, false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                >
                  <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
                </svg>
              </button>
            ) : (
              <button onClick={() => handleOpenClose(true, isDJOpen)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                >
                  <path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={flipForward}
          disabled={currentPage === pages}
          style={{ position: "absolute", top: 20, left: 120, zIndex: 100 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={currentPage === pages ? "rgba(255,0,0,0.1)" : "red"}
          >
            <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
          </svg>
        </button>
        {/* <input
            type="number"
            min="1"
            max={pages - 1}
            value={currentPage}
            onChange={(e) =>
              setPagesToFlip(Math.min(e.target.value, pages - 1))
            }
            className="w-20 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          /> */}

        {hoveredPage !== null && (
          <span className="relative px-3 py-2 bg-gray-800 text-white rounded-md w-[150px]">
            Page {hoveredPage + 1}
          </span>
        )}
      </Html>
    </>
  );
};

export default ScannerOverlay;
