import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

const useSafeLoader = (url, fallbackUrl = "/covers/test.jpg") => {
  const loader = useMemo(() => new THREE.TextureLoader(), []); // ✅ Cache the loader
  const placeholderTexture = useMemo(() => new THREE.Texture(), []); // ✅ Initial placeholder

  const [texture, setTexture] = useState(placeholderTexture);

  useEffect(() => {
    if (!url) {
      console.log("No URL provided, using fallback.");
      loader.load(fallbackUrl, setTexture);

      return;
    }

    loader.load(
      url,
      setTexture, // ✅ Success: Set loaded texture
      undefined,  // ✅ Progress callback (optional)
      (err) => {
        console.error(
          `useSafeLoader: Failed to load texture from ${url}. Using fallback: ${fallbackUrl}`
        );
        loader.load(fallbackUrl, setTexture);
      }
    );
  }, [url, fallbackUrl, loader]);

  return texture;
};

export default useSafeLoader;