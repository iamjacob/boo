'use client'
import { useEffect } from "react";
export default function Dashboard() {
    useEffect(() => {
      const splash = document.getElementById("splash");
  
      if (splash) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col md:flex-row gap-4">
      {/* Analytics Box */}
      <div className="flex-1 bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Analytics</h2>
        <p className="text-gray-600 mb-4 text-center">
          Shows high-level insights and trends over time.
        </p>
        {/* Simple Line Graph */}
        <svg width="100%" height="100" viewBox="0 0 100 100">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points="0,80 20,60 40,70 60,40 80,50 100,30"
          />
        </svg>
      </div>

      {/* Statistics Box */}
      <div className="flex-1 bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <p className="text-gray-600 mb-4 text-center">
          Raw numbers and metrics displayed visually.
        </p>
        {/* Simple Bar Graph */}
        <svg width="100%" height="100" viewBox="0 0 100 100">
          <rect x="5" y="60" width="10" height="40" fill="#10b981" />
          <rect x="20" y="40" width="10" height="60" fill="#10b981" />
          <rect x="35" y="50" width="10" height="50" fill="#10b981" />
          <rect x="50" y="30" width="10" height="70" fill="#10b981" />
          <rect x="65" y="45" width="10" height="55" fill="#10b981" />
          <rect x="80" y="20" width="10" height="80" fill="#10b981" />
        </svg>
      </div>
    </div>
  );
}
