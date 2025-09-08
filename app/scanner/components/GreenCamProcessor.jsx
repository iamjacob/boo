"use client";
import { useEffect, useRef } from "react";

export default function GreenCamProcessor({ isCameraOpen }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isCameraOpen) return;

    let stream, animationId;

    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }

    function processFrame() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      let src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
      let dst = new cv.Mat();

      cv.imread(canvas, src);                // read frame
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

      // build a green-only image
      let green = new cv.Mat();
      let channels = new cv.MatVector();
      let zero = new cv.Mat.zeros(dst.rows, dst.cols, dst.type());
      channels.push_back(zero);  // R
      channels.push_back(dst);   // G
      channels.push_back(zero);  // B
      cv.merge(channels, green);

      cv.imshow(canvas, green);

      src.delete(); dst.delete(); green.delete(); zero.delete(); channels.delete();

      animationId = requestAnimationFrame(processFrame);
    }

    videoRef.current.onloadedmetadata = () => {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      processFrame();
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [isCameraOpen]);

  return (
    <div className="absolute bottom-22 right-0 m-4 border border-white/50 rounded overflow-hidden">
      {/* Raw webcam is hidden, used only as source */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
      {/* Processed canvas is shown */}
      <canvas ref={canvasRef} style={{ width: 128, height: 96, background: "black" }} />
    </div>
  );
}
