import { ADDON_NAME } from "../../core/config";

const MAX_COMBO_POINTS = 5;
const SLOT_SIZE = 12;
const SLOT_GAP = 4;
const SLOT_TEXTURE = "Interface\\Buttons\\WHITE8x8";

const COMBO_MARKS_ZH = ["壱", "弐", "参", "肆", "伍"];
const COMBO_MARKS_EN = ["1", "2", "3", "4", "5"];

const GOLD = { r: 1, g: 0.86, b: 0.35 };
const INK = { r: 0.08, g: 0.06, b: 0.05 };

type ComboPointSlot = {
  background: WowTexture;
  fill: WowTexture;
  label: WowFontString;
};

export class TargetComboPointsDisplay {
  private readonly root: WowFrame;
  private readonly slots: ComboPointSlot[] = [];

  constructor(parent: WowFrame, nameSuffix: string) {
    const width = MAX_COMBO_POINTS * SLOT_SIZE + (MAX_COMBO_POINTS - 1) * SLOT_GAP;
    const root = CreateFrame("Frame", `${ADDON_NAME}DSComboPoints${nameSuffix}`, parent);
    root.SetSize(width, SLOT_SIZE);
    root.SetPoint("TOPLEFT", parent, "TOPLEFT", 68, -34);
    root.EnableMouse(false);
    this.root = root;

    for (let index = 0; index < MAX_COMBO_POINTS; index += 1) {
      const xOffset = index * (SLOT_SIZE + SLOT_GAP);
      const slotFrame = CreateFrame("Frame", `${ADDON_NAME}DSComboSlot${nameSuffix}${index}`, root);
      slotFrame.SetSize(SLOT_SIZE, SLOT_SIZE);
      slotFrame.SetPoint("TOPLEFT", root, "TOPLEFT", xOffset, 0);
      slotFrame.EnableMouse(false);

      const background = slotFrame.CreateTexture(undefined, "BACKGROUND");
      background.SetPoint("TOPLEFT", slotFrame, "TOPLEFT", 0, 0);
      background.SetSize(SLOT_SIZE, SLOT_SIZE);
      background.SetTexture(SLOT_TEXTURE);
      background.SetVertexColor?.(0.05, 0.04, 0.04, 0.95);

      const fill = slotFrame.CreateTexture(undefined, "ARTWORK");
      fill.SetPoint("TOPLEFT", slotFrame, "TOPLEFT", 1, -1);
      fill.SetSize(SLOT_SIZE - 2, SLOT_SIZE - 2);
      fill.SetTexture(SLOT_TEXTURE);
      fill.SetVertexColor?.(GOLD.r, GOLD.g, GOLD.b, 1);

      const label = slotFrame.CreateFontString(undefined, "OVERLAY", "GameFontHighlightSmall");
      label.SetPoint("CENTER", slotFrame, "CENTER", 0, 0);
      label.SetJustifyH("CENTER");
      label.SetFont("Fonts\\ARKai_T.ttf", 9, "OUTLINE");
      label.SetShadowColor(INK.r, INK.g, INK.b, 0.85);
      label.SetShadowOffset(1, -1);

      this.slots.push({ background, fill, label });
    }

    root.Hide();
  }

  update(count: number, visible: boolean, useChinese: boolean): void {
    if (!visible) {
      this.root.Hide();
      return;
    }

    this.root.Show();
    const clampedCount = Math.max(0, Math.min(MAX_COMBO_POINTS, count));
    const marks = useChinese ? COMBO_MARKS_ZH : COMBO_MARKS_EN;

    for (let index = 0; index < MAX_COMBO_POINTS; index += 1) {
      const slot = this.slots[index];
      const isActive = index < clampedCount;
      const mark = marks[index] ?? `${index + 1}`;

      slot.label.SetText(mark);

      if (isActive) {
        slot.fill.Show();
        slot.fill.SetVertexColor?.(GOLD.r, GOLD.g, GOLD.b, 1);
        slot.background.SetVertexColor?.(0.18, 0.14, 0.05, 0.98);
        slot.label.SetTextColor(GOLD.r, GOLD.g, GOLD.b, 1);
        continue;
      }

      slot.fill.Hide();
      slot.background.SetVertexColor?.(0.05, 0.04, 0.04, 0.95);
      slot.label.SetTextColor(0.45, 0.4, 0.35, 0.55);
    }
  }

  hide(): void {
    this.root.Hide();
  }
}

export function getTargetComboPointCount(): number {
  if (!UnitExists("target")) {
    return 0;
  }

  return GetComboPoints("player", "target") ?? 0;
}

export function shouldShowTargetComboPoints(): boolean {
  if (!UnitExists("target")) {
    return false;
  }

  const [, classFileName] = UnitClass("player");

  if (classFileName === "ROGUE") {
    return true;
  }

  if (classFileName === "DRUID") {
    const comboCount = getTargetComboPointCount();

    if (comboCount > 0) {
      return true;
    }

    if (GetShapeshiftForm !== undefined) {
      return GetShapeshiftForm() === 3;
    }
  }

  return false;
}
