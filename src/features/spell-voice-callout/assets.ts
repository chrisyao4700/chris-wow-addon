import { ADDON_NAME } from "../../core/config";
import { bundledSpellVoicePaths } from "./asset-manifest";

export const SPELL_VOICE_ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\spell-voices`;
export const SPELL_VOICE_LOCALE = "ja";
export const SPELL_VOICE_CHANNEL = "Master";

export function getJapaneseSpellVoicePath(styleSlug: string, spellSlug: string): string {
  return `${SPELL_VOICE_ASSET_ROOT}\\${SPELL_VOICE_LOCALE}\\${styleSlug}\\${spellSlug}.ogg`;
}

export function isBundledSpellVoicePath(path: string): boolean {
  return bundledSpellVoicePaths.has(path);
}

export function getSpellVoiceAssetProbeSummary(path: string): "bundled" | "missing" {
  return isBundledSpellVoicePath(path) ? "bundled" : "missing";
}
