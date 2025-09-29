// CameraTexturePlane.jsx
// R3F + plain React (no TS). Works in Next.js (client component) or CRA.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function CameraTexturePlane({
  width = 2,              // world units for the plane
  height,                 // auto from video aspect if not provided
  facingMode = "environment", // "user" for front cam
  muted = true,
  playsInline = true,
  mirror = false,         // flip X for front camera selfies
  useLocalVideo = false,  // switch to use local video instead of camera
  videoSrc = "./assets/video/sampleVideo.mp4", // local video file path
  onReady,                // (video, stream) => void
}) {
  const meshRef = useRef();
  const [videoEl, setVideoEl] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  // Create a hidden <video> element once on mount
  useEffect(() => {
    const v = document.createElement("video");
    v.autoplay = true;
    v.muted = muted;
    v.playsInline = playsInline; // iOS Safari needs this
    v.setAttribute("webkit-playsinline", "true");
    setVideoEl(v);
    return () => {
      // stop all tracks on unmount (for camera streams)
      if (v.srcObject) {
        for (const track of v.srcObject.getTracks()) track.stop();
      }
      v.srcObject = null;
      // clear src for local video
      v.src = "";
    };
  }, [muted, playsInline]);

  // Start the camera or load local video
  useEffect(() => {
    if (!videoEl) return;
    let canceled = false;

    (async () => {
      try {
        if (useLocalVideo) {
          // Use local video file
          videoEl.src = videoSrc;
          videoEl.loop = true; // Loop local video by default
          const onCanPlay = () => {
            setVideoReady(true);
            onReady?.(videoEl, null); // no stream for local video
          };
          videoEl.addEventListener("loadedmetadata", onCanPlay, { once: true });
          await videoEl.play().catch(() => {});
        } else {
          // Use camera
          const constraints = {
            audio: false,
            video: {
              facingMode,         // try rear camera
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (canceled) return;
          videoEl.srcObject = stream;
          // ensure play() is called (may need a user gesture in some browsers)
          await videoEl.play().catch(() => {});
          const onCanPlay = () => {
            setVideoReady(true);
            onReady?.(videoEl, stream);
          };
          videoEl.addEventListener("loadedmetadata", onCanPlay, { once: true });
        }
      } catch (err) {
        console.error(useLocalVideo ? "Local video error:" : "getUserMedia error:", err);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [videoEl, facingMode, onReady, useLocalVideo, videoSrc]);

  // Build a THREE.VideoTexture when the <video> is ready
  const texture = useMemo(() => {
    if (!videoReady || !videoEl) return null;
    const tex = new THREE.VideoTexture(videoEl);
    tex.colorSpace = THREE.SRGBColorSpace; // correct color
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    // Many phone cameras deliver mirrored front cam. You can control it:
    if (mirror) {
      tex.center.set(0.5, 0.5);
      tex.repeat.set(-1, 1); // flip X
    }
    return tex;
  }, [videoReady, videoEl, mirror]);

  // Keep updating the texture each frame (cheap—VideoTexture auto-updates, but this is safe)
  useFrame(() => {
    if (texture) texture.needsUpdate = true;
  });

  // Compute plane size from the video aspect if height not given
  const planeSize = useMemo(() => {
    if (!videoReady || !videoEl) return [width, width * (9 / 16)];
    const vw = videoEl.videoWidth || 16;
    const vh = videoEl.videoHeight || 9;
    const aspect = vw / vh;
    const h = height ?? width / aspect;
    return [width, h];
  }, [videoReady, videoEl, width, height]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={planeSize} />
      {/* Use a basic material so the video isn't affected by lights */}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
