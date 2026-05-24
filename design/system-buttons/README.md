# Demon Slayer System Menu Buttons

This folder defines the visual replacement for Blizzard's bottom-right **micro menu buttons** (character, spellbook, map, etc.). **Bag bar buttons** (backpack and bag slots) are left on default Blizzard art.

The runtime feature lives in `src/features/system-buttons/`. It swaps button textures when matching `.tga` files are present under `assets/system-buttons/`. Until those files exist, the feature stays enabled in settings but skips buttons with missing art (no green "missing texture" squares).

## Goals

- Keep original WoW click behavior, keybinds, alerts, and tooltips.
- Replace only the visible button art with a Taisho-era demon-slayer UI language: lacquered seals, brass rims, ink silhouettes, haori geometry, and breathing-style accent colors.
- Work with or without the addon's compact action bar layout.
- Ship art as separate `.tga` files so another agent or artist can generate them from the prompts in [asset-prompts.md](./asset-prompts.md).

## Technical Spec

| Item | Value |
| --- | --- |
| Canvas size | `64 x 64` pixels per icon (displayed at ~28px in-game) |
| File format | `.tga`, 32-bit RGBA, straight alpha |
| Install path | `assets/system-buttons/{assetId}.tga` |
| Optional states | `{assetId}-pushed.tga`, `{assetId}-disabled.tga`, `{assetId}-highlight.tga` |
| In-game path | `Interface\AddOns\SlayerUI\assets\system-buttons\{assetId}` |

If optional state files are omitted, the addon reuses the normal texture for that state.

## Asset ID List

These stems must match `src/features/system-buttons/button-registry.ts`.

| Asset ID | Used for |
| --- | --- |
| `character` | Character / paper doll |
| `spellbook` | Spellbook, player spells |
| `talents` | Talents |
| `professions` | Professions / trade skills |
| `achievements` | Achievements |
| `quest-log` | Quest log |
| `social` | Social browser |
| `guild` | Guild (overlay on social in some clients) |
| `friends` | Friends |
| `world-map` | World map |
| `pvp` | PvP |
| `dungeon-finder` | Dungeon finder (LFD) |
| `group-finder` | Group finder (LFG) |
| `quick-join` | Quick join |
| `collections` | Collections / journal |
| `adventure-guide` | Adventure guide / encounter journal |
| `raid` | Raid browser |
| `shop` | Shop (overlay on help in some clients) |
| `game-menu` | Main menu |
| `help` | Help |
| `housing` | Housing (if present on client) |

## Visual Language

Shared Taisho-era demon-slayer UI tokens:

- Ink black `#100d0b` for shadows and silhouettes
- Lacquer red `#6f161b` for danger/menu emphasis
- Corps teal `#164c4f` for calm utility buttons
- Brass gold `#d9b35f` for rims and highlights
- Paper glow `#f4e0b0` for inner glyphs

**Do not** include copyrighted Kimetsu no Yaiba logos, character faces, or exact costume copies. Use genre cues only: sword guards, wisteria dots, checkered bands, flame/water/thunder abstract motifs.

## Verification

1. Drop finished `.tga` files into `assets/system-buttons/`.
2. `/reload` or restart the client.
3. Enable **Demon Slayer menu bar buttons** in `/slayer options`.
4. Run `/slayer buttons` to print how many frames and assets loaded.

## Files

- [asset-prompts.md](./asset-prompts.md): copy-paste prompts for an image/TGA generation agent.
