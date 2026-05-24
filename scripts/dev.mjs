import { spawn, spawnSync } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tstlBin = join(root, "node_modules", ".bin", "tstl");
const buildLua = join(root, "build", "main.lua");
const assetsDir = join(root, "assets");
const tocPath = join(root, "SlayerUI.toc");

function runTstl(args, label) {
  const result = spawnSync(tstlBin, args, { cwd: root, stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed.`);
  }
}

function installToWow() {
  const result = spawnSync("node", ["scripts/build-addon.mjs", "--install"], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error("Failed to copy addon into WoW AddOns folder.");
  }

  console.log("Ready in WoW — type /reload to pick up changes.");
}

let installTimer;
let installChain = Promise.resolve();
let startupGrace = true;

setTimeout(() => {
  startupGrace = false;
}, 1500);

function scheduleInstall(reason) {
  if (startupGrace) {
    return;
  }

  clearTimeout(installTimer);
  installTimer = setTimeout(() => {
    installChain = installChain
      .then(async () => {
        console.log(`\n${reason} — syncing to WoW...`);
        installToWow();
      })
      .catch(error => {
        console.error(error instanceof Error ? error.message : error);
      });
  }, 300);
}

function watchPath(path, reason) {
  if (!existsSync(path)) {
    return;
  }

  watch(path, { recursive: true }, () => scheduleInstall(reason));
}

console.log("Building addon...");
runTstl(["-p", "tsconfig.json"], "Initial TypeScript build");

console.log("Installing to WoW...");
installToWow();

watchPath(buildLua, "Lua output changed");
watchPath(assetsDir, "Assets changed");
watchPath(tocPath, "TOC changed");

console.log("\nWatching for changes (Ctrl+C to stop).\n");

const watcher = spawn(tstlBin, ["-p", "tsconfig.json", "--watch"], {
  cwd: root,
  stdio: "inherit"
});

function shutdown(code = 0) {
  if (!watcher.killed) {
    watcher.kill();
  }

  process.exit(code);
}

watcher.on("exit", code => shutdown(code ?? 0));

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
