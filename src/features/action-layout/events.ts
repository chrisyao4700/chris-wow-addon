import { ADDON_NAME } from "../../core/config";
import { installBlizzardLayoutHooks } from "./hooks";
import {
  isCombatLocked,
  isCustomLayoutEnabled,
  isPendingLayoutSync,
  setPendingLayoutSync
} from "./layout-state";
import { ensureLayoutScheduler, scheduleLayoutBootstrap, scheduleLayoutSync } from "./scheduler";
import { syncActionLayout } from "./sync";

let eventFrame: WowFrame | undefined;

const SHAPESHIFT_LAYOUT_EVENTS = [
  "UPDATE_SHAPESHIFT_FORM",
  "UPDATE_SHAPESHIFT_FORMS",
  "UPDATE_SHAPESHIFT_USABLE",
  "UPDATE_BONUS_ACTIONBAR"
] as const;

function registerLayoutEvent(frame: WowFrame, eventName: string): void {
  pcall(() => frame.RegisterEvent(eventName));
}

export function registerActionLayout(): void {
  if (eventFrame !== undefined) {
    scheduleLayoutBootstrap(true);
    return;
  }

  eventFrame = CreateFrame("Frame");
  eventFrame.RegisterEvent("ADDON_LOADED");
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  eventFrame.RegisterEvent("PLAYER_REGEN_ENABLED");
  eventFrame.RegisterEvent("BAG_UPDATE_DELAYED");
  eventFrame.RegisterEvent("ACTIONBAR_PAGE_CHANGED");
  registerLayoutEvent(eventFrame, "UPDATE_MULTI_ACTIONBAR");

  for (const eventName of SHAPESHIFT_LAYOUT_EVENTS) {
    registerLayoutEvent(eventFrame, eventName);
  }

  eventFrame.SetScript("OnEvent", (_self, eventName, eventArg) => {
    if (eventName === "ADDON_LOADED" && eventArg === ADDON_NAME) {
      ensureLayoutScheduler();
      scheduleLayoutBootstrap(true);
      return;
    }

    if (eventName === "PLAYER_REGEN_ENABLED") {
      if (isCustomLayoutEnabled() || isPendingLayoutSync()) {
        syncActionLayout();
      }

      return;
    }

    if (eventName === "PLAYER_LOGIN" || eventName === "PLAYER_ENTERING_WORLD") {
      scheduleLayoutBootstrap(true);
      return;
    }

    if (eventName === "BAG_UPDATE_DELAYED" && isCombatLocked()) {
      setPendingLayoutSync(true);
      return;
    }

    scheduleLayoutSync();
  });

  installBlizzardLayoutHooks();
  ensureLayoutScheduler();

  if (isCustomLayoutEnabled()) {
    scheduleLayoutBootstrap(true);
  }
}
