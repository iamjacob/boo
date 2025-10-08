"use client";
import { useEffect, useRef } from "react";

export default function Timeline() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const resize = () => {
      canvas.width = window.innerWidth;       // always 100vw
      canvas.height = canvas.parentElement.offsetHeight; // match parent height
    };
    resize();
    window.addEventListener("resize", resize);

    // --- View state ---
    let view = { rotY: 0, scale: 1, offsetX: 0, offsetY: 0, vx: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };
    const SPIN_COEFF = -0.35;

    // --- Spiral params ---
    const startYear = 2014;
    const currentYear = 2025;
    const loops = currentYear - startYear + 1;
    const baseStretch = 40;
    const baseRadius = 80;
    const step = 0.05;

    const yearMs = 365.2425 * 24 * 60 * 60 * 1000;
    const yearToT = (year) => (year - startYear) * 2 * Math.PI;
    const yearStart = (y) => new Date(y, 0, 1).getTime();

    const getColor = (t) => {
      const hue = (t * 180) / Math.PI % 360;
      if (Math.floor(t / Math.PI) % 4 === 0) return "hsl(0,90%,60%)";
      return `hsl(${hue},80%,60%)`;
    };

    // --- Dummy books ---
    const books = [];
    const randomDate = (year) =>
      new Date(year, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
    for (let y = startYear; y <= currentYear; y++) {
      for (let i = 0; i < 3; i++) {
        const d = randomDate(y);
        books.push({
          title: `Book ${y}-${i}`,
          date: d,
          url: `https://example.com/book/${y}-${i}`,
        });
      }
    }

    // --- Projection ---
    function project3D(x, y, z) {
      const cosY = Math.cos(view.rotY),
        sinY = Math.sin(view.rotY);
      const X = x * cosY - z * sinY;
      const Z = z * cosY + x * sinY;
      const Y = y;
      const depth = 1000;
      const scale = 500 / (Z + depth);
      return {
        x: canvas.width / 2 + (X + view.offsetX) * scale,
        y: canvas.height / 2 + (Y + view.offsetY) * scale,
        s: scale,
      };
    }

    // --- Clickable books ---
    let clickableBooks = [];

    // --- Interaction ---
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      view.vx = 0;
    });
    canvas.addEventListener("pointermove", (e) => {
      if (dragging) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          view.rotY += dx * 0.005;
          view.vx = dx * 0.002;
        } else {
          view.offsetY += dy / view.scale;
        }
        last = { x: e.clientX, y: e.clientY };
      }
    });
    canvas.addEventListener("pointerup", () => (dragging = false));
    canvas.addEventListener("pointerleave", () => (dragging = false));

    // wheel zoom
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.001);
        const oldScale = view.scale;
        view.scale = Math.max(0.2, Math.min(20, view.scale * factor));
        const delta = Math.log(view.scale / oldScale);
        view.rotY += SPIN_COEFF * delta;
      },
      { passive: false }
    );

    // --- touch pinch zoom ---
    let lastDist = null;
    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const oldScale = view.scale;
          if (lastDist) {
            const factor = dist / lastDist;
            view.scale = Math.max(0.2, Math.min(20, view.scale * factor));
            const delta = Math.log(view.scale / oldScale);
            view.rotY += SPIN_COEFF * delta;
          }
          lastDist = dist;
        }
      },
      { passive: false }
    );
    canvas.addEventListener("touchend", () => (lastDist = null));

    // double tap reset
    let lastTap = 0;
    canvas.addEventListener("pointerup", () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        view = { rotY: 0, scale: 1, offsetX: 0, offsetY: 0, vx: 0 };
      }
      lastTap = now;
    });

    // click handler for books
    canvas.addEventListener("click", (e) => {
      const x = e.clientX,
        y = e.clientY;
      for (const b of clickableBooks) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          window.open(b.url, "_blank");
          break;
        }
      }
    });

    // --- Draw loop ---
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!dragging) {
        view.rotY += view.vx;
        view.vx *= 0.95;
      }

      const stretch = baseStretch * view.scale;
      const radius = baseRadius * (1 + 0.1 * (view.scale - 1));

      // spiral
      let prev = null;
      for (let t = 0; t <= loops * 2 * Math.PI; t += step) {
        const x = stretch * t - loops * stretch * Math.PI * 0.5;
        const y = radius * Math.sin(t);
        const z = radius * Math.cos(t);
        const p = project3D(x, y, z);
        if (prev) {
          ctx.strokeStyle = getColor(t);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        prev = p;
      }

      // ticks (yearly)
      ctx.fillStyle = "#aaa";
      ctx.font = "12px sans-serif";
      for (let year = startYear; year <= currentYear; year++) {
        const t = yearToT(year);
        const p = project3D(
          stretch * t - loops * stretch * Math.PI * 0.5,
          radius * Math.sin(t),
          radius * Math.cos(t)
        );
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(year, p.x + 6, p.y - 6);
      }

      clickableBooks = [];

      if (view.scale < 2) {
        // cluster mode
        const clusters = {};
        books.forEach((b) => {
          const y = b.date.getFullYear();
          clusters[y] = (clusters[y] || 0) + 1;
        });
        for (const [y, count] of Object.entries(clusters)) {
          const t = yearToT(+y);
          const p = project3D(
            stretch * t - loops * stretch * Math.PI * 0.5,
            radius * Math.sin(t),
            radius * Math.cos(t)
          );
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(count, p.x - 3, p.y + 3);
        }
      } else {
        // detailed book cards
        books.forEach((b) => {
          const y = b.date.getFullYear();
          const t =
            yearToT(y) + ((b.date.getTime() - yearStart(y)) / yearMs) * 2 * Math.PI;
          const p = project3D(
            stretch * t - loops * stretch * Math.PI * 0.5,
            radius * Math.sin(t),
            radius * Math.cos(t)
          );
          const cardX = p.x + 40,
            cardY = p.y - 80,
            cardW = 140,
            cardH = 50;

          ctx.strokeStyle = "#888";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(cardX, cardY + cardH / 2);
          ctx.stroke();

          ctx.fillStyle = "rgba(30,30,30,0.85)";
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.fillText(b.title, cardX + 8, cardY + 20);
          ctx.fillStyle = "#aaa";
          ctx.fillText(b.date.toISOString().slice(0, 10), cardX + 8, cardY + 38);

          clickableBooks.push({ x: cardX, y: cardY, w: cardW, h: cardH, url: b.url });
        });
      }

      requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  

  return (
    <div className="timeline bg-black/20 fixed bottom-0 right-0 z-50 w-screen h-[100px]">

    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100%", // stretch with parent
        display: "block",
      }}
    />
    </div>
  );
}
