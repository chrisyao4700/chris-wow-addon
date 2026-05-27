import { CLASS_BUFF_TRIGGER_EFFECT_MAPPING_FILES } from "./classes";
import type { PlayerClassFileName } from "./types";
import type { BuffTriggerEffectClassMapping } from "./types";

export { CLASS_BUFF_TRIGGER_EFFECT_MAPPING_FILES } from "./classes";
export type { ClassBuffTriggerMappingFile } from "./class-mapping-file";
export { defineClassBuffTriggerMapping } from "./class-mapping-file";

export function getBuffTriggerEffectBindingsForClass(
  classFileName: PlayerClassFileName
): BuffTriggerEffectClassMapping {
  return CLASS_BUFF_TRIGGER_EFFECT_MAPPING_FILES[classFileName]?.bindings ?? [];
}
