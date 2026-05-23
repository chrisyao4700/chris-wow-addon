import { installMicroMenuCompatibility } from "./platform/micro-menu-compat";
import { registerSlashCommands } from "./commands";

installMicroMenuCompatibility();
import { registerAddonEvents } from "./core/events";
import { registerActionLayout, syncActionLayout } from "./features/action-layout";
import { registerSpellTextEffect, syncSpellTextEffect } from "./features/spell-text-effect";
import {
  registerDemonSlayerSystemButtons,
  syncDemonSlayerSystemButtons
} from "./features/system-buttons";
import { registerDemonSlayerUnitFrames, syncDemonSlayerUnitFrames } from "./features/unit-frames";
import { registerMinimapButton, syncMinimapButton } from "./ui/minimap";
import { openSettingsPanel, registerSettingsPanel } from "./ui/options";

registerSettingsPanel({
  onMinimapVisibilityChanged: () => syncMinimapButton(),
  onActionLayoutChanged: () => syncActionLayout(),
  onSpellTextEffectChanged: () => syncSpellTextEffect(),
  onDemonSlayerUnitFramesChanged: () => syncDemonSlayerUnitFrames(),
  onDemonSlayerSystemButtonsChanged: () => syncDemonSlayerSystemButtons()
});
registerSlashCommands(openSettingsPanel);
registerMinimapButton(openSettingsPanel);
registerActionLayout();
registerAddonEvents();
registerSpellTextEffect();
registerDemonSlayerUnitFrames();
registerDemonSlayerSystemButtons();

export {};
