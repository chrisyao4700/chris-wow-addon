import { getSystemButtonFrame, updateSystemFrameWidth } from "../anchor-frames";
import {
  BAG_ROW_Y,
  BAG_BUTTON_NAMES,
  MICRO_BUTTON_OVERLAY_PAIRS,
  MICRO_ROW_Y,
  SYSTEM_BUTTON_GAP,
  SYSTEM_BUTTON_SIZE
} from "../constants";
import { canLayoutFrame, captureFrame, getFrame, hookLayoutFrame, restoreFrames } from "../frame-store";
import { isCombatLocked } from "../layout-state";
import { getBagButtonNames, getMicroButtonNames } from "../names";

function getSystemButtonXOffset(placedColumn: number): number {
  return -placedColumn * (SYSTEM_BUTTON_SIZE + SYSTEM_BUTTON_GAP);
}

function getSystemRowWidth(buttonCount: number): number {
  if (buttonCount <= 0) {
    return SYSTEM_BUTTON_SIZE;
  }

  return buttonCount * SYSTEM_BUTTON_SIZE + Math.max(0, buttonCount - 1) * SYSTEM_BUTTON_GAP;
}

function layoutSystemRowButton(
  button: WowFrame,
  name: string,
  placedColumn: number,
  rowYOffset: number,
  onReshow: () => void
): void {
  const systemButtonFrame = getSystemButtonFrame();

  if (systemButtonFrame === undefined) {
    return;
  }

  captureFrame(name, button);
  hookLayoutFrame(name, button, onReshow);
  button.SetParent(systemButtonFrame);
  button.ClearAllPoints();
  button.SetSize(SYSTEM_BUTTON_SIZE, SYSTEM_BUTTON_SIZE);
  button.SetScale(1);
  button.SetPoint(
    "BOTTOMRIGHT",
    systemButtonFrame,
    "BOTTOMRIGHT",
    getSystemButtonXOffset(placedColumn),
    rowYOffset
  );
  button.Show();
}

function shouldSkipMicroButtonPlacement(name: string): boolean {
  for (const [, anchorName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    if (name === anchorName) {
      return false;
    }
  }

  for (const [overlayName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    if (name === overlayName) {
      return true;
    }
  }

  return false;
}

function applyMicroButtonOverlays(onReshow: () => void): void {
  const systemButtonFrame = getSystemButtonFrame();

  if (systemButtonFrame === undefined) {
    return;
  }

  for (const [overlayName, anchorName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    const overlay = getFrame(overlayName);
    const anchor = getFrame(anchorName);

    if (!canLayoutFrame(overlay) || !canLayoutFrame(anchor)) {
      continue;
    }

    captureFrame(overlayName, overlay);
    hookLayoutFrame(overlayName, overlay, onReshow);
    overlay.SetParent(systemButtonFrame);
    overlay.ClearAllPoints();
    overlay.SetSize(SYSTEM_BUTTON_SIZE, SYSTEM_BUTTON_SIZE);
    overlay.SetScale(1);
    overlay.SetPoint("BOTTOMRIGHT", anchor, "BOTTOMRIGHT", 0, 0);
    overlay.Show();
  }
}

function applyBagButtons(onReshow: () => void): number {
  const systemButtonFrame = getSystemButtonFrame();

  if (systemButtonFrame === undefined || isCombatLocked()) {
    return 0;
  }

  let placedColumn = 0;

  for (const name of BAG_BUTTON_NAMES) {
    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    layoutSystemRowButton(button, name, placedColumn, BAG_ROW_Y, onReshow);
    placedColumn++;
  }

  return placedColumn;
}

function applyMicroButtons(onReshow: () => void): number {
  const systemButtonFrame = getSystemButtonFrame();

  if (systemButtonFrame === undefined) {
    return 0;
  }

  const names = getMicroButtonNames();
  let placedColumn = 0;

  for (let index = names.length - 1; index >= 0; index--) {
    const name = names[index];

    if (shouldSkipMicroButtonPlacement(name)) {
      continue;
    }

    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    layoutSystemRowButton(button, name, placedColumn, MICRO_ROW_Y, onReshow);
    placedColumn++;
  }

  applyMicroButtonOverlays(onReshow);

  return placedColumn;
}

export function applySystemButtonLayout(onReshow: () => void): void {
  const bagButtonCount = applyBagButtons(onReshow);
  const microButtonCount = applyMicroButtons(onReshow);

  updateSystemFrameWidth(
    [getSystemRowWidth(bagButtonCount), getSystemRowWidth(microButtonCount)],
    SYSTEM_BUTTON_SIZE
  );
}

export function restoreSystemButtonLayout(): void {
  restoreFrames(getMicroButtonNames());
  restoreFrames(getBagButtonNames());
}
