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

interface WowAnimation {
  SetDuration(seconds: number): void;
  SetFromAlpha(alpha: number): void;
  SetOrder(order: number): void;
  SetSmoothing(smoothing: "IN" | "OUT" | "IN_OUT"): void;
  SetToAlpha(alpha: number): void;
}

interface WowAnimationGroup {
  CreateAnimation(animationType: "Alpha"): WowAnimation;
  Play(): void;
  Stop(): void;
  SetScript(scriptName: WowScriptName, handler: () => void): void;
}

interface WowFrame {
  ClearAllPoints(): void;
  GetNumPoints(): number;
  GetParent(): WowFrame | undefined;
  GetPoint(index: number): LuaMultiReturn<[WowPoint, WowFrame | undefined, WowPoint, number, number]>;
  IsShown(): boolean;
  HookScript(scriptName: WowScriptName, handler: (self: this, ...args: unknown[]) => void): void;
  RegisterEvent(eventName: WowEventName): void;
  RegisterUnitEvent?(eventName: WowEventName, ...unitIds: string[]): void;
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
  GetFrameLevel?(): number;
  SetMovable(movable: boolean): void;
  SetAlpha?(alpha: number): void;
  SetAttribute?(name: string, value: unknown): void;
  UnregisterAllEvents?(): void;
  Show(): void;
  Hide(): void;
  Raise?(): void;
  CreateAnimationGroup(): WowAnimationGroup;
  CreateFontString(name?: string, drawLayer?: string, template?: string): WowFontString;
  CreateTexture(name?: string, drawLayer?: string, template?: string, subLevel?: number): WowTexture;
}

interface WowButton extends WowFrame {
  RegisterForDrag(...buttons: string[]): void;
  RegisterForClicks(...clicks: string[]): void;
  SetText(text: string): void;
  GetNormalTexture(): WowTexture;
  GetPushedTexture(): WowTexture;
  GetDisabledTexture(): WowTexture;
  GetHighlightTexture(): WowTexture;
  SetNormalTexture(texturePath: string): void;
  SetPushedTexture(texturePath: string): void;
  SetDisabledTexture(texturePath: string): void;
  SetHighlightTexture(texturePath: string, blendMode?: string): void;
}

interface WowCheckButton extends WowButton {
  GetChecked(): boolean | 1 | undefined;
  SetChecked(checked: boolean): void;
}

interface WowFontString {
  Hide(): void;
  Show(): void;
  SetAlpha?(alpha: number): void;
  SetFont(fontPath: string, fontSize: number, flags: string): void;
  SetJustifyH(justify: "LEFT" | "CENTER" | "RIGHT"): void;
  SetJustifyV(justify: "TOP" | "MIDDLE" | "BOTTOM"): void;
  SetPoint(
    point: WowPoint,
    relativeTo: WowFrame | WowFontString | WowTexture,
    relativePoint: WowPoint,
    x?: number,
    y?: number
  ): void;
  SetShadowColor(red: number, green: number, blue: number, alpha?: number): void;
  SetShadowOffset(x: number, y: number): void;
  SetText(text: string): void;
  SetTextColor(red: number, green: number, blue: number, alpha?: number): void;
  GetStringWidth(): number;
}

interface WowTexture {
  GetTexture(): string;
  GetWidth(): number;
  GetHeight(): number;
  IsShown(): boolean;
  Hide(): void;
  Show(): void;
  SetPoint(point: WowPoint, relativeTo: WowFrame | WowTexture, relativePoint: WowPoint, x?: number, y?: number): void;
  SetSize(width: number, height: number): void;
  SetTexCoord(left: number, right: number, top: number, bottom: number): void;
  SetTexture(texturePath: string): void;
  SetVertexColor?(red: number, green: number, blue: number, alpha?: number): void;
  SetBlendMode?(mode: "ADD" | "BLEND" | "MOD" | string): void;
  SetWidth?(width: number): void;
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
declare let MicroButtonPortrait: WowTexture | undefined;
declare function CharacterMicroButton_SetNormal(): void;
declare function CharacterMicroButton_SetPushed(): void;
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
declare function hooksecurefunc(
  target: WowFrame,
  method: "Show" | string,
  handler: (...args: unknown[]) => void
): void;

type WowUnitId = "player" | "target" | string;

declare function UnitName(unit: WowUnitId): string | undefined;
declare function UnitGUID(unit: WowUnitId): string | undefined;
declare function UnitClass(unit: WowUnitId): LuaMultiReturn<[string, string, number]>;
declare function UnitRace(unit: WowUnitId): LuaMultiReturn<[string, string, number]>;
declare function UnitLevel(unit: WowUnitId): number | undefined;
declare function UnitExists(unit: WowUnitId): boolean;
declare function UnitHealth(unit: WowUnitId): number | undefined;
declare function UnitHealthMax(unit: WowUnitId): number | undefined;
declare function UnitPower(unit: WowUnitId, powerType?: number): number | undefined;
declare function UnitPowerMax(unit: WowUnitId, powerType?: number): number | undefined;
declare function UnitPowerType(unit: WowUnitId): LuaMultiReturn<[number, string, number]>;
declare function UnitClassification(unit: WowUnitId): string | undefined;
declare function UnitIsEnemy(unit: WowUnitId, otherUnit: WowUnitId): boolean;
declare function UnitIsPlayer(unit: WowUnitId): boolean | 1 | undefined;
declare function UnitIsDead(unit: WowUnitId): boolean;
declare function SetPortraitTexture(texture: WowTexture, unit: WowUnitId): void;
declare function GetComboPoints(unit: WowUnitId, target: WowUnitId): number | undefined;
declare function GetShapeshiftForm(): number;
declare function GetNumShapeshiftForms(): number;
declare function GetNumSpellTabs(): number;
declare function GetSpellTabInfo(
  tabIndex: number
): LuaMultiReturn<[string, string, number, number, boolean, number, number, number]>;
declare function GetSpellInfo(
  spellId: number
): LuaMultiReturn<[string, string, number, number, number, number, number]>;
declare function GetSpellInfo(
  spellBookIndex: number,
  bookType: "spell"
): LuaMultiReturn<[string, string, number, number, number, number, number]>;
declare const CombatLogGetCurrentEventInfo:
  | (() => LuaMultiReturn<
      [
        number,
        string,
        boolean,
        string,
        string,
        number,
        number,
        string,
        string,
        number,
        number,
        number,
        string,
        number,
        string
      ]
    >)
  | undefined;
declare function GetTime(): number;
declare function GetBuildInfo(): LuaMultiReturn<[string, string, string, number]>;
declare function GetCursorPosition(): LuaMultiReturn<[number, number]>;
declare function GetScreenWidth(): number;
declare function GetScreenHeight(): number;
declare function ShowUIPanel(frame: WowFrame): void;
declare function GetLocale(): WowLocale;
declare const InCombatLockdown: (() => boolean) | undefined;
declare function print(...messages: unknown[]): void;
declare function pcall<R>(func: () => R): LuaMultiReturn<[boolean, R | undefined]>;

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
