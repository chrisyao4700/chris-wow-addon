import { addonPrint } from "../../platform/wow";
import { applyCustomLayout, restoreBlizzardLayout } from "./apply-layout";
import {
  isCombatLocked,
  isCustomLayoutEnabled,
  isPendingLayoutSync,
  setPendingLayoutSync
} from "./layout-state";
import { registerLayoutSyncRunner, startLayoutWatchdog, stopLayoutWatchdog } from "./scheduler";

registerLayoutSyncRunner(() => {
  syncActionLayout();
});

export function syncActionLayout(showCombatNotice = false): void {
  if (isCombatLocked()) {
    setPendingLayoutSync(true);

    if (showCombatNotice) {
      addonPrint("Action layout update queued until combat ends.");
    }

    return;
  }

  setPendingLayoutSync(false);

  if (isCustomLayoutEnabled()) {
    startLayoutWatchdog();
    applyCustomLayout();
    return;
  }

  stopLayoutWatchdog();
  restoreBlizzardLayout();
}
