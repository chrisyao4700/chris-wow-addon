import { defineClassBuffTriggerMapping } from "../class-mapping-file";

export const deathKnightBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "DEATHKNIGHT",
  bindings: [
    {
      auraNames: ["Killing Machine", "杀戮机器"],
      styleSlug: "moon_breathing",
      priority: "high"
    },
    {
      auraNames: ["Freezing Fog", "白霜", "冰封之雾", "冰冻之雾"],
      auraIds: [59052],
      styleSlug: "mist_breathing",
      priority: "high",
      note: "Frost DK Rime proc"
    },
    {
      auraNames: ["Bone Shield", "白骨之盾"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Vampiric Blood", "吸血鬼之血"],
      styleSlug: "blood_art",
      priority: "high"
    },
    {
      auraNames: ["Icebound Fortitude", "冰封之韧"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Unbreakable Armor", "铜墙铁壁"],
      styleSlug: "stone_breathing",
      priority: "high"
    },
    {
      auraNames: ["Dancing Rune Weapon", "符文刃舞", "符文武器"],
      styleSlug: "moon_breathing",
      priority: "high"
    },
    {
      auraNames: ["Lichborne", "巫妖之躯"],
      styleSlug: "beast_breathing",
      priority: "normal"
    },
    {
      auraNames: ["Blood Tap"],
      auraIds: [45529],
      styleSlug: "blood_art",
      priority: "normal",
      note: "Blood Tap only; 鲜血灵气 is Blood Presence (stance) and must not map here"
    }
  ]
});
