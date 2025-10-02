"use client";

import React, { useState, useEffect } from "react";
import LogoMorpher from "../LogoMorpher";
import StepViewer from "./StepViewer";
// import Book3d from "./Book3d";

import Scanner from "./scanner";
import Book from "./Book";

import { Canvas } from "@react-three/fiber";

const page = () => {
  const [step, setStep] = useState(1);
  
  // Store transformed book images from scanner
  const [bookImages, setBookImages] = useState({
    front: null,
    spine: null, 
    back: null
  });

  const steps = [
        { id: 1, content: 'Title' },
        { id: 2, content: 'author' },
        { id: 3, content: 'year' },
        { id: 4, content: 'size' },
        { id: 5, content: 'weight' },
        { id: 6, content: 'coverMethod' },
        { id: 7, content: 'coverCrop' },
        { id: 8, content: 'addToCollection' },
      ];

  // Handle receiving transformed images from Scanner
  const handleBookImagesUpdate = (transformedImages) => {
    console.log('🔥 Received transformed images in page.jsx:', transformedImages);
    setBookImages(transformedImages);
    
    // Don't auto-advance - let user use header next button
    console.log('📱 Images ready - use header next button to view book');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div>Step 1 Content</div>
            <h1>Add title</h1>
            <input type="text" placeholder="Enter book title" />
          </>
        );
      case 2:
        return (
          <>
            <div>Step 2 - Book 3D</div>
          </>
        );
      case 3:
        return (
          <>
            <div>Step 3 - Scanner</div>
            <Scanner onImagesReady={handleBookImagesUpdate} />
          </>
        );
      case 4:
        return (
          <>
            <div>Step 4 - Book 3D Preview</div>
            {/* <div>Debug bookImages: {JSON.stringify(Object.keys(bookImages).reduce((acc, key) => {
              acc[key] = bookImages[key] ? 'Has Image' : 'No Image';
              return acc;
            }, {}))}</div> */}
            <Canvas>
              <ambientLight/>
              <Book 
                cover={bookImages.front || "./covers/000.webp"}
                spine={bookImages.spine}
                back={bookImages.back}
                images={bookImages}
              />
            </Canvas>
          </>
        );
        case 5:
          return (
            <>
            <h1>Step 5 Content</h1>
            <p>{steps[step]?.content}</p>
            add more 


            </>
          );

        case 6:
          return <div>Step 6 Content</div>;

      // return <book3d images={} />
      default:
        return <div>Default Step</div>;

    }
  };

  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 flex w-screen justify-between items-center p-2 bg-black bg-opacity-90 backdrop-blur z-10">
        <div
          className="backBtn cursor-pointer"
          onClick={() => {
            console.log("back");
            setStep(Math.max(step - 1, 1));
          }}
        >
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
            className="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>

        <LogoMorpher morphed={false} />

        <StepViewer step={step} setStep={setStep} />

        <div
          className="nextBtn cursor-pointer"
          onClick={() => {
            console.log("next");
            setStep(Math.min(step + 1, 8));
          }}
        >
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
            className="lucide lucide-chevron-right-icon lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </header>
      {renderStep()}
    </>
  );
};

export default page;
