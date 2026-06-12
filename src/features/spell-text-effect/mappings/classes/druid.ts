import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Druid spell text effect mappings (Demon Slayer themed).
 * Source: ds_skills.md — 兽/水/风/炎/月/日/花/虫/岩/霞 呼吸与招式译名.
 */
export const druidSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "DRUID",
  bindings: [
    // Feral cat
    {
      spellNames: ["Shred", "撕碎"],
      displayText: "日之呼吸 · 圆舞一闪"
    },
    {
      spellNames: ["Rake", "斜掠"],
      displayText: "恋之呼吸 · 猫足恋风"
    },
    {
      spellNames: ["Mangle (Cat)", "裂伤（豹）", "裂伤"],
      displayText: "兽之呼吸 · 乱杭咬"
    },
    {
      spellNames: ["Rip", "割裂"],
      displayText: "虫之呼吸 · 蜈蚣之舞"
    },
    {
      spellNames: ["Ferocious Bite", "凶猛撕咬"],
      displayText: "炎之呼吸 · 气炎万象"
    },
    {
      spellNames: ["Swipe (Cat)", "横扫（豹）", "横扫"],
      displayText: "风之呼吸 · 爪爪·科户风"
    },
    {
      spellNames: ["Savage Roar", "野蛮咆哮"],
      displayText: "音之呼吸 · 轰"
    },
    {
      spellNames: ["Tiger's Fury", "猛虎之怒"],
      displayText: "炎之呼吸 · 炎虎"
    },
    {
      spellNames: ["Berserk", "狂暴"],
      displayText: "雷之呼吸 · 火雷神"
    },
    {
      spellNames: ["Dash", "急奔"],
      displayText: "风之呼吸 · 黑风烟岚"
    },
    {
      spellNames: ["Prowl", "潜行"],
      displayText: "霞之呼吸 · 垂天远霞"
    },
    {
      spellNames: ["Faerie Fire (Feral)", "精灵之火（野性）", "精灵之火"],
      displayText: "花之呼吸 · 御影梅"
    },
    // Feral bear / tank
    {
      spellNames: ["Mangle (Bear)", "裂伤（熊）"],
      displayText: "兽之呼吸 · 切细裂"
    },
    {
      spellNames: ["Lacerate", "割伤"],
      displayText: "蛇之呼吸 · 颈蛇双生"
    },
    {
      spellNames: ["Maul", "重殴"],
      displayText: "岩之呼吸 · 蛇纹岩·双极"
    },
    {
      spellNames: ["Swipe (Bear)", "横扫（熊）"],
      displayText: "风之呼吸 · 劲风·天狗风"
    },
    {
      spellNames: ["Growl", "低吼"],
      displayText: "兽之呼吸 · 狂裂"
    },
    {
      spellNames: ["Challenging Roar", "挑战咆哮"],
      displayText: "音之呼吸 · 鸣弦奏奏"
    },
    {
      spellNames: ["Demoralizing Roar", "挫志咆哮"],
      displayText: "风之呼吸 · 晴岚风树"
    },
    {
      spellNames: ["Frenzied Regeneration", "狂暴回复"],
      displayText: "岩之呼吸 · 流纹岩·速征"
    },
    {
      spellNames: ["Survival Instincts", "生存本能"],
      displayText: "岩之呼吸 · 瓦轮刑部"
    },
    // Balance
    {
      spellNames: ["Moonfire", "月火术"],
      displayText: "月之呼吸 · 穿月·宠入道"
    },
    {
      spellNames: ["Starfire", "星火术"],
      displayText: "炎之呼吸 · 升炎天"
    },
    {
      spellNames: ["Wrath", "愤怒"],
      displayText: "雷之呼吸 · 稻魂"
    },
    {
      spellNames: ["Insect Swarm", "虫群"],
      displayText: "虫之呼吸 · 蝶之舞"
    },
    {
      spellNames: ["Starfall", "星辰坠落"],
      displayText: "日之呼吸 · 日晕之龙·头舞"
    },
    {
      spellNames: ["Hurricane", "飓风"],
      displayText: "风之呼吸 · 升上沙尘岚"
    },
    {
      spellNames: ["Typhoon", "台风"],
      displayText: "风之呼吸 · 初烈风斩"
    },
    {
      spellNames: ["Force of Nature", "自然之力"],
      displayText: "花之呼吸 · 涡桃"
    },
    // Restoration
    {
      spellNames: ["Healing Touch", "治疗之触"],
      displayText: "花之呼吸 · 徒之芍药"
    },
    {
      spellNames: ["Regrowth", "愈合"],
      displayText: "花之呼吸 · 红花衣"
    },
    {
      spellNames: ["Rejuvenation", "回春术"],
      displayText: "水之呼吸 · 干天之慈雨"
    },
    {
      spellNames: ["Lifebloom", "生命绽放"],
      displayText: "花之呼吸 · 彼岸朱眼"
    },
    {
      spellNames: ["Wild Growth", "野性成长"],
      displayText: "水之呼吸 · 生生流转"
    },
    {
      spellNames: ["Nourish", "滋养"],
      displayText: "水之呼吸 · 水面斩"
    },
    {
      spellNames: ["Tranquility", "宁静"],
      displayText: "水之呼吸 · 凪"
    },
    {
      spellNames: ["Swiftmend", "迅捷治愈"],
      displayText: "水之呼吸 · 泷壶"
    },
    {
      spellNames: ["Innervate", "激活"],
      displayText: "水之呼吸 · 流流舞动"
    },
    // Shared utility & defensives
    {
      spellNames: ["Entangling Roots", "纠缠根须"],
      displayText: "水之呼吸 · 扭转漩涡"
    },
    {
      spellNames: ["Cyclone", "旋风"],
      displayText: "风之呼吸 · 尘旋风·削"
    },
    {
      spellNames: ["Hibernate", "安抚动物"],
      displayText: "霞之呼吸 · 八重霞"
    },
    {
      spellNames: ["Barkskin", "树皮术"],
      displayText: "岩之呼吸 · 岩躯之肤"
    },
    {
      spellNames: ["Thorns", "荆棘术"],
      displayText: "花之呼吸 · 雫波纹击刺"
    },
    {
      spellNames: ["Rebirth", "复生"],
      displayText: "日之呼吸 · 圆舞"
    }
  ]
});

export const DRUID_SPELL_TEXT_EFFECT_BINDINGS = druidSpellTextEffectMapping.bindings;
