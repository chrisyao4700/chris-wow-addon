import { ADDON_NAME } from "../../core/config";

const FONT_SIZE = 52;
const FADE_IN_SECONDS = 0.65;
const MAX_HOLD_SECONDS = 2;
const FADE_OUT_SECONDS = 2;
const ALPHA_TICK_SECONDS = 0.05;
const TEXT_RGB = { r: 1, g: 0.86, b: 0.35 };
const SHADOW_RGB = { r: 0, g: 0, b: 0 };
const SHADOW_ALPHA = 0.85;
const CHINESE_FONT_PATHS = ["Fonts\\ARKai_T.ttf", "Fonts\\ARHeiti.ttf", "Fonts\\ARKai_C.ttf"];
const TEXT_BOTTOM_SCREEN_PERCENT = 0.05;

let overlayFrame: WowFrame | undefined;
let textLabel: WowFontString | undefined;
let effectSequence = 0;

function applyLabelFont(label: WowFontString): void {
  const locale = GetLocale();

  if (locale === "zhCN" || locale === "zhTW") {
    label.SetFont(CHINESE_FONT_PATHS[0], FONT_SIZE, "OUTLINE");
    return;
  }

  for (const fontPath of CHINESE_FONT_PATHS) {
    label.SetFont(fontPath, FONT_SIZE, "OUTLINE");
  }
}

function getTextBottomYOffset(): number {
  return UIParent.GetHeight() * TEXT_BOTTOM_SCREEN_PERCENT;
}

function updateOverlayPosition(frame: WowFrame): void {
  frame.ClearAllPoints();
  frame.SetPoint("BOTTOM", UIParent, "BOTTOM", 0, getTextBottomYOffset());
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
  applyLabelFont(label);
  label.SetTextColor(TEXT_RGB.r, TEXT_RGB.g, TEXT_RGB.b, 1);
  label.SetShadowColor(SHADOW_RGB.r, SHADOW_RGB.g, SHADOW_RGB.b, SHADOW_ALPHA);
  label.SetShadowOffset(2, -2);
  label.SetPoint("CENTER", frame, "CENTER", 0, 0);
  label.SetJustifyH("CENTER");
  label.SetJustifyV("MIDDLE");

  overlayFrame = frame;
  textLabel = label;
  return frame;
}

function setOverlayAlpha(alpha: number): void {
  const clamped = Math.max(0, Math.min(1, alpha));

  overlayFrame?.SetAlpha?.(clamped);
  textLabel?.SetAlpha?.(clamped);

  if (textLabel !== undefined) {
    textLabel.SetTextColor(TEXT_RGB.r, TEXT_RGB.g, TEXT_RGB.b, clamped);
    textLabel.SetShadowColor(SHADOW_RGB.r, SHADOW_RGB.g, SHADOW_RGB.b, SHADOW_ALPHA * clamped);
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

export function getTextEffectTimingSummary(): string {
  return `in ${FADE_IN_SECONDS}s, hold ${MAX_HOLD_SECONDS}s, out ${FADE_OUT_SECONDS}s`;
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
