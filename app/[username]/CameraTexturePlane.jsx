// CameraTexturePlane.jsx
// R3F + plain React (no TS). Works in Next.js (client component) or CRA.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Camera Permission Modal Component
const CameraPermissionModal = ({ isOpen, onAllow, onDeny }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
          📹 Camera Access Required
        </h3>
        <p style={{ margin: '0 0 2rem 0', color: '#666', lineHeight: '1.5' }}>
          This feature requires access to your camera to display live video. 
          Your privacy is important - the video is only processed locally on your device.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onDeny}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAllow}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Allow Camera
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [userApprovedCamera, setUserApprovedCamera] = useState(false);

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

  // Check if we need to show camera permission modal
  useEffect(() => {
    if (!useLocalVideo && videoEl && !userApprovedCamera) {
      setShowCameraModal(true);
    }
  }, [useLocalVideo, videoEl, userApprovedCamera]);

  // Start the camera or load local video
  useEffect(() => {
    if (!videoEl) return;
    if (!useLocalVideo && !userApprovedCamera) return; // Wait for user approval for camera
    
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
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Camera not supported in this browser");
            return;
          }
          
          const constraints = {
            audio: false,
            video: {
              facingMode,         // try rear camera
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("Camera stream obtained:", stream);
          if (canceled) return;
          videoEl.srcObject = stream;
          
          const onCanPlay = () => {
            console.log("Camera video ready, dimensions:", videoEl.videoWidth, "x", videoEl.videoHeight);
            setVideoReady(true);
            onReady?.(videoEl, stream);
          };
          videoEl.addEventListener("loadedmetadata", onCanPlay, { once: true });
          
          // ensure play() is called (may need a user gesture in some browsers)
          await videoEl.play().catch(() => {});
        }
      } catch (err) {
        console.error(useLocalVideo ? "Local video error:" : "getUserMedia error:", err);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [videoEl, facingMode, onReady, useLocalVideo, videoSrc, userApprovedCamera]);

  // Handle camera permission modal actions
  const handleAllowCamera = () => {
    setShowCameraModal(false);
    setUserApprovedCamera(true);
  };

  const handleDenyCamera = () => {
    setShowCameraModal(false);
    setUserApprovedCamera(false);
    // Optionally fallback to local video or show a message
    console.log("User denied camera access");
  };

  // Build a THREE.VideoTexture when the <video> is ready
  const texture = useMemo(() => {
    if (!videoReady || !videoEl) {
      console.log("Texture not ready:", { videoReady, videoEl: !!videoEl });
      return null;
    }
    console.log("Creating texture for video:", videoEl.videoWidth, "x", videoEl.videoHeight);
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

  return (
    <>
      <CameraPermissionModal
        isOpen={showCameraModal}
        onAllow={handleAllowCamera}
        onDeny={handleDenyCamera}
      />
      {texture && (
        <mesh ref={meshRef}>
          <planeGeometry args={planeSize} />
          {/* Use a basic material so the video isn't affected by lights */}
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}
