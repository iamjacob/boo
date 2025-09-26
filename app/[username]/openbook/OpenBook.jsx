"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Html, OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import usePDFToImage from "../components/usePDFToImage";
import { useOpenBookStore } from "../../../stores/useOpenBookStore";
// import { useMenuStore } from "../../../stores/useMenuStore";
import { useBookMenuStore } from "../../../stores/useBookMenuStore";

// book, onBookDoubleClick
const OpenBook = ({ bookId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookOpen, setBookOpen] = useState(0);
  const [pagesToFlip, setPagesToFlip] = useState(1);
  // const [hoveredPage, setHoveredPage] = useState(null);

  //pdf part
  const [pageImage, setPageImage] = useState();

   const {
    setMenuVisible,
    setCurrentPage: setMenuCurrentPage,
    setPages: setMenuPages,
    setBookOpen: setMenuBookOpen,
    // setHoveredPage,
    setBook: setMenuBook,
    registerControls,
    clearControls,
  } = useBookMenuStore();

 

  const { toggleBook, openBookId, bookObject, setCloseHandler, closeBook,setOpenBookId } =
    useOpenBookStore();

  const handleGetPageImage = async (pageNum) => {
    try {
      const imageUrl = await getPageImage(pageNum);
      setPageImage(imageUrl);
    } catch (error) {
      console.error("Failed to load page image:", error);
    }
  };

  const leftPageRef = useRef();
  const rightPageRef = useRef();
  const spinePageRef = useRef();
  const pagesGroupRef = useRef();
  const pageRefs = useRef([]);

  const books = {
    block1book1: {
      cover: {
        front: "./books/learningweb.webp",
        back: "./books/learningweb.webp",
        spine: "./books/learningweb.webp",
      },
      dimensions: [0.5, 0.7, 0.07],
      position: {
        x: 0,
        y: 0.4,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0.4,
        z: 0,
      },
      pages: 700,
      pdf: "./books/webdesign.pdf",
    },
  };

  function initBookDataFromObject(bookObject) {
    const normalizePath = (path) => {
      if (!path) return "./test.png";
      // Convert ./covers/ to /covers/
      return path.startsWith('./covers/') ? path.replace('./covers/', '/covers/') : path;
    };

    return {
      cover: {
        front: normalizePath(bookObject.cover?.front || "./test.png"),
        back: normalizePath(bookObject.cover?.back || bookObject.cover?.front || "./test.png"),
        spine: normalizePath(bookObject.cover?.spine || bookObject.cover?.front || "./test.png"),
      },
      dimensions: [
        bookObject.scale?.width || 0.5,
        bookObject.scale?.height || 0.7,
        bookObject.scale?.thickness || 0.07,
      ],
      position: bookObject.position || { x: 0, y: 0.4, z: 0 },
      rotation: bookObject.rotation || { x: 0, y: 0.4, z: 0 },
      pages: bookObject.pages || 700,
      pdf: bookObject.pdf || "./books/webdesign.pdf",
      title: bookObject.title,
      author: bookObject.author,
      id: bookObject.id,
      categories: bookObject.categories,
      tags: bookObject.tags,
      year: bookObject.year,
    };
  }

  // Initialize book data properly

  // Memoize the book object to prevent infinite loops
  const book = useMemo(() => {
    if (bookObject) {
      console.log("bookObject detected, initializing book data from it");
      return initBookDataFromObject(bookObject);
    } else {
      console.log("No bookObject found, using default book data");
      return books["block1book1"];
    }
  }, [bookObject]); // Only recreate when bookObject changes


  // Safely destructure with fallbacks
  const dimensions = book?.dimensions || [0.5, 0.7, 0.07];
  const cover = book?.cover || { front: "./test.png", back: "./test.png", spine: "./test.png" };
  const position = book?.position || { x: 0, y: 0.4, z: 0 };
  const pages = book?.pages || 700;
  const pdf = book?.pdf || "./books/webdesign.pdf";

  // Extract dimensions safely
  const [width, height, thickness] = dimensions;

  //const [height, thickness, width] = dimensions;

  const { getPageImage } = usePDFToImage(pdf || "./sample.pdf");

  const openDegrees = 1;
  const pageThickness = thickness / pages;

// Register controls - only run once
useEffect(() => {
  registerControls({
    flipForward,
    flipBackward,
    openBook: open,
    closeBook: close,
    toggleBook,
  });

  return () => clearControls();
}, [currentPage, pages]); // Empty dependency array

// Set menu visible - only run once
useEffect(() => {
  setMenuVisible(true);
  
  return () => {
    setMenuVisible(false);
  };
}, []); // Empty dependency array

// Sync individual states - separate useEffects
useEffect(() => {
  setMenuCurrentPage(currentPage);
}, [currentPage, setMenuCurrentPage]);

useEffect(() => {
  setMenuPages(pages);
}, [pages, setMenuPages]);

useEffect(() => {
  setMenuBookOpen(bookOpen);
}, [bookOpen, setMenuBookOpen]);

useEffect(() => {
  setMenuBook(book);
}, [book, setMenuBook]);



  const useSafeLoader = (url, fallbackUrl = "./test.png") => {
    const [texture, setTexture] = useState(null);

    useEffect(() => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (loadedTexture) => setTexture(loadedTexture),
        undefined,
        () =>
          loader.load(fallbackUrl, (fallbackTexture) =>
            setTexture(fallbackTexture)
          )
      );
    }, [url, fallbackUrl]);
    return texture;
  };

  
useEffect(() => {
  setCloseHandler(() => close);
  // close()
  return () => setCloseHandler(null);
}, [setCloseHandler]);

  // Debug cover paths
  // console.log("Cover paths:", cover);
  // console.log("Cover front path:", cover.front);

  const textures = [
    useSafeLoader("https://jacobg.me/exam/booktexture.png"), //empty this/whiten it
    useSafeLoader(cover.front || "./test.png"), //front
    useSafeLoader("./test.png"), //empty this/whiten it
    useSafeLoader("https://jacobg.me/k.jpg"), //empty this/whiten it
    useSafeLoader(cover.spine || "https://jacobg.me/exam/booktexture.png"), //spine
    useSafeLoader(cover.back || "https://jacobg.me/exam/booktexture.png"), //back
  ];

  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );

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
    // animatePages(currentPage + 1, targetPage, true);
    open();
    flippin(targetPage);
  };

  const flipBackward = () => {
    if (currentPage <= 0) return;
    const targetPage = Math.max(currentPage - pagesToFlip, 0);
    // animatePages(currentPage, targetPage, false);
    open();
    flippin(targetPage);
  };

  useEffect(() => {
    open();
  }, [currentPage]);

  const close = () => {
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
  };

  const open = () => {
    gsap.to(rightPageRef.current.rotation, {
      y: -openDegrees,
      duration: 0.4,
    });
    gsap.to(leftPageRef.current.rotation, {
      y: openDegrees,
      duration: 0.4,
    });

    // Animate each page in the book
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

  // // Function to load texture and apply it to a specific page
  const loadPageTexture = (pageIndex, textureUrl) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (texture) => {
        const page = pageRefs.current[pageIndex];
        if (page) {
          page.children[0].material = new THREE.MeshStandardMaterial({
            map: texture,
          });
        }
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );
  };

  // Fetch and update page image as texture
  useEffect(() => {
    const fetchAndUpdatePageImage = async () => {
      try {
        const imageUrl = await getPageImage(currentPage);
        setPageImage(imageUrl);

        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
          const page = pageRefs.current[currentPage];
          if (page) {
            page.children[0].material = new THREE.MeshStandardMaterial({
              map: texture,
            });
          }
        });
      } catch (error) {
        console.error("Error loading page image:", error);
      }
    };

    fetchAndUpdatePageImage();
  }, [currentPage, getPageImage]);

  return (
    <>
      {/* <OrbitControls /> */}
      
      <group
       
        rotation={[0, Math.PI / 2, 0]}
      >
        <mesh
          rotation={[0, Math.PI, 0.45]}
          position={[0, 0, 0]}
          bookID={book.bookID}
        >
          {/* This will be the first thing to be instanced meshes? :)  */}
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
                  // onPointerEnter={() => setHoveredPage(index)}
                  // onPointerLeave={() => setHoveredPage(null)}
                  onClick={() => setCurrentPage(index)}
                  position={[width / 2, 0, 0]}
                >
                  <boxGeometry args={[width, height, pageThickness]} />
                  <meshStandardMaterial
                    color={index % 2 === 0 ? "white" : "lightgray"}
                  />
                </mesh>
              </group>
            ))}
          </group>

          {/* Front cover */}
          <group
            ref={rightPageRef}
            position={[-width * 0.5, 0, thickness * 0.5]}
            rotation={[0, 0, 0]}
          >
            <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, 0.001]} />
              <primitive object={materials[1]} attach="material" />
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
              <primitive object={materials[5]} attach="material" />
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
            <primitive object={materials[4]} attach="material" />
          </mesh>
        </mesh>
      </group>
    </>
  );
};

export default OpenBook;
