import { registerActionLayout, syncActionLayout } from "./action-layout";
import { registerSlashCommands } from "./commands";
import { registerAddonEvents } from "./events";
import { registerMinimapButton, syncMinimapButton } from "./minimap";
import { openSettingsPanel, registerSettingsPanel } from "./options";

registerSettingsPanel({
  onMinimapVisibilityChanged: () => syncMinimapButton(),
  onActionLayoutChanged: () => syncActionLayout()
});
registerSlashCommands(openSettingsPanel);
registerMinimapButton(openSettingsPanel);
registerActionLayout();
registerAddonEvents();

export {};
