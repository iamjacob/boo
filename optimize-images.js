const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const coversDir = './public/covers';
const quality = 75;
const maxWidth = 512;

// Get all image files
const imageFiles = fs.readdirSync(coversDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

console.log(`Found ${imageFiles.length} images to optimize...`);

imageFiles.forEach(async (file) => {
  const inputPath = path.join(coversDir, file);
  const outputPath = path.join(coversDir, file.replace(/\.(jpg|jpeg|png|webp)$/i, '_optimized.webp'));
  
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = (stats.size / 1024).toFixed(1);
    
    await sharp(inputPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSize = (newStats.size / 1024).toFixed(1);
    const savings = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);
    
    console.log(`✅ ${file}: ${originalSize}KB → ${newSize}KB (${savings}% smaller)`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});