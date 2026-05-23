export function getUnitHealthValues(unit: string): { current: number; max: number } {
  const max = UnitHealthMax(unit) ?? 0;
  let current = UnitHealth(unit) ?? 0;

  if (UnitIsDead(unit)) {
    current = 0;
  }

  return {
    current: Math.max(0, current),
    max: Math.max(1, max)
  };
}

export function formatUnitLevel(level: number | undefined): string {
  if (level === undefined || level < 1) {
    return "??";
  }

  return `${level}`;
}
