import { ADDON_NAME } from "../../core/config";
import {
  resolveStyleAssetPath as resolveSpellStyleAssetPath,
  type StylePackRole
} from "../spell-animation-effect/assets";
import { bundledBuffEffectPaths } from "./asset-manifest";

export const BUFF_EFFECT_ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\buff-effects`;

export type BuffEffectRole = "indicator_core" | "trigger_burst" | "particles_4x4" | "active_glow";

const MISSING_TEXTURE_MARKER = "Interface\\Icons\\INV_Misc_QuestionMark";

let probeTexture: WowTexture | undefined;
const resolvedPathCache: Record<string, string | undefined> = {};

const SPELL_STYLE_FALLBACK_ROLES: Record<BuffEffectRole, StylePackRole | undefined> = {
  indicator_core: "energy_back",
  trigger_burst: "impact_flash",
  particles_4x4: "particles_4x4",
  active_glow: "energy_front"
};

export function getBuffAssetPath(styleSlug: string, role: BuffEffectRole): string {
  return `${BUFF_EFFECT_ASSET_ROOT}\\${styleSlug}\\${styleSlug}_${role}`;
}

function getPathCandidates(basePath: string): string[] {
  return [`${basePath}.tga`, basePath];
}

function isResolvedTextureLoaded(resolved: string | number | undefined): boolean {
  if (resolved === undefined || resolved === "") {
    return false;
  }

  if (typeof resolved === "number") {
    return resolved > 0;
  }

  return resolved !== MISSING_TEXTURE_MARKER;
}

function ensureProbeTexture(): WowTexture {
  if (probeTexture === undefined) {
    probeTexture = UIParent.CreateTexture(`${ADDON_NAME}BuffEffectAssetProbe`, "OVERLAY");
    probeTexture.Hide();
  }

  return probeTexture;
}

function probeTexturePath(path: string): boolean {
  const probe = ensureProbeTexture();
  probe.SetTexture(MISSING_TEXTURE_MARKER);
  probe.SetTexture(path);

  return isResolvedTextureLoaded(probe.GetTexture() as string | number | undefined);
}

function normalizeAssetBasePath(basePath: string): string {
  return basePath.split("/").join("\\");
}

function isBundledBuffEffectPath(basePath: string): boolean {
  const normalized = normalizeAssetBasePath(basePath);

  return bundledBuffEffectPaths.has(basePath) || bundledBuffEffectPaths.has(normalized);
}

export function resolveTexturePath(basePath: string): string | undefined {
  const cached = resolvedPathCache[basePath];

  if (cached !== undefined) {
    return cached.length > 0 ? cached : undefined;
  }

  if (isBundledBuffEffectPath(basePath)) {
    const bundledPath = `${basePath}.tga`;
    resolvedPathCache[basePath] = bundledPath;
    return bundledPath;
  }

  for (const candidate of getPathCandidates(basePath)) {
    if (probeTexturePath(candidate)) {
      resolvedPathCache[basePath] = candidate;
      return candidate;
    }
  }

  resolvedPathCache[basePath] = "";
  return undefined;
}

export function resolveBuffAssetPath(styleSlug: string, role: BuffEffectRole): string | undefined {
  const buffPath = resolveTexturePath(getBuffAssetPath(styleSlug, role));

  if (buffPath !== undefined) {
    return buffPath;
  }

  const fallbackRole = SPELL_STYLE_FALLBACK_ROLES[role];

  if (fallbackRole === undefined) {
    return undefined;
  }

  return resolveSpellStyleAssetPath(styleSlug, fallbackRole);
}

export function clearBuffEffectAssetCache(): void {
  for (const path of Object.keys(resolvedPathCache)) {
    delete resolvedPathCache[path];
  }
}

export function getBuffEffectAssetProbeSummary(styleSlug: string, role: BuffEffectRole): string {
  const basePath = getBuffAssetPath(styleSlug, role);

  if (isBundledBuffEffectPath(basePath)) {
    return `${basePath}.tga (bundled)`;
  }

  const resolved = resolveBuffAssetPath(styleSlug, role);

  if (resolved !== undefined) {
    return resolved;
  }

  return "missing";
}
