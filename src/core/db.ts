export type ChrisWowAddonSettings = {
  showMinimapButton?: boolean;
  showLoginMessage?: boolean;
  minimapButtonAngle?: number;
  enableCustomActionLayout?: boolean;
  enableSpellTextEffect?: boolean;
  enableDemonSlayerUnitFrames?: boolean;
  enableDemonSlayerSystemButtons?: boolean;
};

export type ChrisWowAddonState = {
  launches?: number;
  settings?: ChrisWowAddonSettings;
};

declare let ChrisWowAddonDB: ChrisWowAddonState | undefined;

export function ensureSavedVariables(): ChrisWowAddonState {
  if (ChrisWowAddonDB === undefined) {
    ChrisWowAddonDB = {};
  }

  return ChrisWowAddonDB;
}

export function getSettings(): Required<ChrisWowAddonSettings> {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  return {
    showMinimapButton: state.settings.showMinimapButton !== false,
    showLoginMessage: state.settings.showLoginMessage !== false,
    minimapButtonAngle: state.settings.minimapButtonAngle ?? 45,
    enableCustomActionLayout: state.settings.enableCustomActionLayout !== false,
    enableSpellTextEffect: state.settings.enableSpellTextEffect !== false,
    enableDemonSlayerUnitFrames: state.settings.enableDemonSlayerUnitFrames !== false,
    enableDemonSlayerSystemButtons: state.settings.enableDemonSlayerSystemButtons !== false
  };
}

export function setEnableDemonSlayerSystemButtons(enableDemonSlayerSystemButtons: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.enableDemonSlayerSystemButtons = enableDemonSlayerSystemButtons;
}

export function setEnableDemonSlayerUnitFrames(enableDemonSlayerUnitFrames: boolean): void {
  const state = ensureSavedVariables();

  if (state.settings === undefined) {
    state.settings = {};
  }

  state.settings.enableDemonSlayerUnitFrames = enableDemonSlayerUnitFrames;
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
