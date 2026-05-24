/**
 * Client 楷体 (ARKai) for spell callouts — no bundled fonts.
 * ARKai_T is the main Chinese UI Kai face shipped with zhCN/zhTW clients.
 */

import { ADDON_NAME } from "../../core/config";

export const CALLOUT_FONT_SIZE = 52;
export const CALLOUT_FONT_FLAGS = "OUTLINE";
/** Off-white brush fill — not the legacy gold fallback color. */
export const CALLOUT_TEXT_RGB = { r: 0.96, g: 0.94, b: 0.88 };
export const CALLOUT_SHADOW_RGB = { r: 0.05, g: 0.05, b: 0.08 };
export const CALLOUT_SHADOW_ALPHA = 0.9;

const FONT_PROBE_TEXT = "兽之呼吸";
const FRIZQT_FONT = "Fonts\\FRIZQT__.TTF";
const KAI_FONT = "Fonts\\ARKai_T.ttf";
const KAI_FONT_ALT = "Fonts\\ARKai_C.ttf";

const CLIENT_FONT_CANDIDATES = [
  { path: KAI_FONT, label: "ARKai_T (楷体)" },
  { path: KAI_FONT_ALT, label: "ARKai_C (楷体)" },
  { path: "Fonts\\bkai00m.ttf", label: "bkai00m (标楷)" },
  { path: "Fonts\\bKAI00M.ttf", label: "bKAI00M (标楷)" },
  { path: "Fonts\\ARHeiti.ttf", label: "ARHeiti (黑体)" },
  { path: "Fonts\\ARHei.ttf", label: "ARHei (黑体)" },
  { path: FRIZQT_FONT, label: "FRIZQT" }
] as const;

let resolvedFontPath: string | undefined;
let resolvedFontLabel: string | undefined;
let fontProbeLabel: WowFontString | undefined;

function ensureFontProbeLabel(): WowFontString {
  if (fontProbeLabel === undefined) {
    const probeFrame = CreateFrame("Frame", `${ADDON_NAME}CalloutFontProbe`, UIParent);
    probeFrame.Hide();
    fontProbeLabel = probeFrame.CreateFontString(undefined, "OVERLAY");
  }

  return fontProbeLabel;
}

function measureProbeWidth(label: WowFontString, fontPath: string, size: number): number {
  const [ok] = pcall(() => {
    label.SetFont(fontPath, size, CALLOUT_FONT_FLAGS);
  });

  if (!ok) {
    return 0;
  }

  label.SetText(FONT_PROBE_TEXT);
  return label.GetStringWidth();
}

function resolveClientCalloutFont(): { path: string; label: string } {
  if (resolvedFontPath !== undefined && resolvedFontLabel !== undefined) {
    return { path: resolvedFontPath, label: resolvedFontLabel };
  }

  const probe = ensureFontProbeLabel();
  const frizWidth = measureProbeWidth(probe, FRIZQT_FONT, CALLOUT_FONT_SIZE);

  for (const candidate of CLIENT_FONT_CANDIDATES) {
    const width = measureProbeWidth(probe, candidate.path, CALLOUT_FONT_SIZE);

    if (width <= 0) {
      continue;
    }

    if (candidate.path === FRIZQT_FONT) {
      resolvedFontPath = candidate.path;
      resolvedFontLabel = candidate.label;
      return { path: candidate.path, label: candidate.label };
    }

    if (frizWidth <= 0 || width > frizWidth) {
      resolvedFontPath = candidate.path;
      resolvedFontLabel = candidate.label;
      return { path: candidate.path, label: candidate.label };
    }
  }

  resolvedFontPath = FRIZQT_FONT;
  resolvedFontLabel = "FRIZQT";
  return { path: FRIZQT_FONT, label: resolvedFontLabel };
}

export function resolveClientCalloutFontPath(): string {
  return resolveClientCalloutFont().path;
}

export function applyClientCalloutFont(label: WowFontString, size = CALLOUT_FONT_SIZE): string {
  const path = resolveClientCalloutFontPath();
  label.SetFont(path, size, CALLOUT_FONT_FLAGS);
  return path;
}

export function styleCalloutLabel(label: WowFontString, alpha = 1, size = CALLOUT_FONT_SIZE): void {
  applyClientCalloutFont(label, size);
  label.SetTextColor(CALLOUT_TEXT_RGB.r, CALLOUT_TEXT_RGB.g, CALLOUT_TEXT_RGB.b, alpha);
  label.SetShadowColor(
    CALLOUT_SHADOW_RGB.r,
    CALLOUT_SHADOW_RGB.g,
    CALLOUT_SHADOW_RGB.b,
    CALLOUT_SHADOW_ALPHA * alpha
  );
  label.SetShadowOffset(2, -2);
  label.SetJustifyH("CENTER");
  label.SetJustifyV("MIDDLE");
}

export function getClientCalloutFontSummary(): string {
  return resolveClientCalloutFont().label;
}

export function clearClientCalloutFontCache(): void {
  resolvedFontPath = undefined;
  resolvedFontLabel = undefined;
}
