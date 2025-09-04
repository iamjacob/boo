import React, { useState, useRef, useEffect } from 'react';

function CameraComponent() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);

  // Start or stop the camera
  useEffect(() => {
    let stream = null;

    if (isCameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
        });
    }

    // Cleanup: Stop the stream when the component unmounts or camera is closed
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen]);

  const handleDoubleClick = () => {
    setIsCameraOpen(!isCameraOpen);
  };

  return (
    <div>
      <div
        onDoubleClick={handleDoubleClick}
        style={{
          width: '200px',
          height: '100px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid #ccc',
        }}
      >
        Double-click to {isCameraOpen ? 'close' : 'open'} camera
      </div>

      {isCameraOpen && (
        <div style={{ marginTop: '20px' }} className='absolute border border-dashed border-1 border-black'>
          <video ref={videoRef} width="640" height="480" autoPlay />
        </div>
      )}
    </div>
  );
}

export default CameraComponent;