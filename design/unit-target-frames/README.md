# 鬼灭之刃 Inspired Unit And Target Frames

This folder defines the visual and information design for the addon's player unit frame and target frame. The goal is to keep the gameplay clarity of the original World of Warcraft frames while giving the shell, accents, and labels a Taisho-era demon-slayer mood: ink-dark lacquer, brass trim, paper texture, sword-edge cuts, and breathing-style color effects.

No character art, logos, or copied anime assets are required. The style should be inspired by the genre cues: brush ink, haori-like geometric accents, flame/water/thunder motifs, and elegant Chinese/Japanese calligraphy labels.

## Files

- [mockup-player-frame.svg](./mockup-player-frame.svg): proposed player/unit frame composition.
- [mockup-target-frame.svg](./mockup-target-frame.svg): proposed target frame composition.
- [original-wow-parity-checklist.md](./original-wow-parity-checklist.md): information checklist against the original WoW player/target UI.

## Design Goals

- Preserve original WoW readability first: portrait, name, level, health, power, status, PvP, leader/loot/raid markers, elite/rare classification, death/offline/tapped state, buffs/debuffs, and click/tooltip behavior must all have a home.
- Make the player frame feel like a Demon Slayer Corps profile plate and the enemy target frame feel like a demon encounter plate.
- Let class and target relationship drive the accent color through the existing breath-style system in `src/features/unit-frames/breath-styles.ts`.
- Keep all text compact and readable at WoW UI scale. The visual style should sit around the information, not cover it.
- Support English and Chinese labels. Chinese labels can be primary when the client locale is `zhCN` or `zhTW`.

## Frame Size And Layout

The current addon frame is `268 x 88`. For full original-WoW parity, use a slightly taller final frame:

- Core frame: `292 x 104`
- Portrait: `62 x 62`
- Main content left edge: `76`
- Right padding: `10`
- Status icon rail: top-right, `14 x 14` icons
- Buff/debuff anchor: below the target frame, outside the core shell
- Threat/combat glow: outside edge, additive, never under text

The frame is divided into five zones:

| Zone | Contents |
| --- | --- |
| Portrait seal | Unit portrait, level medallion, dead/offline overlay, elite/rare crescent for target |
| Identity row | Name, class/creature/reaction color, PvP and raid target marker |
| Rank row | WoW class icon, player corps rank or target classification, breath style subtitle |
| Resource stack | Health bar, power bar, numeric/percent text |
| Status rail | Combat/resting, leader, master looter, PvP faction, threat/tap state |

## Player Frame Treatment

The player frame should read as "鬼杀队 member":

- Subtitle: `鬼杀队 · 剑士` or `Demon Slayer Corps`.
- Class icon: show the original WoW class icon before the subtitle so the real class identity stays visible even when the text is stylized as a breathing style.
- Rank badge: `甲` through `癸`, derived from player level.
- Breath style badge: class-based, using the existing mapping.
- Status icons: resting, combat, PvP, party leader, master looter.
- Health/power labels: retain actual values or percent according to the user's WoW setting when possible; otherwise show percent with compact fallback.
- Portrait seal: brass ring with a dark ink mat and a small level medallion.

## Target Frame Treatment

The target frame changes mood based on relation:

- Enemy target: "demon encounter" shell with red/black ink edge, classification badge, and threat glow.
- Friendly target: "ally" shell with blue/teal Corps accent.
- Player targets: show their original WoW class icon before the target subtitle; non-player targets can use a creature/classification badge later.
- Elite/rare/worldboss: crescent/crest around portrait, matching the original dragon-style information role without copying its art.
- Tapped/unavailable: desaturate bars and add a grey slash overlay.
- Dead/ghost: darken portrait and show skull/ghost overlay.
- Buffs/debuffs: attach below the target frame in the same icon order and filter behavior as original WoW.

## Visual Tokens

| Token | Value | Usage |
| --- | --- | --- |
| Ink black | `#100d0b` | frame body, shadow |
| Lacquer red | `#6f161b` | enemy target shell |
| Corps teal | `#164c4f` | friendly accents, checker detail |
| Brass gold | `#d9b35f` | borders, rank medallions |
| Paper glow | `#f4e0b0` | small labels and highlights |
| Blood red | `#c63b3f` | enemy health/accent |
| Water blue | `#2f7ee6` | mage/water accents |
| Flame orange | `#ef6a2e` | flame accents |

## Implementation Notes

The current implementation already covers portrait, name, rank/subtitle, WoW class icon for the player and player targets, health, power, class-based breath colors, enemy/friendly target styling, and hiding the Blizzard player/target frames.

For full parity, the next implementation pass should add:

- Level/classification text and portrait badges.
- Actual health/power values in addition to percentages.
- PvP, combat/resting, leader/master-looter, raid target, tapped, dead/ghost, offline, elite/rare/worldboss, and threat states.
- Target buff/debuff anchors.
- Secure click/tooltip behavior equivalent to the original frame.

See [original-wow-parity-checklist.md](./original-wow-parity-checklist.md) for the detailed checklist and suggested WoW API hooks.
