import { CLASS_SPELL_TEXT_EFFECT_MAPPING_FILES } from "./classes";
import { COMMON_SPELL_TEXT_EFFECT_BINDINGS } from "./common";
import { getSpellTextEffectBindingsForRace } from "./races";
import type { PlayerClassFileName, PlayerRaceFileName, SpellTextEffectClassMapping } from "./types";

export { CLASS_SPELL_TEXT_EFFECT_MAPPING_FILES } from "./classes";
export { COMMON_SPELL_TEXT_EFFECT_BINDINGS } from "./common";
export { RACE_SPELL_TEXT_EFFECT_MAPPING_FILES } from "./races";
export type { ClassSpellTextMappingFile } from "./class-mapping-file";
export { defineClassSpellTextMapping } from "./class-mapping-file";
export type { RaceSpellTextMappingFile } from "./race-mapping-file";
export { defineRaceSpellTextMapping } from "./race-mapping-file";

export function getClassSpellTextEffectMappingFile(
  classFileName: PlayerClassFileName
): (typeof CLASS_SPELL_TEXT_EFFECT_MAPPING_FILES)[PlayerClassFileName] {
  return CLASS_SPELL_TEXT_EFFECT_MAPPING_FILES[classFileName];
}

export function getSpellTextEffectBindingsForClass(
  classFileName: PlayerClassFileName
): SpellTextEffectClassMapping {
  return getClassSpellTextEffectMappingFile(classFileName).bindings;
}

export function getSpellTextEffectBindingsForPlayer(
  classFileName: PlayerClassFileName,
  raceFileName?: PlayerRaceFileName
): SpellTextEffectClassMapping {
  const raceBindings = raceFileName === undefined ? [] : getSpellTextEffectBindingsForRace(raceFileName);
  const classBindings = getSpellTextEffectBindingsForClass(classFileName);

  return [...COMMON_SPELL_TEXT_EFFECT_BINDINGS, ...raceBindings, ...classBindings];
}
