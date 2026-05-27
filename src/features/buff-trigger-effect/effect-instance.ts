import { ADDON_NAME } from "../../core/config";
import {
  BUFF_EFFECT_FADEOUT_SECONDS,
  BUFF_EFFECT_INTRO_SECONDS,
  clamp01,
  easeOutBack,
  easeOutQuad,
  lerp,
  segmentProgress,
  setSpriteFrame,
  setTextureAlpha
} from "./animation-utils";
import { resolveBuffAssetPath, type BuffEffectRole } from "./assets";
import type { BuffTriggerStyleSlug } from "./style-slugs";

const ROOT_WIDTH = 360;
const ROOT_HEIGHT = 260;
const PARTICLE_COLUMNS = 4;
const PARTICLE_ROWS = 4;
const PARTICLE_FRAME_COUNT = 16;
const PARTICLE_FRAME_STEP_SECONDS = 0.022;

export type BuffEffectInstanceMode = "idle" | "intro" | "hold" | "fadeout";

type EffectLayer = {
  texture: WowTexture;
  enabled: boolean;
  baseWidth: number;
  baseHeight: number;
};

type ResolvedBuffEffectAssets = {
  styleSlug: BuffTriggerStyleSlug;
  triggerBurst?: string;
  indicatorCore?: string;
  particles?: string;
  activeGlow?: string;
};

export type BuffTriggerEffectInstance = {
  root: WowFrame;
  mode: BuffEffectInstanceMode;
  auraKey?: string;
  introOnly: boolean;
  phaseStartTime: number;
  assets?: ResolvedBuffEffectAssets;
  triggerBurst: EffectLayer;
  indicatorCore: EffectLayer;
  particles: EffectLayer;
  activeGlow: EffectLayer;
  SetAnchorFrame: (anchorFrame: WowFrame) => void;
  Configure: (styleSlug: BuffTriggerStyleSlug) => boolean;
  /** Plays intro; enters hold when introOnly is false. */
  PlayIntro: (auraKey: string, introOnly: boolean) => void;
  EnterHold: () => void;
  FadeOut: () => void;
  Stop: () => void;
};

function createLayer(
  parent: WowFrame,
  name: string,
  blendMode: "ADD" | "BLEND",
  width: number,
  height: number
): EffectLayer {
  const texture = parent.CreateTexture(name, "ARTWORK");
  texture.SetBlendMode?.(blendMode);
  texture.SetSize(width, height);
  texture.SetPoint("CENTER", parent, "CENTER", 0, 0);
  texture.Hide();

  return {
    texture,
    enabled: false,
    baseWidth: width,
    baseHeight: height
  };
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
  setTextureAlpha(layer.texture, 0);
  layer.texture.Hide();
  return true;
}

function setLayerAlpha(layer: EffectLayer, alpha: number): void {
  if (!layer.enabled) {
    return;
  }

  if (alpha <= 0) {
    layer.texture.Hide();
    setTextureAlpha(layer.texture, 0);
    return;
  }

  layer.texture.Show();
  setTextureAlpha(layer.texture, alpha);
}

function hideLayer(layer: EffectLayer): void {
  setTextureAlpha(layer.texture, 0);
  layer.texture.Hide();
}

function resolveBuffAssets(styleSlug: BuffTriggerStyleSlug): ResolvedBuffEffectAssets | undefined {
  const assets: ResolvedBuffEffectAssets = { styleSlug };
  const roles: BuffEffectRole[] = ["trigger_burst", "indicator_core", "particles_4x4", "active_glow"];

  for (const role of roles) {
    const path = resolveBuffAssetPath(styleSlug, role);

    if (role === "trigger_burst") {
      assets.triggerBurst = path;
    } else if (role === "indicator_core") {
      assets.indicatorCore = path;
    } else if (role === "particles_4x4") {
      assets.particles = path;
    } else if (role === "active_glow") {
      assets.activeGlow = path;
    }
  }

  if (assets.triggerBurst === undefined || assets.indicatorCore === undefined) {
    return undefined;
  }

  return assets;
}

function updateIntroBurst(layer: EffectLayer, elapsedSeconds: number): void {
  let alpha = 0;
  let scale = 1;

  if (elapsedSeconds < 0.08) {
    const progress = segmentProgress(elapsedSeconds, 0, 0.08);
    alpha = lerp(0, 0.95, easeOutQuad(progress));
    scale = lerp(0.72, 1.14, easeOutQuad(progress));
  } else if (elapsedSeconds < 0.36) {
    const progress = segmentProgress(elapsedSeconds, 0.08, 0.36);
    alpha = lerp(0.95, 0.2, easeOutQuad(progress));
    scale = lerp(1.14, 1.02, easeOutQuad(progress));
  } else {
    alpha = 0;
    scale = 1;
  }

  setLayerAlpha(layer, alpha);

  if (alpha > 0) {
    layer.texture.SetSize(layer.baseWidth * scale, layer.baseHeight * scale);
  }
}

function updateIntroCore(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.04, 0.18);
  const eased = easeOutBack(progress);
  const alpha = clamp01(progress <= 0 ? 0 : progress);
  const scale = lerp(0.68, progress >= 1 ? 1 : 1.12, eased);

  setLayerAlpha(layer, alpha);

  if (alpha > 0) {
    layer.texture.SetSize(layer.baseWidth * scale, layer.baseHeight * scale);
  }
}

function updateIntroParticles(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.08, 0.36);

  if (progress <= 0) {
    hideLayer(layer);
    return;
  }

  const frameIndex = (Math.floor(elapsedSeconds / PARTICLE_FRAME_STEP_SECONDS) % PARTICLE_FRAME_COUNT) + 1;
  setSpriteFrame(layer.texture, frameIndex, PARTICLE_COLUMNS, PARTICLE_ROWS);
  setLayerAlpha(layer, lerp(0.85, 0, easeOutQuad(progress)));
}

function updateIntroGlow(layer: EffectLayer, elapsedSeconds: number): void {
  const progress = segmentProgress(elapsedSeconds, 0.18, 0.72);

  if (progress <= 0) {
    hideLayer(layer);
    return;
  }

  const pulse = 1 + Math.sin(elapsedSeconds * 8) * 0.03;
  const alpha = lerp(0.15, 0.4, easeOutQuad(progress));

  setLayerAlpha(layer, alpha);
  layer.texture.SetSize(layer.baseWidth * pulse, layer.baseHeight * pulse);
}

function updateIntroTimeline(effect: BuffTriggerEffectInstance, elapsedSeconds: number): void {
  effect.root.SetAlpha?.(1);
  effect.root.SetScale(1);

  updateIntroBurst(effect.triggerBurst, elapsedSeconds);
  updateIntroCore(effect.indicatorCore, elapsedSeconds);

  if (effect.assets?.particles !== undefined) {
    updateIntroParticles(effect.particles, elapsedSeconds);
  }

  if (effect.assets?.activeGlow !== undefined) {
    updateIntroGlow(effect.activeGlow, elapsedSeconds);
  }
}

function updateHoldTimeline(effect: BuffTriggerEffectInstance, elapsedSeconds: number): void {
  const breathe = 1 + Math.sin(elapsedSeconds * 5) * 0.02;
  const glowPulse = 1 + Math.sin(elapsedSeconds * 6) * 0.04;
  const glowAlpha = 0.32 + Math.sin(elapsedSeconds * 6) * 0.08;

  effect.root.SetAlpha?.(1);
  effect.root.SetScale(breathe);

  hideLayer(effect.triggerBurst);
  hideLayer(effect.particles);

  setLayerAlpha(effect.indicatorCore, 0.92);
  effect.indicatorCore.texture.SetSize(effect.indicatorCore.baseWidth, effect.indicatorCore.baseHeight);

  if (effect.assets?.activeGlow !== undefined) {
    setLayerAlpha(effect.activeGlow, glowAlpha);
    effect.activeGlow.texture.SetSize(
      effect.activeGlow.baseWidth * glowPulse,
      effect.activeGlow.baseHeight * glowPulse
    );
  }
}

function updateFadeoutTimeline(effect: BuffTriggerEffectInstance, elapsedSeconds: number): void {
  const fade = 1 - easeOutQuad(segmentProgress(elapsedSeconds, 0, BUFF_EFFECT_FADEOUT_SECONDS));

  effect.root.SetAlpha?.(fade);
  effect.root.SetScale(lerp(1, 1.04, 1 - fade));

  setLayerAlpha(effect.indicatorCore, 0.92 * fade);
  setLayerAlpha(effect.activeGlow, 0.35 * fade);
  hideLayer(effect.triggerBurst);
  hideLayer(effect.particles);
}

function beginIntroPlayback(effect: BuffTriggerEffectInstance): void {
  for (const layer of [effect.triggerBurst, effect.indicatorCore, effect.particles, effect.activeGlow]) {
    if (layer.enabled) {
      layer.texture.Show();
      setTextureAlpha(layer.texture, 0);
    }
  }
}

function hideAllLayers(effect: BuffTriggerEffectInstance): void {
  for (const layer of [effect.triggerBurst, effect.indicatorCore, effect.particles, effect.activeGlow]) {
    hideLayer(layer);
  }
}

function attachOnUpdate(effect: BuffTriggerEffectInstance): void {
  effect.root.SetScript("OnUpdate", () => {
    const elapsedSeconds = GetTime() - effect.phaseStartTime;

    if (effect.mode === "intro") {
      updateIntroTimeline(effect, elapsedSeconds);

      if (elapsedSeconds >= BUFF_EFFECT_INTRO_SECONDS) {
        if (effect.introOnly) {
          effect.Stop();
        } else {
          effect.EnterHold();
        }
      }

      return;
    }

    if (effect.mode === "hold") {
      updateHoldTimeline(effect, elapsedSeconds);
      return;
    }

    if (effect.mode === "fadeout") {
      updateFadeoutTimeline(effect, elapsedSeconds);

      if (elapsedSeconds >= BUFF_EFFECT_FADEOUT_SECONDS) {
        effect.Stop();
      }
    }
  });
}

export function createBuffTriggerEffectInstance(nameSuffix: string): BuffTriggerEffectInstance {
  const root = CreateFrame("Frame", `${ADDON_NAME}BuffTriggerEffect${nameSuffix}`, UIParent);
  root.SetFrameStrata("FULLSCREEN_DIALOG");
  root.SetFrameLevel(1004);
  root.SetSize(ROOT_WIDTH, ROOT_HEIGHT);
  root.EnableMouse(false);
  root.Hide();

  const effect: BuffTriggerEffectInstance = {
    root,
    mode: "idle",
    introOnly: false,
    phaseStartTime: 0,
    triggerBurst: createLayer(root, "TriggerBurst", "ADD", 512, 256),
    indicatorCore: createLayer(root, "IndicatorCore", "BLEND", 160, 160),
    particles: createLayer(root, "Particles", "BLEND", 256, 256),
    activeGlow: createLayer(root, "ActiveGlow", "ADD", 300, 220),
    SetAnchorFrame(anchorFrame: WowFrame): void {
      root.SetParent(anchorFrame);
      root.ClearAllPoints();
      root.SetPoint("CENTER", anchorFrame, "CENTER", 0, 0);
      anchorFrame.Show();
    },
    Configure(styleSlug: BuffTriggerStyleSlug): boolean {
      const resolved = resolveBuffAssets(styleSlug);

      if (resolved === undefined) {
        this.assets = undefined;
        return false;
      }

      this.assets = resolved;
      applyLayerTexture(this.triggerBurst, resolved.triggerBurst);
      applyLayerTexture(this.indicatorCore, resolved.indicatorCore);
      applyLayerTexture(this.particles, resolved.particles);
      applyLayerTexture(this.activeGlow, resolved.activeGlow);
      return true;
    },
    PlayIntro(auraKey: string, introOnly: boolean): void {
      hideAllLayers(this);
      beginIntroPlayback(this);

      this.auraKey = auraKey;
      this.introOnly = introOnly;
      this.mode = "intro";
      this.phaseStartTime = GetTime();
      this.root.SetAlpha?.(1);
      this.root.SetScale(1);
      this.root.Show();
      attachOnUpdate(this);
    },
    EnterHold(): void {
      hideLayer(this.triggerBurst);
      hideLayer(this.particles);
      this.mode = "hold";
      this.phaseStartTime = GetTime();
      updateHoldTimeline(this, 0);
      attachOnUpdate(this);
    },
    FadeOut(): void {
      this.mode = "fadeout";
      this.phaseStartTime = GetTime();
      attachOnUpdate(this);
    },
    Stop(): void {
      this.root.SetScript("OnUpdate", null as unknown as (self: WowFrame, ...args: unknown[]) => void);
      hideAllLayers(this);
      this.root.Hide();
      this.root.SetAlpha?.(1);
      this.root.SetScale(1);
      this.mode = "idle";
      this.auraKey = undefined;
      this.introOnly = false;
    }
  };

  return effect;
}

export function canPlayBuffTriggerEffect(styleSlug: BuffTriggerStyleSlug): boolean {
  return resolveBuffAssets(styleSlug) !== undefined;
}
