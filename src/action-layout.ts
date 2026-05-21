import { ADDON_NAME } from "./config";
import { getSettings } from "./db";
import { addonPrint } from "./platform/wow";

type FramePoint = {
  point: WowPoint;
  relativeTo?: WowFrame;
  relativePoint: WowPoint;
  x: number;
  y: number;
};

type FrameSnapshot = {
  parent?: WowFrame;
  scale: number;
  width: number;
  height: number;
  wasShown: boolean;
  points: FramePoint[];
};

const ACTION_COLUMNS = 12;
const ACTION_ROWS = 5;
const ACTION_CELL_SIZE = 36;
const ACTION_BUTTON_SIZE = 31;
const ACTION_GRID_WIDTH = (ACTION_COLUMNS - 1) * ACTION_CELL_SIZE + ACTION_BUTTON_SIZE;
const ACTION_GRID_HEIGHT = (ACTION_ROWS - 1) * ACTION_CELL_SIZE + ACTION_BUTTON_SIZE;
const ACTION_GRID_MARGIN = 16;
const ACTION_GRID_BOTTOM = 16;
const ACTION_STATUS_BAR_HEIGHT = 12;
const ACTION_STATUS_BAR_GAP = 4;
const ACTION_STATUS_BAR_WIDTH = 300;
const EXP_BAR_DEFAULT_WIDTH = 1024;
const EXP_BAR_FRAME_NAMES = ["MainMenuExpBar", "StatusTrackingBarManager"];
const EXP_BAR_LAYOUT_HOOK_TARGETS = [
  "ReputationWatchBar_Update",
  "MainMenuExpBar_Update",
  "ExpBar_Update",
  "MainMenuBar_UpdateExperienceBars",
  "MainMenuExpBar_SetWidth"
];
const SYSTEM_BUTTON_SIZE = 28;
const SYSTEM_BUTTON_GAP = 0;
const SYSTEM_ROW_HEIGHT = SYSTEM_BUTTON_SIZE + 8;
const BAG_ROW_Y = 0;
const MICRO_ROW_Y = SYSTEM_ROW_HEIGHT;
const SYSTEM_FRAME_WIDTH = 620;
const SYSTEM_FRAME_HEIGHT = SYSTEM_ROW_HEIGHT * 2;
const SYSTEM_FRAME_MARGIN = 16;
const RELAYOUT_DELAY_SECONDS = 0.05;
const LAYOUT_BOOTSTRAP_RETRY_SECONDS = 0.25;
const LAYOUT_BOOTSTRAP_TIMEOUT_SECONDS = 10;
const LAYOUT_BOOTSTRAP_STABILIZE_SECONDS = 5;
const LAYOUT_WATCHDOG_INTERVAL_SECONDS = 0.5;
const LAYOUT_DEFERRED_SYNC_DELAYS_SECONDS = [0, 0.5, 1.5, 3, 5];
const MAIN_ACTION_BAR_BUTTON_COUNT = 12;
const MIN_ACTION_BUTTONS_FOR_LAYOUT = 36;

const ACTION_BUTTON_PREFIXES = [
  "ActionButton",
  "MultiBarBottomLeftButton",
  "MultiBarBottomRightButton",
  "MultiBarRightButton",
  "MultiBarLeftButton"
];

const FALLBACK_MICRO_BUTTON_NAMES = [
  "CharacterMicroButton",
  "SpellbookMicroButton",
  "TalentMicroButton",
  "SkillMicroButton",
  "AchievementMicroButton",
  "QuestLogMicroButton",
  "SocialsMicroButton",
  "WorldMapMicroButton",
  "GuildMicroButton",
  "FriendsMicroButton",
  "PVPMicroButton",
  "LFDMicroButton",
  "LFGMicroButton",
  "CollectionsMicroButton",
  "CollectionsJournalMicroButton",
  "EJMicroButton",
  "EncounterJournalMicroButton",
  "RaidMicroButton",
  "StoreMicroButton",
  "MainMenuMicroButton",
  "HelpMicroButton"
];

const ADDITIONAL_MICRO_BUTTON_NAMES = [
  "LFGMicroButton",
  "QuickJoinMicroButton",
  "ProfessionMicroButton",
  "PlayerSpellsMicroButton",
  "HousingMicroButton"
];

const MICRO_BUTTON_OVERLAY_PAIRS: Array<[string, string]> = [
  ["GuildMicroButton", "SocialsMicroButton"],
  ["HelpMicroButton", "StoreMicroButton"]
];

const BAG_BUTTON_NAMES = [
  "MainMenuBarBackpackButton",
  "CharacterBag0Slot",
  "CharacterBag1Slot",
  "CharacterBag2Slot",
  "CharacterBag3Slot",
  "KeyRingButton"
];

const BAG_FRAME_REFS = ["bag0", "bag1", "bag2", "bag3", "bag4", "bag5"];

const SECURE_BAG_LAYOUT_SNIPPET = "ChrisWowAddonLayoutBags";

const DECORATIVE_FRAME_NAMES = [
  "MainMenuBarArtFrame",
  "MainMenuBarLeftEndCap",
  "MainMenuBarRightEndCap",
  "MainMenuBarTexture0",
  "MainMenuBarTexture1",
  "MainMenuBarTexture2",
  "MainMenuBarTexture3",
  "MicroButtonAndBagsBar"
];

// Main menu bar chrome at the default bottom anchor (hide only — do not reparent or bag buttons follow).
const MAIN_MENU_BAR_SHELL_NAMES = ["MainMenuBar", "SlidingActionBarTexture0", "SlidingActionBarTexture1"];

const PAGE_CONTROL_FRAME_NAMES = ["ActionBarUpButton", "ActionBarDownButton", "MainMenuBarPageNumber"];

const STATUS_BAR_NAMES = ["ReputationWatchBar", "MainMenuMaxLevelBar", "HonorWatchBar"];

const snapshots: Record<string, FrameSnapshot | undefined> = {};
const hookedFrames: Record<string, boolean | undefined> = {};

let actionGridFrame: WowFrame | undefined;
let systemButtonFrame: WowFrame | undefined;
let layoutHiderFrame: WowFrame | undefined;
let bagButtonFrame: WowSecureFrame | undefined;
let eventFrame: WowFrame | undefined;
let blizzardLayoutHooksInstalled = false;
let originalMoveMicroButtons: ((...args: unknown[]) => void) | undefined;
let timerFrame: WowFrame | undefined;
let pendingLayoutSync = false;
let layoutSyncScheduled = false;
let layoutSyncElapsed = 0;
let layoutBootstrapActive = false;
let layoutBootstrapElapsed = 0;
let layoutBootstrapRetryElapsed = 0;
let layoutBootstrapStabilizeRemaining = 0;
let layoutWatchdogElapsed = 0;
let isApplyingLayout = false;

const BLIZZARD_LAYOUT_HOOK_TARGETS = [
  "MultiActionBar_Update",
  "MainMenuBar_Update",
  "ActionBar_Update",
  "UIParent_ManageFramePositions"
];

function getFrame(name: string): WowFrame | undefined {
  return _G[name] as WowFrame | undefined;
}

function hasMethod(frame: WowFrame, methodName: string): boolean {
  return typeof (frame as unknown as Record<string, unknown>)[methodName] === "function";
}

function hasMethods(frame: WowFrame, methodNames: string[]): boolean {
  for (const methodName of methodNames) {
    if (!hasMethod(frame, methodName)) {
      return false;
    }
  }

  return true;
}

function canSnapshotFrame(frame: WowFrame): boolean {
  return hasMethods(frame, ["GetNumPoints", "GetPoint", "GetParent", "GetScale", "GetWidth", "GetHeight", "IsShown"]);
}

function canLayoutFrame(frame: WowFrame | undefined): frame is WowFrame {
  if (frame === undefined) {
    return false;
  }

  return hasMethods(frame, [
    "ClearAllPoints",
    "SetPoint",
    "SetParent",
    "SetScale",
    "SetSize",
    "Show",
    "Hide"
  ]);
}

function canHideFrame(frame: WowFrame | undefined): frame is WowFrame {
  return frame !== undefined && hasMethod(frame, "Hide");
}

function ensureTimerFrame(): void {
  if (timerFrame !== undefined) {
    return;
  }

  timerFrame = CreateFrame("Frame");
  timerFrame.SetScript("OnUpdate", (_self, elapsed) => {
    const delta = typeof elapsed === "number" ? elapsed : 0;

    if (layoutBootstrapActive && isCustomLayoutEnabled()) {
      layoutBootstrapElapsed += delta;
      layoutBootstrapRetryElapsed += delta;

      if (areActionBarFramesReady()) {
        if (layoutBootstrapStabilizeRemaining <= 0) {
          layoutBootstrapStabilizeRemaining = LAYOUT_BOOTSTRAP_STABILIZE_SECONDS;
        }

        layoutBootstrapStabilizeRemaining -= delta;

        if (layoutBootstrapRetryElapsed >= LAYOUT_BOOTSTRAP_RETRY_SECONDS) {
          layoutBootstrapRetryElapsed = 0;
          syncActionLayout();
        }

        if (layoutBootstrapStabilizeRemaining <= 0) {
          layoutBootstrapActive = false;
        }
      } else if (layoutBootstrapElapsed >= LAYOUT_BOOTSTRAP_TIMEOUT_SECONDS) {
        layoutBootstrapActive = false;
        layoutBootstrapStabilizeRemaining = 0;
      } else if (layoutBootstrapRetryElapsed >= LAYOUT_BOOTSTRAP_RETRY_SECONDS) {
        layoutBootstrapRetryElapsed = 0;
        syncActionLayout();
      }
    }

    if (isCustomLayoutEnabled() && !isCombatLocked() && !isApplyingLayout) {
      layoutWatchdogElapsed += delta;

      if (layoutWatchdogElapsed >= LAYOUT_WATCHDOG_INTERVAL_SECONDS) {
        layoutWatchdogElapsed = 0;

        if (isMainActionBarReady() && !isCustomLayoutApplied()) {
          syncActionLayout();
        }
      }
    }

    if (!layoutSyncScheduled) {
      return;
    }

    layoutSyncElapsed += delta;

    if (layoutSyncElapsed < RELAYOUT_DELAY_SECONDS) {
      return;
    }

    layoutSyncScheduled = false;
    layoutSyncElapsed = 0;
    syncActionLayout();
  });
}

function isCustomLayoutEnabled(): boolean {
  return getSettings().enableCustomActionLayout;
}

function isMainActionBarReady(): boolean {
  for (let index = 1; index <= MAIN_ACTION_BAR_BUTTON_COUNT; index++) {
    if (getFrame(`ActionButton${index}`) === undefined) {
      return false;
    }
  }

  return true;
}

function isPlayerInWorld(): boolean {
  const playerName = UnitName("player");

  return playerName !== undefined && playerName !== "";
}

function areActionBarFramesReady(): boolean {
  if (!isMainActionBarReady()) {
    return false;
  }

  const actionButtonCount = countExistingFrames(getActionButtonNames());
  const expectedActionButtonCount = getActionButtonNames().length;

  return (
    actionButtonCount >= MIN_ACTION_BUTTONS_FOR_LAYOUT || actionButtonCount >= expectedActionButtonCount
  );
}

function isActionButtonAttachedToGrid(buttonName: string): boolean {
  if (actionGridFrame === undefined) {
    return false;
  }

  const button = getFrame(buttonName);

  if (button === undefined || !hasMethod(button, "GetParent")) {
    return false;
  }

  return button.GetParent() === actionGridFrame;
}

function isCustomLayoutApplied(): boolean {
  if (actionGridFrame === undefined) {
    return false;
  }

  const probeButtonNames = ["ActionButton1", "MultiBarBottomLeftButton1"];
  let requiredProbes = 0;
  let attachedProbes = 0;

  for (const buttonName of probeButtonNames) {
    if (getFrame(buttonName) === undefined) {
      continue;
    }

    requiredProbes++;

    if (isActionButtonAttachedToGrid(buttonName)) {
      attachedProbes++;
    }
  }

  return (
    requiredProbes > 0 && attachedProbes === requiredProbes && isExpBarLayoutApplied() && isBottomShellHidden()
  );
}

function isExpBarLayoutApplied(): boolean {
  for (const frameName of EXP_BAR_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (frame === undefined || !frame.IsShown()) {
      continue;
    }

    const [, relativeTo, relativePoint, , y] = frame.GetPoint(1);

    if (relativeTo !== UIParent || relativePoint !== "TOP" || y !== 0) {
      return false;
    }
  }

  return true;
}

function scheduleDeferredLayoutSync(): void {
  if (!isCustomLayoutEnabled()) {
    return;
  }

  for (const delaySeconds of LAYOUT_DEFERRED_SYNC_DELAYS_SECONDS) {
    if (C_Timer !== undefined) {
      C_Timer.After(delaySeconds, () => {
        if (!isCustomLayoutEnabled() || !isPlayerInWorld() || isCombatLocked()) {
          return;
        }

        syncActionLayout();
      });
      continue;
    }

    if (delaySeconds === 0) {
      scheduleLayoutSync();
    }
  }
}

function scheduleLayoutSync(): void {
  if (layoutSyncScheduled || !isCustomLayoutEnabled() || isCombatLocked()) {
    if (isCombatLocked() && isCustomLayoutEnabled()) {
      pendingLayoutSync = true;
    }

    return;
  }

  layoutSyncScheduled = true;
  layoutSyncElapsed = 0;
  ensureTimerFrame();
}

function scheduleLayoutBootstrap(force = false): void {
  if (!isCustomLayoutEnabled()) {
    layoutBootstrapActive = false;
    layoutBootstrapStabilizeRemaining = 0;
    return;
  }

  if (!force && !isPlayerInWorld()) {
    return;
  }

  if (isCombatLocked()) {
    pendingLayoutSync = true;
    return;
  }

  layoutBootstrapActive = true;
  layoutBootstrapElapsed = 0;
  layoutBootstrapRetryElapsed = LAYOUT_BOOTSTRAP_RETRY_SECONDS;
  layoutBootstrapStabilizeRemaining = 0;
  ensureTimerFrame();
  syncActionLayout();
  scheduleDeferredLayoutSync();
}

function getMicroButtonNames(): string[] {
  const names: string[] = [];
  const seen: Record<string, boolean> = {};

  const addName = (name: string): void => {
    if (seen[name]) {
      return;
    }

    seen[name] = true;
    names.push(name);
  };

  if (MICRO_BUTTONS !== undefined) {
    for (const name of MICRO_BUTTONS) {
      addName(name);
    }
  }

  for (const name of FALLBACK_MICRO_BUTTON_NAMES) {
    addName(name);
  }

  for (const name of ADDITIONAL_MICRO_BUTTON_NAMES) {
    addName(name);
  }

  return names;
}

function getActionButtonNames(): string[] {
  const names: string[] = [];

  for (const prefix of ACTION_BUTTON_PREFIXES) {
    for (let index = 1; index <= 12; index++) {
      names.push(`${prefix}${index}`);
    }
  }

  return names;
}

function countExistingFrames(names: string[]): number {
  let count = 0;

  for (const name of names) {
    if (getFrame(name) !== undefined) {
      count++;
    }
  }

  return count;
}

function captureFrame(name: string, frame: WowFrame): void {
  if (snapshots[name] !== undefined) {
    return;
  }

  if (!canSnapshotFrame(frame)) {
    return;
  }

  const points: FramePoint[] = [];

  for (let pointIndex = 1; pointIndex <= frame.GetNumPoints(); pointIndex++) {
    const [point, relativeTo, relativePoint, x, y] = frame.GetPoint(pointIndex);
    points.push({
      point,
      relativeTo,
      relativePoint,
      x: x || 0,
      y: y || 0
    });
  }

  snapshots[name] = {
    parent: frame.GetParent(),
    scale: frame.GetScale(),
    width: frame.GetWidth(),
    height: frame.GetHeight(),
    wasShown: frame.IsShown(),
    points
  };
}

function hookLayoutFrame(name: string, frame: WowFrame): void {
  if (hookedFrames[name]) {
    return;
  }

  if (!hasMethod(frame, "HookScript")) {
    return;
  }

  hookedFrames[name] = true;
  frame.HookScript("OnShow", () => {
    if (!isApplyingLayout && !isCombatLocked()) {
      scheduleLayoutSync();
    }
  });
}

function hookMainMenuBarRelayout(): void {
  const mainMenuBar = getFrame("MainMenuBar");

  if (mainMenuBar === undefined || !hasMethod(mainMenuBar, "HookScript")) {
    return;
  }

  mainMenuBar.HookScript("OnShow", () => {
    if (!isCustomLayoutEnabled() || isCombatLocked() || isApplyingLayout) {
      return;
    }

    scheduleLayoutSync();
  });
}

function hookBlizzardLayoutDrivers(): void {
  if (blizzardLayoutHooksInstalled) {
    return;
  }

  blizzardLayoutHooksInstalled = true;

  if (typeof MoveMicroButtons === "function") {
    originalMoveMicroButtons = MoveMicroButtons;
    _G.MoveMicroButtons = (...args: unknown[]) => {
      if (isCustomLayoutEnabled()) {
        scheduleLayoutSync();
        return;
      }

      originalMoveMicroButtons?.(...args);
    };
  }

  for (const functionName of EXP_BAR_LAYOUT_HOOK_TARGETS) {
    if (typeof _G[functionName] !== "function") {
      continue;
    }

    hooksecurefunc(functionName, () => {
      if (!isCustomLayoutEnabled() || isCombatLocked() || isApplyingLayout) {
        return;
      }

      moveExpBar();

      if (functionName === "MainMenuBar_UpdateExperienceBars") {
        scheduleLayoutSync();
      }
    });
  }

  hookMainMenuBarRelayout();

  if (typeof UpdateMicroButtonsParent === "function") {
    const originalUpdateMicroButtonsParent = UpdateMicroButtonsParent;
    _G.UpdateMicroButtonsParent = (parent: WowFrame) => {
      if (isCustomLayoutEnabled()) {
        scheduleLayoutSync();
        return;
      }

      originalUpdateMicroButtonsParent(parent);
    };
  }

  if (typeof _G.UpdateMicroButtons === "function") {
    hooksecurefunc("UpdateMicroButtons", () => {
      if (!isCustomLayoutEnabled() || isCombatLocked() || isApplyingLayout) {
        return;
      }

      scheduleLayoutSync();
    });
  }

  for (const functionName of BLIZZARD_LAYOUT_HOOK_TARGETS) {
    if (typeof _G[functionName] === "function") {
      hooksecurefunc(functionName, () => {
        if (!isCustomLayoutEnabled() || isCombatLocked() || isApplyingLayout) {
          return;
        }

        scheduleLayoutSync();
      });
    }
  }
}

function restoreFrame(name: string): void {
  const frame = getFrame(name);
  const snapshot = snapshots[name];

  if (frame === undefined || snapshot === undefined) {
    return;
  }

  if (!canLayoutFrame(frame)) {
    return;
  }

  frame.SetParent(snapshot.parent ?? UIParent);
  frame.SetScale(snapshot.scale);
  frame.SetSize(snapshot.width, snapshot.height);
  frame.ClearAllPoints();

  for (const point of snapshot.points) {
    frame.SetPoint(point.point, point.relativeTo ?? UIParent, point.relativePoint, point.x, point.y);
  }

  if (snapshot.wasShown) {
    frame.Show();
    return;
  }

  frame.Hide();
}

function ensureLayoutFrames(): void {
  if (actionGridFrame === undefined) {
    actionGridFrame = CreateFrame("Frame", "ChrisWowAddonActionGridFrame", UIParent);
    actionGridFrame.SetSize(ACTION_GRID_WIDTH, ACTION_GRID_HEIGHT);
    actionGridFrame.SetPoint("BOTTOMLEFT", UIParent, "BOTTOMLEFT", ACTION_GRID_MARGIN, ACTION_GRID_BOTTOM);
    actionGridFrame.SetFrameStrata("MEDIUM");
  }

  if (systemButtonFrame === undefined) {
    systemButtonFrame = CreateFrame("Frame", "ChrisWowAddonSystemButtonFrame", UIParent);
    systemButtonFrame.SetSize(SYSTEM_FRAME_WIDTH, SYSTEM_FRAME_HEIGHT);
    systemButtonFrame.SetPoint("BOTTOMRIGHT", UIParent, "BOTTOMRIGHT", -SYSTEM_FRAME_MARGIN, SYSTEM_FRAME_MARGIN);
    systemButtonFrame.SetFrameStrata("MEDIUM");
  }
}

function ensureBagButtonFrame(): void {
  ensureLayoutFrames();

  if (bagButtonFrame !== undefined) {
    return;
  }

  if (systemButtonFrame === undefined) {
    return;
  }

  bagButtonFrame = CreateFrame(
    "Frame",
    "ChrisWowAddonBagButtonFrame",
    systemButtonFrame,
    "SecureHandlerBaseTemplate"
  ) as WowSecureFrame;
}

function getSystemButtonXOffset(placedColumn: number): number {
  return -placedColumn * (SYSTEM_BUTTON_SIZE + SYSTEM_BUTTON_GAP);
}

function getSystemRowWidth(buttonCount: number): number {
  if (buttonCount <= 0) {
    return SYSTEM_BUTTON_SIZE;
  }

  return buttonCount * SYSTEM_BUTTON_SIZE + Math.max(0, buttonCount - 1) * SYSTEM_BUTTON_GAP;
}

function updateSystemFrameWidth(rowWidths: number[]): void {
  if (systemButtonFrame === undefined) {
    return;
  }

  let maxRowWidth = SYSTEM_BUTTON_SIZE;

  for (const rowWidth of rowWidths) {
    if (rowWidth > maxRowWidth) {
      maxRowWidth = rowWidth;
    }
  }

  systemButtonFrame.SetSize(maxRowWidth, SYSTEM_FRAME_HEIGHT);
}

function layoutSystemRowButton(button: WowFrame, name: string, placedColumn: number, rowYOffset: number): void {
  if (systemButtonFrame === undefined) {
    return;
  }

  captureFrame(name, button);
  hookLayoutFrame(name, button);
  button.SetParent(systemButtonFrame);
  button.ClearAllPoints();
  button.SetSize(SYSTEM_BUTTON_SIZE, SYSTEM_BUTTON_SIZE);
  button.SetScale(1);
  button.SetPoint(
    "BOTTOMRIGHT",
    systemButtonFrame,
    "BOTTOMRIGHT",
    getSystemButtonXOffset(placedColumn),
    rowYOffset
  );
  button.Show();
}

function layoutMicroButton(button: WowFrame, name: string, placedColumn: number): void {
  layoutSystemRowButton(button, name, placedColumn, MICRO_ROW_Y);
}

function shouldSkipMicroButtonPlacement(name: string): boolean {
  for (const [, anchorName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    if (name === anchorName) {
      return false;
    }
  }

  for (const [overlayName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    if (name === overlayName) {
      return true;
    }
  }

  return false;
}

function applyMicroButtonOverlays(): void {
  if (systemButtonFrame === undefined) {
    return;
  }

  for (const [overlayName, anchorName] of MICRO_BUTTON_OVERLAY_PAIRS) {
    const overlay = getFrame(overlayName);
    const anchor = getFrame(anchorName);

    if (!canLayoutFrame(overlay) || !canLayoutFrame(anchor)) {
      continue;
    }

    captureFrame(overlayName, overlay);
    hookLayoutFrame(overlayName, overlay);
    overlay.SetParent(systemButtonFrame);
    overlay.ClearAllPoints();
    overlay.SetSize(SYSTEM_BUTTON_SIZE, SYSTEM_BUTTON_SIZE);
    overlay.SetScale(1);
    overlay.SetPoint("BOTTOMRIGHT", anchor, "BOTTOMRIGHT", 0, 0);
    overlay.Show();
  }
}

function moveMicroButtons(): number {
  if (systemButtonFrame === undefined) {
    return 0;
  }

  const names = getMicroButtonNames();
  let placedColumn = 0;

  for (let index = names.length - 1; index >= 0; index--) {
    const name = names[index];

    if (shouldSkipMicroButtonPlacement(name)) {
      continue;
    }

    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    layoutMicroButton(button, name, placedColumn);
    placedColumn++;
  }

  applyMicroButtonOverlays();

  return placedColumn;
}

function moveBagButtonsDirect(): number {
  if (systemButtonFrame === undefined) {
    return 0;
  }

  let placedColumn = 0;

  for (const name of BAG_BUTTON_NAMES) {
    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    layoutSystemRowButton(button, name, placedColumn, BAG_ROW_Y);
    placedColumn++;
  }

  return placedColumn;
}

function moveBagButtonsSecure(): number {
  if (systemButtonFrame === undefined || bagButtonFrame === undefined) {
    return 0;
  }

  if (!hasMethod(bagButtonFrame, "Execute") || !hasMethod(bagButtonFrame, "SetFrameRef")) {
    return moveBagButtonsDirect();
  }

  let placedColumn = 0;

  for (const name of BAG_BUTTON_NAMES) {
    const button = getFrame(name);
    const ref = BAG_FRAME_REFS[placedColumn];

    if (ref === undefined || !canLayoutFrame(button)) {
      continue;
    }

    captureFrame(name, button);
    hookLayoutFrame(name, button);
    bagButtonFrame.SetFrameRef(ref, button);
    placedColumn++;
  }

  if (placedColumn === 0) {
    return 0;
  }

  const bagRowWidth = getSystemRowWidth(placedColumn);
  bagButtonFrame.SetSize(bagRowWidth, SYSTEM_BUTTON_SIZE);
  bagButtonFrame.SetPoint("BOTTOMRIGHT", systemButtonFrame, "BOTTOMRIGHT", 0, BAG_ROW_Y);

  bagButtonFrame.Execute(
    `local size = ${SYSTEM_BUTTON_SIZE}
local step = ${SYSTEM_BUTTON_SIZE + SYSTEM_BUTTON_GAP}
local refs = {"bag0","bag1","bag2","bag3","bag4","bag5"}
for index, ref in ipairs(refs) do
  local btn = self:GetFrameRef(ref)
  if btn then
    btn:SetParent(self)
    btn:ClearAllPoints()
    btn:SetSize(size, size)
    btn:SetScale(1)
    btn:SetPoint("BOTTOMRIGHT", self, "BOTTOMRIGHT", -((index - 1) * step), 0)
    btn:Show()
  end
end`,
    SECURE_BAG_LAYOUT_SNIPPET
  );

  return placedColumn;
}

function moveBagButtons(): number {
  if (systemButtonFrame === undefined || isCombatLocked()) {
    return 0;
  }

  ensureBagButtonFrame();

  if (bagButtonFrame !== undefined) {
    return moveBagButtonsSecure();
  }

  return moveBagButtonsDirect();
}

function moveActionButtons(): void {
  if (actionGridFrame === undefined) {
    return;
  }

  const names = getActionButtonNames();

  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    const button = getFrame(name);

    if (!canLayoutFrame(button)) {
      continue;
    }

    const column = index % ACTION_COLUMNS;
    const row = Math.floor(index / ACTION_COLUMNS);
    captureFrame(name, button);
    hookLayoutFrame(name, button);
    button.SetParent(actionGridFrame);
    button.ClearAllPoints();
    button.SetSize(ACTION_BUTTON_SIZE, ACTION_BUTTON_SIZE);
    button.SetScale(1);
    button.SetPoint("BOTTOMLEFT", actionGridFrame, "BOTTOMLEFT", column * ACTION_CELL_SIZE, row * ACTION_CELL_SIZE);
    button.Show();
  }
}

function moveSystemButtons(): void {
  const bagButtonCount = moveBagButtons();
  const microButtonCount = moveMicroButtons();

  updateSystemFrameWidth([
    getSystemRowWidth(bagButtonCount),
    getSystemRowWidth(microButtonCount)
  ]);
}

function getExpBarDimensions(frameName: string, frame: WowFrame): { width: number; height: number } {
  const snapshot = snapshots[frameName];
  const width = snapshot?.width && snapshot.width > 0 ? snapshot.width : frame.GetWidth() || EXP_BAR_DEFAULT_WIDTH;
  const height =
    snapshot?.height && snapshot.height > 0 ? snapshot.height : frame.GetHeight() || ACTION_STATUS_BAR_HEIGHT;

  return {
    width: Math.max(width, ACTION_STATUS_BAR_WIDTH),
    height: Math.max(height, ACTION_STATUS_BAR_HEIGHT)
  };
}

function moveExpBarFrame(frameName: string, frame: WowFrame): void {
  const wasShown = frame.IsShown();
  captureFrame(frameName, frame);
  hookLayoutFrame(frameName, frame);

  const { width, height } = getExpBarDimensions(frameName, frame);

  frame.SetParent(UIParent);
  frame.ClearAllPoints();
  frame.SetScale(1);
  frame.SetSize(width, height);
  frame.SetFrameStrata("HIGH");
  frame.SetPoint("TOP", UIParent, "TOP", 0, 0);

  if (wasShown) {
    frame.Show();
    return;
  }

  frame.Hide();
}

function moveExpBar(): void {
  for (const frameName of EXP_BAR_FRAME_NAMES) {
    const frame = getFrame(frameName);

    if (!canLayoutFrame(frame)) {
      continue;
    }

    moveExpBarFrame(frameName, frame);
  }
}

function moveStatusBars(): void {
  if (actionGridFrame === undefined) {
    return;
  }

  let visibleBars = 0;

  for (const name of STATUS_BAR_NAMES) {
    const frame = getFrame(name);

    if (!canLayoutFrame(frame)) {
      continue;
    }

    const wasShown = frame.IsShown();
    captureFrame(name, frame);
    hookLayoutFrame(name, frame);

    if (!wasShown) {
      frame.Hide();
      continue;
    }

    frame.SetParent(actionGridFrame);
    frame.ClearAllPoints();
    frame.SetScale(1);
    frame.SetSize(ACTION_STATUS_BAR_WIDTH, ACTION_STATUS_BAR_HEIGHT);
    frame.SetPoint(
      "BOTTOM",
      actionGridFrame,
      "TOP",
      0,
      ACTION_STATUS_BAR_GAP + visibleBars * (ACTION_STATUS_BAR_HEIGHT + 2)
    );
    frame.Show();
    visibleBars++;
  }
}

function hideDecorativeFrames(): void {
  for (const name of DECORATIVE_FRAME_NAMES) {
    const frame = getFrame(name);

    if (!canHideFrame(frame)) {
      continue;
    }

    captureFrame(name, frame);
    frame.Hide();
  }
}

function ensureLayoutHiderFrame(): void {
  if (layoutHiderFrame !== undefined) {
    return;
  }

  layoutHiderFrame = CreateFrame("Frame", "ChrisWowAddonLayoutHiderFrame", UIParent);
  layoutHiderFrame.Hide();
}

function setIgnoreFramePositionManager(frame: WowFrame): void {
  (frame as unknown as { ignoreFramePositionManager?: boolean }).ignoreFramePositionManager = true;
}

function hideBottomShellFrames(): void {
  ensureLayoutHiderFrame();

  if (layoutHiderFrame === undefined) {
    return;
  }

  for (const name of MAIN_MENU_BAR_SHELL_NAMES) {
    const frame = getFrame(name);

    if (frame === undefined) {
      continue;
    }

    captureFrame(name, frame);
    hookLayoutFrame(name, frame);
    setIgnoreFramePositionManager(frame);

    if (hasMethod(frame, "EnableMouse")) {
      frame.EnableMouse(false);
    }

    if (canHideFrame(frame)) {
      frame.Hide();
    }
  }

  for (const name of PAGE_CONTROL_FRAME_NAMES) {
    const frame = getFrame(name);

    if (frame === undefined) {
      continue;
    }

    captureFrame(name, frame);
    hookLayoutFrame(name, frame);
    setIgnoreFramePositionManager(frame);

    if (canLayoutFrame(frame)) {
      frame.SetParent(layoutHiderFrame);
    }

    if (canHideFrame(frame)) {
      frame.Hide();
    }
  }
}

function isBottomShellHidden(): boolean {
  for (const name of [...MAIN_MENU_BAR_SHELL_NAMES, ...PAGE_CONTROL_FRAME_NAMES]) {
    const frame = getFrame(name);

    if (frame !== undefined && frame.IsShown()) {
      return false;
    }
  }

  return true;
}

function applyCustomLayout(): void {
  isApplyingLayout = true;
  ensureLayoutFrames();
  moveActionButtons();
  moveSystemButtons();
  moveStatusBars();
  hideDecorativeFrames();
  moveExpBar();
  hideBottomShellFrames();
  isApplyingLayout = false;
}

function restoreBlizzardLayout(): void {
  for (const prefix of ACTION_BUTTON_PREFIXES) {
    for (let index = 1; index <= 12; index++) {
      restoreFrame(`${prefix}${index}`);
    }
  }

  for (const name of getMicroButtonNames()) {
    restoreFrame(name);
  }

  for (const name of BAG_BUTTON_NAMES) {
    restoreFrame(name);
  }

  for (const name of DECORATIVE_FRAME_NAMES) {
    restoreFrame(name);
  }

  for (const name of [...MAIN_MENU_BAR_SHELL_NAMES, ...PAGE_CONTROL_FRAME_NAMES]) {
    restoreFrame(name);
  }

  for (const name of EXP_BAR_FRAME_NAMES) {
    restoreFrame(name);
  }

  for (const name of STATUS_BAR_NAMES) {
    restoreFrame(name);
  }
}

function isCombatLocked(): boolean {
  return InCombatLockdown !== undefined && InCombatLockdown();
}

export function syncActionLayout(showCombatNotice = false): void {
  if (isCombatLocked()) {
    pendingLayoutSync = true;

    if (showCombatNotice) {
      addonPrint("Action layout update queued until combat ends.");
    }

    return;
  }

  pendingLayoutSync = false;

  if (getSettings().enableCustomActionLayout) {
    applyCustomLayout();
    return;
  }

  restoreBlizzardLayout();
}

export function printActionLayoutStatus(): void {
  addonPrint(`Layout enabled: ${getSettings().enableCustomActionLayout}`);
  addonPrint(`In world: ${isPlayerInWorld()}, applied: ${isCustomLayoutApplied()}`);
  addonPrint(`Combat: ${isCombatLocked()}, pending: ${pendingLayoutSync}, scheduled: ${layoutSyncScheduled}`);
  addonPrint(`Bootstrap: ${layoutBootstrapActive}, stabilize: ${layoutBootstrapStabilizeRemaining.toFixed(2)}`);
  addonPrint(`Action buttons: ${countExistingFrames(getActionButtonNames())}/60`);
  const microButtonNames = getMicroButtonNames();
  addonPrint(`System buttons: ${countExistingFrames(microButtonNames)}/${microButtonNames.length}`);
  addonPrint(`Bag buttons: ${countExistingFrames(BAG_BUTTON_NAMES)}/${BAG_BUTTON_NAMES.length}`);
  const expBarSummary = EXP_BAR_FRAME_NAMES.map((name) => {
    const frame = getFrame(name);

    if (frame === undefined) {
      return `${name}=missing`;
    }

    return `${name}=${frame.IsShown() ? "shown" : "hidden"}`;
  }).join(", ");
  addonPrint(`Exp bars: ${expBarSummary}, top=${isExpBarLayoutApplied()}`);
  addonPrint(`Bottom shell hidden: ${isBottomShellHidden()}`);
  addonPrint(`Status bars: ${countExistingFrames(STATUS_BAR_NAMES)}/${STATUS_BAR_NAMES.length}`);
  addonPrint(`Layout frames: action=${actionGridFrame !== undefined}, system=${systemButtonFrame !== undefined}`);
}

export function registerActionLayout(): void {
  if (eventFrame !== undefined) {
    scheduleLayoutBootstrap(true);
    return;
  }

  eventFrame = CreateFrame("Frame");
  eventFrame.RegisterEvent("ADDON_LOADED");
  eventFrame.RegisterEvent("PLAYER_LOGIN");
  eventFrame.RegisterEvent("PLAYER_ENTERING_WORLD");
  eventFrame.RegisterEvent("PLAYER_REGEN_ENABLED");
  eventFrame.RegisterEvent("PLAYER_TARGET_CHANGED");
  eventFrame.RegisterEvent("BAG_UPDATE_DELAYED");
  eventFrame.RegisterEvent("ACTIONBAR_PAGE_CHANGED");
  eventFrame.RegisterEvent("UPDATE_MULTI_ACTIONBAR");
  eventFrame.SetScript("OnEvent", (_self, eventName, eventArg) => {
    if (eventName === "ADDON_LOADED" && eventArg === ADDON_NAME) {
      ensureTimerFrame();
      scheduleLayoutBootstrap(true);
      return;
    }

    if (eventName === "PLAYER_REGEN_ENABLED") {
      if (isCustomLayoutEnabled() || pendingLayoutSync) {
        syncActionLayout();
      }

      return;
    }

    if (eventName === "PLAYER_LOGIN" || eventName === "PLAYER_ENTERING_WORLD") {
      scheduleLayoutBootstrap(true);
      return;
    }

    if (eventName === "BAG_UPDATE_DELAYED" && isCombatLocked()) {
      pendingLayoutSync = true;
      return;
    }

    scheduleLayoutSync();
  });

  hookBlizzardLayoutDrivers();
  ensureTimerFrame();

  if (isCustomLayoutEnabled()) {
    scheduleLayoutBootstrap(true);
  }
}
