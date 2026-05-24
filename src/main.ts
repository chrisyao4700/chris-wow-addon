import { installMicroMenuCompatibility } from "./platform/micro-menu-compat";
import { registerSlashCommands } from "./commands";

installMicroMenuCompatibility();
import { registerAddonEvents } from "./core/events";
import { registerActionLayout, syncActionLayout } from "./features/action-layout";
import { registerSpellTextEffect, syncSpellTextEffect } from "./features/spell-text-effect";
import { registerSpellAnimationEffect, syncSpellAnimationEffect } from "./features/spell-animation-effect";
import {
  registerDemonSlayerSystemButtons,
  syncDemonSlayerSystemButtons
} from "./features/system-buttons";
import { registerMinimapButton, syncMinimapButton } from "./ui/minimap";
import { openSettingsPanel, registerSettingsPanel } from "./ui/options";

registerSettingsPanel({
  onMinimapVisibilityChanged: () => syncMinimapButton(),
  onActionLayoutChanged: () => syncActionLayout(),
  onSpellTextEffectChanged: () => syncSpellTextEffect(),
  onSpellEffectLayoutChanged: () => syncSpellAnimationEffect(),
  onDemonSlayerSystemButtonsChanged: () => syncDemonSlayerSystemButtons()
});
registerSlashCommands(openSettingsPanel);
registerMinimapButton(openSettingsPanel);
registerActionLayout();
registerAddonEvents();
registerSpellTextEffect();
registerSpellAnimationEffect();
registerDemonSlayerSystemButtons();

export {};
