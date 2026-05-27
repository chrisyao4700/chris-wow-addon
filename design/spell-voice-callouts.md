# Demon Slayer Japanese Voice Callouts

Date: 2026-05-24  
Status: design draft  
Feature goal: when the player successfully casts a mapped WoW spell, play a short Japanese voice line for the mapped Demon Slayer skill name, synchronized with the existing spell text and animation callout.

## Summary Recommendation

Build this as a bundled audio-asset feature, not runtime TTS. WoW addons can reliably play pre-existing addon audio files with `PlaySoundFile`, but those files need to be present before login or `/reload`. The clean first version should:

1. Reuse the existing spell cast pipeline in `src/features/spell-text-effect/index.ts`.
2. Reuse the existing `displayText -> { styleSlug, spellSlug }` resolver from `src/features/spell-animation-effect/spell-slugs.ts`.
3. Add a new feature module, tentatively `src/features/spell-voice-callout/`, responsible only for audio lookup, duplicate throttling, and playback.
4. Store generated Japanese voice files under `assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg`.
5. Copy `assets/spell-voices` into `dist/SlayerUI/assets/spell-voices` during build.
6. Add a settings toggle, enabled by default only if we are comfortable with sound-on-cast as part of the existing spell effect feature. My recommendation: create a separate `enableSpellVoiceCallouts` setting so players can keep visuals without voice spam.

## Naming And Path Contract

Sound assets must follow the same slug taxonomy as spell effect assets, with one important WoW API difference: sound paths include the file extension at runtime.

Canonical source path:

```text
assets/spell-voices/<locale>/<style_slug>/<spell_slug>.ogg
```

Canonical packaged path:

```text
dist/SlayerUI/assets/spell-voices/<locale>/<style_slug>/<spell_slug>.ogg
```

Canonical runtime path:

```text
Interface\AddOns\SlayerUI\assets\spell-voices\<locale>\<style_slug>\<spell_slug>.ogg
```

Rules:

- `<locale>` is a lowercase language folder; v1 uses `ja`.
- `<style_slug>` and `<spell_slug>` must come directly from `src/features/spell-animation-effect/spell-slugs.ts`.
- Slugs must be lowercase ASCII snake_case only: `a-z`, `0-9`, and `_`.
- Do not use spaces, uppercase letters, hyphens, Chinese/Japanese characters, or punctuation inside `style_slug` or `spell_slug`.
- The fixed folder name `spell-voices` is the only hyphenated path segment in the source/runtime asset path.
- File extension must be lowercase `.ogg`.
- There is exactly one v1 Japanese voice file per resolved spell slug. Future variants should use a separate manifest field or a suffix convention such as `<spell_slug>__01.ogg`; do not introduce variants in v1.

This contract is intentionally parallel to the existing effect asset structure:

```text
assets/spell-effects/<style_slug>/spells/<spell_slug>/<spell_slug>_text_main.tga
assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg
```

Texture runtime paths are resolved by the texture loader and can omit `.tga`; voice runtime paths are passed to `PlaySoundFile` and must include `.ogg`.

## External Research

### WoW Sound API

Warcraft Wiki documents `PlaySoundFile(sound [, channel])`, where `sound` can be an addon file path and both `.ogg` and `.mp3` are accepted. It also notes that addon sound files must exist before logging in or reloading, and shows the canonical path style:

```lua
PlaySoundFile("Interface\\AddOns\\MyAddOn\\mysound.ogg", "Master")
```

Source: https://warcraft.wiki.gg/wiki/API_PlaySoundFile

Design implication for Slayer UI: generated voice files must be copied to the addon folder, then the player must `/reload` before newly added files can play.

### BigWigs Voice

`BigWigs_Voice` is a very close model for this feature. Its core implementation is intentionally tiny: it formats a path like `Interface\AddOns\BigWigs_Voice\Sounds\<key>.ogg`, plays it on the `Master` channel, and falls back to the normal BigWigs sound event if `PlaySoundFile` returns false.

Source: https://raw.githubusercontent.com/BigWigsMods/BigWigs_Voice/master/Core.lua

Design implication for Slayer UI: use deterministic keys and a simple path builder. Missing audio should not break the cast effect; it should quietly no-op or fall back to visuals only.

### DBM Sound and Voice Packs

DBM has a richer sound abstraction. Its defaults include `UseSoundChannel = "Master"`, it supports built-in FileDataIDs and external addon paths, it has a silent mode, it validates custom paths, and it fires a `DBM_PlaySound` event after playback.

Sources:

- https://raw.githubusercontent.com/DeadlyBossMods/DeadlyBossMods/master/DBM-Core/DBM-Core.lua
- https://github-wiki-see.page/m/DeadlyBossMods/DeadlyBossMods/wiki/ReadMe%3A-Voice-Pack-Authors
- https://raw.githubusercontent.com/DeadlyBossMods/DeadlyBossMods/master/DBM-Core/VoicePackSounds.lua

Design implications for Slayer UI:

- A dedicated setting matters; players expect audio features to be independently controllable.
- Voice assets should be versioned by file presence and package version, not by assuming every mapped spell has a voice line.
- Missing files are normal during incremental content work, so runtime status should report missing voice assets but never fail the visual effect.
- `Master` is the practical default for important voice prompts, but a future channel option could support `Master`, `Dialog`, and `SFX`.

### LibSharedMedia and Custom Sound Ecosystem

LibSharedMedia-based addons register sounds by a user-facing key and a file path. This is useful for configurable sound libraries, but not necessary for Slayer UI v1 because these are first-party voice lines tied to our own spell slugs.

Sources:

- https://www.wowace.com/projects/libsharedmedia-3-0/pages
- https://www.wowace.com/projects/sharedmedia/issues/10

Design implication for Slayer UI: skip LibSharedMedia for v1. Keep a narrow internal resolver. Revisit shared-media registration only if we want other addons or user configs to select these voice lines.

## Current Local Architecture

The existing visual feature already gives us the right event boundary:

```text
WoW cast event
  -> src/features/spell-text-effect/index.ts
  -> spellTextRegistry.resolveDisplayText(spellId, spellName)
  -> displayText
  -> tryShowSpellAnimationEffect(displayText)
  -> fallback showTextEffect(displayText)
```

The cast events are already filtered to player casts:

- Preferred: `UNIT_SPELLCAST_SUCCEEDED`
- Fallback: `COMBAT_LOG_EVENT_UNFILTERED` with `SPELL_CAST_SUCCESS` and player GUID check

The same code also has duplicate suppression before the visual effect path, so voice playback can share the same trigger and avoid double-playing when both unit and combat-log paths exist.

The current display text catalog already maps Chinese labels to stable slugs:

```ts
resolveSpellAnimationSlug("水之呼吸 · 水面斩")
// { styleSlug: "water_breathing", spellSlug: "water_surface_slash" }
```

For voice, the slug pair should be the runtime asset key. The Japanese title is generation metadata, not required at playback time.

## Proposed Asset Layout

```text
assets/
  spell-voices/
    ja/
      water_breathing/
        water_surface_slash.ogg
        water_striking_tide.ogg
      thunder_breathing/
        thunder_narukami.ogg
      beast_breathing/
        beast_cutting_rend.ogg
```

The build output must preserve the same subtree:

```text
dist/
  SlayerUI/
    assets/
      spell-voices/
        ja/
          <style_slug>/
            <spell_slug>.ogg
```

Runtime path:

```text
Interface\AddOns\SlayerUI\assets\spell-voices\ja\<style_slug>\<spell_slug>.ogg
```

Reasons for this layout:

- `ja` leaves room for future `zhCN`, `en`, or alternate voice packs.
- `style_slug/spell_slug` matches the current effect asset taxonomy.
- One file per skill is enough for v1; multiple variants can later become `<spell_slug>__01.ogg` or a manifest field.
- `.ogg` is the preferred default: compact, accepted by WoW, and common in WoW addon sound packs.

## Voice Line Catalog

We need one explicit source of truth for Japanese voice generation. The repo already has Japanese names and readings in `design/ds_skills.md`, for example:

```text
水之呼吸 · 水面斩
日文名: 水面斬り
读音: みなもぎり
```

Recommended runtime/generation metadata:

```ts
export type SpellVoiceLine = {
  displayText: string;
  styleSlug: string;
  spellSlug: string;
  japaneseText: string;
  readingKana?: string;
  romaji?: string;
};
```

The voice line spoken text should normally include both breathing style and move name:

```text
水の呼吸・壱ノ型 水面斬り
Mizu no kokyu, ichi no kata, Minamo giri
```

For non-numbered or non-breathing techniques:

```text
血鬼術・爆血
Kekkijutsu, Bakketsu
```

Important rule: the playable audio must be original generated TTS or original recorded voice. Do not rip anime, game, or actor clips.

## Proposed Runtime Module

Tentative file tree:

```text
src/features/spell-voice-callout/
  assets.ts
  controller.ts
  index.ts
  japanese-lines.ts
```

### `assets.ts`

Responsibilities:

- Build a voice asset path from `{ styleSlug, spellSlug }`.
- Optionally consult a generated manifest so status output can report bundled voice files without trying to play them.

Example:

```ts
const SPELL_VOICE_ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\spell-voices`;

export function getJapaneseSpellVoicePath(styleSlug: string, spellSlug: string): string {
  return `${SPELL_VOICE_ASSET_ROOT}\\ja\\${styleSlug}\\${spellSlug}.ogg`;
}
```

### `controller.ts`

Responsibilities:

- Check `enableSpellVoiceCallouts`.
- Resolve `displayText` to slugs using `resolveSpellAnimationSlug`.
- Play the `.ogg` via `PlaySoundFile(path, "Master")`.
- Remember last playback status for `/slayer effect`.
- Apply its own short duplicate cooldown only if needed. The existing cast pipeline already suppresses event duplicates, but preview/test commands may call voice directly.

Example:

```ts
export function tryPlaySpellVoiceCallout(displayText: string): SpellVoicePlayResult {
  if (!getSettings().enableSpellVoiceCallouts) {
    return "disabled";
  }

  const slug = resolveSpellAnimationSlug(displayText);

  if (slug === undefined) {
    return "missing_slug";
  }

  const path = getJapaneseSpellVoicePath(slug.styleSlug, slug.spellSlug);
  const [willPlay] = PlaySoundFile(path, "Master");
  return willPlay ? "played" : "missing_audio";
}
```

### Integration Point

Call voice only after `displayText` resolves in `showSpellTextEffect`:

```ts
const displayText = spellTextRegistry.resolveDisplayText(spellId, spellName);

if (displayText === undefined) {
  return false;
}

tryPlaySpellVoiceCallout(displayText);
```

This means:

- Voice plays for the same spells as the visual callout.
- Missing voice files do not block animation/text.
- Visual duplicate suppression remains intact because `tryShowSpellTextEffectFromCast` already gates duplicate casts before calling `showSpellTextEffect`.

## Settings and Commands

Add saved variable:

```ts
enableSpellVoiceCallouts?: boolean;
```

Recommended default:

```ts
enableSpellVoiceCallouts: state.settings.enableSpellVoiceCallouts !== false
```

Reason: the requested feature is part of the main fantasy, so default-on matches current spell effect behavior. If this proves too noisy, flip to default-off later.

Settings panel:

- Add checkbox below `Demon Slayer spell effect on cast`.
- English: `Japanese skill voice on cast`
- zhCN: `施法时播放日语技能语音`

Slash/status:

- Extend `/slayer effect` with:
  - `Voice callouts: enabled/disabled`
  - `Voice channel: Master`
  - `Voice asset for preview: bundled/missing`
  - `Last voice playback: played/missing_audio/disabled`
- Optionally add `/slayer effect voice` later for a voice-only preview.

## Audio Generation Pipeline

V1 can be manual or scripted. Recommended script:

```text
scripts/generate-spell-voice-assets.mjs
```

Inputs:

- A JSON/TS catalog derived from `design/ds_skills.md` and active `spell-slugs.ts`.
- Language: `ja`.
- Voice style: energetic but clean, short skill callout, no music bed.

Outputs:

- `.ogg` files under `assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg`.
- Optional preview sheet/log with duration, source text, and missing slugs.

Quality targets:

- Duration: `0.6s` to `1.8s`; cap at about `2.2s`.
- Format: OGG Vorbis, mono.
- Sample rate: `44100 Hz` or `48000 Hz`.
- Loudness: normalized enough to be audible but not harsh.
- Silence trim: under `80 ms` leading silence and under `120 ms` trailing silence.
- No background music, copyrighted anime clips, or copied actor lines.

Local macOS tooling can produce prototypes with `say` and `afconvert`, but distribution-quality Japanese pronunciation will probably need a better TTS source or recorded lines. For prototype assets, generated OS voice is acceptable as a functional placeholder.

## Build and Packaging

Update `scripts/build-addon.mjs`:

```ts
const spellVoiceAssetsDir = join(paths.assets, "spell-voices");

if (existsSync(spellVoiceAssetsDir)) {
  await cp(spellVoiceAssetsDir, join(distAssets, "spell-voices"), { recursive: true });
}
```

Consider adding a voice manifest generator if we want `/slayer effect` to report missing voice files without attempting playback. That could be:

```text
scripts/generate-spell-voice-manifest.mjs
src/features/spell-voice-callout/asset-manifest.ts
```

Unlike TGA textures, sound files do not need to be listed in a manifest to play. The manifest would be for diagnostics only.

## Rollout Plan

1. Add design doc. This file.
2. Add runtime declarations in `src/wow.d.ts`:
   - `PlaySoundFile(sound: string | number, channel?: string): LuaMultiReturn<[boolean | undefined, number | undefined]>`
3. Add `enableSpellVoiceCallouts` setting, localization, and checkbox.
4. Add `spell-voice-callout` module.
5. Wire `tryPlaySpellVoiceCallout(displayText)` into `showSpellTextEffect`.
6. Add build copy support for `assets/spell-voices`.
7. Generate prototype voice assets for active mapped spells only.
8. Extend `/slayer effect` status with voice diagnostics.
9. Run `npm run typecheck` and `npm run build`.
10. In-game QA after `/reload`:
    - mapped spell with voice asset plays animation + voice
    - mapped spell without voice asset still shows animation/text
    - setting disabled suppresses voice only
    - duplicate cast events do not double-play

## First Asset Batch

Start with active mappings rather than the full 190-entry slug catalog. Current active mappings are roughly:

- Rogue class mappings
- Death Knight class mappings
- Blood Elf racial mapping
- Common `Throw` / `Shoot`

Priority order:

1. Active spells that already have full visual text triplets.
2. Active spells using font fallback but core animation exists.
3. The rest of `spell-slugs.ts`.

This keeps the first test pack small and useful in-game.

## Open Questions

- Should voice be default-on or default-off? Recommendation: default-on while this is an intentionally themed addon, with a separate obvious toggle.
- Should voice use `Master` or `Dialog`? Recommendation: `Master` v1 for reliable audibility, future setting later.
- Should preview commands play voice? Recommendation: yes for `/slayer effect test`, but include voice status so missing files are understandable.
- Should we support alternate voices? Recommendation: not in v1. Keep the asset path language-based; add variants after the first end-to-end version works.
- How exact should Japanese lines be? Recommendation: use `design/ds_skills.md` as source of truth, preserve official Japanese names/readings where present, and mark uncertain readings in the catalog rather than generating guessed audio silently.
