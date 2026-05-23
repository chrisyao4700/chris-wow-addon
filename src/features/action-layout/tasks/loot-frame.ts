import {
  LOOT_FRAME_CURSOR_OFFSET_X,
  LOOT_FRAME_CURSOR_OFFSET_Y,
  LOOT_FRAME_DEFAULT_HEIGHT,
  LOOT_FRAME_DEFAULT_WIDTH,
  LOOT_FRAME_NAMES
} from "../constants";
import {
  canLayoutFrame,
  captureFrame,
  getFrame,
  getFrameSnapshot,
  restoreFrames,
  setIgnoreFramePositionManager
} from "../frame-store";
import { isCombatLocked, isCustomLayoutEnabled, isLayoutApplying } from "../layout-state";

const lootFramePrepared: Record<string, boolean | undefined> = {};
let lootFrameHooksInstalled = false;

function getLootFrameDimensions(frameName: string, frame: WowFrame): { width: number; height: number } {
  const snapshot = getFrameSnapshot(frameName);
  const width =
    snapshot?.width && snapshot.width > 0 ? snapshot.width : frame.GetWidth() || LOOT_FRAME_DEFAULT_WIDTH;
  const height =
    snapshot?.height && snapshot.height > 0 ? snapshot.height : frame.GetHeight() || LOOT_FRAME_DEFAULT_HEIGHT;

  return { width, height };
}

function clampLootFramePosition(
  frameName: string,
  frame: WowFrame,
  posX: number,
  posY: number
): { x: number; y: number } {
  const { width, height } = getLootFrameDimensions(frameName, frame);
  const screenWidth = GetScreenWidth();
  const screenHeight = GetScreenHeight();
  const maxX = Math.max(0, screenWidth - width);
  const maxY = Math.max(0, screenHeight - height);

  return {
    x: Math.min(Math.max(0, posX), maxX),
    y: Math.min(Math.max(0, posY), maxY)
  };
}

export function positionLootFrameAtCursor(frameName: string, frame: WowFrame): void {
  if (!canLayoutFrame(frame)) {
    return;
  }

  const [cursorX, cursorY] = GetCursorPosition();
  const scale = frame.GetEffectiveScale();
  const { x, y } = clampLootFramePosition(
    frameName,
    frame,
    cursorX / scale + LOOT_FRAME_CURSOR_OFFSET_X,
    cursorY / scale + LOOT_FRAME_CURSOR_OFFSET_Y
  );

  frame.ClearAllPoints();
  frame.SetPoint("TOPLEFT", UIParent, "BOTTOMLEFT", x, y);

  frame.Raise?.();
}

function prepareLootFrame(name: string, frame: WowFrame): void {
  if (lootFramePrepared[name]) {
    return;
  }

  captureFrame(name, frame);
  setIgnoreFramePositionManager(frame);
  lootFramePrepared[name] = true;

  frame.SetParent(UIParent);
  frame.SetFrameStrata("HIGH");
}

function onLootFrameShow(): void {
  if (!isCustomLayoutEnabled() || isCombatLocked() || isLayoutApplying()) {
    return;
  }

  for (const frameName of LOOT_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (frame === undefined || !canLayoutFrame(frame)) {
      continue;
    }

    prepareLootFrame(frameName, frame);
    positionLootFrameAtCursor(frameName, frame);
  }
}

export function installLootFrameLayoutHooks(): void {
  if (lootFrameHooksInstalled) {
    return;
  }

  lootFrameHooksInstalled = true;

  if (typeof _G.LootFrame_Show === "function") {
    hooksecurefunc("LootFrame_Show", onLootFrameShow);
  }
}

export function applyLootFrameLayout(): void {
  installLootFrameLayoutHooks();

  for (const frameName of LOOT_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (!canLayoutFrame(frame)) {
      continue;
    }

    prepareLootFrame(frameName, frame);

    if (frame.IsShown()) {
      positionLootFrameAtCursor(frameName, frame);
    }
  }
}

export function restoreLootFrameLayout(): void {
  restoreFrames(LOOT_FRAME_NAMES);

  for (const frameName of LOOT_FRAME_NAMES) {
    lootFramePrepared[frameName] = undefined;
  }
}
