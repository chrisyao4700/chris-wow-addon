<p align="center">
  <img src="assets/logo.svg" alt="Slayer UI logo" width="220">
</p>

# Slayer UI

A World of Warcraft **Titan Reforged Classic** addon that reskins and reorganizes the bottom of your UI with a Taisho-era demon-slayer aesthetic — lacquered seals, ink callouts, breathing-style spell flourishes, and a cleaner action bar layout.

Built with TypeScript and [TypeScriptToLua](https://typescripttolua.github.io/), packaged for CurseForge.

**Target client:** Titan Reforged (`_classic_titan_`), interface `38001`.

---

## Features

### Slayer action bar layout

Reorganizes Blizzard's bottom UI into a compact grid:

- **60 action buttons** arranged in a 12×5 grid (bottom-left)
- **System menu buttons** in a two-row layout (micro buttons + bag bar)
- **Stance / shapeshift bar** anchored above the action grid
- **Experience and status bars** repositioned above the grid
- Default main-menu bar chrome hidden for a cleaner look

Toggle in settings or disable entirely to restore Blizzard's default layout.

### Spell text on cast

Shows a stylized **breathing-style callout** when you cast mapped abilities — e.g. water, thunder, or beast breathing forms. Text uses client Kai fonts on zhCN/zhTW clients when available.

### Spell animation effects

Layered **TGA sprite effects** (energy arcs, particles, impact flashes, atmosphere) play alongside spell callouts for mapped spells. Adjust scale and on-screen position in settings, or use the drag-to-move layout editor.

### Demon Slayer menu bar buttons

Replaces micro-menu button art (character, spellbook, map, etc.) with custom `.tga` textures. Original click behavior, keybinds, alerts, and tooltips are preserved. Bag slot buttons keep default Blizzard art.

### Minimap button

A round logo button on the minimap opens settings (left-click) or prints debug info (right-click). Drag it around the minimap edge to reposition.

---

## In-game usage

### Slash commands

| Command | Description |
| --- | --- |
| `/slayer` | List all commands |
| `/slayer options` | Open settings |
| `/slayer layout` | Sync action bar layout and print status |
| `/slayer effect` | Print spell text / animation effect status |
| `/slayer effect test` | Preview a spell callout overlay |
| `/slayer effect layout` | Toggle the spell effect position editor |
| `/slayer buttons` | Sync and print system button skin status |
| `/slayer debug` | Print client build, interface, and locale info |
| `/slayer stats` | Show how many times the addon has loaded |
| `/slayer reset` | Reset the launch counter |

`/slayerui` is an alias for `/slayer`.

### Settings

Open **Interface → AddOns → Slayer UI**, or run `/slayer options`. All major features can be toggled independently.

Settings are stored in `SlayerUIDB`. If you previously used Chris Wow Addon, settings migrate automatically from `ChrisWowAddonDB` on first load.

---

## Installation (players)

1. Install **SlayerUI** into your `Interface/AddOns` folder (CurseForge or a release zip).
2. Launch Titan Reforged and enable the addon on the character select screen.
3. `/reload` or log in, then run `/slayer options` to configure features.

Expected install path on macOS (Battle.net default):

```text
/Applications/World of Warcraft/_classic_titan_/Interface/AddOns/SlayerUI
```

---

## Development

### Prerequisites

- Node.js 22+
- npm
- World of Warcraft Titan Reforged installed (for local install / dev sync)

### Quick start

```sh
npm install
npm run build
```

Build output:

| Path | Purpose |
| --- | --- |
| `build/main.lua` | Raw TypeScriptToLua output |
| `main.lua` | Root Lua entry copied into the addon package |
| `dist/SlayerUI/` | Installable addon folder |
| `dist/SlayerUI-1.0.0.zip` | Release zip (`npm run package`) |

### Dev loop

For day-to-day work, use the dev watcher. It builds, copies into your WoW `AddOns` folder, and watches TypeScript, assets, and the TOC. After each change, `/reload` in-game.

```sh
npm run dev
```

Override the install path:

```sh
WOW_ADDONS_DIR="/path/to/Interface/AddOns" npm run dev
```

One-shot install without watch:

```sh
npm run install:addon
```

### npm scripts

| Script | Description |
| --- | --- |
| `npm run build` | Generate asset manifest, compile TS → Lua, copy to `dist/` |
| `npm run dev` | Build, install, and watch for changes |
| `npm run watch` | TypeScript watch only (no asset copy) |
| `npm run package` | Build and create `dist/SlayerUI-<version>.zip` |
| `npm run install:addon` | Build and copy into WoW `AddOns` |
| `npm run typecheck` | TypeScript check without emitting Lua |
| `npm run clean` | Remove `build/`, `dist/`, and root `main.lua` |

### Project layout

```text
src/                          TypeScript source (compiled to main.lua)
  features/
    action-layout/            Bottom bar grid, system buttons placement
    spell-text-effect/        Cast callout text and class mappings
    spell-animation-effect/   Layered spell VFX and layout editor
    system-buttons/           Micro-menu texture skins
  ui/                         Settings panel and minimap button
assets/
  system-buttons/             Micro-menu .tga textures
  spell-effects/              Breathing-style spell effect .tga assets
design/                       Feature specs, asset prompts, research notes
scripts/                      Build, dev watcher, manifest generation
SlayerUI.toc                  Addon table of contents
```

Entry point: `src/main.ts`.

### Adding assets

- **System buttons:** drop `.tga` files into `assets/system-buttons/` (see `design/system-buttons/`).
- **Spell effects:** drop `.tga` files into `assets/spell-effects/` (see `design/spell-animation-effect/`). Run `npm run build` to regenerate the bundled asset manifest.

---

## Publishing (CurseForge)

This repo includes `.pkgmeta` and a GitHub Actions workflow (`.github/workflows/release.yml`) using [BigWigsMods/packager](https://github.com/BigWigsMods/packager).

Before publishing:

1. Create the addon project on CurseForge.
2. Replace `## X-Curse-Project-ID: 0` in `SlayerUI.toc` with your project ID.
3. Add a GitHub repository secret named `CF_API_KEY`.
4. Push a version tag such as `v1.0.0`.

The workflow runs `npm ci`, `npm run build`, and publishes the packaged release.

---

## License

MIT — see `SlayerUI.toc`.
