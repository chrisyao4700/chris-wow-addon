export type SystemButtonDefinition = {
  /** WoW global frame name, e.g. CharacterMicroButton */
  frameName: string;
  /** Asset file stem under assets/system-buttons/, e.g. character */
  assetId: string;
  /** Human label for design docs and debug output */
  label: string;
};

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

export const CHARACTER_MICRO_BUTTON_FRAME_NAME = "CharacterMicroButton";

/** Blizzard uses a global portrait texture, not {frameName}Portrait. */
export const CHARACTER_MICRO_BUTTON_GLOBAL_OVERLAY_NAMES = ["MicroButtonPortrait"] as const;

/** Blizzard bag bar frames are intentionally excluded from Demon Slayer skins. */
export const EXCLUDED_BAG_BUTTON_FRAME_NAMES = [
  "MainMenuBarBackpackButton",
  "CharacterBag0Slot",
  "CharacterBag1Slot",
  "CharacterBag2Slot",
  "CharacterBag3Slot"
] as const;

const MICRO_BUTTON_DEFINITIONS: SystemButtonDefinition[] = [
  { frameName: "CharacterMicroButton", assetId: "character", label: "Character" },
  { frameName: "SpellbookMicroButton", assetId: "spellbook", label: "Spellbook" },
  { frameName: "TalentMicroButton", assetId: "talents", label: "Talents" },
  { frameName: "SkillMicroButton", assetId: "professions", label: "Professions" },
  { frameName: "ProfessionMicroButton", assetId: "professions", label: "Professions" },
  { frameName: "PlayerSpellsMicroButton", assetId: "spellbook", label: "Player spells" },
  { frameName: "AchievementMicroButton", assetId: "achievements", label: "Achievements" },
  { frameName: "QuestLogMicroButton", assetId: "quest-log", label: "Quest log" },
  { frameName: "SocialsMicroButton", assetId: "social", label: "Social" },
  { frameName: "GuildMicroButton", assetId: "guild", label: "Guild" },
  { frameName: "FriendsMicroButton", assetId: "friends", label: "Friends" },
  { frameName: "WorldMapMicroButton", assetId: "world-map", label: "World map" },
  { frameName: "PVPMicroButton", assetId: "pvp", label: "PvP" },
  { frameName: "LFDMicroButton", assetId: "dungeon-finder", label: "Dungeon finder" },
  { frameName: "LFGMicroButton", assetId: "group-finder", label: "Group finder" },
  { frameName: "QuickJoinMicroButton", assetId: "quick-join", label: "Quick join" },
  { frameName: "CollectionsMicroButton", assetId: "collections", label: "Collections" },
  { frameName: "CollectionsJournalMicroButton", assetId: "collections", label: "Collections" },
  { frameName: "EJMicroButton", assetId: "adventure-guide", label: "Adventure guide" },
  { frameName: "EncounterJournalMicroButton", assetId: "adventure-guide", label: "Adventure guide" },
  { frameName: "RaidMicroButton", assetId: "raid", label: "Raid" },
  { frameName: "StoreMicroButton", assetId: "shop", label: "Shop" },
  { frameName: "MainMenuMicroButton", assetId: "game-menu", label: "Game menu" },
  { frameName: "HelpMicroButton", assetId: "help", label: "Help" },
  { frameName: "HousingMicroButton", assetId: "housing", label: "Housing" }
];

const definitionByFrameName = new Map<string, SystemButtonDefinition>();

for (const definition of MICRO_BUTTON_DEFINITIONS) {
  definitionByFrameName.set(definition.frameName, definition);
}

export function getSystemButtonDefinition(frameName: string): SystemButtonDefinition | undefined {
  return definitionByFrameName.get(frameName);
}

export function getDiscoveredMicroButtonFrameNames(): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  if (MICRO_BUTTONS !== undefined) {
    for (const name of MICRO_BUTTONS) {
      if (!seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
  }

  for (const name of [...FALLBACK_MICRO_BUTTON_NAMES, ...ADDITIONAL_MICRO_BUTTON_NAMES]) {
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
}

export function getSystemButtonDefinitionsForClient(): SystemButtonDefinition[] {
  const definitions: SystemButtonDefinition[] = [];
  const seenFrames = new Set<string>();

  for (const frameName of getDiscoveredMicroButtonFrameNames()) {
    if (seenFrames.has(frameName)) {
      continue;
    }

    seenFrames.add(frameName);
    const fallbackAssetId = frameName.endsWith("MicroButton")
      ? frameName.slice(0, -"MicroButton".length).toLowerCase()
      : frameName.toLowerCase();

    definitions.push(
      getSystemButtonDefinition(frameName) ?? {
        frameName,
        assetId: fallbackAssetId,
        label: frameName
      }
    );
  }

  return definitions;
}

export function getUniqueSystemButtonAssetIds(): string[] {
  const ids = new Set<string>();

  for (const definition of getSystemButtonDefinitionsForClient()) {
    ids.add(definition.assetId);
  }

  return [...ids].sort();
}
