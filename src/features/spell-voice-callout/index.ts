import { getSettings } from "../../core/db";
import { resolveSpellAnimationSlug } from "../spell-animation-effect/spell-slugs";
import {
  getJapaneseSpellVoicePath,
  getSpellVoiceAssetProbeSummary,
  SPELL_VOICE_CHANNEL,
  SPELL_VOICE_LOCALE
} from "./assets";
import {
  getLastSpellVoicePlayResult,
  tryPlaySpellVoiceCallout,
  type SpellVoicePlayResult
} from "./controller";
import {
  formatSpellVoiceVolumePercent,
  getSpellVoiceCalloutVolume,
  getSpellVoiceVolumeControlSummary,
  MAX_SPELL_VOICE_CALLOUT_VOLUME,
  MIN_SPELL_VOICE_CALLOUT_VOLUME
} from "./volume";

export { tryPlaySpellVoiceCallout, getLastSpellVoicePlayResult };
export type { SpellVoicePlayResult };
export type { SpellVoiceLine } from "./japanese-lines";
export { JAPANESE_SPELL_VOICE_LINES } from "./japanese-lines";
export {
  formatSpellVoiceVolumePercent,
  getSpellVoiceCalloutVolume,
  MAX_SPELL_VOICE_CALLOUT_VOLUME,
  MIN_SPELL_VOICE_CALLOUT_VOLUME
};

export function getSpellVoiceCalloutStatusLines(displayText: string): string[] {
  const enabled = getSettings().enableSpellVoiceCallouts;
  const slug = resolveSpellAnimationSlug(displayText);
  const voicePath =
    slug !== undefined ? getJapaneseSpellVoicePath(slug.styleSlug, slug.spellSlug) : undefined;
  const bundled =
    voicePath !== undefined && getSpellVoiceAssetProbeSummary(voicePath) === "bundled";

  return [
    `Voice callouts: ${enabled ? "enabled" : "disabled"}`,
    `Voice volume: ${formatSpellVoiceVolumePercent(getSpellVoiceCalloutVolume())}, effective ${getSpellVoiceVolumeControlSummary()}`,
    `Voice channel: ${SPELL_VOICE_CHANNEL}`,
    `Voice locale: ${SPELL_VOICE_LOCALE}`,
    `Voice asset for preview: ${bundled ? "bundled" : "missing"}`,
    slug !== undefined && voicePath !== undefined
      ? `Voice path for preview: ${voicePath}`
      : `Voice slug for preview: ${slug === undefined ? "missing" : "resolved"}`,
    `Last voice playback: ${getLastSpellVoicePlayResult()}`
  ];
}
