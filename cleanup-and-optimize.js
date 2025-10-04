const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const coversDir = './public/covers';
const quality = 75;
const maxWidth = 512;

// Get all image files (excluding already optimized ones)
const imageFiles = fs.readdirSync(coversDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .filter(file => !file.includes('_optimized')); // Skip already processed files

console.log(`🧹 Cleaning up and optimizing ${imageFiles.length} images...`);
console.log('📝 This will OVERWRITE original files with optimized versions');

// First, let's clean up any existing _optimized files
const optimizedFiles = fs.readdirSync(coversDir)
  .filter(file => file.includes('_optimized'));

console.log(`🗑️  Removing ${optimizedFiles.length} temporary _optimized files...`);
optimizedFiles.forEach(file => {
  fs.unlinkSync(path.join(coversDir, file));
  console.log(`   Deleted: ${file}`);
});

// Now process and overwrite originals
let totalOriginalSize = 0;
let totalNewSize = 0;

const processFiles = async () => {
  for (const file of imageFiles) {
    const inputPath = path.join(coversDir, file);
    const tempPath = path.join(coversDir, `temp_${file}.webp`);
    
    try {
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;
      totalOriginalSize += originalSize;
      
      // Create optimized version with temp name
      await sharp(inputPath)
        .resize(maxWidth, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toFile(tempPath);
      
      const newStats = fs.statSync(tempPath);
      const newSize = newStats.size;
      totalNewSize += newSize;
      
      // Remove original and rename temp to original name (but as .webp)
      fs.unlinkSync(inputPath);
      const finalPath = path.join(coversDir, file.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp'));
      fs.renameSync(tempPath, finalPath);
      
      const originalSizeKB = (originalSize / 1024).toFixed(1);
      const newSizeKB = (newSize / 1024).toFixed(1);
      const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
      
      console.log(`✅ ${file} → ${path.basename(finalPath)}: ${originalSizeKB}KB → ${newSizeKB}KB (${savings}% smaller)`);
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      // Clean up temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }
  
  // Show total savings
  const totalOriginalMB = (totalOriginalSize / 1024 / 1024).toFixed(1);
  const totalNewMB = (totalNewSize / 1024 / 1024).toFixed(1);
  const totalSavings = (((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100).toFixed(1);
  
  console.log('\n🎉 OPTIMIZATION COMPLETE!');
  console.log(`📊 Total size: ${totalOriginalMB}MB → ${totalNewMB}MB`);
  console.log(`💾 Total savings: ${totalSavings}% (${(totalOriginalSize - totalNewSize) / 1024 / 1024 | 0}MB freed)`);
  console.log('✨ All images are now optimized WebP files with original names!');
};

processFiles();