import { ADDON_NAME } from "../../core/config";
import {
  ACTION_BUTTON_SIZE,
  ACTION_GRID_BOTTOM,
  ACTION_GRID_HEIGHT,
  ACTION_GRID_MARGIN,
  ACTION_GRID_WIDTH,
  STANCE_BAR_ABOVE_ACTION_GAP,
  SYSTEM_FRAME_HEIGHT,
  SYSTEM_FRAME_MARGIN,
  SYSTEM_FRAME_WIDTH
} from "./constants";

let actionGridFrame: WowFrame | undefined;
let systemButtonFrame: WowFrame | undefined;
let layoutHiderFrame: WowFrame | undefined;
let stanceAnchorFrame: WowFrame | undefined;

export function getActionGridFrame(): WowFrame | undefined {
  return actionGridFrame;
}

export function getSystemButtonFrame(): WowFrame | undefined {
  return systemButtonFrame;
}

export function getLayoutHiderFrame(): WowFrame | undefined {
  return layoutHiderFrame;
}

export function getStanceAnchorFrame(): WowFrame | undefined {
  return stanceAnchorFrame;
}

export function isStanceAnchorFrame(frame: WowFrame): boolean {
  if (stanceAnchorFrame !== undefined && frame === stanceAnchorFrame) {
    return true;
  }

  return (_G[`${ADDON_NAME}StanceAnchorFrame`] as WowFrame | undefined) === frame;
}

export function ensureStanceAnchorFrame(): WowFrame | undefined {
  const grid = getActionGridFrame();

  if (grid === undefined) {
    return undefined;
  }

  if (stanceAnchorFrame === undefined) {
    stanceAnchorFrame = CreateFrame("Frame", `${ADDON_NAME}StanceAnchorFrame`, UIParent);
    stanceAnchorFrame.SetFrameStrata("MEDIUM");
  }

  stanceAnchorFrame.SetSize(ACTION_GRID_WIDTH, ACTION_BUTTON_SIZE);
  stanceAnchorFrame.ClearAllPoints();
  stanceAnchorFrame.SetPoint("BOTTOMLEFT", grid, "TOPLEFT", 0, STANCE_BAR_ABOVE_ACTION_GAP);

  return stanceAnchorFrame;
}

export function ensureLayoutFrames(): void {
  if (actionGridFrame === undefined) {
    actionGridFrame = CreateFrame("Frame", `${ADDON_NAME}ActionGridFrame`, UIParent);
    actionGridFrame.SetSize(ACTION_GRID_WIDTH, ACTION_GRID_HEIGHT);
    actionGridFrame.SetPoint("BOTTOMLEFT", UIParent, "BOTTOMLEFT", ACTION_GRID_MARGIN, ACTION_GRID_BOTTOM);
    actionGridFrame.SetFrameStrata("MEDIUM");
  }

  if (systemButtonFrame === undefined) {
    systemButtonFrame = CreateFrame("Frame", `${ADDON_NAME}SystemButtonFrame`, UIParent);
    systemButtonFrame.SetSize(SYSTEM_FRAME_WIDTH, SYSTEM_FRAME_HEIGHT);
    systemButtonFrame.SetPoint("BOTTOMRIGHT", UIParent, "BOTTOMRIGHT", -SYSTEM_FRAME_MARGIN, SYSTEM_FRAME_MARGIN);
    systemButtonFrame.SetFrameStrata("MEDIUM");
  }
}

export function ensureLayoutHiderFrame(): WowFrame {
  if (layoutHiderFrame === undefined) {
    layoutHiderFrame = CreateFrame("Frame", `${ADDON_NAME}LayoutHiderFrame`, UIParent);
    layoutHiderFrame.Hide();
  }

  return layoutHiderFrame;
}

export function updateSystemFrameWidth(rowWidths: number[], systemButtonSize: number): void {
  if (systemButtonFrame === undefined) {
    return;
  }

  let maxRowWidth = systemButtonSize;

  for (const rowWidth of rowWidths) {
    if (rowWidth > maxRowWidth) {
      maxRowWidth = rowWidth;
    }
  }

  systemButtonFrame.SetSize(maxRowWidth, SYSTEM_FRAME_HEIGHT);
}
