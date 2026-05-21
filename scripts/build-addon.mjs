import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const addonName = "ChrisWowAddon";
const targetInterfaceVersion = "38001";
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const version = packageJson.version;
const args = new Set(process.argv.slice(2));

const paths = {
  buildLua: join(root, "build", "main.lua"),
  rootLua: join(root, "main.lua"),
  assets: join(root, "assets"),
  tocTemplate: join(root, `${addonName}.toc`),
  dist: join(root, "dist"),
  distAddon: join(root, "dist", addonName),
  zip: join(root, "dist", `${addonName}-${version}.zip`)
};

const runtimeAssets = ["addon-logo.tga"];

async function clean() {
  await rm(join(root, "build"), { recursive: true, force: true });
  await rm(paths.dist, { recursive: true, force: true });
  await rm(paths.rootLua, { force: true });
}

function validateToc(toc) {
  const interfaceLine = toc
    .split(/\r?\n/)
    .find(line => line.startsWith("## Interface:"));

  if (!interfaceLine) {
    throw new Error("Missing ## Interface directive in TOC.");
  }

  const supportedInterfaces = interfaceLine
    .replace("## Interface:", "")
    .split(",")
    .map(value => value.trim());

  if (!supportedInterfaces.includes(targetInterfaceVersion)) {
    throw new Error(
      `TOC must include Titan Reforged interface ${targetInterfaceVersion}. Found: ${supportedInterfaces.join(", ")}`
    );
  }
}

async function copyBuildArtifacts() {
  if (!existsSync(paths.buildLua)) {
    throw new Error("Missing build/main.lua. Run `npm run build` after installing dependencies.");
  }

  await copyFile(paths.buildLua, paths.rootLua);
  await rm(paths.distAddon, { recursive: true, force: true });
  await mkdir(paths.distAddon, { recursive: true });

  const toc = await readFile(paths.tocTemplate, "utf8");
  const renderedToc = toc.replaceAll("@project-version@", version);
  validateToc(renderedToc);
  await writeFile(join(paths.distAddon, `${addonName}.toc`), renderedToc);
  await copyFile(paths.rootLua, join(paths.distAddon, "main.lua"));

  const distAssets = join(paths.distAddon, "assets");
  await mkdir(distAssets, { recursive: true });

  for (const asset of runtimeAssets) {
    await copyFile(join(paths.assets, asset), join(distAssets, asset));
  }
}

function zipDist() {
  const result = spawnSync("zip", ["-r", paths.zip, addonName], {
    cwd: paths.dist,
    stdio: "inherit"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error("zip command failed.");
  }
}

const macWowRoot = "/Applications/World of Warcraft";
const titanFlavor = "_classic_titan_";

async function discoverMacAddonsDir() {
  if (!existsSync(macWowRoot)) {
    return null;
  }

  const entries = await readdir(macWowRoot, { withFileTypes: true });
  const flavorDirs = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith("_"))
    .map(entry => entry.name)
    .sort((a, b) => {
      if (a === titanFlavor) {
        return -1;
      }

      if (b === titanFlavor) {
        return 1;
      }

      return a.localeCompare(b);
    });

  for (const flavor of flavorDirs) {
    const interfaceDir = join(macWowRoot, flavor, "Interface");

    if (!existsSync(interfaceDir)) {
      continue;
    }

    return join(interfaceDir, "AddOns");
  }

  return null;
}

async function ensureAddonsDir(addonDir) {
  if (existsSync(addonDir)) {
    return addonDir;
  }

  const interfaceDir = dirname(addonDir);

  if (!existsSync(interfaceDir)) {
    return null;
  }

  try {
    await mkdir(addonDir, { recursive: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
      throw new Error(
        `Cannot create AddOns directory under ${macWowRoot}.\nGrant your terminal write access to the WoW folder, or run the install from a normal shell.`
      );
    }

    throw error;
  }

  console.log(`Created AddOns directory: ${addonDir}`);
  return addonDir;
}

async function resolveAddonsDir() {
  if (process.env.WOW_ADDONS_DIR) {
    const addonDir = process.env.WOW_ADDONS_DIR;

    if (!existsSync(addonDir)) {
      throw new Error(`WOW_ADDONS_DIR does not exist: ${addonDir}`);
    }

    return addonDir;
  }

  const discovered = await discoverMacAddonsDir();

  if (discovered) {
    const addonDir = await ensureAddonsDir(discovered);
    console.log(`Using WoW AddOns directory: ${addonDir}`);
    return addonDir;
  }

  const fallback = join(macWowRoot, titanFlavor, "Interface", "AddOns");
  const titanRoot = join(macWowRoot, titanFlavor);

  if (existsSync(titanRoot)) {
    try {
      await mkdir(fallback, { recursive: true });
      console.log(`Created AddOns directory: ${fallback}`);
      return fallback;
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
        throw new Error(
          `Cannot create AddOns directory under ${macWowRoot}.\nGrant your terminal write access to the WoW folder, or run the install from a normal shell.`
        );
      }

      throw error;
    }
  }

  throw new Error(
    [
      `Could not find a WoW Interface folder under ${macWowRoot}.`,
      `Install Titan Reforged via Battle.net, launch it once, then retry.`,
      `Or set WOW_ADDONS_DIR to your AddOns path.`
    ].join("\n")
  );
}

async function installAddon() {
  const addonDir = await resolveAddonsDir();

  await rm(join(addonDir, addonName), { recursive: true, force: true });
  await cp(paths.distAddon, join(addonDir, addonName), { recursive: true });
  console.log(`Installed ${addonName} to ${addonDir}`);
}

if (args.has("--clean")) {
  await clean();
  process.exit(0);
}

await copyBuildArtifacts();

if (args.has("--zip")) {
  zipDist();
}

if (args.has("--install")) {
  await installAddon();
}
