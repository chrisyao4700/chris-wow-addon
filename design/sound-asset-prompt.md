# Sound Asset Prompt Sheet

Date: 2026-05-24  
Feature: Japanese Demon Slayer skill-name voice callouts on mapped WoW spell casts  
Runtime asset root: `assets/spell-voices/ja/`

This sheet lists the **current needed v1 sound files**: every active `displayText` used by `src/features/spell-text-effect/mappings/` and resolved through `src/features/spell-animation-effect/spell-slugs.ts`.

V1 active mapping count: **59 OGG files**.

Generated pack coverage: full Sun Breathing (**15 OGG files**), Moon Breathing (**12 OGG files**), Beast Breathing (**12 OGG files**), Water Breathing (**11 OGG files**), Mist Breathing (**7 OGG files**), Stone Breathing (**5 OGG files**), Thunder Breathing (**12 OGG files**), Wind Breathing (**10 OGG files**), Love Breathing (**5 OGG files**), Serpent Breathing (**5 OGG files**), Insect Breathing (**8 OGG files**), Sound Breathing (**3 OGG files**), Flame Breathing (**6 OGG files**), Flower Breathing (**6 OGG files**), and full Blood Art catalog (**70 OGG files**).

## Naming And File Structure Contract

Every row in this prompt sheet must use this exact source path shape:

```text
assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg
```

The generated package must copy the same subtree to:

```text
dist/SlayerUI/assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg
```

The runtime addon will play the same file from:

```text
Interface\AddOns\SlayerUI\assets\spell-voices\ja\<style_slug>\<spell_slug>.ogg
```

Rules:

- `ja` is the v1 locale folder.
- `<style_slug>` and `<spell_slug>` are exactly the values from `src/features/spell-animation-effect/spell-slugs.ts`.
- Use lowercase ASCII snake_case for slugs: `a-z`, `0-9`, and `_` only.
- Do not use localized characters, spaces, uppercase letters, hyphens, punctuation, or display text in file or slug names.
- The fixed folder name `spell-voices` is the only hyphenated path segment.
- The file extension is always lowercase `.ogg`.
- Sound runtime paths include `.ogg`; this differs from TGA texture runtime paths, which are resolved by the texture asset helper.

Parallel naming with spell effect assets:

```text
assets/spell-effects/<style_slug>/spells/<spell_slug>/<spell_slug>_text_main.tga
assets/spell-voices/ja/<style_slug>/<spell_slug>.ogg
```

## Generation Rules

Use `design/ds_skills.md` as the source of truth for Japanese names and readings. When the current addon mapping uses a shortened label, the prompt uses the closest canonical Japanese from `ds_skills.md` and marks the row as `ds-derived`. When a callout is addon-specific and not present in `ds_skills.md`, the row is marked `addon-custom`.

Output format:

- File type: `.ogg`
- Codec: OGG Vorbis
- Channels: mono
- Sample rate: `44100 Hz` or `48000 Hz`
- Duration target: `0.6s` to `1.8s`
- Max duration: `2.2s`
- Leading silence: under `80 ms`
- Trailing silence: under `120 ms`

Do not use extracted anime, game, actor, or copyrighted voice clips. Generate original TTS or record original voice.

## Prompt Template

Use this template once per row, replacing the variables with the row values.

```text
Create a short original Japanese anime sword-technique voice callout for a World of Warcraft addon.

Spoken Japanese line:
<spoken_japanese>

Pronunciation guide:
<pronunciation_hint>

Delivery:
Energetic battle-call delivery, crisp and confident, like announcing a named sword or demon art technique. Dry voice only. No music, no ambience, no weapon sounds, no crowd, no reverb tail longer than 120 ms. Do not imitate any specific actor or existing anime clip.

Technical output:
Export mono OGG Vorbis at 44.1 kHz or 48 kHz, duration 0.6 to 1.8 seconds, maximum 2.2 seconds. Trim leading silence under 80 ms and trailing silence under 120 ms.

Save as:
<output_file>
```

## Active Runtime Sound Files

### Sun Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/sun_breathing/sun_round_dance.ogg` | `日の呼吸・壱ノ型 円舞` | `ひのこきゅう・いちのかた えんぶ` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_fake_rainbow.ogg` | `日の呼吸・肆ノ型 幻日虹` | `ひのこきゅう・しのかた げんにちこう` | ds exact |

### Sun Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Sun Breathing voice pack for every unique `sun_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/sun_breathing/sun_blue_heaven.ogg` | `日の呼吸・弐ノ型 碧羅の天` | `ひのこきゅう・にのかた へきらのてん` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_red_mirror.ogg` | `日の呼吸・参ノ型 烈日紅鏡` | `ひのこきゅう・さんのかた れつじつこうきょう` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_fire_wheel.ogg` | `日の呼吸・伍ノ型 火車` | `ひのこきゅう・ごのかた かしゃ` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_scorching_bone_sun.ogg` | `日の呼吸・陸ノ型 灼骨炎陽` | `ひのこきゅう・ろくのかた しゃっこつえんよう` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_sunflower_thrust.ogg` | `日の呼吸・漆ノ型 陽華突` | `ひのこきゅう・しちのかた ようかとつ` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_flying_wheel_haze.ogg` | `日の呼吸・捌ノ型 飛輪陽炎` | `ひのこきゅう・はちのかた ひりんかげろう` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_setting_sun_transform.ogg` | `日の呼吸・玖ノ型 斜陽転身` | `ひのこきゅう・くのかた しゃようてんしん` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_beneficent_radiance.ogg` | `日の呼吸・拾ノ型 輝輝恩光` | `ひのこきゅう・じゅうのかた ききおんこう` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_halo_dragon_head_dance.ogg` | `日の呼吸・拾壱ノ型 日暈の龍・頭舞い` | `ひのこきゅう・じゅういちのかた にちうんのりゅう かぶりまい` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_flame_dance.ogg` | `日の呼吸・拾弐ノ型 炎舞` | `ひのこきゅう・じゅうにのかた えんぶ` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_thirteenth_form.ogg` | `日の呼吸・拾参ノ型` | `ひのこきゅう・じゅうさんのかた` | ds-derived |
| `assets/spell-voices/ja/sun_breathing/sun_round_dance_flash.ogg` | `日の呼吸・円舞一閃` | `ひのこきゅう・えんぶいっせん` | ds exact |
| `assets/spell-voices/ja/sun_breathing/sun_hinokami_kagura_thirteenth.ogg` | `ヒノカミ神楽・十三ノ型` | `ひのかみかぐら・じゅうさんのかた` | ds-derived |

### Flame Breathing

These files complete the generated Flame Breathing voice pack for every unique `flame_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/flame_breathing/flame_unknown_fire.ogg` | `炎の呼吸・壱ノ型 不知火` | `ほのおのこきゅう・いちのかた しらぬい` | ds exact |
| `assets/spell-voices/ja/flame_breathing/flame_rising_scorching_sun.ogg` | `炎の呼吸・弐ノ型 昇り炎天` | `ほのおのこきゅう・にのかた のぼりえんてん` | ds exact |
| `assets/spell-voices/ja/flame_breathing/flame_blazing_universe.ogg` | `炎の呼吸・参ノ型 気炎万象` | `ほのおのこきゅう・さんのかた きえんばんしょう` | ds exact |
| `assets/spell-voices/ja/flame_breathing/flame_blooming_flame_undulation.ogg` | `炎の呼吸・肆ノ型 盛炎のうねり` | `ほのおのこきゅう・しのかた せいえんのうねり` | ds exact |
| `assets/spell-voices/ja/flame_breathing/flame_flame_tiger.ogg` | `炎の呼吸・伍ノ型 炎虎` | `ほのおのこきゅう・ごのかた えんこ` | ds exact |
| `assets/spell-voices/ja/flame_breathing/flame_rengoku.ogg` | `炎の呼吸・玖ノ型 煉獄` | `ほのおのこきゅう・くのかた れんごく` | ds exact |

### Water Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/water_breathing/water_striking_tide.ogg` | `水の呼吸・肆ノ型 打ち潮` | `みずのこきゅう・しのかた うちしお` | ds exact |

### Water Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Water Breathing voice pack for every unique `water_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/water_breathing/water_surface_slash.ogg` | `水の呼吸・壱ノ型 水面斬り` | `みずのこきゅう・いちのかた みなもぎり` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_water_wheel.ogg` | `水の呼吸・弐ノ型 水車` | `みずのこきゅう・にのかた みずぐるま` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_flowing_dance.ogg` | `水の呼吸・参ノ型 流流舞い` | `みずのこきゅう・さんのかた りゅうりゅうまい` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_blessed_rain.ogg` | `水の呼吸・伍ノ型 干天の慈雨` | `みずのこきゅう・ごのかた かんてんのじう` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_twisting_whirlpool.ogg` | `水の呼吸・陸ノ型 ねじれ渦` | `みずのこきゅう・ろくのかた ねじれうず` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_drop_ripple_thrust.ogg` | `水の呼吸・漆ノ型 雫波紋突き` | `みずのこきゅう・しちのかた しずくはもんづき` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_waterfall_basin.ogg` | `水の呼吸・捌ノ型 滝壺` | `みずのこきゅう・はちのかた たきつぼ` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_splashing_water_flow_turbulent.ogg` | `水の呼吸・玖ノ型 水流飛沫・乱` | `みずのこきゅう・くのかた すいりゅうしぶき・らん` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_constant_flux.ogg` | `水の呼吸・拾ノ型 生生流転` | `みずのこきゅう・じゅうのかた せいせいるてん` | ds exact |
| `assets/spell-voices/ja/water_breathing/water_dead_calm.ogg` | `水の呼吸・拾壱ノ型 凪` | `みずのこきゅう・じゅういちのかた なぎ` | ds exact |

### Flower Breathing

These files complete the generated Flower Breathing voice pack for every unique `flower_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/flower_breathing/flower_honorable_shadow_plum.ogg` | `花の呼吸・弐ノ型 御影梅` | `はなのこきゅう・にのかた みかげうめ` | ds exact |
| `assets/spell-voices/ja/flower_breathing/flower_crimson_hanagoromo.ogg` | `花の呼吸・肆ノ型 紅花衣` | `はなのこきゅう・しのかた べにはなごろも` | ds exact |
| `assets/spell-voices/ja/flower_breathing/flower_peony_of_futility.ogg` | `花の呼吸・伍ノ型 徒の芍薬` | `はなのこきゅう・ごのかた あだのしゃくやく` | ds exact |
| `assets/spell-voices/ja/flower_breathing/flower_whirling_peach.ogg` | `花の呼吸・陸ノ型 渦桃` | `はなのこきゅう・ろくのかた うずもも` | ds exact |
| `assets/spell-voices/ja/flower_breathing/flower_drop_ripple_thrust.ogg` | `花の呼吸・漆ノ型 雫波紋突き` | `はなのこきゅう・しちのかた しずくはもんづき` | ds exact |
| `assets/spell-voices/ja/flower_breathing/flower_equinoctial_vermilion_eye.ogg` | `花の呼吸・終ノ型 彼岸朱眼` | `はなのこきゅう・ついのかた ひがんしゅがん` | ds exact |

### Thunder Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/thunder_breathing/thunder_lightning_roar.ogg` | `雷の呼吸・陸ノ型 電轟雷轟` | `かみなりのこきゅう・ろくのかた でんごうらいごう` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_distant_lightning.ogg` | `雷の呼吸・肆ノ型 遠雷` | `かみなりのこきゅう・しのかた えんらい` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_thunderclap_flash.ogg` | `雷の呼吸・壱ノ型 霹靂一閃` | `かみなりのこきゅう・いちのかた へきれきいっせん` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_godspeed.ogg` | `雷の呼吸・壱ノ型 霹靂一閃・神速` | `かみなりのこきゅう・いちのかた へきれきいっせん・しんそく` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_narukami.ogg` | `雷の呼吸・鳴神` | `かみなりのこきゅう・なるかみ` | addon-custom |

### Thunder Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Thunder Breathing voice pack for every unique `thunder_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/thunder_breathing/thunder_rice_spirit.ogg` | `雷の呼吸・弐ノ型 稲魂` | `かみなりのこきゅう・にのかた いなだま` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_swarm_thunder.ogg` | `雷の呼吸・参ノ型 聚蚊成雷` | `かみなりのこきゅう・さんのかた しゅうぶんせいらい` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_heat_lightning.ogg` | `雷の呼吸・伍ノ型 熱界雷` | `かみなりのこきゅう・ごのかた ねつかいらい` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_flaming_thunder_god.ogg` | `雷の呼吸・漆ノ型 火雷神` | `かみなりのこきゅう・しちのかた ほのいかづちのかみ` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_thunderclap_flash_twofold.ogg` | `雷の呼吸・壱ノ型 霹靂一閃・二連` | `かみなりのこきゅう・いちのかた へきれきいっせん・にれん` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_thunderclap_flash_sixfold.ogg` | `雷の呼吸・壱ノ型 霹靂一閃・六連` | `かみなりのこきゅう・いちのかた へきれきいっせん・ろくれん` | ds exact |
| `assets/spell-voices/ja/thunder_breathing/thunder_thunderclap_flash_eightfold.ogg` | `雷の呼吸・壱ノ型 霹靂一閃・八連` | `かみなりのこきゅう・いちのかた へきれきいっせん・はちれん` | ds exact |

### Wind Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/wind_breathing/wind_cold_tree_wind.ogg` | `風の呼吸・伍ノ型 木枯らし颪` | `かぜのこきゅう・ごのかた こがらしおろし` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_clear_storm_tree.ogg` | `風の呼吸・参ノ型 晴嵐風樹` | `かぜのこきゅう・さんのかた せいらんふうじゅ` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_tengu_gale.ogg` | `風の呼吸・漆ノ型 勁風・天狗風` | `かぜのこきゅう・しちのかた けいふう・てんぐかぜ` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_throwing_blade.ogg` | `風の呼吸・投刃` | `かぜのこきゅう・とうじん` | addon-custom |

### Wind Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Wind Breathing voice pack for every unique `wind_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/wind_breathing/wind_dust_whirlwind_cut.ogg` | `風の呼吸・壱ノ型 塵旋風・削ぎ` | `かぜのこきゅう・いちのかた じんせんぷう・そぎ` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_claws_purifying_wind.ogg` | `風の呼吸・弐ノ型 爪々・科戸風` | `かぜのこきゅう・にのかた そうそう・しなとかぜ` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_rising_dust_storm.ogg` | `風の呼吸・肆ノ型 昇上砂塵嵐` | `かぜのこきゅう・しのかた しょうじょうさじんらん` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_black_wind_smoke_storm.ogg` | `風の呼吸・陸ノ型 黒風烟嵐` | `かぜのこきゅう・ろくのかた こくふうえんらん` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_primary_gale_slash.ogg` | `風の呼吸・捌ノ型 初烈風斬り` | `かぜのこきゅう・はちのかた しょれつかざきり` | ds exact |
| `assets/spell-voices/ja/wind_breathing/wind_idaten_typhoon.ogg` | `風の呼吸・玖ノ型 韋駄天台風` | `かぜのこきゅう・くのかた いだてんたいふう` | ds exact |

### Stone Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/stone_breathing/stone_serpent_rock_twin.ogg` | `岩の呼吸・壱ノ型 蛇紋岩・双極` | `いわのこきゅう・いちのかた じゃもんがん・そうきょく` | ds exact |
| `assets/spell-voices/ja/stone_breathing/stone_sky_surface_smash.ogg` | `岩の呼吸・弐ノ型 天面砕き` | `いわのこきゅう・にのかた てんめんくだき` | ds exact |
| `assets/spell-voices/ja/stone_breathing/stone_rock_skin.ogg` | `岩の呼吸・参ノ型 岩軀の膚` | `いわのこきゅう・さんのかた がんくのはだえ` | ds exact |
| `assets/spell-voices/ja/stone_breathing/stone_volcanic_rock_rapid_conquest.ogg` | `岩の呼吸・肆ノ型 流紋岩・速征` | `いわのこきゅう・しのかた りゅうもんがん・そくせい` | ds exact |
| `assets/spell-voices/ja/stone_breathing/stone_wheel_punishment.ogg` | `岩の呼吸・伍ノ型 瓦輪刑部` | `いわのこきゅう・ごのかた がりんぎょうぶ` | ds exact |

### Mist Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/mist_breathing/mist_flowing_slash.ogg` | `霞の呼吸・肆ノ型 移流斬り` | `かすみのこきゅう・しのかた いりゅうぎり` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_sea_of_haze.ogg` | `霞の呼吸・伍ノ型 霞海の海` | `かすみのこきゅう・ごのかた かうんのうみ` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_scattering_splash.ogg` | `霞の呼吸・参ノ型 霞散の飛沫` | `かすみのこきゅう・さんのかた かさんのしぶき` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_distant_heaven_haze.ogg` | `霞の呼吸・壱ノ型 垂天遠霞` | `かすみのこきゅう・いちのかた すいてんとおかすみ` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_lunar_haze_dissolve.ogg` | `霞の呼吸・陸ノ型 月の霞消` | `かすみのこきゅう・ろくのかた つきのかしょう` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_oboro.ogg` | `霞の呼吸・漆ノ型 朧` | `かすみのこきゅう・しちのかた おぼろ` | ds exact |
| `assets/spell-voices/ja/mist_breathing/mist_eightfold_mist.ogg` | `霞の呼吸・弐ノ型 八重霞` | `かすみのこきゅう・にのかた やえかすみ` | ds exact |

### Moon Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/moon_breathing/moon_pearl_moon_play.ogg` | `月の呼吸・弐ノ型 珠華ノ弄月` | `つきのこきゅう・にのかた しゅかのろうげつ` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_heavenly_full_moon.ogg` | `月の呼吸・拾肆ノ型 兇変・天満繊月` | `つきのこきゅう・じゅうしのかた きょうへん・てんまんせんげつ` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_engraved_moon_corrosion.ogg` | `月の呼吸・参ノ型 厭忌月・銷り` | `つきのこきゅう・さんのかた えんきづき・つがり` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_piercing_face_slash.ogg` | `月の呼吸・拾ノ型 穿面斬` | `つきのこきゅう・じゅうのかた せんめんざん` | ds-derived |

### Moon Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Moon Breathing voice pack for every unique `moon_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/moon_breathing/moon_dark_moon_evening_palace.ogg` | `月の呼吸・壱ノ型 闇月・宵の宮` | `つきのこきゅう・いちのかた やみづき・よいのみや` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_lonely_moon_incessant.ogg` | `月の呼吸・陸ノ型 常世孤月・無間` | `つきのこきゅう・ろくのかた とこよこげつ・むけん` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_moonlit_mirror.ogg` | `月の呼吸・漆ノ型 厄鏡・月映え` | `つきのこきゅう・しちのかた やっきょう・つきばえ` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_dragon_ringtail.ogg` | `月の呼吸・捌ノ型 月龍輪尾` | `つきのこきゅう・はちのかた げつりゅうりんび` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_descending_moon_continuous_faces.ogg` | `月の呼吸・玖ノ型 降り月・連面` | `つきのこきゅう・くのかた くだりづき・れんめん` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_piercing_face_slash_luo_moon.ogg` | `月の呼吸・拾ノ型 穿面斬・蘿月` | `つきのこきゅう・じゅうのかた せんめんざん・らげつ` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_rainbow_half_moon.ogg` | `月の呼吸・拾陸ノ型 月虹・片割れ月` | `つきのこきゅう・じゅうろくのかた げっこう・かたわれづき` | ds exact |
| `assets/spell-voices/ja/moon_breathing/moon_soul_calamity_vortex.ogg` | `月の呼吸・伍ノ型 月魄災渦` | `つきのこきゅう・ごのかた げっぱくさいか` | ds exact |

### Serpent Breathing

These files complete the generated Serpent Breathing voice pack for every unique `serpent_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/serpent_breathing/serpent_slithering_serpent.ogg` | `蛇の呼吸・伍ノ型 蜿蜿長蛇` | `へびのこきゅう・ごのかた えんえんちょうだ` | ds exact |
| `assets/spell-voices/ja/serpent_breathing/serpent_narrow_head_venom_fang.ogg` | `蛇の呼吸・弐ノ型 狭頭の毒牙` | `へびのこきゅう・にのかた きょうずのどくが` | ds exact |
| `assets/spell-voices/ja/serpent_breathing/serpent_meandering_slash.ogg` | `蛇の呼吸・壱ノ型 委蛇斬り` | `へびのこきゅう・いちのかた いだぎり` | ds exact |
| `assets/spell-voices/ja/serpent_breathing/serpent_nest_strangle.ogg` | `蛇の呼吸・参ノ型 塒締め` | `へびのこきゅう・さんのかた とぐろじめ` | ds exact |
| `assets/spell-voices/ja/serpent_breathing/serpent_twin_headed_serpent.ogg` | `蛇の呼吸・肆ノ型 頸蛇双生` | `へびのこきゅう・しのかた けいじゃそうせい` | ds exact |

### Love Breathing

These files complete the generated Love Breathing voice pack for every unique `love_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/love_breathing/love_first_love_tremors.ogg` | `恋の呼吸・壱ノ型 初恋のわななき` | `こいのこきゅう・いちのかた はつこいのわななき` | ds exact |
| `assets/spell-voices/ja/love_breathing/love_pangs_of_love.ogg` | `恋の呼吸・弐ノ型 懊悩巡る恋` | `こいのこきゅう・にのかた おうのうめぐるこい` | ds exact |
| `assets/spell-voices/ja/love_breathing/love_catlove_shower.ogg` | `恋の呼吸・参ノ型 恋猫しぐれ` | `こいのこきゅう・さんのかた こいねこしぐれ` | ds exact |
| `assets/spell-voices/ja/love_breathing/love_swaying_love_wildclaw.ogg` | `恋の呼吸・伍ノ型 揺らめく恋情・乱れ爪` | `こいのこきゅう・ごのかた ゆらめくれんじょう・みだれづめ` | ds exact |
| `assets/spell-voices/ja/love_breathing/love_catleg_lovewind.ogg` | `恋の呼吸・陸ノ型 猫足恋風` | `こいのこきゅう・ろくのかた ねこあしこいかぜ` | ds exact |

### Insect Breathing

These files complete the generated Insect Breathing voice pack for every unique `insect_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/insect_breathing/insect_bee_fang_true_sway.ogg` | `虫の呼吸・蜂牙ノ舞・真靡き` | `むしのこきゅう・ほうがのまい・まなびき` | ds exact |
| `assets/spell-voices/ja/insect_breathing/insect_dragonfly_hex_eyes.ogg` | `虫の呼吸・蜻蛉ノ舞・複眼六角` | `むしのこきゅう・せいれいのまい・ふくがんろっかく` | ds exact |
| `assets/spell-voices/ja/insect_breathing/insect_centipede_belly.ogg` | `虫の呼吸・蜈蚣ノ舞・百足蛇腹` | `むしのこきゅう・ごこうのまい・ひゃくそくじゃばら` | ds exact |
| `assets/spell-voices/ja/insect_breathing/insect_centipede_dance_belly.ogg` | `虫の呼吸・蜈蚣ノ舞・百足蛇腹` | `むしのこきゅう・ごこうのまい・ひゃくそくじゃばら` | ds exact |
| `assets/spell-voices/ja/insect_breathing/insect_butterfly_dance_tease.ogg` | `虫の呼吸・蝶ノ舞・戯れ` | `むしのこきゅう・ちょうのまい・たわむれ` | ds exact |
| `assets/spell-voices/ja/insect_breathing/insect_bee_fang_dance.ogg` | `虫の呼吸・蜂牙ノ舞` | `むしのこきゅう・ほうがのまい` | ds-derived |
| `assets/spell-voices/ja/insect_breathing/insect_butterfly_dance.ogg` | `虫の呼吸・蝶ノ舞` | `むしのこきゅう・ちょうのまい` | ds-derived |
| `assets/spell-voices/ja/insect_breathing/insect_tease.ogg` | `虫の呼吸・戯れ` | `むしのこきゅう・たわむれ` | ds-derived |

### Beast Breathing

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/beast_breathing/beast_explosive_rush.ogg` | `獣の呼吸・捌ノ型 爆裂猛進` | `けだもののこきゅう・はちのかた ばくれつもうしん` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_cutting_rend.ogg` | `獣の呼吸・弐ノ牙 切り裂き` | `けだもののこきゅう・にのきば きりさき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_wild_rend.ogg` | `獣の呼吸・伍ノ牙 狂い裂き` | `けだもののこきゅう・ごのきば くるいざき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_circular_spinning_fang.ogg` | `獣の呼吸・拾ノ牙 円転旋牙` | `けだもののこきゅう・じゅうのきば えんてんせんが` | ds exact |

### Beast Breathing Catalog Expansion

These files are not all active cast mappings yet, but they complete the generated Beast Breathing voice pack for every unique `beast_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/beast_breathing/beast_pierce.ogg` | `獣の呼吸・壱ノ牙 穿ち抜き` | `けだもののこきゅう・いちのきば うがちぬき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_bite_rend.ogg` | `獣の呼吸・参ノ牙 喰い裂き` | `けだもののこきゅう・さんのきば くいざき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_slice_to_pieces.ogg` | `獣の呼吸・肆ノ牙 切細裂き` | `けだもののこきゅう・しのきば きりこまざき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_chaotic_fang_bite.ogg` | `獣の呼吸・陸ノ牙 乱杭咬み` | `けだもののこきゅう・ろくのきば らんぐいがみ` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_spatial_awareness.ogg` | `獣の呼吸・漆ノ型 空間識覚` | `けだもののこきゅう・しちのかた くうかんしきかく` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_extend_bendy_slash.ogg` | `獣の呼吸・玖ノ牙 伸・うねり裂き` | `けだもののこきゅう・くのきば しん・うねりざき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_throwing_rend.ogg` | `獣の呼吸・投げ裂き` | `けだもののこきゅう・なげさき` | ds exact |
| `assets/spell-voices/ja/beast_breathing/beast_throwing_bite.ogg` | `獣の呼吸・飛擲噬咬` | `けだもののこきゅう・ひてきぜいこう` | ds-derived |

### Sound Breathing

These files complete the generated Sound Breathing voice pack for every unique `sound_breathing` slug currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/sound_breathing/sound_roar.ogg` | `音の呼吸・壱ノ型 轟` | `おとのこきゅう・いちのかた とどろき` | ds exact |
| `assets/spell-voices/ja/sound_breathing/sound_constant_resounding_slashes.ogg` | `音の呼吸・肆ノ型 響斬無間` | `おとのこきゅう・しのかた きょうざんむけん` | ds exact |
| `assets/spell-voices/ja/sound_breathing/sound_string_performance.ogg` | `音の呼吸・伍ノ型 鳴弦奏々` | `おとのこきゅう・ごのかた めいげんそうそう` | ds exact |

### Blood Art

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/blood_art/blood_blood_burst.ogg` | `血鬼術・爆血` | `けっきじゅつ・ばっけつ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_leaping_stride.ogg` | `血鬼術・跋弧跳梁` | `けっきじゅつ・ばっこちょうりょう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_spinning_blood_scythe.ogg` | `血鬼術・円斬旋廻・飛び血鎌` | `けっきじゅつ・えんざんせんかい・とびちがま` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_winter_pillar.ogg` | `血鬼術・冬ざれ氷柱` | `けっきじゅつ・ふゆざれつらら` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_thread_prison.ogg` | `血鬼術・刻糸牢` | `けっきじゅつ・こくしろう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_annihilation.ogg` | `血鬼術・破壊殺・滅式` | `けっきじゅつ・はかいさつ・めっしき` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_demon_core.ogg` | `血鬼術・破壊殺・鬼芯八重芯` | `けっきじゅつ・はかいさつ・きしんやえしん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_vine_lotus.ogg` | `血鬼術・蔓蓮華` | `けっきじゅつ・つるれんげ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_bio_manipulation.ogg` | `血鬼術・生物操縦` | `けっきじゅつ・せいぶつそうじゅう` | addon-custom |
| `assets/spell-voices/ja/blood_art/blood_hatred_golem.ogg` | `血鬼術・憎珀天` | `けっきじゅつ・ぞうはくてん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_crimson_arrow.ogg` | `血鬼術・紅潔の矢` | `けっきじゅつ・こうけつのや` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_karmic_tree.ogg` | `血鬼術・無間業樹` | `けっきじゅつ・むげんごうじゅ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_compass.ogg` | `血鬼術・破壊殺・羅針` | `けっきじゅつ・はかいさつ・らしん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_bewitching_scent.ogg` | `血鬼術・惑血・融通無碍の香` | `けっきじゅつ・わくち・ゆうずうむげのこう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_thread_spin.ogg` | `血鬼術・刻糸輪転` | `けっきじゅつ・こくしりんてん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_black_blood_thorn.ogg` | `血鬼術・黒血枳棘` | `けっきじゅつ・こっけつききょく` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_mana_disruption.ogg` | `血鬼術・魔力撹乱` | `けっきじゅつ・まりょくかくらん` | addon-custom |

### Blood Art Ice Catalog Expansion

These files cover the Doma ice Blood Art slugs currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/blood_art/blood_lotus_leaf_ice.ogg` | `血鬼術・蓮葉氷` | `けっきじゅつ・はすはごおり` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_barren_hanging_garden.ogg` | `血鬼術・枯園垂り` | `けっきじゅつ・かれそのしづり` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_freezing_cloud.ogg` | `血鬼術・凍て曇` | `けっきじゅつ・いてぐもり` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_powder_frost.ogg` | `血鬼術・粉凍り` | `けっきじゅつ・こなごおり` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_cold_white_princess.ogg` | `血鬼術・寒烈の白姫` | `けっきじゅつ・かんれつのしらひめ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_scattering_lotus.ogg` | `血鬼術・散り蓮華` | `けっきじゅつ・ちりれんげ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_crystal_child.ogg` | `血鬼術・結晶の御子` | `けっきじゅつ・けっしょうのみこ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_rime_sleeping_lotus_bodhisattva.ogg` | `血鬼術・霧氷・睡蓮菩薩` | `けっきじゅつ・むひょう・すいれんぼさつ` | ds exact |

### Blood Art Remaining Catalog Expansion

These files complete the remaining Blood Art slugs currently present in `spell-slugs.ts`.

| Output file | Spoken Japanese | Pronunciation hint | Source |
| --- | --- | --- | --- |
| `assets/spell-voices/ja/blood_art/blood_split_escape.ogg` | `血鬼術・分裂逃走` | `けっきじゅつ・ぶんれつとうそう` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_hakai_air_type.ogg` | `血鬼術・破壊殺・空式` | `けっきじゅつ・はかいさつ・くうしき` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_leg_crown_split.ogg` | `血鬼術・破壊殺・脚式・冠先割` | `けっきじゅつ・はかいさつ・きゃくしき・かむろさきわり` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_leg_flowing_flash.ogg` | `血鬼術・破壊殺・脚式・流閃群光` | `けっきじゅつ・はかいさつ・きゃくしき・りゅうせんぐんこう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_leg_flying_star_wheel.ogg` | `血鬼術・破壊殺・脚式・飛遊星千輪` | `けっきじゅつ・はかいさつ・きゃくしき・ひゅうせいせんりん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_crushing_willow.ogg` | `血鬼術・破壊殺・砕式・万葉閃柳` | `けっきじゅつ・はかいさつ・さいしき・まんようせんやぎ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_disorder.ogg` | `血鬼術・破壊殺・乱式` | `けっきじゅつ・はかいさつ・らんしき` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hakai_final_blue_silver.ogg` | `血鬼術・破壊殺・終式・青銀乱残光` | `けっきじゅつ・はかいさつ・しゅうしき・あおぎんらんざんこう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_infinity_castle_control.ogg` | `血鬼術・無限城操縦` | `けっきじゅつ・むげんじょうそうじゅう` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_crushing_sound_wave.ogg` | `血鬼術・狂圧鳴波` | `けっきじゅつ・きょうあつめいは` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_mad_thunder_kill.ogg` | `血鬼術・狂鳴雷殺` | `けっきじゅつ・きょうめいらいさつ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_tears_piercing_thrust.ogg` | `血鬼術・激涙刺突` | `けっきじゅつ・げきるいしとう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_water_prison_pot.ogg` | `血鬼術・水獄鉢` | `けっきじゅつ・すいごくばち` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_thousand_needle_fish.ogg` | `血鬼術・千本針魚殺` | `けっきじゅつ・せんぼんはりぎょさつ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_octopus_pot_hell.ogg` | `血鬼術・蛸壺地獄` | `けっきじゅつ・たこつぼじごく` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_murderous_fish_scales.ogg` | `血鬼術・陣殺魚鱗` | `けっきじゅつ・じんさつぎょりん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_ten_thousand_gliding_fish.ogg` | `血鬼術・一万滑空粘魚` | `けっきじゅつ・いちまんかっくうねんぎょ` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_hand_of_god.ogg` | `血鬼術・神の手` | `けっきじゅつ・かみのて` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_eightfold_sash_slash.ogg` | `血鬼術・八重帯斬り` | `けっきじゅつ・やえおびぎり` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_sash_control.ogg` | `血鬼術・帯状鬼具` | `けっきじゅつ・おびじょうきぐ` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_flying_blood_sickle.ogg` | `血鬼術・飛び血鎌` | `けっきじゅつ・とびちがま` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_sickle_attack.ogg` | `血鬼術・血鎌攻撃` | `けっきじゅつ・ちがまこうげき` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_electric_generation.ogg` | `血鬼術・電撃生成` | `けっきじゅつ・でんげきせいせい` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_forced_sleep_whisper.ogg` | `血鬼術・強制昏睡催眠の囁き` | `けっきじゅつ・きょうせいこんとうさいみんのささやき` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_forced_sleep_eye.ogg` | `血鬼術・強制昏睡睡眠・眼` | `けっきじゅつ・きょうせいこんとうすいみん・め` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_dream_rope.ogg` | `血鬼術・夢境の縄` | `けっきじゅつ・むきょうのなわ` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_train_fusion.ogg` | `血鬼術・列車融合` | `けっきじゅつ・れっしゃゆうごう` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_spiritual_core_destruction.ogg` | `血鬼術・精神の核の破壊` | `けっきじゅつ・せいしんのかくのはかい` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_murderous_eye_basket.ogg` | `血鬼術・殺目篭` | `けっきじゅつ・さつめかご` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_dissolving_cocoon.ogg` | `血鬼術・溶解の繭` | `けっきじゅつ・ようかいのまゆ` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_mottled_poison_spit.ogg` | `血鬼術・斑毒痰` | `けっきじゅつ・まだらどくたん` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_thread_control.ogg` | `血鬼術・糸操り` | `けっきじゅつ・いとあやつり` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_body_reinforcement.ogg` | `血鬼術・肉体強化` | `けっきじゅつ・にくたいきょうか` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_splitting.ogg` | `血鬼術・分裂` | `けっきじゅつ・ぶんれつ` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_multiple_arms.ogg` | `血鬼術・複数腕` | `けっきじゅつ・ふくすううで` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_drum_beating.ogg` | `血鬼術・尚速鼓打` | `けっきじゅつ・しょうそくつづみうち` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_temari_destruction.ogg` | `血鬼術・手鞠破壊` | `けっきじゅつ・てまりはかい` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_shadow_wolf.ogg` | `血鬼術・虜獲腔・影狼` | `けっきじゅつ・ろかくこう・かげろう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_war_disaster_wolf.ogg` | `血鬼術・戦禍陣狼` | `けっきじゅつ・せんかじんろう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_illusion_realm.ogg` | `血鬼術・幻境` | `けっきじゅつ・げんきょう` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_space_manipulation.ogg` | `血鬼術・空間操縦` | `けっきじゅつ・くうかんそうじゅう` | ds-derived |
| `assets/spell-voices/ja/blood_art/blood_visual_dream_scent.ogg` | `血鬼術・視覚夢幻の香` | `けっきじゅつ・しかくむげんのこう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_daylight_scent.ogg` | `血鬼術・白日魔香` | `けっきじゅつ・はくじつのまこう` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_paper_eye.ogg` | `血鬼術・紙眼` | `けっきじゅつ・しがん` | ds exact |
| `assets/spell-voices/ja/blood_art/blood_root_growth.ogg` | `血鬼術・木根生長` | `けっきじゅつ・もっこんせいちょう` | ds-derived |

## Source Notes

- `ds exact`: the Japanese technique name and/or reading appears directly in `design/ds_skills.md`.
- `ds-derived`: the addon currently splits or shortens a canonical name from `design/ds_skills.md`; use the listed Japanese line for this specific file.
- `addon-custom`: the mapped callout is not present in `design/ds_skills.md`; the Japanese line is an addon-local translation and should be reviewed before final voice production.

## Full Catalog Coverage

This sheet covers every unique `styleSlug` + `spellSlug` sound file currently present in `src/features/spell-animation-effect/spell-slugs.ts`: **187 OGG files** total.
