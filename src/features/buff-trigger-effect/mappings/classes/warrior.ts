import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const warriorBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "WARRIOR",
  bindings: [
    {
      auraNames: ["Enrage", "激怒"],
      styleSlug: "beast_breathing",
      priority: "high"
    },
    {
      auraNames: ["Shield Block", "盾牌格挡"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Last Stand", "破釜沉舟"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Recklessness", "鲁莽"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Death Wish", "死亡之愿"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Battle Shout", "战斗怒吼"],
      styleSlug: "sound_breathing",
      priority: "low"
    }
  ]
});
