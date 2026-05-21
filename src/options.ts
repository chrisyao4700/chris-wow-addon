import { syncActionLayout } from "./action-layout";
import { ADDON_TITLE } from "./config";
import {
  getLaunchCount,
  getSettings,
  resetLaunchCount,
  setEnableCustomActionLayout,
  setShowLoginMessage,
  setShowMinimapButton
} from "./db";
import { getMessages } from "./localization";
import { addonPrint } from "./platform/wow";
import { printDebugInfo } from "./commands";

type SettingsPanelHandlers = {
  onMinimapVisibilityChanged: () => void;
  onActionLayoutChanged: () => void;
};

type SettingsPanelControls = {
  launchCount?: WowFontString;
  minimapCheckbox?: WowCheckButton;
  loginCheckbox?: WowCheckButton;
  actionLayoutCheckbox?: WowCheckButton;
};

let panel: WowOptionsPanel | undefined;
let settingsCategory: WowSettingsCategory | undefined;
const controls: SettingsPanelControls = {};
let handlers: SettingsPanelHandlers | undefined;

function createLabel(
  parent: WowFrame,
  text: string,
  fontTemplate: string,
  point: WowPoint,
  relativeTo: WowFrame | WowFontString,
  relativePoint: WowPoint,
  x: number,
  y: number
): WowFontString {
  const label = parent.CreateFontString(undefined, "ARTWORK", fontTemplate);
  label.SetPoint(point, relativeTo, relativePoint, x, y);
  label.SetText(text);
  return label;
}

function isCheckButtonChecked(checkbox: WowCheckButton): boolean {
  const checked = checkbox.GetChecked();

  // Classic clients return 1/nil; newer clients return true/false.
  return checked === true || checked === 1;
}

function createCheckbox(
  parent: WowFrame,
  name: string,
  labelText: string,
  point: WowPoint,
  relativeTo: WowFrame,
  relativePoint: WowPoint,
  x: number,
  y: number,
  onClick: (checked: boolean) => void
): WowCheckButton {
  const checkbox = CreateFrame("CheckButton", name, parent, "UICheckButtonTemplate");
  checkbox.SetPoint(point, relativeTo, relativePoint, x, y);
  checkbox.SetSize(24, 24);

  const label = checkbox.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
  label.SetPoint("LEFT", checkbox, "RIGHT", 4, 0);
  label.SetText(labelText);

  checkbox.SetScript("OnClick", self => {
    onClick(isCheckButtonChecked(self));
    refreshSettingsPanel();
  });

  return checkbox;
}

function createButton(
  parent: WowFrame,
  name: string,
  text: string,
  width: number,
  point: WowPoint,
  relativeTo: WowFrame,
  relativePoint: WowPoint,
  x: number,
  y: number,
  onClick: () => void
): WowButton {
  const button = CreateFrame("Button", name, parent, "UIPanelButtonTemplate");
  button.SetSize(width, 24);
  button.SetPoint(point, relativeTo, relativePoint, x, y);
  button.SetText(text);
  button.SetScript("OnClick", onClick);
  return button;
}

export function refreshSettingsPanel(): void {
  const messages = getMessages();
  const settings = getSettings();

  if (controls.launchCount !== undefined) {
    controls.launchCount.SetText(messages.launchCount(getLaunchCount()));
  }

  if (controls.minimapCheckbox !== undefined) {
    controls.minimapCheckbox.SetChecked(settings.showMinimapButton);
  }

  if (controls.loginCheckbox !== undefined) {
    controls.loginCheckbox.SetChecked(settings.showLoginMessage);
  }

  if (controls.actionLayoutCheckbox !== undefined) {
    controls.actionLayoutCheckbox.SetChecked(settings.enableCustomActionLayout);
  }
}

export function openSettingsPanel(): void {
  if (panel === undefined) {
    addonPrint(getMessages().settingsUnavailable);
    return;
  }

  refreshSettingsPanel();

  if (Settings !== undefined && Settings.OpenToCategory !== undefined && settingsCategory !== undefined) {
    const openToCategory = Settings.OpenToCategory;
    const categoryId = settingsCategory.ID ?? settingsCategory.GetID?.();

    if (categoryId !== undefined) {
      openToCategory(categoryId);
      return;
    }

    openToCategory(settingsCategory);
    return;
  }

  if (InterfaceOptionsFrame_OpenToCategory !== undefined) {
    InterfaceOptionsFrame_OpenToCategory(panel);
    InterfaceOptionsFrame_OpenToCategory(panel);
    return;
  }

  addonPrint(getMessages().settingsUnavailable);
}

export function registerSettingsPanel(settingsPanelHandlers: SettingsPanelHandlers): void {
  handlers = settingsPanelHandlers;

  if (panel !== undefined) {
    refreshSettingsPanel();
    return;
  }

  const messages = getMessages();
  const optionsPanel = CreateFrame("Frame", "ChrisWowAddonOptionsPanel", UIParent) as WowOptionsPanel;
  panel = optionsPanel;
  optionsPanel.name = ADDON_TITLE;
  optionsPanel.refresh = refreshSettingsPanel;

  const title = createLabel(
    optionsPanel,
    messages.settingsTitle,
    "GameFontNormalLarge",
    "TOPLEFT",
    optionsPanel,
    "TOPLEFT",
    16,
    -16
  );

  createLabel(
    optionsPanel,
    messages.settingsDescription,
    "GameFontHighlightSmall",
    "TOPLEFT",
    title,
    "BOTTOMLEFT",
    0,
    -8
  );

  controls.launchCount = createLabel(
    optionsPanel,
    messages.launchCount(getLaunchCount()),
    "GameFontHighlight",
    "TOPLEFT",
    optionsPanel,
    "TOPLEFT",
    20,
    -72
  );

  controls.minimapCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonShowMinimapButton",
    messages.showMinimapButton,
    "TOPLEFT",
    optionsPanel,
    "TOPLEFT",
    20,
    -104,
    checked => {
      setShowMinimapButton(checked);
      handlers?.onMinimapVisibilityChanged();
    }
  );

  controls.loginCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonShowLoginMessage",
    messages.showLoginMessage,
    "TOPLEFT",
    controls.minimapCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setShowLoginMessage(checked);
    }
  );

  controls.actionLayoutCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonEnableCustomActionLayout",
    messages.enableCustomActionLayout,
    "TOPLEFT",
    controls.loginCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableCustomActionLayout(checked);
      handlers?.onActionLayoutChanged();
    }
  );

  createButton(
    optionsPanel,
    "ChrisWowAddonResetLaunchCount",
    messages.resetLaunchCount,
    150,
    "TOPLEFT",
    controls.actionLayoutCheckbox,
    "BOTTOMLEFT",
    0,
    -18,
    () => {
      resetLaunchCount();
      addonPrint(messages.reset);
      refreshSettingsPanel();
    }
  );

  createButton(
    optionsPanel,
    "ChrisWowAddonPrintDebugInfo",
    messages.printDebugInfo,
    150,
    "TOPLEFT",
    controls.actionLayoutCheckbox,
    "BOTTOMLEFT",
    160,
    -18,
    printDebugInfo
  );

  refreshSettingsPanel();

  if (getSettings().enableCustomActionLayout) {
    syncActionLayout();
  }

  if (
    Settings !== undefined &&
    Settings.RegisterCanvasLayoutCategory !== undefined &&
    Settings.RegisterAddOnCategory !== undefined
  ) {
    const registerCanvasLayoutCategory = Settings.RegisterCanvasLayoutCategory;
    const registerAddOnCategory = Settings.RegisterAddOnCategory;
    const [category] = registerCanvasLayoutCategory(optionsPanel, ADDON_TITLE);
    settingsCategory = category;

    if (settingsCategory !== undefined) {
      registerAddOnCategory(settingsCategory);
    }

    return;
  }

  if (InterfaceOptions_AddCategory !== undefined) {
    InterfaceOptions_AddCategory(optionsPanel);
  }
}
