import { SLASH_ALIASES, SLASH_COMMAND } from "./config";
import { getLaunchCount, resetLaunchCount } from "./db";
import { getMessages } from "./localization";
import { addonPrint, getRuntimeInfo, RuntimeInfo } from "./platform/wow";

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

function handleSlashCommand(message?: string): void {
  const messages = getMessages();
  const command = message || "";

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
    printRuntimeInfo(messages, getRuntimeInfo());
    return;
  }

  addonPrint(messages.help);
}

export function registerSlashCommands(): void {
  _G.SLASH_CHRISWOWADDON1 = SLASH_ALIASES.short;
  _G.SLASH_CHRISWOWADDON2 = SLASH_ALIASES.full;
  SlashCmdList[SLASH_COMMAND] = handleSlashCommand;
}
