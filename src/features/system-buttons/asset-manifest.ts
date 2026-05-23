/** Bundled .tga stems under assets/system-buttons/ (keep in sync with that folder). */
export const BUNDLED_SYSTEM_BUTTON_ASSET_IDS = [
  "achievements",
  "adventure-guide",
  "character",
  "collections",
  "dungeon-finder",
  "friends",
  "game-menu",
  "group-finder",
  "guild",
  "help",
  "housing",
  "professions",
  "pvp",
  "quest-log",
  "quick-join",
  "raid",
  "shop",
  "social",
  "spellbook",
  "talents",
  "world-map"
] as const;

const bundledAssetIds = new Set<string>(BUNDLED_SYSTEM_BUTTON_ASSET_IDS);

export function isBundledSystemButtonAsset(assetId: string): boolean {
  return bundledAssetIds.has(assetId);
}
