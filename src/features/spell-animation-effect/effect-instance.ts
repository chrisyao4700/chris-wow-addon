import { ADDON_NAME } from "../../core/config";
import {
  clamp01,
  easeOutBack,
  easeOutQuad,
  EFFECT_DISPLAY_SCALE,
  EFFECT_DURATION_SECONDS,
  lerp,
  segmentProgress,
  setSpriteFrame,
  setTextureAlpha
} from "./animation-utils";
import {
  resolveSharedAssetPath,
  resolveSpellAssetPath,
  resolveStyleAssetPath,
  type SharedOverlayRole,
  type StylePackRole
} from "./assets";
import type { SpellAnimationSlug } from "./spell-slugs";
import { getSpellEffectUserScale } from "./layout-settings";

const ROOT_WIDTH = 900 * EFFECT_DISPLAY_SCALE;
const ROOT_HEIGHT = 360 * EFFECT_DISPLAY_SCALE;
const PARTICLE_COLUMNS = 4;
const PARTICLE_ROWS = 4;
const PARTICLE_FRAME_COUNT = 16;
const PARTICLE_FRAME_STEP_SECONDS = 0.015;

/** Valid WoW texture sublevel range is -8..7. Text uses the top of OVERLAY. */
const DRAW_SUBLEVEL = {
  atmosphere: 0,
  impactFlash: 1,
  inkBurst: 0,
  energyBack: 1,
  particles: 2,
  energyFront: 0,
  speedLines: 1,
  textShadow: 6,
  textMain: 7,
  textSheen: 7
} as const;

/** Child frame levels: higher draws above. Text mount sits above all VFX mounts. */
const LAYER_MOUNT_LEVEL = {
  back: 1,
  mid: 2,
  front: 3,
  text: 4,
  highlight: 5
} as const;

type LayerMountFrames = {
  back: WowFrame;
  mid: WowFrame;
  text: WowFrame;
  front: WowFrame;
  highlight: WowFrame;
};

type ResolvedSpellEffectAssets = {
  styleSlug: string;
  spellSlug: string;
  impactFlash?: string;
  energyBack?: string;
  energyFront?: string;
  particles?: string;
  atmosphere?: string;
  textMain?: string;
  textShadow?: string;
  textSheen?: string;
  inkBurst?: string;
  speedLines?: string;
};

type EffectDrawLayer = "BACKGROUND" | "ARTWORK" | "OVERLAY" | "HIGHLIGHT";

type EffectLayer = {
  parent: WowFrame;
  texture: WowTexture;
  drawLayer: EffectDrawLayer;
  drawSubLevel: number;
  enabled: boolean;
  baseWidth: number;
  baseHeight: number;
  offsetX: number;
  offsetY: number;
  usesScale: boolean;
};

export type SpellEffectInstance = {
  root: WowFrame;
  active: boolean;
  startTime: number;
  assets?: ResolvedSpellEffectAssets;
  impactFlash: EffectLayer;
  atmosphere: EffectLayer;
  energyBack: EffectLayer;
  particles: EffectLayer;
  inkBurst: EffectLayer;
  textShadow: EffectLayer;
  textMain: EffectLayer;
  textSheen: EffectLayer;
  speedLines: EffectLayer;
  energyFront: EffectLayer;
  SetAnchorFrame: (anchorFrame: WowFrame) => void;
  Configure: (slug: SpellAnimationSlug) => boolean;
  Play: () => void;
  Stop: () => void;
};

function createLayerMount(parent: WowFrame, name: string, frameLevel: number): WowFrame {
  const mount = CreateFrame("Frame", name, parent);
  mount.SetFrameLevel(frameLevel);
  mount.SetPoint("TOPLEFT", parent, "TOPLEFT", 0, 0);
  mount.SetPoint("BOTTOMRIGHT", parent, "BOTTOMRIGHT", 0, 0);
  mount.EnableMouse(false);
  return mount;
}

function createLayer(
  parent: WowFrame,
  name: string,
  drawLayer: EffectDrawLayer,
  drawSubLevel: number,
  blendMode: "ADD" | "BLEND",
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0,
  usesScale = true
): EffectLayer {
  const texture = parent.CreateTexture(name, drawLayer);
  texture.SetDrawLayer?.(drawLayer, drawSubLevel);
  texture.SetBlendMode?.(blendMode);
  texture.SetSize(width, height);
  texture.SetPoint("CENTER", parent, "CENTER", offsetX, offsetY);
  texture.Hide();

  return {
    parent,
    texture,
    drawLayer,
    drawSubLevel,
    enabled: false,
    baseWidth: width,
    baseHeight: height,
    offsetX,
    offsetY,
    usesScale
  };
}

function enforceLayerDrawOrder(layer: EffectLayer): void {
  layer.texture.SetDrawLayer?.(layer.drawLayer, layer.drawSubLevel);
}

function getOrderedLayers(effect: SpellEffectInstance): EffectLayer[] {
  return [
    effect.atmosphere,
    effect.impactFlash,
    effect.inkBurst,
    effect.energyBack,
    effect.particles,
    effect.energyFront,
    effect.speedLines,
    effect.textShadow,
    effect.textMain,
    effect.textSheen
  ];
}

function enforceEffectDrawOrder(effect: SpellEffectInstance): void {
  for (const layer of getOrderedLayers(effect)) {
    enforceLayerDrawOrder(layer);
  }

  enforceLayerDrawOrder(effect.textShadow);
  enforceLayerDrawOrder(effect.textMain);
}

function applyLayerTexture(layer: EffectLayer, path: string | undefined): boolean {
  if (path === undefined) {
    layer.enabled = false;
    layer.texture.Hide();
    return false;
  }

  layer.enabled = true;
  layer.texture.SetTexture(path);
  layer.texture.SetTexCoord(0, 1, 0, 1);
  enforceLayerDrawOrder(layer);
  setTextureAlpha(layer.texture, 0);
  layer.texture.Hide();
  return true;
}

function resetLayer(layer: EffectLayer): void {
  layer.texture.SetSize(layer.baseWidth, layer.baseHeight);
  layer.texture.ClearAllPoints?.();
  layer.texture.SetPoint("CENTER", layer.parent, "CENTER", layer.offsetX, layer.offsetY);
  setTextureAlpha(layer.texture, 0);
  layer.texture.Hide();
}

function beginLayerPlayback(layer: EffectLayer): void {
  if (!layer.enabled) {
    return;
  }

  layer.texture.Show();
  setTextureAlpha(layer.texture, 0);
  enforceLayerDrawOrder(layer);
}

function beginPlaybackLayers(effect: SpellEffectInstance): void {
  for (const layer of getOrderedLayers(effect)) {
    beginLayerPlayback(layer);
  }

  enforceEffectDrawOrder(effect);
}

function setLayerAlpha(layer: EffectLayer, alpha: number): void {
  if (!layer.enabled) {
    return;
  }

  setTextureAlpha(layer.texture, alpha);
}

function resolveMvpAssets(slug: SpellAnimationSlug): ResolvedSpellEffectAssets | undefined {
  const assets: ResolvedSpellEffectAssets = {
    styleSlug: slug.styleSlug,
    spellSlug: slug.spellSlug
  };

  const styleRoles: StylePackRole[] = ["impact_flash", "energy_back", "particles_4x4", "energy_front", "atmosphere"];

  for (const role of styleRoles) {
    const path = resolveStyleAssetPath(slug.styleSlug, role);

    if (role === "impact_flash") {
      assets.impactFlash = path;
    } else if (role === "energy_back") {
      assets.energyBack = path;
    } else if (role === "particles_4x4") {
      assets.particles = path;
    } else if (role === "energy_front") {
      assets.energyFront = path;
    } else if (role === "atmosphere") {
      assets.atmosphere = path;
    }
  }

  assets.textMain = resolveSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_main");
  assets.textShadow = resolveSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_shadow");
  assets.textSheen = resolveSpellAssetPath(slug.styleSlug, slug.spellSlug, "text_sheen");
  assets.inkBurst = resolveSharedAssetPath("shared_ink_burst_01" as SharedOverlayRole);
  assets.speedLines = resolveSharedAssetPath("shared_speed_lines_01" as SharedOverlayRole);

  const hasMvpPack =
    assets.impactFlash !== undefined &&
    assets.energyBack !== undefined &&
    assets.particles !== undefined &&
    assets.textMain !== undefined &&
    assets.textShadow !== undefined;

  if (!hasMvpPack) {
    return undefined;
  }

  return assets;
}

function updatePopLayer(
  layer: EffectLayer,
  elapsedSeconds: number,
  startSeconds: number,
  endSeconds: number,
  settleY: number
): void {
  const progress = segmentProgress(elapsedSeconds, startSeconds, endSeconds);
  const eased = easeOutBack(progress);
  const alpha = clamp01(progress <= 0 ? 0 : progress);
  const scale = lerp(0.78, progress >= 1 ? 1 : 1.1, eased);
  const fadeOut = segmentProgress(elapsedSeconds, 0.7, EFFECT_DURATION_SECONDS);
  const finalAlpha = alpha * (1 - easeOutQuad(fadeOut));

  setLayerAlpha(layer, finalAlpha);

  if (finalAlpha <= 0) {
    return;
  }

  layer.texture.ClearAllPoints?.();
  layer.texture.SetPoint("CENTER", layer.parent, "CENTER", layer.offsetX, layer.offsetY + settleY);

  if (layer.usesScale) {
    layer.texture.SetSize(layer.baseWidth * scale, layer.baseHeight * scale);
  }
}

function updateFlashLayer(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0, 0.08);

  if (progress <= 0 || progress >= 1) {
    setLayerAlpha(layer, 0);
    return;
  }

  const alpha = progress < 0.5 ? lerp(0, 0.9, progress / 0.5) : lerp(0.9, 0, (progress - 0.5) / 0.5);
  const scale = lerp(0.7, 1.25, easeOutQuad(progress));

  setLayerAlpha(layer, alpha);
  layer.texture.SetSize(layer.baseWidth * scale, layer.baseHeight * scale);
}

function updateEnergyBackLayer(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.03, 0.16);

  if (progress <= 0) {
    setLayerAlpha(layer, 0);
    return;
  }

  const alpha = clamp01(progress);
  const scaleX = lerp(0.65, 1.05, easeOutQuad(progress));
  const fadeOut = segmentProgress(elapsedSeconds, 0.7, 0.92);
  const finalAlpha = alpha * (1 - easeOutQuad(fadeOut));

  setLayerAlpha(layer, finalAlpha);

  if (finalAlpha <= 0) {
    return;
  }

  layer.texture.SetSize(layer.baseWidth * scaleX, layer.baseHeight);
}

function updateParticlesLayer(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.1, 0.34);

  if (progress <= 0) {
    setLayerAlpha(layer, 0);
    return;
  }

  const frameIndex = Math.min(
    PARTICLE_FRAME_COUNT,
    Math.max(1, Math.floor((elapsedSeconds - 0.1) / PARTICLE_FRAME_STEP_SECONDS) + 1)
  );
  const fadeOut = segmentProgress(elapsedSeconds, 0.7, 0.92);
  const alpha = (1 - easeOutQuad(fadeOut)) * clamp01(progress <= 0 ? 0 : 1);

  setLayerAlpha(layer, alpha);

  if (alpha <= 0) {
    return;
  }

  setSpriteFrame(layer.texture, frameIndex, PARTICLE_COLUMNS, PARTICLE_ROWS);
}

function updateSheenLayer(layer: EffectLayer, elapsedSeconds: number, settleY: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.16, 0.45);

  if (progress <= 0 || progress >= 1) {
    setLayerAlpha(layer, 0);
    return;
  }

  const fadeOut = segmentProgress(elapsedSeconds, 0.7, 0.92);
  const alpha = lerp(0.85, 0, easeOutQuad(progress)) * (1 - easeOutQuad(fadeOut));

  setLayerAlpha(layer, alpha);

  if (alpha <= 0) {
    return;
  }

  layer.texture.SetSize(layer.baseWidth, layer.baseHeight);
  layer.texture.ClearAllPoints?.();
  layer.texture.SetPoint(
    "CENTER",
    layer.parent,
    "CENTER",
    lerp(-40 * EFFECT_DISPLAY_SCALE, 40 * EFFECT_DISPLAY_SCALE, progress),
    settleY
  );
}

function updateOptionalLayer(layer: EffectLayer, elapsedSeconds: number, startSeconds: number, endSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, startSeconds, endSeconds);
  const fadeOut = segmentProgress(elapsedSeconds, 0.7, 0.92);
  const alpha = clamp01(progress) * (1 - easeOutQuad(fadeOut));

  setLayerAlpha(layer, alpha);
}

function updateTimeline(effect: SpellEffectInstance, elapsedSeconds: number): void {
  const settleY =
    elapsedSeconds >= 0.48 && elapsedSeconds <= 0.8
      ? lerp(0, -6 * EFFECT_DISPLAY_SCALE, segmentProgress(elapsedSeconds, 0.48, 0.8))
      : 0;
  const rootFade = segmentProgress(elapsedSeconds, 0.7, EFFECT_DURATION_SECONDS);
  const rootAlpha = 1 - easeOutQuad(rootFade);
  const rootScale =
    elapsedSeconds < 0.08
      ? lerp(0.92, 1.08, easeOutQuad(segmentProgress(elapsedSeconds, 0, 0.08)))
      : elapsedSeconds < 0.2
        ? lerp(1.08, 1, easeOutQuad(segmentProgress(elapsedSeconds, 0.08, 0.2)))
        : lerp(1, 1.03, easeOutQuad(segmentProgress(elapsedSeconds, 0.7, EFFECT_DURATION_SECONDS)));

  effect.root.SetAlpha?.(rootAlpha);
  effect.root.SetScale(rootScale * getSpellEffectUserScale());

  if (effect.assets?.atmosphere !== undefined) {
    updateOptionalLayer(effect.atmosphere, elapsedSeconds, 0, 0.92);
  }

  updateFlashLayer(effect.impactFlash, elapsedSeconds);

  if (effect.assets?.inkBurst !== undefined) {
    updateOptionalLayer(effect.inkBurst, elapsedSeconds, 0.03, 0.35);
  }

  updateEnergyBackLayer(effect.energyBack, elapsedSeconds);
  updateParticlesLayer(effect.particles, elapsedSeconds);
  updatePopLayer(effect.textShadow, elapsedSeconds, 0.06, 0.2, settleY);
  updatePopLayer(effect.textMain, elapsedSeconds, 0.06, 0.2, settleY);

  if (effect.assets?.energyFront !== undefined) {
    updateOptionalLayer(effect.energyFront, elapsedSeconds, 0.12, 0.42);
  }

  if (effect.assets?.speedLines !== undefined) {
    updateOptionalLayer(effect.speedLines, elapsedSeconds, 0.06, 0.28);
  }

  if (effect.assets?.textSheen !== undefined) {
    updateSheenLayer(effect.textSheen, elapsedSeconds, settleY);
  }

  enforceEffectDrawOrder(effect);
}

function hideAllLayers(effect: SpellEffectInstance): void {
  for (const layer of getOrderedLayers(effect)) {
    resetLayer(layer);
  }
}

function scaleLayerSize(value: number): number {
  return value * EFFECT_DISPLAY_SCALE;
}

export function createSpellEffectInstance(nameSuffix: string): SpellEffectInstance {
  const root = CreateFrame("Frame", `${ADDON_NAME}SpellEffect${nameSuffix}`, UIParent);
  root.SetFrameStrata("FULLSCREEN_DIALOG");
  root.SetFrameLevel(1001);
  root.SetSize(ROOT_WIDTH, ROOT_HEIGHT);
  root.EnableMouse(false);
  root.Hide();

  const effectName = `${ADDON_NAME}SpellEffect${nameSuffix}`;
  const mounts: LayerMountFrames = {
    back: createLayerMount(root, `${effectName}BackMount`, LAYER_MOUNT_LEVEL.back),
    mid: createLayerMount(root, `${effectName}MidMount`, LAYER_MOUNT_LEVEL.mid),
    front: createLayerMount(root, `${effectName}FrontMount`, LAYER_MOUNT_LEVEL.front),
    text: createLayerMount(root, `${effectName}TextMount`, LAYER_MOUNT_LEVEL.text),
    highlight: createLayerMount(root, `${effectName}HighlightMount`, LAYER_MOUNT_LEVEL.highlight)
  };

  const effect: SpellEffectInstance = {
    root,
    active: false,
    startTime: 0,
    impactFlash: createLayer(
      mounts.back,
      "ImpactFlash",
      "ARTWORK",
      DRAW_SUBLEVEL.impactFlash,
      "ADD",
      scaleLayerSize(512),
      scaleLayerSize(512)
    ),
    atmosphere: createLayer(
      mounts.back,
      "Atmosphere",
      "ARTWORK",
      DRAW_SUBLEVEL.atmosphere,
      "BLEND",
      scaleLayerSize(900),
      scaleLayerSize(360)
    ),
    inkBurst: createLayer(
      mounts.mid,
      "InkBurst",
      "ARTWORK",
      DRAW_SUBLEVEL.inkBurst,
      "BLEND",
      scaleLayerSize(700),
      scaleLayerSize(320)
    ),
    energyBack: createLayer(
      mounts.mid,
      "EnergyBack",
      "ARTWORK",
      DRAW_SUBLEVEL.energyBack,
      "BLEND",
      scaleLayerSize(900),
      scaleLayerSize(400)
    ),
    particles: createLayer(
      mounts.mid,
      "Particles",
      "ARTWORK",
      DRAW_SUBLEVEL.particles,
      "BLEND",
      scaleLayerSize(512),
      scaleLayerSize(512),
      scaleLayerSize(20),
      scaleLayerSize(10)
    ),
    energyFront: createLayer(
      mounts.front,
      "EnergyFront",
      "ARTWORK",
      DRAW_SUBLEVEL.energyFront,
      "BLEND",
      scaleLayerSize(700),
      scaleLayerSize(280),
      scaleLayerSize(30),
      scaleLayerSize(-10)
    ),
    speedLines: createLayer(
      mounts.front,
      "SpeedLines",
      "ARTWORK",
      DRAW_SUBLEVEL.speedLines,
      "ADD",
      scaleLayerSize(900),
      scaleLayerSize(300)
    ),
    textShadow: createLayer(
      mounts.text,
      "TextShadow",
      "OVERLAY",
      DRAW_SUBLEVEL.textShadow,
      "BLEND",
      scaleLayerSize(900),
      scaleLayerSize(220)
    ),
    textMain: createLayer(
      mounts.text,
      "TextMain",
      "OVERLAY",
      DRAW_SUBLEVEL.textMain,
      "BLEND",
      scaleLayerSize(900),
      scaleLayerSize(220)
    ),
    textSheen: createLayer(
      mounts.highlight,
      "TextSheen",
      "HIGHLIGHT",
      DRAW_SUBLEVEL.textSheen,
      "ADD",
      scaleLayerSize(900),
      scaleLayerSize(220)
    ),
    SetAnchorFrame(anchorFrame: WowFrame): void {
      root.ClearAllPoints();
      root.SetPoint("BOTTOM", anchorFrame, "BOTTOM", 0, 0);
    },
    Configure(slug: SpellAnimationSlug): boolean {
      const resolved = resolveMvpAssets(slug);

      if (resolved === undefined) {
        this.assets = undefined;
        return false;
      }

      this.assets = resolved;

      applyLayerTexture(this.impactFlash, resolved.impactFlash);
      applyLayerTexture(this.energyBack, resolved.energyBack);
      applyLayerTexture(this.particles, resolved.particles);
      applyLayerTexture(this.textMain, resolved.textMain);
      applyLayerTexture(this.textShadow, resolved.textShadow);
      applyLayerTexture(this.textSheen, resolved.textSheen);
      applyLayerTexture(this.atmosphere, resolved.atmosphere);
      applyLayerTexture(this.energyFront, resolved.energyFront);
      applyLayerTexture(this.inkBurst, resolved.inkBurst);
      applyLayerTexture(this.speedLines, resolved.speedLines);

      return true;
    },
    Play(): void {
      hideAllLayers(this);
      beginPlaybackLayers(this);
      this.active = true;
      this.startTime = GetTime();
      this.root.SetAlpha?.(1);
      this.root.SetScale(0.92 * getSpellEffectUserScale());
      this.root.Show();
      this.root.SetScript("OnUpdate", (_self, _elapsed) => {
        const elapsedSeconds = GetTime() - this.startTime;
        updateTimeline(this, elapsedSeconds);

        if (elapsedSeconds >= EFFECT_DURATION_SECONDS) {
          this.Stop();
        }
      });
    },
    Stop(): void {
      this.root.SetScript("OnUpdate", null as unknown as (self: WowFrame, ...args: unknown[]) => void);
      hideAllLayers(this);
      this.root.Hide();
      this.root.SetAlpha?.(1);
      this.root.SetScale(getSpellEffectUserScale());
      this.active = false;
    }
  };

  return effect;
}

export function canPlaySpellAnimation(slug: SpellAnimationSlug): boolean {
  return resolveMvpAssets(slug) !== undefined;
}
