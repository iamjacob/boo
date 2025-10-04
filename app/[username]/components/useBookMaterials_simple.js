import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import useSafeLoader from './useSafeLoader';

// 🚀 Global cache to prevent duplicate loading
const materialCache = new Map();

// 🎨 Color palette for loading states
const LOADING_COLORS = [
  "#ff6b6b", "#ff9f43", "#feca57", "#48ca9f", 
  "#0abde3", "#3742fa", "#9c88ff", "#f876d4",
  "#ff3838", "#ff6348", "#ffd32a", "#05c46b",
  "#0fbcf9", "#3d40d0", "#8c7ae6", "#e056fd"
];

// 🧹 Utility to normalize image paths to WebP (since we optimized them)
const normalizeImagePath = (path) => {
  if (!path) return path;
  // Convert any image extension to .webp
  return path.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, '.webp');
};

export const useBookMaterials = (cover, initialPosition, bookID) => {
  const [isLoading, setIsLoading] = useState(true);

  // 🎨 Get consistent color for this book
  const bookColor = useMemo(() => {
    const positionHash = Math.abs(
      Math.floor(initialPosition[0] * 10 + initialPosition[2] * 10)
    );
    return LOADING_COLORS[positionHash % LOADING_COLORS.length];
  }, [initialPosition]);

  // ⭐ Normalize cover path to WebP format
  const normalizedCover = useMemo(() => normalizeImagePath(cover), [cover]);
  
//   console.log(`🖼️ Book ${bookID || 'NO-ID'} loading cover: ${cover} → ${normalizedCover}`);

  // 📦 Load textures using the working useSafeLoader
  const textures = [
    useSafeLoader("./books/booktextureRotated.webp"),
    useSafeLoader(normalizedCover || "./covers/000.webp"),
    useSafeLoader("./books/booktexture.webp"),
    useSafeLoader("./books/booktexture.webp"),
    useSafeLoader(normalizedCover || "./covers/000.webp"),
    useSafeLoader(normalizedCover || "./covers/000.webp"),
  ];

  // 🎭 Loading materials (wireframe while textures load)
  const loadingMaterials = useMemo(() => {
    return Array(6).fill(null).map(() => 
      new THREE.MeshBasicMaterial({
        color: bookColor,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
  }, [bookColor]);

  // 🖼️ Texture materials
  const textureMaterials = useMemo(() => {
    return textures.map((texture, index) => {
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });
      
      // Smoother covers
      if (index === 1 || index === 4 || index === 5) {
        material.roughness = 0.5;
      }
      
      return material;
    });
  }, [textures]);

  // 🔍 Check loading state (simplified)
  useEffect(() => {
    const checkLoading = () => {
      const allLoaded = textures.every(texture => 
        texture && texture.image && texture.image.complete
      );
      setIsLoading(!allLoaded);
    };

    checkLoading();
    
    // Check periodically for texture loading
    const interval = setInterval(checkLoading, 300);
    
    // Clear when all loaded
    if (!isLoading) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [textures, isLoading]);

  // 📊 Debug logging
//   useEffect(() => {
//     const loadedCount = textures.filter(t => t && t.image && t.image.complete).length;
//     // console.log(`📖 Book ${bookID || 'NO-ID'}: ${loadedCount}/${textures.length} textures loaded, isLoading: ${isLoading}`);
    
//     // if (!isLoading && loadedCount === textures.length) {
//     //   console.log(`🎉 Book ${bookID || 'NO-ID'} fully loaded!`);
//     // }
//   }, [bookID, textures, isLoading]);

  return {
    materials: isLoading ? loadingMaterials : textureMaterials,
    isLoading,
    texturesLoaded: !isLoading,
    bookColor,
  };
};

export default useBookMaterials;