import { spawn } from "node:child_process";

const start = Date.now();
console.log("types debug: starting TypeScript check...");

const child = spawn("npx", ["tsc", "--noEmit", "--pretty", "false"], {
  stdio: "inherit",
  shell: true
});

child.on("exit", (code, signal) => {
  const elapsedMs = Date.now() - start;
  console.log(`types debug: finished in ${(elapsedMs / 1000).toFixed(2)}s`);

  if (signal) {
    console.error(`types debug: terminated by signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
