import {
  BLIZZARD_LAYOUT_HOOK_TARGETS,
  EXP_BAR_LAYOUT_HOOK_TARGETS,
  STANCE_BAR_LAYOUT_HOOK_TARGETS
} from "./constants";
import { getFrame, hasFrameMethod } from "./frame-store";
import {
  isCombatLocked,
  isCustomLayoutEnabled,
  isLayoutApplying
} from "./layout-state";
import { onLayoutFrameReshow, scheduleLayoutSync } from "./scheduler";
import { applyExpBarLayout } from "./tasks/exp-bar";
import { applyStanceBarLayout } from "./tasks/stance-bar";

let blizzardLayoutHooksInstalled = false;
let originalMoveMicroButtons: ((...args: unknown[]) => void) | undefined;

function hookMainMenuBarRelayout(): void {
  const mainMenuBar = getFrame("MainMenuBar");

  if (mainMenuBar === undefined || !hasFrameMethod(mainMenuBar, "HookScript")) {
    return;
  }

  mainMenuBar.HookScript("OnShow", () => {
    if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
      return;
    }

    scheduleLayoutSync();
  });
}

export function installBlizzardLayoutHooks(): void {
  if (blizzardLayoutHooksInstalled) {
    return;
  }

  blizzardLayoutHooksInstalled = true;

  if (typeof MoveMicroButtons === "function") {
    originalMoveMicroButtons = MoveMicroButtons;
    _G.MoveMicroButtons = (...args: unknown[]) => {
      if (isCustomLayoutEnabled()) {
        scheduleLayoutSync();
        return;
      }

      originalMoveMicroButtons?.(...args);
    };
  }

  for (const functionName of EXP_BAR_LAYOUT_HOOK_TARGETS) {
    if (typeof _G[functionName] !== "function") {
      continue;
    }

    hooksecurefunc(functionName, () => {
      if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
        return;
      }

      applyExpBarLayout(onLayoutFrameReshow);
    });
  }

  hookMainMenuBarRelayout();

  if (typeof UpdateMicroButtonsParent === "function") {
    const originalUpdateMicroButtonsParent = UpdateMicroButtonsParent;
    _G.UpdateMicroButtonsParent = (parent: WowFrame) => {
      if (isCustomLayoutEnabled()) {
        scheduleLayoutSync();
        return;
      }

      originalUpdateMicroButtonsParent(parent);
    };
  }

  if (typeof _G.UpdateMicroButtons === "function") {
    hooksecurefunc("UpdateMicroButtons", () => {
      if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
        return;
      }

      scheduleLayoutSync();
    });
  }

  for (const functionName of BLIZZARD_LAYOUT_HOOK_TARGETS) {
    if (typeof _G[functionName] === "function") {
      hooksecurefunc(functionName, () => {
        if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
          return;
        }

        scheduleLayoutSync();
      });
    }
  }

  for (const functionName of STANCE_BAR_LAYOUT_HOOK_TARGETS) {
    if (typeof _G[functionName] !== "function") {
      continue;
    }

    hooksecurefunc(functionName, () => {
      if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
        return;
      }

      applyStanceBarLayout(onLayoutFrameReshow);
    });
  }

}
