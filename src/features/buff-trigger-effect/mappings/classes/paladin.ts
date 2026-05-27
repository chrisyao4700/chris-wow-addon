import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const paladinBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "PALADIN",
  bindings: [
    {
      auraNames: ["Avenging Wrath", "复仇之怒"],
      styleSlug: "sun_breathing",
      priority: "high"
    },
    {
      auraNames: ["Divine Shield", "圣盾术"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Divine Protection", "圣佑术"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Holy Shield", "神圣之盾"],
      styleSlug: "sun_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Sacred Shield", "圣洁护盾"],
      styleSlug: "love_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Art of War", "战争艺术"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Infusion of Light", "圣光灌注"],
      styleSlug: "sun_breathing",
      priority: "high"
    },
    {
      auraNames: ["Divine Plea", "神圣恳求"],
      styleSlug: "water_breathing",
      priority: "normal"
    }
  ]
});
