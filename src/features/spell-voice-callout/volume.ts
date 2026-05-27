import { getSettings } from "../../core/db";
import { SPELL_VOICE_CHANNEL } from "./assets";

/** Hidden baseline gain so 100% slider is audibly strong; user slider scales on top. */
export const SPELL_VOICE_BASE_GAIN = 6;
export const MIN_SPELL_VOICE_CALLOUT_VOLUME = 0;
export const MAX_SPELL_VOICE_CALLOUT_VOLUME = 4;
export const DEFAULT_SPELL_VOICE_CALLOUT_VOLUME = 1;
const VOICE_PLAYBACK_WINDOW_SECONDS = 2.2;

const CHANNEL_VOLUME_CVARS: Record<string, string> = {
  Master: "Sound_MasterVolume",
  SFX: "Sound_SFXVolume",
  Dialog: "Sound_DialogVolume"
};

let supportsPerSoundVolume: boolean | undefined;
let savedChannelVolume: number | undefined;
let savedChannelCvar: string | undefined;
let channelBoostUntil = 0;
let channelBoostPending = false;

export function getSpellVoiceCalloutVolume(): number {
  return clampUserVolume(getSettings().spellVoiceCalloutVolume);
}

export function getEffectiveSpellVoicePlaybackGain(userVolume?: number): number {
  return clampUserVolume(userVolume ?? getSpellVoiceCalloutVolume()) * SPELL_VOICE_BASE_GAIN;
}

export function formatSpellVoiceVolumePercent(volume: number): string {
  return `${Math.round(clampUserVolume(volume) * 100)}%`;
}

function clampUserVolume(volume: number): number {
  if (volume < MIN_SPELL_VOICE_CALLOUT_VOLUME) {
    return MIN_SPELL_VOICE_CALLOUT_VOLUME;
  }

  if (volume > MAX_SPELL_VOICE_CALLOUT_VOLUME) {
    return MAX_SPELL_VOICE_CALLOUT_VOLUME;
  }

  return volume;
}

function readVolumeCvar(cvarName: string): number {
  const raw = GetCVar(cvarName);
  const parsed = raw !== undefined ? Number(raw) : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 1;
  }

  return parsed;
}

function getChannelVolumeCvar(): string {
  return CHANNEL_VOLUME_CVARS[SPELL_VOICE_CHANNEL] ?? CHANNEL_VOLUME_CVARS.Master;
}

function detectPerSoundVolumeSupport(): boolean {
  if (supportsPerSoundVolume !== undefined) {
    return supportsPerSoundVolume;
  }

  const setSoundVolume = (_G as Record<string, unknown>).SetSoundVolume;
  supportsPerSoundVolume = typeof setSoundVolume === "function";
  return supportsPerSoundVolume;
}

function trySetSoundVolume(soundHandle: number | undefined, volume: number): boolean {
  if (soundHandle === undefined) {
    return false;
  }

  const setSoundVolume = (_G as Record<string, unknown>).SetSoundVolume;

  if (typeof setSoundVolume !== "function") {
    supportsPerSoundVolume = false;
    return false;
  }

  const [ok] = pcall(() => {
    (setSoundVolume as (handle: number, nextVolume: number) => void)(soundHandle, volume);
  });

  if (ok) {
    supportsPerSoundVolume = true;
  }

  return ok;
}

function scheduleChannelVolumeRestore(): void {
  if (channelBoostPending) {
    return;
  }

  channelBoostPending = true;

  if (C_Timer === undefined) {
    restoreChannelVolumeBoost();
    channelBoostPending = false;
    return;
  }

  C_Timer.After(VOICE_PLAYBACK_WINDOW_SECONDS, () => {
    channelBoostPending = false;

    if (GetTime() >= channelBoostUntil) {
      restoreChannelVolumeBoost();
      return;
    }

    scheduleChannelVolumeRestore();
  });
}

function restoreChannelVolumeBoost(): void {
  if (savedChannelVolume === undefined || savedChannelCvar === undefined) {
    return;
  }

  SetCVar(savedChannelCvar, savedChannelVolume);
  savedChannelVolume = undefined;
  savedChannelCvar = undefined;
  channelBoostUntil = 0;
}

/** Temporarily raises the playback channel volume before PlaySoundFile when needed. */
export function prepareSpellVoicePlaybackVolume(userVolume: number): void {
  const effectiveGain = getEffectiveSpellVoicePlaybackGain(userVolume);

  if (effectiveGain <= 1.001) {
    return;
  }

  const cvarName = getChannelVolumeCvar();

  if (savedChannelVolume === undefined) {
    savedChannelVolume = readVolumeCvar(cvarName);
    savedChannelCvar = cvarName;
  }

  const boostedVolume = Math.min(1, savedChannelVolume * effectiveGain);
  SetCVar(cvarName, boostedVolume);
  channelBoostUntil = GetTime() + VOICE_PLAYBACK_WINDOW_SECONDS;
  scheduleChannelVolumeRestore();
}

/** Applies per-handle gain after PlaySoundFile when the client supports it. */
export function finalizeSpellVoicePlaybackVolume(
  soundHandle: number | undefined,
  userVolume: number
): void {
  const effectiveGain = getEffectiveSpellVoicePlaybackGain(userVolume);
  trySetSoundVolume(soundHandle, effectiveGain);
}

export function getSpellVoiceVolumeControlSummary(userVolume?: number): string {
  const effectiveGain = getEffectiveSpellPlaybackGainLabel(userVolume);
  const mode = detectPerSoundVolumeSupport() ? "per-sound" : `${SPELL_VOICE_CHANNEL.toLowerCase()}-boost`;
  return `${effectiveGain} (${mode})`;
}

function getEffectiveSpellPlaybackGainLabel(userVolume?: number): string {
  const gain = getEffectiveSpellVoicePlaybackGain(userVolume);
  return `${Math.round(gain * 100) / 100}x`;
}
