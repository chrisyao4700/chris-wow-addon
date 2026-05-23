export const ACTION_COLUMNS = 12;
export const ACTION_ROWS = 5;
export const ACTION_CELL_SIZE = 36;
export const ACTION_BUTTON_SIZE = 31;
export const ACTION_GRID_WIDTH = (ACTION_COLUMNS - 1) * ACTION_CELL_SIZE + ACTION_BUTTON_SIZE;
export const ACTION_GRID_HEIGHT = (ACTION_ROWS - 1) * ACTION_CELL_SIZE + ACTION_BUTTON_SIZE;
export const ACTION_GRID_MARGIN = 16;
export const ACTION_GRID_BOTTOM = 16;

export const ACTION_STATUS_BAR_HEIGHT = 12;
export const ACTION_STATUS_BAR_GAP = 4;
export const ACTION_STATUS_BAR_WIDTH = 300;

export const EXP_BAR_DEFAULT_WIDTH = 1024;
export const EXP_BAR_FRAME_NAMES = ["MainMenuExpBar", "StatusTrackingBarManager"] as const;
export const EXP_BAR_LAYOUT_HOOK_TARGETS = [
  "ReputationWatchBar_Update",
  "MainMenuExpBar_Update",
  "ExpBar_Update",
  "MainMenuBar_UpdateExperienceBars",
  "MainMenuExpBar_SetWidth"
] as const;

export const SYSTEM_BUTTON_SIZE = 28;
export const SYSTEM_BUTTON_GAP = 0;
export const SYSTEM_ROW_HEIGHT = SYSTEM_BUTTON_SIZE + 8;
export const BAG_ROW_Y = 0;
export const MICRO_ROW_Y = SYSTEM_ROW_HEIGHT;
export const SYSTEM_FRAME_WIDTH = 620;
export const SYSTEM_FRAME_HEIGHT = SYSTEM_ROW_HEIGHT * 2;
export const SYSTEM_FRAME_MARGIN = 16;

export const RELAYOUT_DELAY_SECONDS = 0.05;
export const LAYOUT_MIN_SYNC_INTERVAL_SECONDS = 0.25;
export const LAYOUT_BOOTSTRAP_RETRY_SECONDS = 0.25;
export const LAYOUT_BOOTSTRAP_TIMEOUT_SECONDS = 10;
export const LAYOUT_BOOTSTRAP_STABILIZE_SECONDS = 5;
export const LAYOUT_WATCHDOG_INTERVAL_SECONDS = 0.5;
export const LAYOUT_DEFERRED_SYNC_DELAYS_SECONDS = [0, 0.5, 1.5, 3, 5] as const;

export const MAIN_ACTION_BAR_BUTTON_COUNT = 12;
export const MIN_ACTION_BUTTONS_FOR_LAYOUT = 36;
export const ACTION_BUTTONS_PER_BAR = 12;

export const ACTION_BUTTON_PREFIXES = [
  "ActionButton",
  "MultiBarBottomLeftButton",
  "MultiBarBottomRightButton",
  "MultiBarRightButton",
  "MultiBarLeftButton"
] as const;

export const FALLBACK_MICRO_BUTTON_NAMES = [
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
] as const;

export const ADDITIONAL_MICRO_BUTTON_NAMES = [
  "LFGMicroButton",
  "QuickJoinMicroButton",
  "ProfessionMicroButton",
  "PlayerSpellsMicroButton",
  "HousingMicroButton"
] as const;

export const MICRO_BUTTON_OVERLAY_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["GuildMicroButton", "SocialsMicroButton"],
  ["HelpMicroButton", "StoreMicroButton"]
];

// KeyRingButton calls self:Layout() on show and breaks when reparented off Blizzard's bag bar.
export const BAG_BUTTON_NAMES = [
  "MainMenuBarBackpackButton",
  "CharacterBag0Slot",
  "CharacterBag1Slot",
  "CharacterBag2Slot",
  "CharacterBag3Slot"
] as const;

export const DECORATIVE_FRAME_NAMES = [
  "MainMenuBarArtFrame",
  "MainMenuBarLeftEndCap",
  "MainMenuBarRightEndCap",
  "MainMenuBarTexture0",
  "MainMenuBarTexture1",
  "MainMenuBarTexture2",
  "MainMenuBarTexture3",
  "MicroButtonAndBagsBar"
] as const;

// Main menu bar chrome at the default bottom anchor (hide only — do not reparent or bag buttons follow).
export const MAIN_MENU_BAR_SHELL_NAMES = ["MainMenuBar", "SlidingActionBarTexture0", "SlidingActionBarTexture1"] as const;

export const PAGE_CONTROL_FRAME_NAMES = ["ActionBarUpButton", "ActionBarDownButton", "MainMenuBarPageNumber"] as const;

export const STATUS_BAR_NAMES = ["ReputationWatchBar", "MainMenuMaxLevelBar", "HonorWatchBar"] as const;

// Classic uses Shapeshift*; retail/Cata+ often uses Stance*. Check Classic names first.
export const STANCE_BAR_FRAME_NAMES = ["ShapeshiftBarFrame", "StanceBarFrame"] as const;
export const STANCE_BUTTON_PREFIXES = ["ShapeshiftButton", "StanceButton"] as const;
export const STANCE_BUTTON_COUNT = 10;
export const STANCE_BAR_ABOVE_ACTION_GAP = 6;
export const STANCE_BAR_DECORATIVE_NAMES = [
  "ShapeshiftBarLeft",
  "ShapeshiftBarMiddle",
  "ShapeshiftBarRight",
  "StanceBarLeft",
  "StanceBarMiddle",
  "StanceBarRight"
] as const;
export const STANCE_BAR_LAYOUT_HOOK_TARGETS = ["StanceBar_Update", "ShapeshiftBar_Update"] as const;

export const BLIZZARD_LAYOUT_HOOK_TARGETS = [
  "MultiActionBar_Update",
  "MainMenuBar_Update",
  "ActionBar_Update",
  "UIParent_ManageFramePositions"
] as const;

export const LOOT_FRAME_NAMES = ["LootFrame"] as const;
export const LOOT_FRAME_DEFAULT_WIDTH = 256;
export const LOOT_FRAME_DEFAULT_HEIGHT = 256;
// Cursor-relative TOPLEFT anchor when the loot window opens.
export const LOOT_FRAME_CURSOR_OFFSET_X = -40;
export const LOOT_FRAME_CURSOR_OFFSET_Y = 95;
