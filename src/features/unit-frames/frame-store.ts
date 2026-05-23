import { getPlayerBreathStyle, getTargetBreathStyle } from "./breath-styles";
import { getPlayerFrameAnchor, getTargetFrameAnchor } from "./layout";
import { DemonSlayerUnitFrame } from "./unit-frame";

let playerFrame: DemonSlayerUnitFrame | undefined;
let targetFrame: DemonSlayerUnitFrame | undefined;
let lastLayoutScreenHeight = 0;

export function getPlayerUnitFrame(): DemonSlayerUnitFrame | undefined {
  return playerFrame;
}

export function getTargetUnitFrame(): DemonSlayerUnitFrame | undefined {
  return targetFrame;
}

export function resetLayoutCache(): void {
  lastLayoutScreenHeight = 0;
}

export function syncFrameAnchors(frames: { player: DemonSlayerUnitFrame; target: DemonSlayerUnitFrame }): void {
  const screenHeight = UIParent.GetHeight();

  if (screenHeight === lastLayoutScreenHeight) {
    return;
  }

  lastLayoutScreenHeight = screenHeight;
  frames.player.setAnchor(getPlayerFrameAnchor());
  frames.target.setAnchor(getTargetFrameAnchor());
}

export function ensureFrames(): { player: DemonSlayerUnitFrame; target: DemonSlayerUnitFrame } {
  if (playerFrame === undefined) {
    playerFrame = new DemonSlayerUnitFrame("player", "player", "Player", getPlayerBreathStyle(undefined), true);
  }

  if (targetFrame === undefined) {
    targetFrame = new DemonSlayerUnitFrame("target", "target", "Target", getTargetBreathStyle(true), false);
  }

  const frames = { player: playerFrame, target: targetFrame };
  syncFrameAnchors(frames);
  return frames;
}

export function hideStoredFrames(): void {
  playerFrame?.hide();
  targetFrame?.hide();
}
