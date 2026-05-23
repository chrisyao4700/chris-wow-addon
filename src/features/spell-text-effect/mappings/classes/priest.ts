import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Priest spell text effect mappings.
 * Update this file only when adding or changing Priest skill overlays.
 */
export const priestSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "PRIEST",
  bindings: [
    // {
    //   spellNames: ["Smite", "惩击"],
    //   displayText: "惩击"
    // }
  ]
});

export const PRIEST_SPELL_TEXT_EFFECT_BINDINGS = priestSpellTextEffectMapping.bindings;
