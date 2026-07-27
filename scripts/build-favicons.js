const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildFavicons() {
  const rootDir = process.cwd();
  const inputPath = fs.existsSync(path.join(rootDir, 'public/crestoak-logo.png')) 
    ? path.join(rootDir, 'public/crestoak-logo.png') 
    : path.join(rootDir, 'atiba-crestoak-logo.png');
  
  console.log('Using source image:', inputPath);

  // 1. Trim transparent padding from logo
  const trimmedBuffer = await sharp(inputPath).trim().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed dimensions: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // 2. Square canvas with tight 3.5% margin for optimum proportions
  const maxDim = Math.max(trimmedMeta.width, trimmedMeta.height);
  const pad = Math.round(maxDim * 0.035);
  const targetCanvasSize = maxDim + (pad * 2);

  // 3. High quality 1024x1024 master transparent PNG
  // Ensure transparent pixels use 0,0,0,0 alpha
  const masterBuffer = await sharp(trimmedBuffer)
    .resize(targetCanvasSize, targetCanvasSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .resize(1024, 1024, {
      kernel: sharp.kernel.lanczos3
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  console.log('Master transparent 1024x1024 buffer generated.');

  const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    let img = sharp(masterBuffer).resize(size, size, {
      kernel: sharp.kernel.lanczos3
    });
    
    // Adaptive sharpness boost for crispness on small browser tabs
    if (size <= 48) {
      img = img.sharpen({ sigma: 0.6, m1: 0.8, m2: 1.5 });
    }

    pngBuffers[size] = await img.png({ quality: 100 }).toBuffer();
  }

  // Ensure target directories exist
  const publicDir = path.join(rootDir, 'public');
  const appDir = path.join(rootDir, 'src/app');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  // Save PNG files to public/ and src/app/
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), pngBuffers[16]);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngBuffers[32]);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), pngBuffers[48]);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngBuffers[180]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), pngBuffers[192]);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), pngBuffers[512]);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), pngBuffers[512]);
  
  // Next.js App Router conventional files
  fs.writeFileSync(path.join(appDir, 'icon.png'), pngBuffers[512]);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), pngBuffers[180]);

  // Construct binary ICO file containing 16, 32, 48, 64 sizes
  const icoSizes = [16, 32, 48, 64];
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = icoSizes.length;
  
  let dataOffset = headerSize + (dirEntrySize * numImages);
  const dirEntries = [];
  const imageBuffers = [];

  for (const sz of icoSizes) {
    const buf = pngBuffers[sz];
    imageBuffers.push(buf);

    const entry = Buffer.alloc(16);
    entry.writeUInt8(sz, 0); // Width
    entry.writeUInt8(sz, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Size of PNG buffer
    entry.writeUInt32LE(dataOffset, 12); // Offset in file
    
    dirEntries.push(entry);
    dataOffset += buf.length;
  }

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2); // ICO type
  icoHeader.writeUInt16LE(numImages, 4);

  const icoBuffer = Buffer.concat([icoHeader, ...dirEntries, ...imageBuffers]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), icoBuffer);

  // Write site.webmanifest
  const manifest = {
    name: "CrestOak College of Health Sciences, Management & Technology",
    short_name: "CrestOak College",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#1e1b4b",
    background_color: "#ffffff",
    display: "standalone"
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

  console.log('Favicon generation completed!');
  console.log('Transparent PNG icons & ICO files generated with zero background!');
}

buildFavicons().catch((err) => {
  console.error('Error building favicons:', err);
  process.exit(1);
});
