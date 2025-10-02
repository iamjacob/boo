'use client';
import React, { useState, useEffect } from "react";
import "./styles.css"; // keep your CSS here
import LogoMorpher from "../LogoMorpher";
import { Divide } from "lucide-react";

const stagesDefault = [
  { id: "back", label: "Back", img: null },
  { id: "spine", label: "Spine", img: null },
  { id: "front", label: "Front", img: null },
];

export default function ScannerUI() {
  const [stages, setStages] = useState(stagesDefault);
  const [active, setActive] = useState("front");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [dragState, setDragState] = useState({ isDragging: false, draggedDot: null });
  const [dotPositions, setDotPositions] = useState({
    'dot-1': { x: 20, y: 20 },  // top-left
    'dot-2': { x: 80, y: 20 },  // top-right  
    'dot-3': { x: 20, y: 70 },  // bottom-left
    'dot-4': { x: 80, y: 70 }   // bottom-right
  });

  const [morphed, setMorphed] = useState(false);
  const [isZoomedForPrecision, setIsZoomedForPrecision] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);

  const handleStageClick = (id) => {
    setActive(id);
  };

  // Example: update a stage with scanned thumbnail
  const updateStageImg = (id, imgUrl) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, img: imgUrl } : s))
    );
  };

  // Handle file upload
  // Camera functionality
  const startCamera = async () => {
    try {
      setIsCameraMode(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopCamera = () => {
    setIsCameraMode(false);
  };

  const capturePhoto = async () => {
    try {
      // For mobile camera, we'll use file input with camera capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use back camera
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          const newCapturedImage = {
            file,
            url,
            timestamp: Date.now()
          };
          
          setCapturedImages(prev => [...prev, newCapturedImage]);
          
          // Add to main images array like uploaded files
          setUploadedImages(prev => [...prev, file]);
          setImageUrls(prev => [...prev, url]);
          setCurrentImageIndex(prev => prev + 1);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const finishCapturing = () => {
    setIsCameraMode(false);
    // Optional: show success message or navigate
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate that all files are images
    const imageFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.warn(`Skipped non-image file: ${file.name}`);
      }
      return isImage;
    });

    if (imageFiles.length !== files.length) {
      alert(`${files.length - imageFiles.length} non-image files were skipped. Only image files are allowed.`);
    }

    // Clean up previous URLs
    imageUrls.forEach(url => URL.revokeObjectURL(url));

    // Create new URLs for images
    const newImageUrls = imageFiles.map(file => URL.createObjectURL(file));
    
    setUploadedImages(imageFiles);
    setImageUrls(newImageUrls);
    setCurrentImageIndex(0);
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    document.getElementById('fileInput').click();
  };

  // Navigate between images
  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    }
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Debug: Log stage changes
  useEffect(() => {
    console.log('Stages updated:', stages);
  }, [stages]);

  // Drag functionality for dots
  const handleMouseDown = (e, dotId) => {
    e.preventDefault();
    
    // Prevent default touch behaviors
    if (e.type === 'touchstart') {
      e.stopPropagation();
    }
    
    setDragState({ isDragging: true, draggedDot: dotId });
    setMorphed(true);
    setIsZoomedForPrecision(true); // Enable smart zoom for precision
    
    // Hide UI elements during drag for full screen workspace
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');
    const cropButton = document.querySelector('.cropButton');
    const sidebar = document.querySelector('.imageSidebar');
    const dotsContainer = document.querySelector('.dotsContainer');
    
    if (footer) footer.classList.add('hidden');
    if (header) header.classList.add('hidden');
    if (cropButton) cropButton.classList.add('hidden');
    if (sidebar) sidebar.classList.add('hidden');
    
    // Keep dots container visible but update its positioning
    if (dotsContainer) {
      dotsContainer.style.left = '0';
      dotsContainer.style.width = '100%';
      dotsContainer.style.top = '0';
      dotsContainer.style.height = '100vh';
    }
    
    // Apply smart zoom for precision (30% zoom in)
    const currentImageEl = document.querySelector('.currentImage');
    if (currentImageEl) {
      const rect = currentImageEl.getBoundingClientRect();
      currentImageEl.style.width = `${rect.width}px`;
      currentImageEl.style.height = `${rect.height}px`;
      currentImageEl.style.position = 'fixed';
      currentImageEl.style.top = `${rect.top}px`;
      currentImageEl.style.left = `${rect.left}px`;
      currentImageEl.style.zIndex = '1';
      currentImageEl.style.marginLeft = '0';
      
      // Apply smart zoom with smooth transition
      currentImageEl.style.transition = 'transform 0.3s ease-out';
      currentImageEl.style.transform = 'scale(1.3)'; // 30% zoom in
      currentImageEl.style.transformOrigin = 'center center';
    }
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging || !dragState.draggedDot) return;

    const imageDisplay = document.querySelector('.currentImage');
    if (!imageDisplay) return;

    // Handle both mouse and touch events
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const rect = imageDisplay.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Constrain within bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    setDotPositions(prev => ({
      ...prev,
      [dragState.draggedDot]: { x: constrainedX, y: constrainedY }
    }));
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false, draggedDot: null });
    setMorphed(false);
    setIsZoomedForPrecision(false); // Disable smart zoom

    // Show UI elements again
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');
    const cropButton = document.querySelector('.cropButton');
    const sidebar = document.querySelector('.imageSidebar');
    const dotsContainer = document.querySelector('.dotsContainer');
    
    if (footer) footer.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
    if (cropButton) cropButton.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');
    
    // Restore dots container positioning
    if (dotsContainer) {
      dotsContainer.style.left = '';
      dotsContainer.style.width = '';
      dotsContainer.style.top = '';
      dotsContainer.style.height = '';
    }
    
    // Restore image layout and zoom
    const currentImageEl = document.querySelector('.currentImage');
    if (currentImageEl) {
      // Smooth zoom out transition
      currentImageEl.style.transition = 'transform 0.3s ease-out';
      currentImageEl.style.transform = 'scale(1)'; // Zoom back to normal
      
      // After transition, cleanup all styles
      setTimeout(() => {
        currentImageEl.style.width = '';
        currentImageEl.style.height = '';
        currentImageEl.style.position = '';
        currentImageEl.style.top = '';
        currentImageEl.style.left = '';
        currentImageEl.style.zIndex = '';
        currentImageEl.style.marginLeft = '';
        currentImageEl.style.transition = '';
        currentImageEl.style.transform = '';
        currentImageEl.style.transformOrigin = '';
      }, 300); // Match transition duration
    }
  };

  // Add global mouse and touch event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      document.body.style.touchAction = 'none'; // Prevent scrolling during touch
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
  }, [dragState.isDragging, dragState.draggedDot]);

  // Perspective transformation helper function
  const applyPerspectiveWarp = (sourceCanvas, srcPoints, outputWidth, outputHeight) => {
    const srcCtx = sourceCanvas.getContext('2d');
    const srcImageData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    
    const outputImageData = outputCtx.createImageData(outputWidth, outputHeight);
    
    // Destination points (rectangle corners)
    const dstPoints = [
      [0, 0],                           // top-left
      [outputWidth - 1, 0],             // top-right
      [outputWidth - 1, outputHeight - 1], // bottom-right
      [0, outputHeight - 1]             // bottom-left
    ];
    
    // Apply inverse perspective mapping
    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        // Normalize coordinates to [0, 1]
        const u = x / (outputWidth - 1);
        const v = y / (outputHeight - 1);
        
        // Bilinear interpolation in the source quadrilateral
        const srcX = (1 - v) * ((1 - u) * srcPoints[0][0] + u * srcPoints[1][0]) + 
                     v * ((1 - u) * srcPoints[3][0] + u * srcPoints[2][0]);
        const srcY = (1 - v) * ((1 - u) * srcPoints[0][1] + u * srcPoints[1][1]) + 
                     v * ((1 - u) * srcPoints[3][1] + u * srcPoints[2][1]);
        
        // Sample from source image
        if (srcX >= 0 && srcX < sourceCanvas.width && srcY >= 0 && srcY < sourceCanvas.height) {
          const srcIndex = (Math.floor(srcY) * sourceCanvas.width + Math.floor(srcX)) * 4;
          const dstIndex = (y * outputWidth + x) * 4;
          
          // Copy pixel data
          outputImageData.data[dstIndex] = srcImageData.data[srcIndex];         // R
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Convert percentage coordinates to pixel coordinates
      const dot1 = { x: (dotPositions['dot-1'].x / 100) * img.width, y: (dotPositions['dot-1'].y / 100) * img.height };
      const dot2 = { x: (dotPositions['dot-2'].x / 100) * img.width, y: (dotPositions['dot-2'].y / 100) * img.height };
      const dot3 = { x: (dotPositions['dot-3'].x / 100) * img.width, y: (dotPositions['dot-3'].y / 100) * img.height };
      const dot4 = { x: (dotPositions['dot-4'].x / 100) * img.width, y: (dotPositions['dot-4'].y / 100) * img.height };

      // Source points (the quadrilateral formed by the dots) in clockwise order
      const srcPoints = [
        [dot1.x, dot1.y], // top-left
        [dot2.x, dot2.y], // top-right
        [dot4.x, dot4.y], // bottom-right
        [dot3.x, dot3.y]  // bottom-left
      ];

      // Calculate optimal output dimensions based on the quadrilateral edges
      const topEdge = Math.sqrt((dot2.x - dot1.x) ** 2 + (dot2.y - dot1.y) ** 2);
      const bottomEdge = Math.sqrt((dot4.x - dot3.x) ** 2 + (dot4.y - dot3.y) ** 2);
      const leftEdge = Math.sqrt((dot3.x - dot1.x) ** 2 + (dot3.y - dot1.y) ** 2);
      const rightEdge = Math.sqrt((dot4.x - dot2.x) ** 2 + (dot4.y - dot2.y) ** 2);

      // Use the maximum edge lengths for output dimensions
      const outputWidth = Math.round(Math.max(topEdge, bottomEdge));
      const outputHeight = Math.round(Math.max(leftEdge, rightEdge));

      console.log('Applying perspective warp:', {
        srcPoints,
        outputWidth,
        outputHeight
      });

      // Apply perspective transformation
      const warpedCanvas = applyPerspectiveWarp(canvas, srcPoints, outputWidth, outputHeight);

      // Convert to blob and create URL
      warpedCanvas.toBlob((blob) => {
        const croppedUrl = URL.createObjectURL(blob);
        
        // Update the active stage with the perspective-corrected image
        updateStageImg(active, croppedUrl);
        
        console.log(`Perspective warped image assigned to ${active} stage with URL:`, croppedUrl);
        
        // Show success message
        //alert(`Perspective warped and assigned to ${active} stage!`);
      }, 'image/png');
    };

    img.crossOrigin = 'anonymous'; // Handle CORS issues
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
      {/* HEADER */}
      <div className="fixed top-1 left-1 p-1 m-2 ">
        <LogoMorpher morphed={morphed} />
      </div>
      
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
                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
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
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
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

              {/* Smart zoom indicator */}
              {isZoomedForPrecision && (
                <div className="zoomIndicator">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" strokeWidth="2"/>
                    <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M11 8v6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 11h6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Precision Zoom 1.3x
                </div>
              )}

              {/* Perspective correction button */}
              <button className="cropButton" onClick={handleCrop}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M3 3l18 0" stroke="currentColor" fill="none" strokeWidth="2"/>
                  <path d="M21 3l-6 18" stroke="currentColor" fill="none" strokeWidth="2"/>
                  <path d="M3 3l6 18" stroke="currentColor" fill="none" strokeWidth="2"/>
                  <path d="M3 21l18 0" stroke="currentColor" fill="none" strokeWidth="2"/>
                </svg>
                Perspective to {active}
              </button>

              {/* Crop area overlay - Enhanced Polygon */}
              <svg 
                className="cropOverlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Semi-transparent overlay to dim outside area */}
                <defs>
                  <mask id="cropMask">
                    <rect width="100" height="100" fill="white"/>
                    <polygon
                      points={`${dotPositions['dot-1'].x},${dotPositions['dot-1'].y} ${dotPositions['dot-2'].x},${dotPositions['dot-2'].y} ${dotPositions['dot-4'].x},${dotPositions['dot-4'].y} ${dotPositions['dot-3'].x},${dotPositions['dot-3'].y}`}
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
                  points={`${dotPositions['dot-1'].x},${dotPositions['dot-1'].y} ${dotPositions['dot-2'].x},${dotPositions['dot-2'].y} ${dotPositions['dot-4'].x},${dotPositions['dot-4'].y} ${dotPositions['dot-3'].x},${dotPositions['dot-3'].y}`}
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
              left: `${dotPositions['dot-1'].x}%`,
              top: `${dotPositions['dot-1'].y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'dot-1')}
            onTouchStart={(e) => handleMouseDown(e, 'dot-1')}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div 
            className="dot dot-2" 
            style={{
              left: `${dotPositions['dot-2'].x}%`,
              top: `${dotPositions['dot-2'].y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'dot-2')}
            onTouchStart={(e) => handleMouseDown(e, 'dot-2')}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div 
            className="dot dot-3" 
            style={{
              left: `${dotPositions['dot-3'].x}%`,
              top: `${dotPositions['dot-3'].y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'dot-3')}
            onTouchStart={(e) => handleMouseDown(e, 'dot-3')}
          >
            <span className="RoundO" />
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
          <div 
            className="dot dot-4" 
            style={{
              left: `${dotPositions['dot-4'].x}%`,
              top: `${dotPositions['dot-4'].y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'dot-4')}
            onTouchStart={(e) => handleMouseDown(e, 'dot-4')}
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
          style={{ display: 'none' }}
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
        <div className="camera" onClick={isCameraMode ? finishCapturing : startCamera}>
          {isCameraMode ? (
            <>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
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
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2 2 4-4" />
          </svg>
          <span>Capture</span>
        </div>
      )}
    </div>
  );
}
