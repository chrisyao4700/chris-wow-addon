import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const priestBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "PRIEST",
  bindings: [
    {
      auraNames: ["Power Infusion", "能量灌注", "能量注入"],
      styleSlug: "sun_breathing",
      priority: "high"
    },
    {
      auraNames: ["Inner Focus", "心灵专注"],
      styleSlug: "flower_breathing",
      priority: "high"
    },
    {
      auraNames: ["Surge of Light", "圣光涌动"],
      styleSlug: "flower_breathing",
      priority: "high"
    },
    {
      auraNames: ["Borrowed Time", "争分夺秒"],
      styleSlug: "water_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Shadowform", "暗影形态"],
      styleSlug: "moon_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Vampiric Embrace", "吸血鬼的拥抱"],
      styleSlug: "blood_art",
      priority: "normal"
    },
    {
      auraNames: ["Pain Suppression", "痛苦压制"],
      styleSlug: "water_breathing",
      priority: "high"
    },
    {
      auraNames: ["Guardian Spirit", "守护之魂"],
      styleSlug: "love_breathing",
      priority: "high"
    }
  ]
});
