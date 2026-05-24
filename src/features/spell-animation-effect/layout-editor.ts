import { ADDON_NAME } from "../../core/config";
import { getMessages } from "../../core/localization";
import { rogueSpellTextEffectMapping } from "../spell-text-effect/mappings/classes/rogue";
import {
  ensureSpellTextAnchorFrame,
  hideSpellTextOverlay,
  showTextEffect
} from "../spell-text-effect/text-effect";
import { setSpellAnimationAnchorFrame, tryShowSpellAnimationEffect } from "./controller";
import {
  applySpellEffectAnchorLayout,
  getSpellEffectLayoutSize,
  getSpellEffectOffsetX,
  getSpellEffectOffsetY,
  getSpellEffectUserScale,
  getTextBottomYOffset,
  resetSpellEffectLayoutSettings,
  updateSpellEffectOffset,
  updateSpellEffectUserScale
} from "./layout-settings";

const PREVIEW_DISPLAY_TEXT =
  rogueSpellTextEffectMapping.bindings[0]?.displayText ?? "Spell text effect preview";
const PREVIEW_INTERVAL_SECONDS = 2.5;

let dragHandle: WowFrame | undefined;
let controlBar: WowFrame | undefined;
let scaleSlider: WowSlider | undefined;
let scaleValueLabel: WowFontString | undefined;
let previewSequence = 0;
let editModeActive = false;
let onLayoutChanged: (() => void) | undefined;

function readDragHandleOffset(): { offsetX: number; offsetY: number } {
  if (dragHandle === undefined) {
    return {
      offsetX: getSpellEffectOffsetX(),
      offsetY: getSpellEffectOffsetY()
    };
  }

  const [, , , x, y] = dragHandle.GetPoint(1);

  return {
    offsetX: x,
    offsetY: y - getTextBottomYOffset()
  };
}

function syncDragHandleFrame(): void {
  if (dragHandle === undefined) {
    return;
  }

  const { width, height } = getSpellEffectLayoutSize();

  dragHandle.SetSize(width, height);
  dragHandle.ClearAllPoints();
  dragHandle.SetPoint(
    "BOTTOM",
    UIParent,
    "BOTTOM",
    getSpellEffectOffsetX(),
    getTextBottomYOffset() + getSpellEffectOffsetY()
  );
}

function syncAnchorFromSettings(): void {
  applySpellEffectAnchorLayout(ensureSpellTextAnchorFrame());
  syncDragHandleFrame();
}

function notifyLayoutChanged(): void {
  syncAnchorFromSettings();
  onLayoutChanged?.();
}

function previewLayoutEffect(): void {
  setSpellAnimationAnchorFrame(ensureSpellTextAnchorFrame());

  const playResult = tryShowSpellAnimationEffect(PREVIEW_DISPLAY_TEXT);

  if (playResult === "played" || playResult === "skipped_duplicate") {
    hideSpellTextOverlay();
    return;
  }

  showTextEffect(PREVIEW_DISPLAY_TEXT);
}

function schedulePreviewLoop(sequence: number): void {
  if (!editModeActive || sequence !== previewSequence) {
    return;
  }

  previewLayoutEffect();

  C_Timer.After(PREVIEW_INTERVAL_SECONDS, () => {
    schedulePreviewLoop(sequence);
  });
}

function createDragHandle(): WowFrame {
  const handle = CreateFrame("Frame", `${ADDON_NAME}SpellEffectLayoutHandle`, UIParent);
  handle.SetFrameStrata("FULLSCREEN_DIALOG");
  handle.SetFrameLevel(1002);
  handle.EnableMouse(true);
  handle.SetMovable(true);
  handle.RegisterForDrag("LeftButton");

  const backdrop = handle.CreateTexture(undefined, "BACKGROUND");
  backdrop.SetAllPoints?.();
  backdrop.SetColorTexture?.(0.2, 0.75, 1, 0.18);

  const border = handle.CreateTexture(undefined, "BORDER");
  border.SetAllPoints?.();
  border.SetColorTexture?.(0.35, 0.9, 1, 0.85);

  const inner = handle.CreateTexture(undefined, "ARTWORK");
  inner.SetPoint("TOPLEFT", handle, "TOPLEFT", 1, -1);
  inner.SetPoint("BOTTOMRIGHT", handle, "BOTTOMRIGHT", -1, 1);
  inner.SetColorTexture?.(0.05, 0.12, 0.18, 0.35);

  const hint = handle.CreateFontString(undefined, "OVERLAY", "GameFontHighlightSmall");
  hint.SetPoint("TOP", handle, "TOP", 0, -8);
  hint.SetText(getMessages().spellEffectLayoutDragHint);

  handle.SetScript("OnDragStart", self => {
    self.StartMoving?.();
  });

  handle.SetScript("OnDragStop", self => {
    self.StopMovingOrSizing?.();
    const { offsetX, offsetY } = readDragHandleOffset();
    updateSpellEffectOffset(offsetX, offsetY);
    notifyLayoutChanged();
    previewLayoutEffect();
  });

  handle.SetScript("OnEnter", self => {
    GameTooltip.SetOwner(self, "ANCHOR_TOP");
    GameTooltip.SetText(getMessages().spellEffectLayoutDragHint);
    GameTooltip.Show();
  });

  handle.SetScript("OnLeave", () => {
    GameTooltip.Hide();
  });

  return handle;
}

function createControlBar(onScaleChanged: (value: number) => void, onDone: () => void, onReset: () => void): WowFrame {
  const bar = CreateFrame("Frame", `${ADDON_NAME}SpellEffectLayoutBar`, UIParent);
  bar.SetFrameStrata("FULLSCREEN_DIALOG");
  bar.SetFrameLevel(1003);
  bar.SetSize(420, 92);
  bar.SetPoint("BOTTOM", UIParent, "BOTTOM", 0, 24);

  const background = bar.CreateTexture(undefined, "BACKGROUND");
  background.SetAllPoints?.();
  background.SetColorTexture?.(0, 0, 0, 0.72);

  const title = bar.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
  title.SetPoint("TOPLEFT", bar, "TOPLEFT", 12, -10);
  title.SetText(getMessages().spellEffectLayoutEditorTitle);

  const slider = CreateFrame("Slider", `${ADDON_NAME}SpellEffectLayoutScale`, bar, "OptionsSliderTemplate") as WowSlider;
  slider.SetPoint("TOPLEFT", title, "BOTTOMLEFT", 0, -14);
  slider.SetWidth(220);
  slider.SetMinMaxValues(0.5, 2);
  slider.SetValueStep(0.05);
  slider.SetObeyStepOnDrag?.(true);

  const low = slider.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
  low.SetPoint("TOPLEFT", slider, "BOTTOMLEFT", 0, 2);
  low.SetText("0.5");

  const high = slider.CreateFontString(undefined, "ARTWORK", "GameFontHighlightSmall");
  high.SetPoint("TOPRIGHT", slider, "BOTTOMRIGHT", 0, 2);
  high.SetText("2.0");

  const valueLabel = bar.CreateFontString(undefined, "ARTWORK", "GameFontHighlight");
  valueLabel.SetPoint("LEFT", slider, "RIGHT", 16, 0);

  slider.SetScript("OnValueChanged", (_self, value) => {
    const nextValue = typeof value === "number" ? value : Number(value);
    onScaleChanged(nextValue);
    valueLabel.SetText(getMessages().spellEffectLayoutScaleValue(nextValue));
  });

  const doneButton = CreateFrame("Button", `${ADDON_NAME}SpellEffectLayoutDone`, bar, "UIPanelButtonTemplate");
  doneButton.SetSize(88, 22);
  doneButton.SetPoint("BOTTOMRIGHT", bar, "BOTTOMRIGHT", -12, 10);
  doneButton.SetText(getMessages().spellEffectLayoutDone);
  doneButton.SetScript("OnClick", onDone);

  const resetButton = CreateFrame("Button", `${ADDON_NAME}SpellEffectLayoutReset`, bar, "UIPanelButtonTemplate");
  resetButton.SetSize(88, 22);
  resetButton.SetPoint("RIGHT", doneButton, "LEFT", -8, 0);
  resetButton.SetText(getMessages().spellEffectLayoutReset);
  resetButton.SetScript("OnClick", onReset);

  scaleSlider = slider;
  scaleValueLabel = valueLabel;
  return bar;
}

function refreshScaleControls(): void {
  if (scaleSlider === undefined || scaleValueLabel === undefined) {
    return;
  }

  scaleSlider.SetValue(getSpellEffectUserScale());
  scaleValueLabel.SetText(getMessages().spellEffectLayoutScaleValue(getSpellEffectUserScale()));
}

export function isSpellEffectLayoutEditorActive(): boolean {
  return editModeActive;
}

export function setSpellEffectLayoutEditorHandler(handler: (() => void) | undefined): void {
  onLayoutChanged = handler;
}

export function enterSpellEffectLayoutEditor(): void {
  if (editModeActive) {
    refreshScaleControls();
    syncAnchorFromSettings();
    previewLayoutEffect();
    return;
  }

  editModeActive = true;
  previewSequence += 1;
  const sequence = previewSequence;

  if (dragHandle === undefined) {
    dragHandle = createDragHandle();
  }

  if (controlBar === undefined) {
    controlBar = createControlBar(
      value => {
        updateSpellEffectUserScale(value);
        notifyLayoutChanged();
        previewLayoutEffect();
      },
      () => exitSpellEffectLayoutEditor(),
      () => {
        resetSpellEffectLayoutSettings();
        notifyLayoutChanged();
        refreshScaleControls();
        previewLayoutEffect();
      }
    );
  }

  syncAnchorFromSettings();
  refreshScaleControls();
  dragHandle.Show();
  controlBar.Show();
  previewLayoutEffect();
  schedulePreviewLoop(sequence);
}

export function exitSpellEffectLayoutEditor(): void {
  if (!editModeActive) {
    return;
  }

  editModeActive = false;
  previewSequence += 1;
  dragHandle?.Hide();
  controlBar?.Hide();
  GameTooltip.Hide();
}

export function toggleSpellEffectLayoutEditor(): boolean {
  if (editModeActive) {
    exitSpellEffectLayoutEditor();
    return false;
  }

  enterSpellEffectLayoutEditor();
  return true;
}

export function syncSpellEffectLayout(): void {
  syncAnchorFromSettings();

  if (editModeActive) {
    refreshScaleControls();
  }
}
