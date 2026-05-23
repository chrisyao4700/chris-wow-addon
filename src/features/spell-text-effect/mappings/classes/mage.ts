import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Mage spell text effect mappings.
 * Update this file only when adding or changing Mage skill overlays.
 */
export const mageSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "MAGE",
  bindings: [
    // {
    //   spellNames: ["Fireball", "火球术"],
    //   displayText: "火球术"
    // }
  ]
});

export const MAGE_SPELL_TEXT_EFFECT_BINDINGS = mageSpellTextEffectMapping.bindings;
