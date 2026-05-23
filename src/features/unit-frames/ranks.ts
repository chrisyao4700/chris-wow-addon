const CORPS_RANKS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

const ENEMY_RANKS: Record<string, { zh: string; en: string }> = {
  worldboss: { zh: "鬼舞辻 · 上弦", en: "Muzan · Upper Moon" },
  rareelite: { zh: "十二鬼月 · 上弦", en: "Twelve Kizuki · Upper" },
  elite: { zh: "十二鬼月 · 下弦", en: "Twelve Kizuki · Lower" },
  rare: { zh: "特异之鬼", en: "Special Demon" },
  normal: { zh: "下位之鬼", en: "Lesser Demon" },
  trivial: { zh: "残次之鬼", en: "Fodder Demon" },
  minus: { zh: "分裂体", en: "Fragment" },
  unknown: { zh: "未知之鬼", en: "Unknown Demon" }
};

const FRIENDLY_RANK = { zh: "队士", en: "Slayer" };

export function getPlayerCorpsRank(level: number): string {
  const clampedLevel = Math.max(1, Math.min(60, level));
  const rankIndex = Math.floor((60 - clampedLevel) / 6);
  return CORPS_RANKS[Math.min(rankIndex, CORPS_RANKS.length - 1)];
}

export function getTargetRankLabel(
  classification: string | undefined,
  isEnemy: boolean,
  useChinese: boolean
): string {
  if (!isEnemy) {
    return useChinese ? FRIENDLY_RANK.zh : FRIENDLY_RANK.en;
  }

  const key = classification ?? "unknown";
  const rank = ENEMY_RANKS[key] ?? ENEMY_RANKS.unknown;
  return useChinese ? rank.zh : rank.en;
}

export function getPlayerSubtitle(useChinese: boolean): string {
  return useChinese ? "鬼杀队 · 剑士" : "Demon Slayer Corps";
}

export function getTargetSubtitle(isEnemy: boolean, useChinese: boolean): string {
  if (isEnemy) {
    return useChinese ? "恶鬼" : "Demon";
  }

  return useChinese ? "同盟" : "Ally";
}
