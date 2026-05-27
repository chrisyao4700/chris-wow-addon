import type { PlayerClassFileName } from "./types";
import type { BuffTriggerEffectClassMapping } from "./types";

export type ClassBuffTriggerMappingFile = {
  classFileName: PlayerClassFileName;
  bindings: BuffTriggerEffectClassMapping;
};

export function defineClassBuffTriggerMapping(file: ClassBuffTriggerMappingFile): ClassBuffTriggerMappingFile {
  return file;
}
