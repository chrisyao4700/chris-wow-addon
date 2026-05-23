import { defineRaceSpellTextMapping } from "../race-mapping-file";

/**
 * Blood Elf racial spell text effect mappings.
 * Update this file only when adding or changing Blood Elf racial overlays.
 */
export const bloodElfSpellTextEffectMapping = defineRaceSpellTextMapping({
  raceFileName: "BloodElf",
  bindings: [
    {
      spellNames: ["Arcane Torrent", "奥术洪流"],
      displayText: "血鬼术 · 魔力紊乱"
    }
  ]
});

export const BLOOD_ELF_SPELL_TEXT_EFFECT_BINDINGS = bloodElfSpellTextEffectMapping.bindings;
