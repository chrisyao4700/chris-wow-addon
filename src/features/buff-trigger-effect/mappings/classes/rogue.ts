import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const rogueBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "ROGUE",
  bindings: [
    {
      auraNames: ["Slice and Dice", "切割"],
      styleSlug: "beast_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Evasion", "闪避"],
      styleSlug: "mist_breathing",
      priority: "high"
    },
    {
      auraNames: ["Sprint", "疾跑"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Vanish", "消失"],
      styleSlug: "mist_breathing",
      priority: "high"
    },
    {
      auraNames: ["Overkill", "灭绝"],
      styleSlug: "serpent_breathing",
      priority: "high"
    },
    {
      auraNames: ["Master of Subtlety", "狡诈大师"],
      styleSlug: "mist_breathing",
      priority: "high"
    },
    {
      auraNames: ["Adrenaline Rush", "冲动"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Blade Flurry", "剑刃乱舞"],
      styleSlug: "beast_breathing",
      priority: "high"
    },
    {
      auraNames: ["Cold Blood", "冷血"],
      styleSlug: "insect_breathing",
      priority: "high"
    }
  ]
});
