# Original WoW Player/Target Frame Parity Checklist

Use this as the acceptance checklist before replacing the default Blizzard player and target frames. The custom frame can look different, but every gameplay-relevant piece of original information needs an equivalent.

## Core Identity

| Information | Player frame | Target frame | Design treatment | Current addon |
| --- | --- | --- | --- | --- |
| Unit portrait | Yes | Yes | Circular/crest portrait seal | Done |
| Unit name | Yes | Yes | Large gold/white identity text | Done |
| Unit level | Yes | Yes | Small medallion on portrait | Missing |
| Class/player type | Player implied by self; target player class visible through color/context | Target player class or creature type | Original WoW class icon before subtitle; creature/classification badge later | Partial: player/player-target class icon |
| Reaction/faction | PvP/faction icon | Hostile/friendly/neutral reaction | Shell accent and optional faction badge | Partial |
| Target classification | No | Elite, rare, rare elite, boss/skull, trivial/minus | Portrait crescent and rank text | Partial |
| Raid target icon | Usually attached to target/focus | Yes | Top-right icon slot | Missing |

## Resources

| Information | Player frame | Target frame | Design treatment | Current addon |
| --- | --- | --- | --- | --- |
| Health bar | Yes | Yes | Primary brush-fill bar | Done |
| Health values | Yes, depending on client settings | Yes, depending on client settings | Right-aligned current/max or percent | Partial: percent only |
| Power bar | Yes | Yes when target has visible power | Secondary blade-line bar | Done for player/friendly target |
| Power values | Yes, depending on client settings | Yes, depending on client settings | Right-aligned current/max or percent | Partial: percent only |
| Power type color | Mana/rage/energy/etc. | Mana/rage/energy/etc. | Base WoW power color blended with breath accent | Partial |
| Absorb/incoming heal overlays | Modern clients may show them | Modern clients may show them | Thin additive overlay above health fill | Missing |

## Status States

| Information | Player frame | Target frame | Design treatment | Current addon |
| --- | --- | --- | --- | --- |
| Dead/ghost | Yes | Yes | Portrait dim plus skull/ghost mark | Missing |
| Offline/disconnected | Yes | Yes for players | Desaturated frame plus `Offline`/`离线` text | Missing |
| Tapped/unavailable mob | No | Yes | Grey slash and muted health bar | Missing |
| Resting | Yes | No | Small blue resting seal | Missing |
| In combat | Yes | Optional through combat feedback | Red blade spark on player edge | Missing |
| PvP enabled/faction | Yes | Yes | Horde/Alliance badge slot | Missing |
| Party/raid leader | Yes | For player targets when applicable | Small crown/chevron badge | Missing |
| Master looter | Yes | Sometimes visible on unit frames | Small coin/key badge | Missing |
| Threat state | Usually feedback around target/nameplates | Useful on target | Outer glow: yellow/orange/red | Missing |

## Target Attachments

| Information | Original behavior | Design treatment | Current addon |
| --- | --- | --- | --- |
| Target buffs | Icons under/near target frame | First row under frame, same icon size/order | Missing |
| Target debuffs | Icons under/near target frame | Second row, red ink underline for harmful effects | Missing |
| Combo points/class points | Often attached near target | Small pips along target frame bottom edge | Missing |
| Target of target | Optional client feature | Optional matching mini-frame below target | Missing |
| Cast bar | Player/target cast bars are separate but visually related | Keep separate, but share ink/brass tokens later | Not in scope yet |

## Interaction Parity

| Behavior | Required equivalent |
| --- | --- |
| Left-click target/self select | Use a secure unit button or secure click proxy. |
| Right-click context menu | Match original unit menu where secure rules allow. |
| Mouseover tooltip | Show standard unit tooltip. |
| Drag/lock behavior | Optional addon setting, but locked by default. |
| Does not taint combat actions | Use secure templates for clickable frames; avoid changing protected attributes in combat. |
| Visibility follows unit existence | Target frame hides when `UnitExists("target")` is false. |

## Suggested WoW API Hooks

| Need | APIs/events to consider |
| --- | --- |
| Health | `UNIT_HEALTH`, `UNIT_MAXHEALTH`, `UnitHealth`, `UnitHealthMax` |
| Power | `UNIT_POWER_UPDATE`, `UNIT_DISPLAYPOWER`, `UnitPowerType`, `UnitPower`, `UnitPowerMax` |
| Name/level/class | `UNIT_NAME_UPDATE`, `PLAYER_LEVEL_UP`, `UnitName`, `UnitLevel`, `UnitClass`, `UnitCreatureType` |
| Target change | `PLAYER_TARGET_CHANGED`, `UnitExists` |
| Portrait | `UNIT_PORTRAIT_UPDATE`, `SetPortraitTexture` |
| PvP/faction | `UNIT_FACTION`, `UnitIsPVP`, `UnitFactionGroup` |
| Classification | `UnitClassification`, `UnitIsEnemy`, `UnitReaction` |
| Dead/offline | `UNIT_FLAGS`, `UnitIsDeadOrGhost`, `UnitIsConnected` |
| Tapped | `UNIT_FLAGS`, `UnitIsTapped`, `UnitIsTappedByPlayer` |
| Combat/resting | `PLAYER_REGEN_DISABLED`, `PLAYER_REGEN_ENABLED`, `PLAYER_UPDATE_RESTING`, `UnitAffectingCombat`, `IsResting` |
| Raid marker | `RAID_TARGET_UPDATE`, `GetRaidTargetIndex` |
| Leader/loot | `PARTY_LEADER_CHANGED`, `PARTY_LOOT_METHOD_CHANGED`, `UnitIsGroupLeader`, `GetLootMethod` |
| Threat | `UNIT_THREAT_SITUATION_UPDATE`, `UnitThreatSituation` |
| Auras | `UNIT_AURA`, `UnitBuff`, `UnitDebuff` |

## Acceptance Criteria

- A player can hide the Blizzard frames and still see every important thing those frames showed.
- Enemy, friendly, dead, tapped, elite, rare, boss, PvP, and offline targets are visually distinguishable at a glance.
- The frame remains readable at common UI scales from `0.64` to `1.0`.
- Chinese and English labels do not overlap when names are long.
- The design uses original WoW information hierarchy, with 鬼灭之刃-inspired styling only as the visual skin.
