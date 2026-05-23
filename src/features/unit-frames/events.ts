import { ADDON_NAME } from "../../core/config";
import { getSettings } from "../../core/db";
import {
  REQUIRED_UNIT_SCOPED_EVENTS,
  UNIT_SCOPED_EVENTS,
  WATCHED_UNITS
} from "./constants";
import { isUnitFrameDebugEnabled, syncUnitFrameDebugTimer, traceUnitFrame } from "./debug";
import {
  ensureFrames,
  getPlayerUnitFrame,
  getTargetUnitFrame,
  resetLayoutCache,
  syncFrameAnchors
} from "./frame-store";
import {
  refreshTargetFrame,
  refreshUnitFrames,
  scheduleRefreshPlayerLevel,
  refreshTargetLevel
} from "./refresh";
import { isWatchedUnit, markVitalsDirty, refreshTargetComboPoints } from "./vitals";
import { startVitalsPolling, stopVitalsPolling } from "./vitals-poll";
let eventFrame: WowFrame | undefined;
let usesUnitScopedEvents = false;

export function usesUnitScopedVitalsEvents(): boolean {
  return usesUnitScopedEvents;
}

export function usesVitalsPolling(): boolean {
  return !usesUnitScopedEvents;
}

function registerUnitFrameEvent(frame: WowFrame, eventName: string): boolean {
  const [registered] = pcall(() => frame.RegisterEvent(eventName));
  return registered;
}

function registerWatchedUnitEvents(frame: WowFrame): boolean {
  if (frame.RegisterUnitEvent === undefined) {
    return false;
  }

  for (const eventName of REQUIRED_UNIT_SCOPED_EVENTS) {
    const [registered] = pcall(() => frame.RegisterUnitEvent!(eventName, ...WATCHED_UNITS));

    if (!registered) {
      return false;
    }
  }

  for (const eventName of UNIT_SCOPED_EVENTS) {
    if ((REQUIRED_UNIT_SCOPED_EVENTS as readonly string[]).includes(eventName)) {
      continue;
    }

    pcall(() => frame.RegisterUnitEvent!(eventName, ...WATCHED_UNITS));
  }

  return true;
}

function handleUnitFrameEvent(eventName: string, unitId: unknown): void {
  if (eventName === "PLAYER_LOGIN" || eventName === "PLAYER_ENTERING_WORLD") {
    resetLayoutCache();
    refreshUnitFrames();
    syncUnitFrameDebugTimer();
    return;
  }

  if (eventName === "DISPLAY_SIZE_CHANGED") {
    resetLayoutCache();

    if (getPlayerUnitFrame() !== undefined && getTargetUnitFrame() !== undefined) {
      syncFrameAnchors({ player: getPlayerUnitFrame()!, target: getTargetUnitFrame()! });
    }

    return;
  }

  if (!getSettings().enableDemonSlayerUnitFrames) {
    return;
  }

  if (eventName === "PLAYER_TARGET_CHANGED") {
    refreshTargetFrame(ensureFrames().target);
    return;
  }

  if (eventName === "PLAYER_REGEN_DISABLED") {
    refreshTargetComboPoints(ensureFrames().target);
    return;
  }

  if (eventName === "PLAYER_LEVEL_UP") {
    scheduleRefreshPlayerLevel();
    return;
  }

  const unit = typeof unitId === "string" ? unitId : undefined;

  if (eventName === "UNIT_LEVEL") {
    if (unit === "player") {
      scheduleRefreshPlayerLevel();
      return;
    }

    if (unit === "target") {
      refreshTargetLevel(ensureFrames().target);
    }

    return;
  }

  if (eventName === "UNIT_COMBO_POINTS" && unit === "target" && UnitExists("target")) {
    refreshTargetComboPoints(ensureFrames().target);
    return;
  }

  if (eventName === "UPDATE_SHAPESHIFT_FORM" && UnitExists("target")) {
    refreshTargetComboPoints(ensureFrames().target);
    return;
  }

  if (eventName === "UNIT_PORTRAIT_UPDATE") {
    if (unit === "player") {
      ensureFrames().player.updatePortrait("player");
      return;
    }

    if (unit === "target") {
      ensureFrames().target.updatePortrait("target");
    }

    return;
  }

  if (
    eventName === "UNIT_HEALTH" ||
    eventName === "UNIT_MAXHEALTH" ||
    eventName === "UNIT_POWER_UPDATE" ||
    eventName === "UNIT_DISPLAYPOWER"
  ) {
    if (isWatchedUnit(unit)) {
      markVitalsDirty(unit);
    }
  }
}

export function registerDemonSlayerUnitFrameEvents(): void {
  if (eventFrame !== undefined) {
    refreshUnitFrames();
    return;
  }

  eventFrame = CreateFrame("Frame", `${ADDON_NAME}DSUnitFrameEvents`);
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  eventFrame.RegisterEvent("PLAYER_TARGET_CHANGED");
  registerUnitFrameEvent(eventFrame, "DISPLAY_SIZE_CHANGED");
  registerUnitFrameEvent(eventFrame, "PLAYER_REGEN_ENABLED");
  registerUnitFrameEvent(eventFrame, "PLAYER_REGEN_DISABLED");
  registerUnitFrameEvent(eventFrame, "UPDATE_SHAPESHIFT_FORM");
  registerUnitFrameEvent(eventFrame, "PLAYER_LEVEL_UP");

  usesUnitScopedEvents = registerWatchedUnitEvents(eventFrame);

  if (!usesUnitScopedEvents) {
    startVitalsPolling();
  } else {
    stopVitalsPolling();
  }

  syncUnitFrameDebugTimer();

  eventFrame.SetScript("OnEvent", (_self, ...args: unknown[]) => {
    const eventName = typeof args[0] === "string" ? args[0] : "";
    const unitId = args[1];

    if (isUnitFrameDebugEnabled()) {
      traceUnitFrame(`event:${eventName}${unitId !== undefined ? `:${String(unitId)}` : ""}`);
    }

    handleUnitFrameEvent(eventName, unitId);
  });
}
