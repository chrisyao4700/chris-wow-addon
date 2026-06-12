import { ADDON_NAME } from "../../core/config";
import { getSettings } from "../../core/db";
import { addonPrint } from "../../platform/wow";
import { SUN_CURSOR_SLASH_TEXTURE, SUN_KATANA_CURSOR_TEXTURE } from "./assets";

const SEGMENT_POOL_SIZE = 12;
const SEGMENT_LIFETIME_SECONDS = 0.34;
const MIN_DISTANCE_FOR_SEGMENT = 9;
const MIN_SPAWN_INTERVAL_SECONDS = 0.014;
const SLASH_WIDTH = 188;
const SLASH_HEIGHT = 94;
const KATANA_CURSOR_SIZE = 118;
const KATANA_CURSOR_OFFSET_X = -18;
const KATANA_CURSOR_OFFSET_Y = 18;
const KATANA_HOTSPOT_GLOW_SIZE = 28;
const BASE_ALPHA = 0.92;
const ROOT_FRAME_LEVEL = 5000;

type CursorTrailSegment = {
  texture: WowTexture;
  age: number;
  active: boolean;
  width: number;
  height: number;
};

let rootFrame: WowFrame | undefined;
let eventFrame: WowFrame | undefined;
let cursorAnchorFrame: WowFrame | undefined;
let katanaCursorTexture: WowTexture | undefined;
let katanaHotspotGlowTexture: WowTexture | undefined;
let segments: CursorTrailSegment[] = [];
let nextSegmentIndex = 0;
let previousX: number | undefined;
let previousY: number | undefined;
let lastSpawnAt = 0;
let cursorHiddenCount = 0;

function clamp01(value: number): number {
  if (value <= 0) {
    return 0;
  }

  if (value >= 1) {
    return 1;
  }

  return value;
}

function getMovementAngle(deltaY: number, deltaX: number): number {
  if (deltaX > 0) {
    return Math.atan(deltaY / deltaX);
  }

  if (deltaX < 0 && deltaY >= 0) {
    return Math.atan(deltaY / deltaX) + Math.PI;
  }

  if (deltaX < 0 && deltaY < 0) {
    return Math.atan(deltaY / deltaX) - Math.PI;
  }

  if (deltaY > 0) {
    return Math.PI / 2;
  }

  if (deltaY < 0) {
    return -Math.PI / 2;
  }

  return 0;
}

function setTextureAlpha(texture: WowTexture, alpha: number): void {
  if (texture.SetVertexColor !== undefined) {
    texture.SetVertexColor(1, 1, 1, alpha);
    return;
  }

  (texture as WowTexture & { SetAlpha?: (value: number) => void }).SetAlpha?.(alpha);
}

function setTextureColor(texture: WowTexture, red: number, green: number, blue: number, alpha: number): void {
  if (texture.SetVertexColor !== undefined) {
    texture.SetVertexColor(red, green, blue, alpha);
    return;
  }

  (texture as WowTexture & { SetAlpha?: (value: number) => void }).SetAlpha?.(alpha);
}

function isFeatureEnabled(): boolean {
  return getSettings().enableDemonSlayerCursorTrail;
}

function ensureRootFrame(): WowFrame {
  if (rootFrame !== undefined) {
    return rootFrame;
  }

  const frame = CreateFrame("Frame", `${ADDON_NAME}DemonSlayerCursorTrail`, UIParent);
  frame.SetPoint("TOPLEFT", UIParent, "TOPLEFT", 0, 0);
  frame.SetPoint("BOTTOMRIGHT", UIParent, "BOTTOMRIGHT", 0, 0);
  frame.SetFrameStrata("TOOLTIP");
  frame.SetFrameLevel(ROOT_FRAME_LEVEL);
  frame.EnableMouse(false);
  frame.Hide();

  rootFrame = frame;
  return frame;
}

function ensureCursorAnchorFrame(): WowFrame {
  if (cursorAnchorFrame !== undefined) {
    return cursorAnchorFrame;
  }

  const anchor = CreateFrame("Frame", `${ADDON_NAME}DemonSlayerCursorAnchor`, UIParent);
  anchor.SetSize(3, 3);
  anchor.SetPoint("CENTER", UIParent, "CENTER", 0, 0);
  anchor.SetFrameStrata("TOOLTIP");
  anchor.SetFrameLevel(ROOT_FRAME_LEVEL + 1);
  anchor.EnableMouse(false);
  anchor.Show();

  cursorAnchorFrame = anchor;
  return anchor;
}

function updateCursorAnchor(x: number, y: number): WowFrame {
  const anchor = ensureCursorAnchorFrame();
  anchor.ClearAllPoints();
  anchor.SetPoint("CENTER", UIParent, "BOTTOMLEFT", x, y);
  return anchor;
}

function ensureKatanaCursorTexture(): WowTexture {
  if (katanaCursorTexture !== undefined) {
    return katanaCursorTexture;
  }

  const root = ensureRootFrame();
  const texture = root.CreateTexture(`${ADDON_NAME}SunKatanaCursor`, "OVERLAY");
  texture.SetTexture(SUN_KATANA_CURSOR_TEXTURE);
  texture.SetBlendMode?.("BLEND");
  texture.SetDrawLayer?.("OVERLAY", 7);
  texture.SetSize(KATANA_CURSOR_SIZE, KATANA_CURSOR_SIZE);
  texture.SetPoint("CENTER", ensureCursorAnchorFrame(), "CENTER", 0, 0);
  setTextureAlpha(texture, 0.98);
  texture.Hide();

  katanaCursorTexture = texture;
  return texture;
}

function ensureKatanaHotspotGlowTexture(): WowTexture {
  if (katanaHotspotGlowTexture !== undefined) {
    return katanaHotspotGlowTexture;
  }

  const root = ensureRootFrame();
  const texture = root.CreateTexture(`${ADDON_NAME}SunKatanaCursorHotspot`, "OVERLAY");
  texture.SetTexture("Interface\\GLUES\\Models\\UI_Alliance\\gradient5Circle");
  texture.SetTexCoord(0, 0.918, 0, 0.935);
  texture.SetBlendMode?.("ADD");
  texture.SetDrawLayer?.("OVERLAY", 7);
  texture.SetSize(KATANA_HOTSPOT_GLOW_SIZE, KATANA_HOTSPOT_GLOW_SIZE);
  texture.SetPoint("CENTER", root, "BOTTOMLEFT", 0, 0);
  setTextureColor(texture, 1, 0.55, 0.12, 0);
  texture.Hide();

  katanaHotspotGlowTexture = texture;
  return texture;
}

function createSegment(root: WowFrame, index: number): CursorTrailSegment {
  const texture = root.CreateTexture(`${ADDON_NAME}SunCursorSlash${index}`, "OVERLAY");
  texture.SetTexture(SUN_CURSOR_SLASH_TEXTURE);
  texture.SetBlendMode?.("ADD");
  texture.SetDrawLayer?.("OVERLAY", Math.min(index, 7));
  texture.SetSize(SLASH_WIDTH, SLASH_HEIGHT);
  texture.SetPoint("CENTER", root, "BOTTOMLEFT", 0, 0);
  setTextureAlpha(texture, 0);
  texture.Hide();

  return {
    texture,
    age: SEGMENT_LIFETIME_SECONDS,
    active: false,
    width: SLASH_WIDTH,
    height: SLASH_HEIGHT
  };
}

function ensureSegments(): CursorTrailSegment[] {
  const root = ensureRootFrame();

  while (segments.length < SEGMENT_POOL_SIZE) {
    segments.push(createSegment(root, segments.length + 1));
  }

  return segments;
}

function getCursorUiPosition(): LuaMultiReturn<[number, number]> {
  const [cursorX, cursorY] = GetCursorPosition();
  const scale = UIParent.GetEffectiveScale();

  return $multi(cursorX / scale, cursorY / scale);
}

function hideSegment(segment: CursorTrailSegment): void {
  segment.active = false;
  segment.age = SEGMENT_LIFETIME_SECONDS;
  setTextureAlpha(segment.texture, 0);
  segment.texture.Hide();
}

function hideKatanaCursor(): void {
  if (katanaCursorTexture !== undefined) {
    katanaCursorTexture.Hide();
  }

  if (katanaHotspotGlowTexture !== undefined) {
    katanaHotspotGlowTexture.Hide();
  }
}

function resetTrailState(): void {
  previousX = undefined;
  previousY = undefined;
  lastSpawnAt = 0;

  for (const segment of segments) {
    hideSegment(segment);
  }

  hideKatanaCursor();
}

function updateKatanaCursor(x: number, y: number): void {
  const texture = ensureKatanaCursorTexture();
  const glow = ensureKatanaHotspotGlowTexture();
  const anchor = updateCursorAnchor(x, y);

  glow.ClearAllPoints?.();
  glow.SetPoint("CENTER", anchor, "CENTER", 0, 0);
  glow.SetSize(KATANA_HOTSPOT_GLOW_SIZE, KATANA_HOTSPOT_GLOW_SIZE);
  setTextureColor(glow, 1, 0.55, 0.12, 0.82);
  glow.Show();

  texture.ClearAllPoints?.();
  texture.SetPoint("CENTER", anchor, "CENTER", KATANA_CURSOR_OFFSET_X, KATANA_CURSOR_OFFSET_Y);
  texture.SetSize(KATANA_CURSOR_SIZE, KATANA_CURSOR_SIZE);
  setTextureAlpha(texture, 0.98);
  texture.Show();
  ensureRootFrame().Raise?.();
}

function spawnSlashSegment(x: number, y: number, angle: number, distance: number): void {
  const pool = ensureSegments();
  const segment = pool[nextSegmentIndex];
  nextSegmentIndex = (nextSegmentIndex + 1) % pool.length;

  const distanceBoost = clamp01(distance / 48);
  const width = SLASH_WIDTH * (0.74 + distanceBoost * 0.42);
  const height = SLASH_HEIGHT * (0.82 + distanceBoost * 0.24);
  const tipOffset = width * 0.38;
  const centerX = x - Math.cos(angle) * tipOffset;
  const centerY = y - Math.sin(angle) * tipOffset;

  segment.active = true;
  segment.age = 0;
  segment.width = width;
  segment.height = height;
  segment.texture.ClearAllPoints?.();
  segment.texture.SetPoint("CENTER", ensureRootFrame(), "BOTTOMLEFT", centerX, centerY);
  segment.texture.SetSize(width, height);
  segment.texture.SetRotation?.(angle);
  setTextureAlpha(segment.texture, BASE_ALPHA);
  segment.texture.Show();
}

function updateSegments(elapsedSeconds: number): void {
  for (const segment of ensureSegments()) {
    if (!segment.active) {
      continue;
    }

    segment.age = segment.age + elapsedSeconds;

    if (segment.age >= SEGMENT_LIFETIME_SECONDS) {
      hideSegment(segment);
      continue;
    }

    const progress = clamp01(segment.age / SEGMENT_LIFETIME_SECONDS);
    const fade = (1 - progress) * (1 - progress);
    const scale = 1 + progress * 0.12;

    segment.texture.SetSize(segment.width * scale, segment.height * scale);
    setTextureAlpha(segment.texture, BASE_ALPHA * fade);
  }
}

function updateTrail(_self: WowFrame, elapsedSeconds: number): void {
  updateSegments(elapsedSeconds);

  if (!isFeatureEnabled() || cursorHiddenCount > 0) {
    hideKatanaCursor();
    return;
  }

  const [x, y] = getCursorUiPosition();
  updateKatanaCursor(x, y);

  if (previousX === undefined || previousY === undefined) {
    previousX = x;
    previousY = y;
    return;
  }

  const dx = x - previousX;
  const dy = y - previousY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const now = GetTime();

  previousX = x;
  previousY = y;

  if (distance < MIN_DISTANCE_FOR_SEGMENT || now - lastSpawnAt < MIN_SPAWN_INTERVAL_SECONDS) {
    return;
  }

  lastSpawnAt = now;
  spawnSlashSegment(x, y, getMovementAngle(dy, dx), distance);
}

function startTrail(): void {
  const root = ensureRootFrame();
  ensureCursorAnchorFrame();
  ensureSegments();
  ensureKatanaHotspotGlowTexture();
  ensureKatanaCursorTexture();
  root.Show();
  root.SetScript("OnUpdate", (self, elapsedSeconds) => {
    updateTrail(self, typeof elapsedSeconds === "number" ? elapsedSeconds : 0);
  });
}

function stopTrail(): void {
  if (rootFrame === undefined) {
    return;
  }

  rootFrame.SetScript("OnUpdate", null as unknown as (self: WowFrame, ...args: unknown[]) => void);
  resetTrailState();
  rootFrame.Hide();
}

function updateCursorHiddenCount(delta: number): void {
  cursorHiddenCount = cursorHiddenCount + delta;

  if (cursorHiddenCount < 0 || cursorHiddenCount > 2) {
    cursorHiddenCount = 0;
  }

  if (cursorHiddenCount > 0) {
    resetTrailState();
  }
}

function ensureEventFrame(): WowFrame {
  if (eventFrame !== undefined) {
    return eventFrame;
  }

  const frame = CreateFrame("Frame", `${ADDON_NAME}DemonSlayerCursorTrailEvents`);
  eventFrame = frame;

  frame.RegisterEvent("ADDON_LOADED");
  frame.RegisterEvent("PLAYER_LOGIN");
  frame.RegisterEvent("PLAYER_ENTERING_WORLD");
  frame.RegisterEvent("PLAYER_STARTED_LOOKING");
  frame.RegisterEvent("PLAYER_STOPPED_LOOKING");

  frame.SetScript("OnEvent", (_self, eventName, eventArg) => {
    if (eventName === "ADDON_LOADED" && eventArg !== ADDON_NAME) {
      return;
    }

    if (
      eventName === "ADDON_LOADED" ||
      eventName === "PLAYER_LOGIN" ||
      eventName === "PLAYER_ENTERING_WORLD"
    ) {
      syncDemonSlayerCursorTrail();
      return;
    }

    if (eventName === "PLAYER_STARTED_LOOKING") {
      updateCursorHiddenCount(1);
      return;
    }

    if (eventName === "PLAYER_STOPPED_LOOKING") {
      updateCursorHiddenCount(-1);
      previousX = undefined;
      previousY = undefined;
    }
  });

  return frame;
}

export function syncDemonSlayerCursorTrail(): void {
  if (isFeatureEnabled()) {
    startTrail();
    return;
  }

  stopTrail();
}

export function registerDemonSlayerCursorTrail(): void {
  ensureEventFrame();
  syncDemonSlayerCursorTrail();
}

export function printDemonSlayerCursorTrailStatus(): void {
  addonPrint("Demon Slayer cursor trail:");
  addonPrint(`Enabled: ${isFeatureEnabled() ? "yes" : "no"}`);
  addonPrint(`Pool: ${segments.length}/${SEGMENT_POOL_SIZE}`);
  addonPrint(`Cursor hidden count: ${cursorHiddenCount}`);
  addonPrint(`Trail texture: ${SUN_CURSOR_SLASH_TEXTURE}`);
  addonPrint(`Cursor texture: ${SUN_KATANA_CURSOR_TEXTURE}`);
}
