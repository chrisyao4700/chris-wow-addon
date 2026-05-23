import { ADDON_NAME } from "../../core/config";

/** Invisible secure click layer so target right-click opens the default unit menu. */
export function attachTargetUnitClickButton(parent: WowFrame, nameSuffix: string, unit: string): WowButton {
  const button = CreateFrame(
    "Button",
    `${ADDON_NAME}DSUnitClick${nameSuffix}`,
    parent,
    "SecureUnitButtonTemplate"
  );

  button.SetPoint("TOPLEFT", parent, "TOPLEFT", 0, 0);
  button.SetPoint("BOTTOMRIGHT", parent, "BOTTOMRIGHT", 0, 0);
  button.SetFrameLevel(70);
  button.EnableMouse(true);
  button.RegisterForClicks("AnyUp");
  button.SetAttribute?.("unit", unit);
  button.SetAttribute?.("*type1", "target");
  button.SetAttribute?.("*type2", "togglemenu");

  return button;
}
