export type ChrisWowAddonState = {
  launches?: number;
};

declare let ChrisWowAddonDB: ChrisWowAddonState | undefined;

export function ensureSavedVariables(): ChrisWowAddonState {
  if (ChrisWowAddonDB === undefined) {
    ChrisWowAddonDB = {};
  }

  return ChrisWowAddonDB;
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
