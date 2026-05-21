import { ADDON_NAME } from "./config";
import { ensureSavedVariables, incrementLaunchCount } from "./db";
import { getMessages } from "./localization";
import { addonPrint } from "./platform/wow";

export function registerAddonEvents(): void {
  const frame = CreateFrame("Frame");

  frame.RegisterEvent("ADDON_LOADED");
  frame.RegisterEvent("PLAYER_LOGIN");

  frame.SetScript("OnEvent", (_self, eventName, addonName) => {
    if (eventName === "ADDON_LOADED" && addonName === ADDON_NAME) {
      ensureSavedVariables();
      return;
    }

    if (eventName === "PLAYER_LOGIN") {
      incrementLaunchCount();
      addonPrint(getMessages().loaded);
    }
  });
}
