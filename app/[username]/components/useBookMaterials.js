import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

// 🚀 Global texture cache to prevent duplicate loading across all books
const textureCache = new Map();
const materialCache = new Map();

// 🎨 Color palette for loading states
const LOADING_COLORS = [
  "#ff6b6b", "#ff9f43", "#feca57", "#48ca9f", 
  "#0abde3", "#3742fa", "#9c88ff", "#f876d4",
  "#ff3838", "#ff6348", "#ffd32a", "#05c46b",
  "#0fbcf9", "#3d40d0", "#8c7ae6", "#e056fd"
];

// 🔧 Simplified texture loader that works like the original useSafeLoader but with caching
const loadTexture = (url, fallbackUrl = "/covers/000.webp") => {
  if (textureCache.has(url)) {
    console.log(`⚡ Using cached texture: ${url}`);
    return textureCache.get(url);
  }

  console.log(`📥 Loading new texture: ${url}`);
  
  const loader = new THREE.TextureLoader();
  const placeholderTexture = new THREE.Texture();
  
  // Set up the texture in cache immediately
  textureCache.set(url, placeholderTexture);
  
  // Load the texture
  loader.load(
    url,
    (texture) => {
      console.log(`✅ Texture loaded successfully: ${url}`);
      textureCache.set(url, texture);
      // Texture will automatically update in materials due to reference
    },
    undefined,
    (error) => {
      console.warn(`⚠️ Failed to load ${url}, trying fallback: ${fallbackUrl}`);
      loader.load(
        fallbackUrl,
        (fallbackTexture) => {
          console.log(`✅ Fallback texture loaded: ${fallbackUrl}`);
          textureCache.set(url, fallbackTexture);
        },
        undefined,
        (fallbackError) => {
          console.error(`❌ Failed to load fallback ${fallbackUrl}`);
          // Create a simple colored canvas texture
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 256;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(0, 0, 256, 256);
          ctx.fillStyle = '#999';
          ctx.font = '20px Arial';
          ctx.fillText('No Image', 80, 130);
          const errorTexture = new THREE.CanvasTexture(canvas);
          textureCache.set(url, errorTexture);
        }
      );
    }
  );
  
  return placeholderTexture;
};

export const useBookMaterials = (cover, initialPosition, bookID) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // 🎨 Get consistent color for this book based on position
  const bookColor = useMemo(() => {
    const positionHash = Math.abs(
      Math.floor(initialPosition[0] * 10 + initialPosition[2] * 10)
    );
    return LOADING_COLORS[positionHash % LOADING_COLORS.length];
  }, [initialPosition]);

  // 📦 Load textures with caching
  const textures = useMemo(() => {
    const textureUrls = [
      "./books/booktextureRotated.webp",   // Side spine
      cover || "./covers/000.webp",        // Front cover  
      "./books/booktexture.webp",          // Back
      "./books/booktexture.webp",          // Top  
      cover || "./covers/000.webp",        // Bottom
      cover || "./covers/000.webp",        // Right side
    ];

    return textureUrls.map(url => loadTexture(url));
  }, [cover]);

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
  }, [textures, refreshKey]);

  // 🔍 Check loading state
  const isLoading = useMemo(() => {
    const allLoaded = textures.every(texture => 
      texture && texture.image && texture.image.complete
    );
    return !allLoaded;
  }, [textures, refreshKey]);

  // 🔄 Periodic refresh to check texture loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // � Debug logging
  useEffect(() => {
    const loadedCount = textures.filter(t => t && t.image && t.image.complete).length;
    console.log(`📖 Book ${bookID}: ${loadedCount}/${textures.length} textures loaded, isLoading: ${isLoading}`);
  }, [bookID, textures, isLoading]);

  return {
    materials: isLoading ? loadingMaterials : textureMaterials,
    isLoading,
    texturesLoaded: !isLoading,
    bookColor,
  };
};

// 🧹 Utility to clear caches
export const clearMaterialCaches = () => {
  console.log('🧹 Clearing material caches...');
  textureCache.clear();
  materialCache.clear();
};

export default useBookMaterials;

