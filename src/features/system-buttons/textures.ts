import { ADDON_NAME } from "../../core/config";
import {
  getSystemButtonTexturePath,
  getSystemButtonTexturePathCandidates,
  shouldTrustBundledSystemButtonAsset,
  SystemButtonTextureRole
} from "./assets";
import {
  CHARACTER_MICRO_BUTTON_FRAME_NAME,
  CHARACTER_MICRO_BUTTON_GLOBAL_OVERLAY_NAMES,
  getSystemButtonDefinition
} from "./button-registry";

type SavedTextureState = {
  path?: string;
  texCoord?: [number, number, number, number];
  vertexColor?: [number, number, number, number];
  wasShown?: boolean;
};

type SavedButtonSkinState = {
  artTarget?: SavedTextureState;
  normalPath?: string;
  pushedPath?: string;
  disabledPath?: string;
  highlightPath?: string;
  hiddenTextureNames: string[];
  skinOverlay?: WowTexture;
};

const savedButtonStates: Record<string, SavedButtonSkinState> = {};
const resolvedPathCache: Record<string, string | undefined> = {};
let probeTexture: WowTexture | undefined;

const MISSING_TEXTURE_MARKER = "Interface\\Icons\\INV_Misc_QuestionMark";

function getFrame(name: string): WowFrame | undefined {
  return _G[name] as WowFrame | undefined;
}

function hasMethod(frame: WowFrame, methodName: string): boolean {
  return typeof (frame as unknown as Record<string, unknown>)[methodName] === "function";
}

function isTextureObject(value: unknown): value is WowTexture {
  return value !== undefined && typeof value === "object" && hasMethod(value as WowFrame, "SetTexture");
}

function ensureProbeTexture(): WowTexture {
  if (probeTexture === undefined) {
    probeTexture = UIParent.CreateTexture(`${ADDON_NAME}SystemButtonAssetProbe`, "OVERLAY");
    probeTexture.Hide();
  }

  return probeTexture;
}

function getTexturePathString(texture: WowTexture): string | undefined {
  const resolved = texture.GetTexture();

  if (typeof resolved === "number") {
    return resolved > 0 ? `${resolved}` : undefined;
  }

  return resolved === "" ? undefined : resolved;
}

function saveTextureState(texture: WowTexture): SavedTextureState {
  const state: SavedTextureState = {
    path: getTexturePathString(texture),
    wasShown: texture.IsShown()
  };

  if (hasMethod(texture as unknown as WowFrame, "GetTexCoord")) {
    const getTexCoord = (texture as unknown as { GetTexCoord: () => LuaMultiReturn<[number, number, number, number]> })
      .GetTexCoord;
    const [left, right, top, bottom] = getTexCoord.call(texture);
    state.texCoord = [left, right, top, bottom];
  }

  if (hasMethod(texture as unknown as WowFrame, "GetVertexColor")) {
    const getVertexColor = (
      texture as unknown as { GetVertexColor: () => LuaMultiReturn<[number, number, number, number]> }
    ).GetVertexColor;
    const [red, green, blue, alpha] = getVertexColor.call(texture);
    state.vertexColor = [red, green, blue, alpha];
  }

  return state;
}

function restoreTextureState(texture: WowTexture, state: SavedTextureState): void {
  if (state.path !== undefined) {
    texture.SetTexture(state.path);
  }

  if (state.texCoord !== undefined) {
    const [left, right, top, bottom] = state.texCoord;
    texture.SetTexCoord(left, right, top, bottom);
  }

  if (state.vertexColor !== undefined && texture.SetVertexColor !== undefined) {
    const [red, green, blue, alpha] = state.vertexColor;
    texture.SetVertexColor(red, green, blue, alpha);
  }

  if (state.wasShown === false) {
    texture.Hide();
    return;
  }

  texture.Show();
}

function applyTexturePath(texture: WowTexture, path: string): void {
  texture.SetTexture(path);
  texture.SetTexCoord(0, 1, 0, 1);

  if (texture.SetVertexColor !== undefined) {
    texture.SetVertexColor(1, 1, 1, 1);
  }

  texture.Show();
}

function probeTexturePath(path: string): boolean {
  const probe = ensureProbeTexture();
  probe.SetTexture(MISSING_TEXTURE_MARKER);
  probe.SetTexture(path);
  const resolved = probe.GetTexture();

  if (resolved === undefined || resolved === "" || resolved === MISSING_TEXTURE_MARKER) {
    return false;
  }

  probe.SetSize(0, 0);
  const width = probe.GetWidth();
  const height = probe.GetHeight();

  return width > 8 || height > 8;
}

function resolveTexturePath(assetId: string, role: SystemButtonTextureRole): string | undefined {
  const cacheKey = `${assetId}:${role}`;
  const cached = resolvedPathCache[cacheKey];

  if (cached !== undefined) {
    return cached.length > 0 ? cached : undefined;
  }

  for (const candidate of getSystemButtonTexturePathCandidates(assetId, role)) {
    if (shouldTrustBundledSystemButtonAsset(assetId, role) && candidate === getSystemButtonTexturePath(assetId, "normal")) {
      resolvedPathCache[cacheKey] = candidate;
      return candidate;
    }

    if (probeTexturePath(candidate)) {
      resolvedPathCache[cacheKey] = candidate;
      return candidate;
    }
  }

  resolvedPathCache[cacheKey] = "";
  return undefined;
}

function getDecorativeOverlayNames(frameName: string): string[] {
  const names = [`${frameName}Icon`, `${frameName}Texture`, `${frameName}Portrait`, `${frameName}Background`];

  if (frameName === CHARACTER_MICRO_BUTTON_FRAME_NAME) {
    names.push(...CHARACTER_MICRO_BUTTON_GLOBAL_OVERLAY_NAMES);
  }

  return names;
}

function ensureDecorativeOverlaysHidden(frameName: string, saved: SavedButtonSkinState): void {
  const forceHideAll = frameName === CHARACTER_MICRO_BUTTON_FRAME_NAME;

  for (const childName of getDecorativeOverlayNames(frameName)) {
    const child = getFrame(childName);

    if (child === undefined || !hasMethod(child, "Hide")) {
      continue;
    }

    if (!forceHideAll && !child.IsShown()) {
      continue;
    }

    child.Hide();

    if (!saved.hiddenTextureNames.includes(childName)) {
      saved.hiddenTextureNames.push(childName);
    }
  }
}

function applyCharacterSkinOverlay(button: WowButton, saved: SavedButtonSkinState, path: string): void {
  let overlay = saved.skinOverlay;

  if (overlay === undefined) {
    overlay = button.CreateTexture(`${ADDON_NAME}DSCharacterMicroSkin`, "OVERLAY");
    overlay.SetPoint("TOPLEFT", button, "TOPLEFT", 0, 0);
    overlay.SetPoint("BOTTOMRIGHT", button, "BOTTOMRIGHT", 0, 0);
    saved.skinOverlay = overlay;
  }

  applyTexturePath(overlay, path);
}

export function suppressCharacterMicroButtonPortrait(): void {
  if (!savedButtonStates[CHARACTER_MICRO_BUTTON_FRAME_NAME]) {
    for (const childName of CHARACTER_MICRO_BUTTON_GLOBAL_OVERLAY_NAMES) {
      const child = getFrame(childName);

      if (child !== undefined && hasMethod(child, "Hide")) {
        child.Hide();
      }
    }

    return;
  }

  ensureDecorativeOverlaysHidden(CHARACTER_MICRO_BUTTON_FRAME_NAME, savedButtonStates[CHARACTER_MICRO_BUTTON_FRAME_NAME]);
}

function getPrimaryArtTarget(frameName: string, button: WowButton): WowTexture | undefined {
  if (hasMethod(button, "GetNormalTexture")) {
    const normal = button.GetNormalTexture();

    if (isTextureObject(normal)) {
      return normal;
    }
  }

  const icon = getFrame(`${frameName}Icon`);

  if (isTextureObject(icon)) {
    return icon;
  }

  return undefined;
}

function applyArtTargetTexture(saved: SavedButtonSkinState, artTarget: WowTexture, path: string): void {
  if (saved.artTarget === undefined) {
    saved.artTarget = saveTextureState(artTarget);
  }

  applyTexturePath(artTarget, path);
}

function applyRoleTexture(
  button: WowButton,
  assetId: string,
  role: SystemButtonTextureRole,
  getter: (target: WowButton) => WowTexture | undefined,
  setter: (target: WowButton, path: string) => void,
  saved: SavedButtonSkinState,
  pathKey: keyof Pick<SavedButtonSkinState, "normalPath" | "pushedPath" | "disabledPath" | "highlightPath">
): boolean {
  const texture = getter(button);
  const path = resolveTexturePath(assetId, role);

  if (texture === undefined || path === undefined) {
    return false;
  }

  if (saved[pathKey] === undefined) {
    saved[pathKey] = getTexturePathString(texture);
  }

  setter(button, path);
  applyTexturePath(texture, path);
  return true;
}

export function applySystemButtonSkin(frameName: string): boolean {
  const definition = getSystemButtonDefinition(frameName);
  const button = getFrame(frameName) as WowButton | undefined;

  if (definition === undefined || button === undefined) {
    return false;
  }

  const artPath = resolveTexturePath(definition.assetId, "normal");

  if (artPath === undefined) {
    return false;
  }

  let saved = savedButtonStates[frameName];

  if (saved === undefined) {
    saved = {
      hiddenTextureNames: []
    };
    savedButtonStates[frameName] = saved;
  }

  ensureDecorativeOverlaysHidden(frameName, saved);

  const artTarget = getPrimaryArtTarget(frameName, button);
  let applied = false;

  if (artTarget !== undefined) {
    applyArtTargetTexture(saved, artTarget, artPath);
    applied = true;
  }

  if (
    applyRoleTexture(
      button,
      definition.assetId,
      "normal",
      target => (hasMethod(target, "GetNormalTexture") ? target.GetNormalTexture() : undefined),
      (target, path) => target.SetNormalTexture(path),
      saved,
      "normalPath"
    )
  ) {
    applied = true;
  }

  if (
    applyRoleTexture(
      button,
      definition.assetId,
      "pushed",
      target => (hasMethod(target, "GetPushedTexture") ? target.GetPushedTexture() : undefined),
      (target, path) => target.SetPushedTexture(path),
      saved,
      "pushedPath"
    )
  ) {
    applied = true;
  }

  if (
    applyRoleTexture(
      button,
      definition.assetId,
      "disabled",
      target => (hasMethod(target, "GetDisabledTexture") ? target.GetDisabledTexture() : undefined),
      (target, path) => target.SetDisabledTexture(path),
      saved,
      "disabledPath"
    )
  ) {
    applied = true;
  }

  if (
    applyRoleTexture(
      button,
      definition.assetId,
      "highlight",
      target => (hasMethod(target, "GetHighlightTexture") ? target.GetHighlightTexture() : undefined),
      (target, path) => target.SetHighlightTexture(path, "ADD"),
      saved,
      "highlightPath"
    )
  ) {
    applied = true;
  }

  if (frameName === CHARACTER_MICRO_BUTTON_FRAME_NAME) {
    applyCharacterSkinOverlay(button, saved, artPath);
    suppressCharacterMicroButtonPortrait();
    applied = true;
  }

  return applied;
}

function restoreRoleTexture(
  button: WowButton,
  savedPath: string | undefined,
  getter: (target: WowButton) => WowTexture | undefined,
  setter: (target: WowButton, path: string) => void
): void {
  if (savedPath === undefined) {
    return;
  }

  const texture = getter(button);

  if (texture === undefined) {
    return;
  }

  setter(button, savedPath);
  applyTexturePath(texture, savedPath);
}

export function restoreSystemButtonSkin(frameName: string): void {
  const saved = savedButtonStates[frameName];
  const button = getFrame(frameName) as WowButton | undefined;

  if (saved === undefined) {
    return;
  }

  const artTarget = button !== undefined ? getPrimaryArtTarget(frameName, button) : undefined;

  if (artTarget !== undefined && saved.artTarget !== undefined) {
    restoreTextureState(artTarget, saved.artTarget);
  }

  if (button !== undefined) {
    restoreRoleTexture(button, saved.normalPath, target => target.GetNormalTexture(), (target, path) =>
      target.SetNormalTexture(path)
    );
    restoreRoleTexture(
      button,
      saved.pushedPath,
      target => target.GetPushedTexture(),
      (target, path) => target.SetPushedTexture(path)
    );
    restoreRoleTexture(
      button,
      saved.disabledPath,
      target => target.GetDisabledTexture(),
      (target, path) => target.SetDisabledTexture(path)
    );
    restoreRoleTexture(
      button,
      saved.highlightPath,
      target => target.GetHighlightTexture(),
      (target, path) => target.SetHighlightTexture(path)
    );
  }

  if (saved.skinOverlay !== undefined) {
    saved.skinOverlay.Hide();
  }

  for (const childName of saved.hiddenTextureNames) {
    const child = getFrame(childName);

    if (child !== undefined && hasMethod(child, "Show")) {
      child.Show();
    }
  }

  delete savedButtonStates[frameName];
}

export function restoreAllSystemButtonSkins(): void {
  for (const frameName of Object.keys(savedButtonStates)) {
    restoreSystemButtonSkin(frameName);
  }

  for (const path of Object.keys(resolvedPathCache)) {
    delete resolvedPathCache[path];
  }
}

export function clearSystemButtonAssetCache(): void {
  for (const path of Object.keys(resolvedPathCache)) {
    delete resolvedPathCache[path];
  }
}

export function countLoadedSystemButtonAssets(assetIds: string[]): number {
  let count = 0;

  for (const assetId of assetIds) {
    if (resolveTexturePath(assetId, "normal") !== undefined) {
      count++;
    }
  }

  return count;
}

export function getResolvedSystemButtonTexturePath(assetId: string): string | undefined {
  return resolveTexturePath(assetId, "normal");
}
