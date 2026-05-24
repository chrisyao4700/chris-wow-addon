import { EFFECT_DISPLAY_SCALE } from "./animation-utils";
import { getSettings, resetSpellEffectLayout, setSpellEffectOffsetX, setSpellEffectOffsetY, setSpellEffectUserScale } from "../../core/db";

export const TEXT_BOTTOM_SCREEN_PERCENT = 0.05;
export const DEFAULT_SPELL_EFFECT_USER_SCALE = 1;
export const MIN_SPELL_EFFECT_USER_SCALE = 0.5;
export const MAX_SPELL_EFFECT_USER_SCALE = 2;
export const SPELL_EFFECT_LAYOUT_WIDTH = 900 * EFFECT_DISPLAY_SCALE;
export const SPELL_EFFECT_LAYOUT_HEIGHT = 360 * EFFECT_DISPLAY_SCALE;

export function getTextBottomYOffset(): number {
  return UIParent.GetHeight() * TEXT_BOTTOM_SCREEN_PERCENT;
}

export function getSpellEffectUserScale(): number {
  return getSettings().spellEffectUserScale;
}

export function getSpellEffectOffsetX(): number {
  return getSettings().spellEffectOffsetX;
}

export function getSpellEffectOffsetY(): number {
  return getSettings().spellEffectOffsetY;
}

export function getSpellEffectLayoutSize(): { width: number; height: number } {
  const userScale = getSpellEffectUserScale();

  return {
    width: SPELL_EFFECT_LAYOUT_WIDTH * userScale,
    height: SPELL_EFFECT_LAYOUT_HEIGHT * userScale
  };
}

export function applySpellEffectAnchorLayout(frame: WowFrame): void {
  frame.ClearAllPoints();
  frame.SetPoint(
    "BOTTOM",
    UIParent,
    "BOTTOM",
    getSpellEffectOffsetX(),
    getTextBottomYOffset() + getSpellEffectOffsetY()
  );
  frame.SetScale?.(getSpellEffectUserScale());
}

export function updateSpellEffectUserScale(userScale: number): void {
  const clamped = Math.max(MIN_SPELL_EFFECT_USER_SCALE, Math.min(MAX_SPELL_EFFECT_USER_SCALE, userScale));
  setSpellEffectUserScale(clamped);
}

export function updateSpellEffectOffset(offsetX: number, offsetY: number): void {
  setSpellEffectOffsetX(offsetX);
  setSpellEffectOffsetY(offsetY);
}

export function resetSpellEffectLayoutSettings(): void {
  resetSpellEffectLayout();
}
