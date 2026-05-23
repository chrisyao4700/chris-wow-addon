import type { SpellTextEffectBinding } from "../registry";

/** English class token from UnitClass (second return value). */
export type PlayerClassFileName =
  | "WARRIOR"
  | "MAGE"
  | "PRIEST"
  | "WARLOCK"
  | "DRUID"
  | "HUNTER"
  | "SHAMAN"
  | "PALADIN"
  | "ROGUE";

export const PLAYER_CLASS_FILE_NAMES: readonly PlayerClassFileName[] = [
  "WARRIOR",
  "MAGE",
  "PRIEST",
  "WARLOCK",
  "DRUID",
  "HUNTER",
  "SHAMAN",
  "PALADIN",
  "ROGUE"
];

export type SpellTextEffectClassMapping = SpellTextEffectBinding[];
export type SpellTextEffectRaceMapping = SpellTextEffectBinding[];

/** English race token from UnitRace (second return value). */
export type PlayerRaceFileName =
  | "Human"
  | "Dwarf"
  | "NightElf"
  | "Gnome"
  | "Draenei"
  | "Orc"
  | "Scourge"
  | "Tauren"
  | "Troll"
  | "BloodElf";

export const PLAYER_RACE_FILE_NAMES: readonly PlayerRaceFileName[] = [
  "Human",
  "Dwarf",
  "NightElf",
  "Gnome",
  "Draenei",
  "Orc",
  "Scourge",
  "Tauren",
  "Troll",
  "BloodElf"
];

export function isPlayerRaceFileName(value: string): value is PlayerRaceFileName {
  for (const raceFileName of PLAYER_RACE_FILE_NAMES) {
    if (raceFileName === value) {
      return true;
    }
  }

  return false;
}

export function isPlayerClassFileName(value: string): value is PlayerClassFileName {
  for (const classFileName of PLAYER_CLASS_FILE_NAMES) {
    if (classFileName === value) {
      return true;
    }
  }

  return false;
}
