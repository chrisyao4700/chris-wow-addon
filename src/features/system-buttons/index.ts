import { ADDON_NAME } from "../../core/config";
import { getSettings } from "../../core/db";
import { registerLayoutSyncRunner } from "../action-layout/scheduler";
import { addonPrint } from "../../platform/wow";
import { BUNDLED_SYSTEM_BUTTON_ASSET_IDS } from "./asset-manifest";
import {
  EXCLUDED_BAG_BUTTON_FRAME_NAMES,
  getDiscoveredMicroButtonFrameNames,
  getSystemButtonDefinitionsForClient,
  getUniqueSystemButtonAssetIds
} from "./button-registry";
import {
  applySystemButtonSkin,
  clearSystemButtonAssetCache,
  countLoadedSystemButtonAssets,
  getResolvedSystemButtonTexturePath,
  restoreAllSystemButtonSkins,
  restoreSystemButtonSkin,
  suppressCharacterMicroButtonPortrait
} from "./textures";

const RESYNC_DELAY_SECONDS = 0.05;
const RESYNC_DELAYS_SECONDS = [0, 0.15, 0.5, 1.5];

let eventFrame: WowFrame | undefined;
let hooksInstalled = false;
let pendingResync = false;
let deferredResyncScheduled = false;
let layoutSyncRegistered = false;
let appliedFrameNames: string[] = [];

function isFeatureEnabled(): boolean {
  return getSettings().enableDemonSlayerSystemButtons;
}

function getFrame(name: string): WowFrame | undefined {
  return _G[name] as WowFrame | undefined;
}

function isCombatLocked(): boolean {
  return InCombatLockdown !== undefined && InCombatLockdown();
}

function areSystemButtonFramesReady(): boolean {
  return getDiscoveredMicroButtonFrameNames().some(name => getFrame(name) !== undefined);
}

function canSkinButtons(): boolean {
  if (isCombatLocked()) {
    return false;
  }

  return areSystemButtonFramesReady();
}

function restoreExcludedBagButtonSkins(): void {
  for (const frameName of EXCLUDED_BAG_BUTTON_FRAME_NAMES) {
    restoreSystemButtonSkin(frameName);
  }
}

function applyAllSystemButtonSkins(): void {
  if (!isFeatureEnabled()) {
    restoreAllSystemButtonSkins();
    restoreExcludedBagButtonSkins();
    appliedFrameNames = [];
    return;
  }

  restoreExcludedBagButtonSkins();
  clearSystemButtonAssetCache();

  const nextApplied: string[] = [];

  for (const definition of getSystemButtonDefinitionsForClient()) {
    if (getFrame(definition.frameName) === undefined) {
      continue;
    }

    if (applySystemButtonSkin(definition.frameName)) {
      nextApplied.push(definition.frameName);
    }
  }

  for (const frameName of appliedFrameNames) {
    if (!nextApplied.includes(frameName)) {
      restoreSystemButtonSkin(frameName);
    }
  }

  appliedFrameNames = nextApplied;
}

function scheduleSystemButtonResync(): void {
  if (pendingResync) {
    return;
  }

  pendingResync = true;
  C_Timer.After(RESYNC_DELAY_SECONDS, () => {
    pendingResync = false;
    syncDemonSlayerSystemButtons();
  });
}

function scheduleDeferredSystemButtonResync(): void {
  if (deferredResyncScheduled || isCombatLocked()) {
    return;
  }

  deferredResyncScheduled = true;
  const lastDelaySeconds = RESYNC_DELAYS_SECONDS[RESYNC_DELAYS_SECONDS.length - 1];

  for (const delaySeconds of RESYNC_DELAYS_SECONDS) {
    C_Timer.After(delaySeconds, () => {
      if (!isFeatureEnabled()) {
        return;
      }

      syncDemonSlayerSystemButtons();
    });
  }

  C_Timer.After(lastDelaySeconds, () => {
    deferredResyncScheduled = false;
  });
}

function installCharacterMicroButtonHooks(): void {
  const suppressPortrait = (): void => {
    if (!isFeatureEnabled()) {
      return;
    }

    suppressCharacterMicroButtonPortrait();
  };

  if (typeof _G.CharacterMicroButton_SetNormal === "function") {
    hooksecurefunc("CharacterMicroButton_SetNormal", suppressPortrait);
  }

  if (typeof _G.CharacterMicroButton_SetPushed === "function") {
    hooksecurefunc("CharacterMicroButton_SetPushed", suppressPortrait);
  }

  if (typeof SetPortraitTexture === "function") {
    hooksecurefunc("SetPortraitTexture", (...args: unknown[]) => {
      if (!isFeatureEnabled()) {
        return;
      }

      const texture = args[0] as WowTexture | undefined;
      const portrait = _G.MicroButtonPortrait as WowTexture | undefined;

      if (portrait !== undefined && texture === portrait) {
        suppressPortrait();
      }
    });
  }
}

function installSystemButtonHooks(): void {
  if (hooksInstalled) {
    return;
  }

  hooksInstalled = true;
  installCharacterMicroButtonHooks();

  if (typeof _G.UpdateMicroButtons === "function") {
    hooksecurefunc("UpdateMicroButtons", () => {
      if (!isFeatureEnabled() || isCombatLocked()) {
        return;
      }

      scheduleSystemButtonResync();
    });
  }

  if (typeof MoveMicroButtons === "function") {
    hooksecurefunc("MoveMicroButtons", () => {
      if (!isFeatureEnabled() || isCombatLocked()) {
        return;
      }

      scheduleSystemButtonResync();
    });
  }
}

function ensureLayoutSyncHook(): void {
  if (layoutSyncRegistered) {
    return;
  }

  layoutSyncRegistered = true;
  registerLayoutSyncRunner(() => {
    if (!isFeatureEnabled()) {
      return;
    }

    scheduleSystemButtonResync();
  });
}

export function syncDemonSlayerSystemButtons(): void {
  if (!isFeatureEnabled()) {
    restoreAllSystemButtonSkins();
    restoreExcludedBagButtonSkins();
    appliedFrameNames = [];
    return;
  }

  restoreExcludedBagButtonSkins();

  if (isCombatLocked()) {
    // Skinning is blocked in combat; PLAYER_REGEN_ENABLED resyncs when combat ends.
    return;
  }

  if (!areSystemButtonFramesReady()) {
    scheduleDeferredSystemButtonResync();
    return;
  }

  applyAllSystemButtonSkins();
}

export function printDemonSlayerSystemButtonStatus(): void {
  const settings = getSettings();
  const assetIds = getUniqueSystemButtonAssetIds();
  const loadedAssets = countLoadedSystemButtonAssets(assetIds);
  const definitions = getSystemButtonDefinitionsForClient();
  const availableFrames = definitions.filter(definition => getFrame(definition.frameName) !== undefined).length;
  const samplePath = getResolvedSystemButtonTexturePath("character");

  addonPrint("Demon Slayer system buttons:");
  addonPrint(`Enabled: ${settings.enableDemonSlayerSystemButtons ? "yes" : "no"}`);
  addonPrint(`Skinned frames: ${appliedFrameNames.length}`);
  addonPrint(`Detected frames: ${availableFrames}/${definitions.length}`);
  addonPrint(`Resolved assets: ${loadedAssets}/${assetIds.length} (bundled ${BUNDLED_SYSTEM_BUTTON_ASSET_IDS.length})`);
  addonPrint(`Sample path: ${samplePath ?? "none"}`);
  addonPrint(`Asset folder: Interface\\AddOns\\${ADDON_NAME}\\assets\\system-buttons`);
}

export function registerDemonSlayerSystemButtons(): void {
  installSystemButtonHooks();
  ensureLayoutSyncHook();

  if (eventFrame !== undefined) {
    syncDemonSlayerSystemButtons();
    return;
  }

  eventFrame = CreateFrame("Frame", `${ADDON_NAME}DSSystemButtonEvents`);
  eventFrame.RegisterEvent("ADDON_LOADED");
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  eventFrame.RegisterEvent("PLAYER_REGEN_ENABLED");

  eventFrame.SetScript("OnEvent", (_self, eventName, eventArg) => {
    if (eventName === "ADDON_LOADED" && eventArg === ADDON_NAME) {
      scheduleDeferredSystemButtonResync();
      return;
    }

    if (eventName === "PLAYER_LOGIN" || eventName === "PLAYER_ENTERING_WORLD") {
      scheduleDeferredSystemButtonResync();
      return;
    }

    if (eventName === "PLAYER_REGEN_ENABLED" && isFeatureEnabled()) {
      syncDemonSlayerSystemButtons();
    }
  });
}
