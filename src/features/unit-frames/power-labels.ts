const POWER_LABELS: Record<number, { zh: string; en: string }> = {
  0: { zh: "全集中", en: "Focus" },
  1: { zh: "怒意", en: "Rage" },
  2: { zh: "专注", en: "Focus" },
  3: { zh: "气劲", en: "Energy" },
  6: { zh: "符文", en: "Runic" }
};

export function getPowerLabel(powerType: number | undefined, useChinese: boolean): string {
  const labels = POWER_LABELS[powerType ?? 0] ?? POWER_LABELS[0];
  return useChinese ? labels.zh : labels.en;
}

export function getHealthLabel(useChinese: boolean): string {
  return useChinese ? "生命" : "HP";
}
