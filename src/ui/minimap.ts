import { printDebugInfo } from "../commands";
import { ADDON_NAME, LOGO_TEXTURE_PATH } from "../core/config";
import { getSettings, setMinimapButtonAngle } from "../core/db";
import { getMessages } from "../core/localization";

let minimapButton: WowButton | undefined;
let isDragging = false;
let suppressNextClick = false;

const MINIMAP_BUTTON_SIZE = 36;
const MINIMAP_ICON_SIZE = 31;
const MINIMAP_EDGE_OVERLAP = 5;

function normalizeAngle(angle: number): number {
  if (angle < 0) {
    return angle + 360;
  }

  return angle;
}

function getMinimapButtonRadius(): number {
  const minimapRadius = Math.min(Minimap.GetWidth(), Minimap.GetHeight()) / 2;
  return minimapRadius + MINIMAP_BUTTON_SIZE / 2 - MINIMAP_EDGE_OVERLAP;
}

function positionMinimapButton(button: WowButton, angle: number): void {
  const radians = angle * (Math.PI / 180);
  const radius = getMinimapButtonRadius();

  button.ClearAllPoints();
  button.SetPoint("CENTER", Minimap, "CENTER", Math.cos(radians) * radius, Math.sin(radians) * radius);
}

function getCursorAngle(): number {
  const [cursorX, cursorY] = GetCursorPosition();
  const [minimapX, minimapY] = Minimap.GetCenter();
  const scale = Minimap.GetEffectiveScale();
  const scaledCursorX = cursorX / scale;
  const scaledCursorY = cursorY / scale;
  const angle = Math.atan2(scaledCursorY - minimapY, scaledCursorX - minimapX) * (180 / Math.PI);

  return normalizeAngle(angle);
}

function updateDraggedButtonPosition(): void {
  if (minimapButton === undefined) {
    return;
  }

  const angle = getCursorAngle();
  setMinimapButtonAngle(angle);
  positionMinimapButton(minimapButton, angle);
}

export function syncMinimapButton(): void {
  if (minimapButton === undefined) {
    return;
  }

  if (getSettings().showMinimapButton) {
    minimapButton.Show();
    return;
  }

  minimapButton.Hide();
}

export function registerMinimapButton(openSettings: () => void): void {
  if (minimapButton !== undefined) {
    syncMinimapButton();
    return;
  }

  const button = CreateFrame("Button", `${ADDON_NAME}MinimapButton`, Minimap);
  minimapButton = button;

  button.SetSize(MINIMAP_BUTTON_SIZE, MINIMAP_BUTTON_SIZE);
  button.SetFrameStrata("MEDIUM");
  button.SetFrameLevel(8);
  button.SetMovable(true);
  button.EnableMouse(true);
  button.RegisterForClicks("LeftButtonUp", "RightButtonUp");
  button.RegisterForDrag("LeftButton");

  const icon = button.CreateTexture(undefined, "ARTWORK");
  icon.SetTexture(LOGO_TEXTURE_PATH);
  icon.SetSize(MINIMAP_ICON_SIZE, MINIMAP_ICON_SIZE);
  icon.SetPoint("CENTER", button, "CENTER", 0, 0);

  button.SetScript("OnClick", (_self, mouseButton) => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }

    if (mouseButton === "RightButton") {
      printDebugInfo();
      return;
    }

    openSettings();
  });

  button.SetScript("OnDragStart", () => {
    isDragging = true;
    suppressNextClick = true;
    updateDraggedButtonPosition();
  });

  button.SetScript("OnDragStop", () => {
    isDragging = false;
    updateDraggedButtonPosition();
  });

  button.SetScript("OnUpdate", () => {
    if (isDragging) {
      updateDraggedButtonPosition();
    }
  });

  button.SetScript("OnEnter", self => {
    const messages = getMessages();
    GameTooltip.SetOwner(self, "ANCHOR_LEFT");
    GameTooltip.SetText(messages.minimapTooltipTitle);
    GameTooltip.AddLine(messages.minimapTooltipLeftClick, 1, 1, 1);
    GameTooltip.AddLine(messages.minimapTooltipRightClick, 1, 1, 1);
    GameTooltip.Show();
  });

  button.SetScript("OnLeave", () => {
    GameTooltip.Hide();
  });

  positionMinimapButton(button, getSettings().minimapButtonAngle);
  syncMinimapButton();
}
