import { ADDON_NAME } from "../../core/config";
import { bundledSpellEffectPaths } from "./asset-manifest";

export const SPELL_EFFECT_ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\spell-effects`;

export type StylePackRole = "energy_back" | "energy_front" | "particles_4x4" | "impact_flash" | "atmosphere";
export type SpellTextRole = "text_main" | "text_shadow" | "text_sheen";
export type SharedOverlayRole =
  | "shared_ink_burst_01"
  | "shared_speed_lines_01"
  | "shared_slash_mask_01"
  | "shared_foam_sparkle_01"
  | "shared_droplet_trail_01";

const MISSING_TEXTURE_MARKER = "Interface\\Icons\\INV_Misc_QuestionMark";

let probeTexture: WowTexture | undefined;
const resolvedPathCache: Record<string, string | undefined> = {};

export function getStyleAssetPath(styleSlug: string, role: StylePackRole): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\${styleSlug}\\${styleSlug}_${role}`;
}

export function getSpellAssetPath(styleSlug: string, spellSlug: string, role: SpellTextRole): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\${styleSlug}\\spells\\${spellSlug}\\${spellSlug}_${role}`;
}

export function getSharedAssetPath(assetName: SharedOverlayRole): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\shared\\${assetName}`;
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
    probeTexture = UIParent.CreateTexture(`${ADDON_NAME}SpellEffectAssetProbe`, "OVERLAY");
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

function isBundledSpellEffectPath(basePath: string): boolean {
  return bundledSpellEffectPaths.has(basePath);
}

export function resolveTexturePath(basePath: string): string | undefined {
  const cached = resolvedPathCache[basePath];

  if (cached !== undefined) {
    return cached.length > 0 ? cached : undefined;
  }

  if (isBundledSpellEffectPath(basePath)) {
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

export function getSpellEffectAssetProbeSummary(basePath: string): string {
  if (isBundledSpellEffectPath(basePath)) {
    return `${basePath}.tga (bundled)`;
  }

  const resolved = resolveTexturePath(basePath);

  if (resolved !== undefined) {
    return resolved;
  }

  return "missing";
}

export function resolveStyleAssetPath(styleSlug: string, role: StylePackRole): string | undefined {
  return resolveTexturePath(getStyleAssetPath(styleSlug, role));
}

export function resolveSpellAssetPath(
  styleSlug: string,
  spellSlug: string,
  role: SpellTextRole
): string | undefined {
  return resolveTexturePath(getSpellAssetPath(styleSlug, spellSlug, role));
}

export function resolveSharedAssetPath(assetName: SharedOverlayRole): string | undefined {
  return resolveTexturePath(getSharedAssetPath(assetName));
}

export function clearSpellEffectAssetCache(): void {
  for (const path of Object.keys(resolvedPathCache)) {
    delete resolvedPathCache[path];
  }
}
