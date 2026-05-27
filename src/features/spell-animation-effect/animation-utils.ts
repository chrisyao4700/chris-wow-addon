/** Layered VFX + text pop-in choreography. */
export const EFFECT_INTRO_SECONDS = 1.5;
/** Callout stays readable after intro before lifecycle fade-out. */
export const EFFECT_HOLD_SECONDS = 3;
export const EFFECT_FADEOUT_SECONDS = 0.5;
export const EFFECT_TOTAL_SECONDS = EFFECT_INTRO_SECONDS + EFFECT_HOLD_SECONDS + EFFECT_FADEOUT_SECONDS;

/** @deprecated Use EFFECT_TOTAL_SECONDS; kept for callers that meant full effect lifetime. */
export const EFFECT_DURATION_SECONDS = EFFECT_TOTAL_SECONDS;

const INTRO_REFERENCE_SECONDS = 0.92;

export const RETRIGGER_COOLDOWN_SECONDS = 0.35;
/** Global size multiplier for the layered spell callout (1 = design size). */
export const EFFECT_DISPLAY_SCALE = 0.5;

export function clamp01(value: number): number {
  if (value <= 0) {
    return 0;
  }

  if (value >= 1) {
    return 1;
  }

  return value;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const clamped = clamp01(t);
  const delta = clamped - 1;

  return 1 + c3 * delta * delta * delta + c1 * delta * delta;
}

export function easeOutQuad(t: number): number {
  const clamped = clamp01(t);
  const inverse = 1 - clamped;

  return 1 - inverse * inverse;
}

/** Map a keyframe time from the original ~0.92s intro reference into EFFECT_INTRO_SECONDS. */
export function introKeyframe(referenceSeconds: number): number {
  return (referenceSeconds / INTRO_REFERENCE_SECONDS) * EFFECT_INTRO_SECONDS;
}

export function effectFadeOutStart(): number {
  return EFFECT_INTRO_SECONDS + EFFECT_HOLD_SECONDS;
}

export function effectLifecycleFadeMultiplier(elapsedSeconds: number): number {
  if (elapsedSeconds < effectFadeOutStart()) {
    return 1;
  }

  return 1 - easeOutQuad(segmentProgress(elapsedSeconds, effectFadeOutStart(), EFFECT_TOTAL_SECONDS));
}

export function segmentProgress(elapsedSeconds: number, startSeconds: number, endSeconds: number): number {
  if (elapsedSeconds <= startSeconds) {
    return 0;
  }

  if (elapsedSeconds >= endSeconds) {
    return 1;
  }

  return (elapsedSeconds - startSeconds) / (endSeconds - startSeconds);
}

export function setSpriteFrame(texture: WowTexture, frameIndex: number, columns: number, rows: number): void {
  const zeroIndex = frameIndex - 1;
  const column = zeroIndex % columns;
  const row = Math.floor(zeroIndex / columns);
  const cellWidth = 1 / columns;
  const cellHeight = 1 / rows;

  texture.SetTexCoord(
    column * cellWidth,
    (column + 1) * cellWidth,
    row * cellHeight,
    (row + 1) * cellHeight
  );
}

export function setTextureAlpha(texture: WowTexture, alpha: number): void {
  texture.SetVertexColor!(1, 1, 1, alpha);
}
