import { useEffect, useRef } from "react";

export default function ChunkedAudioPlayer({ play = false }) {
  const audioRef = useRef(null);

  // Handle play/pause when `play` prop changes
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

  useEffect(() => {
    const audio = audioRef.current;
    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      let start = 0;
      const chunkSize = 500000; // ~0.5MB per chunk (≈1 min depending on bitrate)

      async function fetchChunk() {
        const end = start + chunkSize - 1;
        const resp = await fetch("/audio/malte.mp3", {
          headers: { Range: `bytes=${start}-${end}` },
        });
        const buf = await resp.arrayBuffer();
        sourceBuffer.appendBuffer(buf);
        start += chunkSize;
      }

      // Load first chunk
      await fetchChunk();

      // Fetch more if <60s ahead
      audio.addEventListener("timeupdate", () => {
        if (mediaSource.duration - audio.currentTime < 60) {
          fetchChunk();
        }
      });
    });
  }, []);

  return <audio ref={audioRef} controls />;
}
