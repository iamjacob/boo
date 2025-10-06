/**
 * Extract dominant colors AND pixel positions from book cover image
 * Returns colors with percentages AND pixel position data
 */
export const extractBookColorsAndPixels = async (imageUrl, maxColors = 8) => {
  return new Promise((resolve) => {
    // Create canvas for analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size (reasonable resolution for particles)
      const maxSize = 150; // Reduced for performance but enough detail
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract colors and pixel positions
        const colorResult = extractColors(data, maxColors);
        const pixelData = extractPixelPositions(data, canvas.width, canvas.height);
        const palette = createParticleColorPalette(colorResult);
        
        resolve({
          colors: colorResult,
          palette: palette,
          pixelData: pixelData
        });
      } catch (error) {
        console.warn('Could not extract colors and pixels from image:', error);
        // Fallback
        resolve({
          colors: [
            { color: [1.0, 0.4, 0.1], percentage: 0.4 },
            { color: [0.2, 0.6, 1.0], percentage: 0.3 },
            { color: [1.0, 0.9, 0.3], percentage: 0.3 }
          ],
          palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
          pixelData: null
        });
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load image for color extraction:', imageUrl);
      // Fallback
      resolve({
        colors: [
          { color: [1.0, 0.4, 0.1], percentage: 0.4 },
          { color: [0.2, 0.6, 1.0], percentage: 0.3 },
          { color: [1.0, 0.9, 0.3], percentage: 0.3 }
        ],
        palette: [[1.0, 0.4, 0.1], [0.2, 0.6, 1.0], [1.0, 0.9, 0.3]],
        pixelData: null
      });
    };
    
    img.src = imageUrl;
  });
};

// Extract pixel positions and colors for particle placement
const extractPixelPositions = (imageData, width, height) => {
  const pixels = [];
  const step = 2; // Sample every 2nd pixel for performance
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      
      // Only include visible pixels
      if (a > 50) { // Some alpha threshold
        pixels.push({
          x: (x - width / 2) / 50, // Normalize and center
          y: -(y - height / 2) / 50, // Invert Y and center
          z: 0, // Flat on book surface
          color: [r / 255, g / 255, b / 255]
        });
      }
    }
  }
  
  return pixels;
};

const extractColors = (imageData, maxColors) => {
  const colorMap = new Map();
  const step = 4; // Process every 4th pixel for speed
  
  // Sample pixels and quantize colors
  for (let i = 0; i < imageData.length; i += step * 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Quantize colors to reduce noise (group similar colors)
    const quantR = Math.floor(r / 32) * 32;
    const quantG = Math.floor(g / 32) * 32;
    const quantB = Math.floor(b / 32) * 32;
    
    const colorKey = `${quantR},${quantG},${quantB}`;
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  }
  
  // Convert to array and sort by frequency
  const colorArray = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return {
        color: [r / 255, g / 255, b / 255], // Normalize to 0-1
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors); // Take top colors
  
  // Calculate percentages
  const totalCount = colorArray.reduce((sum, item) => sum + item.count, 0);
  return colorArray.map(item => ({
    color: item.color,
    percentage: item.count / totalCount
  }));
};

// Get book cover image URL from bookData
export const getBookCoverUrl = (bookData) => {
  // Handle cover as string or object
  if (bookData?.cover) {
    if (typeof bookData.cover === 'string') {
      return bookData.cover;
    }
    // Handle cover as object with front property
    if (typeof bookData.cover === 'object' && bookData.cover.front) {
      return bookData.cover.front;
    }
  }
  
  // Try different possible cover paths
  const possiblePaths = [
    `/covers/${bookData?.id}.jpg`,
    `/covers/${bookData?.isbn}.jpg`,
    `/books/${bookData?.id}/cover.jpg`,
    bookData?.thumbnail,
    bookData?.image
  ];
  
  for (const path of possiblePaths) {
    if (path && typeof path === 'string') return path;
  }
  
  return null;
};

// Generate color palette for particles
export const createParticleColorPalette = (extractedColors) => {
  if (!extractedColors || extractedColors.length === 0) {
    // Default fallback palette
    return [
      [1.0, 0.4, 0.1], // Orange
      [0.2, 0.6, 1.0], // Blue
      [1.0, 0.9, 0.3]  // Yellow
    ];
  }
  
  // Enhance colors for particle effect (make them more vibrant)
  return extractedColors.map(({ color }) => {
    const [r, g, b] = color;
    
    // Boost saturation and brightness for particle glow
    const enhanced = enhanceColorForParticles(r, g, b);
    return enhanced;
  });
};

const enhanceColorForParticles = (r, g, b) => {
  // Convert to HSV for easier manipulation
  const [h, s, v] = rgbToHsv(r, g, b);
  
  // Boost saturation and brightness
  const newS = Math.min(1.0, s * 1.3); // Increase saturation
  const newV = Math.min(1.0, v * 1.2); // Increase brightness
  
  // Convert back to RGB
  return hsvToRgb(h, newS, newV);
};

// Color space conversion utilities
const rgbToHsv = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h /= 6;
  if (h < 0) h += 1;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return [h, s, v];
};

const hsvToRgb = (h, s, v) => {
  const c = v * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = v - c;
  
  let r, g, b;
  if (h < 1/6) [r, g, b] = [c, x, 0];
  else if (h < 2/6) [r, g, b] = [x, c, 0];
  else if (h < 3/6) [r, g, b] = [0, c, x];
  else if (h < 4/6) [r, g, b] = [0, x, c];
  else if (h < 5/6) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  
  return [r + m, g + m, b + m];
};