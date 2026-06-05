# Buff Trigger Indicator Effect Design

Feature folder: `design/buff-trigger-effect/`  
Proposed source folder: `src/features/buff-trigger-effect/`  
Proposed asset root: `assets/buff-effects/`  
Reference taxonomy: `design/ds_skills.md`  
Related runtime feature: `src/features/spell-animation-effect/`

## Goal

Show a short Demon-Slayer-inspired visual indicator when an important player buff, proc, stance, or cooldown aura becomes active. The indicator answers: "a mapped buff just triggered" without requiring the player to scan the default buff row.

The feature is style-based, not spell-text-based:

- Each breathing style has exactly one reusable buff-trigger effect preset.
- Blood Demon Art has exactly one reusable buff-trigger effect preset.
- Class mappings decide which player buffs trigger which style preset.
- The same style effect can be reused by many buffs across many classes.

For example, a warrior defensive proc can trigger `stone_breathing`, a mage `Hot Streak` proc can trigger `flame_breathing`, and a death knight blood cooldown can trigger `blood_art`. None of those need per-spell calligraphy assets.

## Non-Goals

- Do not build a full replacement for WoW's buff/debuff frames.
- Do not create one bespoke effect per buff.
- Do not display copyrighted Demon Slayer art, logos, frames, screenshots, or extracted game/anime assets.
- Do not add persistent screen clutter for every passive aura. Only mapped, high-signal buffs should trigger.
- Do not require exact Chinese/Japanese text rendering for this feature. This is a visual style indicator, not a title-card text callout.

## Product Behavior

### Trigger Rules

An effect plays when a mapped helpful aura on `player` transitions from inactive to active.

Refresh behavior:

- If the aura gains stacks, play a small refresh pulse.
- If the aura expiration extends by at least `0.5s`, play a small refresh pulse.
- If the same aura retriggers inside `0.75s`, suppress it to avoid spam.
- Aura removal does not play an effect in the MVP.

Source filtering:

- Default to player-owned buffs and procs.
- Allow `source: "any"` for buffs whose Classic/Titan API source is missing or unreliable.
- Support pet-owned source later for hunter/warlock pet procs if needed.

### Visual Behavior

The effect has two states:

1. **Trigger burst**: a short style-specific impact, `0.75s` to `1.0s`, using a broad slash/ring layer, particles, and a compact style core.
2. **Active echo**: a quiet badge/glow that can remain for `1.2s` by default. A later iteration can keep it visible until the aura expires, but MVP should avoid building a full buff timer.

The trigger should feel like the existing spell animation effects: fast pop, strong silhouette, elemental texture, then a clean fade.

The `indicator_core` layer should include a large one-character style glyph so players can identify the triggered style even when color palettes are visually similar:

| Style | Glyph |
| --- | --- |
| `sun_breathing` | `日` |
| `moon_breathing` | `月` |
| `water_breathing` | `水` |
| `flame_breathing` | `炎` |
| `thunder_breathing` | `雷` |
| `wind_breathing` | `风` |
| `stone_breathing` | `岩` |
| `flower_breathing` | `花` |
| `insect_breathing` | `虫` |
| `serpent_breathing` | `蛇` |
| `love_breathing` | `恋` |
| `mist_breathing` | `霞` |
| `sound_breathing` | `音` |
| `beast_breathing` | `兽` |
| `blood_art` | `血` |

Suggested timeline:

| Time | Layer | Action |
| --- | --- | --- |
| `0.00-0.08s` | trigger burst | Alpha 0 -> 0.95 -> 0.35, scale 0.72 -> 1.14 |
| `0.04-0.18s` | indicator core | Pop from 0.68 -> 1.12 -> 1.0 |
| `0.08-0.36s` | particles | Advance 4x4 sprite sheet, stepped frame timing |
| `0.18-0.72s` | active glow | Hold low alpha, small breathing scale pulse |
| `0.72-0.95s` | all | Fade out, scale 1.0 -> 1.04 |

### Dedicated Play Area

Buff trigger animations should play inside one dedicated UI area:

```text
BuffTriggerEffectArea
```

This area is the only parent/anchor used by buff trigger effects. Individual style effects can animate inside the area, but they should not pick their own screen anchors. This gives the options menu one clear target for player controls: scale and location.

Default placement:

- Anchor: `CENTER`, `UIParent`, `CENTER`
- Offset: `x = 0`, `y = 120`
- Scale: `1.0`
- Area size before scale: `760x480`
- Frame strata: `FULLSCREEN_DIALOG`
- Frame level: above spell text fallback and near spell animation effects

The default should sit above the character/action area but below the center of the screen, so it is visible without hiding combat targets.

Recommended root size:

```text
BuffTriggerEffectArea
  width: 760
  height: 480
  frame strata: FULLSCREEN_DIALOG
  frame level: spell animation level + 2

BuffTriggerEffectRoot
  width: 360
  height: 260
  parent: BuffTriggerEffectArea
```

Settings should be independent from spell callout layout:

```ts
buffTriggerEffectUserScale?: number;
buffTriggerEffectOffsetX?: number;
buffTriggerEffectOffsetY?: number;
```

Recommended limits:

- Scale min: `0.5`
- Scale max: `2.0`
- X/Y offsets: no hard clamp; use layout editor drag bounds only if the frame can become unreachable.

Options menu behavior:

- Add a "Buff trigger effect" layout row after the spell effect layout controls.
- Provide scale slider, adjust-location button, and reset button.
- The adjust-location mode should show the actual `BuffTriggerEffectArea` with a sample animation loop or a visible placeholder frame.
- Reset restores default scale `1.0`, offset `0, 120`.

Implementation note: the buff feature can reuse layout editor helper patterns from `spell-animation-effect/layout-editor.ts`, but it should store and apply its own settings. This keeps spell cast title-card placement and buff proc placement independently tunable.

### Style Slots

Each style effect should use a deterministic slot inside `BuffTriggerEffectArea`. This prevents simultaneous buffs from stacking directly on top of each other while keeping the whole cluster movable as one player-configurable area.

Default slot map:

| Row | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 |
| --- | --- | --- | --- | --- | --- |
| Top `y = 110` | `sun_breathing` `x = -240` | `moon_breathing` `x = -120` | `water_breathing` `x = 0` | `flame_breathing` `x = 120` | `thunder_breathing` `x = 240` |
| Middle `y = 0` | `wind_breathing` `x = -240` | `stone_breathing` `x = -120` | `flower_breathing` `x = 0` | `insect_breathing` `x = 120` | `serpent_breathing` `x = 240` |
| Bottom `y = -110` | `love_breathing` `x = -240` | `mist_breathing` `x = -120` | `sound_breathing` `x = 0` | `beast_breathing` `x = 120` | `blood_art` `x = 240` |

If two buffs with the same style are active, they may reuse the same slot; the important rule is that different styles do not collapse to the same center point.

## Runtime Architecture

Add a new feature folder:

```text
src/features/buff-trigger-effect/
  index.ts
  controller.ts
  effect-instance.ts
  assets.ts
  asset-manifest.ts
  layout-editor.ts
  layout-settings.ts
  aura-scanner.ts
  style-slugs.ts
  mappings/
    types.ts
    common.ts
    index.ts
    classes/
      warrior.ts
      mage.ts
      priest.ts
      warlock.ts
      druid.ts
      hunter.ts
      shaman.ts
      paladin.ts
      rogue.ts
      death-knight.ts
```

Recommended responsibilities:

| Module | Responsibility |
| --- | --- |
| `index.ts` | Register events, sync settings, expose preview/status commands. |
| `aura-scanner.ts` | Scan `UnitAura("player", index, "HELPFUL")`, detect gained/refreshed mapped auras. |
| `controller.ts` | Pool effect instances, dedupe rapid retriggers, route style slugs to the renderer. |
| `effect-instance.ts` | Create layered `Frame`/`Texture` regions and run the animation timeline. |
| `assets.ts` | Resolve `assets/buff-effects` texture paths and probe/fallback missing assets. |
| `layout-settings.ts` | Own `BuffTriggerEffectArea` scale, offset, size, defaults, and setting application. |
| `layout-editor.ts` | Drag-to-place UI for the dedicated buff trigger area. |
| `style-slugs.ts` | Central union/list for `sun_breathing` through `blood_art`. |
| `mappings/` | Common/race/class aura-to-style mappings. |

### Event Flow

Register these events:

```text
ADDON_LOADED
PLAYER_LOGIN
PLAYER_ENTERING_WORLD
UNIT_AURA
PLAYER_REGEN_ENABLED
```

MVP event handling:

```text
UNIT_AURA player
  -> scan mapped player auras
  -> compare current aura snapshot with previous snapshot
  -> for each gained/refreshed binding
       -> controller.play(styleSlug, auraName, triggerKind)
```

On `PLAYER_ENTERING_WORLD`, build an initial snapshot without playing effects. This prevents login/reload from firing every active buff at once.

### Aura Snapshot

Store only watched auras, not every aura.

```ts
type ActiveBuffSnapshot = {
  key: string;
  auraName: string;
  spellId?: number;
  count?: number;
  duration?: number;
  expirationTime?: number;
  sourceUnit?: "player" | "pet" | "any";
};
```

Use `spellId` when available. Fall back to localized names because Classic-style APIs and private realms can be inconsistent.

### Mapping Types

```ts
export type BuffTriggerStyleSlug =
  | "sun_breathing"
  | "moon_breathing"
  | "water_breathing"
  | "flame_breathing"
  | "thunder_breathing"
  | "wind_breathing"
  | "stone_breathing"
  | "flower_breathing"
  | "insect_breathing"
  | "serpent_breathing"
  | "love_breathing"
  | "mist_breathing"
  | "sound_breathing"
  | "beast_breathing"
  | "blood_art";

export type BuffTriggerEffectBinding = {
  auraNames: string[];
  auraIds?: number[];
  styleSlug: BuffTriggerStyleSlug;
  priority?: "low" | "normal" | "high";
  source?: "player" | "pet" | "any";
  minStacks?: number;
  retriggerCooldownSeconds?: number;
  note?: string;
};
```

Class mapping files should look like current spell text mappings:

```ts
export const mageBuffTriggerEffectMapping = defineClassBuffTriggerMapping({
  classFileName: "MAGE",
  bindings: [
    {
      auraNames: ["Hot Streak", "炽热连击"],
      styleSlug: "flame_breathing",
      priority: "high"
    }
  ]
});
```

## Class Mapping Direction

The table below is a first-pass design map. Spell IDs and localized aliases should be confirmed in-client before implementation. Keep the mapping high signal: procs, active cooldowns, and defensive states that players care about.

| Class | Starter Buffs / Procs | Style Direction |
| --- | --- | --- |
| Warrior | `Enrage`, `Shield Block`, `Last Stand`, `Recklessness`, `Death Wish`, `Battle Shout` | `beast_breathing`, `stone_breathing`, `flame_breathing`, `thunder_breathing`, `sound_breathing` |
| Mage | `Hot Streak`, `Combustion`, `Icy Veins`, `Fingers of Frost`, `Brain Freeze`, `Arcane Power`, `Ice Barrier` | `flame_breathing`, `water_breathing`, `mist_breathing`, `thunder_breathing`, `moon_breathing` |
| Priest | `Power Infusion`, `Inner Focus`, `Surge of Light`, `Borrowed Time`, `Shadowform`, `Vampiric Embrace`, `Pain Suppression`, `Guardian Spirit` | `sun_breathing`, `flower_breathing`, `moon_breathing`, `blood_art`, `water_breathing`, `love_breathing` |
| Warlock | `Molten Core`, `Decimation`, `Nightfall`, `Metamorphosis`, `Soul Link`, `Fel Armor` | `blood_art`, `flame_breathing`, `moon_breathing`, `serpent_breathing`, `insect_breathing` |
| Druid | `Eclipse (Solar)`, `Eclipse (Lunar)`, `Omen of Clarity`, `Barkskin`, `Savage Roar`, `Tiger's Fury`, `Tree of Life`, `Nature's Grace` | `sun_breathing`, `moon_breathing`, `water_breathing`, `stone_breathing`, `beast_breathing`, `flower_breathing`, `wind_breathing` |
| Hunter | `Bestial Wrath`, `Rapid Fire`, `Lock and Load`, `Deterrence`, `Aspect of the Hawk`, `Master's Call` | `beast_breathing`, `thunder_breathing`, `flame_breathing`, `wind_breathing`, `serpent_breathing` |
| Shaman | `Maelstrom Weapon`, `Elemental Mastery`, `Clearcasting`, `Tidal Waves`, `Lightning Shield`, `Water Shield`, `Earth Shield`, `Shamanistic Rage` | `thunder_breathing`, `water_breathing`, `flame_breathing`, `wind_breathing`, `stone_breathing` |
| Paladin | `Avenging Wrath`, `Divine Shield`, `Divine Protection`, `Holy Shield`, `Sacred Shield`, `Art of War`, `Infusion of Light`, `Divine Plea` | `sun_breathing`, `flame_breathing`, `stone_breathing`, `love_breathing`, `water_breathing` |
| Rogue | `Slice and Dice`, `Evasion`, `Sprint`, `Vanish`, `Overkill`, `Master of Subtlety`, `Adrenaline Rush`, `Blade Flurry`, `Cold Blood` | `beast_breathing`, `mist_breathing`, `thunder_breathing`, `serpent_breathing`, `insect_breathing` |
| Death Knight | `Killing Machine`, `Freezing Fog`, `Bone Shield`, `Vampiric Blood`, `Icebound Fortitude`, `Unbreakable Armor`, `Dancing Rune Weapon`, `Lichborne`, `Blood Tap` | `moon_breathing`, `mist_breathing`, `stone_breathing`, `blood_art`, `beast_breathing` |

## Asset Model

Use a dedicated root so buff indicators can evolve independently from spell callout title-card assets:

```text
assets/buff-effects/
  <style_slug>/
    <style_slug>_indicator_core.tga
    <style_slug>_trigger_burst.tga
    <style_slug>_particles_4x4.tga
    <style_slug>_active_glow.tga
```

Runtime path:

```text
Interface\AddOns\SlayerUI\assets\buff-effects\<style_slug>\<style_slug>_<role>
```

Minimum playable build:

- `indicator_core`
- `trigger_burst`

Full build:

- 15 style presets x 4 files = 60 files.

The effect can fall back to existing `assets/spell-effects/<style_slug>/` style packs while new buff-specific assets are missing, but the final feature should use `assets/buff-effects/` so the visual scale and composition are tuned for proc indicators.

## Options And Commands

Add a separate enable setting only if product testing shows users want independent on/off control:

```ts
enableBuffTriggerEffect?: boolean;
```

Recommended default:

- If `enableSpellTextEffect` is true, buff indicators default true.
- If the setting exists, it overrides the inherited behavior.

Always add separate layout settings for the dedicated play area:

```ts
buffTriggerEffectUserScale?: number;
buffTriggerEffectOffsetX?: number;
buffTriggerEffectOffsetY?: number;
```

Useful slash commands:

| Command | Behavior |
| --- | --- |
| `/slayer buff` | Print status, loaded class, watched aura count, last trigger. |
| `/slayer buff test` | Preview the default style, `sun_breathing`. |
| `/slayer buff test <style_slug>` | Preview a specific style preset. |
| `/slayer buff layout` | Toggle the buff trigger area layout editor. |

## Performance Notes

- Scan only player helpful auras on `UNIT_AURA`.
- Precompute lookup maps by `auraId` and localized `auraName`.
- Maintain a compact active snapshot of watched auras only.
- Pool 2-3 effect instances. If all are active, restart the newest high-priority effect or skip low-priority effects.
- Do not create textures during aura events. Create effect instances on first sync/preload.
- Use a shared `OnUpdate` loop per active instance, following `spell-animation-effect/effect-instance.ts`.

## Implementation Phases

1. **Scanner and data model**: add mapping files, `UNIT_AURA` scan, active snapshot, preview/status command.
2. **Dedicated play area**: add `BuffTriggerEffectArea`, saved scale/offset settings, reset behavior, and `/slayer buff layout`.
3. **Renderer MVP**: style-only effect renderer with fallback to existing `assets/spell-effects` style assets.
4. **Dedicated assets**: add `assets/buff-effects`, manifest generation, and the 15 effect presets from `asset-prompts.md`.
5. **Class mapping pass**: fill every class mapping with high-signal buffs and localized aliases.
6. **Polish**: optional active echo duration, priority behavior, separate settings checkbox, and options panel controls.

## Acceptance Criteria

- A mapped buff gain plays the correct style effect.
- The same breathing style uses one reusable effect regardless of which buff triggered it.
- Blood Demon Art uses the `blood_art` effect preset.
- Login/reload does not spam effects for already-active buffs.
- Rapid aura refreshes are deduped.
- All buff trigger effects play inside `BuffTriggerEffectArea`.
- Players can adjust the buff trigger area scale and location independently from spell callouts.
- Missing assets fall back gracefully or skip with a debug status line.
- The build copies `assets/buff-effects` into `dist/SlayerUI/assets/buff-effects`.
- `npm run typecheck` and `npm run build` pass after implementation.
