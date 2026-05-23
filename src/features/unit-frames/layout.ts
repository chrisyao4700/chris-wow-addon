import { UNIT_FRAME_WIDTH } from "./unit-frame";
import type { UnitFrameAnchor } from "./unit-frame";

/** Vertical position from the top of the screen (0.75 = lower-center area). */
const SCREEN_HEIGHT_RATIO = 0.75;
const FRAME_PAIR_GAP = 24;

function getBottomOffset(): number {
  return UIParent.GetHeight() * (1 - SCREEN_HEIGHT_RATIO);
}

export function getPlayerFrameAnchor(): UnitFrameAnchor {
  return {
    point: "BOTTOMRIGHT",
    relativeTo: UIParent,
    relativePoint: "BOTTOM",
    x: -FRAME_PAIR_GAP / 2,
    y: getBottomOffset()
  };
}

export function getTargetFrameAnchor(): UnitFrameAnchor {
  return {
    point: "BOTTOMLEFT",
    relativeTo: UIParent,
    relativePoint: "BOTTOM",
    x: FRAME_PAIR_GAP / 2,
    y: getBottomOffset()
  };
}

export function getUnitFrameLayoutSummary(): string {
  const screenHeight = UIParent.GetHeight();
  const bottomOffset = getBottomOffset();

  return `bottom offset ${Math.floor(bottomOffset)}px (${Math.floor(SCREEN_HEIGHT_RATIO * 100)}% from top), gap ${FRAME_PAIR_GAP}px, width ${UNIT_FRAME_WIDTH}px`;
}
