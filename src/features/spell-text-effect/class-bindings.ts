import { getSpellTextEffectBindingsForPlayer } from "./mappings";
import {
  isPlayerClassFileName,
  isPlayerRaceFileName,
  type PlayerClassFileName,
  type PlayerRaceFileName
} from "./mappings/types";
import type { SpellTextEffectRegistry } from "./registry";

let loadedClassFileName: PlayerClassFileName | undefined;
let loadedRaceFileName: PlayerRaceFileName | undefined;

export function getPlayerClassFileName(): PlayerClassFileName | undefined {
  const [, classFileName] = UnitClass("player");

  if (classFileName === undefined || !isPlayerClassFileName(classFileName)) {
    return undefined;
  }

  return classFileName;
}

export function getPlayerRaceFileName(): PlayerRaceFileName | undefined {
  const [, raceFileName] = UnitRace("player");

  if (raceFileName === undefined || !isPlayerRaceFileName(raceFileName)) {
    return undefined;
  }

  return raceFileName;
}

export function getLoadedPlayerClassFileName(): PlayerClassFileName | undefined {
  return loadedClassFileName;
}

export function getLoadedPlayerRaceFileName(): PlayerRaceFileName | undefined {
  return loadedRaceFileName;
}

export function clearLoadedPlayerSpellTextCache(): void {
  loadedClassFileName = undefined;
  loadedRaceFileName = undefined;
}

/**
 * Detects the player's class and race, then loads common + race + class spell text effect mappings.
 */
export function loadPlayerClassSpellTextBindings(registry: SpellTextEffectRegistry): PlayerClassFileName | undefined {
  const classFileName = getPlayerClassFileName();
  const raceFileName = getPlayerRaceFileName();

  if (classFileName === undefined) {
    if (loadedClassFileName !== undefined) {
      loadedClassFileName = undefined;
      loadedRaceFileName = undefined;
      registry.setBindings([]);
    }

    return undefined;
  }

  if (classFileName === loadedClassFileName && raceFileName === loadedRaceFileName) {
    if (registry.getBindings().length === 0) {
      registry.setBindings(getSpellTextEffectBindingsForPlayer(classFileName, raceFileName));
    }

    return classFileName;
  }

  loadedClassFileName = classFileName;
  loadedRaceFileName = raceFileName;
  registry.setBindings(getSpellTextEffectBindingsForPlayer(classFileName, raceFileName));
  return classFileName;
}
