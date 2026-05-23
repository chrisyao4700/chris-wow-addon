import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Warrior spell text effect mappings.
 * Update this file only when adding or changing Warrior skill overlays.
 */
export const warriorSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "WARRIOR",
  bindings: [
    // {
    //   spellNames: ["Heroic Strike", "英勇打击"],
    //   displayText: "英勇打击"
    // }
  ]
});

export const WARRIOR_SPELL_TEXT_EFFECT_BINDINGS = warriorSpellTextEffectMapping.bindings;
