import type { ClassSpellTextMappingFile } from "../class-mapping-file";
import type { PlayerClassFileName } from "../types";
import { deathKnightSpellTextEffectMapping } from "./death-knight";
import { druidSpellTextEffectMapping } from "./druid";
import { hunterSpellTextEffectMapping } from "./hunter";
import { mageSpellTextEffectMapping } from "./mage";
import { paladinSpellTextEffectMapping } from "./paladin";
import { priestSpellTextEffectMapping } from "./priest";
import { rogueSpellTextEffectMapping } from "./rogue";
import { shamanSpellTextEffectMapping } from "./shaman";
import { warlockSpellTextEffectMapping } from "./warlock";
import { warriorSpellTextEffectMapping } from "./warrior";

export { deathKnightSpellTextEffectMapping } from "./death-knight";
export { druidSpellTextEffectMapping } from "./druid";
export { hunterSpellTextEffectMapping } from "./hunter";
export { mageSpellTextEffectMapping } from "./mage";
export { paladinSpellTextEffectMapping } from "./paladin";
export { priestSpellTextEffectMapping } from "./priest";
export { rogueSpellTextEffectMapping } from "./rogue";
export { shamanSpellTextEffectMapping } from "./shaman";
export { warlockSpellTextEffectMapping } from "./warlock";
export { warriorSpellTextEffectMapping } from "./warrior";

export const CLASS_SPELL_TEXT_EFFECT_MAPPING_FILES: Record<PlayerClassFileName, ClassSpellTextMappingFile> = {
  WARRIOR: warriorSpellTextEffectMapping,
  MAGE: mageSpellTextEffectMapping,
  PRIEST: priestSpellTextEffectMapping,
  WARLOCK: warlockSpellTextEffectMapping,
  DRUID: druidSpellTextEffectMapping,
  HUNTER: hunterSpellTextEffectMapping,
  SHAMAN: shamanSpellTextEffectMapping,
  PALADIN: paladinSpellTextEffectMapping,
  ROGUE: rogueSpellTextEffectMapping,
  DEATHKNIGHT: deathKnightSpellTextEffectMapping
};
