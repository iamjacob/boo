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

// 🔧 Robust texture loader with caching and callback system
const loadTexture = (url, fallbackUrl = "/covers/000.webp", onUpdate = null) => {
  if (textureCache.has(url)) {
    const cached = textureCache.get(url);
    console.log(`⚡ Using cached texture: ${url}`);
    
    // If already loaded and we have a callback, call it
    if (cached.image && cached.image.complete && onUpdate) {
      setTimeout(() => onUpdate(), 0);
    }
    
    return cached;
  }

  console.log(`📥 Loading new texture: ${url}`);
  
  const loader = new THREE.TextureLoader();
  const placeholderTexture = new THREE.Texture();
  
  // Set up the texture in cache immediately
  textureCache.set(url, placeholderTexture);
  
  // Load the texture with robust error handling
  loader.load(
    url,
    (texture) => {
      console.log(`✅ Texture loaded successfully: ${url}`);
      textureCache.set(url, texture);
      // Notify component that texture is ready
      if (onUpdate) onUpdate();
    },
    undefined,
    (error) => {
      console.warn(`⚠️ Failed to load ${url}, trying fallback: ${fallbackUrl}`);
      loader.load(
        fallbackUrl,
        (fallbackTexture) => {
          console.log(`✅ Fallback texture loaded: ${fallbackUrl}`);
          textureCache.set(url, fallbackTexture);
          if (onUpdate) onUpdate();
        },
        undefined,
        (fallbackError) => {
          console.error(`❌ Failed to load fallback ${fallbackUrl}, creating placeholder`);
          // Create a simple colored canvas texture as last resort
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 256;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(0, 0, 256, 256);
          ctx.fillStyle = '#999';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No Image', 128, 128);
          const errorTexture = new THREE.CanvasTexture(canvas);
          textureCache.set(url, errorTexture);
          if (onUpdate) onUpdate();
        }
      );
    }
  );
  
  return placeholderTexture;
};

export const useBookMaterials = (cover, initialPosition, bookID) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // 🎨 Get consistent color for this book based on position
  const bookColor = useMemo(() => {
    const positionHash = Math.abs(
      Math.floor(initialPosition[0] * 10 + initialPosition[2] * 10)
    );
    return LOADING_COLORS[positionHash % LOADING_COLORS.length];
  }, [initialPosition]);

  // 📦 Load textures with caching and callback system
  const textures = useMemo(() => {
    const textureUrls = [
      "./books/booktextureRotated.webp",   // Side spine
      cover || "./covers/000.webp",        // Front cover  
      "./books/booktexture.webp",          // Back
      "./books/booktexture.webp",          // Top  
      cover || "./covers/000.webp",        // Bottom
      cover || "./covers/000.webp",        // Right side
    ];

    return textureUrls.map(url => 
      loadTexture(url, "/covers/000.webp", () => {
        // Force component update when texture loads
        setRefreshKey(prev => prev + 1);
      })
    );
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
      
      // Smoother covers for better appearance
      if (index === 1 || index === 4 || index === 5) {
        material.roughness = 0.5;
      }
      
      return material;
    });
  }, [textures, refreshKey]);

  // 🔍 Check loading state with safety timeout
  const isLoading = useMemo(() => {
    // If timeout reached, consider it loaded (fallback safety)
    if (timeoutReached) {
      console.log(`⏰ Timeout reached for book ${bookID}, considering loaded`);
      return false;
    }
    
    const allLoaded = textures.every(texture => 
      texture && texture.image && texture.image.complete
    );
    return !allLoaded;
  }, [textures, refreshKey, timeoutReached, bookID]);

  // 🔄 Periodic refresh with timeout safety to prevent infinite loading
  useEffect(() => {
    if (isLoading && !timeoutReached) {
      console.log(`🔄 Starting refresh timer for book ${bookID}`);
      
      // Set a timeout to prevent infinite loading (10 seconds max)
      const timeout = setTimeout(() => {
        console.warn(`⏰ Texture loading timeout for book ${bookID}, forcing load complete`);
        setTimeoutReached(true);
      }, 10000);
      
      // Periodic refresh every 300ms (more frequent for responsiveness)
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 300);
      
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [isLoading, timeoutReached, bookID]);

  // 📊 Enhanced debug logging
  useEffect(() => {
    const loadedCount = textures.filter(t => t && t.image && t.image.complete).length;
    const loadingDetails = textures.map((t, i) => ({
      index: i,
      hasTexture: !!t,
      hasImage: !!(t && t.image),
      isComplete: !!(t && t.image && t.image.complete)
    }));
    
    console.log(`📖 Book ${bookID}: ${loadedCount}/${textures.length} textures loaded`, {
      isLoading,
      timeoutReached,
      refreshKey,
      details: loadingDetails
    });
    
    // Log when book finally loads completely
    if (!isLoading && loadedCount === textures.length) {
      console.log(`🎉 Book ${bookID} fully loaded!`);
    }
  }, [bookID, textures, isLoading, refreshKey, timeoutReached]);

  return {
    materials: isLoading ? loadingMaterials : textureMaterials,
    isLoading,
    texturesLoaded: !isLoading,
    bookColor,
  };
};

// 🧹 Utility to clear caches (useful for memory management)
export const clearMaterialCaches = () => {
  console.log('🧹 Clearing material caches...');
  textureCache.clear();
  materialCache.clear();
};

export default useBookMaterials;