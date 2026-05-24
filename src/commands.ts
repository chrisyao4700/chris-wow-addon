import { getLaunchCount, getSettings, resetLaunchCount } from "./core/db";
import { getMessages } from "./core/localization";
import { SLASH_ALIASES, SLASH_COMMAND } from "./core/config";
import { printActionLayoutStatus, syncActionLayout } from "./features/action-layout";
import {
  previewSpellTextEffect,
  printSpellTextEffectStatus
} from "./features/spell-text-effect";
import {
  isSpellEffectLayoutEditorActive,
  toggleSpellEffectLayoutEditor
} from "./features/spell-animation-effect";
import {
  printDemonSlayerSystemButtonStatus,
  syncDemonSlayerSystemButtons
} from "./features/system-buttons";
import { addonPrint, getRuntimeInfo, RuntimeInfo } from "./platform/wow";

let openSettingsPanel: (() => void) | undefined;

function valueOrUnknown(value: number | string | boolean | undefined): string {
  if (value === undefined) {
    return "unknown";
  }

  return `${value}`;
}

function printRuntimeInfo(messages: ReturnType<typeof getMessages>, info: RuntimeInfo): void {
  addonPrint(messages.debugHeader);
  addonPrint(messages.debugLine("Version", info.version));
  addonPrint(messages.debugLine("Build", info.build));
  addonPrint(messages.debugLine("Build date", info.buildDate));
  addonPrint(messages.debugLine("Interface", valueOrUnknown(info.interfaceVersion)));
  addonPrint(messages.debugLine("Expected interface", valueOrUnknown(info.expectedInterfaceVersion)));
  addonPrint(messages.debugLine("Locale", info.locale));
  addonPrint(messages.debugLine("Project ID", valueOrUnknown(info.projectId)));
  addonPrint(messages.debugLine("Classic project ID", valueOrUnknown(info.projectClassic)));
  addonPrint(messages.debugLine("Titan interface", valueOrUnknown(info.isTitanInterface)));
}

export function printDebugInfo(): void {
  printRuntimeInfo(getMessages(), getRuntimeInfo());
}

function handleSlashCommand(message?: string): void {
  const messages = getMessages();
  const command = message || "";
  const settings = getSettings();

  if (command === "stats") {
    addonPrint(messages.stats(getLaunchCount()));
    return;
  }

  if (command === "reset") {
    resetLaunchCount();
    addonPrint(messages.reset);
    return;
  }

  if (command === "debug") {
    printDebugInfo();
    return;
  }

  if (command === "layout") {
    if (!settings.enableCustomActionLayout) {
      addonPrint(messages.featureDisabled(messages.enableCustomActionLayout));
      return;
    }

    syncActionLayout(true);
    printActionLayoutStatus();
    return;
  }

  if (command === "effect test") {
    if (!settings.enableSpellTextEffect) {
      addonPrint(messages.featureDisabled(messages.enableSpellTextEffect));
      return;
    }

    previewSpellTextEffect();
    addonPrint("Spell text effect preview shown.");
    return;
  }

  if (command === "effect layout") {
    if (!settings.enableSpellTextEffect) {
      addonPrint(messages.featureDisabled(messages.enableSpellTextEffect));
      return;
    }

    if (isSpellEffectLayoutEditorActive()) {
      toggleSpellEffectLayoutEditor();
      addonPrint(messages.spellEffectLayoutEditorClosed);
      return;
    }

    toggleSpellEffectLayoutEditor();
    addonPrint(messages.spellEffectLayoutEditorOpened);
    return;
  }

  if (command === "effect" || command === "effect status") {
    printSpellTextEffectStatus();
    return;
  }

  if (command === "buttons" || command === "buttons status") {
    if (!settings.enableDemonSlayerSystemButtons) {
      addonPrint(messages.featureDisabled(messages.enableDemonSlayerSystemButtons));
      return;
    }

    syncDemonSlayerSystemButtons();
    printDemonSlayerSystemButtonStatus();
    return;
  }

  if (command === "options" || command === "settings") {
    if (openSettingsPanel !== undefined) {
      openSettingsPanel();
      return;
    }

    addonPrint(messages.settingsUnavailable);
    return;
  }

  addonPrint(messages.help);
}

export function registerSlashCommands(settingsPanelOpener?: () => void): void {
  openSettingsPanel = settingsPanelOpener;
  _G.SLASH_SLAYERUI1 = SLASH_ALIASES.short;
  _G.SLASH_SLAYERUI2 = SLASH_ALIASES.full;
  SlashCmdList[SLASH_COMMAND] = handleSlashCommand;
}
