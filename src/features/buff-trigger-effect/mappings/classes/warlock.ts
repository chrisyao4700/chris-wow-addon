import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const warlockBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "WARLOCK",
  bindings: [
    {
      auraNames: ["Molten Core", "熔火之心"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Decimation", "灭杀"],
      styleSlug: "blood_art",
      priority: "high"
    },
    {
      auraNames: ["Nightfall", "夜幕"],
      styleSlug: "moon_breathing",
      priority: "high"
    },
    {
      auraNames: ["Metamorphosis", "恶魔变形"],
      styleSlug: "blood_art",
      priority: "high"
    },
    {
      auraNames: ["Soul Link", "灵魂链接"],
      styleSlug: "serpent_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Fel Armor", "邪甲术"],
      styleSlug: "insect_breathing",
      priority: "normal"
    }
  ]
});
