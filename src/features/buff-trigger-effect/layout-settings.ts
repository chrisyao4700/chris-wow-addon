import { ADDON_NAME } from "../../core/config";
import {
  getSettings,
  resetBuffTriggerEffectLayout,
  setBuffTriggerEffectOffsetX,
  setBuffTriggerEffectOffsetY,
  setBuffTriggerEffectUserScale
} from "../../core/db";
import type { BuffTriggerStyleSlug } from "./style-slugs";

export const BUFF_TRIGGER_AREA_WIDTH = 760;
export const BUFF_TRIGGER_AREA_HEIGHT = 480;
export const DEFAULT_BUFF_TRIGGER_OFFSET_Y = 120;
export const DEFAULT_BUFF_TRIGGER_USER_SCALE = 1;
export const MIN_BUFF_TRIGGER_USER_SCALE = 0.5;
export const MAX_BUFF_TRIGGER_USER_SCALE = 2;

let areaFrame: WowFrame | undefined;

const STYLE_SLOT_OFFSETS: Record<BuffTriggerStyleSlug, { x: number; y: number }> = {
  sun_breathing: { x: -240, y: 110 },
  moon_breathing: { x: -120, y: 110 },
  water_breathing: { x: 0, y: 110 },
  flame_breathing: { x: 120, y: 110 },
  thunder_breathing: { x: 240, y: 110 },
  wind_breathing: { x: -240, y: 0 },
  stone_breathing: { x: -120, y: 0 },
  flower_breathing: { x: 0, y: 0 },
  insect_breathing: { x: 120, y: 0 },
  serpent_breathing: { x: 240, y: 0 },
  love_breathing: { x: -240, y: -110 },
  mist_breathing: { x: -120, y: -110 },
  sound_breathing: { x: 0, y: -110 },
  beast_breathing: { x: 120, y: -110 },
  blood_art: { x: 240, y: -110 }
};

export function getBuffTriggerUserScale(): number {
  return getSettings().buffTriggerEffectUserScale;
}

export function getBuffTriggerOffsetX(): number {
  return getSettings().buffTriggerEffectOffsetX;
}

export function getBuffTriggerOffsetY(): number {
  return getSettings().buffTriggerEffectOffsetY;
}

export function applyBuffTriggerAnchorLayout(frame: WowFrame): void {
  frame.ClearAllPoints();
  frame.SetPoint(
    "CENTER",
    UIParent,
    "CENTER",
    getBuffTriggerOffsetX(),
    getBuffTriggerOffsetY()
  );
  frame.SetScale?.(getBuffTriggerUserScale());
}

export function ensureBuffTriggerEffectArea(): WowFrame {
  if (areaFrame === undefined) {
    areaFrame = CreateFrame("Frame", `${ADDON_NAME}BuffTriggerEffectArea`, UIParent);
    areaFrame.SetFrameStrata("FULLSCREEN_DIALOG");
    areaFrame.SetFrameLevel(1003);
    areaFrame.SetSize(BUFF_TRIGGER_AREA_WIDTH, BUFF_TRIGGER_AREA_HEIGHT);
    areaFrame.EnableMouse(false);
  }

  applyBuffTriggerAnchorLayout(areaFrame);
  areaFrame.Show();
  return areaFrame;
}

export function updateBuffTriggerUserScale(userScale: number): void {
  const clamped = Math.max(MIN_BUFF_TRIGGER_USER_SCALE, Math.min(MAX_BUFF_TRIGGER_USER_SCALE, userScale));
  setBuffTriggerEffectUserScale(clamped);
  applyBuffTriggerAnchorLayout(ensureBuffTriggerEffectArea());
}

export function updateBuffTriggerOffset(offsetX: number, offsetY: number): void {
  setBuffTriggerEffectOffsetX(offsetX);
  setBuffTriggerEffectOffsetY(offsetY);
  applyBuffTriggerAnchorLayout(ensureBuffTriggerEffectArea());
}

export function resetBuffTriggerLayoutSettings(): void {
  resetBuffTriggerEffectLayout();
  applyBuffTriggerAnchorLayout(ensureBuffTriggerEffectArea());
}

export function getBuffTriggerStyleOffset(styleSlug: BuffTriggerStyleSlug): { x: number; y: number } {
  return STYLE_SLOT_OFFSETS[styleSlug];
}
