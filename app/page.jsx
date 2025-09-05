"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import Search from "./Search";
import Loading from "./Loading";
import Header from "./Header";
import Footer from "./Footer";
import HeaderInfo from "./HeaderInfo";


export default function Home() {

  const [camera, setCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);

  // Start or stop the camera
  useEffect(() => {
    let stream = null;

    if (isCameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "back" }, audio: false })
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
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

const lastTap = useRef(0);

const handlePointerDown = () => {
  const now = Date.now();
  if (now - lastTap.current < 300) {
    // Double tap detected
    toggleCam();
  }
  lastTap.current = now;
};

  const toggleCam = () => {
    // alert('any')
    setCamera(!camera);
  };

  return (
    <Suspense fallback={<Loading progress={50} />}>
      <div onPointerDown={handlePointerDown} style={{ touchAction: "manipulation" }} className="font-sans flex flex-col items-center justify-between h-[100dvh]">

        <Header />

        <main className="flex flex-col h-screen w-screen justify-center items-center">
          <div className="filters flex flex-col items-center w-[80vw] md:w-[50vw]">
            <div className="search-all-inclusive">

              {camera && (
                <div className="absolute z-50 bottom-0 left-0 w-screen h-[150px] bg-[rgba(0,0,0,.8)] flex flex-col justify-around items-center text-center">
                  <h1 className="text-white text-xxl">Start Camera</h1>
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
        <div className='fixed z-100 top-0 left-0 flex items-center justify-center border border-dashed border-1 border-black'>

          <video ref={videoRef} width="640" height="480" autoPlay />
          <button
                      onClick={() => { setIsCameraOpen(false); setCamera(false); }}
                      className='mt-4 px-6 py-3 rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 transition-colors duration-200'
                    >
                      Close Camera
                    </button>
        </div>
      )}


              <Search />

            </div>


          </div>
            <HeaderInfo/>


        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
