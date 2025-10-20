"use client";
import React, { useEffect, useState } from "react";
import "./ScannerUI.css";
import ProgressBars from "./ProgressBars";
import Book from "../[username]/components/Book";
import { Canvas } from "@react-three/fiber";
import OpenBook from "../[username]/openbook/OpenBook";
import { OrbitControls } from "@react-three/drei";

export default function ScannerUI() {
  const [inputMethod, setInputMethod] = useState("manual");
  const [depth, setDepth] = useState("Standard");
  const [showDepthPanel, setShowDepthPanel] = useState(false);
  

  const toggleInput = (method) => setInputMethod(method);

  // Splash screen removal
  useEffect(() => {
    const splash = document.getElementById("splash");
    // will be added to a global loader later
    // header get.content lenghth from fetch
    // read length content-length
    // const header = document.getElementById("header");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 1200);
    }
  }, []);

  return (
    <>
      <header className="glass">
        <div className="input-method">
          <div className="method-toggle">
            <button
              className={`method-btn ${
                inputMethod === "manual" ? "active" : ""
              }`}
              onClick={() => toggleInput("manual")}
            >
              Manual
            </button>
            <button
              className={`method-btn ${inputMethod === "scan" ? "active" : ""}`}
              onClick={() => toggleInput("scan")}
            >
              Scan
            </button>
          </div>
        </div>

        {/* <div className="status-line">
          <span className="current">1</span>
          <span>of</span>
          <span>3</span>
        </div> */}

        <div className="scan-depth-container">
          <button
            id="depthToggle"
            className="depth-toggle"
            onClick={() => setShowDepthPanel(!showDepthPanel)}
          >
            <span>{depth}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div
            id="depthPanel"
            className={`depth-panel ${showDepthPanel ? "" : "hidden"}`}
          >
            {["Quick", "Standard", "Complete"].map((option) => (
              <div
                key={option}
                className={`depth-option ${depth === option ? "active" : ""}`}
                onClick={() => {
                  setDepth(option);
                  setShowDepthPanel(false);
                }}
              >
                <h4>{option.toUpperCase()}</h4>
                <p>
                  {option === "Quick"
                    ? "Essential information only"
                    : option === "Standard"
                    ? "Balanced cataloging"
                    : "Full archival detail"}
                </p>
                <small>
                  {option === "Quick"
                    ? "6 fields • ~2 min"
                    : option === "Standard"
                    ? "12 fields • ~5 min"
                    : "22 fields • ~12 min"}
                </small>
              </div>
            ))}
          </div>
        </div>
      </header>

{/* <Canvas>

<OpenBook />
<ambientLight intensity={0.5} />
<OrbitControls />
</Canvas> */}

      <main>
        {inputMethod === "manual" ? (
          <div id="manualForm">
            <h2>Manual Entry</h2>
            {/*<p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" />      <h2>Manual Entry</h2>
            <p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" />      <h2>Manual Entry</h2>
            <p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" />      <h2>Manual Entry</h2>
            <p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" />      <h2>Manual Entry</h2>
            <p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" />      <h2>Manual Entry</h2>
            <p>Type book info here...</p>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Author" /> */}
          </div>
        ) : (
          <div id="cameraView" className="agreeCameraScreen">
            <h2>Scan Mode</h2>
            <p>Camera or simulated scan view goes here...</p>
          </div>
        )}
      </main>


<ProgressBars />

      <footer className="glass">
        <div>
          <button className="btn btn-secondary" disabled>
            ← Back
          </button>
          <button className="btn btn-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></button>
        </div>

        <button className="btn btn-primary">Next →</button>
      </footer>
    </>
  );
}
