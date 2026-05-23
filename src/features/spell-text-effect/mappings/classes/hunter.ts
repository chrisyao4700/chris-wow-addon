import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Hunter spell text effect mappings.
 * Update this file only when adding or changing Hunter skill overlays.
 */
export const hunterSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "HUNTER",
  bindings: [
    // {
    //   spellNames: ["Aimed Shot", "瞄准射击"],
    //   displayText: "瞄准射击"
    // }
  ]
});

export const HUNTER_SPELL_TEXT_EFFECT_BINDINGS = hunterSpellTextEffectMapping.bindings;
