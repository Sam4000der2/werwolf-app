#!/usr/bin/env node
const { existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const projectRoot = join(__dirname, "..");
const reactScriptsBin = join(projectRoot, "node_modules", "react-scripts", "bin", "react-scripts.js");

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/run-react-scripts.js <start|build|test|eject> [...args]");
  process.exit(1);
}

if (!existsSync(reactScriptsBin)) {
  const installResult = spawnSync("npm", ["install", "--include=dev", "--no-audit", "--no-fund"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (installResult.error) {
    console.error("Failed to install missing devDependencies.", installResult.error);
    process.exit(1);
  }

  if (installResult.status !== 0) {
    process.exit(installResult.status || 1);
  }
}

const runResult = spawnSync("node", [reactScriptsBin, command, ...args], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

if (runResult.error) {
  console.error("Failed to execute react-scripts.", runResult.error);
  process.exit(1);
}

process.exit(runResult.status || 0);
