import { ADDON_NAME } from "../../core/config";
import { applySpellEffectAnchorLayout } from "../spell-animation-effect/layout-settings";
import { styleCalloutLabel } from "./client-callout-font";

const FADE_IN_SECONDS = 0.65;
const MAX_HOLD_SECONDS = 2;
const FADE_OUT_SECONDS = 2;
const ALPHA_TICK_SECONDS = 0.05;

let overlayFrame: WowFrame | undefined;
let textLabel: WowFontString | undefined;
let effectSequence = 0;

function applyLabelFont(label: WowFontString): void {
  styleCalloutLabel(label);
}

function updateOverlayPosition(frame: WowFrame): void {
  applySpellEffectAnchorLayout(frame);
}

function ensureOverlayFrame(): WowFrame {
  if (overlayFrame !== undefined && textLabel !== undefined) {
    applyLabelFont(textLabel);
    updateOverlayPosition(overlayFrame);
    return overlayFrame;
  }

  const frame = CreateFrame("Frame", `${ADDON_NAME}SpellTextFrame`, UIParent);
  frame.SetFrameStrata("FULLSCREEN_DIALOG");
  frame.SetFrameLevel(1000);
  frame.SetSize(900, 160);
  updateOverlayPosition(frame);
  frame.EnableMouse(false);
  frame.Hide();

  const label = frame.CreateFontString(`${ADDON_NAME}SpellTextLabel`, "OVERLAY");
  styleCalloutLabel(label);
  label.SetPoint("CENTER", frame, "CENTER", 0, 0);

  overlayFrame = frame;
  textLabel = label;
  return frame;
}

function setOverlayAlpha(alpha: number): void {
  const clamped = Math.max(0, Math.min(1, alpha));

  overlayFrame?.SetAlpha?.(clamped);
  textLabel?.SetAlpha?.(clamped);

  if (textLabel !== undefined) {
    styleCalloutLabel(textLabel, clamped);
  }
}

function cancelEffectSequence(): number {
  effectSequence += 1;
  return effectSequence;
}

function runAlphaTransition(
  frame: WowFrame,
  fromAlpha: number,
  toAlpha: number,
  durationSeconds: number,
  sequence: number,
  onComplete: () => void
): void {
  const steps = Math.max(1, Math.ceil(durationSeconds / ALPHA_TICK_SECONDS));
  const alphaStep = (toAlpha - fromAlpha) / steps;
  let step = 0;
  let alpha = fromAlpha;

  setOverlayAlpha(alpha);

  const tick = (): void => {
    if (sequence !== effectSequence) {
      return;
    }

    step += 1;
    alpha += alphaStep;
    setOverlayAlpha(alpha);

    if (step >= steps) {
      setOverlayAlpha(toAlpha);
      onComplete();
      return;
    }

    C_Timer.After(ALPHA_TICK_SECONDS, tick);
  };

  C_Timer.After(ALPHA_TICK_SECONDS, tick);
}

function scheduleHoldThenFadeOut(frame: WowFrame, sequence: number): void {
  C_Timer.After(MAX_HOLD_SECONDS, () => {
    if (sequence !== effectSequence) {
      return;
    }

    runAlphaTransition(frame, 1, 0, FADE_OUT_SECONDS, sequence, () => {
      if (sequence !== effectSequence) {
        return;
      }

      frame.Hide();
      setOverlayAlpha(1);
    });
  });
}

/** Ensures the shared spell callout anchor frame exists and returns it. */
export function ensureSpellTextAnchorFrame(): WowFrame {
  return ensureOverlayFrame();
}

export function getTextEffectTimingSummary(): string {
  return `in ${FADE_IN_SECONDS}s, hold ${MAX_HOLD_SECONDS}s, out ${FADE_OUT_SECONDS}s`;
}

/** Hides the FontString fallback overlay immediately (e.g. when layered animation plays). */
export function hideSpellTextOverlay(): void {
  cancelEffectSequence();

  if (overlayFrame !== undefined) {
    overlayFrame.Hide();
  }

  setOverlayAlpha(1);
}

/** Shows centered bottom-screen text with fade-in, hold, and fade-out. */
export function showTextEffect(displayText: string): void {
  const frame = ensureOverlayFrame();
  const label = textLabel;

  if (label === undefined) {
    return;
  }

  const sequence = cancelEffectSequence();
  updateOverlayPosition(frame);
  applyLabelFont(label);
  label.SetText(displayText);
  frame.Show();
  setOverlayAlpha(0);

  runAlphaTransition(frame, 0, 1, FADE_IN_SECONDS, sequence, () => {
    if (sequence !== effectSequence) {
      return;
    }

    scheduleHoldThenFadeOut(frame, sequence);
  });
}
