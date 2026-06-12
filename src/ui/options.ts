import { printDebugInfo } from "../commands";
import { ADDON_NAME, ADDON_TITLE } from "../core/config";
import {
  getLaunchCount,
  getSettings,
  resetLaunchCount,
  setEnableCustomActionLayout,
  setEnableDemonSlayerCursorTrail,
  setEnableDemonSlayerSystemButtons,
  setEnableSpellTextEffect,
  setEnableSpellVoiceCallouts,
  setSpellVoiceCalloutVolume,
  setShowLoginMessage,
  setShowMinimapButton
} from "../core/db";
import { getMessages } from "../core/localization";
import { syncActionLayout } from "../features/action-layout";
import {
  enterSpellEffectLayoutEditor,
  exitSpellEffectLayoutEditor,
  isSpellEffectLayoutEditorActive,
  MAX_SPELL_EFFECT_USER_SCALE,
  MIN_SPELL_EFFECT_USER_SCALE,
  resetSpellEffectLayoutSettings,
  syncSpellEffectLayout,
  updateSpellEffectUserScale
} from "../features/spell-animation-effect";
import {
  enterBuffTriggerLayoutEditor,
  exitBuffTriggerLayoutEditor,
  isBuffTriggerLayoutEditorActive,
  MAX_BUFF_TRIGGER_USER_SCALE,
  MIN_BUFF_TRIGGER_USER_SCALE,
  resetBuffTriggerLayoutSettings,
  updateBuffTriggerUserScale
} from "../features/buff-trigger-effect";
import { syncSpellTextEffect } from "../features/spell-text-effect";
import {
  MAX_SPELL_VOICE_CALLOUT_VOLUME,
  MIN_SPELL_VOICE_CALLOUT_VOLUME
} from "../features/spell-voice-callout";
import { syncDemonSlayerSystemButtons } from "../features/system-buttons";
import { syncDemonSlayerCursorTrail } from "../features/cursor-trail";
import { addonPrint } from "../platform/wow";

type SettingsPanelHandlers = {
  onMinimapVisibilityChanged: () => void;
  onActionLayoutChanged: () => void;
  onSpellTextEffectChanged: () => void;
  onSpellEffectLayoutChanged: () => void;
  onBuffTriggerLayoutChanged: () => void;
  onDemonSlayerSystemButtonsChanged: () => void;
  onDemonSlayerCursorTrailChanged: () => void;
};

type SettingsPanelControls = {
  launchCount?: WowFontString;
  featuresHeader?: WowFontString;
  actionLayoutCheckbox?: WowCheckButton;
  spellTextEffectCheckbox?: WowCheckButton;
  spellVoiceCalloutCheckbox?: WowCheckButton;
  spellVoiceVolumeSlider?: WowSlider;
  spellVoiceVolumeValue?: WowFontString;
  spellEffectLayoutHeader?: WowFontString;
  spellEffectScaleSlider?: WowSlider;
  spellEffectScaleValue?: WowFontString;
  spellEffectAdjustButton?: WowButton;
  spellEffectResetButton?: WowButton;
  buffTriggerLayoutHeader?: WowFontString;
  buffTriggerScaleSlider?: WowSlider;
  buffTriggerScaleValue?: WowFontString;
  buffTriggerAdjustButton?: WowButton;
  buffTriggerResetButton?: WowButton;
  demonSlayerSystemButtonsCheckbox?: WowCheckButton;
  demonSlayerCursorTrailCheckbox?: WowCheckButton;
  minimapCheckbox?: WowCheckButton;
  loginCheckbox?: WowCheckButton;
};

const SETTINGS_SCROLL_CHILD_WIDTH = 580;
const SETTINGS_SCROLL_CHILD_HEIGHT = 900;

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
  relativeTo: WowFrame | WowFontString,
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

function createSlider(
  parent: WowFrame,
  name: string,
  labelText: string,
  point: WowPoint,
  relativeTo: WowFrame | WowFontString,
  relativePoint: WowPoint,
  x: number,
  y: number,
  min: number,
  max: number,
  step: number,
  onValueChanged: (value: number) => void
): { slider: WowSlider; valueLabel: WowFontString } {
  const label = parent.CreateFontString(undefined, "ARTWORK", "GameFontNormal");
  label.SetPoint(point, relativeTo, relativePoint, x, y);
  label.SetText(labelText);

  const slider = CreateFrame("Slider", name, parent, "OptionsSliderTemplate") as WowSlider;
  slider.SetPoint("TOPLEFT", label, "BOTTOMLEFT", 0, -8);
  slider.SetWidth(180);
  slider.SetMinMaxValues(min, max);
  slider.SetValueStep(step);
  slider.SetObeyStepOnDrag?.(true);

  const valueLabel = parent.CreateFontString(undefined, "ARTWORK", "GameFontHighlight");
  valueLabel.SetPoint("LEFT", slider, "RIGHT", 12, 0);

  slider.SetScript("OnValueChanged", (_self, value) => {
    const nextValue = typeof value === "number" ? value : Number(value);
    onValueChanged(nextValue);
    refreshSettingsPanel();
  });

  return { slider, valueLabel };
}

function refreshSpellVoiceCalloutControls(): void {
  const messages = getMessages();
  const settings = getSettings();
  const enabled = settings.enableSpellVoiceCallouts;

  if (controls.spellVoiceVolumeSlider !== undefined) {
    controls.spellVoiceVolumeSlider.SetValue(settings.spellVoiceCalloutVolume);

    if (enabled) {
      controls.spellVoiceVolumeSlider.Enable?.();
    } else {
      controls.spellVoiceVolumeSlider.Disable?.();
    }
  }

  if (controls.spellVoiceVolumeValue !== undefined) {
    controls.spellVoiceVolumeValue.SetText(
      messages.spellVoiceCalloutVolumeValue(settings.spellVoiceCalloutVolume)
    );
  }
}

function refreshSpellEffectLayoutControls(): void {
  const messages = getMessages();
  const settings = getSettings();
  const enabled = settings.enableSpellTextEffect;

  if (controls.spellEffectScaleSlider !== undefined) {
    controls.spellEffectScaleSlider.SetValue(settings.spellEffectUserScale);

    if (enabled) {
      controls.spellEffectScaleSlider.Enable?.();
    } else {
      controls.spellEffectScaleSlider.Disable?.();
    }
  }

  if (controls.spellEffectScaleValue !== undefined) {
    controls.spellEffectScaleValue.SetText(messages.spellEffectLayoutScaleValue(settings.spellEffectUserScale));
  }

  if (controls.spellEffectAdjustButton !== undefined) {
    controls.spellEffectAdjustButton.SetText(
      isSpellEffectLayoutEditorActive() ? messages.spellEffectLayoutDone : messages.spellEffectLayoutAdjust
    );

    if (enabled) {
      controls.spellEffectAdjustButton.Enable?.();
    } else {
      controls.spellEffectAdjustButton.Disable?.();
    }
  }

  if (controls.spellEffectResetButton !== undefined) {
    if (enabled) {
      controls.spellEffectResetButton.Enable?.();
    } else {
      controls.spellEffectResetButton.Disable?.();
    }
  }
}

function isBuffTriggerControlEnabled(): boolean {
  const settings = getSettings();

  return settings.enableBuffTriggerEffect ?? settings.enableSpellTextEffect;
}

function refreshBuffTriggerLayoutControls(): void {
  const messages = getMessages();
  const settings = getSettings();
  const enabled = isBuffTriggerControlEnabled();

  if (controls.buffTriggerScaleSlider !== undefined) {
    controls.buffTriggerScaleSlider.SetValue(settings.buffTriggerEffectUserScale);

    if (enabled) {
      controls.buffTriggerScaleSlider.Enable?.();
    } else {
      controls.buffTriggerScaleSlider.Disable?.();
    }
  }

  if (controls.buffTriggerScaleValue !== undefined) {
    controls.buffTriggerScaleValue.SetText(messages.spellEffectLayoutScaleValue(settings.buffTriggerEffectUserScale));
  }

  if (controls.buffTriggerAdjustButton !== undefined) {
    controls.buffTriggerAdjustButton.SetText(
      isBuffTriggerLayoutEditorActive() ? messages.spellEffectLayoutDone : messages.buffTriggerLayoutAdjust
    );

    if (enabled) {
      controls.buffTriggerAdjustButton.Enable?.();
    } else {
      controls.buffTriggerAdjustButton.Disable?.();
    }
  }

  if (controls.buffTriggerResetButton !== undefined) {
    if (enabled) {
      controls.buffTriggerResetButton.Enable?.();
    } else {
      controls.buffTriggerResetButton.Disable?.();
    }
  }
}

function createButton(
  parent: WowFrame,
  name: string,
  text: string,
  width: number,
  point: WowPoint,
  relativeTo: WowFrame | WowFontString,
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

  if (controls.spellVoiceCalloutCheckbox !== undefined) {
    controls.spellVoiceCalloutCheckbox.SetChecked(settings.enableSpellVoiceCallouts);
  }

  if (controls.demonSlayerSystemButtonsCheckbox !== undefined) {
    controls.demonSlayerSystemButtonsCheckbox.SetChecked(settings.enableDemonSlayerSystemButtons);
  }

  if (controls.demonSlayerCursorTrailCheckbox !== undefined) {
    controls.demonSlayerCursorTrailCheckbox.SetChecked(settings.enableDemonSlayerCursorTrail);
  }

  if (controls.minimapCheckbox !== undefined) {
    controls.minimapCheckbox.SetChecked(settings.showMinimapButton);
  }

  if (controls.loginCheckbox !== undefined) {
    controls.loginCheckbox.SetChecked(settings.showLoginMessage);
  }

  refreshSpellVoiceCalloutControls();
  refreshSpellEffectLayoutControls();
  refreshBuffTriggerLayoutControls();
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
  const optionsPanel = CreateFrame("Frame", `${ADDON_NAME}OptionsPanel`, UIParent) as WowOptionsPanel;
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

  const description = createLabel(
    optionsPanel,
    messages.settingsDescription,
    "GameFontHighlightSmall",
    "TOPLEFT",
    title,
    "BOTTOMLEFT",
    0,
    -8
  );

  const scrollFrame = CreateFrame(
    "ScrollFrame",
    `${ADDON_NAME}OptionsScroll`,
    optionsPanel,
    "UIPanelScrollFrameTemplate"
  );
  scrollFrame.SetPoint("TOPLEFT", description, "BOTTOMLEFT", -4, -12);
  scrollFrame.SetPoint("BOTTOMRIGHT", optionsPanel, "BOTTOMRIGHT", -28, 16);

  const scrollChild = CreateFrame("Frame", `${ADDON_NAME}OptionsScrollChild`, scrollFrame);
  scrollFrame.SetScrollChild(scrollChild);
  scrollChild.SetSize(SETTINGS_SCROLL_CHILD_WIDTH, SETTINGS_SCROLL_CHILD_HEIGHT);

  controls.launchCount = createLabel(
    scrollChild,
    messages.launchCount(getLaunchCount()),
    "GameFontHighlight",
    "TOPLEFT",
    scrollChild,
    "TOPLEFT",
    20,
    -16
  );

  controls.featuresHeader = createLabel(
    scrollChild,
    messages.settingsFeaturesHeader,
    "GameFontNormal",
    "TOPLEFT",
    controls.launchCount,
    "BOTTOMLEFT",
    0,
    -12
  );

  controls.actionLayoutCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}EnableCustomActionLayout`,
    messages.enableCustomActionLayout,
    "TOPLEFT",
    controls.featuresHeader,
    "BOTTOMLEFT",
    0,
    -8,
    checked => {
      setEnableCustomActionLayout(checked);
      handlers?.onActionLayoutChanged();
    }
  );

  controls.spellTextEffectCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}EnableSpellTextEffect`,
    messages.enableSpellTextEffect,
    "TOPLEFT",
    controls.actionLayoutCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableSpellTextEffect(checked);

      if (!checked) {
        exitSpellEffectLayoutEditor();
        exitBuffTriggerLayoutEditor();
      }

      handlers?.onSpellTextEffectChanged();
    }
  );

  controls.spellVoiceCalloutCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}EnableSpellVoiceCallouts`,
    messages.enableSpellVoiceCallouts,
    "TOPLEFT",
    controls.spellTextEffectCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableSpellVoiceCallouts(checked);
      refreshSettingsPanel();
    }
  );

  const voiceVolumeControls = createSlider(
    scrollChild,
    `${ADDON_NAME}SpellVoiceVolume`,
    messages.spellVoiceCalloutVolume,
    "TOPLEFT",
    controls.spellVoiceCalloutCheckbox,
    "BOTTOMLEFT",
    28,
    -8,
    MIN_SPELL_VOICE_CALLOUT_VOLUME,
    MAX_SPELL_VOICE_CALLOUT_VOLUME,
    0.05,
    value => {
      setSpellVoiceCalloutVolume(value);
      refreshSettingsPanel();
    }
  );
  controls.spellVoiceVolumeSlider = voiceVolumeControls.slider;
  controls.spellVoiceVolumeValue = voiceVolumeControls.valueLabel;

  controls.spellEffectLayoutHeader = createLabel(
    scrollChild,
    messages.spellEffectLayoutHeader,
    "GameFontNormal",
    "TOPLEFT",
    voiceVolumeControls.slider,
    "BOTTOMLEFT",
    0,
    -12
  );

  const scaleControls = createSlider(
    scrollChild,
    `${ADDON_NAME}SpellEffectScale`,
    messages.spellEffectLayoutScale,
    "TOPLEFT",
    controls.spellEffectLayoutHeader,
    "BOTTOMLEFT",
    0,
    -8,
    MIN_SPELL_EFFECT_USER_SCALE,
    MAX_SPELL_EFFECT_USER_SCALE,
    0.05,
    value => {
      updateSpellEffectUserScale(value);
      handlers?.onSpellEffectLayoutChanged();
    }
  );
  controls.spellEffectScaleSlider = scaleControls.slider;
  controls.spellEffectScaleValue = scaleControls.valueLabel;

  controls.spellEffectAdjustButton = createButton(
    scrollChild,
    `${ADDON_NAME}SpellEffectAdjust`,
    messages.spellEffectLayoutAdjust,
    120,
    "TOPLEFT",
    scaleControls.slider,
    "BOTTOMLEFT",
    0,
    -18,
    () => {
      if (!getSettings().enableSpellTextEffect) {
        return;
      }

      if (isSpellEffectLayoutEditorActive()) {
        exitSpellEffectLayoutEditor();
        addonPrint(messages.spellEffectLayoutEditorClosed);
      } else {
        enterSpellEffectLayoutEditor();
        addonPrint(messages.spellEffectLayoutEditorOpened);
      }

      refreshSettingsPanel();
    }
  );

  controls.spellEffectResetButton = createButton(
    scrollChild,
    `${ADDON_NAME}SpellEffectResetLayout`,
    messages.spellEffectLayoutReset,
    120,
    "TOPLEFT",
    controls.spellEffectAdjustButton,
    "BOTTOMLEFT",
    0,
    -8,
    () => {
      resetSpellEffectLayoutSettings();
      handlers?.onSpellEffectLayoutChanged();
      addonPrint(messages.spellEffectLayoutResetConfirm);
      refreshSettingsPanel();
    }
  );

  controls.buffTriggerLayoutHeader = createLabel(
    scrollChild,
    messages.buffTriggerLayoutHeader,
    "GameFontNormal",
    "TOPLEFT",
    controls.spellEffectResetButton,
    "BOTTOMLEFT",
    0,
    -12
  );

  const buffScaleControls = createSlider(
    scrollChild,
    `${ADDON_NAME}BuffTriggerScale`,
    messages.buffTriggerLayoutScale,
    "TOPLEFT",
    controls.buffTriggerLayoutHeader,
    "BOTTOMLEFT",
    0,
    -8,
    MIN_BUFF_TRIGGER_USER_SCALE,
    MAX_BUFF_TRIGGER_USER_SCALE,
    0.05,
    value => {
      updateBuffTriggerUserScale(value);
      handlers?.onBuffTriggerLayoutChanged();
    }
  );
  controls.buffTriggerScaleSlider = buffScaleControls.slider;
  controls.buffTriggerScaleValue = buffScaleControls.valueLabel;

  controls.buffTriggerAdjustButton = createButton(
    scrollChild,
    `${ADDON_NAME}BuffTriggerAdjust`,
    messages.buffTriggerLayoutAdjust,
    140,
    "TOPLEFT",
    buffScaleControls.slider,
    "BOTTOMLEFT",
    0,
    -18,
    () => {
      if (!isBuffTriggerControlEnabled()) {
        return;
      }

      if (isBuffTriggerLayoutEditorActive()) {
        exitBuffTriggerLayoutEditor();
        addonPrint(messages.buffTriggerLayoutEditorClosed);
      } else {
        enterBuffTriggerLayoutEditor();
        addonPrint(messages.buffTriggerLayoutEditorOpened);
      }

      refreshSettingsPanel();
    }
  );

  controls.buffTriggerResetButton = createButton(
    scrollChild,
    `${ADDON_NAME}BuffTriggerResetLayout`,
    messages.buffTriggerLayoutReset,
    140,
    "TOPLEFT",
    controls.buffTriggerAdjustButton,
    "BOTTOMLEFT",
    0,
    -8,
    () => {
      resetBuffTriggerLayoutSettings();
      handlers?.onBuffTriggerLayoutChanged();
      addonPrint(messages.buffTriggerLayoutResetConfirm);
      refreshSettingsPanel();
    }
  );

  controls.demonSlayerSystemButtonsCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}EnableDemonSlayerSystemButtons`,
    messages.enableDemonSlayerSystemButtons,
    "TOPLEFT",
    controls.buffTriggerResetButton,
    "BOTTOMLEFT",
    0,
    -12,
    checked => {
      setEnableDemonSlayerSystemButtons(checked);
      handlers?.onDemonSlayerSystemButtonsChanged();
    }
  );

  controls.demonSlayerCursorTrailCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}EnableDemonSlayerCursorTrail`,
    messages.enableDemonSlayerCursorTrail,
    "TOPLEFT",
    controls.demonSlayerSystemButtonsCheckbox,
    "BOTTOMLEFT",
    0,
    -4,
    checked => {
      setEnableDemonSlayerCursorTrail(checked);
      handlers?.onDemonSlayerCursorTrailChanged();
    }
  );

  controls.minimapCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}ShowMinimapButton`,
    messages.showMinimapButton,
    "TOPLEFT",
    controls.demonSlayerCursorTrailCheckbox,
    "BOTTOMLEFT",
    0,
    -12,
    checked => {
      setShowMinimapButton(checked);
      handlers?.onMinimapVisibilityChanged();
    }
  );

  controls.loginCheckbox = createCheckbox(
    scrollChild,
    `${ADDON_NAME}ShowLoginMessage`,
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
    scrollChild,
    `${ADDON_NAME}ResetLaunchCount`,
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
    scrollChild,
    `${ADDON_NAME}PrintDebugInfo`,
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

  if (getSettings().enableDemonSlayerSystemButtons) {
    syncDemonSlayerSystemButtons();
  }

  if (getSettings().enableDemonSlayerCursorTrail) {
    syncDemonSlayerCursorTrail();
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
