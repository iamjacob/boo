
import { useEffect, useRef, useState } from "react";

export default function ChunkedAudioPlayer({ play = false }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metadata, setMetadata] = useState({ artist: "Unknown Artist", title: "Unknown Title" });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      // Example: set metadata if available
      setMetadata({
        artist: audioRef.current?.getAttribute("data-artist") || "Malte", // hardcoded for now
        title: audioRef.current?.getAttribute("data-title") || "Sample Track"
      });
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (play) {
      audio.play().catch(err => {
        console.warn("Autoplay blocked by browser:", err);
      });
    } else {
      audio.pause();
    }
  }, [play]);

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div style={{ maxWidth: 400, margin: "1em auto", padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <audio
        ref={audioRef}
        controls
        src="/audio/malte.mp3"
        data-artist="Malte"
        data-title="Sample Track"
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: 8 }}>
        <strong>{metadata.title}</strong> <br />
        <span>by {metadata.artist}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <span>Played: {formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <a href="/audio/malte.mp3" target="_blank" rel="noopener noreferrer">Original Clip</a>
      </div>
    </div>
  );
}
