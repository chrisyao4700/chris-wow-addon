import type { RaceSpellTextMappingFile } from "../race-mapping-file";
import type { PlayerRaceFileName } from "../types";
import { bloodElfSpellTextEffectMapping } from "./blood-elf";

export { bloodElfSpellTextEffectMapping } from "./blood-elf";

export const RACE_SPELL_TEXT_EFFECT_MAPPING_FILES: Partial<
  Record<PlayerRaceFileName, RaceSpellTextMappingFile>
> = {
  BloodElf: bloodElfSpellTextEffectMapping
};

export function getRaceSpellTextEffectMappingFile(
  raceFileName: PlayerRaceFileName
): RaceSpellTextMappingFile | undefined {
  return RACE_SPELL_TEXT_EFFECT_MAPPING_FILES[raceFileName];
}

export function getSpellTextEffectBindingsForRace(
  raceFileName: PlayerRaceFileName
): RaceSpellTextMappingFile["bindings"] {
  return getRaceSpellTextEffectMappingFile(raceFileName)?.bindings ?? [];
}
