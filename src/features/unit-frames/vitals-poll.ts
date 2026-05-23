import { getSettings } from "../../core/db";
import { VITALS_POLL_INTERVAL_SECONDS } from "./constants";
import { ensureFrames } from "./frame-store";
import { flushVitalsNow } from "./vitals";

let pollFrame: WowFrame | undefined;
let pollElapsed = 0;

export function startVitalsPolling(): void {
  if (pollFrame !== undefined) {
    return;
  }

  pollFrame = CreateFrame("Frame");
  pollElapsed = 0;

  pollFrame.SetScript("OnUpdate", (_self, ...args: unknown[]) => {
    if (!getSettings().enableDemonSlayerUnitFrames) {
      return;
    }

    const deltaSeconds = typeof args[0] === "number" ? args[0] : 0;
    pollElapsed += deltaSeconds;

    if (pollElapsed < VITALS_POLL_INTERVAL_SECONDS) {
      return;
    }

    pollElapsed = 0;
    ensureFrames();
    flushVitalsNow();
  });
}

export function stopVitalsPolling(): void {
  if (pollFrame === undefined) {
    return;
  }

  pollFrame.SetScript("OnUpdate", () => {});
  pollFrame.Hide();
  pollFrame = undefined;
  pollElapsed = 0;
}
