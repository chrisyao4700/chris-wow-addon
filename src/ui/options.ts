import { printDebugInfo } from "../commands";
import { ADDON_TITLE } from "../core/config";
import {
  getLaunchCount,
  getSettings,
  resetLaunchCount,
  setEnableCustomActionLayout,
  setEnableDemonSlayerSystemButtons,
  setEnableDemonSlayerUnitFrames,
  setEnableSpellTextEffect,
  setShowLoginMessage,
  setShowMinimapButton
} from "../core/db";
import { getMessages } from "../core/localization";
import { syncActionLayout } from "../features/action-layout";
import { syncSpellTextEffect } from "../features/spell-text-effect";
import { syncDemonSlayerSystemButtons } from "../features/system-buttons";
import { syncDemonSlayerUnitFrames } from "../features/unit-frames";
import { addonPrint } from "../platform/wow";

type SettingsPanelHandlers = {
  onMinimapVisibilityChanged: () => void;
  onActionLayoutChanged: () => void;
  onSpellTextEffectChanged: () => void;
  onDemonSlayerUnitFramesChanged: () => void;
  onDemonSlayerSystemButtonsChanged: () => void;
};

type SettingsPanelControls = {
  launchCount?: WowFontString;
  featuresHeader?: WowFontString;
  actionLayoutCheckbox?: WowCheckButton;
  spellTextEffectCheckbox?: WowCheckButton;
  demonSlayerUnitFramesCheckbox?: WowCheckButton;
  demonSlayerSystemButtonsCheckbox?: WowCheckButton;
  minimapCheckbox?: WowCheckButton;
  loginCheckbox?: WowCheckButton;
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

  if (controls.actionLayoutCheckbox !== undefined) {
    controls.actionLayoutCheckbox.SetChecked(settings.enableCustomActionLayout);
  }

  if (controls.spellTextEffectCheckbox !== undefined) {
    controls.spellTextEffectCheckbox.SetChecked(settings.enableSpellTextEffect);
  }

  if (controls.demonSlayerUnitFramesCheckbox !== undefined) {
    controls.demonSlayerUnitFramesCheckbox.SetChecked(settings.enableDemonSlayerUnitFrames);
  }

  if (controls.demonSlayerSystemButtonsCheckbox !== undefined) {
    controls.demonSlayerSystemButtonsCheckbox.SetChecked(settings.enableDemonSlayerSystemButtons);
  }

  if (controls.minimapCheckbox !== undefined) {
    controls.minimapCheckbox.SetChecked(settings.showMinimapButton);
  }

  if (controls.loginCheckbox !== undefined) {
    controls.loginCheckbox.SetChecked(settings.showLoginMessage);
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

  controls.featuresHeader = createLabel(
    optionsPanel,
    messages.settingsFeaturesHeader,
    "GameFontNormal",
    "TOPLEFT",
    controls.launchCount,
    "BOTTOMLEFT",
    0,
    -12
  );

  controls.actionLayoutCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonEnableCustomActionLayout",
    messages.enableCustomActionLayout,
    "TOPLEFT",
    optionsPanel,
    "TOPLEFT",
    20,
    -128,
    checked => {
      setEnableCustomActionLayout(checked);
      handlers?.onActionLayoutChanged();
    }
  );

  controls.spellTextEffectCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonEnableSpellTextEffect",
    messages.enableSpellTextEffect,
    "TOPLEFT",
    controls.actionLayoutCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableSpellTextEffect(checked);
      handlers?.onSpellTextEffectChanged();
    }
  );

  controls.demonSlayerUnitFramesCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonEnableDemonSlayerUnitFrames",
    messages.enableDemonSlayerUnitFrames,
    "TOPLEFT",
    controls.spellTextEffectCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableDemonSlayerUnitFrames(checked);
      handlers?.onDemonSlayerUnitFramesChanged();
    }
  );

  controls.demonSlayerSystemButtonsCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonEnableDemonSlayerSystemButtons",
    messages.enableDemonSlayerSystemButtons,
    "TOPLEFT",
    controls.demonSlayerUnitFramesCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableDemonSlayerSystemButtons(checked);
      handlers?.onDemonSlayerSystemButtonsChanged();
    }
  );

  controls.minimapCheckbox = createCheckbox(
    optionsPanel,
    "ChrisWowAddonShowMinimapButton",
    messages.showMinimapButton,
    "TOPLEFT",
    controls.demonSlayerSystemButtonsCheckbox,
    "BOTTOMLEFT",
    0,
    -12,
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

  createButton(
    optionsPanel,
    "ChrisWowAddonResetLaunchCount",
    messages.resetLaunchCount,
    150,
    "TOPLEFT",
    controls.loginCheckbox,
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
    controls.loginCheckbox,
    "BOTTOMLEFT",
    160,
    -18,
    printDebugInfo
  );

  refreshSettingsPanel();

  if (getSettings().enableCustomActionLayout) {
    syncActionLayout();
  }

  if (getSettings().enableSpellTextEffect) {
    syncSpellTextEffect();
  }

  if (getSettings().enableDemonSlayerUnitFrames) {
    syncDemonSlayerUnitFrames();
  }

  if (getSettings().enableDemonSlayerSystemButtons) {
    syncDemonSlayerSystemButtons();
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
