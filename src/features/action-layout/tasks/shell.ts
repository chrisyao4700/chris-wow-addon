import { ensureLayoutHiderFrame } from "../anchor-frames";
import {
  DECORATIVE_FRAME_NAMES,
  MAIN_MENU_BAR_SHELL_NAMES,
  PAGE_CONTROL_FRAME_NAMES
} from "../constants";
import {
  canHideFrame,
  canLayoutFrame,
  captureFrame,
  getFrame,
  hasFrameMethod,
  hookLayoutFrame,
  restoreFrames,
  setIgnoreFramePositionManager
} from "../frame-store";

export function applyShellLayout(onReshow: () => void): void {
  for (const name of DECORATIVE_FRAME_NAMES) {
    const frame = getFrame(name);

    if (!canHideFrame(frame)) {
      continue;
    }

    captureFrame(name, frame);
    frame.Hide();
  }

  const layoutHiderFrame = ensureLayoutHiderFrame();

  for (const name of MAIN_MENU_BAR_SHELL_NAMES) {
    const frame = getFrame(name);

    if (frame === undefined) {
      continue;
    }

    captureFrame(name, frame);
    hookLayoutFrame(name, frame, onReshow);
    setIgnoreFramePositionManager(frame);

    if (hasFrameMethod(frame, "EnableMouse")) {
      frame.EnableMouse(false);
    }

    if (canHideFrame(frame)) {
      frame.Hide();
    }
  }

  for (const name of PAGE_CONTROL_FRAME_NAMES) {
    const frame = getFrame(name);

    if (frame === undefined) {
      continue;
    }

    captureFrame(name, frame);
    hookLayoutFrame(name, frame, onReshow);
    setIgnoreFramePositionManager(frame);

    if (canLayoutFrame(frame)) {
      frame.SetParent(layoutHiderFrame);
    }

    if (canHideFrame(frame)) {
      frame.Hide();
    }
  }
}

export function restoreShellLayout(): void {
  restoreFrames(DECORATIVE_FRAME_NAMES);

  const shellNames: string[] = [...MAIN_MENU_BAR_SHELL_NAMES, ...PAGE_CONTROL_FRAME_NAMES];
  restoreFrames(shellNames);
}

export function isBottomShellHidden(): boolean {
  for (const name of [...MAIN_MENU_BAR_SHELL_NAMES, ...PAGE_CONTROL_FRAME_NAMES]) {
    const frame = getFrame(name);

    if (frame !== undefined && frame.IsShown()) {
      return false;
    }
  }

  return true;
}
