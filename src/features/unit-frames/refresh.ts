import { getSettings } from "../../core/db";
import {
  getPlayerBreathStyle,
  getTargetBreathStyle
} from "./breath-styles";
import { ensureFrames, hideStoredFrames } from "./frame-store";
import {
  getPlayerCorpsRank,
  getPlayerSubtitle,
  getTargetRankLabel,
  getTargetSubtitle
} from "./ranks";
import type { DemonSlayerUnitFrame } from "./unit-frame";
import { formatUnitLevel } from "./unit-health";
import { suppressPlayerVitalsAfterLevelChange, updatePlayerVitals, updateTargetVitals } from "./vitals";
import { stopVitalsPolling } from "./vitals-poll";
import { syncBlizzardUnitFrameSuppression } from "./blizzard-suppress";

function isPlayerUnit(unit: string): boolean {
  const isPlayer = UnitIsPlayer(unit);
  return isPlayer === true || isPlayer === 1;
}

function useChineseLabels(): boolean {
  const locale = GetLocale();
  return locale === "zhCN" || locale === "zhTW";
}

function getClassFileName(unit: string): string | undefined {
  const [, classFileName] = UnitClass(unit);
  return classFileName;
}

export function refreshPlayerFrame(frame: DemonSlayerUnitFrame): void {
  const useChinese = useChineseLabels();
  const classFileName = getClassFileName("player");
  const breathStyle = getPlayerBreathStyle(classFileName);
  const playerName = UnitName("player") ?? (useChinese ? "队士" : "Slayer");
  const playerLevel = UnitLevel("player") ?? 1;
  const rank = getPlayerCorpsRank(playerLevel);
  const subtitle = getPlayerSubtitle(useChinese);

  frame.setUseChineseLabels(useChinese);
  frame.setStyle(breathStyle);
  frame.setClassIcon(classFileName);
  frame.setTexts(subtitle, rank, playerName);
  frame.updateLevel(playerLevel, formatUnitLevel(playerLevel));
  frame.updatePortrait("player");
  frame.updateComboPoints(0, false);
  updatePlayerVitals(frame, true);
  frame.show();
}

export function refreshPlayerLevel(frame: DemonSlayerUnitFrame): void {
  const useChinese = useChineseLabels();
  const playerLevel = UnitLevel("player") ?? 1;
  const rank = getPlayerCorpsRank(playerLevel);
  const playerName = UnitName("player") ?? (useChinese ? "队士" : "Slayer");
  const subtitle = getPlayerSubtitle(useChinese);

  frame.setTexts(subtitle, rank, playerName);
  frame.updateLevel(playerLevel, formatUnitLevel(playerLevel));
  updatePlayerVitals(frame, true);
}

let playerLevelRefreshPending = false;

export function scheduleRefreshPlayerLevel(): void {
  if (!getSettings().enableDemonSlayerUnitFrames) {
    return;
  }

  suppressPlayerVitalsAfterLevelChange();

  if (playerLevelRefreshPending) {
    return;
  }

  playerLevelRefreshPending = true;

  const runRefresh = (): void => {
    playerLevelRefreshPending = false;

    if (!getSettings().enableDemonSlayerUnitFrames) {
      return;
    }

    refreshPlayerLevel(ensureFrames().player);
  };

  if (C_Timer === undefined) {
    runRefresh();
    return;
  }

  C_Timer.After(0, runRefresh);
}

export function refreshTargetLevel(frame: DemonSlayerUnitFrame): void {
  if (!UnitExists("target")) {
    return;
  }

  const targetLevel = UnitLevel("target");
  frame.updateLevel(targetLevel, formatUnitLevel(targetLevel));
}

export function refreshTargetFrame(frame: DemonSlayerUnitFrame): void {
  if (!UnitExists("target")) {
    frame.updateComboPoints(0, false);
    frame.hide();
    return;
  }

  const useChinese = useChineseLabels();
  const isEnemy = UnitIsEnemy("target", "player") === true;
  const targetIsPlayer = isPlayerUnit("target");
  const breathStyle = getTargetBreathStyle(isEnemy);
  const targetName = UnitName("target") ?? (useChinese ? "目标" : "Target");
  const classification = UnitClassification("target");
  const rank = getTargetRankLabel(classification, isEnemy, useChinese);
  const subtitle = getTargetSubtitle(isEnemy, useChinese);
  const targetClassFileName = targetIsPlayer ? getClassFileName("target") : undefined;

  frame.setUseChineseLabels(useChinese);
  frame.setStyle(breathStyle);
  frame.setClassIcon(targetClassFileName);
  frame.setShowPowerBar(!isEnemy && targetIsPlayer);
  frame.setTexts(subtitle, rank, targetName);
  const targetLevel = UnitLevel("target");
  frame.updateLevel(targetLevel, formatUnitLevel(targetLevel));
  frame.updatePortrait("target");
  updateTargetVitals(frame, true);
}

export function refreshUnitFrames(): void {
  if (!getSettings().enableDemonSlayerUnitFrames) {
    hideStoredFrames();
    syncBlizzardUnitFrameSuppression(false);
    stopVitalsPolling();
    return;
  }

  const frames = ensureFrames();
  syncBlizzardUnitFrameSuppression(true);
  refreshPlayerFrame(frames.player);
  refreshTargetFrame(frames.target);
}
