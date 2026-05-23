import type { PlayerClassFileName, SpellTextEffectClassMapping } from "./types";

export type ClassSpellTextMappingFile = {
  /** Must match UnitClass("player") token, e.g. "ROGUE". */
  classFileName: PlayerClassFileName;
  /** Localized + English spell names that may appear in combat log or spellbook. */
  bindings: SpellTextEffectClassMapping;
};

/** Declares one class mapping file. Keeps class token next to its bindings for easier edits. */
export function defineClassSpellTextMapping(file: ClassSpellTextMappingFile): ClassSpellTextMappingFile {
  return file;
}
