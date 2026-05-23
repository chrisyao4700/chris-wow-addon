import { getSettings } from "../../core/db";
import { runUnitFrameDebugGuard, traceUnitFrame } from "./debug";

const BLIZZARD_UNIT_FRAME_NAMES = [
  "PlayerFrame",
  "TargetFrame",
  "TargetFrameToT",
  "FocusFrame",
  "ComboFrame",
  "ComboPointPlayerFrame"
] as const;

let blizzardHooksInstalled = false;
let blizzardFramesSuppressed = false;
let unitFrameHider: WowFrame | undefined;
let suppressingBlizzardFrame = false;

function isSuppressionEnabled(): boolean {
  return getSettings().enableDemonSlayerUnitFrames;
}

function isCombatLocked(): boolean {
  return InCombatLockdown !== undefined && InCombatLockdown();
}

function getBlizzardFrame(name: string): WowFrame | undefined {
  const frame = _G[name];

  if (frame !== undefined && typeof frame === "object") {
    return frame as WowFrame;
  }

  return undefined;
}

function ensureUnitFrameHider(): WowFrame {
  if (unitFrameHider === undefined) {
    unitFrameHider = CreateFrame("Frame", "ChrisWowAddonUnitFrameHider", UIParent);
    unitFrameHider.Hide();
  }

  return unitFrameHider;
}

function isFrameSuppressed(frame: WowFrame): boolean {
  const hider = unitFrameHider;

  return hider !== undefined && frame.GetParent?.() === hider;
}

function needsSuppression(frame: WowFrame): boolean {
  if (frame.IsShown?.() === true) {
    return true;
  }

  if (isFrameSuppressed(frame)) {
    return false;
  }

  return !isCombatLocked();
}

function suppressBlizzardFrame(frameName: string, frame: WowFrame): void {
  if (!needsSuppression(frame)) {
    return;
  }

  traceUnitFrame(`suppress:${frameName}`);

  if (suppressingBlizzardFrame) {
    traceUnitFrame(`suppress:${frameName}:skipped-reentrant`);
    return;
  }

  runUnitFrameDebugGuard(`suppress:${frameName}`, () => {
    suppressingBlizzardFrame = true;

    try {
      if (frame.IsShown?.() === true) {
        frame.Hide();
      }

      frame.SetAlpha?.(0);

      if (!isCombatLocked() && !isFrameSuppressed(frame)) {
        frame.SetParent(ensureUnitFrameHider());
      }
    } finally {
      suppressingBlizzardFrame = false;
    }
  });
}

function suppressBlizzardFrames(frameNames: readonly string[]): void {
  if (!isSuppressionEnabled()) {
    return;
  }

  for (const frameName of frameNames) {
    const frame = getBlizzardFrame(frameName);

    if (frame !== undefined) {
      suppressBlizzardFrame(frameName, frame);
    }
  }
}

function restoreBlizzardFrame(frame: WowFrame): void {
  frame.SetParent(UIParent);
  frame.SetAlpha?.(1);
  frame.Show();
}

function hookBlizzardFrameReshow(frameName: string, frame: WowFrame): void {
  if (frame.HookScript === undefined) {
    return;
  }

  frame.HookScript("OnShow", () => {
    if (!blizzardFramesSuppressed || !isSuppressionEnabled()) {
      return;
    }

    suppressBlizzardFrame(frameName, frame);
  });
}

export function hideBlizzardUnitFrames(): void {
  if (!isSuppressionEnabled()) {
    return;
  }

  traceUnitFrame("hideBlizzardUnitFrames");
  suppressBlizzardFrames(BLIZZARD_UNIT_FRAME_NAMES);
}

function showBlizzardUnitFrames(): void {
  traceUnitFrame("showBlizzardUnitFrames");

  for (const frameName of BLIZZARD_UNIT_FRAME_NAMES) {
    const frame = getBlizzardFrame(frameName);

    if (frame !== undefined) {
      restoreBlizzardFrame(frame);
    }
  }
}

export function installBlizzardUnitFrameSuppression(): void {
  if (blizzardHooksInstalled) {
    return;
  }

  blizzardHooksInstalled = true;

  for (const frameName of BLIZZARD_UNIT_FRAME_NAMES) {
    const frame = getBlizzardFrame(frameName);

    if (frame !== undefined) {
      hookBlizzardFrameReshow(frameName, frame);
    }
  }
}

export function syncBlizzardUnitFrameSuppression(suppress: boolean): void {
  if (suppress) {
    installBlizzardUnitFrameSuppression();
    hideBlizzardUnitFrames();
    blizzardFramesSuppressed = true;
    return;
  }

  if (!blizzardFramesSuppressed) {
    return;
  }

  blizzardFramesSuppressed = false;
  showBlizzardUnitFrames();
}

export function isBlizzardUnitFrameSuppressionActive(): boolean {
  return blizzardFramesSuppressed;
}
