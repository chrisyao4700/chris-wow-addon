import type { ClassBuffTriggerMappingFile } from "../class-mapping-file";
import type { PlayerClassFileName } from "../types";
import { deathKnightBuffTriggerEffectMapping } from "./death-knight";
import { druidBuffTriggerEffectMapping } from "./druid";
import { hunterBuffTriggerEffectMapping } from "./hunter";
import { mageBuffTriggerEffectMapping } from "./mage";
import { paladinBuffTriggerEffectMapping } from "./paladin";
import { priestBuffTriggerEffectMapping } from "./priest";
import { rogueBuffTriggerEffectMapping } from "./rogue";
import { shamanBuffTriggerEffectMapping } from "./shaman";
import { warlockBuffTriggerEffectMapping } from "./warlock";
import { warriorBuffTriggerEffectMapping } from "./warrior";

export { deathKnightBuffTriggerEffectMapping } from "./death-knight";
export { druidBuffTriggerEffectMapping } from "./druid";
export { hunterBuffTriggerEffectMapping } from "./hunter";
export { mageBuffTriggerEffectMapping } from "./mage";
export { paladinBuffTriggerEffectMapping } from "./paladin";
export { priestBuffTriggerEffectMapping } from "./priest";
export { rogueBuffTriggerEffectMapping } from "./rogue";
export { shamanBuffTriggerEffectMapping } from "./shaman";
export { warlockBuffTriggerEffectMapping } from "./warlock";
export { warriorBuffTriggerEffectMapping } from "./warrior";

export const CLASS_BUFF_TRIGGER_EFFECT_MAPPING_FILES: Record<PlayerClassFileName, ClassBuffTriggerMappingFile> = {
  WARRIOR: warriorBuffTriggerEffectMapping,
  MAGE: mageBuffTriggerEffectMapping,
  PRIEST: priestBuffTriggerEffectMapping,
  WARLOCK: warlockBuffTriggerEffectMapping,
  DRUID: druidBuffTriggerEffectMapping,
  HUNTER: hunterBuffTriggerEffectMapping,
  SHAMAN: shamanBuffTriggerEffectMapping,
  PALADIN: paladinBuffTriggerEffectMapping,
  ROGUE: rogueBuffTriggerEffectMapping,
  DEATHKNIGHT: deathKnightBuffTriggerEffectMapping
};
