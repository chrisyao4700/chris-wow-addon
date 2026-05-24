# Spell Animation Effect Asset Catalog And Prompts

Feature folder: `design/spell-animation-effect/`  
Source asset root: `assets/spell-effects/`  
Runtime asset root: `Interface\AddOns\SlayerUI\assets\spell-effects\`  
Reference taxonomy: `design/ds_skills.md`

This feature should not be water-only. The first requested effect is `水之呼吸 - 水面斩`, but `ds_skills.md` defines a larger style taxonomy:

- 14 breathing styles: 日, 月, 水, 炎, 雷, 风, 岩, 花, 虫, 蛇, 恋, 霞, 音, 兽.
- Blood Demon Art / 血鬼术 as a separate supernatural category.

The right asset model is:

1. **Shared spell text assets** per named spell.
2. **Reusable style-pack assets** per breathing/category.
3. **Optional spell-specific accent assets** for famous moves that need unique composition.

Important: make original assets. Do not use Demon Slayer screenshots, logos, character art, game captures, or extracted textures. The visual direction is "anime-inspired elemental brush title card," not copied franchise art.

## Canonical Naming And Path Rules

All generated style folders, spell folders, and asset filenames must use **lowercase ASCII snake_case**. No spaces, no Chinese/Japanese characters, no hyphens, and no uppercase letters in generated asset names. The fixed root folder `assets/spell-effects/` is the repo convention and is the only hyphenated exception.

Canonical source paths:

```text
assets/spell-effects/
  shared/
    <shared_asset>.tga
  <style_slug>/
    <style_slug>_energy_back.tga
    <style_slug>_energy_front.tga
    <style_slug>_particles_4x4.tga
    <style_slug>_impact_flash.tga
    <style_slug>_atmosphere.tga
    spells/
      <spell_slug>/
        <spell_slug>_text_main.tga
        <spell_slug>_text_shadow.tga
        <spell_slug>_text_sheen.tga
        <spell_slug>_<optional_accent>.tga
```

Canonical runtime lookup paths:

```text
Interface\AddOns\SlayerUI\assets\spell-effects\shared\<shared_asset>
Interface\AddOns\SlayerUI\assets\spell-effects\<style_slug>\<style_slug>_<role>
Interface\AddOns\SlayerUI\assets\spell-effects\<style_slug>\spells\<spell_slug>\<spell_slug>_<role>
```

Do not include `.tga` in runtime texture paths unless a loader/probe requires fallback candidates. This matches the existing system-button convention in `src/features/system-buttons/assets.ts`.

Implementation helper shape:

```ts
const SPELL_EFFECT_ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\spell-effects`;

function getStyleAssetPath(styleSlug: string, role: string): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\${styleSlug}\\${styleSlug}_${role}`;
}

function getSpellAssetPath(styleSlug: string, spellSlug: string, role: string): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\${styleSlug}\\spells\\${spellSlug}\\${spellSlug}_${role}`;
}

function getSharedAssetPath(assetName: string): string {
  return `${SPELL_EFFECT_ASSET_ROOT}\\shared\\${assetName}`;
}
```

Build packaging note: `scripts/build-addon.mjs` currently copies `assets/system-buttons` to `dist/SlayerUI/assets/system-buttons`, but it does not yet copy `assets/spell-effects`. When implementing the runtime feature, update the build script to copy `assets/spell-effects` into `dist/SlayerUI/assets/spell-effects`.

## Style Slugs

| Category | Style Slug | Source Folder |
| --- | --- | --- |
| 日之呼吸 / 火之神神乐 | `sun_breathing` | `assets/spell-effects/sun_breathing/` |
| 月之呼吸 | `moon_breathing` | `assets/spell-effects/moon_breathing/` |
| 水之呼吸 | `water_breathing` | `assets/spell-effects/water_breathing/` |
| 炎之呼吸 | `flame_breathing` | `assets/spell-effects/flame_breathing/` |
| 雷之呼吸 | `thunder_breathing` | `assets/spell-effects/thunder_breathing/` |
| 风之呼吸 | `wind_breathing` | `assets/spell-effects/wind_breathing/` |
| 岩之呼吸 | `stone_breathing` | `assets/spell-effects/stone_breathing/` |
| 花之呼吸 | `flower_breathing` | `assets/spell-effects/flower_breathing/` |
| 虫之呼吸 | `insect_breathing` | `assets/spell-effects/insect_breathing/` |
| 蛇之呼吸 | `serpent_breathing` | `assets/spell-effects/serpent_breathing/` |
| 恋之呼吸 | `love_breathing` | `assets/spell-effects/love_breathing/` |
| 霞之呼吸 | `mist_breathing` | `assets/spell-effects/mist_breathing/` |
| 音之呼吸 | `sound_breathing` | `assets/spell-effects/sound_breathing/` |
| 兽之呼吸 | `beast_breathing` | `assets/spell-effects/beast_breathing/` |
| 血鬼术 generic | `blood_art_core` | `assets/spell-effects/blood_art_core/` |

## Asset Generation Scope

The recommended generation order:

1. Generate `shared/` overlays.
2. Generate all style-pack assets.
3. Generate the first spell text triplet for `water_surface_slash`.
4. Generate text triplets for currently targeted/mapped addon spells.
5. Add optional spell-specific accent assets only when a spell needs more than the style pack.

Minimum first playable build:

- `shared/` overlays are optional.
- `water_breathing` style pack: `energy_back`, `particles_4x4`, `impact_flash`.
- `water_surface_slash` text triplet.

Full style-pack generation:

- 14 breathing style packs x 5 assets = 70 files.
- 1 generic Blood Demon Art pack x 5 assets = 5 files.
- Shared overlays = 5 files.
- First target spell text triplet = 3 files.

Total baseline catalog before mapped spell-specific text: **83 files**.

Full current target/mapped text generation adds 23 spell text triplets = 69 text files. Because `water_surface_slash` is already counted in the baseline, the additional mapped-text work after baseline is 22 triplets = 66 files. Full current catalog with all target/mapped text: **149 files**.

## Global Style Block

Prepend this to every generated non-text visual asset prompt:

> Original anime-inspired 2D game UI spell effect asset, transparent background, no frame, no border, no character, no logo, no screenshot, bold ink-brush linework, stylized Japanese fantasy sword-technique energy, high contrast over busy fantasy combat backgrounds, clean alpha edges, no white matte fringe, suitable for World of Warcraft addon UI texture compositing.

## Shared Overlay Assets

Save these to `assets/spell-effects/shared/`. They are optional polish layers that any style can reuse.

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `shared_ink_burst_01.tga` | `1024x512` | Irregular dark navy ink splash for behind calligraphy, brush splatter and dry-brush streaks, denser center with fading flecks outward, transparent background, no text, low enough detail to sit behind title without hurting readability. |
| `shared_speed_lines_01.tga` | `1024x512` | Sparse diagonal speed lines and sword-cut streaks, white-to-cyan strokes with subtle navy shadow, strong left-to-right slash direction, lots of transparent space, designed for brief overlay, no text. |
| `shared_slash_mask_01.tga` | `1024x256` | Long narrow diagonal sword-slash mask, white core fading to transparent edges, clean sharp leading edge, designed to reveal text sheen or energy highlight, transparent background. |
| `shared_foam_sparkle_01.tga` | `256x256` | Small cluster of 5-8 foam-like sparkles and elemental droplets, crisp white cores with cyan edges, transparent background, suitable for duplicating at different offsets around a slash. |
| `shared_droplet_trail_01.tga` | `512x256` | Curved trail of small elemental droplets tapering along a diagonal slash path, varied sizes, white highlights, subtle navy outline, transparent background, generic enough for water/mist/poison variants. |

## Shared Text Assets

Use these for every spell title, regardless of style. Text assets are per spell because image generators often mangle exact Chinese/Japanese glyphs.

| Asset Name Pattern | Size | Prompt |
| --- | ---: | --- |
| `<spell_slug>_text_main.tga` | `1024x256` | Exact readable title text `<lead_text>` above/left and `<main_text>` large center/right, hand-brushed calligraphy, thick dark ink outline, off-white brush fill, style-colored inner glow matching `<style_slug>`, dynamic slash-angle composition, transparent background, no extra words. The glyphs must be exact; reject if any character is malformed. |
| `<spell_slug>_text_shadow.tga` | `1024x256` | Shadow/outline-only companion for exact title text `<lead_text>` and `<main_text>`, same layout as `<spell_slug>_text_main.tga`, thick irregular black/navy silhouette, slightly expanded contour, dry-brush edge, transparent background, no fill highlight. |
| `<spell_slug>_text_sheen.tga` | `1024x256` | Highlight-only sheen mask matching exact title text `<lead_text>` and `<main_text>`, sparse bright white and style-colored brush glints, transparent background, intended for ADD blend over the main title. |

Text workflow recommendation:

1. Render exact glyphs manually in Figma, Photoshop, Illustrator, Krita, or Procreate.
2. Use a brush/calligraphy font only if its license allows addon distribution.
3. Use image generation for non-text layers, or only for text style exploration.
4. Reject every generated text output where the glyphs are not perfectly readable.

## Current Spell Example

These are the concrete text assets for the first target spell:

Save these to `assets/spell-effects/water_breathing/spells/water_surface_slash/`.

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `water_surface_slash_text_main.tga` | `1024x256` | Exact readable Chinese title text `水之呼吸` above/left and `水面斩` large center/right, hand-brushed calligraphy, thick dark navy ink outline, off-white brush fill with cyan inner glow, energetic slash-angle composition, transparent background, no extra words. The glyphs must be exact; reject if any character is malformed. |
| `water_surface_slash_text_shadow.tga` | `1024x256` | Shadow/outline-only companion for exact text `水之呼吸` and `水面斩`, same layout as `water_surface_slash_text_main.tga`, thick irregular ink-black/navy silhouette, slightly expanded contour, subtle rough brush edge, transparent background, no fill highlight. |
| `water_surface_slash_text_sheen.tga` | `1024x256` | Highlight-only sheen mask matching the exact layout of `water_surface_slash_text_main.tga`, thin bright white and cyan brush glints crossing the text, sparse glossy strokes, transparent background, intended for ADD blend over the main title. |

## Current Target And Mapped Spell Text Inventory

The current addon text mappings live under `src/features/spell-text-effect/mappings/`. This table also includes the first target spell, `水之呼吸 · 水面斩`, even though it is not yet part of the source mapping files. If we want pre-rendered calligraphy for every target/mapped text effect, generate the triplet below for each row:

- `<spell_slug>_text_main.tga`
- `<spell_slug>_text_shadow.tga`
- `<spell_slug>_text_sheen.tga`

Use the prompts from **Shared Text Assets**, replacing `<lead_text>` with the breathing/category name and `<main_text>` with the move name. Save each triplet to `assets/spell-effects/<style_slug>/spells/<spell_slug>/`.

| Display Text | Style Slug | Spell Slug | Save Folder |
| --- | --- | --- | --- |
| `水之呼吸 · 水面斩` | `water_breathing` | `water_surface_slash` | `assets/spell-effects/water_breathing/spells/water_surface_slash/` |
| `风之呼吸 · 投刃` | `wind_breathing` | `wind_throwing_blade` | `assets/spell-effects/wind_breathing/spells/wind_throwing_blade/` |
| `雷之呼吸 · 鸣神` | `thunder_breathing` | `thunder_narukami` | `assets/spell-effects/thunder_breathing/spells/thunder_narukami/` |
| `兽之呼吸 · 切裂` | `beast_breathing` | `beast_cutting_rend` | `assets/spell-effects/beast_breathing/spells/beast_cutting_rend/` |
| `蛇之呼吸 · 狭头毒牙` | `serpent_breathing` | `serpent_narrow_head_venom_fang` | `assets/spell-effects/serpent_breathing/spells/serpent_narrow_head_venom_fang/` |
| `兽之呼吸 · 狂裂` | `beast_breathing` | `beast_wild_rend` | `assets/spell-effects/beast_breathing/spells/beast_wild_rend/` |
| `蛇之呼吸 · 委蛇斩` | `serpent_breathing` | `serpent_meandering_slash` | `assets/spell-effects/serpent_breathing/spells/serpent_meandering_slash/` |
| `蛇之呼吸 · 巢绞` | `serpent_breathing` | `serpent_nest_strangle` | `assets/spell-effects/serpent_breathing/spells/serpent_nest_strangle/` |
| `虫之呼吸 · 百足蛇腹` | `insect_breathing` | `insect_centipede_belly` | `assets/spell-effects/insect_breathing/spells/insect_centipede_belly/` |
| `虫之呼吸 · 蜂牙之舞` | `insect_breathing` | `insect_bee_fang_dance` | `assets/spell-effects/insect_breathing/spells/insect_bee_fang_dance/` |
| `兽之呼吸 · 圆转旋牙` | `beast_breathing` | `beast_circular_spinning_fang` | `assets/spell-effects/beast_breathing/spells/beast_circular_spinning_fang/` |
| `雷之呼吸 · 霹雳一闪` | `thunder_breathing` | `thunder_thunderclap_flash` | `assets/spell-effects/thunder_breathing/spells/thunder_thunderclap_flash/` |
| `霞之呼吸 · 胧` | `mist_breathing` | `mist_oboro` | `assets/spell-effects/mist_breathing/spells/mist_oboro/` |
| `月之呼吸 · 穿面斩` | `moon_breathing` | `moon_piercing_face_slash` | `assets/spell-effects/moon_breathing/spells/moon_piercing_face_slash/` |
| `霞之呼吸 · 垂天远霞` | `mist_breathing` | `mist_distant_heaven_haze` | `assets/spell-effects/mist_breathing/spells/mist_distant_heaven_haze/` |
| `霞之呼吸 · 月之霞消` | `mist_breathing` | `mist_lunar_haze_dissolve` | `assets/spell-effects/mist_breathing/spells/mist_lunar_haze_dissolve/` |
| `雷之呼吸 · 神速` | `thunder_breathing` | `thunder_godspeed` | `assets/spell-effects/thunder_breathing/spells/thunder_godspeed/` |
| `日之呼吸 · 幻日虹` | `sun_breathing` | `sun_fake_rainbow` | `assets/spell-effects/sun_breathing/spells/sun_fake_rainbow/` |
| `虫之呼吸 · 蝶之舞` | `insect_breathing` | `insect_butterfly_dance` | `assets/spell-effects/insect_breathing/spells/insect_butterfly_dance/` |
| `岩之呼吸 · 天面碎` | `stone_breathing` | `stone_sky_surface_smash` | `assets/spell-effects/stone_breathing/spells/stone_sky_surface_smash/` |
| `虫之呼吸 · 戏弄` | `insect_breathing` | `insect_tease` | `assets/spell-effects/insect_breathing/spells/insect_tease/` |
| `霞之呼吸 · 八重霞` | `mist_breathing` | `mist_eightfold_mist` | `assets/spell-effects/mist_breathing/spells/mist_eightfold_mist/` |
| `血鬼术 · 魔力紊乱` | `blood_art_core` | `blood_art_mana_disruption` | `assets/spell-effects/blood_art_core/spells/blood_art_mana_disruption/` |

## Style Pack Asset Pattern

Each breathing/category gets this small reusable kit. MVP can use only `energy_back`, `particles_4x4`, and `impact_flash`; `energy_front` and `atmosphere` are polish.

| Asset Name Pattern | Size | Purpose |
| --- | ---: | --- |
| `<style_slug>_energy_back.tga` | `1024x512` | Main broad ribbon/slash/shape behind text. |
| `<style_slug>_energy_front.tga` | `1024x512` | Smaller foreground accent crossing part of the text. |
| `<style_slug>_particles_4x4.tga` | `1024x1024` | 16-frame sprite sheet for element fragments, sparks, petals, dust, or droplets. |
| `<style_slug>_impact_flash.tga` | `512x512` | Brief hit flash, usually ADD blend. |
| `<style_slug>_atmosphere.tga` | `1024x512` | Optional low-opacity mist/aura/dust layer; use sparingly to avoid overdraw. |

## Canonical Style-Pack Manifest

This table is the handoff checklist for asset agents. Each folder should contain the five listed files.

| Style Slug | Save Folder | Files |
| --- | --- | --- |
| `sun_breathing` | `assets/spell-effects/sun_breathing/` | `sun_breathing_energy_back.tga`, `sun_breathing_energy_front.tga`, `sun_breathing_particles_4x4.tga`, `sun_breathing_impact_flash.tga`, `sun_breathing_atmosphere.tga` |
| `moon_breathing` | `assets/spell-effects/moon_breathing/` | `moon_breathing_energy_back.tga`, `moon_breathing_energy_front.tga`, `moon_breathing_particles_4x4.tga`, `moon_breathing_impact_flash.tga`, `moon_breathing_atmosphere.tga` |
| `water_breathing` | `assets/spell-effects/water_breathing/` | `water_breathing_energy_back.tga`, `water_breathing_energy_front.tga`, `water_breathing_particles_4x4.tga`, `water_breathing_impact_flash.tga`, `water_breathing_atmosphere.tga` |
| `flame_breathing` | `assets/spell-effects/flame_breathing/` | `flame_breathing_energy_back.tga`, `flame_breathing_energy_front.tga`, `flame_breathing_particles_4x4.tga`, `flame_breathing_impact_flash.tga`, `flame_breathing_atmosphere.tga` |
| `thunder_breathing` | `assets/spell-effects/thunder_breathing/` | `thunder_breathing_energy_back.tga`, `thunder_breathing_energy_front.tga`, `thunder_breathing_particles_4x4.tga`, `thunder_breathing_impact_flash.tga`, `thunder_breathing_atmosphere.tga` |
| `wind_breathing` | `assets/spell-effects/wind_breathing/` | `wind_breathing_energy_back.tga`, `wind_breathing_energy_front.tga`, `wind_breathing_particles_4x4.tga`, `wind_breathing_impact_flash.tga`, `wind_breathing_atmosphere.tga` |
| `stone_breathing` | `assets/spell-effects/stone_breathing/` | `stone_breathing_energy_back.tga`, `stone_breathing_energy_front.tga`, `stone_breathing_particles_4x4.tga`, `stone_breathing_impact_flash.tga`, `stone_breathing_atmosphere.tga` |
| `flower_breathing` | `assets/spell-effects/flower_breathing/` | `flower_breathing_energy_back.tga`, `flower_breathing_energy_front.tga`, `flower_breathing_particles_4x4.tga`, `flower_breathing_impact_flash.tga`, `flower_breathing_atmosphere.tga` |
| `insect_breathing` | `assets/spell-effects/insect_breathing/` | `insect_breathing_energy_back.tga`, `insect_breathing_energy_front.tga`, `insect_breathing_particles_4x4.tga`, `insect_breathing_impact_flash.tga`, `insect_breathing_atmosphere.tga` |
| `serpent_breathing` | `assets/spell-effects/serpent_breathing/` | `serpent_breathing_energy_back.tga`, `serpent_breathing_energy_front.tga`, `serpent_breathing_particles_4x4.tga`, `serpent_breathing_impact_flash.tga`, `serpent_breathing_atmosphere.tga` |
| `love_breathing` | `assets/spell-effects/love_breathing/` | `love_breathing_energy_back.tga`, `love_breathing_energy_front.tga`, `love_breathing_particles_4x4.tga`, `love_breathing_impact_flash.tga`, `love_breathing_atmosphere.tga` |
| `mist_breathing` | `assets/spell-effects/mist_breathing/` | `mist_breathing_energy_back.tga`, `mist_breathing_energy_front.tga`, `mist_breathing_particles_4x4.tga`, `mist_breathing_impact_flash.tga`, `mist_breathing_atmosphere.tga` |
| `sound_breathing` | `assets/spell-effects/sound_breathing/` | `sound_breathing_energy_back.tga`, `sound_breathing_energy_front.tga`, `sound_breathing_particles_4x4.tga`, `sound_breathing_impact_flash.tga`, `sound_breathing_atmosphere.tga` |
| `beast_breathing` | `assets/spell-effects/beast_breathing/` | `beast_breathing_energy_back.tga`, `beast_breathing_energy_front.tga`, `beast_breathing_particles_4x4.tga`, `beast_breathing_impact_flash.tga`, `beast_breathing_atmosphere.tga` |
| `blood_art_core` | `assets/spell-effects/blood_art_core/` | `blood_art_core_energy_back.tga`, `blood_art_core_energy_front.tga`, `blood_art_core_particles_4x4.tga`, `blood_art_core_impact_flash.tga`, `blood_art_core_sigil_ring.tga` |

## Breathing Style Packs

### 日之呼吸 / 火之神神乐: `sun_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `sun_breathing_energy_back.tga` | `1024x512` | Solar flame sword arc sweeping diagonally, red-orange core with gold rim light, circular sun-disc rhythm, dark ink outline, intense but readable behind brush title, transparent background. |
| `sun_breathing_energy_front.tga` | `1024x512` | Narrow foreground solar flame ribbon, gold-white edge, ember tongues crossing lower title area, dark red ink contour, transparent background. |
| `sun_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of embers, sun sparks, and tiny flame curls expanding then fading, hand-keyed stepped animation, transparent background. |
| `sun_breathing_impact_flash.tga` | `512x512` | Bright sunburst slash flash, white-hot center, gold and crimson rays, designed for ADD blend, transparent background. |
| `sun_breathing_atmosphere.tga` | `1024x512` | Low-opacity heat shimmer and faint ember haze around a title-card area, warm orange and gold, transparent background, no large opaque cloud. |

### 月之呼吸: `moon_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `moon_breathing_energy_back.tga` | `1024x512` | Dark crescent-moon sword energy arc, violet navy shadows, pale moonlit silver edges, scattered small crescent blade fragments, transparent background. |
| `moon_breathing_energy_front.tga` | `1024x512` | Thin foreground crescent cuts crossing the title, silver-violet glow, sharp curved blade shapes, transparent background. |
| `moon_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of rotating crescent fragments and moon-dust motes, pale silver and violet, transparent background. |
| `moon_breathing_impact_flash.tga` | `512x512` | Lunar impact flash, crescent-shaped white core with violet edge bloom and dark negative-space cuts, transparent background. |
| `moon_breathing_atmosphere.tga` | `1024x512` | Low-opacity night haze, moonlit dust, faint violet mist, transparent background, subtle enough to sit behind text. |

### 水之呼吸: `water_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `water_breathing_energy_back.tga` | `1024x512` | Broad diagonal water slash ribbon, ukiyo-e-inspired wave body, teal-to-deep-blue gradient, white foam crests, dark ink outline, transparent background. |
| `water_breathing_energy_front.tga` | `1024x512` | Narrow foreground water ribbon crossing lower-right title area, curled wave tips, white foam caps, cyan highlights, dark blue contour, transparent background. |
| `water_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of water foam burst and curling wave fragments following a diagonal slash path, white foam, cyan droplets, navy outline, transparent background. |
| `water_breathing_impact_flash.tga` | `512x512` | Radial water-slash impact flash, sharp white center with cyan edge bloom, starburst sword-cut shape, ADD blend, transparent background. |
| `water_breathing_atmosphere.tga` | `1024x512` | Soft water mist and vapor wisps, pale cyan and desaturated blue, very low opacity, horizontal title-card spread, transparent background. |

### 炎之呼吸: `flame_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `flame_breathing_energy_back.tga` | `1024x512` | Strong flame slash ribbon, red-orange fire tongues with golden core and black ink outline, aggressive upward sweep, transparent background. |
| `flame_breathing_energy_front.tga` | `1024x512` | Foreground flame lick crossing title edge, bright yellow-white tips, red base, dark contour, transparent background. |
| `flame_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of fire sparks, ash flecks, and flame curls blooming then fading, transparent background. |
| `flame_breathing_impact_flash.tga` | `512x512` | Explosive flame hit flash, white-hot center, orange burst rays, smoke-dark notches, ADD blend, transparent background. |
| `flame_breathing_atmosphere.tga` | `1024x512` | Low-opacity warm heat haze and ember smoke, orange-red glow, transparent background, subtle. |

### 雷之呼吸: `thunder_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `thunder_breathing_energy_back.tga` | `1024x512` | Jagged lightning slash ribbon, gold and white bolts with deep purple shadow, explosive diagonal speed, ink-brush edges, transparent background. |
| `thunder_breathing_energy_front.tga` | `1024x512` | Thin foreground lightning forks crossing title, sharp gold-white strokes, violet edge shadow, transparent background. |
| `thunder_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of electric sparks, bolt fragments, and crackling arcs, stepped animation, transparent background. |
| `thunder_breathing_impact_flash.tga` | `512x512` | Lightning impact flash, white core, gold radial bolts, violet afterimage, ADD blend, transparent background. |
| `thunder_breathing_atmosphere.tga` | `1024x512` | Faint electric charge haze and tiny gold sparks around the title area, transparent background. |

### 风之呼吸: `wind_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `wind_breathing_energy_back.tga` | `1024x512` | Pale green wind slash arcs, curved gust blades with white air-cut centers and dark green ink contours, transparent background. |
| `wind_breathing_energy_front.tga` | `1024x512` | Foreground sharp wind crescent crossing title corner, mint-white core, green edge, transparent background. |
| `wind_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of slicing wind fragments, leaf-like air shards, and dust curls, transparent background. |
| `wind_breathing_impact_flash.tga` | `512x512` | Air-cut impact flash, white slash core with pale green radial gusts, ADD blend, transparent background. |
| `wind_breathing_atmosphere.tga` | `1024x512` | Low-opacity swirling air trails and light dust, pale green-grey, transparent background. |

### 岩之呼吸: `stone_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `stone_breathing_energy_back.tga` | `1024x512` | Heavy stone-impact slash shape, grey rock shards, ochre dust, angular weighty composition, dark ink cracks, transparent background. |
| `stone_breathing_energy_front.tga` | `1024x512` | Foreground rock fragments and chain-like motion streak crossing title edge, grey and bronze accents, transparent background. |
| `stone_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of stone chips, dust puffs, and cracked debris bursting outward, transparent background. |
| `stone_breathing_impact_flash.tga` | `512x512` | Heavy impact flash with white center, grey fracture lines, ochre dust ring, transparent background. |
| `stone_breathing_atmosphere.tga` | `1024x512` | Low-opacity dust cloud and falling grit, warm grey and muted ochre, transparent background. |

### 花之呼吸: `flower_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `flower_breathing_energy_back.tga` | `1024x512` | Elegant flower-petal slash ribbon, pink and soft red petals in a curved sword arc, white highlights, dark plum ink outline, transparent background. |
| `flower_breathing_energy_front.tga` | `1024x512` | Foreground petal sweep crossing title, crisp sakura-like petals and thin sword line, transparent background. |
| `flower_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of petals scattering, rotating, and fading, pink-white petals with plum shadow, transparent background. |
| `flower_breathing_impact_flash.tga` | `512x512` | Flower-shaped slash flash, white center with pink petal rays, ADD blend, transparent background. |
| `flower_breathing_atmosphere.tga` | `1024x512` | Low-opacity petal haze and soft pink motion blur, transparent background. |

### 虫之呼吸: `insect_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `insect_breathing_energy_back.tga` | `1024x512` | Needle-like insect sting slash, butterfly-wing color accents, teal-purple poison glow, thin elegant arcs, dark ink outline, transparent background. |
| `insect_breathing_energy_front.tga` | `1024x512` | Foreground poison-glint line and small butterfly wing fragments crossing title, violet-teal, transparent background. |
| `insect_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of butterfly scales, tiny wing motes, and poison sparkles, teal-purple-white, transparent background. |
| `insect_breathing_impact_flash.tga` | `512x512` | Precise piercing impact flash, thin white needle core with violet and teal bloom, transparent background. |
| `insect_breathing_atmosphere.tga` | `1024x512` | Low-opacity poison shimmer and butterfly-scale dust around title area, transparent background. |

### 蛇之呼吸: `serpent_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `serpent_breathing_energy_back.tga` | `1024x512` | Sinuous serpent-like slash ribbon, white and violet curved path, scale-like highlights, dark ink outline, transparent background. |
| `serpent_breathing_energy_front.tga` | `1024x512` | Foreground twisting snake-curve blade line crossing the title, purple edge glow, transparent background. |
| `serpent_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of scale motes, curved blade fragments, and violet sparks, transparent background. |
| `serpent_breathing_impact_flash.tga` | `512x512` | Curved fang-like impact flash, white core with purple crescent edges, transparent background. |
| `serpent_breathing_atmosphere.tga` | `1024x512` | Low-opacity coiling violet haze and scale shimmer, transparent background. |

### 恋之呼吸: `love_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `love_breathing_energy_back.tga` | `1024x512` | Flexible ribbon-like sword slash, rose-pink and lime accents, looping graceful arc, energetic but not cute UI decoration, dark magenta ink outline, transparent background. |
| `love_breathing_energy_front.tga` | `1024x512` | Foreground whip-ribbon slash crossing title, pink-white core with small lime glints, transparent background. |
| `love_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of ribbon sparks, small petal-like hearts abstracted as brush flecks, pink and lime, transparent background. |
| `love_breathing_impact_flash.tga` | `512x512` | Bright ribbon-loop impact flash, white center with pink curved rays, ADD blend, transparent background. |
| `love_breathing_atmosphere.tga` | `1024x512` | Low-opacity rose-pink motion haze with subtle lime sparkles, transparent background. |

### 霞之呼吸: `mist_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `mist_breathing_energy_back.tga` | `1024x512` | Pale mist slash arc, soft blue-white fog bands with hidden sharp sword-line center, faint grey ink contour, transparent background. |
| `mist_breathing_energy_front.tga` | `1024x512` | Foreground thin mist ribbon and afterimage slash crossing title, pale cyan-white, transparent background. |
| `mist_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of fog wisps, afterimage fragments, and small pale motes appearing/disappearing, transparent background. |
| `mist_breathing_impact_flash.tga` | `512x512` | Soft flash emerging from fog, white center, pale blue diffuse rays, transparent background. |
| `mist_breathing_atmosphere.tga` | `1024x512` | Low-opacity layered mist sheet, pale blue-grey, very transparent, no opaque cloud mass. |

### 音之呼吸: `sound_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `sound_breathing_energy_back.tga` | `1024x512` | Explosive sound-ring slash effect, gold and teal percussion wave rings, angular spark bursts, dark ink accents, transparent background. |
| `sound_breathing_energy_front.tga` | `1024x512` | Foreground rhythmic wave rings and bright slash strokes crossing title, gold-white and teal, transparent background. |
| `sound_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of explosive sparks, musical rhythm rings as abstract circles, smoke flecks, transparent background. |
| `sound_breathing_impact_flash.tga` | `512x512` | Percussive impact flash, white center, gold ring shockwave, teal edge bloom, ADD blend, transparent background. |
| `sound_breathing_atmosphere.tga` | `1024x512` | Low-opacity smoke and sound-wave ripples around title area, transparent background. |

### 兽之呼吸: `beast_breathing`

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `beast_breathing_energy_back.tga` | `1024x512` | Wild jagged dual-slash energy, blue-grey claw-like cuts, rough ink-brush edges, aggressive uneven rhythm, transparent background. |
| `beast_breathing_energy_front.tga` | `1024x512` | Foreground tooth-like slash fragments crossing title, blue-grey and white, rough dark outline, transparent background. |
| `beast_breathing_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of torn air shards, claw fragments, dust flecks, wild uneven motion, transparent background. |
| `beast_breathing_impact_flash.tga` | `512x512` | Jagged impact flash with white core and blue-grey torn edges, transparent background. |
| `beast_breathing_atmosphere.tga` | `1024x512` | Low-opacity dust and wild motion smears, blue-grey neutral palette, transparent background. |

## Blood Demon Art Base Kit

Blood Demon Art is broader than one visual style in `ds_skills.md`; individual demons/abilities can get their own substyle later. Use this base kit only for generic demonic effects.

| Asset Name | Size | Prompt |
| --- | ---: | --- |
| `blood_art_core_energy_back.tga` | `1024x512` | Original demonic blood-technique slash aura, crimson liquid ribbons, black smoke edges, occult brush marks, high contrast, transparent background, no character, no logo. |
| `blood_art_core_energy_front.tga` | `1024x512` | Foreground crimson blood ribbon and black-red slash streaks crossing title, glossy highlights, transparent background. |
| `blood_art_core_particles_4x4.tga` | `1024x1024` | 4x4 sprite sheet of blood droplets, black smoke motes, red crystal shards, expanding then fading, transparent background. |
| `blood_art_core_impact_flash.tga` | `512x512` | Dark red impact flash, white-pink center, crimson burst, black negative-space cuts, ADD blend, transparent background. |
| `blood_art_core_sigil_ring.tga` | `512x512` | Abstract demonic sigil ring made of original brush marks and red-black geometry, no readable real-world symbols, transparent background. |

## Water Surface Slash MVP Loadout

For the first implemented spell, use this exact small set:

| Runtime Layer | Source Asset Path | Runtime Texture Path |
| --- | --- | --- |
| Text shadow | `assets/spell-effects/water_breathing/spells/water_surface_slash/water_surface_slash_text_shadow.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\spells\water_surface_slash\water_surface_slash_text_shadow` |
| Text main | `assets/spell-effects/water_breathing/spells/water_surface_slash/water_surface_slash_text_main.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\spells\water_surface_slash\water_surface_slash_text_main` |
| Text sheen | `assets/spell-effects/water_breathing/spells/water_surface_slash/water_surface_slash_text_sheen.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\spells\water_surface_slash\water_surface_slash_text_sheen` |
| Energy back | `assets/spell-effects/water_breathing/water_breathing_energy_back.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\water_breathing_energy_back` |
| Sprite sheet | `assets/spell-effects/water_breathing/water_breathing_particles_4x4.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\water_breathing_particles_4x4` |
| Impact flash | `assets/spell-effects/water_breathing/water_breathing_impact_flash.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\water_breathing_impact_flash` |

Optional water polish:

| Runtime Layer | Source Asset Path | Runtime Texture Path |
| --- | --- | --- |
| Energy front | `assets/spell-effects/water_breathing/water_breathing_energy_front.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\water_breathing_energy_front` |
| Atmosphere | `assets/spell-effects/water_breathing/water_breathing_atmosphere.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\water_breathing\water_breathing_atmosphere` |
| Ink burst | `assets/spell-effects/shared/shared_ink_burst_01.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\shared\shared_ink_burst_01` |
| Speed lines | `assets/spell-effects/shared/shared_speed_lines_01.tga` | `Interface\AddOns\SlayerUI\assets\spell-effects\shared\shared_speed_lines_01` |

## Export Checklist

For each asset:

1. Generate/export transparent PNG at the listed size.
2. Check the alpha edge on dark and light backgrounds.
3. Convert to 32-bit `.tga` or `.blp`.
4. Save style-pack assets to `assets/spell-effects/<style_slug>/`.
5. Save spell-specific text assets to `assets/spell-effects/<style_slug>/spells/<spell_slug>/`.
6. For any `*_particles_4x4.tga`, confirm all 16 cells have equal dimensions and no frame bleeds into neighboring cells.
7. In game, test after `/reload` to catch first-load stutter and missing texture paths.

## Negative Prompt

Use this when the generator supports negative prompts:

`Demon Slayer logo, anime screenshot, copyrighted character, Tanjiro, official game art, watermark, signature, background scene, rectangular card frame, UI border, unreadable text, wrong Chinese characters, misspelled kanji, blurry edges, white matte fringe, photorealistic water, 3D render, low contrast, noisy over-detailed particles`
