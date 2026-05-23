export type BreathRgb = {
  r: number;
  g: number;
  b: number;
};

export type BreathStyle = {
  breathName: string;
  breathNameEn: string;
  bar: BreathRgb;
  barDim: BreathRgb;
  accent: BreathRgb;
};

const BREATH_STYLES: Record<string, BreathStyle> = {
  WARRIOR: {
    breathName: "岩之呼吸",
    breathNameEn: "Stone Breathing",
    bar: { r: 0.58, g: 0.55, b: 0.5 },
    barDim: { r: 0.35, g: 0.33, b: 0.3 },
    accent: { r: 0.78, g: 0.74, b: 0.68 }
  },
  PALADIN: {
    breathName: "炎之呼吸",
    breathNameEn: "Flame Breathing",
    bar: { r: 0.95, g: 0.28, b: 0.18 },
    barDim: { r: 0.55, g: 0.15, b: 0.1 },
    accent: { r: 1, g: 0.62, b: 0.35 }
  },
  HUNTER: {
    breathName: "兽之呼吸",
    breathNameEn: "Beast Breathing",
    bar: { r: 0.42, g: 0.58, b: 0.72 },
    barDim: { r: 0.24, g: 0.34, b: 0.44 },
    accent: { r: 0.62, g: 0.78, b: 0.9 }
  },
  ROGUE: {
    breathName: "蛇之呼吸",
    breathNameEn: "Serpent Breathing",
    bar: { r: 0.58, g: 0.38, b: 0.88 },
    barDim: { r: 0.32, g: 0.2, b: 0.52 },
    accent: { r: 0.78, g: 0.62, b: 0.98 }
  },
  PRIEST: {
    breathName: "虫之呼吸",
    breathNameEn: "Insect Breathing",
    bar: { r: 0.35, g: 0.78, b: 0.88 },
    barDim: { r: 0.18, g: 0.48, b: 0.55 },
    accent: { r: 0.55, g: 0.92, b: 0.98 }
  },
  SHAMAN: {
    breathName: "雷之呼吸",
    breathNameEn: "Thunder Breathing",
    bar: { r: 1, g: 0.86, b: 0.35 },
    barDim: { r: 0.62, g: 0.52, b: 0.18 },
    accent: { r: 1, g: 0.95, b: 0.65 }
  },
  MAGE: {
    breathName: "水之呼吸",
    breathNameEn: "Water Breathing",
    bar: { r: 0.22, g: 0.48, b: 0.95 },
    barDim: { r: 0.12, g: 0.28, b: 0.58 },
    accent: { r: 0.45, g: 0.72, b: 1 }
  },
  WARLOCK: {
    breathName: "月之呼吸",
    breathNameEn: "Moon Breathing",
    bar: { r: 0.82, g: 0.18, b: 0.82 },
    barDim: { r: 0.48, g: 0.1, b: 0.48 },
    accent: { r: 0.95, g: 0.45, b: 0.95 }
  },
  DRUID: {
    breathName: "风之呼吸",
    breathNameEn: "Wind Breathing",
    bar: { r: 0.32, g: 0.78, b: 0.38 },
    barDim: { r: 0.18, g: 0.48, b: 0.22 },
    accent: { r: 0.55, g: 0.92, b: 0.58 }
  }
};

const DEFAULT_BREATH_STYLE: BreathStyle = {
  breathName: "日之呼吸",
  breathNameEn: "Sun Breathing",
  bar: { r: 0.92, g: 0.72, b: 0.18 },
  barDim: { r: 0.55, g: 0.42, b: 0.1 },
  accent: { r: 1, g: 0.9, b: 0.45 }
};

const ENEMY_STYLE: BreathStyle = {
  breathName: "血鬼术",
  breathNameEn: "Blood Demon Art",
  bar: { r: 0.72, g: 0.12, b: 0.18 },
  barDim: { r: 0.38, g: 0.06, b: 0.1 },
  accent: { r: 0.95, g: 0.35, b: 0.42 }
};

const FRIENDLY_TARGET_STYLE: BreathStyle = {
  breathName: "鬼杀队",
  breathNameEn: "Demon Slayer Corps",
  bar: { r: 0.28, g: 0.62, b: 0.88 },
  barDim: { r: 0.15, g: 0.38, b: 0.55 },
  accent: { r: 0.48, g: 0.82, b: 0.98 }
};

export function getPlayerBreathStyle(classFileName: string | undefined): BreathStyle {
  if (classFileName === undefined) {
    return DEFAULT_BREATH_STYLE;
  }

  return BREATH_STYLES[classFileName] ?? DEFAULT_BREATH_STYLE;
}

export function getTargetBreathStyle(isEnemy: boolean): BreathStyle {
  return isEnemy ? ENEMY_STYLE : FRIENDLY_TARGET_STYLE;
}

export function getBreathDisplayName(style: BreathStyle, useChinese: boolean): string {
  return useChinese ? style.breathName : style.breathNameEn;
}
