import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const druidBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "DRUID",
  bindings: [
    {
      auraNames: ["Eclipse (Solar)", "Solar Eclipse", "日蚀"],
      styleSlug: "sun_breathing",
      priority: "high"
    },
    {
      auraNames: ["Eclipse (Lunar)", "Lunar Eclipse", "月蚀"],
      styleSlug: "moon_breathing",
      priority: "high"
    },
    {
      auraNames: ["Omen of Clarity", "清晰预兆"],
      styleSlug: "water_breathing",
      priority: "high"
    },
    {
      auraNames: ["Nature's Grace", "自然之赐"],
      styleSlug: "wind_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Savage Roar", "野蛮咆哮"],
      styleSlug: "beast_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Tiger's Fury", "猛虎之怒"],
      styleSlug: "beast_breathing",
      priority: "high"
    },
    {
      auraNames: ["Berserk", "狂暴"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Dash", "急奔"],
      styleSlug: "wind_breathing",
      priority: "high"
    },
    {
      auraNames: ["Barkskin", "树皮术"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Survival Instincts", "生存本能"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Frenzied Regeneration", "狂暴回复"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Tree of Life", "生命之树"],
      styleSlug: "flower_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Innervate", "激活"],
      styleSlug: "water_breathing",
      priority: "high"
    }
  ]
});
