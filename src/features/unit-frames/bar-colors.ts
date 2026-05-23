export type BarRgb = {
  r: number;
  g: number;
  b: number;
};

export type BarColorSet = {
  bar: BarRgb;
  barDim: BarRgb;
  accent: BarRgb;
};

/** Classic WoW PowerBarColor-style values. */
const POWER_BAR_COLORS: Record<number, BarColorSet> = {
  0: {
    bar: { r: 0, g: 0.44, b: 1 },
    barDim: { r: 0, g: 0.18, b: 0.45 },
    accent: { r: 0.35, g: 0.65, b: 1 }
  },
  1: {
    bar: { r: 1, g: 0, b: 0 },
    barDim: { r: 0.45, g: 0.05, b: 0.05 },
    accent: { r: 1, g: 0.35, b: 0.35 }
  },
  2: {
    bar: { r: 1, g: 0.5, b: 0.25 },
    barDim: { r: 0.45, g: 0.22, b: 0.1 },
    accent: { r: 1, g: 0.68, b: 0.42 }
  },
  3: {
    bar: { r: 1, g: 0.96, b: 0.41 },
    barDim: { r: 0.52, g: 0.48, b: 0.08 },
    accent: { r: 1, g: 0.88, b: 0.55 }
  },
  6: {
    bar: { r: 0, g: 0.82, b: 1 },
    barDim: { r: 0, g: 0.38, b: 0.48 },
    accent: { r: 0.45, g: 0.92, b: 1 }
  }
};

const DEFAULT_MANA_COLORS = POWER_BAR_COLORS[0];

const FRIENDLY_HEALTH_COLORS: BarColorSet = {
  bar: { r: 0, g: 0.69, b: 0.31 },
  barDim: { r: 0, g: 0.32, b: 0.14 },
  accent: { r: 0.45, g: 0.88, b: 0.55 }
};

const ENEMY_HEALTH_COLORS: BarColorSet = {
  bar: { r: 0.78, g: 0.16, b: 0.18 },
  barDim: { r: 0.38, g: 0.06, b: 0.08 },
  accent: { r: 0.95, g: 0.38, b: 0.38 }
};

export function getPowerBarColors(powerType: number | undefined): BarColorSet {
  if (powerType === undefined) {
    return DEFAULT_MANA_COLORS;
  }

  return POWER_BAR_COLORS[powerType] ?? DEFAULT_MANA_COLORS;
}

export function getHealthBarColors(isEnemy: boolean): BarColorSet {
  return isEnemy ? ENEMY_HEALTH_COLORS : FRIENDLY_HEALTH_COLORS;
}
