import { ensureLayoutFrames } from "./anchor-frames";
import { setLayoutApplying } from "./layout-state";
import { onLayoutFrameReshow } from "./scheduler";
import { applyActionButtonLayout, restoreActionButtonLayout } from "./tasks/action-buttons";
import { applyExpBarLayout, restoreExpBarLayout } from "./tasks/exp-bar";
import { applyShellLayout, restoreShellLayout } from "./tasks/shell";
import { beginStanceBarLayoutPass, applyStanceBarLayout, restoreStanceBarLayout } from "./tasks/stance-bar";
import { applyStatusBarLayout, restoreStatusBarLayout } from "./tasks/status-bars";
import { applySystemButtonLayout, restoreSystemButtonLayout } from "./tasks/system-buttons";

export function applyCustomLayout(): void {
  setLayoutApplying(true);
  beginStanceBarLayoutPass();
  ensureLayoutFrames();

  const onReshow = onLayoutFrameReshow;

  applyActionButtonLayout(onReshow);
  applySystemButtonLayout(onReshow);
  applyStanceBarLayout(onReshow);
  applyStatusBarLayout(onReshow);
  applyShellLayout(onReshow);
  applyExpBarLayout(onReshow);

  setLayoutApplying(false);
}

export function restoreBlizzardLayout(): void {
  restoreActionButtonLayout();
  restoreSystemButtonLayout();
  restoreStanceBarLayout();
  restoreStatusBarLayout();
  restoreShellLayout();
  restoreExpBarLayout();
}
