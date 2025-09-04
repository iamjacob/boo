"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import Search from "./Search";
import Loading from "./Loading";
import Header from "./Header";
import Footer from "./Footer";

export default function Home() {

  const [camera, setCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);

  // Start or stop the camera
  useEffect(() => {
    let stream = null;

    if (isCameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }

    // Cleanup: Stop the stream when the component unmounts or camera is closed
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen]);


  useEffect(() => {
    const splash = document.getElementById("splash");

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 800);
    }
  }, []);

  const toggleCam = () => {
    // alert('any')
    setCamera(!camera);
  };

  return (
    <Suspense fallback={<Loading progress={50} />}>
      <div className="font-sans flex flex-col items-center justify-between h-screen">

        <Header />

        <main className="flex flex-col h-screen w-screen justify-around items-center">
          <div className="filters flex flex-col items-center w-[80vw] md:w-[50vw]">
            <div className="search-all-inclusive">

              <div className="btn text-center" onClick={toggleCam}>
                (0)
              </div>

              {camera && (
                <div className="absolute top-0 left-0 w-screen h-[150px] bg-[rgba(0,0,0,.8)] flex flex-col justify-around items-center text-center">
                  <h1 className="text-white text-xl">Start Camera</h1>
                  <div className="flex justify-around w-[200px]">
                    <button
                      onClick={toggleCam}
                      className="px-4 py-2 rounded-full bg-white/50 border border-2 border-white/50"
                    >
                      Next time
                    </button>
                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="px-4 py-2 rounded-full bg-white border border-2 border-white"
                    >
                      Now
                    </button>
                  </div>
                </div>
              )}

              {isCameraOpen && (
        <div style={{ marginTop: '20px' }} className='absolute border border-dashed border-1 border-black'>
          <video ref={videoRef} width="640" height="480" autoPlay />
        </div>
      )}


              <Search />
            </div>
          </div>


        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
