import { ADDON_NAME } from "../../core/config";
import { tryPlayBuffTriggerEffect, type BuffTriggerPlayResult } from "./controller";
import {
  BUFF_TRIGGER_AREA_HEIGHT,
  BUFF_TRIGGER_AREA_WIDTH,
  getBuffTriggerOffsetX,
  getBuffTriggerOffsetY,
  getBuffTriggerUserScale,
  MAX_BUFF_TRIGGER_USER_SCALE,
  MIN_BUFF_TRIGGER_USER_SCALE,
  resetBuffTriggerLayoutSettings,
  updateBuffTriggerOffset,
  updateBuffTriggerUserScale
} from "./layout-settings";

const PREVIEW_STYLE = "mist_breathing";
const PREVIEW_INTERVAL_SECONDS = 2.5;

let dragHandle: WowFrame | undefined;
let controlBar: WowFrame | undefined;
let scaleSlider: WowSlider | undefined;
let scaleValueLabel: WowFontString | undefined;
let previewSequence = 0;
let editModeActive = false;

function formatScale(value: number): string {
  return `${value.toFixed(2)}x`;
}

function readDragHandleOffset(): { offsetX: number; offsetY: number } {
  if (dragHandle === undefined) {
    return {
      offsetX: getBuffTriggerOffsetX(),
      offsetY: getBuffTriggerOffsetY()
    };
  }

  const [, , , x, y] = dragHandle.GetPoint(1);

  return {
    offsetX: x,
    offsetY: y
  };
}

function syncDragHandleFrame(): void {
  if (dragHandle === undefined) {
    return;
  }

  const userScale = getBuffTriggerUserScale();
  dragHandle.SetSize(BUFF_TRIGGER_AREA_WIDTH * userScale, BUFF_TRIGGER_AREA_HEIGHT * userScale);
  dragHandle.ClearAllPoints();
  dragHandle.SetPoint("CENTER", UIParent, "CENTER", getBuffTriggerOffsetX(), getBuffTriggerOffsetY());
}

function previewLayoutEffect(triggerKey = "layout-preview"): BuffTriggerPlayResult {
  return tryPlayBuffTriggerEffect(PREVIEW_STYLE, triggerKey, 0);
}

function schedulePreviewLoop(sequence: number): void {
  if (!editModeActive || sequence !== previewSequence) {
    return;
  }

  previewLayoutEffect(`layout-preview:${sequence}`);

  C_Timer.After(PREVIEW_INTERVAL_SECONDS, () => {
    schedulePreviewLoop(sequence);
  });
}

function createDragHandle(): WowFrame {
  const handle = CreateFrame("Frame", `${ADDON_NAME}BuffTriggerLayoutHandle`, UIParent);
  handle.SetFrameStrata("FULLSCREEN_DIALOG");
  handle.SetFrameLevel(1006);
  handle.EnableMouse(true);
  handle.SetMovable(true);
  handle.RegisterForDrag("LeftButton");

  const backdrop = handle.CreateTexture(undefined, "BACKGROUND");
  backdrop.SetAllPoints?.();
  backdrop.SetColorTexture?.(0.3, 0.9, 0.45, 0.16);

  const border = handle.CreateTexture(undefined, "BORDER");
  border.SetAllPoints?.();
  border.SetColorTexture?.(0.45, 1, 0.6, 0.86);

  const hint = handle.CreateFontString(undefined, "OVERLAY", "GameFontHighlightSmall");
  hint.SetPoint("TOP", handle, "TOP", 0, -8);
  hint.SetText("Drag to move buff trigger effect");

  handle.SetScript("OnDragStart", self => {
    self.StartMoving?.();
  });

  handle.SetScript("OnDragStop", self => {
    self.StopMovingOrSizing?.();
    const { offsetX, offsetY } = readDragHandleOffset();
    updateBuffTriggerOffset(offsetX, offsetY);
    syncDragHandleFrame();
    previewLayoutEffect("layout-preview:drag");
  });

  handle.SetScript("OnEnter", self => {
    GameTooltip.SetOwner(self, "ANCHOR_TOP");
    GameTooltip.SetText("Drag to move buff trigger effect");
    GameTooltip.Show();
  });

  handle.SetScript("OnLeave", () => {
    GameTooltip.Hide();
  });

  return handle;
}

function createControlBar(onDone: () => void): WowFrame {
  const bar = CreateFrame("Frame", `${ADDON_NAME}BuffTriggerLayoutBar`, UIParent);
  bar.SetFrameStrata("FULLSCREEN_DIALOG");
  bar.SetFrameLevel(1007);
  bar.SetSize(420, 92);
  bar.SetPoint("BOTTOM", UIParent, "BOTTOM", 0, 24);

  const background = bar.CreateTexture(undefined, "BACKGROUND");
  background.SetAllPoints?.();
  background.SetColorTexture?.(0, 0, 0, 0.72);

  const title = bar.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
  title.SetPoint("TOPLEFT", bar, "TOPLEFT", 12, -10);
  title.SetText("Adjust buff trigger effect position and scale");

  const slider = CreateFrame("Slider", `${ADDON_NAME}BuffTriggerLayoutScale`, bar, "OptionsSliderTemplate") as WowSlider;
  slider.SetPoint("TOPLEFT", title, "BOTTOMLEFT", 0, -14);
  slider.SetWidth(220);
  slider.SetMinMaxValues(MIN_BUFF_TRIGGER_USER_SCALE, MAX_BUFF_TRIGGER_USER_SCALE);
  slider.SetValueStep(0.05);
  slider.SetObeyStepOnDrag?.(true);

  const low = slider.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
  low.SetPoint("TOPLEFT", slider, "BOTTOMLEFT", 0, 2);
  low.SetText(`${MIN_BUFF_TRIGGER_USER_SCALE.toFixed(1)}`);

  const high = slider.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
  high.SetPoint("TOPRIGHT", slider, "BOTTOMRIGHT", 0, 2);
  high.SetText(`${MAX_BUFF_TRIGGER_USER_SCALE.toFixed(1)}`);

  const valueLabel = bar.CreateFontString(undefined, "ARTWORK", "GameFontHighlight");
  valueLabel.SetPoint("LEFT", slider, "RIGHT", 16, 0);

  slider.SetScript("OnValueChanged", (_self, value) => {
    const nextValue = typeof value === "number" ? value : Number(value);
    updateBuffTriggerUserScale(nextValue);
    syncDragHandleFrame();
    valueLabel.SetText(formatScale(nextValue));
    previewLayoutEffect("layout-preview:scale");
  });

  const doneButton = CreateFrame("Button", `${ADDON_NAME}BuffTriggerLayoutDone`, bar, "UIPanelButtonTemplate");
  doneButton.SetSize(88, 22);
  doneButton.SetPoint("BOTTOMRIGHT", bar, "BOTTOMRIGHT", -12, 10);
  doneButton.SetText("Done");
  doneButton.SetScript("OnClick", onDone);

  const resetButton = CreateFrame("Button", `${ADDON_NAME}BuffTriggerLayoutReset`, bar, "UIPanelButtonTemplate");
  resetButton.SetSize(88, 22);
  resetButton.SetPoint("RIGHT", doneButton, "LEFT", -8, 0);
  resetButton.SetText("Reset");
  resetButton.SetScript("OnClick", () => {
    resetBuffTriggerLayoutSettings();
    syncDragHandleFrame();
    refreshScaleControls();
    previewLayoutEffect("layout-preview:reset");
  });

  scaleSlider = slider;
  scaleValueLabel = valueLabel;
  return bar;
}

function refreshScaleControls(): void {
  if (scaleSlider === undefined || scaleValueLabel === undefined) {
    return;
  }

  const value = getBuffTriggerUserScale();
  scaleSlider.SetValue(value);
  scaleValueLabel.SetText(formatScale(value));
}

export function isBuffTriggerLayoutEditorActive(): boolean {
  return editModeActive;
}

export function enterBuffTriggerLayoutEditor(): void {
  if (editModeActive) {
    refreshScaleControls();
    syncDragHandleFrame();
    previewLayoutEffect("layout-preview:reopen");
    return;
  }

  editModeActive = true;
  previewSequence += 1;
  const sequence = previewSequence;

  if (dragHandle === undefined) {
    dragHandle = createDragHandle();
  }

  if (controlBar === undefined) {
    controlBar = createControlBar(() => {
      exitBuffTriggerLayoutEditor();
    });
  }

  syncDragHandleFrame();
  refreshScaleControls();
  dragHandle.Show();
  controlBar.Show();
  previewLayoutEffect(`layout-preview:start:${sequence}`);
  schedulePreviewLoop(sequence);
}

export function exitBuffTriggerLayoutEditor(): void {
  if (!editModeActive) {
    return;
  }

  editModeActive = false;
  previewSequence += 1;
  dragHandle?.Hide();
  controlBar?.Hide();
  GameTooltip.Hide();
}

export function toggleBuffTriggerLayoutEditor(): boolean {
  if (editModeActive) {
    exitBuffTriggerLayoutEditor();
    return false;
  }

  enterBuffTriggerLayoutEditor();
  return true;
}

export function syncBuffTriggerLayoutEditor(): void {
  syncDragHandleFrame();

  if (editModeActive) {
    refreshScaleControls();
  }
}
