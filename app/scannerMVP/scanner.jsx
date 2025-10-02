"use client";
import React, { useState, useEffect, useRef } from "react";
import "./styles.css"; // keep your CSS here
import LogoMorpher from "../LogoMorpher";

const stagesDefault = [
  { id: "back", label: "Back", img: null },
  { id: "spine", label: "Spine", img: null },
  { id: "front", label: "Front", img: null },
];

export default function ScannerUI({ onImagesReady }) {
  const [stages, setStages] = useState(stagesDefault);
  const [active, setActive] = useState("front");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedDot: null,
  });
  const [dotPositions, setDotPositions] = useState({
    "dot-1": { x: 20, y: 20 }, // top-left
    "dot-2": { x: 80, y: 20 }, // top-right
    "dot-3": { x: 20, y: 70 }, // bottom-left
    "dot-4": { x: 80, y: 70 }, // bottom-right
  });

  const [morphed, setMorphed] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const handleStageClick = (id) => {
    setActive(id);
  };

  const nextBtn = () => {
    // Logic for next button
    // Collect all transformed images from stages
    console.log("🔍 Current stages state:", stages);
    
    const transformedImages = {
      front: stages.find(s => s.id === 'front')?.img || null,
      spine: stages.find(s => s.id === 'spine')?.img || null,
      back: stages.find(s => s.id === 'back')?.img || null
    };

    console.log("🚀 Sending transformed images:", transformedImages);
    console.log("🔗 onImagesReady callback exists:", !!onImagesReady);
    
    // Send images to parent component
    if (onImagesReady) {
      onImagesReady(transformedImages);
    } else {
      console.error("❌ No onImagesReady callback provided!");
    }

    console.log("✅ Next button clicked - data sent!");
  };

  // Example: update a stage with scanned thumbnail
  const updateStageImg = (id, imgUrl) => {
    console.log(`📸 Updating stage ${id} with image:`, imgUrl);
    setStages((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, img: imgUrl } : s));
      console.log(`📊 Updated stages for ${id}:`, updated);
      return updated;
    });
  };

  // Auto-send images when all stages have images
  useEffect(() => {
    const hasAllImages = stages.every(stage => stage.img !== null);
    console.log("🔍 Checking if all images ready:", {
      stages: stages.map(s => ({ id: s.id, hasImage: !!s.img })),
      hasAllImages
    });
    
    if (hasAllImages && onImagesReady) {
      console.log("✅ All images ready - auto-sending to parent");
      const transformedImages = {
        front: stages.find(s => s.id === 'front')?.img || null,
        spine: stages.find(s => s.id === 'spine')?.img || null,
        back: stages.find(s => s.id === 'back')?.img || null
      };
      console.log("🚀 Auto-sending transformed images:", transformedImages);
      onImagesReady(transformedImages);
    }
  }, [stages, onImagesReady]);

  // Handle file upload
  // Camera functionality
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      setIsCameraMode(true);

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video source set");
      } else {
        console.log("Video ref not available");
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      // Fallback to file picker if camera fails
      setIsCameraMode(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraMode(false);
  };

  const capturePhoto = async () => {
    try {
      if (cameraStream && videoRef.current) {
        // Capture from live video stream
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const newCapturedImage = {
              file: blob,
              url,
              timestamp: Date.now(),
            };

            setCapturedImages((prev) => [...prev, newCapturedImage]);

            // Add to main images array like uploaded files
            setUploadedImages((prev) => [...prev, blob]);
            setImageUrls((prev) => [...prev, url]);
            setCurrentImageIndex(imageUrls.length); // Set to new image
          }
        }, "image/png");
      } else {
        // Fallback to file picker if no camera stream
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const url = URL.createObjectURL(file);
            const newCapturedImage = {
              file,
              url,
              timestamp: Date.now(),
            };

            setCapturedImages((prev) => [...prev, newCapturedImage]);

            // Add to main images array like uploaded files
            setUploadedImages((prev) => [...prev, file]);
            setImageUrls((prev) => [...prev, url]);
            setCurrentImageIndex((prev) => prev + 1);
          }
        };

        input.click();
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const finishCapturing = () => {
    stopCamera();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    // Validate that all files are images
    const imageFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        console.warn(`Skipped non-image file: ${file.name}`);
      }
      return isImage;
    });

    if (imageFiles.length !== files.length) {
      alert(
        `${
          files.length - imageFiles.length
        } non-image files were skipped. Only image files are allowed.`
      );
    }

    // Clean up previous URLs
    imageUrls.forEach((url) => URL.revokeObjectURL(url));

    // Create new URLs for images
    const newImageUrls = imageFiles.map((file) => URL.createObjectURL(file));

    setUploadedImages(imageFiles);
    setImageUrls(newImageUrls);
    setCurrentImageIndex(0);
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    document.getElementById("fileInput").click();
  };

  // Navigate between images
  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
      );
    }
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Debug: Log stage changes
  useEffect(() => {
    console.log("Stages updated:", stages);
  }, [stages]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Drag functionality for dots
  const handleMouseDown = (e, dotId) => {
    console.log("Touch/Mouse down event:", e.type, "on dot:", dotId);

    e.preventDefault();
    e.stopPropagation();

    setDragState({ isDragging: true, draggedDot: dotId });
    setMorphed(true);

    // Hide UI elements during drag for full screen workspace
    const footer = document.querySelector("footer");
    const header = document.querySelector("header");
    const cropButton = document.querySelector(".cropButton");
    const sidebar = document.querySelector(".imageSidebar");
    const dotsContainer = document.querySelector(".dotsContainer");

    if (footer) footer.classList.add("hidden");
    if (header) header.classList.add("hidden");
    if (cropButton) cropButton.classList.add("hidden");
    if (sidebar) sidebar.classList.add("hidden");

    // Keep dots container visible but update its positioning
    if (dotsContainer) {
      dotsContainer.style.left = "0";
      dotsContainer.style.width = "100%";
      dotsContainer.style.top = "0";
      dotsContainer.style.height = "100vh";
    }
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging || !dragState.draggedDot) return;

    // Prevent default behavior
    e.preventDefault();

    const imageDisplay = document.querySelector(".currentImage");
    if (!imageDisplay) return;

    // Handle pointer, mouse and touch events
    let clientX, clientY;

    if (e.type === "pointermove") {
      clientX = e.clientX;
      clientY = e.clientY;
      console.log("Pointer move detected");
    } else if (e.type === "touchmove") {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      console.log("Touch move detected");
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      console.log("Mouse move detected");
    }

    console.log("Move coordinates:", clientX, clientY);

    const rect = imageDisplay.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Constrain within bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    setDotPositions((prev) => ({
      ...prev,
      [dragState.draggedDot]: { x: constrainedX, y: constrainedY },
    }));
  };

  const handleMouseUp = (e) => {
    // Prevent default behavior for touch events
    if (e && e.type === "touchend") {
      e.preventDefault();
    }

    setDragState({ isDragging: false, draggedDot: null });
    setMorphed(false);

    // Show UI elements again
    const footer = document.querySelector("footer");
    const header = document.querySelector("header");
    const cropButton = document.querySelector(".cropButton");
    const sidebar = document.querySelector(".imageSidebar");
    const dotsContainer = document.querySelector(".dotsContainer");

    if (footer) footer.classList.remove("hidden");
    if (header) header.classList.remove("hidden");
    if (cropButton) cropButton.classList.remove("hidden");
    if (sidebar) sidebar.classList.remove("hidden");

    // Restore dots container positioning
    if (dotsContainer) {
      dotsContainer.style.left = "";
      dotsContainer.style.width = "";
      dotsContainer.style.top = "";
      dotsContainer.style.height = "";
    }
  };

  // Add global mouse and touch event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      // Use pointer events if available, otherwise fallback to mouse/touch
      if (window.PointerEvent) {
        document.addEventListener("pointermove", handleMouseMove);
        document.addEventListener("pointerup", handleMouseUp);
      } else {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleMouseMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleMouseUp, {
          passive: false,
        });
      }
      document.body.style.userSelect = "none";
      document.body.style.touchAction = "none";
    }

    //fetch / upload to server
    //org image, transformed image, points
    //from front, spine, back
    //meta data - user, book id, timestamp
    const token = localStorage.getItem("token") || "123"; // Adjust based on your auth implementation

    const sendDataToServer = async (data) => {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalImages: data.originalImages,
            transformedImages: data.transformedImages, 
            dotPositions: data.dotPositions,
            metadata: {
              user: data.user,
              bookId: data.bookId,
              timestamp: data.timestamp,
              stage: data.stage // front, spine, or back
            }
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log("Success:", result);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    return () => {
      if (window.PointerEvent) {
        document.removeEventListener("pointermove", handleMouseMove);
        document.removeEventListener("pointerup", handleMouseUp);
      } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseUp);
      }
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    };
  }, [dragState.isDragging, dragState.draggedDot]);

  // Perspective transformation helper function
  const applyPerspectiveWarp = (
    sourceCanvas,
    srcPoints,
    outputWidth,
    outputHeight
  ) => {
    const srcCtx = sourceCanvas.getContext("2d");
    const srcImageData = srcCtx.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );

    // Create output canvas
    const outputCanvas = document.createElement("canvas");
    const outputCtx = outputCanvas.getContext("2d");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const outputImageData = outputCtx.createImageData(
      outputWidth,
      outputHeight
    );

    // Destination points (rectangle corners)
    const dstPoints = [
      [0, 0], // top-left
      [outputWidth - 1, 0], // top-right
      [outputWidth - 1, outputHeight - 1], // bottom-right
      [0, outputHeight - 1], // bottom-left
    ];

    // Apply inverse perspective mapping
    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        // Normalize coordinates to [0, 1]
        const u = x / (outputWidth - 1);
        const v = y / (outputHeight - 1);

        // Bilinear interpolation in the source quadrilateral
        const srcX =
          (1 - v) * ((1 - u) * srcPoints[0][0] + u * srcPoints[1][0]) +
          v * ((1 - u) * srcPoints[3][0] + u * srcPoints[2][0]);
        const srcY =
          (1 - v) * ((1 - u) * srcPoints[0][1] + u * srcPoints[1][1]) +
          v * ((1 - u) * srcPoints[3][1] + u * srcPoints[2][1]);

        // Sample from source image
        if (
          srcX >= 0 &&
          srcX < sourceCanvas.width &&
          srcY >= 0 &&
          srcY < sourceCanvas.height
        ) {
          const srcIndex =
            (Math.floor(srcY) * sourceCanvas.width + Math.floor(srcX)) * 4;
          const dstIndex = (y * outputWidth + x) * 4;

          // Copy pixel data
          outputImageData.data[dstIndex] = srcImageData.data[srcIndex]; // R
          outputImageData.data[dstIndex + 1] = srcImageData.data[srcIndex + 1]; // G
          outputImageData.data[dstIndex + 2] = srcImageData.data[srcIndex + 2]; // B
          outputImageData.data[dstIndex + 3] = srcImageData.data[srcIndex + 3]; // A
        }
      }
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    return outputCanvas;
  };

  // Crop functionality with perspective transformation
  const handleCrop = () => {
    if (imageUrls.length === 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Convert percentage coordinates to pixel coordinates
      const dot1 = {
        x: (dotPositions["dot-1"].x / 100) * img.width,
        y: (dotPositions["dot-1"].y / 100) * img.height,
      };
      const dot2 = {
        x: (dotPositions["dot-2"].x / 100) * img.width,
        y: (dotPositions["dot-2"].y / 100) * img.height,
      };
      const dot3 = {
        x: (dotPositions["dot-3"].x / 100) * img.width,
        y: (dotPositions["dot-3"].y / 100) * img.height,
      };
      const dot4 = {
        x: (dotPositions["dot-4"].x / 100) * img.width,
        y: (dotPositions["dot-4"].y / 100) * img.height,
      };

      // Source points (the quadrilateral formed by the dots) in clockwise order
      const srcPoints = [
        [dot1.x, dot1.y], // top-left
        [dot2.x, dot2.y], // top-right
        [dot4.x, dot4.y], // bottom-right
        [dot3.x, dot3.y], // bottom-left
      ];

      // Calculate optimal output dimensions based on the quadrilateral edges
      const topEdge = Math.sqrt(
        (dot2.x - dot1.x) ** 2 + (dot2.y - dot1.y) ** 2
      );
      const bottomEdge = Math.sqrt(
        (dot4.x - dot3.x) ** 2 + (dot4.y - dot3.y) ** 2
      );
      const leftEdge = Math.sqrt(
        (dot3.x - dot1.x) ** 2 + (dot3.y - dot1.y) ** 2
      );
      const rightEdge = Math.sqrt(
        (dot4.x - dot2.x) ** 2 + (dot4.y - dot2.y) ** 2
      );

      // Use the maximum edge lengths for output dimensions
      const outputWidth = Math.round(Math.max(topEdge, bottomEdge));
      const outputHeight = Math.round(Math.max(leftEdge, rightEdge));

      console.log("Applying perspective warp:", {
        srcPoints,
        outputWidth,
        outputHeight,
      });

      // Apply perspective transformation
      const warpedCanvas = applyPerspectiveWarp(
        canvas,
        srcPoints,
        outputWidth,
        outputHeight
      );

      // Convert to blob and create URL
      warpedCanvas.toBlob((blob) => {
        const croppedUrl = URL.createObjectURL(blob);

        // Update the active stage with the perspective-corrected image
        updateStageImg(active, croppedUrl);

        console.log(
          `Perspective warped image assigned to ${active} stage with URL:`,
          croppedUrl
        );

        // Prepare data for server upload
        const uploadData = {
          originalImages: [imageUrls[currentImageIndex]],
          transformedImages: [croppedUrl],
          dotPositions: dotPositions,
          metadata: {
            user: "current_user_id", // Replace with actual user ID
            bookId: "current_book_id", // Replace with actual book ID  
            timestamp: Date.now(),
            stage: active // front, spine, or back
          }
        };

        // Upload to server (optional - can be done later)
        // sendDataToServer(uploadData);

        // Show success message
        //alert(`Perspective warped and assigned to ${active} stage!`);
      }, "image/png");
    };

    img.crossOrigin = "anonymous"; // Handle CORS issues
    img.src = imageUrls[currentImageIndex];
  };

  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);

  return (
    <div className="scannerApp">
      {/* Live Camera Feed - Background when in camera mode */}
      {isCameraMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="cameraFeed"
        />
      )}

      {/* Camera Mode Indicator */}
      {isCameraMode && (
        <div className="cameraIndicator">
          <div className="cameraIndicatorDot"></div>
          <span>Camera Mode Active</span>
        </div>
      )}

      {/* MAIN IMAGE DISPLAY AREA */}
      <main className="imageDisplay">
        {/* IMAGE GALLERY SIDEBAR */}
        {imageUrls.length > 0 && (
          <aside className="imageSidebar">
            <div className="sidebarHeader">
              <span>Images ({imageUrls.length})</span>
            </div>
            <div className="thumbnailGrid">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={url} alt={`Image ${index + 1}`} />
                  <span className="thumbnailNumber">{index + 1}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {imageUrls.length > 0 && (
          <>
            <div
              className="currentImage"
              style={{
                backgroundImage: `url(${imageUrls[currentImageIndex]})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {/* Image navigation */}
              {imageUrls.length > 1 && (
                <>
                  <button className="imageNav prev" onClick={prevImage}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button className="imageNav next" onClick={nextImage}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="imageCounter">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>

              {/* Perspective correction button */}
              <button className="cropButton" onClick={handleCrop}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M3 3l18 0"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 3l-6 18"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 3l6 18"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 21l18 0"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
                Perspective to {active}
              </button>

              {/* Crop area overlay - Enhanced Polygon */}
              <svg
                className="cropOverlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Semi-transparent overlay to dim outside area */}
                <defs>
                  <mask id="cropMask">
                    <rect width="100" height="100" fill="white" />
                    <polygon
                      points={`${dotPositions["dot-1"].x},${dotPositions["dot-1"].y} ${dotPositions["dot-2"].x},${dotPositions["dot-2"].y} ${dotPositions["dot-4"].x},${dotPositions["dot-4"].y} ${dotPositions["dot-3"].x},${dotPositions["dot-3"].y}`}
                      fill="black"
                    />
                  </mask>
                </defs>

                {/* Dark overlay outside the crop area */}
                <rect
                  width="100"
                  height="100"
                  fill="rgba(0, 0, 0, 0.7)"
                  mask="url(#cropMask)"
                />

                {/* Crop boundary polygon */}
                <polygon
                  points={`${dotPositions["dot-1"].x},${dotPositions["dot-1"].y} ${dotPositions["dot-2"].x},${dotPositions["dot-2"].y} ${dotPositions["dot-4"].x},${dotPositions["dot-4"].y} ${dotPositions["dot-3"].x},${dotPositions["dot-3"].y}`}
                  fill="none"
                  stroke="#ff0000"
                  strokeWidth="0.5"
                  strokeDasharray="2,1"
                />

                {/* Corner indicators */}
                {Object.entries(dotPositions).map(([dotId, pos]) => (
                  <circle
                    key={dotId}
                    cx={pos.x}
                    cy={pos.y}
                    r="1.5"
                    fill="rgba(255, 0, 0, 0.3)"
                    stroke="#ff0000"
                    strokeWidth="0.3"
                  />
                ))}
              </svg>
            </div>
          </>
        )}
      </main>

      {/* DOT DRAGGERS - positioned relative to currentImage */}
      {imageUrls.length > 0 && (
        <div className="dotsContainer">
          <div
            className="dot dot-1"
            style={{
              left: `${dotPositions["dot-1"].x}%`,
              top: `${dotPositions["dot-1"].y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => handleMouseDown(e, "dot-1")}
            onMouseDown={(e) => handleMouseDown(e, "dot-1")}
            onTouchStart={(e) => handleMouseDown(e, "dot-1")}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div
            className="dot dot-2"
            style={{
              left: `${dotPositions["dot-2"].x}%`,
              top: `${dotPositions["dot-2"].y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => handleMouseDown(e, "dot-2")}
            onMouseDown={(e) => handleMouseDown(e, "dot-2")}
            onTouchStart={(e) => handleMouseDown(e, "dot-2")}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div
            className="dot dot-3"
            style={{
              left: `${dotPositions["dot-3"].x}%`,
              top: `${dotPositions["dot-3"].y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => handleMouseDown(e, "dot-3")}
            onMouseDown={(e) => handleMouseDown(e, "dot-3")}
            onTouchStart={(e) => handleMouseDown(e, "dot-3")}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div
            className="dot dot-4"
            style={{
              left: `${dotPositions["dot-4"].x}%`,
              top: `${dotPositions["dot-4"].y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => handleMouseDown(e, "dot-4")}
            onMouseDown={(e) => handleMouseDown(e, "dot-4")}
            onTouchStart={(e) => handleMouseDown(e, "dot-4")}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        {/* Hidden file input */}
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* UPLOAD */}
        <div className="fileupload" onClick={triggerFileUpload}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 3v12" />
            <path d="m17 8-5-5-5 5" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </svg>
          <span>
            upload {uploadedImages.length > 0 && `(${uploadedImages.length})`}
          </span>
        </div>

        {/* SLIDER / STAGES */}
        <div className="locationOnCover">
          <div className="left">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>

          <div className="slider absolute bottom-[50px]">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`cover ${stage.id} ${
                  active === stage.id ? "active" : ""
                }`}
                onClick={() => handleStageClick(stage.id)}
              >
                {stage.img ? (
                  <img src={stage.img} alt={stage.label} />
                ) : (
                  <span>{stage.label}</span>
                )}
              </div>
            ))}
          </div>

          <div className="right">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
        </div>

        {/* CAMERA */}
        <div
          className="camera"
          onClick={isCameraMode ? finishCapturing : startCamera}
        >
          {isCameraMode ? (
            <>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Done</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M13.997 4a2 2 0 0 1 1.85 1.267L16.28 7h2.22a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.22l.43-1.733A2 2 0 0 1 10 4h3.997z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>camera</span>
            </>
          )}
        </div>
      </footer>

      {/* Camera Capture Button - appears in camera mode */}
      {isCameraMode && (
        <div className="captureButton" onClick={capturePhoto}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <circle cx="12" cy="12" r="3" />
            <path d="M13.997 4a2 2 0 0 1 1.85 1.267L16.28 7h2.22a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.22l.43-1.733A2 2 0 0 1 10 4h3.997z" />
          </svg>
          <span>{cameraStream ? "Snap Photo" : "Select Image"}</span>
        </div>
      )}
    </div>
  );
}
