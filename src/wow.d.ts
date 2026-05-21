type WowEventName = "ADDON_LOADED" | "PLAYER_LOGIN" | string;
type WowLocale = "enUS" | "zhCN" | "zhTW" | string;
type WowMouseButton = "LeftButton" | "RightButton" | string;
type WowPoint =
  | "TOPLEFT"
  | "TOP"
  | "TOPRIGHT"
  | "LEFT"
  | "CENTER"
  | "RIGHT"
  | "BOTTOMLEFT"
  | "BOTTOM"
  | "BOTTOMRIGHT";
type WowFrameStrata = "BACKGROUND" | "LOW" | "MEDIUM" | "HIGH" | "DIALOG" | "FULLSCREEN" | string;
type WowScriptName =
  | "OnEvent"
  | "OnClick"
  | "OnDragStart"
  | "OnDragStop"
  | "OnEnter"
  | "OnLeave"
  | "OnUpdate"
  | string;

interface WowSecureFrame extends WowFrame {
  Execute(body: string, snippetId?: string): void;
  SetFrameRef(name: string, frame: WowFrame): void;
}

interface WowFrame {
  ClearAllPoints(): void;
  GetNumPoints(): number;
  GetParent(): WowFrame | undefined;
  GetPoint(index: number): LuaMultiReturn<[WowPoint, WowFrame | undefined, WowPoint, number, number]>;
  IsShown(): boolean;
  HookScript(scriptName: WowScriptName, handler: (self: this, ...args: unknown[]) => void): void;
  RegisterEvent(eventName: WowEventName): void;
  UnregisterEvent?(eventName: WowEventName): void;
  SetScript(scriptName: WowScriptName, handler: (self: this, ...args: unknown[]) => void): void;
  EnableMouse(enabled: boolean): void;
  GetCenter(): LuaMultiReturn<[number, number]>;
  GetEffectiveScale(): number;
  GetHeight(): number;
  GetScale(): number;
  GetWidth(): number;
  SetSize(width: number, height: number): void;
  SetPoint(point: WowPoint, relativeTo: WowFrame, relativePoint: WowPoint, x?: number, y?: number): void;
  SetParent(parent: WowFrame): void;
  SetScale(scale: number): void;
  SetFrameStrata(strata: WowFrameStrata): void;
  SetFrameLevel(level: number): void;
  SetMovable(movable: boolean): void;
  SetAlpha?(alpha: number): void;
  SetAttribute?(name: string, value: unknown): void;
  UnregisterAllEvents?(): void;
  Show(): void;
  Hide(): void;
  CreateFontString(name?: string, drawLayer?: string, template?: string): WowFontString;
  CreateTexture(name?: string, drawLayer?: string, template?: string, subLevel?: number): WowTexture;
}

interface WowButton extends WowFrame {
  RegisterForDrag(...buttons: string[]): void;
  RegisterForClicks(...clicks: string[]): void;
  SetText(text: string): void;
  SetNormalTexture(texturePath: string): void;
  SetPushedTexture(texturePath: string): void;
  SetHighlightTexture(texturePath: string, blendMode?: string): void;
}

interface WowCheckButton extends WowButton {
  GetChecked(): boolean | 1 | undefined;
  SetChecked(checked: boolean): void;
}

interface WowFontString {
  SetPoint(point: WowPoint, relativeTo: WowFrame | WowFontString, relativePoint: WowPoint, x?: number, y?: number): void;
  SetText(text: string): void;
}

interface WowTexture {
  SetPoint(point: WowPoint, relativeTo: WowFrame | WowTexture, relativePoint: WowPoint, x?: number, y?: number): void;
  SetSize(width: number, height: number): void;
  SetTexCoord(left: number, right: number, top: number, bottom: number): void;
  SetTexture(texturePath: string): void;
}

interface WowOptionsPanel extends WowFrame {
  name?: string;
  refresh?: () => void;
}

interface WowSettingsCategory {
  ID?: number;
  GetID?: () => number;
}

interface WowSettingsApi {
  OpenToCategory?: (this: void, category: number | WowSettingsCategory) => void;
  RegisterAddOnCategory?: (this: void, category: WowSettingsCategory) => void;
  RegisterCanvasLayoutCategory?: (
    this: void,
    panel: WowOptionsPanel,
    categoryName: string
  ) => LuaMultiReturn<[WowSettingsCategory, unknown]>;
}

interface WowTooltip extends WowFrame {
  SetOwner(owner: WowFrame, anchor: string): void;
  SetText(text: string): void;
  AddLine(text: string, red?: number, green?: number, blue?: number): void;
}

declare function CreateFrame(
  frameType: "Frame",
  name?: string,
  parent?: WowFrame,
  template?: string
): WowFrame;
declare function CreateFrame(
  frameType: "Frame",
  name: string,
  parent: WowFrame,
  template: "SecureHandlerBaseTemplate"
): WowSecureFrame;

declare let MoveMicroButtons: ((...args: unknown[]) => void) | undefined;
declare const MICRO_BUTTONS: string[] | undefined;
declare function UpdateMicroButtonsParent(parent: WowFrame): void;
declare function CreateFrame(
  frameType: "Button",
  name?: string,
  parent?: WowFrame,
  template?: string
): WowButton;
declare function CreateFrame(
  frameType: "CheckButton",
  name?: string,
  parent?: WowFrame,
  template?: string
): WowCheckButton;

declare function hooksecurefunc(
  target: string | ((...args: unknown[]) => void),
  handler: (...args: unknown[]) => void
): void;

declare function UnitName(unit: "player"): string | undefined;
declare function GetBuildInfo(): LuaMultiReturn<[string, string, string, number]>;
declare function GetCursorPosition(): LuaMultiReturn<[number, number]>;
declare function GetLocale(): WowLocale;
declare const InCombatLockdown: (() => boolean) | undefined;
declare function print(...messages: unknown[]): void;

declare const GameTooltip: WowTooltip;
declare const InterfaceOptions_AddCategory: ((panel: WowOptionsPanel) => void) | undefined;
declare const InterfaceOptionsFrame_OpenToCategory: ((panel: WowOptionsPanel) => void) | undefined;
declare const C_Timer: {
  After: (this: void, seconds: number, callback: () => void) => void;
};
declare const Minimap: WowFrame;
declare const Settings: WowSettingsApi | undefined;
declare const UIParent: WowFrame;
declare const _G: Record<string, unknown>;
declare const SlashCmdList: Record<string, (message?: string) => void>;
declare const WOW_PROJECT_CLASSIC: number | undefined;
declare const WOW_PROJECT_ID: number | undefined;
