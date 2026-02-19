import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

function run(command, args, options = {}) {
  const env = { ...process.env, ...(options.env ?? {}) };
  return spawnSync(command, args, {
    stdio: "inherit",
    encoding: "utf8",
    env,
    ...options
  });
}

function runCapture(command, args, options = {}) {
  const env = { ...process.env, ...(options.env ?? {}) };
  const result = spawnSync(command, args, { encoding: "utf8", env });
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
const sshKeyPath = process.env.PUBLISH_GIT_SSH_KEY;

const executionEnv =
  sshKeyPath && sshKeyPath.trim()
    ? {
        GIT_SSH_COMMAND: `ssh -i ${path.resolve(sshKeyPath.trim())} -o IdentitiesOnly=yes`
      }
    : {};

const gitCheck = runCapture("git", ["rev-parse", "--is-inside-work-tree"], { env: executionEnv });
if (!gitCheck.ok || gitCheck.stdout.trim() !== "true") {
  fail("this directory is not a git repository.");
}

const upstreamCheck = runCapture("git", ["ls-remote", "--heads", remote, branch], { env: executionEnv });
if (!upstreamCheck.ok) {
  fail(
    `cannot reach ${remote}/${branch}. Configure git auth for cron${
      sshKeyPath ? ` (PUBLISH_GIT_SSH_KEY=${path.resolve(sshKeyPath.trim())})` : ""
    }. ${upstreamCheck.stderr.trim()}`
  );
}

const publish = run("node", ["scripts/publish-next-draft.mjs"], { env: executionEnv });
if (publish.status !== 0) {
  fail("failed publishing next draft.");
}

const status = runCapture("git", ["status", "--porcelain"], { env: executionEnv });
if (!status.ok) {
  fail("could not read git status.");
}

if (!status.stdout.trim()) {
  console.log("publish-next-draft-push: no changes detected. Nothing to commit.");
  process.exit(0);
}

const add = run("git", ["add", "-A"], { env: executionEnv });
if (add.status !== 0) {
  fail("git add failed.");
}

const changed = runCapture("git", ["diff", "--cached", "--name-only"], { env: executionEnv });
if (!changed.ok || !changed.stdout.trim()) {
  console.log("publish-next-draft-push: no staged changes after add. Nothing to commit.");
  process.exit(0);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);
const commitMessage = `chore(publish): publish draft ${date}`;

const gitIdentityName = runCapture("git", ["config", "user.name"], { env: executionEnv });
const gitIdentityEmail = runCapture("git", ["config", "user.email"], { env: executionEnv });
if (!gitIdentityName.ok || !gitIdentityName.stdout.trim() || !gitIdentityEmail.ok || !gitIdentityEmail.stdout.trim()) {
  const fallbackName = process.env.PUBLISH_GIT_USER_NAME || os.userInfo().username;
  const fallbackEmail = process.env.PUBLISH_GIT_USER_EMAIL || `${os.userInfo().username}@localhost`;
  run("git", ["config", "user.name", fallbackName], { env: executionEnv });
  run("git", ["config", "user.email", fallbackEmail], { env: executionEnv });
}

const commit = run("git", ["commit", "-m", commitMessage], { env: executionEnv });
if (commit.status !== 0) {
  fail("git commit failed.");
}

const push = run("git", ["push", remote, branch], { env: executionEnv });
if (push.status !== 0) {
  fail(`git push failed (${remote}/${branch}).`);
}

console.log(`publish-next-draft-push: pushed to ${remote}/${branch}`);
