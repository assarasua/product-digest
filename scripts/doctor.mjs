import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const lockFile = path.join(cwd, "package-lock.json");
const requiredMajor = 22;
const nextDir = path.join(cwd, ".next");

function fail(message) {
  console.error(`doctor: ${message}`);
  process.exit(1);
}

const major = Number(process.versions.node.split(".")[0]);
if (major !== requiredMajor) {
  fail(`Node ${process.versions.node} is unsupported. Expected ${requiredMajor}.x.`);
}

if (!fs.existsSync(lockFile)) {
  fail("package-lock.json is missing. Run npm install to generate a deterministic lockfile.");
}

if (fs.existsSync(nextDir)) {
  const nextFiles = fs.readdirSync(nextDir);
  const suspicious = nextFiles.filter((name) => /\s\d+\./.test(name) || name.includes(" 2."));

  if (!nextFiles.includes("package.json") || suspicious.length > 0) {
    const msg = "detected inconsistent .next artifacts. Run `npm run clean:next` and retry.";
    if (process.env.DOCTOR_STRICT === "1") {
      fail(msg);
    }
    console.warn(`doctor: ${msg}`);
  }
}

// Detect stale Next processes; strict mode fails fast to prevent hangs.
const ps = spawnSync("sh", ["-lc", "ps -ax -o command | rg \"next build|next dev|next start|npm run dev|npm run start|npm exec next\""], {
  encoding: "utf8"
});

if (ps.status === 0 && ps.stdout.trim()) {
  if (process.env.DOCTOR_STRICT === "1") {
    fail("detected active Next.js/npm processes. Run `npm run kill:next` and retry.");
  }
  console.warn("doctor: detected active Next.js/npm processes. If build hangs, run `npm run kill:next` first.");
}

const contentCheck = spawnSync("node", ["scripts/check-content.mjs"], { stdio: "inherit" });
if (contentCheck.status !== 0) {
  fail("content validation failed.");
}

console.log("doctor: environment checks passed.");
