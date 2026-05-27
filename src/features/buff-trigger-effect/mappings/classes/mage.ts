import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const mageBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "MAGE",
  bindings: [
    {
      auraNames: ["Hot Streak", "炽热连击"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Combustion", "燃烧"],
      styleSlug: "flame_breathing",
      priority: "high"
    },
    {
      auraNames: ["Icy Veins", "冰冷血脉"],
      styleSlug: "water_breathing",
      priority: "high"
    },
    {
      auraNames: ["Fingers of Frost", "寒冰指"],
      styleSlug: "mist_breathing",
      priority: "high"
    },
    {
      auraNames: ["Brain Freeze", "冰冷智慧"],
      styleSlug: "mist_breathing",
      priority: "high"
    },
    {
      auraNames: ["Arcane Power", "奥术强化"],
      styleSlug: "thunder_breathing",
      priority: "high"
    },
    {
      auraNames: ["Ice Barrier", "寒冰护体"],
      styleSlug: "moon_breathing",
      priority: "normal"
    }
  ]
});
