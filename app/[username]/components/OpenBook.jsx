"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { Html, OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import usePDFToImage from "./usePDFToImage";
import { useOpenBookStore } from "../../../stores/useOpenBookStore";
import { useMenuStore } from "../../../stores/useMenuStore";

// book, onBookDoubleClick
const OpenBook = ({ bookId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookOpen, setBookOpen] = useState(0);
  const [pagesToFlip, setPagesToFlip] = useState(1);
  const [hoveredPage, setHoveredPage] = useState(null);

  //pdf part
  const [pageImage, setPageImage] = useState();

  const { animateBack, openBookId, bookObject, setCloseHandler } =
    useOpenBookStore();

  // const { closeBookBeforeMoveToShelf } = useMenuStore((s) => s.closeBookBeforeMoveToShelf);

  // useEffect(() => {
  //   close();
  // }, [closeBookBeforeMoveToShelf]);

  // // Local zustand close function
  // const zustandClose = () => {
  //   setBookOpen(0);
  //   setCurrentPage(0);
  //   close();
  //   // ...any other logic needed to close the book
  //   console.log('OpenBook closed via zustand handler');
  // };

  // // Register the local zustandClose function in the zustand store
  // useEffect(() => {
  //   setCloseHandler(() => zustandClose);
  //   // Optionally cleanup on unmount
  //   return () => setCloseHandler(null);
  // }, []);

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

  // BOOOOOK IS LOADED HERE VIA
  // openBookId

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

  //const book, { dimensions, cover, position, pages, pdf } = books["block1book1"];
  let book = books["block1book1"];

  function initBookDataFromObject(bookObject) {
    return {
      cover: {
        front: bookObject.cover?.front || "./test.png",
        back: bookObject.cover?.back || bookObject.cover?.front || "./test.png",
        spine:
          bookObject.cover?.spine || bookObject.cover?.front || "./test.png",
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
      // Optionally add other fields you need
      title: bookObject.title,
      author: bookObject.author,
      id: bookObject.id,
      categories: bookObject.categories,
      tags: bookObject.tags,
      year: bookObject.year,
    };
  }

  if (bookObject) {
    console.log("bookObject detected, initializing book data from it");
    book = initBookDataFromObject(bookObject);
  } else {
    console.log("No bookObject found, using default book data");
  }

  const { dimensions, cover, position, pages, pdf } = book;

  //console.log(book.book)
  //console.log('Book id for open book: ' + bookId);

  console.log("Open book id from store in OpenBook: " + openBookId);

  console.log("obj from openBook", bookObject);

  // console.log(book);
  //const { dimensions, cover, position, pages, pdf } = book.book;

  /* WORD!!!!!!!! This should be corrected for some reason! Just for for the sake of good order. */
  const width = dimensions[0];
  const thickness = dimensions[2];
  const height = dimensions[1];

  //const [height, thickness, width] = dimensions;

  const { getPageImage } = usePDFToImage(pdf || "./sample.pdf");

  const openDegrees = 1;
  const pageThickness = thickness / pages;

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
              <button onClick={close}>
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
              <button onClick={open}>
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

         <button
    onClick={close}
    style={{ position: "absolute", top: 20, left: 60, zIndex: 100 }}
  >
    Close Book
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
      <group
        onDoubleClick={() => {
          animateBack();
        }}
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
                  onPointerEnter={() => setHoveredPage(index)}
                  onPointerLeave={() => setHoveredPage(null)}
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
