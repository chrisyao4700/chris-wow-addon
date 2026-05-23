# System Button TGA Generation Prompts

Use these prompts with an image agent that can export **64×64 `.tga`** icons with alpha. Each file name must match the **Asset ID** column (plus `.tga`).

Global style block — prepend to every prompt:

> Square game UI icon, 64x64, transparent background, Taisho-era Japanese fantasy demon-slayer corps aesthetic, lacquered wood and brass medallion, ink brush silhouette, no text, no anime logos, no copyrighted characters, high contrast readable at 28px, centered glyph, soft outer glow, subtle paper texture, vector-clean edges suitable for WoW .tga

Optional state variants (same composition, small changes):

- **Pushed** (`{id}-pushed.tga`): darker lacquer, pressed inward, brass rim dimmed 20%.
- **Disabled** (`{id}-disabled.tga`): desaturated grey-brown, 50% opacity feel.
- **Highlight** (`{id}-highlight.tga`): brighter brass rim, soft white edge bloom (can use ADD blend in-game).

---

## Micro Menu Buttons

| Asset ID | Prompt (append after global style block) |
| --- | --- |
| `character` | Silhouette of a corps member profile bust inside a round brass seal, haori collar lines, calm teal accent. |
| `spellbook` | Closed spell scroll bound with cord, wax seal with flame-orange accent, brass corner guards. |
| `talents` | Three vertical training tablets or wooden plaques, gold rank marks, teal accent stripe. |
| `professions` | Hammer and chisel over lacquer tray, forge spark orange accent, brass frame. |
| `achievements` | Hexagonal honor medal with sunburst engraving, gold brass, red lacquer backing. |
| `quest-log` | Open mission journal with bookmark ribbon, ink brush check mark, paper glow pages. |
| `social` | Two overlapping speech fans (sensu), teal lacquer, brass rivets. |
| `guild` | Corps banner pennant on short pole, checker band detail in teal and black, gold finial. |
| `friends` | Pair of linked prayer beads or twin talismans, warm paper glow, teal cord. |
| `world-map` | Folded travel map with compass rose cut in brass, ink mountain silhouette, teal sea accent. |
| `pvp` | Crossed practice swords behind lacquer shield, crimson accent, aggressive but clean silhouette. |
| `dungeon-finder` | Torii gate arch framing a dark cave mouth, teal interior glow, brass gate caps. |
| `group-finder` | Three small corps badges in a row linked by red thread, gold rims. |
| `quick-join` | Single lightning-slash door glyph on black lacquer, electric blue accent. |
| `collections` | Display case with relic silhouette (mask shape abstract), brass shelf, purple-grey shadow. |
| `adventure-guide` | Lantern illuminating bestiary page, flame orange glass, brass handle. |
| `raid` | Raid horn or conch shell with red cord, multiple small flame motes, dark lacquer base. |
| `shop` | Merchant coin pouch with tied strings, gold coins peeking, brass clasp, neutral brown leather. |
| `game-menu` | Nine-dot grid carved into lacquer square, brass inlay lines, teal corner cuts. |
| `help` | Question mark as ink brush stroke inside paper circle, soft teal wash, brass ring. |
| `housing` | Small wooden machiya facade icon, warm lantern glow, teal roof trim. |

## Export Checklist

For each asset ID:

1. Generate `64x64` PNG with transparency.
2. Convert to `.tga` (32-bit BGRA).
3. Save as `assets/system-buttons/{assetId}.tga`.
4. Optionally export `-pushed`, `-disabled`, `-highlight` variants.
5. Run `npm run build` (or your usual addon build) so files copy into `dist/ChrisWowAddon/assets/system-buttons/`.
6. In-game: `/cwa buttons` should show `Loaded assets: N/N` increasing as files appear.

## Negative Prompts (include when your tool supports them)

`text, letters, numbers, watermark, photorealistic face, anime screenshot, Demon Slayer logo, kanji title, copyrighted character, busy background, low contrast, blurry, white matte fringe`
