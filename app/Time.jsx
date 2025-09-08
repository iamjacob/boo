'use client'
import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Hent timer og minutter
  let hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");

  // AM/PM logik
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;

  return (
    <div onClick={()=>{alert('sd')}} className="flex pl-1 pr-2 items-center" style={{ fontFamily: "monospace", fontSize: "1.2rem",color:"gray", wordSpacing:'2px' }}>
      <span>{displayHours}:{minutes}</span>{" "}
      <div className="flex flex-col text-[8px] pr-2 pl-[2px] leading-none">

      <span style={{ color: isAM ? "black" : "gray" }}>AM</span>
      <span style={{ color: isAM ? "gray" : "black" }}>PM</span>
      </div>
    </div>
  );
}
