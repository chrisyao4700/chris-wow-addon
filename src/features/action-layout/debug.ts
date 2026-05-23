import { getSettings } from "../../core/db";
import { addonPrint } from "../../platform/wow";
import { getActionGridFrame, getSystemButtonFrame } from "./anchor-frames";
import { BAG_BUTTON_NAMES, EXP_BAR_FRAME_NAMES, STATUS_BAR_NAMES } from "./constants";
import { countExistingFrames, getFrame } from "./frame-store";
import {
  isCombatLocked,
  isCustomLayoutEnabled,
  isPendingLayoutSync,
  isPlayerInWorld
} from "./layout-state";
import { getActionButtonNames, getMicroButtonNames } from "./names";
import { isCustomLayoutApplied } from "./readiness";
import {
  getLayoutBootstrapStabilizeRemaining,
  isLayoutBootstrapActive,
  isLayoutSyncScheduled
} from "./scheduler";
import { isExpBarLayoutApplied } from "./tasks/exp-bar";
import {
  getNumShapeshiftForms,
  getStanceBarFrame,
  getStanceBarFrameDebugLabel
} from "./tasks/stance-bar";
import { getStanceButtonNames } from "./names";
import { isBottomShellHidden } from "./tasks/shell";

export function printActionLayoutStatus(): void {
  addonPrint(`Layout enabled: ${getSettings().enableCustomActionLayout}`);
  addonPrint(`In world: ${isPlayerInWorld()}, applied: ${isCustomLayoutApplied()}`);
  addonPrint(
    `Combat: ${isCombatLocked()}, pending: ${isPendingLayoutSync()}, scheduled: ${isLayoutSyncScheduled()}`
  );
  addonPrint(
    `Bootstrap: ${isLayoutBootstrapActive()}, stabilize: ${getLayoutBootstrapStabilizeRemaining().toFixed(2)}`
  );
  addonPrint(`Action buttons: ${countExistingFrames(getActionButtonNames())}/60`);
  const microButtonNames = getMicroButtonNames();
  addonPrint(`System buttons: ${countExistingFrames(microButtonNames)}/${microButtonNames.length}`);
  addonPrint(`Bag buttons: ${countExistingFrames(BAG_BUTTON_NAMES)}/${BAG_BUTTON_NAMES.length}`);
  const expBarSummary = EXP_BAR_FRAME_NAMES.map((name) => {
    const frame = getFrame(name);

    if (frame === undefined) {
      return `${name}=missing`;
    }

    return `${name}=${frame.IsShown() ? "shown" : "hidden"}`;
  }).join(", ");
  addonPrint(`Exp bars: ${expBarSummary}, top=${isExpBarLayoutApplied()}`);
  addonPrint(`Bottom shell hidden: ${isBottomShellHidden()}`);
  addonPrint(`Status bars: ${countExistingFrames(STATUS_BAR_NAMES)}/${STATUS_BAR_NAMES.length}`);
  const stanceBarFrame = getStanceBarFrame();
  const visibleStanceButtons = getStanceButtonNames().filter((name) => getFrame(name)?.IsShown() === true);
  addonPrint(
    `Stance bar: ${getStanceBarFrameDebugLabel()}, ${stanceBarFrame !== undefined ? (stanceBarFrame.IsShown() ? "shown" : "hidden") : "missing"}, forms=${getNumShapeshiftForms()}`
  );
  addonPrint(
    `Stance buttons visible: ${visibleStanceButtons.length}${visibleStanceButtons.length > 0 ? ` (${visibleStanceButtons.join(", ")})` : ""}`
  );
  addonPrint(
    `Layout frames: action=${getActionGridFrame() !== undefined}, system=${getSystemButtonFrame() !== undefined}`
  );
}
