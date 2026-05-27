import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const shamanBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "SHAMAN",
  bindings: [
    {
      auraNames: ["Maelstrom Weapon", "漩涡武器"],
      styleSlug: "thunder_breathing",
      priority: "high",
      minStacks: 5
    },
    {
      auraNames: ["Elemental Mastery", "元素掌握"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Clearcasting", "节能施法", "元素集中"],
      styleSlug: "wind_breathing",
      priority: "high"
    },
    {
      auraNames: ["Tidal Waves", "潮汐奔涌"],
      styleSlug: "water_breathing",
      priority: "high"
    },
    {
      auraNames: ["Lightning Shield", "闪电之盾"],
      styleSlug: "thunder_breathing",
      priority: "low"
    },
    {
      auraNames: ["Water Shield", "水之护盾"],
      styleSlug: "water_breathing",
      priority: "low"
    },
    {
      auraNames: ["Earth Shield", "大地之盾"],
      styleSlug: "stone_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Shamanistic Rage", "萨满之怒"],
      styleSlug: "stone_breathing",
      priority: "high"
    }
  ]
});
