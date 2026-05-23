import { getActionGridFrame } from "../anchor-frames";
import {
  ACTION_BUTTON_SIZE,
  ACTION_CELL_SIZE,
  ACTION_COLUMNS
} from "../constants";
import { canLayoutFrame, captureFrame, getFrame, hookLayoutFrame, restoreFrames } from "../frame-store";
import { getActionButtonNames } from "../names";

export function applyActionButtonLayout(onReshow: () => void): void {
  const actionGridFrame = getActionGridFrame();

  if (actionGridFrame === undefined) {
    return;
  }

  const names = getActionButtonNames();

  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    const column = index % ACTION_COLUMNS;
    const row = Math.floor(index / ACTION_COLUMNS);
    captureFrame(name, button);
    hookLayoutFrame(name, button, onReshow);
    button.SetParent(actionGridFrame);
    button.ClearAllPoints();
    button.SetSize(ACTION_BUTTON_SIZE, ACTION_BUTTON_SIZE);
    button.SetScale(1);
    button.SetPoint("BOTTOMLEFT", actionGridFrame, "BOTTOMLEFT", column * ACTION_CELL_SIZE, row * ACTION_CELL_SIZE);
    button.Show();
  }
}

export function restoreActionButtonLayout(): void {
  restoreFrames(getActionButtonNames());
}
