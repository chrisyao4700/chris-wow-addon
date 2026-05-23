import type { SpellTextEffectBinding } from "../registry";

/**
 * Non-class spells available to all characters (General tab, weapons, etc.).
 * Loaded for every player regardless of class or race.
 */
export const COMMON_SPELL_TEXT_EFFECT_BINDINGS: SpellTextEffectBinding[] = [
  {
    spellNames: ["Throw", "投掷"],
    displayText: "风之呼吸 · 投刃"
  },
  {
    spellNames: ["Shoot", "射击"],
    displayText: "雷之呼吸 · 鸣神"
  }
];
