import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Shaman spell text effect mappings.
 * Update this file only when adding or changing Shaman skill overlays.
 */
export const shamanSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "SHAMAN",
  bindings: [
    // {
    //   spellNames: ["Lightning Bolt", "闪电箭"],
    //   displayText: "闪电箭"
    // }
  ]
});

export const SHAMAN_SPELL_TEXT_EFFECT_BINDINGS = shamanSpellTextEffectMapping.bindings;
