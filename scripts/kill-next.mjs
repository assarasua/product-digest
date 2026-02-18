import { spawnSync } from "node:child_process";

// Limit to Next/npm build-dev-start processes, avoid broad process kills.
const pattern = "next build|next dev|next start|node .*next|npm run dev|npm run start|npm exec next";
const pkill = spawnSync("pkill", ["-f", pattern], { encoding: "utf8" });

if (!pkill.error && (pkill.status === 0 || pkill.status === 1)) {
  // pkill exits non-zero when there are no matches; treat as success.
  if (pkill.stdout?.trim()) {
    console.log(pkill.stdout.trim());
  }
  process.exit(0);
}

if (!pkill.error || pkill.error.code !== "ENOENT") {
  const reason = pkill.stderr?.trim() || "unknown error";
  console.warn(`pkill failed (${reason}), trying lsof fallback for common local ports.`);
}

const fallbackPorts = ["3000", "3001", "3002", "5173", "5174"];
let killed = 0;

for (const port of fallbackPorts) {
  const lsof = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
    encoding: "utf8"
  });

  if (lsof.error || lsof.status !== 0 || !lsof.stdout.trim()) {
    continue;
  }

  const pids = [...new Set(lsof.stdout.split("\n").map((pid) => pid.trim()).filter(Boolean))];
  for (const pid of pids) {
    const killedResult = spawnSync("kill", ["-TERM", pid], { stdio: "ignore" });
    if (killedResult.status === 0) {
      killed += 1;
    }
  }
}

if (killed > 0) {
  console.log(`Fallback cleanup: terminated ${killed} process(es) via port scan.`);
} else {
  console.log("Fallback cleanup found no listening Next processes.");
}
