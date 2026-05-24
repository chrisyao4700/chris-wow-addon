export type SpellAnimationSlug = {
  styleSlug: string;
  spellSlug: string;
};

const DISPLAY_TEXT_TO_SLUG: Record<string, SpellAnimationSlug> = {
  "水之呼吸 · 水面斩": { styleSlug: "water_breathing", spellSlug: "water_surface_slash" },
  "风之呼吸 · 投刃": { styleSlug: "wind_breathing", spellSlug: "wind_throwing_blade" },
  "雷之呼吸 · 鸣神": { styleSlug: "thunder_breathing", spellSlug: "thunder_narukami" },
  "兽之呼吸 · 切裂": { styleSlug: "beast_breathing", spellSlug: "beast_cutting_rend" },
  "蛇之呼吸 · 狭头毒牙": { styleSlug: "serpent_breathing", spellSlug: "serpent_narrow_head_venom_fang" },
  "兽之呼吸 · 狂裂": { styleSlug: "beast_breathing", spellSlug: "beast_wild_rend" },
  "蛇之呼吸 · 委蛇斩": { styleSlug: "serpent_breathing", spellSlug: "serpent_meandering_slash" },
  "蛇之呼吸 · 巢绞": { styleSlug: "serpent_breathing", spellSlug: "serpent_nest_strangle" },
  "虫之呼吸 · 百足蛇腹": { styleSlug: "insect_breathing", spellSlug: "insect_centipede_belly" },
  "虫之呼吸 · 蜂牙之舞": { styleSlug: "insect_breathing", spellSlug: "insect_bee_fang_dance" },
  "兽之呼吸 · 圆转旋牙": { styleSlug: "beast_breathing", spellSlug: "beast_circular_spinning_fang" },
  "雷之呼吸 · 霹雳一闪": { styleSlug: "thunder_breathing", spellSlug: "thunder_thunderclap_flash" },
  "霞之呼吸 · 胧": { styleSlug: "mist_breathing", spellSlug: "mist_oboro" },
  "霞之呼吸 · 霞散飞沫": { styleSlug: "mist_breathing", spellSlug: "mist_scattering_splash" },
  "月之呼吸 · 穿面斩": { styleSlug: "moon_breathing", spellSlug: "moon_piercing_face_slash" },
  "霞之呼吸 · 垂天远霞": { styleSlug: "mist_breathing", spellSlug: "mist_distant_heaven_haze" },
  "霞之呼吸 · 月之霞消": { styleSlug: "mist_breathing", spellSlug: "mist_lunar_haze_dissolve" },
  "雷之呼吸 · 神速": { styleSlug: "thunder_breathing", spellSlug: "thunder_godspeed" },
  "日之呼吸 · 幻日虹": { styleSlug: "sun_breathing", spellSlug: "sun_fake_rainbow" },
  "虫之呼吸 · 蝶之舞": { styleSlug: "insect_breathing", spellSlug: "insect_butterfly_dance" },
  "岩之呼吸 · 天面碎": { styleSlug: "stone_breathing", spellSlug: "stone_sky_surface_smash" },
  "虫之呼吸 · 戏弄": { styleSlug: "insect_breathing", spellSlug: "insect_tease" },
  "霞之呼吸 · 八重霞": { styleSlug: "mist_breathing", spellSlug: "mist_eightfold_mist" },
  "血鬼术 · 魔力紊乱": { styleSlug: "blood_art_core", spellSlug: "blood_art_mana_disruption" }
};

export function resolveSpellAnimationSlug(displayText: string): SpellAnimationSlug | undefined {
  return DISPLAY_TEXT_TO_SLUG[displayText];
}
