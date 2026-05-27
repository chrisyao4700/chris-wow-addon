import { ADDON_NAME } from "../../core/config";
import { ensureSavedVariables, getSettings } from "../../core/db";
import { addonPrint } from "../../platform/wow";
import { getBuffEffectAssetProbeSummary, clearBuffEffectAssetCache } from "./assets";
import type { BuffTriggerAuraScanner, BuffTriggerEvent } from "./aura-scanner";
import { BuffTriggerAuraScanner as AuraScanner } from "./aura-scanner";
import {
  clearLoadedPlayerBuffTriggerCache,
  getLoadedPlayerClassFileName,
  loadPlayerClassBuffTriggerBindings
} from "./class-bindings";
import {
  activateBuffTriggerEffect,
  clearAllBuffTriggerDisplays,
  deactivateBuffTriggerEffect,
  getActiveBuffTriggerDisplayCount,
  getBuffTriggerPoolSize,
  preloadBuffTriggerEffectPool,
  showBuffTriggerEffect,
  tryPlayBuffTriggerEffect,
  type BuffTriggerPlayResult
} from "./controller";
import { canPlayBuffTriggerEffect } from "./effect-instance";
import {
  enterBuffTriggerLayoutEditor,
  exitBuffTriggerLayoutEditor,
  isBuffTriggerLayoutEditorActive,
  syncBuffTriggerLayoutEditor,
  toggleBuffTriggerLayoutEditor
} from "./layout-editor";
import { applyBuffTriggerAnchorLayout, ensureBuffTriggerEffectArea } from "./layout-settings";
import { BuffTriggerEffectRegistry } from "./registry";
import { BUFF_TRIGGER_STYLE_SLUGS, isBuffTriggerStyleSlug, type BuffTriggerStyleSlug } from "./style-slugs";

const DEFAULT_PREVIEW_STYLE: BuffTriggerStyleSlug = "mist_breathing";

const buffTriggerRegistry = new BuffTriggerEffectRegistry();
let auraScanner: BuffTriggerAuraScanner | undefined;
let eventFrame: WowFrame | undefined;
let suppressAuraPlayback = false;
let lastTriggerLog = "none";

export function isBuffTriggerEffectEnabled(): boolean {
  const saved = ensureSavedVariables().settings;

  if (saved?.enableBuffTriggerEffect !== undefined) {
    return saved.enableBuffTriggerEffect;
  }

  return getSettings().enableSpellTextEffect;
}

function rememberTrigger(event: BuffTriggerEvent, result: BuffTriggerPlayResult): void {
  lastTriggerLog = `${result}: ${event.triggerKind} ${event.snapshot.auraName} -> ${event.binding.styleSlug}`;
}

function handleBuffTrigger(event: BuffTriggerEvent): void {
  if (event.triggerKind === "lose") {
    const result = deactivateBuffTriggerEffect(event.snapshot.key);
    rememberTrigger(event, result);
    return;
  }

  const cooldownSeconds = event.binding.retriggerCooldownSeconds;
  const result = activateBuffTriggerEffect(event.binding.styleSlug, event.snapshot.key, cooldownSeconds);
  rememberTrigger(event, result);
}

function ensureAuraScanner(): BuffTriggerAuraScanner {
  if (auraScanner === undefined) {
    auraScanner = new AuraScanner(buffTriggerRegistry, handleBuffTrigger);
  }

  return auraScanner;
}

export function reloadPlayerClassBuffTriggerBindings(): string | undefined {
  if (!isBuffTriggerEffectEnabled()) {
    buffTriggerRegistry.setBindings([]);
    return undefined;
  }

  return loadPlayerClassBuffTriggerBindings(buffTriggerRegistry);
}

export function previewBuffTriggerEffect(styleSlug: BuffTriggerStyleSlug = DEFAULT_PREVIEW_STYLE): BuffTriggerPlayResult {
  const result = tryPlayBuffTriggerEffect(styleSlug, `preview:${styleSlug}`, 0);
  lastTriggerLog = `${result}: preview -> ${styleSlug}`;
  return result;
}

export function printBuffTriggerEffectStatus(): void {
  const loadedClass = reloadPlayerClassBuffTriggerBindings();
  const bindings = buffTriggerRegistry.getBindings();
  const watchNames =
    bindings.length > 0 ? bindings.map(binding => binding.auraNames.join(" / ")).join("; ") : "none";

  addonPrint("Buff trigger effect status:");
  addonPrint(`Enabled: ${isBuffTriggerEffectEnabled()}`);
  addonPrint(`Loaded class: ${loadedClass ?? "unknown (not logged in yet?)"}`);
  addonPrint(`Bindings: ${bindings.length}`);
  addonPrint(`Watched aura names: ${buffTriggerRegistry.getWatchedAuraNameCount()}`);
  addonPrint(`Active mapped auras: ${ensureAuraScanner().getActiveSnapshotCount()}`);
  addonPrint(`Active displays: ${getActiveBuffTriggerDisplayCount()}`);
  addonPrint(`Watch names: ${watchNames}`);
  addonPrint(`Pool size: ${getBuffTriggerPoolSize()}`);
  addonPrint(`Preview style ready (${DEFAULT_PREVIEW_STYLE}): ${canPlayBuffTriggerEffect(DEFAULT_PREVIEW_STYLE) ? "yes" : "no"}`);

  for (const role of ["trigger_burst", "indicator_core", "particles_4x4", "active_glow"] as const) {
    addonPrint(`Asset ${role}: ${getBuffEffectAssetProbeSummary(DEFAULT_PREVIEW_STYLE, role)}`);
  }

  addonPrint(`Last trigger: ${lastTriggerLog}`);
  addonPrint("Test: /slayer buff test mist_breathing");
}

export function syncBuffTriggerEffect(): void {
  clearBuffEffectAssetCache();
  ensureBuffTriggerEffectArea();
  applyBuffTriggerAnchorLayout(ensureBuffTriggerEffectArea());
  syncBuffTriggerLayoutEditor();

  if (!isBuffTriggerEffectEnabled()) {
    buffTriggerRegistry.setBindings([]);
    clearLoadedPlayerBuffTriggerCache();
    ensureAuraScanner().clearSnapshots();
    clearAllBuffTriggerDisplays();
    return;
  }

  ensureAuraScanner().scanPlayerAuras();

  preloadBuffTriggerEffectPool();
  reloadPlayerClassBuffTriggerBindings();
}

export function registerBuffTriggerEffect(): void {
  if (eventFrame !== undefined) {
    syncBuffTriggerEffect();
    return;
  }

  eventFrame = CreateFrame("Frame");
  eventFrame.RegisterEvent("ADDON_LOADED");
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  if (eventFrame.RegisterUnitEvent !== undefined) {
    eventFrame.RegisterUnitEvent("UNIT_AURA", "player");
  } else {
    eventFrame.RegisterEvent("UNIT_AURA");
  }

  eventFrame.SetScript("OnEvent", (_self, eventName, ...args: unknown[]) => {
    if (eventName === "ADDON_LOADED" && args[0] === ADDON_NAME) {
      syncBuffTriggerEffect();
      return;
    }

    if (eventName === "PLAYER_LOGIN") {
      syncBuffTriggerEffect();
      return;
    }

    if (eventName === "PLAYER_ENTERING_WORLD") {
      syncBuffTriggerEffect();
      suppressAuraPlayback = true;
      ensureAuraScanner().setSuppressPlayback(true);
      ensureAuraScanner().scanPlayerAuras();
      ensureAuraScanner().setSuppressPlayback(false);
      suppressAuraPlayback = false;
      return;
    }

    if (eventName === "UNIT_AURA") {
      if (!isBuffTriggerEffectEnabled()) {
        return;
      }

      const unitToken = args[0] as string | undefined;

      if (unitToken !== undefined && unitToken !== "player") {
        return;
      }

      if (buffTriggerRegistry.getBindings().length === 0) {
        reloadPlayerClassBuffTriggerBindings();
      }

      ensureAuraScanner().setSuppressPlayback(suppressAuraPlayback);
      ensureAuraScanner().scanPlayerAuras();
    }
  });

  syncBuffTriggerEffect();
}

export {
  BUFF_TRIGGER_STYLE_SLUGS,
  canPlayBuffTriggerEffect,
  enterBuffTriggerLayoutEditor,
  exitBuffTriggerLayoutEditor,
  isBuffTriggerLayoutEditorActive,
  isBuffTriggerStyleSlug,
  preloadBuffTriggerEffectPool,
  showBuffTriggerEffect,
  syncBuffTriggerLayoutEditor,
  toggleBuffTriggerLayoutEditor
};

export {
  MAX_BUFF_TRIGGER_USER_SCALE,
  MIN_BUFF_TRIGGER_USER_SCALE,
  resetBuffTriggerLayoutSettings,
  updateBuffTriggerUserScale
} from "./layout-settings";

export type { BuffTriggerPlayResult, BuffTriggerStyleSlug };
