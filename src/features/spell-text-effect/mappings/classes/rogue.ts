import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Rogue spell text effect mappings (Demon Slayer themed).
 * Source: ds_skills.md — 兽/蛇/虫/霞/雷/日 呼吸与招式译名.
 * Update this file only when adding or changing Rogue skill overlays.
 */
export const rogueSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "ROGUE",
  bindings: [
    {
      spellNames: ["Sinister Strike", "邪恶攻击", "影袭"],
      displayText: "兽之呼吸 · 切裂"
    },
    {
      spellNames: ["Backstab", "背刺"],
      displayText: "蛇之呼吸 · 狭头毒牙"
    },
    {
      spellNames: ["Eviscerate", "刺骨"],
      displayText: "兽之呼吸 · 狂裂"
    },
    {
      spellNames: ["Ambush", "伏击"],
      displayText: "蛇之呼吸 · 委蛇斩"
    },
    {
      spellNames: ["Garrote", "绞喉"],
      displayText: "蛇之呼吸 · 巢绞"
    },
    {
      spellNames: ["Rupture", "割裂"],
      displayText: "虫之呼吸 · 百足蛇腹"
    },
    {
      spellNames: ["Hemorrhage", "出血"],
      displayText: "虫之呼吸 · 蜂牙之舞"
    },
    {
      spellNames: ["Slice and Dice", "切割"],
      displayText: "兽之呼吸 · 圆转旋牙"
    },
    {
      spellNames: ["Kidney Shot", "肾击"],
      displayText: "雷之呼吸 · 霹雳一闪"
    },
    {
      spellNames: ["Cheap Shot", "偷袭"],
      displayText: "霞之呼吸 · 霞散飞沫"
    },
    {
      spellNames: ["Ghostly Strike", "鬼魅攻击"],
      displayText: "月之呼吸 · 穿面斩"
    },
    {
      spellNames: ["Stealth", "潜行"],
      displayText: "霞之呼吸 · 垂天远霞"
    },
    {
      spellNames: ["Vanish", "消失"],
      displayText: "霞之呼吸 · 月之霞消"
    },
    {
      spellNames: ["Sprint", "疾跑"],
      displayText: "雷之呼吸 · 神速"
    },
    {
      spellNames: ["Evasion", "闪避"],
      displayText: "霞之呼吸 · 胧"
    },
    {
      spellNames: ["Gouge", "凿击"],
      displayText: "虫之呼吸 · 蝶之舞"
    },
    {
      spellNames: ["Kick", "脚踢"],
      displayText: "岩之呼吸 · 天面碎"
    },
    {
      spellNames: ["Blind", "致盲"],
      displayText: "虫之呼吸 · 戏弄"
    },
    {
      spellNames: ["Sap", "闷棍"],
      displayText: "霞之呼吸 · 八重霞"
    }
  ]
});

export const ROGUE_SPELL_TEXT_EFFECT_BINDINGS = rogueSpellTextEffectMapping.bindings;
