"use client";
import { useEffect, useRef, useState } from "react";

const CONFIG = {
  MIN_X: 8,
  HANDLE_WIDTH: 30,
  MAX_RADIUS: 220,
  SWIPE_THRESHOLD: 0.45,
  ANIMATION_DURATION: 350,
};

export default function BubbleSwipe() {
  const wrapRef = useRef(null);
  const handleRef = useRef(null);
  const bubbleRef = useRef(null);
  const panelRef = useRef(null);
  const animationFrame = useRef(null);

  const [dimensions, setDimensions] = useState({ W: 320, H: 180 });
  const [currentX, setCurrentX] = useState(CONFIG.MIN_X);
  const dragging = useRef(false);
  const startX = useRef(0);

  const maxX = dimensions.W - CONFIG.HANDLE_WIDTH;

  const physicalPosToViewBoxX = (px) => {
    const rect = wrapRef.current.getBoundingClientRect();
    return (px / rect.width) * dimensions.W;
  };

  const updateBubbleFromHandle = (px) => {
    const viewX = physicalPosToViewBoxX(px);
    bubbleRef.current.setAttribute("cx", Math.max(0, Math.min(dimensions.W, viewX)));
    const t = (px - CONFIG.MIN_X) / (maxX - CONFIG.MIN_X);
    const r = Math.max(0, Math.min(CONFIG.MAX_RADIUS, t * CONFIG.MAX_RADIUS));
    bubbleRef.current.setAttribute("r", r);
  };

  const setHandlePosition = (px) => {
    const clamped = Math.max(CONFIG.MIN_X, Math.min(maxX, px));
    setCurrentX(clamped);
    handleRef.current.style.left = clamped + "px";
    updateBubbleFromHandle(clamped);
  };

  const animateHandleTo = (targetPx) => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    const start = currentX;
    const dist = targetPx - start;
    const dur = CONFIG.ANIMATION_DURATION;
    let t0 = null;

    const step = (ts) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;
      const p = Math.min(1, elapsed / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setHandlePosition(start + dist * ease);
      if (p < 1) animationFrame.current = requestAnimationFrame(step);
    };
    animationFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (wrapRef.current) {
        const { width, height } = wrapRef.current.getBoundingClientRect();
        setDimensions({ W: width, H: height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    setHandlePosition(CONFIG.MIN_X);

    const handle = handleRef.current;
    const onDown = (e) => {
      dragging.current = true;
      startX.current = e.clientX;
      handle.setPointerCapture(e.pointerId);
      handle.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - startX.current;
      setHandlePosition(currentX + dx);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      handle.style.cursor = "grab";
      const shouldOpen = currentX > maxX * CONFIG.SWIPE_THRESHOLD;
      if (shouldOpen) animateHandleTo(maxX);
      else animateHandleTo(CONFIG.MIN_X);
    };

    handle.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      handle.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", updateDimensions);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [currentX, maxX]);

  return (
    <div style={styles.wrap}>
      <div ref={wrapRef} style={styles.panelWrap}>
        <div ref={panelRef} style={styles.panel}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 6px" }}>Secret panel</h3>
            <p style={{ margin: 0, opacity: 0.95 }}>
              Swipe the handle to the right to "bubble in" this panel.
            </p>
          </div>
        </div>

        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-valuemin={CONFIG.MIN_X}
          aria-valuemax={maxX}
          aria-valuenow={currentX}
          style={{ ...styles.handle, left: currentX }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setHandlePosition(currentX + 10);
            if (e.key === "ArrowLeft") setHandlePosition(currentX - 10);
          }}
        >
          ☰
        </div>
        <div
          style={{
            ...styles.hint,
            opacity: currentX > maxX * CONFIG.SWIPE_THRESHOLD ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          Swipe →
        </div>

        <svg
          viewBox={`0 0 ${dimensions.W} ${dimensions.H}`}
          preserveAspectRatio="none"
          style={styles.svg}
        >
          <defs>
            <mask id="mask">
              <rect width="100%" height="100%" fill="black" />
              <circle
                cx="36"
                cy={dimensions.H / 2}
                r="0"
                fill="white"
                ref={bubbleRef}
                style={{
                  transition: "r 450ms cubic-bezier(.22,1,.36,1)",
                }}
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="white"
            mask="url(#mask)"
            opacity="0"
          />
        </svg>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f1724",
    fontFamily: "system-ui, Segoe UI, Roboto",
  },
  panelWrap: {
    position: "relative",
    width: 320,
    height: 180,
  },
  panel: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    background: "linear-gradient(135deg,#06b6d4, #0ea5a4)",
    color: "white",
    padding: 20,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#06b6d4",
    boxShadow: "0 6px 18px rgba(2,6,23,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00303b",
    userSelect: "none",
    touchAction: "none",
    cursor: "grab",
  },
  hint: {
    position: "absolute",
    left: 64,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,.85)",
    fontWeight: 600,
  },
  svg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
};