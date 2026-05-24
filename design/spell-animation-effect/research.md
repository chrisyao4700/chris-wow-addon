# Research: Cartoon Spell Text Animation for WoW Addon

Date: 2026-05-23  
Goal: turn an existing "text-only on spell trigger" effect into a short, polished, cartoon/anime-style spell callout inspired by a "水之呼吸 - 水面斩" water-slash moment.

## Short Recommendation

Build the effect as a layered 2D UI animation, not as live vector drawing. In WoW addon land, the most reliable path is:

1. Pre-render the expensive art: brush text, water slash ribbons, foam, ink splatter, speed lines, mist, and impact flash as transparent texture assets.
2. Compose those assets at runtime with `Frame`, `Texture`, and `FontString` layers anchored to the same frame/point used by the current text-only effect.
3. Use native `AnimationGroup` for simple alpha/scale/translation, and a tiny shared `OnUpdate` keyframe driver for sprite-sheet frame selection, non-linear easing, and synchronized multi-layer timing.
4. Pool the frames and textures, preload the art, and only call `:Show()` plus `:Play()` when the chosen spell fires.

This keeps the addon fast, avoids trying to draw complex curves in Lua, and matches how mature WoW visual addons approach complex effects: they assemble textures, groups, animation presets, and stop-motion frames instead of generating rich art procedurally.

## Visual Target

The target should feel like a short anime title-card impact:

- Primary text: `水之呼吸` as a smaller lead-in, then `水面斩` as the large hit.
- Motion: fast slash-in, overshoot, 250-400 ms hold, watery dissolve/fade-out.
- Shape language: bold brush lettering, thick dark outline, white/cyan interior highlights, wave-shaped ribbons, foam curls, ink flecks, and diagonal sword-line energy.
- Palette: deep ink navy, off-white, cyan, teal, pale foam blue, and a small amount of warm cream only for highlight contrast.
- Camera feel: UI stays fixed in screen space, but layers create a "camera punch" by scaling from 0.92 to 1.08, then settling at 1.0.

Important IP note: do not extract Demon Slayer frames, logos, game textures, or fonts. Treat it as an inspiration target: ukiyo-e water, brush-calligraphy title impact, layered 2D/3D-feeling motion. Make original assets and keep the displayed spell labels configurable. If this is distributed publicly, avoid shipping copyrighted phrase/art from Demon Slayer as hard-coded branding.

## Reference Findings

### Demon Slayer / Hinokami Chronicles Aesthetic

The official Sega page for *Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles* positions the game around faithful anime recreation and "iconic breathing styles," which supports using short, highly recognizable elemental callouts as the design goal. The important part for implementation is not literal copying, but the idea that a combat action gets a signature visual identity through a burst of stylized element motion and text.

A creator interview about the anime's water-breathing look points to three useful production ideas:

- Water is not just a particle effect; it is graphic design. The waves borrow from ukiyo-e print language, especially bold white wave crests and stylized outlines.
- The final look combines dimensional motion with 2D keyframes layered over it. For a WoW addon, the equivalent is "sprite sheet plus texture layers," not pure procedural animation.
- Line weight matters. Rich effects can bury outlines, so the text and main wave stroke need strong dark edges and controlled glow.

### WoW Addon Visual Patterns

WeakAuras is the best practical reference point. Its README highlights custom textures, progress textures, preset/user-defined animations, grouping, and CPU-conscious loading/unloading. Its ecosystem also includes stop-motion-style animation support: the Stop Motion extension describes textures that contain each frame as a separate image and supports custom textures. This maps directly to the spell-callout problem.

LibAnimate is another useful recent pattern: a keyframe-driven animation library using a single shared `OnUpdate` handler instead of many separate frame scripts. Whether or not we adopt the library, the design lesson is strong: centralize animation timing and interpolate frame state from keyframes.

Blizzard's addon policy matters for design boundaries. Addons must keep code visible, avoid poor performance, and must not distribute copyrighted materials without authorization. That affects art sourcing: generate or paint original textures and ship them inside your own addon folder.

## Rendering Constraints in WoW

WoW's UI is a 2D retained-mode scene graph. For this effect, the useful primitives are:

- `Frame`: container, anchor, visibility, strata, frame level.
- `Texture`: transparent image layer for water, speed lines, ink, glow, splashes, masks.
- `FontString`: runtime editable text, good for fallback and simple labels.
- `AnimationGroup`: native alpha, scale, translation, rotation-style transitions where supported.
- `OnUpdate`: custom timeline driver for sprite sheets, keyframe sequencing, and non-standard easing.

Practical constraints:

- Prefer power-of-two asset dimensions. Common safe sizes: `256x256`, `512x256`, `1024x512`, `2048x512`.
- Use `.tga` or `.blp` for broad compatibility; `.png` is supported in modern retail but has path/extension details and may be less portable across client flavors.
- Avoid creating frames/textures at cast time. Create a pool during addon load or first use.
- Avoid frequent string/font changes per frame. Animate alpha/position/scale on existing regions instead.
- Keep the effect short: roughly `0.75s` to `1.1s`. Longer overlays become noisy in combat.
- Keep layers bounded. A good first target is 10-16 textures and 2-3 text layers per active effect.

## Proposed Layer Stack

Use one root frame attached to the current text effect's location. The research examples below should be read as "replace the existing text at its current anchor," not "move the callout to a new center-screen position."

```text
SpellEffectRoot
  Layer BACKGROUND
    impactFlash         white/cyan radial slash flash, ADD blend
    mistBack            wide low-alpha mist, BLEND
  Layer ARTWORK
    waterRibbonBack     broad blue slash arc
    waveFoamSheet       sprite sheet, frame-advanced
    inkBurst            black/navy splatter behind text
  Layer OVERLAY
    textShadow          pre-rendered dark outline or FontString shadow
    textMain            pre-rendered text texture or FontString
    textHighlight       thin white/cyan sheen, ADD blend
    speedLines          diagonal streaks
    waterRibbonFront    small foreground crest crossing text
  Layer HIGHLIGHT
    sparkleFoam         3-5 tiny foam/spark textures
```

The strongest recommendation is to make `textMain`, `textShadow`, and `textHighlight` pre-rendered textures for each named spell effect, because WoW `FontString` cannot easily produce the "cartoon title card" stroke/fill/sheen quality. Keep a `FontString` fallback so future spells can show uncustomized text before custom art exists.

## Animation Timeline

Total duration: about `0.92s`.

| Time | Layer | Action |
| --- | --- | --- |
| `0.00s` | root | Show frame, set alpha 1, scale 0.92 |
| `0.00-0.08s` | impactFlash | Alpha 0 -> 0.9 -> 0, scale 0.7 -> 1.25 |
| `0.03-0.16s` | waterRibbonBack | Slash sweeps diagonally, alpha 0 -> 1, scale X 0.65 -> 1.05 |
| `0.06-0.20s` | textShadow/textMain | Pop in with alpha 0 -> 1, scale 0.78 -> 1.10 -> 1.00 |
| `0.10-0.34s` | waveFoamSheet | Advance 8-12 frames of foam curls along the slash |
| `0.16-0.45s` | textHighlight | Thin sheen crosses text from left to right, ADD blend |
| `0.24-0.52s` | sparkleFoam | Small pieces drift outward, alpha fades |
| `0.48-0.80s` | all text | Hold, slight downward settle of 4-8 px |
| `0.70-0.92s` | all layers | Fade out, mist moves outward, root scale 1.00 -> 1.03 |

Use stepped sprite timing for foam/water. The anime/cartoon feel is stronger when the main wave changes on key frames rather than continuously morphing every frame.

## Asset Pipeline

Recommended files:

```text
assets/spell-effects/
  shared/
    shared_ink_burst_01.tga
    shared_speed_lines_01.tga
    shared_slash_mask_01.tga
    shared_foam_sparkle_01.tga
    shared_droplet_trail_01.tga
  water_breathing/
    water_breathing_energy_back.tga
    water_breathing_energy_front.tga
    water_breathing_particles_4x4.tga
    water_breathing_impact_flash.tga
    water_breathing_atmosphere.tga
    spells/
      water_surface_slash/
        water_surface_slash_text_main.tga
        water_surface_slash_text_shadow.tga
        water_surface_slash_text_sheen.tga
```

At runtime, load them from `Interface\AddOns\SlayerUI\assets\spell-effects\...` without the `.tga` suffix, matching the naming rules in `design/spell-animation-effect/asset-prompts.md`. The full cross-style asset catalog lives in `asset-prompts.md`; this research doc uses `water_breathing/spells/water_surface_slash` as the implementation example.

Implementation note: `scripts/build-addon.mjs` must copy `assets/spell-effects` into `dist/SlayerUI/assets/spell-effects`, otherwise the runtime paths below will work in source but fail in packaged builds.

Art notes:

- Export all assets with transparent alpha.
- Leave generous transparent padding so scale/rotation does not crop.
- For sprite sheets, use an even grid such as `4x4` or `6x4`; keep each cell the same size.
- Use `BLEND` for ink/text/water bodies and `ADD` for flashes/sheen/sparkle only.
- Make text texture wide enough for localized variants. For Chinese/Japanese-style labels, a `1024x256` texture is usually enough.
- Add a subtle dark outer contour to every bright element. WoW combat backgrounds are visually busy.

## Runtime Architecture

### Placement Rule

The effect should inherit the current text-only display location. Do not hard-code a new `UIParent` center anchor unless the existing implementation has no reusable anchor.

Recommended approach:

- If the current text is a `FontString`, wrap it in or reuse its parent frame as the effect root anchor.
- If the current text is already inside a display frame, create `SpellEffectRoot` as a child/sibling of that frame and copy the same point, relative frame, relative point, x offset, and y offset.
- Keep every decorative layer positioned relative to `SpellEffectRoot`, so later art polish cannot drift away from the location users already expect.
- Add optional user offsets only after preserving the default current location.

### Event Flow

The existing trigger can call the effect directly:

```lua
SpellEffectController:Play({
  spellId = 12345,
  styleSlug = "water_breathing",
  spellSlug = "water_surface_slash",
  leadText = "水之呼吸",
  mainText = "水面斩",
})
```

If the addon listens itself, prefer a narrow spell whitelist:

```lua
local watchedSpells = {
  [12345] = "water_surface_slash",
}

frame:RegisterEvent("UNIT_SPELLCAST_SUCCEEDED")
frame:SetScript("OnEvent", function(_, event, unit, castGUID, spellId)
  if unit ~= "player" then return end
  local spellSlug = watchedSpells[spellId]
  if spellSlug then
    SpellEffectController:PlaySpell(spellSlug, spellId)
  end
end)
```

### Effect Pool

Create 2-3 reusable effect instances:

```lua
local pool = {}

local function AcquireEffect(anchorFrame)
  for _, effect in ipairs(pool) do
    if not effect.active then
      effect:SetAnchorFrame(anchorFrame)
      return effect
    end
  end
  if #pool < 3 then
    local effect = CreateWaterSlashEffect(anchorFrame)
    pool[#pool + 1] = effect
    return effect
  end
end
```

If a spell is spammed faster than the animation duration, either restart the newest effect or ignore retriggers for `0.35s`. Do not allow unlimited overlapping callouts.

### Frame Construction Sketch

```lua
local function CreateLayer(parent, layer, texturePath, blendMode)
  local tex = parent:CreateTexture(nil, layer)
  tex:SetTexture(texturePath)
  tex:SetBlendMode(blendMode or "BLEND")
  tex:SetPoint("CENTER")
  tex:Hide()
  return tex
end

function CreateWaterSlashEffect(parent)
  local root = CreateFrame("Frame", nil, parent or UIParent)
  root:SetSize(900, 360)
  root:SetFrameStrata("HIGH")
  root:Hide()

  function root:SetAnchorFrame(anchorFrame)
    self:ClearAllPoints()
    if anchorFrame then
      self:SetPoint("CENTER", anchorFrame, "CENTER", 0, 0)
    else
      -- Fallback only; production should pass the current text display anchor.
      self:SetPoint("CENTER", UIParent, "CENTER", 0, 0)
    end
  end

  root:SetAnchorFrame(parent)

  local mediaRoot = "Interface\\AddOns\\SlayerUI\\assets\\spell-effects\\"
  local styleRoot = mediaRoot .. "water_breathing\\"
  local spellRoot = styleRoot .. "spells\\water_surface_slash\\"
  local sharedRoot = mediaRoot .. "shared\\"

  root.impactFlash = CreateLayer(root, "BACKGROUND", styleRoot .. "water_breathing_impact_flash", "ADD")
  root.waterBack = CreateLayer(root, "ARTWORK", styleRoot .. "water_breathing_energy_back", "BLEND")
  root.foam = CreateLayer(root, "OVERLAY", styleRoot .. "water_breathing_particles_4x4", "BLEND")
  root.inkBurst = CreateLayer(root, "ARTWORK", sharedRoot .. "shared_ink_burst_01", "BLEND")
  root.textShadow = CreateLayer(root, "OVERLAY", spellRoot .. "water_surface_slash_text_shadow", "BLEND")
  root.textMain = CreateLayer(root, "OVERLAY", spellRoot .. "water_surface_slash_text_main", "BLEND")
  root.textSheen = CreateLayer(root, "HIGHLIGHT", spellRoot .. "water_surface_slash_text_sheen", "ADD")
  root.speedLines = CreateLayer(root, "HIGHLIGHT", sharedRoot .. "shared_speed_lines_01", "ADD")
  root.mist = CreateLayer(root, "BACKGROUND", styleRoot .. "water_breathing_atmosphere", "BLEND")

  return root
end
```

### Sprite Sheet Frame Selection

Use `SetTexCoord` to reveal one cell of a grid. This is the workhorse for water curls, foam, ink bursts, and trailing slash fragments.

```lua
local function SetSpriteFrame(texture, frameIndex, columns, rows)
  local zeroIndex = frameIndex - 1
  local col = zeroIndex % columns
  local row = math.floor(zeroIndex / columns)
  texture:SetTexCoord(
    col / columns, (col + 1) / columns,
    row / rows, (row + 1) / rows
  )
end
```

### Keyframe Driver

Native `AnimationGroup` is fine for simple fade-in/fade-out. For synchronized cartoon timing, a small keyframe driver is easier to reason about:

```lua
local function EaseOutBack(t)
  local c1, c3 = 1.70158, 2.70158
  return 1 + c3 * (t - 1)^3 + c1 * (t - 1)^2
end

local function Lerp(a, b, t)
  return a + (b - a) * t
end

function effect:Play()
  self.active = true
  self.startTime = GetTime()
  self:Show()
  self:SetScript("OnUpdate", self.OnUpdate)
end

function effect:OnUpdate()
  local t = GetTime() - self.startTime

  local pop = math.min(math.max((t - 0.06) / 0.14, 0), 1)
  local scale = Lerp(0.78, 1.10, EaseOutBack(pop))
  self.textMain:SetScale(scale)
  self.textShadow:SetScale(scale)
  self.textMain:SetAlpha(pop)
  self.textShadow:SetAlpha(pop)

  local foamFrame = math.min(16, math.max(1, math.floor((t - 0.10) / 0.025) + 1))
  SetSpriteFrame(self.foam, foamFrame, 4, 4)

  if t >= 0.92 then
    self:SetScript("OnUpdate", nil)
    self:Hide()
    self.active = false
  end
end
```

Use this pattern only for the effect root. Do not put separate `OnUpdate` scripts on every texture.

## WeakAuras Prototype Path

Because the current implementation already triggers text, WeakAuras is a fast prototyping environment:

1. Create a group aura for the spell.
2. Add a Texture region for the water ribbon.
3. Add a Texture or Stop Motion region for the foam sprite.
4. Add Text regions for lead/main text, or texture regions for pre-rendered calligraphy.
5. Configure On Show animations: alpha, scale, translate.
6. Configure On Hide animation: fade out plus slight scale.
7. Once the timing feels right, port the region/layer/timeline into a standalone addon.

WeakAuras is good for timing exploration. A standalone addon is better when you want exact frame pooling, asset loading, lower overhead, and a polished API for multiple spell styles.

## Implementation Plan

### Phase 1: MVP

- Reuse the existing spell trigger.
- Create one pooled effect frame at the same anchor/location as the existing text-only display.
- Use 6 assets: text main, text shadow, text sheen, water ribbon, foam sprite sheet, impact flash.
- Play a `0.9s` timeline with pop-in, water slash, foam frames, and fade-out.
- Add a `0.35s` retrigger cooldown.

Success criteria:

- Spell fires and animation appears within one frame.
- No frame allocation during repeated casts.
- No visual stutter with 10 casts in quick succession.
- Text remains readable against bright and dark combat backgrounds.

### Phase 2: Polish

- Add front ribbon crossing the text.
- Animate the existing text sheen with a brief `ADD` blend sweep.
- Add small foam particles with randomized offsets from a fixed deterministic table.
- Add style registry so other spells can reuse the same effect controller with different assets.
- Add user settings: scale, screen offset, alpha, enable/disable per spell.

### Phase 3: Multi-Spell System

Represent each spell style as data:

```lua
SpellEffectStyles.water_breathing = {
  styleSlug = "water_breathing",
  duration = 0.92,
  assets = {
    waterBack = "water_breathing_energy_back",
    foam = "water_breathing_particles_4x4",
    flash = "water_breathing_impact_flash",
  },
  timeline = "waterSlashV1",
}

SpellEffectDefinitions.water_surface_slash = {
  styleSlug = "water_breathing",
  spellSlug = "water_surface_slash",
  duration = 0.92,
  assets = {
    text = "water_surface_slash_text_main",
    shadow = "water_surface_slash_text_shadow",
    sheen = "water_surface_slash_text_sheen",
  },
}
```

Then map spell IDs to styles:

```lua
SpellEffectSpellIdMap = {
  [12345] = "water_surface_slash",
  [67890] = "flame_burst_title",
}
```

## Performance Guardrails

### Performance Verdict

This design should be safe if it stays a short, pooled, anchored UI effect. WoW can handle a dozen layered textures for less than a second. The dangerous version is not "cartoon text"; it is "unbounded combat-log work plus per-cast allocations plus many large translucent textures stacked over the screen."

Recommended first production budget:

| Area | MVP Budget | Polish Budget | Hard Stop |
| --- | ---: | ---: | ---: |
| Active effect instances | `1` | `2` | `3` |
| Texture regions per instance | `5-8` | `10-16` | `24` |
| Sprite sheets per instance | `1` | `1-2` | `3` |
| Effect duration | `0.75-0.95s` | `0.8-1.1s` | `1.5s` |
| Retrigger cooldown | `0.35s` | `0.25-0.5s` | none |
| Largest single texture | `1024x256` or `1024x512` | `2048x512` | `4096+` |
| Raw texture memory per style | `< 8 MB` | `< 24 MB` | `> 48 MB` |
| Per-frame scripts | `1` active driver | `1` active driver | per-layer `OnUpdate` |

Raw RGBA memory estimate is `width * height * 4` bytes before compression. That means:

| Texture | Approx Raw Memory |
| --- | ---: |
| `1024x256` | `1 MB` |
| `1024x512` | `2 MB` |
| `2048x512` | `4 MB` |
| `2048x1024` | `8 MB` |
| `4096x1024` | `16 MB` |

Compressed `.blp` can be smaller on disk and in memory depending on format, but design around the raw estimate. It keeps the budget honest.

### Likely Bottlenecks

#### 1. CPU: Event And Trigger Work

The spell trigger should be essentially free:

- Prefer `UNIT_SPELLCAST_SUCCEEDED` when it covers the target spell.
- If `COMBAT_LOG_EVENT_UNFILTERED` is required for instant effects, immediately filter source GUID and spell ID.
- Store watched spell IDs in a table for O(1) lookup.
- Do not scan action bars, player talents, buffs, or all auras inside the animation trigger.

Good shape:

```lua
local watchedSpells = {
  [12345] = "water_surface_slash",
}

local playerGUID

local function OnLogin()
  playerGUID = UnitGUID("player")
end

local function OnCombatLogEvent()
  local _, subEvent, _, sourceGUID, _, _, _, _, _, _, _, spellId = CombatLogGetCurrentEventInfo()
  if sourceGUID ~= playerGUID then return end
  local spellSlug = watchedSpells[spellId]
  if not spellSlug then return end
  SpellEffectController:PlaySpell(spellSlug)
end
```

The expensive pattern is a combat-log callback that does additional searching before it knows the event matters.

#### 2. CPU: `OnUpdate`

One `OnUpdate` driver for the root effect is fine. A polished effect running for `0.92s` at 60 fps only gets about 55 updates. With 1 active instance, that is tiny if the update body is arithmetic plus a few property writes.

Avoid inside `OnUpdate`:

- `CreateFrame`, `CreateTexture`, `CreateFontString`.
- New tables like `{ x = ..., y = ... }`.
- String concatenation or formatting.
- `SetTexture` unless swapping a whole style at start.
- `SetText` every frame.
- `ClearAllPoints` / `SetPoint` every frame.
- Loops over arbitrary global state.

Allowed inside `OnUpdate`:

- `SetAlpha`.
- `SetScale` on a small root/inner frame.
- `SetTexCoord` for sprite frame changes.
- `SetVertexColor` for simple tint/fade.
- `SetPoint` only if movement cannot be done another way, and only on 1-2 inner layers.

The key nuance: anchor to the current text location once when the effect starts. Per-frame motion should be relative to that already-anchored root, not repeated anchor discovery.

#### 3. GPU / Fill Rate: Translucent Texture Overdraw

The UI renderer can draw many textures, but large semi-transparent layers stack up. Every translucent pixel over the 3D world costs blending work, and `ADD` blend effects are visually loud. This matters most in raids because the scene behind the UI is already heavy.

Keep the visual footprint tight:

- Do not use full-screen textures for a spell name.
- Use a `900x360` root as an upper bound for the water title card, but let actual texture content occupy less area.
- Crop transparent padding after leaving enough room for scale/rotation.
- Prefer one `2048x512` atlas over many tiny files only when it reduces state changes and file management. Do not make a giant atlas just because it is convenient.
- Limit `ADD` blend to flash, sheen, and small sparkles. Main text/water should usually be `BLEND`.

The highest-risk visual choice is several `2048x1024` low-alpha mist/glow sheets overlapping each other. They may look subtle but they force a lot of blended pixels.

#### 4. Asset Loading / First-Play Stutter

First-time texture loading is a common source of small hitches. The animation may be cheap after assets are resident, but the first spell cast can stutter if every texture is loaded at that moment.

Mitigation:

- Create the frame pool after addon load or shortly after player login.
- Assign all textures once during pool creation.
- Hide the effect root until needed.
- If a style is optional, lazy-create it out of combat or on first configuration open rather than the first combat cast.
- Avoid swapping texture paths during the animation. Pick the style at `PlayStyle`, set/copy the needed paths, then animate alpha/scale/coords only.

#### 5. Layout / Anchor Cost

The user requirement is to display at the current text location. That is also the right performance design: one stable anchor, many local layer animations.

Preferred structure:

```text
CurrentTextAnchorFrame
  SpellEffectRoot           anchored once to CurrentTextAnchorFrame center
    MotionFrame             optional local motion/scale container
      TextLayer
      WaterLayer
      FoamLayer
      FlashLayer
```

`SpellEffectRoot` should not chase the player, nameplate, cursor, or world position every frame. If the existing text location is static UI space, keep it static.

### Animation Driver Choice

There are two viable designs:

| Driver | Best For | Performance Notes |
| --- | --- | --- |
| Native `AnimationGroup` | Alpha, scale, simple translation, simple rotation | Efficient and declarative; less custom code; awkward for sprite sheets and multi-layer state |
| One root `OnUpdate` timeline | Sprite sheets, hand-keyed timing, synchronized layers | Fine if it is one script with no allocations; easier to keep all layers in sync |

Recommendation: use a hybrid only if it keeps code cleaner. For MVP, one root `OnUpdate` is acceptable because the effect is short and bounded. If the effect grows into many continuous transforms, move simple alpha/scale pieces to native `AnimationGroup` and keep `OnUpdate` only for `SetTexCoord` sprite frames.

### Data Shape For Fast Playback

Precompute style and spell constants so `PlaySpell` does very little:

```lua
local Styles = {
  water_breathing = {
    styleSlug = "water_breathing",
    duration = 0.92,
    cooldown = 0.35,
    foamColumns = 4,
    foamRows = 4,
    foamFrameDuration = 0.025,
    assets = {
      waterBack = "water_breathing_energy_back",
      foam = "water_breathing_particles_4x4",
      flash = "water_breathing_impact_flash",
    },
  },
}

local SpellDefinitions = {
  water_surface_slash = {
    styleSlug = "water_breathing",
    spellSlug = "water_surface_slash",
    assets = {
      text = "water_surface_slash_text_main",
      shadow = "water_surface_slash_text_shadow",
      sheen = "water_surface_slash_text_sheen",
    },
  },
}
```

At runtime, avoid building temporary keyframe tables. Store important layer references directly on the effect object:

```lua
function effect:PlaySpell(spellDefinition)
  local now = GetTime()
  local style = Styles[spellDefinition.styleSlug]

  if not style then return end
  if now - self.lastPlayTime < style.cooldown then return end

  self.lastPlayTime = now
  self.style = style
  self.spell = spellDefinition
  self.startTime = now
  self.active = true
  self:Show()
  self:SetScript("OnUpdate", self.OnUpdate)
end
```

### Measuring Addon Cost

Use both subjective and numeric checks. A spell effect can benchmark cleanly but still feel bad if the first play loads textures during combat.

Manual test matrix:

- Cast the watched spell 20 times in a quiet area.
- Cast it 20 times in Valdrakken / Dornogal / another busy hub.
- Cast it during a dungeon pull with nameplates and combat text enabled.
- Spam the trigger faster than the animation duration and verify the overlap cap.
- `/reload`, then trigger once immediately and watch for first-play hitch.

Lightweight profiler helper:

```lua
local profileTotal = 0
local profileCount = 0

function effect:OnUpdate()
  local start = debugprofilestop()

  -- animation update work here

  profileTotal = profileTotal + (debugprofilestop() - start)
  profileCount = profileCount + 1
end

SLASH_SPELLEFFECTPROFILE1 = "/seprofile"
SlashCmdList.SPELLEFFECTPROFILE = function()
  if profileCount == 0 then
    print("SpellEffect: no samples")
    return
  end
  print(("SpellEffect: %.4f ms/update over %d updates"):format(profileTotal / profileCount, profileCount))
end
```

Targets:

- Great: `< 0.03 ms/update`.
- Fine: `< 0.10 ms/update`.
- Investigate: `0.10-0.25 ms/update`.
- Too high for a cosmetic combat effect: `> 0.25 ms/update`.

These are pragmatic addon-level targets, not engine guarantees. The important part is to compare versions against the same machine and scenario.

### Performance-Safe MVP Design

For the first build, use this exact shape:

- `1` effect instance by default, `2` maximum.
- `6` texture regions: shadow text, main text, text sheen, water ribbon, foam sprite sheet, flash.
- `1` root frame anchored to the existing text display location.
- `1` `OnUpdate` while visible.
- `0` allocations during `OnUpdate`.
- `0` `SetTexture` calls during `OnUpdate`.
- `0` anchor changes during `OnUpdate`.
- `0.35s` retrigger cooldown.
- `0.92s` total duration.

This gives the cartoon look while leaving headroom for real combat UI addons.

## Design Details That Make It Feel "Cartoon"

- Overshoot the main text scale. A clean 0.78 -> 1.10 -> 1.00 pop reads better than a linear fade.
- Use stepped foam frames. It feels more like hand-keyed animation than smooth UI interpolation.
- Keep the dark outline visible. Rich water/glow layers should sit behind or crossing only part of the text.
- Let the water slash arrive before the text by 30-60 ms. The viewer reads the slash as the cause, then the title lands.
- Fade with motion, not only alpha. Mist drifting outward and text settling downward makes the fade-out feel intentional.
- Use asymmetric composition. Put `水之呼吸` smaller and slightly above/left; let `水面斩` dominate the center/right.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Text looks like plain UI text | Pre-render the text as texture; use FontString only as fallback |
| Effect is unreadable in raids | Strong shadow layer, restrained glow, short duration, user scale/alpha settings |
| Performance drops during spam | Pool instances, cap overlap, single OnUpdate, retrigger cooldown |
| First cast stutters | Pre-create the pool, assign textures before combat, test after `/reload` |
| GPU overdraw from glow/mist | Keep the effect bounded, limit large translucent layers, use `ADD` sparingly |
| Assets do not load | Use safe paths, power-of-two dimensions, `.tga`/`.blp`, test after full client restart |
| IP/copyright issues | Original assets only, configurable labels, no extracted Demon Slayer or game art |
| Animation feels too smooth and "web UI" | Use stepped sprite frames, held key poses, overshoot timing |

## Final Recommendation

For the first production pass, make one bespoke water-slash style as a standalone addon module that your existing trigger calls. Use pre-rendered text plus sprite-sheet water, not runtime-drawn curves. Once the first style feels good, convert the implementation into a small style registry so future spells only need new assets and timing data.

The core idea is:

```text
spell trigger -> acquire pooled effect -> apply style assets -> play 0.9s timeline -> hide/reuse
```

That is the cleanest route to the "水之呼吸 - 水面斩" cartoon title-card effect while staying inside WoW's UI rendering model.

## Sources

- [Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles official Sega site](https://demonslayer-hinokami.sega.com/index.html) - official game positioning around anime recreation and breathing-style combat visuals.
- [Popverse interview on Demon Slayer water breathing visual language](https://www.thepopverse.com/movies-demon-slayer-kimetsu-no-yaiba-infinity-castle-ufotable-dynamic-anime-honors-koyoharu-gotouge/) - creator discussion of ukiyo-e motifs, water-breathing visual expression, 2D keyframes, and line-weight challenges.
- [Blizzard WoW UI Add-On Development Policy](https://eu.forums.blizzard.com/en/wow/t/wow-user-interface-add-on-development-policy/1642) - policy constraints around free/visible addons, performance, and copyrighted material.
- [WeakAuras2 GitHub README](https://github.com/WeakAuras/WeakAuras2) - reference for custom textures, grouped displays, user-defined animation, and CPU-conscious aura loading.
- [WeakAuras RegionPrototype.lua](https://github.com/WeakAuras/WeakAuras2/blob/main/WeakAuras/RegionTypes/RegionPrototype.lua), [Texture.lua](https://github.com/WeakAuras/WeakAuras2/blob/main/WeakAuras/RegionTypes/Texture.lua), and [Animations.lua](https://github.com/WeakAuras/WeakAuras2/blob/main/WeakAuras/Animations.lua) - source examples for texture regions, animation alpha, offsets, custom animation state, scale, rotation, and color animation.
- [WeakAuras Stop Motion on CurseForge](https://www.curseforge.com/wow/addons/weakauras-stop-motion) - ecosystem example of frame-by-frame / stop-motion texture animation for complex aura visuals.
- [LibAnimate on CurseForge](https://www.curseforge.com/wow/addons/libanimate) - reference pattern for single-driver keyframe interpolation in WoW UI animation.
- [SharedMedia on CurseForge](https://www.curseforge.com/wow/addons/sharedmedia) - common addon ecosystem pattern for registering custom media assets.
- [Warcraft Wiki: TextureBase:SetTexture](https://warcraft.wiki.gg/wiki/API_Texture_SetTexture) - practical API reference for custom texture formats, paths, filtering, and loading behavior.
- [Warcraft Wiki: AnimationGroup:CreateAnimation](https://warcraft.wiki.gg/wiki/API_AnimationGroup_CreateAnimation) - practical API reference for animation group types such as alpha, translation, scale, rotation, and path/control-point animation.
