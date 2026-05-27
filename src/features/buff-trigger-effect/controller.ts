import { BUFF_RETRIGGER_COOLDOWN_SECONDS } from "./animation-utils";
import {
  canPlayBuffTriggerEffect,
  createBuffTriggerEffectInstance,
  type BuffEffectInstanceMode,
  type BuffTriggerEffectInstance
} from "./effect-instance";
import { ensureBuffTriggerEffectArea } from "./layout-settings";
import type { BuffTriggerStyleSlug } from "./style-slugs";

export type BuffTriggerPlayResult =
  | "played"
  | "missing_assets"
  | "skipped_duplicate"
  | "pool_unavailable"
  | "stopped";

const MAX_POOL_SIZE = 4;
const pool: BuffTriggerEffectInstance[] = [];
const activeByAuraKey: Record<string, BuffTriggerEffectInstance> = {};

let lastTriggerKey = "";
let lastTriggerAt = 0;

function isPreviewAuraKey(auraKey: string): boolean {
  return auraKey.startsWith("preview:") || auraKey.startsWith("layout-preview");
}

function shouldSkipDuplicateTrigger(triggerKey: string, cooldownSeconds: number): boolean {
  const now = GetTime();

  if (triggerKey === lastTriggerKey && now - lastTriggerAt < cooldownSeconds) {
    return true;
  }

  lastTriggerKey = triggerKey;
  lastTriggerAt = now;
  return false;
}

function isEffectAvailable(effect: BuffTriggerEffectInstance): boolean {
  return effect.mode === "idle";
}

function acquireIdleEffect(): BuffTriggerEffectInstance | undefined {
  const anchorFrame = ensureBuffTriggerEffectArea();

  for (const effect of pool) {
    if (isEffectAvailable(effect)) {
      effect.SetAnchorFrame(anchorFrame);
      return effect;
    }
  }

  if (pool.length >= MAX_POOL_SIZE) {
    return undefined;
  }

  const effect = createBuffTriggerEffectInstance(`${pool.length + 1}`);
  effect.SetAnchorFrame(anchorFrame);
  pool.push(effect);
  return effect;
}

function getEffectForAuraKey(auraKey: string): BuffTriggerEffectInstance | undefined {
  return activeByAuraKey[auraKey];
}

function bindEffectToAura(auraKey: string, effect: BuffTriggerEffectInstance): void {
  activeByAuraKey[auraKey] = effect;
}

function unbindEffectFromAura(auraKey: string): void {
  delete activeByAuraKey[auraKey];
}

export function preloadBuffTriggerEffectPool(): void {
  ensureBuffTriggerEffectArea();

  if (pool.length === 0) {
    const effect = createBuffTriggerEffectInstance("1");
    effect.SetAnchorFrame(ensureBuffTriggerEffectArea());
    pool.push(effect);
  }
}

export function activateBuffTriggerEffect(
  styleSlug: BuffTriggerStyleSlug,
  auraKey: string,
  retriggerCooldownSeconds = BUFF_RETRIGGER_COOLDOWN_SECONDS
): BuffTriggerPlayResult {
  if (!canPlayBuffTriggerEffect(styleSlug)) {
    return "missing_assets";
  }

  const introOnly = isPreviewAuraKey(auraKey);
  const dedupeKey = `${auraKey}:${styleSlug}`;

  let effect = getEffectForAuraKey(auraKey);

  if (effect === undefined && !introOnly && shouldSkipDuplicateTrigger(dedupeKey, retriggerCooldownSeconds)) {
    return "skipped_duplicate";
  }

  if (effect !== undefined) {
    if (!effect.Configure(styleSlug)) {
      return "missing_assets";
    }

    effect.PlayIntro(auraKey, introOnly);
    return "played";
  }

  effect = acquireIdleEffect();

  if (effect === undefined || !effect.Configure(styleSlug)) {
    return effect === undefined ? "pool_unavailable" : "missing_assets";
  }

  if (!introOnly) {
    bindEffectToAura(auraKey, effect);
  }

  effect.PlayIntro(auraKey, introOnly);
  return "played";
}

export function deactivateBuffTriggerEffect(auraKey: string): BuffTriggerPlayResult {
  const effect = getEffectForAuraKey(auraKey);

  if (effect === undefined) {
    return "stopped";
  }

  unbindEffectFromAura(auraKey);

  if (effect.mode === "idle") {
    return "stopped";
  }

  effect.FadeOut();
  return "played";
}

export function tryPlayBuffTriggerEffect(
  styleSlug: BuffTriggerStyleSlug,
  triggerKey: string,
  retriggerCooldownSeconds = BUFF_RETRIGGER_COOLDOWN_SECONDS
): BuffTriggerPlayResult {
  return activateBuffTriggerEffect(styleSlug, triggerKey, retriggerCooldownSeconds);
}

export function showBuffTriggerEffect(
  styleSlug: BuffTriggerStyleSlug,
  triggerKey: string,
  retriggerCooldownSeconds?: number
): boolean {
  return activateBuffTriggerEffect(styleSlug, triggerKey, retriggerCooldownSeconds) === "played";
}

export function getBuffTriggerPoolSize(): number {
  return pool.length;
}

export function getActiveBuffTriggerDisplayCount(): number {
  return Object.keys(activeByAuraKey).length;
}

export function getBuffTriggerEffectMode(auraKey: string): BuffEffectInstanceMode | undefined {
  return getEffectForAuraKey(auraKey)?.mode;
}

export function clearAllBuffTriggerDisplays(): void {
  for (const key of Object.keys(activeByAuraKey)) {
    deactivateBuffTriggerEffect(key);
  }
}
