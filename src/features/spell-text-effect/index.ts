import { ADDON_NAME } from "../../core/config";
import { getSettings } from "../../core/db";
import { addonPrint } from "../../platform/wow";
import {
  clearLoadedPlayerSpellTextCache,
  getLoadedPlayerClassFileName,
  loadPlayerClassSpellTextBindings
} from "./class-bindings";
import { rogueSpellTextEffectMapping } from "./mappings/classes/rogue";
import type { PlayerClassFileName } from "./mappings/types";
import { SpellTextEffectBinding, SpellTextEffectRegistry } from "./registry";
import { getTextEffectTimingSummary, showTextEffect } from "./text-effect";

const CAST_TRIGGER_COOLDOWN_SECONDS = 1;
const SPELLBOOK_REBUILD_DELAY_SECONDS = 0.2;
const PREVIEW_DISPLAY_TEXT =
  rogueSpellTextEffectMapping.bindings[0]?.displayText ?? "Spell text effect preview";

const spellTextRegistry = new SpellTextEffectRegistry();

let eventFrame: WowFrame | undefined;
let hasCombatLogApi = false;
let hasUnitSpellcastApi = false;
let lastPlayerSpellLog = "none";
let lastTriggerKey = "";
let lastTriggerAt = 0;
let spellbookRebuildPending = false;

function isSpellTextEffectEnabled(): boolean {
  return getSettings().enableSpellTextEffect;
}

function registerSpellTextEvent(frame: WowFrame, eventName: string): boolean {
  const [registered] = pcall(() => frame.RegisterEvent(eventName));
  return registered;
}

function isPlayerSource(sourceGUID: string | undefined): boolean {
  const playerGUID = UnitGUID("player");

  if (playerGUID === undefined || sourceGUID === undefined) {
    return false;
  }

  return sourceGUID === playerGUID;
}

function shouldSkipDuplicateTrigger(spellId: number | undefined, spellName: string | undefined): boolean {
  const triggerKey =
    spellId !== undefined && spellId > 0 ? `id:${spellId}` : `name:${spellName ?? ""}`;
  const now = GetTime();

  if (triggerKey === lastTriggerKey && now - lastTriggerAt < CAST_TRIGGER_COOLDOWN_SECONDS) {
    return true;
  }

  lastTriggerKey = triggerKey;
  lastTriggerAt = now;
  return false;
}

function rememberPlayerSpellCast(spellId: number | undefined, spellName: string | undefined, source: string): void {
  lastPlayerSpellLog = `${source}: id=${spellId ?? 0}, name=${spellName ?? "?"}`;
}

function getSpellNameById(spellId: number): string | undefined {
  const [spellName] = GetSpellInfo(spellId);
  return spellName;
}

/**
 * Resolves a skill cast to mapped display text and plays the overlay when matched.
 * Returns true when an effect was shown.
 */
export function showSpellTextEffect(spellId: number | undefined, spellName: string | undefined): boolean {
  if (!isSpellTextEffectEnabled()) {
    return false;
  }

  const displayText = spellTextRegistry.resolveDisplayText(spellId, spellName);

  if (displayText === undefined) {
    return false;
  }

  showTextEffect(displayText);
  return true;
}

function tryShowSpellTextEffectFromCast(
  spellId: number | undefined,
  spellName: string | undefined,
  source: string
): void {
  if (!isSpellTextEffectEnabled()) {
    return;
  }

  if (shouldSkipDuplicateTrigger(spellId, spellName)) {
    return;
  }

  rememberPlayerSpellCast(spellId, spellName, source);
  showSpellTextEffect(spellId, spellName);
}

export function setSpellTextEffectBindings(bindings: SpellTextEffectBinding[]): void {
  spellTextRegistry.setBindings(bindings);
}

export function reloadPlayerClassSpellTextBindings(): PlayerClassFileName | undefined {
  if (!isSpellTextEffectEnabled()) {
    spellTextRegistry.setBindings([]);
    return undefined;
  }

  return loadPlayerClassSpellTextBindings(spellTextRegistry);
}

export function previewSpellTextEffect(displayText: string = PREVIEW_DISPLAY_TEXT): void {
  showTextEffect(displayText);
}

export function printSpellTextEffectStatus(): void {
  const loadedClass = reloadPlayerClassSpellTextBindings();
  const trackedIds = Object.keys(spellTextRegistry.getTrackedSpellIds());
  const bindings = spellTextRegistry.getBindings();
  const watchNames = bindings.length > 0 ? bindings[0].spellNames.join(", ") : "none";

  addonPrint("Spell text effect status:");
  addonPrint(`Enabled: ${isSpellTextEffectEnabled()}`);
  addonPrint(`Loaded class: ${loadedClass ?? "unknown (not logged in yet?)"}`);
  addonPrint(`Combat log API: ${hasCombatLogApi ? "yes" : "no"}`);
  addonPrint(`UNIT_SPELLCAST API: ${hasUnitSpellcastApi ? "yes" : "no"}`);
  addonPrint(`Timing: ${getTextEffectTimingSummary()}`);
  addonPrint(`Bindings: ${bindings.length}`);
  addonPrint(`Tracked spell IDs: ${trackedIds.length > 0 ? trackedIds.join(", ") : "none (check skill names)"}`);
  addonPrint(`Watch names: ${watchNames}`);
  addonPrint(`Last player spell: ${lastPlayerSpellLog}`);
  addonPrint("Test overlay: /cwa effect test");
}

function handleCombatLogEvent(): void {
  if (!hasCombatLogApi || !isSpellTextEffectEnabled()) {
    return;
  }

  const [, subEvent, , sourceGUID, , , , , , , , spellId, spellName] = CombatLogGetCurrentEventInfo!();

  if (subEvent !== "SPELL_CAST_SUCCESS") {
    return;
  }

  if (!isPlayerSource(sourceGUID)) {
    return;
  }

  tryShowSpellTextEffectFromCast(spellId, spellName, "combat:SUCCESS");
}

function handleUnitSpellCast(unit: string | undefined, spellId: number | undefined): void {
  if (!isSpellTextEffectEnabled()) {
    return;
  }

  if (unit !== "player" || spellId === undefined || spellId <= 0) {
    return;
  }

  tryShowSpellTextEffectFromCast(spellId, getSpellNameById(spellId), "unit");
}

function runSpellbookRebuild(): void {
  if (!isSpellTextEffectEnabled()) {
    return;
  }

  const loadedClass = getLoadedPlayerClassFileName();

  if (loadedClass === undefined) {
    reloadPlayerClassSpellTextBindings();
    return;
  }

  spellTextRegistry.rebuildTrackedSpellIds();
}

function scheduleSpellbookRebuild(): void {
  if (spellbookRebuildPending) {
    return;
  }

  spellbookRebuildPending = true;

  if (C_Timer === undefined) {
    runSpellbookRebuild();
    spellbookRebuildPending = false;
    return;
  }

  C_Timer.After(SPELLBOOK_REBUILD_DELAY_SECONDS, () => {
    spellbookRebuildPending = false;
    runSpellbookRebuild();
  });
}

function handleSpellbookChanged(): void {
  if (!isSpellTextEffectEnabled()) {
    spellTextRegistry.setBindings([]);
    clearLoadedPlayerSpellTextCache();
    return;
  }

  scheduleSpellbookRebuild();
}

export function syncSpellTextEffect(): void {
  if (!isSpellTextEffectEnabled()) {
    spellTextRegistry.setBindings([]);
    clearLoadedPlayerSpellTextCache();
    return;
  }

  reloadPlayerClassSpellTextBindings();
}

export function registerSpellTextEffect(): void {
  if (eventFrame !== undefined) {
    syncSpellTextEffect();
    return;
  }

  hasCombatLogApi = CombatLogGetCurrentEventInfo !== undefined;
  eventFrame = CreateFrame("Frame");
  eventFrame.RegisterEvent("ADDON_LOADED");
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  eventFrame.RegisterEvent("SPELLS_CHANGED");

  hasUnitSpellcastApi = registerSpellTextEvent(eventFrame, "UNIT_SPELLCAST_SUCCEEDED");

  // Combat log fires for all nearby combat; only use it when unit spellcast events are unavailable.
  if (hasCombatLogApi && !hasUnitSpellcastApi) {
    eventFrame.RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED");
  }

  eventFrame.SetScript("OnEvent", (_self, eventName, ...args: unknown[]) => {
    if (eventName === "ADDON_LOADED" && args[0] === ADDON_NAME) {
      syncSpellTextEffect();
      return;
    }

    if (eventName === "PLAYER_LOGIN" || eventName === "PLAYER_ENTERING_WORLD") {
      syncSpellTextEffect();
      return;
    }

    if (eventName === "SPELLS_CHANGED") {
      handleSpellbookChanged();
      return;
    }

    if (eventName === "COMBAT_LOG_EVENT_UNFILTERED") {
      handleCombatLogEvent();
      return;
    }

    if (eventName === "UNIT_SPELLCAST_SUCCEEDED") {
      handleUnitSpellCast(args[0] as string | undefined, args[2] as number | undefined);
    }
  });
}

export type { SpellTextEffectBinding };
export type { PlayerClassFileName, PlayerRaceFileName } from "./mappings/types";
