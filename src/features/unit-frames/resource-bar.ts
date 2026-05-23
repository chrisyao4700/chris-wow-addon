import type { BreathRgb } from "./breath-styles";
import type { BarRgb } from "./bar-colors";

const TROUGH_TEXTURE = "Interface\\Buttons\\WHITE8x8";
const GLOSS_TEXTURE = "Interface\\Buttons\\WHITE8x8";

export type ResourceBarElements = {
  container: WowFrame;
  border: WowTexture;
  trough: WowTexture;
  fill: WowTexture;
  gloss: WowTexture;
  label: WowFontString;
  value: WowFontString;
  width: number;
  height: number;
  lastCurrent?: number;
  lastMax?: number;
  lastLabelText?: string;
  lastShowValues?: boolean;
  lastTintKey?: string;
};

export function createResourceBar(
  parent: WowFrame,
  name: string,
  width: number,
  height: number,
  point: WowPoint,
  relativeTo: WowFrame,
  relativePoint: WowPoint,
  x: number,
  y: number,
  createLabel: (parent: WowFrame, template: string, size: number) => WowFontString
): ResourceBarElements {
  const container = CreateFrame("Frame", name, parent);
  container.SetSize(width, height + 6);
  container.SetPoint(point, relativeTo, relativePoint, x, y);
  container.EnableMouse(false);

  const border = container.CreateTexture(undefined, "BACKGROUND");
  border.SetPoint("TOPLEFT", container, "TOPLEFT", 0, 0);
  border.SetSize(width, height + 4);
  border.SetTexture(TROUGH_TEXTURE);
  border.SetVertexColor?.(0.02, 0.02, 0.02, 0.98);

  const trough = container.CreateTexture(undefined, "ARTWORK");
  trough.SetPoint("TOPLEFT", container, "TOPLEFT", 1, -1);
  trough.SetSize(width - 2, height + 2);
  trough.SetTexture(TROUGH_TEXTURE);
  trough.SetVertexColor?.(0.06, 0.05, 0.05, 0.95);

  const fill = container.CreateTexture(undefined, "ARTWORK", undefined, 1);
  fill.SetPoint("TOPLEFT", trough, "TOPLEFT", 0, 0);
  fill.SetSize(0, height + 2);
  fill.SetTexture(TROUGH_TEXTURE);
  fill.Hide();

  const gloss = container.CreateTexture(undefined, "OVERLAY", undefined, 1);
  gloss.SetPoint("TOPLEFT", fill, "TOPLEFT", 0, 0);
  gloss.SetSize(width - 2, Math.max(2, Math.floor((height + 2) / 2)));
  gloss.SetTexture(GLOSS_TEXTURE);
  gloss.SetVertexColor?.(1, 1, 1, 0.18);
  gloss.SetBlendMode?.("ADD");
  gloss.Hide();

  const label = createLabel(container, "GameFontHighlightSmall", 10);
  label.SetPoint("LEFT", trough, "LEFT", 6, 0);
  label.SetJustifyH("LEFT");

  const value = createLabel(container, "GameFontHighlightSmall", 10);
  value.SetPoint("RIGHT", trough, "RIGHT", -6, 0);
  value.SetJustifyH("RIGHT");

  return { container, border, trough, fill, gloss, label, value, width: width - 2, height: height + 2 };
}

export function updateResourceBar(
  bar: ResourceBarElements,
  current: number,
  max: number,
  primary: BarRgb,
  accent: BarRgb,
  border: BarRgb,
  labelText: string,
  showValues: boolean,
  tintKey = ""
): void {
  const safeMax = Math.max(1, max);
  const safeCurrent = Math.max(0, current);

  if (
    bar.lastCurrent === safeCurrent &&
    bar.lastMax === safeMax &&
    bar.lastLabelText === labelText &&
    bar.lastShowValues === showValues &&
    bar.lastTintKey === tintKey
  ) {
    return;
  }

  bar.lastCurrent = safeCurrent;
  bar.lastMax = safeMax;
  bar.lastLabelText = labelText;
  bar.lastShowValues = showValues;
  bar.lastTintKey = tintKey;

  const ratio = Math.min(1, safeCurrent / safeMax);
  const showFill = ratio > 0;

  if (showFill) {
    const fillWidth = Math.max(1, bar.width * ratio);
    bar.fill.SetSize(fillWidth, bar.height);
    bar.gloss.SetSize(fillWidth, Math.max(2, Math.floor(bar.height / 2)));
    bar.fill.Show();
    bar.gloss.Show();
  } else {
    bar.fill.SetSize(0, bar.height);
    bar.gloss.SetSize(0, Math.max(2, Math.floor(bar.height / 2)));
    bar.fill.Hide();
    bar.gloss.Hide();
  }

  bar.fill.SetVertexColor?.(primary.r, primary.g, primary.b, 1);
  bar.border.SetVertexColor?.(border.r * 0.55, border.g * 0.55, border.b * 0.55, 1);
  bar.trough.SetVertexColor?.(accent.r * 0.22, accent.g * 0.22, accent.b * 0.22, 0.95);

  bar.label.SetText(labelText);

  if (!showValues) {
    bar.value.SetText("");
    return;
  }

  const percent = Math.floor(ratio * 100);
  bar.value.SetText(`${percent}%`);
}

export function setResourceBarVisible(bar: ResourceBarElements, visible: boolean): void {
  if (visible) {
    bar.container.Show();
    return;
  }

  bar.container.Hide();
}
