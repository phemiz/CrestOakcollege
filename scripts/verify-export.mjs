import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, "../out");

console.log(`[verify-export] Verifying static export in: ${outDir}`);

if (!fs.existsSync(outDir)) {
  console.error(`[verify-export] ERROR: Output directory "${outDir}" does not exist. Run "npm run build" first.`);
  process.exit(1);
}

// 1. Assert required root assets exist
const requiredRootAssets = [
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml"
];

let missingCount = 0;

for (const asset of requiredRootAssets) {
  const assetPath = path.join(outDir, asset);
  if (!fs.existsSync(assetPath)) {
    console.error(`[verify-export] MISSING REQUIRED ROOT ASSET: out/${asset}`);
    missingCount++;
  } else {
    console.log(`[verify-export] ✓ Verified root asset: out/${asset}`);
  }
}

// 2. Recursively find all HTML files in out/
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".html")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(outDir);
console.log(`[verify-export] Found ${htmlFiles.length} HTML files to inspect.`);

// Regex pattern to extract URLs from href, src, or inline string paths
const urlRegex = /(?:src|href)=["']([^"']+)["']|(?:\/|_next\/static\/chunks\/[a-zA-Z0-9_\-]+\.(?:js|css))/g;

const checkedAssets = new Set();
const missingAssets = [];

for (const htmlFile of htmlFiles) {
  const relHtmlPath = path.relative(outDir, htmlFile);
  const content = fs.readFileSync(htmlFile, "utf-8");

  // Extract all src="..." and href="..."
  const matches = content.matchAll(urlRegex);

  for (const match of matches) {
    let rawUrl = match[1] || match[0];
    if (!rawUrl) continue;

    // Clean URL: strip query strings, hashes, and protocol
    let cleanUrl = rawUrl.split("?")[0].split("#")[0];

    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("//") || cleanUrl.startsWith("data:") || cleanUrl.startsWith("mailto:") || cleanUrl.startsWith("tel:")) {
      continue;
    }

    // Only check static assets (under /_next/ or specific static files/extensions)
    const isNextAsset = cleanUrl.startsWith("/_next/") || cleanUrl.includes("_next/static/");
    const isRootAsset = cleanUrl.match(/\.(png|jpg|jpeg|svg|webp|ico|json|webmanifest|txt|xml|css|js)$/i);

    if (!isNextAsset && !isRootAsset) {
      continue;
    }

    // Convert leading slash to relative path from outDir
    const normalizedRelativePath = cleanUrl.startsWith("/") ? cleanUrl.substring(1) : cleanUrl;
    const targetFilePath = path.join(outDir, normalizedRelativePath);

    if (checkedAssets.has(targetFilePath)) {
      continue;
    }
    checkedAssets.add(targetFilePath);

    if (!fs.existsSync(targetFilePath)) {
      missingAssets.push({
        htmlFile: relHtmlPath,
        assetUrl: cleanUrl,
        expectedPath: targetFilePath
      });
    }
  }
}

if (missingAssets.length > 0) {
  console.error(`\n[verify-export] ERROR: Found ${missingAssets.length} missing asset references across HTML files:`);
  for (const missing of missingAssets) {
    console.error(`  - In out/${missing.htmlFile}: missing asset "${missing.assetUrl}" (Expected at: ${missing.expectedPath})`);
  }
  console.error("\n[verify-export] NOTE: If a referenced chunk hash is missing from out/_next/static/chunks/, this indicates a stale HTML cache issue on your host, not a code build error. Clear CDN/host cache after uploading out/.");
  process.exit(1);
} else {
  console.log(`[verify-export] SUCCESS: Checked ${checkedAssets.size} unique asset references across ${htmlFiles.length} HTML files. All assets exist in out/!`);
  process.exit(0);
}
