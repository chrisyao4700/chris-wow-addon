import { ADDON_NAME } from "../../core/config";
import type { BreathRgb, BreathStyle } from "./breath-styles";
import { getHealthBarColors, getPowerBarColors } from "./bar-colors";
import { getHealthLabel, getPowerLabel } from "./power-labels";
import {
  createResourceBar,
  ResourceBarElements,
  setResourceBarVisible,
  updateResourceBar
} from "./resource-bar";
import { TargetComboPointsDisplay } from "./combo-points";
import { attachTargetUnitClickButton } from "./unit-click-button";

export type UnitFrameKind = "player" | "target";

export type UnitFrameAnchor = {
  point: WowPoint;
  relativeTo: WowFrame;
  relativePoint: WowPoint;
  x: number;
  y: number;
};

const FRAME_WIDTH = 268;
export const UNIT_FRAME_WIDTH = FRAME_WIDTH;
const FRAME_HEIGHT = 92;
const PLAYER_HEALTH_BAR_Y = -38;
const TARGET_HEALTH_BAR_Y = -46;
const PORTRAIT_SIZE = 50;
const PORTRAIT_SEAL_HEIGHT = 16;
const PORTRAIT_SEAL_GAP = 2;
const SEAL_ITEM_GAP = 2;
const PORTRAIT_BORDER_WIDTH = 2;
const CONTENT_LEFT = 68;
const CONTENT_RIGHT = 10;
const PADDING_TOP = 8;
const BAR_HEIGHT = 13;
const BAR_GAP = 5;
const CLASS_ICON_TEXTURE = "Interface\\GLUES\\CHARACTERCREATE\\UI-CHARACTERCREATE-CLASSES";
const CLASS_ICON_SIZE = 12;
const LEVEL_BADGE_WIDTH = 18;
const LEVEL_BADGE_HEIGHT = 14;
const CHINESE_FONT_PATHS = ["Fonts\\ARKai_T.ttf", "Fonts\\ARHeiti.ttf", "Fonts\\ARKai_C.ttf"];

const GOLD = { r: 1, g: 0.86, b: 0.35 };
const INK = { r: 0.08, g: 0.06, b: 0.05 };
const PAPER = { r: 0.1, g: 0.08, b: 0.07, a: 0.94 };

const CLASS_ICON_TEX_COORDS: Record<string, [number, number, number, number]> = {
  WARRIOR: [0, 0.25, 0, 0.25],
  MAGE: [0.25, 0.49609375, 0, 0.25],
  ROGUE: [0.49609375, 0.7421875, 0, 0.25],
  DRUID: [0.7421875, 0.98828125, 0, 0.25],
  HUNTER: [0, 0.25, 0.25, 0.5],
  SHAMAN: [0.25, 0.49609375, 0.25, 0.5],
  PRIEST: [0.49609375, 0.7421875, 0.25, 0.5],
  WARLOCK: [0.7421875, 0.98828125, 0.25, 0.5],
  PALADIN: [0, 0.25, 0.5, 0.75],
  DEATHKNIGHT: [0.25, 0.49609375, 0.5, 0.75],
  MONK: [0.49609375, 0.7421875, 0.5, 0.75],
  DEMONHUNTER: [0.7421875, 0.98828125, 0.5, 0.75]
};

type PortraitBorder = {
  top: WowTexture;
  bottom: WowTexture;
  left: WowTexture;
  right: WowTexture;
};

export class DemonSlayerUnitFrame {
  readonly unit: string;
  readonly kind: UnitFrameKind;
  private readonly root: WowFrame;
  private readonly portraitHolder: WowFrame;
  private readonly portraitBg: WowTexture;
  private readonly portrait: WowTexture;
  private readonly portraitBorder: PortraitBorder;
  private readonly portraitSeal: WowFrame;
  private readonly classIconBg: WowTexture;
  private readonly classIcon: WowTexture;
  private readonly levelBadgeBg: WowTexture;
  private readonly levelText: WowFontString;
  private readonly portraitSealExtra: WowFrame;
  private readonly subtitleText: WowFontString;
  private readonly rankText: WowFontString;
  private readonly nameText: WowFontString;
  private readonly healthBar: ResourceBarElements;
  private readonly powerBar: ResourceBarElements;
  private readonly comboPoints?: TargetComboPointsDisplay;
  private style: BreathStyle;
  private showPowerBar: boolean;
  private useChineseLabels: boolean;

  constructor(unit: string, kind: UnitFrameKind, nameSuffix: string, style: BreathStyle, showPowerBar: boolean) {
    this.unit = unit;
    this.kind = kind;
    this.style = style;
    this.showPowerBar = showPowerBar;
    this.useChineseLabels = false;

    const root = CreateFrame("Frame", `${ADDON_NAME}DSUnitFrame${nameSuffix}`, UIParent);
    root.SetSize(FRAME_WIDTH, FRAME_HEIGHT);
    root.SetFrameStrata("MEDIUM");
    root.SetFrameLevel(20);
    root.EnableMouse(false);
    this.root = root;

    const backdrop = root.CreateTexture(undefined, "BACKGROUND");
    backdrop.SetPoint("TOPLEFT", root, "TOPLEFT", 0, 0);
    backdrop.SetPoint("BOTTOMRIGHT", root, "BOTTOMRIGHT", 0, 0);
    backdrop.SetTexture("Interface\\Buttons\\WHITE8x8");
    backdrop.SetVertexColor?.(PAPER.r, PAPER.g, PAPER.b, PAPER.a);

    this.portraitHolder = CreateFrame("Frame", `${ADDON_NAME}DSPortrait${nameSuffix}`, root);
    this.portraitHolder.SetSize(PORTRAIT_SIZE, PORTRAIT_SIZE);
    this.portraitHolder.SetPoint("TOPLEFT", root, "TOPLEFT", 8, -8);

    this.portraitBg = this.portraitHolder.CreateTexture(undefined, "BACKGROUND");
    this.portraitBg.SetPoint("TOPLEFT", this.portraitHolder, "TOPLEFT", 0, 0);
    this.portraitBg.SetSize(PORTRAIT_SIZE, PORTRAIT_SIZE);
    this.portraitBg.SetTexture("Interface\\Buttons\\WHITE8x8");
    this.portraitBg.SetVertexColor?.(0.04, 0.04, 0.04, 1);

    this.portrait = this.portraitHolder.CreateTexture(undefined, "ARTWORK");
    this.portrait.SetPoint("TOPLEFT", this.portraitHolder, "TOPLEFT", PORTRAIT_BORDER_WIDTH, -PORTRAIT_BORDER_WIDTH);
    this.portrait.SetSize(
      PORTRAIT_SIZE - PORTRAIT_BORDER_WIDTH * 2,
      PORTRAIT_SIZE - PORTRAIT_BORDER_WIDTH * 2
    );
    this.portrait.SetTexture("Interface\\Icons\\INV_Misc_QuestionMark");

    this.portraitBorder = this.createPortraitBorder(this.portraitHolder, style.accent);

    this.portraitSeal = CreateFrame("Frame", `${ADDON_NAME}DSPortraitSeal${nameSuffix}`, root);
    this.portraitSeal.SetSize(PORTRAIT_SIZE, PORTRAIT_SEAL_HEIGHT);
    this.portraitSeal.SetPoint("TOPLEFT", this.portraitHolder, "BOTTOMLEFT", 0, -PORTRAIT_SEAL_GAP);
    this.portraitSeal.EnableMouse(false);

    this.levelBadgeBg = this.portraitSeal.CreateTexture(undefined, "ARTWORK");
    this.levelBadgeBg.SetPoint("LEFT", this.portraitSeal, "LEFT", 0, 0);
    this.levelBadgeBg.SetSize(LEVEL_BADGE_WIDTH, LEVEL_BADGE_HEIGHT);
    this.levelBadgeBg.SetTexture("Interface\\Buttons\\WHITE8x8");
    this.levelBadgeBg.SetVertexColor?.(0.08, 0.06, 0.05, 0.95);

    this.levelText = this.createFontString(this.portraitSeal, "GameFontHighlightSmall", 11);
    this.levelText.SetPoint("CENTER", this.levelBadgeBg, "CENTER", 0, 0);
    this.levelText.SetJustifyH("CENTER");
    this.levelText.SetTextColor(GOLD.r, GOLD.g, GOLD.b, 1);

    this.classIconBg = this.portraitSeal.CreateTexture(undefined, "ARTWORK");
    this.classIconBg.SetPoint("RIGHT", this.portraitSeal, "RIGHT", 0, 0);
    this.classIconBg.SetSize(CLASS_ICON_SIZE, CLASS_ICON_SIZE);
    this.classIconBg.SetTexture("Interface\\Buttons\\WHITE8x8");
    this.classIconBg.SetVertexColor?.(INK.r, INK.g, INK.b, 0.9);

    this.classIcon = this.portraitSeal.CreateTexture(undefined, "OVERLAY");
    this.classIcon.SetPoint("CENTER", this.classIconBg, "CENTER", 0, 0);
    this.classIcon.SetSize(CLASS_ICON_SIZE - 2, CLASS_ICON_SIZE - 2);
    this.classIcon.SetTexture(CLASS_ICON_TEXTURE);
    this.classIconBg.Hide();
    this.classIcon.Hide();

    this.portraitSealExtra = CreateFrame("Frame", `${ADDON_NAME}DSPortraitSealExtra${nameSuffix}`, this.portraitSeal);
    this.portraitSealExtra.EnableMouse(false);
    this.layoutPortraitSealExtra(false);

    const contentWidth = FRAME_WIDTH - CONTENT_LEFT - CONTENT_RIGHT;

    this.subtitleText = this.createFontString(root, "GameFontHighlightSmall", 10);
    this.subtitleText.SetPoint("TOPLEFT", root, "TOPLEFT", CONTENT_LEFT, -PADDING_TOP);
    this.subtitleText.SetJustifyH("LEFT");

    this.rankText = this.createFontString(root, "GameFontHighlightSmall", 10);
    this.rankText.SetPoint("TOPRIGHT", root, "TOPRIGHT", -CONTENT_RIGHT, -PADDING_TOP);
    this.rankText.SetJustifyH("RIGHT");

    this.nameText = this.createFontString(root, "GameFontNormalLarge", 14);
    this.nameText.SetPoint("TOPLEFT", root, "TOPLEFT", CONTENT_LEFT, -22);
    this.nameText.SetPoint("TOPRIGHT", root, "TOPRIGHT", -CONTENT_RIGHT, -22);
    this.nameText.SetJustifyH("LEFT");
    this.nameText.SetTextColor(GOLD.r, GOLD.g, GOLD.b, 1);

    this.healthBar = createResourceBar(
      root,
      `${ADDON_NAME}DSHealth${nameSuffix}`,
      contentWidth,
      BAR_HEIGHT,
      "TOPLEFT",
      root,
      "TOPLEFT",
      CONTENT_LEFT,
      kind === "target" ? TARGET_HEALTH_BAR_Y : PLAYER_HEALTH_BAR_Y,
      (parent, template, size) => this.createFontString(parent, template, size)
    );

    this.powerBar = createResourceBar(
      root,
      `${ADDON_NAME}DSPower${nameSuffix}`,
      contentWidth,
      BAR_HEIGHT,
      "TOPLEFT",
      this.healthBar.container,
      "BOTTOMLEFT",
      0,
      -BAR_GAP,
      (parent, template, size) => this.createFontString(parent, template, size)
    );

    if (kind === "target") {
      this.comboPoints = new TargetComboPointsDisplay(root, nameSuffix);
      attachTargetUnitClickButton(root, nameSuffix, unit);
    }
  }

  setAnchor(anchor: UnitFrameAnchor): void {
    this.root.ClearAllPoints();
    this.root.SetPoint(anchor.point, anchor.relativeTo, anchor.relativePoint, anchor.x, anchor.y);
  }

  setStyle(style: BreathStyle): void {
    this.style = style;
    this.applyPortraitBorderColor(style.accent);
    this.classIconBg.SetVertexColor?.(style.accent.r * 0.45, style.accent.g * 0.45, style.accent.b * 0.45, 0.92);
  }

  setUseChineseLabels(useChinese: boolean): void {
    this.useChineseLabels = useChinese;
  }

  setShowPowerBar(showPowerBar: boolean): void {
    this.showPowerBar = showPowerBar;
    setResourceBarVisible(this.powerBar, showPowerBar);
  }

  setTexts(subtitle: string, rank: string, name: string): void {
    this.subtitleText.SetText(subtitle);
    this.rankText.SetText(rank);
    this.nameText.SetText(name);
  }

  setClassIcon(classFileName: string | undefined): void {
    const coords = classFileName === undefined ? undefined : CLASS_ICON_TEX_COORDS[classFileName];

    if (coords === undefined) {
      this.classIconBg.Hide();
      this.classIcon.Hide();
      this.layoutPortraitSealExtra(false);
      return;
    }

    this.classIconBg.Show();
    this.classIcon.Show();
    this.classIcon.SetTexture(CLASS_ICON_TEXTURE);
    this.classIcon.SetTexCoord(coords[0], coords[1], coords[2], coords[3]);
    this.layoutPortraitSealExtra(true);
  }

  updateLevel(level: number | undefined, displayText: string): void {
    this.levelText.SetText(displayText);
    this.levelBadgeBg.Show();
    this.levelText.Show();

    if (level !== undefined && level < 1) {
      this.levelText.SetTextColor(0.95, 0.35, 0.35, 1);
      return;
    }

    this.levelText.SetTextColor(GOLD.r, GOLD.g, GOLD.b, 1);
  }

  updatePortrait(unit: string): void {
    if (!UnitExists(unit)) {
      this.portrait.SetTexture("Interface\\Icons\\INV_Misc_QuestionMark");
      return;
    }

    SetPortraitTexture(this.portrait, unit);
  }

  updateHealth(current: number, max: number, isEnemy = false): void {
    const colors = getHealthBarColors(this.kind === "target" && isEnemy);

    updateResourceBar(
      this.healthBar,
      current,
      max,
      colors.bar,
      colors.barDim,
      colors.accent,
      getHealthLabel(this.useChineseLabels),
      true,
      isEnemy ? "enemy" : "friendly"
    );
  }

  updatePower(current: number, max: number, powerType?: number): void {
    const colors = getPowerBarColors(powerType);

    if (!this.showPowerBar || max <= 0) {
      updateResourceBar(
        this.powerBar,
        0,
        1,
        colors.bar,
        colors.barDim,
        colors.accent,
        getPowerLabel(powerType, this.useChineseLabels),
        false,
        `${powerType ?? "hidden"}`
      );
      return;
    }

    updateResourceBar(
      this.powerBar,
      current,
      max,
      colors.bar,
      colors.barDim,
      colors.accent,
      getPowerLabel(powerType, this.useChineseLabels),
      true,
      `${powerType ?? "power"}`
    );
  }

  updateComboPoints(count: number, visible: boolean): void {
    this.comboPoints?.update(count, visible, this.useChineseLabels);
  }

  show(): void {
    this.root.Show();
  }

  hide(): void {
    this.root.Hide();
  }

  isShown(): boolean {
    return this.root.IsShown();
  }

  getRootFrame(): WowFrame {
    return this.root;
  }

  private createFontString(parent: WowFrame, template: string, preferredSize: number): WowFontString {
    const label = parent.CreateFontString(undefined, "OVERLAY", template);
    applyPreferredFont(label, preferredSize);
    label.SetShadowColor(INK.r, INK.g, INK.b, 0.85);
    label.SetShadowOffset(1, -1);
    return label;
  }

  private layoutPortraitSealExtra(hasClassIcon: boolean): void {
    this.portraitSealExtra.ClearAllPoints();
    this.portraitSealExtra.SetPoint("TOP", this.portraitSeal, "TOP", 0, 0);
    this.portraitSealExtra.SetPoint("BOTTOM", this.portraitSeal, "BOTTOM", 0, 0);
    this.portraitSealExtra.SetPoint("LEFT", this.portraitSeal, "LEFT", LEVEL_BADGE_WIDTH + SEAL_ITEM_GAP, 0);

    const rightInset = hasClassIcon ? CLASS_ICON_SIZE + SEAL_ITEM_GAP : 0;
    this.portraitSealExtra.SetPoint("RIGHT", this.portraitSeal, "RIGHT", -rightInset, 0);
  }

  private createPortraitBorder(holder: WowFrame, accent: BreathRgb): PortraitBorder {
    const top = holder.CreateTexture(undefined, "OVERLAY");
    top.SetPoint("TOPLEFT", holder, "TOPLEFT", 0, 0);
    top.SetSize(PORTRAIT_SIZE, PORTRAIT_BORDER_WIDTH);
    top.SetTexture("Interface\\Buttons\\WHITE8x8");

    const bottom = holder.CreateTexture(undefined, "OVERLAY");
    bottom.SetPoint("BOTTOMLEFT", holder, "BOTTOMLEFT", 0, 0);
    bottom.SetSize(PORTRAIT_SIZE, PORTRAIT_BORDER_WIDTH);
    bottom.SetTexture("Interface\\Buttons\\WHITE8x8");

    const left = holder.CreateTexture(undefined, "OVERLAY");
    left.SetPoint("TOPLEFT", holder, "TOPLEFT", 0, 0);
    left.SetSize(PORTRAIT_BORDER_WIDTH, PORTRAIT_SIZE);
    left.SetTexture("Interface\\Buttons\\WHITE8x8");

    const right = holder.CreateTexture(undefined, "OVERLAY");
    right.SetPoint("TOPRIGHT", holder, "TOPRIGHT", 0, 0);
    right.SetSize(PORTRAIT_BORDER_WIDTH, PORTRAIT_SIZE);
    right.SetTexture("Interface\\Buttons\\WHITE8x8");

    const border: PortraitBorder = { top, bottom, left, right };
    this.applyPortraitBorderColor(accent, border);
    return border;
  }

  private applyPortraitBorderColor(accent: BreathRgb, border: PortraitBorder = this.portraitBorder): void {
    const outer = {
      r: accent.r * 0.55 + GOLD.r * 0.45,
      g: accent.g * 0.55 + GOLD.g * 0.45,
      b: accent.b * 0.55 + GOLD.b * 0.45
    };

    for (const edge of [border.top, border.bottom, border.left, border.right]) {
      edge.SetVertexColor?.(outer.r, outer.g, outer.b, 1);
    }
  }
}

function applyPreferredFont(label: WowFontString, preferredSize: number): void {
  const locale = GetLocale();

  if (locale === "zhCN" || locale === "zhTW") {
    for (const fontPath of CHINESE_FONT_PATHS) {
      const [ok] = pcall(() => label.SetFont(fontPath, preferredSize, "OUTLINE"));

      if (ok) {
        return;
      }
    }
  }
}
