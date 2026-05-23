import { ensureStanceAnchorFrame, getActionGridFrame, isStanceAnchorFrame } from "../anchor-frames";
import {
  ACTION_BUTTON_SIZE,
  ACTION_GRID_WIDTH,
  STANCE_BAR_ABOVE_ACTION_GAP,
  STANCE_BAR_DECORATIVE_NAMES,
  STANCE_BAR_FRAME_NAMES,
  STANCE_BUTTON_COUNT,
  STANCE_BUTTON_PREFIXES
} from "../constants";
import {
  canLayoutFrame,
  captureFrame,
  getFrame,
  getGlobalTexture,
  hasFrameMethod,
  hookLayoutFrame,
  restoreFrames,
  setIgnoreFramePositionManager
} from "../frame-store";
import { getStanceButtonNames } from "../names";

let cachedStackHeight: number | undefined;

export function beginStanceBarLayoutPass(): void {
  cachedStackHeight = undefined;
}

export function getNumShapeshiftForms(): number {
  if (typeof GetNumShapeshiftForms !== "function") {
    return 0;
  }

  return GetNumShapeshiftForms();
}

function hideStanceBarDecorations(): void {
  for (const name of STANCE_BAR_DECORATIVE_NAMES) {
    const texture = getGlobalTexture(name);

    if (texture === undefined) {
      continue;
    }

    texture.Hide();
  }
}

export function showStanceBarDecorations(): void {
  for (const name of STANCE_BAR_DECORATIVE_NAMES) {
    const texture = getGlobalTexture(name);

    if (texture === undefined) {
      continue;
    }

    texture.Show();
  }
}

function getStanceBarFrameName(frame: WowFrame): string {
  for (const frameName of STANCE_BAR_FRAME_NAMES) {
    if (getFrame(frameName) === frame) {
      return frameName;
    }
  }

  return STANCE_BAR_FRAME_NAMES[0];
}

function findStanceBarFrameFromButtons(): { frame: WowFrame; frameName: string } | undefined {
  for (const prefix of STANCE_BUTTON_PREFIXES) {
    for (let index = 1; index <= STANCE_BUTTON_COUNT; index++) {
      const button = getFrame(`${prefix}${index}`);

      if (button === undefined || !hasFrameMethod(button, "GetParent")) {
        continue;
      }

      const parent = button.GetParent();

      if (!canLayoutFrame(parent) || isStanceAnchorFrame(parent)) {
        continue;
      }

      return {
        frame: parent,
        frameName: getStanceBarFrameName(parent)
      };
    }
  }

  return undefined;
}

export function getStanceBarFrame(): WowFrame | undefined {
  const fromButtons = findStanceBarFrameFromButtons();

  if (fromButtons !== undefined) {
    return fromButtons.frame;
  }

  for (const frameName of STANCE_BAR_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (frame !== undefined) {
      return frame;
    }
  }

  return undefined;
}

export function getStanceBarFrameDebugLabel(): string {
  const frame = getStanceBarFrame();

  if (frame === undefined) {
    return "missing";
  }

  return getStanceBarFrameName(frame);
}

function countVisibleStanceButtons(): number {
  let count = 0;

  for (const name of getStanceButtonNames()) {
    const button = getFrame(name);

    if (button !== undefined && button.IsShown()) {
      count++;
    }
  }

  return count;
}

function computeStanceBarStackHeight(): number {
  const stanceBarFrame = getStanceBarFrame();

  if (stanceBarFrame === undefined) {
    return 0;
  }

  const numForms = getNumShapeshiftForms();
  const visibleButtons = countVisibleStanceButtons();

  if (numForms <= 0 && visibleButtons === 0 && !stanceBarFrame.IsShown()) {
    return 0;
  }

  const height = stanceBarFrame.GetHeight();

  if (height > 0) {
    return STANCE_BAR_ABOVE_ACTION_GAP + height;
  }

  return STANCE_BAR_ABOVE_ACTION_GAP + ACTION_BUTTON_SIZE;
}

export function getStanceBarStackHeight(): number {
  if (cachedStackHeight !== undefined) {
    return cachedStackHeight;
  }

  cachedStackHeight = computeStanceBarStackHeight();
  return cachedStackHeight;
}

function getStanceButtonColumnOffset(columnIndex: number, visibleCount: number): number {
  if (visibleCount <= 1) {
    return Math.max(0, (ACTION_GRID_WIDTH - ACTION_BUTTON_SIZE) / 2);
  }

  const totalWidth = visibleCount * ACTION_BUTTON_SIZE + (visibleCount - 1) * 4;

  return Math.max(0, (ACTION_GRID_WIDTH - totalWidth) / 2) + columnIndex * (ACTION_BUTTON_SIZE + 4);
}

function layoutStanceBarContainer(
  stanceBarFrame: WowFrame,
  frameName: string,
  stanceAnchorFrame: WowFrame,
  onReshow: () => void
): void {
  captureFrame(frameName, stanceBarFrame);
  hookLayoutFrame(frameName, stanceBarFrame, onReshow);
  setIgnoreFramePositionManager(stanceBarFrame);
  hideStanceBarDecorations();

  stanceBarFrame.SetParent(stanceAnchorFrame);
  stanceBarFrame.ClearAllPoints();
  stanceBarFrame.SetScale(1);
  stanceBarFrame.SetPoint("CENTER", stanceAnchorFrame, "CENTER", 0, 0);
}

function resolveStanceButton(index: number): { name: string; button: WowFrame } | undefined {
  for (const prefix of STANCE_BUTTON_PREFIXES) {
    const name = `${prefix}${index}`;
    const button = getFrame(name);

    if (button !== undefined) {
      return { name, button };
    }
  }

  return undefined;
}

function layoutVisibleStanceButtons(stanceAnchorFrame: WowFrame, onReshow: () => void): number {
  const numForms = getNumShapeshiftForms();
  const buttonsToLayout: Array<{ name: string; button: WowFrame }> = [];

  for (let index = 1; index <= STANCE_BUTTON_COUNT; index++) {
    const resolved = resolveStanceButton(index);

    if (resolved === undefined) {
      continue;
    }

    if (index > numForms && !resolved.button.IsShown()) {
      continue;
    }

    buttonsToLayout.push(resolved);
  }

  const layoutCount = Math.max(buttonsToLayout.length, numForms, 1);
  let placedColumn = 0;

  for (const { name, button } of buttonsToLayout) {
    if (!canLayoutFrame(button)) {
      continue;
    }

    captureFrame(name, button);
    hookLayoutFrame(name, button, onReshow);
    setIgnoreFramePositionManager(button);
    button.SetParent(stanceAnchorFrame);
    button.ClearAllPoints();
    button.SetSize(ACTION_BUTTON_SIZE, ACTION_BUTTON_SIZE);
    button.SetScale(1);
    button.SetPoint(
      "BOTTOMLEFT",
      stanceAnchorFrame,
      "BOTTOMLEFT",
      getStanceButtonColumnOffset(placedColumn, layoutCount),
      0
    );
    button.Show();
    placedColumn++;
  }

  return placedColumn;
}

export function applyStanceBarLayout(onReshow: () => void): void {
  const actionGridFrame = getActionGridFrame();

  if (actionGridFrame === undefined) {
    return;
  }

  const stanceAnchorFrame = ensureStanceAnchorFrame();

  if (stanceAnchorFrame === undefined) {
    return;
  }

  const discovered = findStanceBarFrameFromButtons();
  const stanceBarFrame = discovered?.frame ?? getStanceBarFrame();

  if (!canLayoutFrame(stanceBarFrame) || stanceBarFrame === stanceAnchorFrame) {
    layoutVisibleStanceButtons(stanceAnchorFrame, onReshow);
    return;
  }

  const frameName = discovered?.frameName ?? getStanceBarFrameName(stanceBarFrame);
  const wasShown = stanceBarFrame.IsShown();

  layoutStanceBarContainer(stanceBarFrame, frameName, stanceAnchorFrame, onReshow);
  layoutVisibleStanceButtons(stanceAnchorFrame, onReshow);

  if (wasShown || getNumShapeshiftForms() > 0 || countVisibleStanceButtons() > 0) {
    stanceBarFrame.Show();
    stanceAnchorFrame.Show();
    return;
  }

  stanceBarFrame.Hide();
}

export function restoreStanceBarLayout(): void {
  restoreFrames(STANCE_BAR_FRAME_NAMES);
  restoreFrames(getStanceButtonNames());
  showStanceBarDecorations();
}
