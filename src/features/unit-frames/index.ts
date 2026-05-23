import { addonPrint } from "../../platform/wow";
import { getSettings } from "../../core/db";
import {
  installBlizzardUnitFrameSuppression,
  isBlizzardUnitFrameSuppressionActive
} from "./blizzard-suppress";
import {
  flushUnitFrameDebugSummary,
  isUnitFrameDebugEnabled,
  setUnitFrameDebugChangeListener,
  setUnitFrameDebugEnabled,
  syncUnitFrameDebugTimer
} from "./debug";
import {
  registerDemonSlayerUnitFrameEvents,
  usesUnitScopedVitalsEvents,
  usesVitalsPolling
} from "./events";
import { getPlayerUnitFrame, getTargetUnitFrame } from "./frame-store";
import { getPlayerBreathStyle } from "./breath-styles";
import { getUnitFrameLayoutSummary } from "./layout";
import { refreshUnitFrames } from "./refresh";

export {
  flushUnitFrameDebugSummary,
  isUnitFrameDebugEnabled,
  setUnitFrameDebugEnabled
} from "./debug";

function getPlayerClassFileName(): string | undefined {
  const [, classFileName] = UnitClass("player");
  return classFileName;
}

export function syncDemonSlayerUnitFrames(): void {
  refreshUnitFrames();
  syncUnitFrameDebugTimer();
}

export function printDemonSlayerUnitFrameStatus(): void {
  const settings = getSettings();
  const playerShown = getPlayerUnitFrame()?.isShown() ?? false;
  const targetShown = getTargetUnitFrame()?.isShown() ?? false;
  const playerClass = getPlayerClassFileName() ?? "unknown";
  const breathStyle = getPlayerBreathStyle(playerClass);

  addonPrint("Demon Slayer unit frames:");
  addonPrint(`Enabled: ${settings.enableDemonSlayerUnitFrames ? "yes" : "no"}`);
  addonPrint(`Player frame visible: ${playerShown ? "yes" : "no"}`);
  addonPrint(`Target frame visible: ${targetShown ? "yes" : "no"}`);
  addonPrint(`Player breath: ${breathStyle.breathName}`);
  addonPrint(`Layout: ${getUnitFrameLayoutSummary()}`);
  addonPrint(`Blizzard frames suppressed: ${isBlizzardUnitFrameSuppressionActive() ? "yes" : "no"}`);
  addonPrint(
    `Vitals updates: unit-scoped=${usesUnitScopedVitalsEvents() ? "yes" : "no"}, polling=${usesVitalsPolling() ? "yes" : "no"}`
  );
}

export function registerDemonSlayerUnitFrames(): void {
  installBlizzardUnitFrameSuppression();
  setUnitFrameDebugChangeListener(() => {
    syncUnitFrameDebugTimer();
  });
  registerDemonSlayerUnitFrameEvents();
}
