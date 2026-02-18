import fs from "node:fs";
import path from "node:path";

const assetsDir = path.join(process.cwd(), ".vercel/output/static");
const ignoreFile = path.join(assetsDir, ".assetsignore");

if (!fs.existsSync(assetsDir)) {
  console.error(`prepare-wrangler-assets: assets directory not found: ${assetsDir}`);
  process.exit(1);
}

// Prevent Wrangler from uploading Pages worker internals as public assets.
fs.writeFileSync(ignoreFile, "_worker.js\n", "utf8");
console.log(`prepare-wrangler-assets: wrote ${ignoreFile}`);
