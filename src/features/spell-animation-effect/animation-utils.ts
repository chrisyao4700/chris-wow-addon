export const EFFECT_DURATION_SECONDS = 0.92;
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
