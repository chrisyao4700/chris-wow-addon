import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Paladin spell text effect mappings.
 * Update this file only when adding or changing Paladin skill overlays.
 */
export const paladinSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "PALADIN",
  bindings: [
    // {
    //   spellNames: ["Hammer of Wrath", "愤怒之锤"],
    //   displayText: "愤怒之锤"
    // }
  ]
});

export const PALADIN_SPELL_TEXT_EFFECT_BINDINGS = paladinSpellTextEffectMapping.bindings;
