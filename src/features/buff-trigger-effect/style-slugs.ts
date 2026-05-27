export const BUFF_TRIGGER_STYLE_SLUGS = [
  "sun_breathing",
  "moon_breathing",
  "water_breathing",
  "flame_breathing",
  "thunder_breathing",
  "wind_breathing",
  "stone_breathing",
  "flower_breathing",
  "insect_breathing",
  "serpent_breathing",
  "love_breathing",
  "mist_breathing",
  "sound_breathing",
  "beast_breathing",
  "blood_art"
] as const;

export type BuffTriggerStyleSlug = (typeof BUFF_TRIGGER_STYLE_SLUGS)[number];

export function isBuffTriggerStyleSlug(value: string): value is BuffTriggerStyleSlug {
  for (const slug of BUFF_TRIGGER_STYLE_SLUGS) {
    if (slug === value) {
      return true;
    }
  }

  return false;
}
