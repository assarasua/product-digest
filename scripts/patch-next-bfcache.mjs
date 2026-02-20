import fs from "node:fs";
import path from "node:path";

const candidates = [
  path.join(process.cwd(), "node_modules/next/dist/client/components/bfcache.js")
];

let patched = 0;

for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const from = "const MAX_BF_CACHE_ENTRIES = process.env.__NEXT_ROUTER_BF_CACHE ? 3 : 1;";
  const to = "const MAX_BF_CACHE_ENTRIES = 1;";

  if (source.includes(to)) {
    patched += 1;
    continue;
  }

  if (!source.includes(from)) {
    continue;
  }

  fs.writeFileSync(filePath, source.replace(from, to), "utf8");
  patched += 1;
}

if (patched > 0) {
  console.log(`patch-next-bfcache: patched ${patched} file(s).`);
} else {
  console.log("patch-next-bfcache: no patch needed.");
}
