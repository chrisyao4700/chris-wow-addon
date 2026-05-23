import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Warlock spell text effect mappings.
 * Update this file only when adding or changing Warlock skill overlays.
 */
export const warlockSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "WARLOCK",
  bindings: [
    // {
    //   spellNames: ["Shadow Bolt", "暗影箭"],
    //   displayText: "暗影箭"
    // }
  ]
});

export const WARLOCK_SPELL_TEXT_EFFECT_BINDINGS = warlockSpellTextEffectMapping.bindings;
