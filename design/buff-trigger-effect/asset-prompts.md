# Buff Trigger Indicator Asset Prompts

Feature folder: `design/buff-trigger-effect/`  
Source asset root: `assets/buff-effects/`  
Runtime asset root: `Interface\AddOns\SlayerUI\assets\buff-effects\`  
Design doc: `design/buff-trigger-effect/README.md`  
Reference taxonomy: `design/ds_skills.md`

This catalog creates one reusable buff-trigger effect preset for each breathing style and one for Blood Demon Art. Buffs map to style presets at runtime; they do not need their own unique art.

Important: make original assets. Do not use Demon Slayer screenshots, logos, character art, game captures, anime frames, manga panels, official fonts, or extracted textures. The direction is "anime-inspired elemental brush UI effect," not copied franchise art.

## Canonical Naming And Path Rules

All generated folders and filenames must use lowercase ASCII snake_case.

Canonical source paths:

```text
assets/buff-effects/
  <style_slug>/
    <style_slug>_indicator_core.tga
    <style_slug>_trigger_burst.tga
    <style_slug>_particles_4x4.tga
    <style_slug>_active_glow.tga
```

Canonical runtime lookup paths:

```text
Interface\AddOns\SlayerUI\assets\buff-effects\<style_slug>\<style_slug>_indicator_core
Interface\AddOns\SlayerUI\assets\buff-effects\<style_slug>\<style_slug>_trigger_burst
Interface\AddOns\SlayerUI\assets\buff-effects\<style_slug>\<style_slug>_particles_4x4
Interface\AddOns\SlayerUI\assets\buff-effects\<style_slug>\<style_slug>_active_glow
```

Do not include `.tga` in runtime texture paths unless the loader probes fallback candidates.

## Required Asset Roles

Each style preset has four texture roles. The effect is still "one effect per style"; these are the layers that compose that single effect.

| Role | Size | Blend | Purpose |
| --- | ---: | --- | --- |
| `indicator_core` | `512x512` | `BLEND` | Compact badge/crest that reads at small scale. |
| `trigger_burst` | `1024x512` | `ADD` or `BLEND` | Wide slash/ring burst shown when the buff triggers. |
| `particles_4x4` | `1024x1024` | `ADD` or `BLEND` | 16-frame sprite sheet for fragments, motes, sparks, droplets, petals, or shards. |
| `active_glow` | `512x512` | `ADD` | Quiet echo behind the badge after the trigger pop. |

Minimum playable build:

- `indicator_core`
- `trigger_burst`

Full catalog:

- 15 style presets x 4 files = 60 files.

## Global Prompt Block

Prepend this to every generated asset prompt:

> Original anime-inspired 2D fantasy game UI buff trigger effect asset, transparent background, no frame, no border, no character, no logo, no screenshot, bold ink-brush linework, stylized Japanese sword-technique energy, strong silhouette readable over busy World of Warcraft combat backgrounds, clean alpha edges, no white matte fringe, no text, no letters, no glyphs, centered composition, suitable for layered addon UI texture compositing.

## Role Prompt Blocks

Combine the global prompt block, one role prompt block, and one style modifier from the style table.

### `indicator_core`

> Compact circular or diamond-shaped elemental crest, designed to read clearly at 80-160 pixels, strong central silhouette, brush-ink contour, small inner energy mark, balanced transparent padding, no text, no numbers, no icon border, no square UI frame.

### `trigger_burst`

> Wide horizontal buff-trigger burst, fast slash/ring energy expanding outward from center, asymmetric brush strokes, clear negative space near center for the indicator core, high-impact first-frame feel, transparent background, no text.

### `particles_4x4`

> 4x4 sprite sheet with 16 equal cells, each cell a stepped animation frame of style-specific particles emerging then fading, consistent center alignment per cell, transparent background, no grid lines, no text, no frame border.

### `active_glow`

> Soft looping aura/glow behind a compact buff indicator, low opacity, subtle pulsing energy, clean circular falloff, readable but not distracting, transparent background, no text, no hard rectangular edges.

## Style Slugs And Modifiers

| Category | Style Slug | Style Modifier |
| --- | --- | --- |
| 日之呼吸 / 火之神神乐 | `sun_breathing` | Solar flame energy, red-orange core, gold-white rim light, sun-disc rhythm, ember flecks, confident circular brush motion, dark crimson ink outline. |
| 月之呼吸 | `moon_breathing` | Dark lunar sword energy, violet navy shadows, silver crescent cuts, small crescent fragments, cold moonlit glow, elegant but dangerous silhouette. |
| 水之呼吸 | `water_breathing` | Flowing water ribbon, deep blue and cyan, ukiyo-e wave crests, foam beads, smooth circular current, navy brush outline. |
| 炎之呼吸 | `flame_breathing` | Aggressive flame arc, red and orange body, gold-white hot edge, rising ember sparks, jagged brush flame tongues, dark red contour. |
| 雷之呼吸 | `thunder_breathing` | Lightning strike geometry, electric yellow and white core, violet shadow edge, sharp zigzag cuts, speed-line energy, explosive snap. |
| 风之呼吸 | `wind_breathing` | Pale green wind blades, translucent air swirls, slicing leaf-like fragments, fast diagonal motion, crisp white highlights, dark teal outline. |
| 岩之呼吸 | `stone_breathing` | Heavy stone impact, gray slate and amber dust, angular rock shards, cracked circular seal energy, grounded weight, dark charcoal brush marks. |
| 花之呼吸 | `flower_breathing` | Petal vortex, soft rose and magenta, elegant flowing slash, drifting blossoms, bright white petal highlights, refined ink contour. |
| 虫之呼吸 | `insect_breathing` | Poison insect sting energy, teal-violet and lavender, thin needle-like trails, butterfly-wing motes, quick venom sparkle, dark purple outline. |
| 蛇之呼吸 | `serpent_breathing` | Serpentine green-purple energy, coiling slash path, scale-like fragments, narrow fang-shaped highlights, sinuous motion, black-green brush contour. |
| 恋之呼吸 | `love_breathing` | Pink ribbon-whip energy, heart-adjacent curves without literal hearts, rose and coral highlights, agile looping slash, warm white glints. |
| 霞之呼吸 | `mist_breathing` | Pale cyan-white mist, soft fog ribbons, disappearing slash afterimage, muted blue-gray shadows, airy transparent edges, subtle ink haze. |
| 音之呼吸 | `sound_breathing` | Sonic burst rings, gold and teal vibration arcs, rhythmic beat marks, explosive circular waves, sharp white sound streaks, dark ink accents. |
| 兽之呼吸 | `beast_breathing` | Wild claw energy, blue-gray steel and pale cyan, rough serrated slashes, fang/claw fragments, raw kinetic motion, scratchy dark outline. |
| 血鬼术 | `blood_art` | Demonic blood energy, crimson and black-violet, occult circular pulse, blood-like shards and smoke, sharp supernatural edge, ominous but clean UI silhouette. |

## Example Prompt Assembly

For `assets/buff-effects/water_breathing/water_breathing_indicator_core.tga`:

> Original anime-inspired 2D fantasy game UI buff trigger effect asset, transparent background, no frame, no border, no character, no logo, no screenshot, bold ink-brush linework, stylized Japanese sword-technique energy, strong silhouette readable over busy World of Warcraft combat backgrounds, clean alpha edges, no white matte fringe, no text, no letters, no glyphs, centered composition, suitable for layered addon UI texture compositing. Compact circular or diamond-shaped elemental crest, designed to read clearly at 80-160 pixels, strong central silhouette, brush-ink contour, small inner energy mark, balanced transparent padding, no text, no numbers, no icon border, no square UI frame. Flowing water ribbon, deep blue and cyan, ukiyo-e wave crests, foam beads, smooth circular current, navy brush outline.

## Canonical Effect Catalog

Each row is one complete style effect preset.

| Style Slug | Save Folder | Files |
| --- | --- | --- |
| `sun_breathing` | `assets/buff-effects/sun_breathing/` | `sun_breathing_indicator_core.tga`, `sun_breathing_trigger_burst.tga`, `sun_breathing_particles_4x4.tga`, `sun_breathing_active_glow.tga` |
| `moon_breathing` | `assets/buff-effects/moon_breathing/` | `moon_breathing_indicator_core.tga`, `moon_breathing_trigger_burst.tga`, `moon_breathing_particles_4x4.tga`, `moon_breathing_active_glow.tga` |
| `water_breathing` | `assets/buff-effects/water_breathing/` | `water_breathing_indicator_core.tga`, `water_breathing_trigger_burst.tga`, `water_breathing_particles_4x4.tga`, `water_breathing_active_glow.tga` |
| `flame_breathing` | `assets/buff-effects/flame_breathing/` | `flame_breathing_indicator_core.tga`, `flame_breathing_trigger_burst.tga`, `flame_breathing_particles_4x4.tga`, `flame_breathing_active_glow.tga` |
| `thunder_breathing` | `assets/buff-effects/thunder_breathing/` | `thunder_breathing_indicator_core.tga`, `thunder_breathing_trigger_burst.tga`, `thunder_breathing_particles_4x4.tga`, `thunder_breathing_active_glow.tga` |
| `wind_breathing` | `assets/buff-effects/wind_breathing/` | `wind_breathing_indicator_core.tga`, `wind_breathing_trigger_burst.tga`, `wind_breathing_particles_4x4.tga`, `wind_breathing_active_glow.tga` |
| `stone_breathing` | `assets/buff-effects/stone_breathing/` | `stone_breathing_indicator_core.tga`, `stone_breathing_trigger_burst.tga`, `stone_breathing_particles_4x4.tga`, `stone_breathing_active_glow.tga` |
| `flower_breathing` | `assets/buff-effects/flower_breathing/` | `flower_breathing_indicator_core.tga`, `flower_breathing_trigger_burst.tga`, `flower_breathing_particles_4x4.tga`, `flower_breathing_active_glow.tga` |
| `insect_breathing` | `assets/buff-effects/insect_breathing/` | `insect_breathing_indicator_core.tga`, `insect_breathing_trigger_burst.tga`, `insect_breathing_particles_4x4.tga`, `insect_breathing_active_glow.tga` |
| `serpent_breathing` | `assets/buff-effects/serpent_breathing/` | `serpent_breathing_indicator_core.tga`, `serpent_breathing_trigger_burst.tga`, `serpent_breathing_particles_4x4.tga`, `serpent_breathing_active_glow.tga` |
| `love_breathing` | `assets/buff-effects/love_breathing/` | `love_breathing_indicator_core.tga`, `love_breathing_trigger_burst.tga`, `love_breathing_particles_4x4.tga`, `love_breathing_active_glow.tga` |
| `mist_breathing` | `assets/buff-effects/mist_breathing/` | `mist_breathing_indicator_core.tga`, `mist_breathing_trigger_burst.tga`, `mist_breathing_particles_4x4.tga`, `mist_breathing_active_glow.tga` |
| `sound_breathing` | `assets/buff-effects/sound_breathing/` | `sound_breathing_indicator_core.tga`, `sound_breathing_trigger_burst.tga`, `sound_breathing_particles_4x4.tga`, `sound_breathing_active_glow.tga` |
| `beast_breathing` | `assets/buff-effects/beast_breathing/` | `beast_breathing_indicator_core.tga`, `beast_breathing_trigger_burst.tga`, `beast_breathing_particles_4x4.tga`, `beast_breathing_active_glow.tga` |
| `blood_art` | `assets/buff-effects/blood_art/` | `blood_art_indicator_core.tga`, `blood_art_trigger_burst.tga`, `blood_art_particles_4x4.tga`, `blood_art_active_glow.tga` |

## Asset QA Checklist

- Transparent alpha, no background plate, no square frame.
- No text or pseudo-text. This feature uses visual style only.
- Strong silhouette when scaled down to 80 pixels.
- No pure-white edge matte when composited over dark and bright backgrounds.
- Centered composition with padding so scale pulses do not crop.
- `particles_4x4` has 16 equal cells and no visible grid lines.
- `active_glow` is subtle enough to sit behind combat UI without hiding action buttons.
- File names exactly match the catalog.
- Export `.tga` with alpha.
