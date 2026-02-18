import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    encoding: "utf8",
    ...options
  });
}

function runCapture(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function fail(message) {
  console.error(`publish-next-draft-push: ${message}`);
  process.exit(1);
}

const branch = process.env.PUBLISH_GIT_BRANCH || "main";
const remote = process.env.PUBLISH_GIT_REMOTE || "origin";

const gitCheck = runCapture("git", ["rev-parse", "--is-inside-work-tree"]);
if (!gitCheck.ok || gitCheck.stdout.trim() !== "true") {
  fail("this directory is not a git repository.");
}

const publish = run("node", ["scripts/publish-next-draft.mjs"]);
if (publish.status !== 0) {
  fail("failed publishing next draft.");
}

const status = runCapture("git", ["status", "--porcelain"]);
if (!status.ok) {
  fail("could not read git status.");
}

if (!status.stdout.trim()) {
  console.log("publish-next-draft-push: no changes detected. Nothing to commit.");
  process.exit(0);
}

const add = run("git", ["add", "-A"]);
if (add.status !== 0) {
  fail("git add failed.");
}

const changed = runCapture("git", ["diff", "--cached", "--name-only"]);
if (!changed.ok || !changed.stdout.trim()) {
  console.log("publish-next-draft-push: no staged changes after add. Nothing to commit.");
  process.exit(0);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);
const commitMessage = `chore(publish): publish draft ${date}`;

const commit = run("git", ["commit", "-m", commitMessage]);
if (commit.status !== 0) {
  fail("git commit failed.");
}

const push = run("git", ["push", remote, branch]);
if (push.status !== 0) {
  fail(`git push failed (${remote}/${branch}).`);
}

console.log(`publish-next-draft-push: pushed to ${remote}/${branch}`);
