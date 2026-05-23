export const VITALS_THROTTLE_SECONDS = 0.1;
export const VITALS_POLL_INTERVAL_SECONDS = 0.1;
export const PLAYER_LEVEL_VITALS_SUPPRESS_SECONDS = 0.75;

export const WATCHED_UNITS = ["player", "target"] as const;
export type WatchedUnit = (typeof WATCHED_UNITS)[number];

export const REQUIRED_UNIT_SCOPED_EVENTS = ["UNIT_HEALTH", "UNIT_MAXHEALTH", "UNIT_POWER_UPDATE"] as const;

export const UNIT_SCOPED_EVENTS = [
  "UNIT_HEALTH",
  "UNIT_MAXHEALTH",
  "UNIT_POWER_UPDATE",
  "UNIT_DISPLAYPOWER",
  "UNIT_PORTRAIT_UPDATE",
  "UNIT_LEVEL",
  "UNIT_COMBO_POINTS"
] as const;
