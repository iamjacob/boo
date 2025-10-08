"use client";
import { useEffect, useRef, useState } from "react";
import booksData from "./boooks.json"; // your real JSON file

export default function Timeline() {
  const canvasRef = useRef(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [infoBox, setInfoBox] = useState(null); // For pointer down info box

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // --- View state ---
    let view = { scale: 1, offsetX: 0, offsetY: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };
    let autoCenter = true; // Flag to auto-center the spiral

    // --- Timeline setup - Focus on current year ---
    const startYear = 2010;
    const currentYear = 2025;
    const focusYear = 2025; // Always focus on current year
    const loops = currentYear - startYear + 1;
    const baseStretch = 40;
    const baseRadius = 80;
    const step = 0.05;

    const yearMs = 365.2425 * 24 * 60 * 60 * 1000;
    const yearToT = (year) => (year - startYear) * 2 * Math.PI;
    const yearStart = (y) => new Date(y, 0, 1).getTime();

    // 🌀 GOAL: Regional seasonal colors for the spiral timeline
    
    // 1. Detect user's region and season mode
    const detectSeasonMode = () => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Northern temperate zones
        if (timeZone.includes('America/') && !timeZone.includes('America/Argentina') && 
            !timeZone.includes('America/Chile') && !timeZone.includes('America/Uruguay')) {
          return 'north_temperate';
        }
        if (timeZone.includes('Europe/') || timeZone.includes('Asia/') && 
            !timeZone.includes('Asia/Singapore') && !timeZone.includes('Asia/Jakarta')) {
          return 'north_temperate';
        }
        
        // Southern temperate zones
        if (timeZone.includes('Australia/') || timeZone.includes('Antarctica/') ||
            timeZone.includes('America/Argentina') || timeZone.includes('America/Chile') ||
            timeZone.includes('America/Uruguay')) {
          return 'south_temperate';
        }
        
        // Tropical zones
        if (timeZone.includes('Pacific/') && (timeZone.includes('Fiji') || timeZone.includes('Tahiti')) ||
            timeZone.includes('Asia/Singapore') || timeZone.includes('Asia/Jakarta') ||
            timeZone.includes('America/') && (timeZone.includes('Costa_Rica') || timeZone.includes('Panama'))) {
          return 'tropical';
        }
        
        // Monsoon zones (South/Southeast Asia)
        if (timeZone.includes('Asia/') && (timeZone.includes('Mumbai') || timeZone.includes('Delhi') ||
            timeZone.includes('Bangkok') || timeZone.includes('Manila') || timeZone.includes('Dhaka'))) {
          return 'monsoon';
        }
        
        // Subtropical (Indian subcontinent traditional)
        if (timeZone.includes('Asia/Kolkata') || timeZone.includes('Asia/Delhi')) {
          return 'subtropical';
        }
        
        // Default to north temperate
        return 'north_temperate';
      } catch (e) {
        return 'north_temperate';
      }
    };

    // 2. Define seasonal color palettes
    const seasonSets = {
      north_temperate: [
        "hsl(120,60%,55%)", // Spring - Green
        "hsl(45,90%,60%)",  // Summer - Yellow
        "hsl(15,80%,55%)",  // Autumn - Orange
        "hsl(210,70%,65%)"  // Winter - Blue
      ],
      south_temperate: [
        "hsl(210,70%,65%)", // Winter (Dec-Feb)
        "hsl(15,80%,55%)",  // Autumn (Mar-May) 
        "hsl(45,90%,60%)",  // Summer (Jun-Aug)
        "hsl(120,60%,55%)"  // Spring (Sep-Nov)
      ],
      tropical: [
        "hsl(180,80%,60%)", // Dry season - Cyan
        "hsl(45,90%,60%)"   // Wet season - Yellow
      ],
      monsoon: [
        "hsl(0,80%,55%)",   // Pre-monsoon - Red
        "hsl(200,80%,60%)", // Monsoon - Blue
        "hsl(100,50%,50%)"  // Post-monsoon - Green
      ],
      subtropical: [
        "hsl(100,60%,50%)", // Vasant (Spring)
        "hsl(50,80%,55%)",  // Grishma (Summer)
        "hsl(200,70%,55%)", // Varsha (Monsoon)
        "hsl(20,80%,60%)",  // Sharad (Autumn)
        "hsl(40,60%,55%)",  // Shishir (Pre-winter)
        "hsl(210,70%,65%)"  // Shita (Winter)
      ]
    };

    // 3. Get active colors based on detected region
    const seasonMode = detectSeasonMode();
    const activeColors = seasonSets[seasonMode];

    // 4. Helper function to get seasonal color
    const getSeasonColor = (t, colors) => {
      const yearFrac = (t % (2 * Math.PI)) / (2 * Math.PI);
      const colorIndex = Math.floor(yearFrac * colors.length) % colors.length;
      return colors[colorIndex];
    };

    // --- Resonance Colors ---
    const getResonanceColor = (book) => {
      const tag = (book.tags?.[0] || "").toLowerCase();
      if (tag.includes("psychology")) return "hsl(200,80%,60%)";
      if (tag.includes("philosophy")) return "hsl(50,80%,60%)";
      if (tag.includes("science")) return "hsl(120,80%,60%)";
      if (tag.includes("data")) return "hsl(330,80%,60%)";
      if (tag.includes("politics")) return "hsl(10,80%,60%)";
      return "hsl(180,40%,60%)";
    };

    // --- Book data ---
    const books = booksData.map((b) => ({
      ...b,
      date: new Date(b.dateAdded || b.dateStarted || "2014-01-01"),
    }));

    // --- Projection (2D side view) ---
    function project2D(x, y) {
      return {
        x: canvas.width / 2 + (x + view.offsetX) * view.scale,
        y: canvas.height / 2 + (y + view.offsetY) * view.scale,
        s: view.scale,
      };
    }

    // --- Interactions - Only horizontal panning ---
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      autoCenter = false; // Disable auto-centering when user starts dragging
      last = { x: e.clientX, y: e.clientY };
      
      // Check if clicking on a book to show info box
      const x = e.clientX, y = e.clientY;
      for (const b of clickableBooks) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          setInfoBox({
            book: b.book,
            x: e.clientX,
            y: e.clientY
          });
          break;
        }
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (dragging) {
        const dx = e.clientX - last.x;
        // Only allow horizontal panning
        view.offsetX += dx / view.scale;
        last = { x: e.clientX, y: e.clientY };
      } else {
        // Handle hover effects
        const x = e.clientX, y = e.clientY;
        let foundHover = null;
        for (const b of clickableBooks) {
          if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            foundHover = b.book;
            break;
          }
        }
        setHoveredBook(foundHover);
      }
    });
    canvas.addEventListener("pointerup", () => {
      dragging = false;
      setInfoBox(null); // Hide info box when releasing
    });
    canvas.addEventListener("pointerleave", () => {
      dragging = false;
      setHoveredBook(null);
      setInfoBox(null);
    });

    // --- Wheel zoom with stricter limits ---
    let targetScale = 1;
    const ease = 0.1;
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.001);
        // Stricter zoom limits to prevent over-stretching
        targetScale = Math.max(0.3, Math.min(3, targetScale * factor));
      },
      { passive: false }
    );

    // --- Touch pinch zoom with stricter limits ---
    let lastDist = null;
    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          if (lastDist) {
            const factor = dist / lastDist;
            // Stricter zoom limits to prevent over-stretching
            targetScale = Math.max(0.3, Math.min(3, view.scale * factor));
          }
          lastDist = dist;
        }
      },
      { passive: false }
    );
    canvas.addEventListener("touchend", () => (lastDist = null));

    // --- Clickable books ---
    let clickableBooks = [];
    canvas.addEventListener("click", (e) => {
      const x = e.clientX,
        y = e.clientY;
      for (const b of clickableBooks) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          console.log("📚 Book clicked:", {
            title: b.book.title,
            author: b.book.author,
            dateAdded: b.book.dateAdded,
            categories: b.book.categories,
            tags: b.book.tags,
            year: b.book.year,
            pages: b.book.pages,
            cover: b.book.cover,
            fullBookData: b.book
          });
          setSelectedBook(b.book);
          break;
        }
      }
    });

    // --- Draw loop ---
    function draw() {
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#050509");
      bg.addColorStop(1, "#0f1022");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth zoom
      view.scale += (targetScale - view.scale) * ease;

      // Calculate spiral dimensions - reverse 'hug' spiral that always fits height
      const stretch = baseStretch * view.scale;
      // Dynamic radius that shrinks with zoom to always fit container height
      const maxRadius = canvas.height * 0.35; // Base radius
      const radiusScaleFactor = Math.max(0.5, 1 / Math.sqrt(view.scale)); // Inverse scaling
      const radius = maxRadius * radiusScaleFactor; // Always fits in container

      // Auto-center on the current year (2025) when not manually panning
      if (autoCenter) {
        const focusYearT = yearToT(focusYear);
        const focusPosition = stretch * focusYearT - loops * stretch * Math.PI * 0.5;
        const targetCenterX = -focusPosition; // Center the focus year
        view.offsetX += (targetCenterX - view.offsetX) * 0.1;
        view.offsetY = 0; // Always keep vertically centered
      }

      // Reverse 'hug' spiral with regional seasonal colors
      let prev = null;
      for (let t = 0; t <= loops * 2 * Math.PI; t += step) {
        const x = stretch * t - loops * stretch * Math.PI * 0.5;
        // Reverse the spiral direction for 'hug' effect
        const y = -radius * Math.sin(t); // Negative for reverse direction
        const p = project2D(x, y);

        if (prev) {
          const color = getSeasonColor(t, activeColors);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        prev = p;
      }

      clickableBooks = [];

      // Year markers at bottom of each spiral loop (Math.PI/2 for bottom)
      ctx.font = "bold 16px sans-serif";
      for (let year = startYear; year <= currentYear; year++) {
        const t = yearToT(year);
        // Position year marker at bottom of spiral (sin(t) = 1, so t = π/2)
        const yearBottomT = t + Math.PI / 2;
        const p = project2D(
          stretch * yearBottomT - loops * stretch * Math.PI * 0.5,
          -radius * Math.sin(yearBottomT) // Negative for reverse direction
        );
        
        // Year background circle
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
        grd.addColorStop(0, "rgba(0,0,0,0.9)");
        grd.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Year text
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(year, p.x, p.y);
        
        // Regional season indicators
        if (view.scale > 1.5) {
          activeColors.forEach((color, index) => {
            const seasonOffset = (index / activeColors.length) * 2 * Math.PI;
            const seasonT = t + seasonOffset;
            const sp = project2D(
              stretch * seasonT - loops * stretch * Math.PI * 0.5,
              -radius * Math.sin(seasonT)
            );
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Add season labels based on region
            const seasonNames = {
              north_temperate: ['Spr', 'Sum', 'Aut', 'Win'],
              south_temperate: ['Win', 'Aut', 'Sum', 'Spr'],
              tropical: ['Dry', 'Wet'],
              monsoon: ['Pre', 'Mon', 'Post'],
              subtropical: ['Vas', 'Gri', 'Var', 'Sha', 'Shi', 'Sit']
            };
            
            ctx.fillStyle = "#fff";
            ctx.font = "9px sans-serif";
            ctx.fillText(seasonNames[seasonMode][index] || `S${index + 1}`, sp.x, sp.y - 15);
          });
        }
      }

      // --- Book nodes ---
      // Always show individual books as squares with hover effects and larger sizing
      books.forEach((b) => {
        const y = b.date.getFullYear();
        const t =
          yearToT(y) +
          ((b.date.getTime() - yearStart(y)) / yearMs) * 2 * Math.PI;
        const p = project2D(
          stretch * t - loops * stretch * Math.PI * 0.5,
          -radius * Math.sin(t) // Negative for reverse direction
        );

        // Larger responsive book cover size with hover effect
        const minSize = 16;   // Minimum size when zoomed out (increased)
        const maxSize = 80;   // Maximum size when zoomed in (increased)
        const baseSize = 24;  // Base size at 1x zoom (increased)
        const scaleFactor = Math.pow(view.scale, 0.8);
        let size = Math.max(minSize, Math.min(maxSize, baseSize * scaleFactor));
        
        // Hover effect - make hovered book bigger
        const isHovered = hoveredBook && hoveredBook.id === b.id;
        if (isHovered) {
          size *= 1.3; // 30% bigger when hovered
        }
        
        // Draw square book cover
        ctx.save();
        
        // Enhanced shadow for hover
        const shadowIntensity = isHovered ? 20 : Math.max(4, 12 * (size / maxSize));
        ctx.shadowBlur = shadowIntensity;
        ctx.shadowColor = isHovered ? "rgba(255,255,255,0.8)" : getResonanceColor(b);
        
        // Draw square background with hover glow
        if (isHovered) {
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(p.x - size / 2 - 2, p.y - size / 2 - 2, size + 4, size + 4);
        }
        
        ctx.fillStyle = getResonanceColor(b);
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        
        // Enhanced border with hover effect
        ctx.strokeStyle = isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)";
        ctx.lineWidth = isHovered ? Math.max(2, size / 15) : Math.max(0.5, size / 20);
        ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
        
        // Try to load and draw book cover image as square
        const img = new Image();
        img.src = b.cover?.front || "/covers/default.webp";
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
        }
        
        ctx.restore();

        clickableBooks.push({
          x: p.x - size / 2,
          y: p.y - size / 2,
          w: size,
          h: size,
          book: b,
        });
      });

      requestAnimationFrame(draw);
    }
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

 useEffect(() => {
    const splash = document.getElementById("splash");
    // will be added to a global loader later
    // header get.content lenghth from fetch 
    // read length content-length 
    // const header = document.getElementById("header");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);


  return (
    <div className="timeline fixed bottom-0 right-0 z-50 w-screen h-[200px] bg-black/20">
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100%", display: "block" }}
      />

      {/* Zoom slider with updated range */}
      <input
        type="range"
        min="0.3"
        max="3"
        step="0.01"
        defaultValue="1"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2"
        onInput={(e) => {
          const val = parseFloat(e.target.value);
          targetScale = val;
        }}
      />

      {/* Quick Info Box on Pointer Down */}
      {infoBox && (
        <div
          className="fixed bg-black/90 text-white p-3 rounded-lg shadow-xl border border-white/30 z-[90] pointer-events-none backdrop-blur-sm"
          style={{
            left: Math.min(infoBox.x + 10, window.innerWidth - 300),
            top: Math.max(infoBox.y - 100, 10),
            maxWidth: '280px'
          }}
        >
          <h3 className="font-bold text-lg mb-2 text-yellow-300">{infoBox.book.title}</h3>
          {infoBox.book.author && (
            <p className="text-sm text-blue-300 mb-2">by {infoBox.book.author}</p>
          )}
          
          <div className="text-xs space-y-1">
            <p><span className="text-gray-400">Added:</span> {new Date(infoBox.book.dateAdded).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'short'
            })}</p>
            
            {infoBox.book.year && (
              <p><span className="text-gray-400">Published:</span> {infoBox.book.year}</p>
            )}
            
            {infoBox.book.pages && (
              <p><span className="text-gray-400">Pages:</span> {infoBox.book.pages}</p>
            )}
            
            {infoBox.book.rating && (
              <p><span className="text-gray-400">Rating:</span> {'⭐'.repeat(infoBox.book.rating)}</p>
            )}
          </div>
          
          {infoBox.book.tags && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {infoBox.book.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="bg-purple-600/40 px-2 py-0.5 rounded text-xs">
                    #{tag}
                  </span>
                ))}
                {infoBox.book.tags.length > 4 && (
                  <span className="text-xs text-gray-400">+{infoBox.book.tags.length - 4} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Large Book popup for detailed reading */}
      {selectedBook && (
        <div
          className="fixed inset-4 bg-black/95 text-white rounded-xl shadow-2xl border border-white/30 flex z-[100] backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
        >
          <div className="flex w-full h-full p-8 gap-8">
            {/* Book Cover */}
            <div className="flex-shrink-0 w-1/3 max-w-[400px]">
              <img
                src={selectedBook.cover?.front}
                alt={selectedBook.title}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Book Details */}
            <div className="flex-1 overflow-y-auto">
              <h1 className="text-4xl font-bold mb-4 leading-tight">{selectedBook.title}</h1>
              
              {selectedBook.author && (
                <h2 className="text-2xl text-blue-300 mb-6 font-medium">by {selectedBook.author}</h2>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-yellow-300">Details</h3>
                  <p className="mb-2"><span className="font-medium">Added:</span> {new Date(selectedBook.dateAdded).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}</p>
                  {selectedBook.year && <p className="mb-2"><span className="font-medium">Published:</span> {selectedBook.year}</p>}
                  {selectedBook.pages && <p className="mb-2"><span className="font-medium">Pages:</span> {selectedBook.pages}</p>}
                  {selectedBook.rating && (
                    <p className="mb-2"><span className="font-medium">Rating:</span> {'⭐'.repeat(selectedBook.rating)} ({selectedBook.rating}/5)</p>
                  )}
                  {selectedBook.status && <p className="mb-2"><span className="font-medium">Status:</span> {selectedBook.status}</p>}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Categories</h3>
                  {selectedBook.categories?.main && (
                    <div className="mb-2">
                      <span className="font-medium">Main:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBook.categories.main.map((cat, i) => (
                          <span key={i} className="bg-blue-600/30 px-2 py-1 rounded text-sm">{cat}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedBook.categories?.sub && (
                    <div className="mb-2">
                      <span className="font-medium">Sub:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBook.categories.sub.map((cat, i) => (
                          <span key={i} className="bg-purple-600/30 px-2 py-1 rounded text-sm">{cat}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBook.tags && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2 text-pink-300">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBook.tags.map((tag, i) => (
                      <span key={i} className="bg-pink-600/30 px-3 py-1 rounded-full text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">Click anywhere to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// 'use client'
// import { useMemo, useEffect } from 'react'
// import { Line, OrbitControls } from '@react-three/drei'
// import { Canvas } from '@react-three/fiber'
// import books from './books.json'



// function ResonanceWave({ books, length = 100 }) {
//   // Generate points:
//   const points = useMemo(() => {
//     const pts = []
//     for (let t = 0; t < length; t++) {
//       let x = t / (length - 1) // normalized time 0-1
//       let y = 0
//       books.forEach(book => {
//         // map book to wave params
//         const A = book.impact || 1
//         const f = book.freq || 1
//         const phase = book.phase || 0
//         // optionally weight by proximity to book startTime
//         y += A * Math.sin(2 * Math.PI * f * (x - book.startTime) + phase)
//       })
//       pts.push([x * 10, y, 0]) // scale x,y to scene
//     }
//     return pts
//   }, [books, length])

//   return <Line points={points} color="hotpink" lineWidth={2} />
// }


// const Page = () => {
//   const books = [
//     { startTime: 0, impact: 1, freq: 1, phase: 0 },
//     { startTime: 0.5, impact: 0.5, freq: 2, phase: Math.PI / 2 },
//   ]


//   useEffect(() => {
//     const splash = document.getElementById("splash");
//     // will be added to a global loader later
//     // header get.content lenghth from fetch 
//     // read length content-length 
//     // const header = document.getElementById("header");
//     if (splash) {
//       splash.classList.add("fade-out");
//       setTimeout(() => splash.remove(), 1200);
//     }
//   }, []);

//   return (
//     <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} />
//       <ResonanceWave books={books} length={200} />
//         <OrbitControls />
//     </Canvas>   
//   )
// }

// export default Page