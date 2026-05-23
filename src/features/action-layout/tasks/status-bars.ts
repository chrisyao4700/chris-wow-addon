import { getActionGridFrame } from "../anchor-frames";
import {
  ACTION_STATUS_BAR_GAP,
  ACTION_STATUS_BAR_HEIGHT,
  ACTION_STATUS_BAR_WIDTH,
  STATUS_BAR_NAMES
} from "../constants";
import { canLayoutFrame, captureFrame, getFrame, hookLayoutFrame, restoreFrames } from "../frame-store";
import { getStanceBarStackHeight } from "./stance-bar";

export function applyStatusBarLayout(onReshow: () => void): void {
  const actionGridFrame = getActionGridFrame();

  if (actionGridFrame === undefined) {
    return;
  }

  let visibleBars = 0;
  const statusBarBaseOffset = getStanceBarStackHeight();

  for (const name of STATUS_BAR_NAMES) {
    const frame = getFrame(name);

    if (!canLayoutFrame(frame)) {
      continue;
    }

    const wasShown = frame.IsShown();
    captureFrame(name, frame);
    hookLayoutFrame(name, frame, onReshow);

    if (!wasShown) {
      frame.Hide();
      continue;
    }

    frame.SetParent(actionGridFrame);
    frame.ClearAllPoints();
    frame.SetScale(1);
    frame.SetSize(ACTION_STATUS_BAR_WIDTH, ACTION_STATUS_BAR_HEIGHT);
    frame.SetPoint(
      "BOTTOM",
      actionGridFrame,
      "TOP",
      0,
      statusBarBaseOffset + ACTION_STATUS_BAR_GAP + visibleBars * (ACTION_STATUS_BAR_HEIGHT + 2)
    );
    frame.Show();
    visibleBars++;
  }
}

export function restoreStatusBarLayout(): void {
  restoreFrames(STATUS_BAR_NAMES);
}
