import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Rogue spell text effect mappings (Demon Slayer themed).
 * Source: ds_skills.md — 兽/蛇/虫/霞/雷/恋/音/风/岩 呼吸与招式译名.
 * Includes 时光服 additions: 转嫁, 刀扇 (20级), 嫁祸诀窍 rework.
 */
export const rogueSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "ROGUE",
  bindings: [
    // Assassination / Combat builders & finishers
    {
      spellNames: ["Sinister Strike", "邪恶攻击", "影袭"],
      displayText: "兽之呼吸 · 切裂"
    },
    {
      spellNames: ["Mutilate", "毁伤"],
      displayText: "兽之呼吸 · 啮裂"
    },
    {
      spellNames: ["Backstab", "背刺"],
      displayText: "蛇之呼吸 · 狭头毒牙"
    },
    {
      spellNames: ["Hemorrhage", "出血"],
      displayText: "虫之呼吸 · 蜂牙之舞"
    },
    {
      spellNames: ["Ghostly Strike", "鬼魅攻击"],
      displayText: "月之呼吸 · 穿面斩"
    },
    {
      spellNames: ["Eviscerate", "刺骨"],
      displayText: "兽之呼吸 · 狂裂"
    },
    {
      spellNames: ["Envenom", "毒伤"],
      displayText: "虫之呼吸 · 蜻蛉之舞"
    },
    {
      spellNames: ["Rupture", "割裂"],
      displayText: "虫之呼吸 · 百足蛇腹"
    },
    {
      spellNames: ["Deadly Throw", "致命投掷"],
      displayText: "兽之呼吸 · 投裂"
    },
    {
      spellNames: ["Slice and Dice", "切割"],
      displayText: "兽之呼吸 · 圆转旋牙"
    },
    {
      spellNames: ["Expose Armor", "破甲"],
      displayText: "风之呼吸 · 升上沙尘岚"
    },
    {
      spellNames: ["Shiv", "毒刃"],
      displayText: "虫之呼吸 · 真靡"
    },
    {
      spellNames: ["Hunger for Blood", "血之饥渴"],
      displayText: "兽之呼吸 · 伸·蜿裂"
    },
    // Subtlety openers & control
    {
      spellNames: ["Ambush", "伏击"],
      displayText: "蛇之呼吸 · 委蛇斩"
    },
    {
      spellNames: ["Garrote", "绞喉"],
      displayText: "蛇之呼吸 · 巢绞"
    },
    {
      spellNames: ["Cheap Shot", "偷袭"],
      displayText: "霞之呼吸 · 霞散飞沫"
    },
    {
      spellNames: ["Premeditation", "预谋"],
      displayText: "恋之呼吸 · 初恋战栗"
    },
    {
      spellNames: ["Kidney Shot", "肾击"],
      displayText: "雷之呼吸 · 霹雳一闪"
    },
    {
      spellNames: ["Gouge", "凿击"],
      displayText: "虫之呼吸 · 蝶之舞"
    },
    {
      spellNames: ["Blind", "致盲"],
      displayText: "虫之呼吸 · 戏弄"
    },
    {
      spellNames: ["Sap", "闷棍"],
      displayText: "霞之呼吸 · 八重霞"
    },
    {
      spellNames: ["Riposte", "还击"],
      displayText: "蛇之呼吸 · 颈蛇双生"
    },
    // Cooldowns & burst
    {
      spellNames: ["Cold Blood", "冷血"],
      displayText: "恋之呼吸 · 摇曳恋情·乱爪"
    },
    {
      spellNames: ["Adrenaline Rush", "冲动"],
      displayText: "雷之呼吸 · 远雷"
    },
    {
      spellNames: ["Blade Flurry", "剑刃乱舞"],
      displayText: "兽之呼吸 · 切细裂"
    },
    {
      spellNames: ["Killing Spree", "杀戮盛宴"],
      displayText: "雷之呼吸 · 霹雳一闪·八连"
    },
    {
      spellNames: ["Shadow Dance", "暗影之舞"],
      displayText: "月之呼吸 · 月虹·片割之月"
    },
    {
      spellNames: ["Preparation", "伺机待发"],
      displayText: "风之呼吸 · 尘旋风·削"
    },
    {
      spellNames: ["Shadowstep", "暗影步"],
      displayText: "兽之呼吸 · 穿刺"
    },
    // 时光服: 转嫁 (40), 刀扇 (20), 嫁祸诀窍 rework
    {
      spellNames: ["Redirect", "转嫁"],
      displayText: "兽之呼吸 · 空间识觉"
    },
    {
      spellNames: ["Fan of Knives", "刀扇"],
      displayText: "音之呼吸 · 鸣弦奏奏"
    },
    {
      spellNames: ["Tricks of the Trade", "嫁祸诀窍"],
      displayText: "音之呼吸 · 响斩无间"
    },
    // Stealth & mobility
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
      spellNames: ["Cloak of Shadows", "暗影斗篷"],
      displayText: "恋之呼吸 · 懊恼巡恋"
    },
    {
      spellNames: ["Safe Fall", "安全降落"],
      displayText: "水之呼吸 · 泷壶"
    },
    // Utility & interrupts
    {
      spellNames: ["Kick", "脚踢"],
      displayText: "岩之呼吸 · 天面碎"
    },
    {
      spellNames: ["Dismantle", "拆卸"],
      displayText: "风之呼吸 · 初烈风斩"
    },
    {
      spellNames: ["Feint", "佯攻"],
      displayText: "风之呼吸 · 韦驮天台风"
    },
    {
      spellNames: ["Distract", "扰乱"],
      displayText: "恋之呼吸 · 猫足恋风"
    },
    {
      spellNames: ["Pick Pocket", "偷窃"],
      displayText: "恋之呼吸 · 恋猫时雨"
    }
  ]
});

export const ROGUE_SPELL_TEXT_EFFECT_BINDINGS = rogueSpellTextEffectMapping.bindings;
