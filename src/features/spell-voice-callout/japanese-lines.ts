/** Metadata for Japanese voice generation; playback uses slug paths only. */
export type SpellVoiceLine = {
  displayText: string;
  styleSlug: string;
  spellSlug: string;
  japaneseText: string;
  readingKana?: string;
  romaji?: string;
};

/** Source-of-truth catalog for TTS / asset generation; extend as voice files are added. */
export const JAPANESE_SPELL_VOICE_LINES: SpellVoiceLine[] = [
  {
    displayText: "月之呼吸 · 穿面斩",
    styleSlug: "moon_breathing",
    spellSlug: "moon_piercing_face_slash",
    japaneseText: "月の呼吸・壱ノ型 穿面斬り",
    readingKana: "つきのこきゅう、いちのかた、せんめんぎり",
    romaji: "Tsuki no kokyu, ichi no kata, Senmen giri"
  },
  {
    displayText: "日之呼吸 · 幻日虹",
    styleSlug: "sun_breathing",
    spellSlug: "sun_fake_rainbow",
    japaneseText: "日の呼吸・幻日虹",
    readingKana: "ひのこきゅう、げんじこう",
    romaji: "Hi no kokyu, Genjiko"
  }
];
