const requiredMajor = 22;
const current = process.versions.node;
const major = Number(current.split(".")[0]);

if (major !== requiredMajor) {
  console.error(
    `runtime check failed: Node ${current} detected. Use Node ${requiredMajor}.x (LTS) for stable builds.`
  );
  process.exit(1);
}

console.log(`runtime check passed: Node ${current}`);
