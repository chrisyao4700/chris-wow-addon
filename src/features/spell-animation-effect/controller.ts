import { RETRIGGER_COOLDOWN_SECONDS } from "./animation-utils";
import { canPlaySpellAnimation, createSpellEffectInstance, type SpellEffectInstance } from "./effect-instance";
import { resolveSpellAnimationSlug } from "./spell-slugs";

export type SpellAnimationPlayResult = "played" | "missing_assets" | "missing_slug" | "skipped_duplicate" | "pool_unavailable";

const MAX_POOL_SIZE = 3;
const pool: SpellEffectInstance[] = [];
let anchorFrame: WowFrame | undefined;
let lastTriggerKey = "";
let lastTriggerAt = 0;

function shouldSkipDuplicateTrigger(displayText: string): boolean {
  const now = GetTime();

  if (displayText === lastTriggerKey && now - lastTriggerAt < RETRIGGER_COOLDOWN_SECONDS) {
    return true;
  }

  lastTriggerKey = displayText;
  lastTriggerAt = now;
  return false;
}

function acquireEffect(): SpellEffectInstance | undefined {
  if (anchorFrame === undefined) {
    return undefined;
  }

  for (const effect of pool) {
    if (!effect.active) {
      effect.SetAnchorFrame(anchorFrame);
      return effect;
    }
  }

  if (pool.length >= MAX_POOL_SIZE) {
    const activeEffect = pool.find(effect => effect.active);

    if (activeEffect !== undefined) {
      activeEffect.Stop();
      activeEffect.SetAnchorFrame(anchorFrame);
      return activeEffect;
    }

    return undefined;
  }

  const effect = createSpellEffectInstance(`${pool.length + 1}`);
  effect.SetAnchorFrame(anchorFrame);
  pool.push(effect);
  return effect;
}

export function setSpellAnimationAnchorFrame(frame: WowFrame): void {
  anchorFrame = frame;
}

export function preloadSpellAnimationPool(): void {
  if (anchorFrame === undefined) {
    return;
  }

  if (pool.length === 0) {
    const effect = createSpellEffectInstance("1");
    effect.SetAnchorFrame(anchorFrame);
    pool.push(effect);
  }
}

export function showSpellAnimationEffect(displayText: string): boolean {
  return tryShowSpellAnimationEffect(displayText) === "played";
}

export function tryShowSpellAnimationEffect(displayText: string): SpellAnimationPlayResult {
  const slug = resolveSpellAnimationSlug(displayText);

  if (slug === undefined) {
    return "missing_slug";
  }

  if (!canPlaySpellAnimation(slug)) {
    return "missing_assets";
  }

  if (shouldSkipDuplicateTrigger(displayText)) {
    return "skipped_duplicate";
  }

  const effect = acquireEffect();

  if (effect === undefined || !effect.Configure(slug)) {
    return effect === undefined ? "pool_unavailable" : "missing_assets";
  }

  effect.Play();
  return "played";
}

export function getSpellAnimationPoolSize(): number {
  return pool.length;
}

export function getSpellAnimationTimingSummary(): string {
  return "0.92s layered animation, 0.35s retrigger cooldown";
}
