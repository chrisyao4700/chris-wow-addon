import {
  clearSpellEffectAssetCache,
  getSpellAssetPath,
  getSpellEffectAssetProbeSummary,
  getStyleAssetPath
} from "./assets";
import {
  getSpellAnimationPoolSize,
  getSpellAnimationTimingSummary,
  preloadSpellAnimationPool,
  setSpellAnimationAnchorFrame,
  showSpellAnimationEffect,
  tryShowSpellAnimationEffect,
  type SpellAnimationPlayResult
} from "./controller";
import { canPlaySpellAnimation } from "./effect-instance";
import {
  enterSpellEffectLayoutEditor,
  exitSpellEffectLayoutEditor,
  isSpellEffectLayoutEditorActive,
  setSpellEffectLayoutEditorHandler,
  syncSpellEffectLayout,
  toggleSpellEffectLayoutEditor
} from "./layout-editor";
import {
  applySpellEffectAnchorLayout,
  getSpellEffectUserScale,
  MAX_SPELL_EFFECT_USER_SCALE,
  MIN_SPELL_EFFECT_USER_SCALE,
  resetSpellEffectLayoutSettings,
  updateSpellEffectUserScale
} from "./layout-settings";
import { resolveSpellAnimationSlug, type SpellAnimationSlug } from "./spell-slugs";

export {
  clearSpellEffectAssetCache,
  getSpellAnimationPoolSize,
  getSpellAnimationTimingSummary,
  preloadSpellAnimationPool,
  resolveSpellAnimationSlug,
  setSpellAnimationAnchorFrame,
  showSpellAnimationEffect,
  tryShowSpellAnimationEffect
};

export type { SpellAnimationPlayResult };
export type { SpellAnimationSlug } from "./spell-slugs";

export function canShowSpellAnimationEffect(displayText: string): boolean {
  const slug = resolveSpellAnimationSlug(displayText);

  if (slug === undefined) {
    return false;
  }

  return canPlaySpellAnimation(slug);
}

export function getSpellAnimationAssetStatusLines(displayText: string): string[] {
  const slug = resolveSpellAnimationSlug(displayText);

  if (slug === undefined) {
    return [`No animation slug for display text: ${displayText}`];
  }

  const mvpRoles = [
    ["impact_flash", getStyleAssetPath(slug.styleSlug, "impact_flash")],
    ["energy_back", getStyleAssetPath(slug.styleSlug, "energy_back")],
    ["particles_4x4", getStyleAssetPath(slug.styleSlug, "particles_4x4")],
    ["text_main", getSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_main")],
    ["text_shadow", getSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_shadow")]
  ] as const;

  const lines = mvpRoles.map(([role, path]) => `${role}: ${getSpellEffectAssetProbeSummary(path)}`);
  lines.push(`text mode: ${canPlaySpellAnimation(slug) ? (hasSpellTextTextures(slug) ? "texture" : "font fallback") : "unavailable"}`);
  lines.push(`animation ready: ${canPlaySpellAnimation(slug) ? "yes" : "no"}`);
  return lines;
}

function hasSpellTextTextures(slug: SpellAnimationSlug): boolean {
  return (
    getSpellEffectAssetProbeSummary(getSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_main")) !== "missing" &&
    getSpellEffectAssetProbeSummary(getSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_shadow")) !== "missing"
  );
}

export function syncSpellAnimationEffect(): void {
  clearSpellEffectAssetCache();
  preloadSpellAnimationPool();
  syncSpellEffectLayout();
}

export function registerSpellAnimationEffect(): void {
  setSpellEffectLayoutEditorHandler(() => {
    syncSpellAnimationEffect();
  });
  syncSpellAnimationEffect();
}

export {
  applySpellEffectAnchorLayout,
  enterSpellEffectLayoutEditor,
  exitSpellEffectLayoutEditor,
  getSpellEffectUserScale,
  isSpellEffectLayoutEditorActive,
  MAX_SPELL_EFFECT_USER_SCALE,
  MIN_SPELL_EFFECT_USER_SCALE,
  resetSpellEffectLayoutSettings,
  syncSpellEffectLayout,
  toggleSpellEffectLayoutEditor,
  updateSpellEffectUserScale
};
