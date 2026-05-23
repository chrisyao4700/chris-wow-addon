import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Druid spell text effect mappings.
 * Update this file only when adding or changing Druid skill overlays.
 */
export const druidSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "DRUID",
  bindings: [
    // {
    //   spellNames: ["Moonfire", "月火术"],
    //   displayText: "月火术"
    // }
  ]
});

export const DRUID_SPELL_TEXT_EFFECT_BINDINGS = druidSpellTextEffectMapping.bindings;
