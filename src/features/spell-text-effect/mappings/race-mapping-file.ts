import type { PlayerRaceFileName, SpellTextEffectRaceMapping } from "./types";

export type RaceSpellTextMappingFile = {
  /** Must match UnitRace("player") token, e.g. "BloodElf". */
  raceFileName: PlayerRaceFileName;
  /** Localized + English spell names that may appear in combat log or spellbook. */
  bindings: SpellTextEffectRaceMapping;
};

/** Declares one race mapping file. Keeps race token next to its bindings for easier edits. */
export function defineRaceSpellTextMapping(file: RaceSpellTextMappingFile): RaceSpellTextMappingFile {
  return file;
}
