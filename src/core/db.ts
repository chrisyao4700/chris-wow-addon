export type SlayerUISettings = {
  showMinimapButton?: boolean;
  showLoginMessage?: boolean;
  minimapButtonAngle?: number;
  enableCustomActionLayout?: boolean;
  enableSpellTextEffect?: boolean;
  enableDemonSlayerSystemButtons?: boolean;
  spellEffectUserScale?: number;
  spellEffectOffsetX?: number;
  spellEffectOffsetY?: number;
};

export type SlayerUIState = {
  launches?: number;
  settings?: SlayerUISettings;
};

declare let SlayerUIDB: SlayerUIState | undefined;

/** Legacy saved variables from Chris Wow Addon — migrated on first load. */
declare let ChrisWowAddonDB: SlayerUIState | undefined;

export function ensureSavedVariables(): SlayerUIState {
  if (SlayerUIDB === undefined) {
    if (ChrisWowAddonDB !== undefined) {
      SlayerUIDB = ChrisWowAddonDB;
    } else {
      SlayerUIDB = {};
    }
  }

  return SlayerUIDB;
}

export function getSettings(): Required<SlayerUISettings> {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  return {
    showMinimapButton: state.settings.showMinimapButton !== false,
    showLoginMessage: state.settings.showLoginMessage !== false,
    minimapButtonAngle: state.settings.minimapButtonAngle ?? 225,
    enableCustomActionLayout: state.settings.enableCustomActionLayout !== false,
    enableSpellTextEffect: state.settings.enableSpellTextEffect !== false,
    enableDemonSlayerSystemButtons: state.settings.enableDemonSlayerSystemButtons !== false,
    spellEffectUserScale: state.settings.spellEffectUserScale ?? 1,
    spellEffectOffsetX: state.settings.spellEffectOffsetX ?? 0,
    spellEffectOffsetY: state.settings.spellEffectOffsetY ?? 0
  };
}

export function setSpellEffectUserScale(spellEffectUserScale: number): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.spellEffectUserScale = spellEffectUserScale;
}

export function setSpellEffectOffsetX(spellEffectOffsetX: number): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.spellEffectOffsetX = spellEffectOffsetX;
}

export function setSpellEffectOffsetY(spellEffectOffsetY: number): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.spellEffectOffsetY = spellEffectOffsetY;
}

export function resetSpellEffectLayout(): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.spellEffectUserScale = 1;
  state.settings.spellEffectOffsetX = 0;
  state.settings.spellEffectOffsetY = 0;
}

export function setEnableDemonSlayerSystemButtons(enableDemonSlayerSystemButtons: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.enableDemonSlayerSystemButtons = enableDemonSlayerSystemButtons;
}

export function setShowMinimapButton(showMinimapButton: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.showMinimapButton = showMinimapButton;
}

export function setShowLoginMessage(showLoginMessage: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.showLoginMessage = showLoginMessage;
}

export function setMinimapButtonAngle(minimapButtonAngle: number): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.minimapButtonAngle = minimapButtonAngle;
}

export function setEnableCustomActionLayout(enableCustomActionLayout: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.enableCustomActionLayout = enableCustomActionLayout;
}

export function setEnableSpellTextEffect(enableSpellTextEffect: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.enableSpellTextEffect = enableSpellTextEffect;
}

export function getLaunchCount(): number {
  const state = ensureSavedVariables();
  return state.launches || 0;
}

export function incrementLaunchCount(): number {
  const state = ensureSavedVariables();
  state.launches = (state.launches || 0) + 1;
  return state.launches;
}

export function resetLaunchCount(): void {
  const state = ensureSavedVariables();
  state.launches = 0;
}
