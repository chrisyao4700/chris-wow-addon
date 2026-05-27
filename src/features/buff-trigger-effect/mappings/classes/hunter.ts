import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const hunterBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "HUNTER",
  bindings: [
    {
      auraNames: ["Bestial Wrath", "狂野怒火"],
      styleSlug: "beast_breathing",
      priority: "high"
    },
    {
      auraNames: ["Rapid Fire", "急速射击"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Lock and Load", "荷枪实弹"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Deterrence", "威慑"],
      styleSlug: "wind_breathing",
      priority: "high"
    },
    {
      auraNames: ["Aspect of the Hawk", "雄鹰守护"],
      styleSlug: "wind_breathing",
      priority: "low"
    },
    {
      auraNames: ["Master's Call", "主人的召唤"],
      styleSlug: "serpent_breathing",
      priority: "normal"
    }
  ]
});
