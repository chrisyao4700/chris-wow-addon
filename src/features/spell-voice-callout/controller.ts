import { getSettings } from "../../core/db";
import { resolveSpellAnimationSlug } from "../spell-animation-effect/spell-slugs";
import {
  getJapaneseSpellVoicePath,
  getSpellVoiceAssetProbeSummary,
  SPELL_VOICE_CHANNEL
} from "./assets";
import {
  finalizeSpellVoicePlaybackVolume,
  getSpellVoiceCalloutVolume,
  prepareSpellVoicePlaybackVolume
} from "./volume";

export type SpellVoicePlayResult =
  | "disabled"
  | "muted_volume"
  | "missing_slug"
  | "played"
  | "missing_audio"
  | "skipped_duplicate";

const VOICE_TRIGGER_COOLDOWN_SECONDS = 0.35;

let lastVoiceTriggerKey = "";
let lastVoiceTriggerAt = 0;
let lastVoicePlayResult: SpellVoicePlayResult = "disabled";

function shouldSkipDuplicateVoice(displayText: string): boolean {
  const now = GetTime();

  if (displayText === lastVoiceTriggerKey && now - lastVoiceTriggerAt < VOICE_TRIGGER_COOLDOWN_SECONDS) {
    return true;
  }

  lastVoiceTriggerKey = displayText;
  lastVoiceTriggerAt = now;
  return false;
}

export function getLastSpellVoicePlayResult(): SpellVoicePlayResult {
  return lastVoicePlayResult;
}

export function tryPlaySpellVoiceCallout(displayText: string): SpellVoicePlayResult {
  if (!getSettings().enableSpellVoiceCallouts) {
    lastVoicePlayResult = "disabled";
    return "disabled";
  }

  if (shouldSkipDuplicateVoice(displayText)) {
    lastVoicePlayResult = "skipped_duplicate";
    return "skipped_duplicate";
  }

  const slug = resolveSpellAnimationSlug(displayText);

  if (slug === undefined) {
    lastVoicePlayResult = "missing_slug";
    return "missing_slug";
  }

  const path = getJapaneseSpellVoicePath(slug.styleSlug, slug.spellSlug);

  if (getSpellVoiceAssetProbeSummary(path) === "missing") {
    lastVoicePlayResult = "missing_audio";
    return "missing_audio";
  }

  const userVolume = getSpellVoiceCalloutVolume();

  if (userVolume <= 0) {
    lastVoicePlayResult = "muted_volume";
    return "muted_volume";
  }

  prepareSpellVoicePlaybackVolume(userVolume);
  const [willPlay, soundHandle] = PlaySoundFile(path, SPELL_VOICE_CHANNEL);

  if (willPlay) {
    finalizeSpellVoicePlaybackVolume(soundHandle, userVolume);
  }

  const result: SpellVoicePlayResult = willPlay ? "played" : "missing_audio";
  lastVoicePlayResult = result;
  return result;
}
