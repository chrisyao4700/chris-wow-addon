import {
  ACTION_STATUS_BAR_HEIGHT,
  ACTION_STATUS_BAR_WIDTH,
  EXP_BAR_DEFAULT_WIDTH,
  EXP_BAR_FRAME_NAMES
} from "../constants";
import { canLayoutFrame, captureFrame, getFrame, getFrameSnapshot, hookLayoutFrame, restoreFrames } from "../frame-store";

function getExpBarDimensions(frameName: string, frame: WowFrame): { width: number; height: number } {
  const snapshot = getFrameSnapshot(frameName);
  const width = snapshot?.width && snapshot.width > 0 ? snapshot.width : frame.GetWidth() || EXP_BAR_DEFAULT_WIDTH;
  const height =
    snapshot?.height && snapshot.height > 0 ? snapshot.height : frame.GetHeight() || ACTION_STATUS_BAR_HEIGHT;

  return {
    width: Math.max(width, ACTION_STATUS_BAR_WIDTH),
    height: Math.max(height, ACTION_STATUS_BAR_HEIGHT)
  };
}

function applyExpBarFrame(frameName: string, frame: WowFrame, onReshow: () => void): void {
  const wasShown = frame.IsShown();
  captureFrame(frameName, frame);
  hookLayoutFrame(frameName, frame, onReshow);

  const { width, height } = getExpBarDimensions(frameName, frame);

  frame.SetParent(UIParent);
  frame.ClearAllPoints();
  frame.SetScale(1);
  frame.SetSize(width, height);
  frame.SetFrameStrata("HIGH");
  frame.SetPoint("TOP", UIParent, "TOP", 0, 0);

  if (wasShown) {
    frame.Show();
    return;
  }

  frame.Hide();
}

export function applyExpBarLayout(onReshow: () => void): void {
  for (const frameName of EXP_BAR_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (!canLayoutFrame(frame)) {
      continue;
    }

    applyExpBarFrame(frameName, frame, onReshow);
  }
}

export function restoreExpBarLayout(): void {
  restoreFrames(EXP_BAR_FRAME_NAMES);
}

export function isExpBarLayoutApplied(): boolean {
  for (const frameName of EXP_BAR_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (frame === undefined || !frame.IsShown()) {
      continue;
    }

    const [, relativeTo, relativePoint, , y] = frame.GetPoint(1);

    if (relativeTo !== UIParent || relativePoint !== "TOP" || y !== 0) {
      return false;
    }
  }

  return true;
}
