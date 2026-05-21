type WowEventName = "ADDON_LOADED" | "PLAYER_LOGIN" | string;
type WowLocale = "enUS" | "zhCN" | "zhTW" | string;

interface WowFrame {
  RegisterEvent(eventName: WowEventName): void;
  SetScript(
    scriptName: "OnEvent",
    handler: (self: WowFrame, eventName: WowEventName, ...args: unknown[]) => void
  ): void;
}

declare function CreateFrame(
  frameType: "Frame",
  name?: string,
  parent?: unknown,
  template?: string
): WowFrame;

declare function GetBuildInfo(): LuaMultiReturn<[string, string, string, number]>;
declare function GetLocale(): WowLocale;
declare function print(...messages: unknown[]): void;

declare const _G: Record<string, unknown>;
declare const SlashCmdList: Record<string, (message?: string) => void>;
declare const WOW_PROJECT_CLASSIC: number | undefined;
declare const WOW_PROJECT_ID: number | undefined;
