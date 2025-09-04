import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

const useSafeLoader = (url, fallbackUrl = "/apple-touch-icon.png") => {
  const loader = useMemo(() => new THREE.TextureLoader(), []); // ✅ Cache the loader
  const placeholderTexture = useMemo(() => new THREE.Texture(), []); // ✅ Initial placeholder

  const [texture, setTexture] = useState(placeholderTexture);

  useEffect(() => {
    if (!url) {
      loader.load(fallbackUrl, setTexture);
      return;
    }

    loader.load(
      url,
      setTexture, // ✅ Success: Set loaded texture
      undefined,  // ✅ Progress callback (optional)
      () => {
        loader.load(fallbackUrl, setTexture); // ✅ Error: Load fallback texture
      }
    );
  }, [url, fallbackUrl, loader]);

  return texture;
};

export default useSafeLoader;