// CameraTexturePlane.jsx
// R3F + plain React (no TS). Works in Next.js (client component) or CRA.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Single smart modal that handles all cases
const SmartModal = ({ 
  isOpen, 
  mode, // 'camera-permission', 'mobile-play', 'choose-source'
  onCameraAllow, 
  onCameraDeny, 
  onMobilePlay,
  onChooseCamera,
  onChooseVideo 
}) => {
  if (!isOpen) return null;

  const buttonStyle = (type) => ({
    padding: '0.75rem 1.5rem',
    border: type === 'primary' ? 'none' : '2px solid #ddd',
    backgroundColor: type === 'primary' ? '#007bff' : 'white',
    color: type === 'primary' ? 'white' : '#666',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: type === 'primary' ? 'bold' : 'normal'
  });

  const modalContent = () => {
    switch (mode) {
      case 'choose-source':
        return {
          title: '📹 Choose Video Source',
          content: 'Would you like to use your camera or play a sample video?',
          buttons: (
            <>
              <button onClick={onChooseVideo} style={buttonStyle('secondary')}>
                📁 Sample Video
              </button>
              <button onClick={onChooseCamera} style={buttonStyle('primary')}>
                � Use Camera
              </button>
            </>
          )
        };
      
      case 'camera-permission':
        return {
          title: '📹 Camera Access Required',
          content: 'This feature requires access to your camera. Your privacy is important - the video is only processed locally on your device.',
          buttons: (
            <>
              <button onClick={onCameraDeny} style={buttonStyle('secondary')}>
                Cancel
              </button>
              <button onClick={onCameraAllow} style={buttonStyle('primary')}>
                Allow Camera
              </button>
            </>
          )
        };
      
      case 'mobile-play':
        return {
          title: '▶️ Tap to Play Video',
          content: 'Mobile browsers require user interaction to play videos',
          buttons: (
            <button onClick={onMobilePlay} style={buttonStyle('primary')}>
              Play Video
            </button>
          )
        };
      
      default:
        return null;
    }
  };

  const content = modalContent();
  if (!content) return null;

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
          {content.title}
        </h3>
        <p style={{ margin: '0 0 2rem 0', color: '#666', lineHeight: '1.5' }}>
          {content.content}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {content.buttons}
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
  useLocalVideo = null,   // null = ask user, true = force video, false = force camera
  videoSrc = "./assets/video/sampleVideo.mp4", // local video file path
  onReady,                // (video, stream) => void
}) {
  const meshRef = useRef();
  const [videoEl, setVideoEl] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null
  });
  const [actualVideoSource, setActualVideoSource] = useState(useLocalVideo);
  const [userApprovedCamera, setUserApprovedCamera] = useState(false);

  // Determine what to show on mount
  useEffect(() => {
    if (useLocalVideo === null) {
      // Ask user to choose
      setModalState({ isOpen: true, mode: 'choose-source' });
    } else if (useLocalVideo === false) {
      // Camera mode - show permission modal
      setModalState({ isOpen: true, mode: 'camera-permission' });
    } else {
      // Video mode - proceed directly
      setActualVideoSource(true);
    }
  }, [useLocalVideo]);

  // Create a hidden <video> element once on mount
  useEffect(() => {
    const v = document.createElement("video");
    v.autoplay = true;
    v.muted = muted;
    v.playsInline = playsInline; // iOS Safari needs this
    v.setAttribute("webkit-playsinline", "true");
    v.setAttribute("playsinline", "true");
    
    if (isMobile()) {
      v.controls = false;
      v.preload = "metadata";
    }
    
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

  // Start video/camera after all approvals
  useEffect(() => {
    if (!videoEl) return;
    if (actualVideoSource === null) return; // Still deciding
    if (actualVideoSource === false && !userApprovedCamera) return; // Camera not approved
    
    let canceled = false;

    (async () => {
      try {
        if (actualVideoSource) {
          // Local video
          videoEl.src = videoSrc;
          videoEl.loop = true;
          
          const onVideoReady = () => {
            console.log("Video ready, dimensions:", videoEl.videoWidth, "x", videoEl.videoHeight);
            setVideoReady(true);
            onReady?.(videoEl, null);
          };
          
          videoEl.addEventListener("loadedmetadata", onVideoReady, { once: true });
          
          try {
            await videoEl.play();
            console.log("Video playing successfully");
          } catch (playError) {
            console.log("Autoplay failed, likely needs user interaction:", playError);
            if (isMobile()) {
              setModalState({ isOpen: true, mode: 'mobile-play' });
            }
          }
        } else {
          // Camera
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Camera not supported in this browser");
            return;
          }
          
          const constraints = {
            audio: false,
            video: {
              facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("Camera stream obtained:", stream);
          if (canceled) return;
          
          videoEl.srcObject = stream;
          
          const onCameraReady = () => {
            console.log("Camera video ready, dimensions:", videoEl.videoWidth, "x", videoEl.videoHeight);
            setVideoReady(true);
            onReady?.(videoEl, stream);
          };
          videoEl.addEventListener("loadedmetadata", onCameraReady, { once: true });
          
          try {
            await videoEl.play();
            console.log("Camera playing successfully");
          } catch (playError) {
            console.log("Camera autoplay failed:", playError);
            if (isMobile()) {
              setModalState({ isOpen: true, mode: 'mobile-play' });
            }
          }
        }
      } catch (err) {
        console.error("Video/Camera error:", err);
      }
    })();

    return () => { 
      canceled = true; 
    };
  }, [videoEl, actualVideoSource, userApprovedCamera, facingMode, videoSrc, onReady]);

  // Modal handlers
  const handleChooseCamera = () => {
    setModalState({ isOpen: true, mode: 'camera-permission' });
    setActualVideoSource(false);
  };

  const handleChooseVideo = () => {
    setModalState({ isOpen: false, mode: null });
    setActualVideoSource(true);
  };

  const handleCameraAllow = () => {
    setModalState({ isOpen: false, mode: null });
    setUserApprovedCamera(true);
  };

  const handleCameraDeny = () => {
    setModalState({ isOpen: false, mode: null });
    setActualVideoSource(true); // Fallback to video
  };

  const handleMobilePlay = async () => {
    if (videoEl) {
      try {
        await videoEl.play();
        console.log("Mobile video playing after user interaction");
        setModalState({ isOpen: false, mode: null });
      } catch (error) {
        console.error("Failed to play after user interaction:", error);
      }
    }
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
      <SmartModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        onChooseCamera={handleChooseCamera}
        onChooseVideo={handleChooseVideo}
        onCameraAllow={handleCameraAllow}
        onCameraDeny={handleCameraDeny}
        onMobilePlay={handleMobilePlay}
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
