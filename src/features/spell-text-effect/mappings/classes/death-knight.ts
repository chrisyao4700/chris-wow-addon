import { defineClassSpellTextMapping } from "../class-mapping-file";

/**
 * Death Knight spell text effect mappings (Demon Slayer themed).
 * Each callout is unique vs rogue and other classes — sourced from ds_skills.md
 * (unused breathing forms, 血鬼术 techniques, moon sword forms).
 */
export const deathKnightSpellTextEffectMapping = defineClassSpellTextMapping({
  classFileName: "DEATHKNIGHT",
  bindings: [
    // Blood
    {
      spellNames: ["Death Strike", "死亡打击", "灵界打击"],
      displayText: "日之呼吸 · 圆舞"
    },
    {
      spellNames: ["Heart Strike", "心脏打击"],
      displayText: "炎之呼吸 · 炎虎"
    },
    {
      spellNames: ["Blood Strike", "鲜血打击"],
      displayText: "日之呼吸 · 幻日虹"
    },
    {
      spellNames: ["Blood Boil", "血沸"],
      displayText: "血鬼术 · 爆血"
    },
    {
      spellNames: ["Rune Tap", "符文分流"],
      displayText: "岩之呼吸 · 岩躯之肤"
    },
    {
      spellNames: ["Vampiric Blood", "吸血鬼之血"],
      displayText: "血鬼术 · 跋弧跳梁"
    },
    {
      spellNames: ["Mark of Blood", "鲜血印记", "血液标记"],
      displayText: "血鬼术 · 圆斩旋回·飞血镰"
    },
    {
      spellNames: ["Dancing Rune Weapon", "符文武器", "符文刃舞"],
      displayText: "月之呼吸 · 珠华弄月"
    },
    {
      spellNames: ["Rune Strike", "符文打击"],
      displayText: "雷之呼吸 · 电轰雷轰"
    },
    // Frost
    {
      spellNames: ["Obliterate", "湮灭", "湮没", "副手湮灭"],
      displayText: "月之呼吸 · 凶变·天满纤月"
    },
    {
      spellNames: ["Frost Strike", "冰霜打击"],
      displayText: "霞之呼吸 · 移流斩"
    },
    {
      spellNames: ["Howling Blast", "凛风冲击"],
      displayText: "霞之呼吸 · 霞海之海"
    },
    {
      spellNames: ["Icy Touch", "冰冷触摸"],
      displayText: "霞之呼吸 · 月之霞消"
    },
    {
      spellNames: ["Hungering Cold", "饥饿之寒"],
      displayText: "风之呼吸 · 木枯风袭"
    },
    {
      spellNames: ["Horn of Winter", "寒冬号角"],
      displayText: "风之呼吸 · 晴岚风树"
    },
    {
      spellNames: ["Chains of Ice", "寒冰锁链"],
      displayText: "水之呼吸 · 水车"
    },
    {
      spellNames: ["Icebound Fortitude", "冰封之韧"],
      displayText: "岩之呼吸 · 蛇纹岩·双极"
    },
    {
      spellNames: ["Unbreakable Armor", "铜墙铁壁"],
      displayText: "岩之呼吸 · 岩躯之肤"
    },
    // Unholy
    {
      spellNames: ["Scourge Strike", "天灾打击"],
      displayText: "血鬼术 · 破坏杀·灭式"
    },
    {
      spellNames: ["暗影打击", "Shadow Strike"],
      displayText: "蛇之呼吸 · 蜿蜿长蛇"
    },
    {
      spellNames: ["Plague Strike", "瘟疫打击"],
      displayText: "虫之呼吸 · 蜂牙之舞·真靡"
    },
    {
      spellNames: ["Pestilence", "传染"],
      displayText: "虫之呼吸 · 蜻蛉之舞·复眼六角"
    },
    {
      spellNames: ["Unholy Blight", "邪恶蔓延"],
      displayText: "血鬼术 · 蔓莲华"
    },
    {
      spellNames: ["Raise Dead", "亡者复生", "复活食尸鬼"],
      displayText: "血鬼术 · 生物操纵"
    },
    {
      spellNames: ["Army of the Dead", "亡者大军"],
      displayText: "血鬼术 · 憎珀天"
    },
    {
      spellNames: ["Ghoul Frenzy", "食尸鬼狂乱"],
      displayText: "兽之呼吸 · 爆裂猛进"
    },
    {
      spellNames: ["Summon Gargoyle", "召唤石像鬼"],
      displayText: "风之呼吸 · 劲风·天狗风"
    },
    {
      spellNames: ["Corpse Explosion", "邪爆", "尸体爆炸"],
      displayText: "音之呼吸 · 轰"
    },
    // Shared utility
    {
      spellNames: ["Death Grip", "死亡之握"],
      displayText: "血鬼术 · 红洁之矢"
    },
    {
      spellNames: ["Death Coil", "死亡缠绕", "凋零缠绕"],
      displayText: "月之呼吸 · 厌忌月·销蚀"
    },
    {
      spellNames: ["Death and Decay", "死亡凋零", "枯萎凋零", "死亡与腐朽"],
      displayText: "血鬼术 · 无间业树"
    },
    {
      spellNames: ["Dark Command", "黑暗命令"],
      displayText: "血鬼术 · 破坏杀·罗针"
    },
    {
      spellNames: ["Anti-Magic Shell", "反魔法护罩"],
      displayText: "血鬼术 · 惑血·融通无碍之香"
    },
    {
      spellNames: ["Strangulate", "绞袭"],
      displayText: "血鬼术 · 刻丝轮转"
    },
    {
      spellNames: ["Mind Freeze", "心灵冰冻"],
      displayText: "水之呼吸 · 打潮"
    },
    {
      spellNames: ["Death Pact", "死亡契约", "死神契约"],
      displayText: "血鬼术 · 黑血枳棘"
    },
    {
      spellNames: ["Bone Shield", "白骨之盾"],
      displayText: "岩之呼吸 · 瓦轮刑部"
    },
    {
      spellNames: ["Lichborne", "巫妖之躯"],
      displayText: "岩之呼吸 · 流纹岩·速征"
    },
    {
      spellNames: ["Blood Tap", "活力分流"],
      displayText: "血鬼术 · 魔力紊乱"
    },
    {
      spellNames: ["Empower Rune Weapon", "符文武器增效"],
      displayText: "血鬼术 · 破坏杀·鬼芯八重芯"
    }
  ]
});

export const DEATH_KNIGHT_SPELL_TEXT_EFFECT_BINDINGS = deathKnightSpellTextEffectMapping.bindings;
