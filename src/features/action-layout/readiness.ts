import { getActionGridFrame } from "./anchor-frames";
import {
  MAIN_ACTION_BAR_BUTTON_COUNT,
  MIN_ACTION_BUTTONS_FOR_LAYOUT
} from "./constants";
import { countExistingFrames, getFrame, hasFrameMethod } from "./frame-store";
import { getActionButtonNames } from "./names";
import { isExpBarLayoutApplied } from "./tasks/exp-bar";
import { isBottomShellHidden } from "./tasks/shell";

export function isMainActionBarReady(): boolean {
  for (let index = 1; index <= MAIN_ACTION_BAR_BUTTON_COUNT; index++) {
    if (getFrame(`ActionButton${index}`) === undefined) {
      return false;
    }
  }

  return true;
}

export function areActionBarFramesReady(): boolean {
  if (!isMainActionBarReady()) {
    return false;
  }

  const actionButtonNames = getActionButtonNames();
  const actionButtonCount = countExistingFrames(actionButtonNames);

  return (
    actionButtonCount >= MIN_ACTION_BUTTONS_FOR_LAYOUT || actionButtonCount >= actionButtonNames.length
  );
}

function isActionButtonAttachedToGrid(buttonName: string): boolean {
  const actionGridFrame = getActionGridFrame();

  if (actionGridFrame === undefined) {
    return false;
  }

  const button = getFrame(buttonName);

  if (button === undefined || !hasFrameMethod(button, "GetParent")) {
    return false;
  }

  return button.GetParent() === actionGridFrame;
}

export function isCustomLayoutApplied(): boolean {
  if (getActionGridFrame() === undefined) {
    return false;
  }

  const probeButtonNames = ["ActionButton1", "MultiBarBottomLeftButton1"];
  let requiredProbes = 0;
  let attachedProbes = 0;

  for (const buttonName of probeButtonNames) {
    if (getFrame(buttonName) === undefined) {
      continue;
    }

    requiredProbes++;

    if (isActionButtonAttachedToGrid(buttonName)) {
      attachedProbes++;
    }
  }

  return (
    requiredProbes > 0 && attachedProbes === requiredProbes && isExpBarLayoutApplied() && isBottomShellHidden()
  );
}
