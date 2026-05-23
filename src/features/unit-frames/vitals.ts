import { getSettings } from "../../core/db";
import { PLAYER_LEVEL_VITALS_SUPPRESS_SECONDS, VITALS_THROTTLE_SECONDS, type WatchedUnit } from "./constants";
import { ensureFrames } from "./frame-store";
import { getTargetComboPointCount, shouldShowTargetComboPoints } from "./combo-points";
import type { DemonSlayerUnitFrame } from "./unit-frame";
import { getUnitHealthValues } from "./unit-health";

let suppressPlayerVitalsUntil = 0;
let playerVitalsDirty = false;
let targetVitalsDirty = false;
let vitalsFlushScheduled = false;

function getTimeSeconds(): number {
  if (GetTime !== undefined) {
    return GetTime();
  }

  return 0;
}

export function isWatchedUnit(unitId: string | undefined): unitId is WatchedUnit {
  return unitId === "player" || unitId === "target";
}

export function suppressPlayerVitalsAfterLevelChange(): void {
  suppressPlayerVitalsUntil = getTimeSeconds() + PLAYER_LEVEL_VITALS_SUPPRESS_SECONDS;
}

export function markVitalsDirty(unit: WatchedUnit): void {
  if (!getSettings().enableDemonSlayerUnitFrames) {
    return;
  }

  if (unit === "player") {
    playerVitalsDirty = true;
  } else {
    targetVitalsDirty = true;
  }

  scheduleVitalsFlush();
}

export function flushVitalsNow(force = false): void {
  vitalsFlushScheduled = false;
  playerVitalsDirty = false;
  targetVitalsDirty = false;

  if (!getSettings().enableDemonSlayerUnitFrames) {
    return;
  }

  const frames = ensureFrames();
  updatePlayerVitals(frames.player, force);
  updateTargetVitals(frames.target, force);
}

function scheduleVitalsFlush(): void {
  if (vitalsFlushScheduled || C_Timer === undefined) {
    return;
  }

  vitalsFlushScheduled = true;
  C_Timer.After(VITALS_THROTTLE_SECONDS, () => {
    vitalsFlushScheduled = false;

    if (!getSettings().enableDemonSlayerUnitFrames) {
      playerVitalsDirty = false;
      targetVitalsDirty = false;
      return;
    }

    const frames = ensureFrames();

    if (playerVitalsDirty) {
      playerVitalsDirty = false;
      updatePlayerVitals(frames.player);
    }

    if (targetVitalsDirty) {
      targetVitalsDirty = false;
      updateTargetVitals(frames.target);
    }
  });
}

export function updatePlayerVitals(frame: DemonSlayerUnitFrame, force = false): void {
  if (!force && getTimeSeconds() < suppressPlayerVitalsUntil) {
    return;
  }

  const playerHealth = getUnitHealthValues("player");
  frame.updateHealth(playerHealth.current, playerHealth.max);
  const [powerType] = UnitPowerType("player");
  frame.updatePower(UnitPower("player", powerType) ?? 0, UnitPowerMax("player", powerType) ?? 0, powerType);
}

export function updateTargetVitals(frame: DemonSlayerUnitFrame, _force = false): void {
  if (!UnitExists("target")) {
    frame.updateComboPoints(0, false);

    if (frame.isShown()) {
      frame.hide();
    }

    return;
  }

  const isEnemy = UnitIsEnemy("target", "player") === true;
  const targetHealth = getUnitHealthValues("target");
  frame.updateHealth(targetHealth.current, targetHealth.max, isEnemy);
  const [powerType] = UnitPowerType("target");
  frame.updatePower(UnitPower("target", powerType) ?? 0, UnitPowerMax("target", powerType) ?? 0, powerType);
  frame.updateComboPoints(getTargetComboPointCount(), shouldShowTargetComboPoints());

  if (!frame.isShown()) {
    frame.show();
  }
}

export function refreshTargetComboPoints(frame: DemonSlayerUnitFrame): void {
  if (!UnitExists("target")) {
    frame.updateComboPoints(0, false);
    return;
  }

  frame.updateComboPoints(getTargetComboPointCount(), shouldShowTargetComboPoints());
}
