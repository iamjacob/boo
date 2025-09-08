"use client";
import { useEffect, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
  CameraControls,
  Gltf,
  useGLTF,
} from "@react-three/drei";
// import BooksStand from "./components/BooksStand";
import ScannerOverlay from "./components/ScannerOverlay";
import { useRouter } from "next/navigation"; // eller "next/router" afhængig af version
import BoooksFull from "../BoooksFull";
import * as THREE from "three";
import GreenCamProcessor from "./components/GreenCamProcessor";
// import { useControls } from "leva";

const stepTexts = [
  "Front",
  "Spine",
  "Back",
  "Pages"
];

function CameraStep({ step }) {
  const { camera } = useThree();


    // Leva controls for camera position and rotation
  // const { posX, posY, posZ, rotX, rotY, rotZ } = useControls("Camera", {
  //   posX: { value: 0, min: -5, max: 5, step: 0.01 },
  //   posY: { value: 0, min: -5, max: 5, step: 0.01 },
  //   posZ: { value: 1, min: -10, max: 10, step: 0.01 },
  //   rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  //   rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  //   rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  // });

  const target = useRef({
    position: [0, 0, 1],
    rotation: [0, 0, 0],
    lookAt: [0, 0, 0],
  });

  useEffect(() => {
    const positions = [
      [-0.6, 0.25, 0.70],      // Forside
      [-0.8, 0, 0],    // Side
      [-0.5, -0.1, -0.8],      // Bagside
      [1.75, 0, 0],      // Pages
    ];
    const rotations = [
      [-0.2,-0.8, -0.2],      // Forside
      [-0.2, -0.5, -0.3], // Side (example: rotate a bit)
      [-0.2, -2.3, 0],      // Bagside
      [0, 1.5, 0],      // Pages
    ];
    const lookAts = [
      [0, 0, 0],      // Center
      [0.5, 0, 0],    // Side
      [0, 0, 0],      // Center
      [0, 0, 0],      // Center
    ];
    target.current.position = positions[step];
    target.current.rotation = rotations[step];
    target.current.lookAt = lookAts[step];
  }, [step]);

  useFrame(() => {
    // // Lerp position
    camera.position.lerp(
      new THREE.Vector3(...target.current.position),
      0.1
    );
    // Lerp rotation (Euler angles)
    camera.rotation.x += (target.current.rotation[0] - camera.rotation.x) * 0.1;
    camera.rotation.y += (target.current.rotation[1] - camera.rotation.y) * 0.1;
    camera.rotation.z += (target.current.rotation[2] - camera.rotation.z) * 0.1;
    // Lerp lookAt (optional, but usually just set once)
    camera.lookAt(...target.current.lookAt);
    camera.updateProjectionMatrix();

    /* LEVA */
    // camera.position.set(posX, posY, posZ);
    // camera.rotation.set(rotX, rotY, rotZ);
    // camera.updateProjectionMatrix();
  });

  return null;
}

const page = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  // const [isBookOpenPage, setIsBookOpen] = useState(false);
  const [isDJOpen, setIsDJOpen] = useState(false);
  const [isDJ, setIsDJ] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();


  // Skift step med knap
const [step, setStep] = useState(0);
  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

useEffect(()=>{
  if(step ===3){
     setIsBookOpen(1)
  }else{

  }
},[step])

  // Example progress value for demo
  //const [progress, setProgress] = useState(0.5);


//   // Smoothly zooms camera to z=3 when zoomActive is true
//   function SmoothZoom({ zoomActive }) {
//     const { camera } = useThree();
//     const targetZ = zoomActive ? 1 : 5; // 5 is default, 3 is zoomed in

//     useFrame(() => {
//       camera.position.z += (targetZ - camera.position.z) * 0.1; // lerp
//       camera.updateProjectionMatrix();
//     });

//     return null;
//   }

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

  return (
    <>
      <header className="absolute flex justify-between top-0 left-0 w-full p-4 bg-black/10 bg-opacity-50 text-white text-center z-50">
                      <BoooksFull width="80px" height="30px" />

        {/* <h1 className="text-2xl font-bold">Camera Scanner</h1> */}
        <button
         onClick={() => {
                router.push("/"); // user said no
              }}
className='text-white font-bold shadow-lg cursor-pointer'
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
      </header>

      <Canvas
        className="fixed top-0 left-0 w-full h-full bg-gray-900"
        camera={{ position: [0, 0, 5], fov: 75 }}
      >
        {/* <BooksStand /> */}
        <ScannerOverlay isBookOpen={isBookOpen} isDJOpen={isDJOpen} isDJ={isDJ} />
        <CameraStep step={step} />

        <OrbitControls />
        <Stars />

        {/* <AuraFogCloud progress={50} /> */}

        {/* <SmoothZoom zoomActive={isCameraOpen} /> */}
      </Canvas>

      {/* <button
  onClick={() => {
    // bruger sagde nej til kamera
    router.push("/"); // send tilbage til home
  }}
>
  No thanks
</button> */}
      {!isCameraOpen && (
        <div className="absolute z-50 bottom-0 left-0 w-screen h-[150px] bg-[rgba(0,0,0,.8)] flex flex-col justify-around items-center text-center">
          <h1 className="text-white text-xxl">Start Camera</h1>
          <div className="flex justify-around w-[200px]">
            <button
              onClick={() => {
                router.push("/"); // user said no
              }}
              className="px-4 py-2 rounded-full bg-white/50 border border-2 border-white/50"
            >
              Next time
            </button>
            <button
              onClick={() => {
                setIsCameraOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-white border border-2 border-white"
            >
              Now
            </button>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <>
          <div
            className="fixed z-100 top-26 right-0 flex items-center justify-center border border-dashed border-1 border-black rounded overflow-hidden border-white/50 border-2"
            style={{
              width: "128px",
              height: "96px",
              margin: "20px",
              backgroundColor: "#000",
            }}
          >
            <video
              ref={videoRef}
              width="128"
              height="96"
              // src={"./assets/SampleVideo.mp4"}
              autoPlay
              muted
            />
          </div>

        {/* {isCameraOpen && <GreenCamProcessor isCameraOpen={isCameraOpen} />} */}
                           
                        
<div style={{
        position: "absolute",
        top: 80,
        left: 0,
        heigh: "50%",
        textAlign: "center",
        fontSize: "2rem",
        color: "white",
        pointerEvents: "none"
      }}>
        <h1 className="text-white text mb-2">Scan</h1>

        {step === 0 && 
        <div className="step1">一 {step === 0 ? <b>{stepTexts[0]}</b> : 'forside'}</div>
        }
        {step === 1 && 
        <div className="step2">二 {step === 1 ? <b>{stepTexts[1]}</b> : 'Siden'}</div>
        }
        {step === 2 && 
        <div className="step3">三 {step === 2 ? <b>{stepTexts[2]}</b> : 'Bagsiden'}</div>
        }
        {step === 3 && 
        <div className="step3">三 {step === 3 ? <b>{stepTexts[3]}</b> : 'Sider'}</div>
        }
        </div>

<aside className="fixed z-50 top-[40dvh] m-4 left-0 pointer-events-none select-none flex">

      <div className="bg-white/50 rounded-full  py-4 px-2 left-0 pointer-events-none select-none"   >
        
        <div className="step1">一</div>
        <div className="step2">二</div>
        <div className="step3">三</div>
        <div className="step3">|||</div>
        {/* {stepTexts[step]} */}
      </div>
<div className="py-4 px-2">
        <div className={`step1 text-gray-500 ${step === 0 ? 'active text-white' : ''}`}>{step === 0 ? <b>{stepTexts[0]}</b> : 'forside'}</div>
        <div className={`step2 text-gray-500 ${step === 1 ? 'active text-white' : ''}`}>{step === 1 ? <b>{stepTexts[1]}</b> : 'Siden'}</div>
        <div className={`step3 text-gray-500 ${step === 2 ? 'active text-white' : ''}`}>{step === 2 ? <b>{stepTexts[2]}</b> : 'Bagsiden'}</div>
        <div className={`step3 text-gray-500 ${step === 3 ? 'active text-white' : ''}`}>{step === 3 ? <b>{stepTexts[3]}</b> : 'Side'} xx</div>

</div>
</aside>

      <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center", gap: "20px" }}>
        <button onClick={prevStep} disabled={step === 0}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg></button>
       
       <div className="flex flex-col">
        <button onClick={()=>{setIsBookOpen(!isBookOpen)}} className="text-white">{isBookOpen ? 'CLOSE':'OPEN'}</button>
        <button onClick={()=>{setIsDJOpen(!isDJOpen)}} className="text-white">DJ {isDJOpen ? 'CLOSE':'OPEN'}</button>
        <button onClick={()=>{setIsDJ(!isDJ)}} className="text-white">DJ {isDJ ? 'NO':'YES'}</button>
       </div>
        
        <button onClick={nextStep} disabled={step === 4}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg></button>
      </div>
        </>
      )}
    </>
  );
};

export default page;
