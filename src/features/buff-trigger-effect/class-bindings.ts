import { getBuffTriggerEffectBindingsForClass } from "./mappings";
import {
  isPlayerClassFileName,
  type PlayerClassFileName
} from "./mappings/types";
import type { BuffTriggerEffectRegistry } from "./registry";

let loadedClassFileName: PlayerClassFileName | undefined;

export function getPlayerClassFileName(): PlayerClassFileName | undefined {
  const [, classFileName] = UnitClass("player");

  if (classFileName === undefined || !isPlayerClassFileName(classFileName)) {
    return undefined;
  }

  return classFileName;
}

export function getLoadedPlayerClassFileName(): PlayerClassFileName | undefined {
  return loadedClassFileName;
}

export function clearLoadedPlayerBuffTriggerCache(): void {
  loadedClassFileName = undefined;
}

export function loadPlayerClassBuffTriggerBindings(
  registry: BuffTriggerEffectRegistry
): PlayerClassFileName | undefined {
  const classFileName = getPlayerClassFileName();

  if (classFileName === undefined) {
    if (loadedClassFileName !== undefined) {
      loadedClassFileName = undefined;
      registry.setBindings([]);
    }

    return undefined;
  }

  if (classFileName === loadedClassFileName && registry.getBindings().length > 0) {
    return classFileName;
  }

  loadedClassFileName = classFileName;
  registry.setBindings(getBuffTriggerEffectBindingsForClass(classFileName));
  return classFileName;
}
