import {
  ACTION_BUTTON_PREFIXES,
  ACTION_BUTTONS_PER_BAR,
  ADDITIONAL_MICRO_BUTTON_NAMES,
  BAG_BUTTON_NAMES,
  FALLBACK_MICRO_BUTTON_NAMES,
  STANCE_BUTTON_COUNT,
  STANCE_BUTTON_PREFIXES
} from "./constants";

let actionButtonNames: string[] | undefined;
let microButtonNames: string[] | undefined;
let stanceButtonNames: string[] | undefined;

export function getActionButtonNames(): string[] {
  if (actionButtonNames !== undefined) {
    return actionButtonNames;
  }

  const names: string[] = [];

  for (const prefix of ACTION_BUTTON_PREFIXES) {
    for (let index = 1; index <= ACTION_BUTTONS_PER_BAR; index++) {
      names.push(`${prefix}${index}`);
    }
  }

  actionButtonNames = names;
  return names;
}

export function getMicroButtonNames(): string[] {
  if (microButtonNames !== undefined) {
    return microButtonNames;
  }

  const names: string[] = [];
  const seen: Record<string, boolean> = {};

  const addName = (name: string): void => {
    if (seen[name]) {
      return;
    }

    seen[name] = true;
    names.push(name);
  };

  if (MICRO_BUTTONS !== undefined) {
    for (const name of MICRO_BUTTONS) {
      addName(name);
    }
  }

  for (const name of FALLBACK_MICRO_BUTTON_NAMES) {
    addName(name);
  }

  for (const name of ADDITIONAL_MICRO_BUTTON_NAMES) {
    addName(name);
  }

  microButtonNames = names;
  return names;
}

export function getStanceButtonNames(): string[] {
  if (stanceButtonNames !== undefined) {
    return stanceButtonNames;
  }

  const names: string[] = [];

  for (const prefix of STANCE_BUTTON_PREFIXES) {
    for (let index = 1; index <= STANCE_BUTTON_COUNT; index++) {
      names.push(`${prefix}${index}`);
    }
  }

  stanceButtonNames = names;
  return names;
}

export function getBagButtonNames(): readonly string[] {
  return BAG_BUTTON_NAMES;
}
