import { addonPrint } from "./wow";

const ENCOUNTER_JOURNAL_MICRO_BUTTON_NAMES = ["EJMicroButton", "EncounterJournalMicroButton"] as const;

function getEncounterJournalFrame(): WowFrame | undefined {
  return _G.EncounterJournal as WowFrame | undefined;
}

function canLoadEncounterJournal(): boolean {
  return typeof _G.EncounterJournal_LoadUI === "function";
}

function isEncounterJournalAvailable(): boolean {
  return canLoadEncounterJournal() || getEncounterJournalFrame() !== undefined;
}

function hideEncounterJournalMicroButtons(): void {
  for (const frameName of ENCOUNTER_JOURNAL_MICRO_BUTTON_NAMES) {
    const button = _G[frameName] as WowFrame | undefined;

    if (button === undefined) {
      continue;
    }

    button.Hide();
    button.EnableMouse(false);
  }
}

function syncEncounterJournalMicroButtons(): void {
  if (isEncounterJournalAvailable()) {
    return;
  }

  hideEncounterJournalMicroButtons();
}

function installToggleEncounterJournalShim(): void {
  if (typeof _G.ToggleEncounterJournal === "function") {
    return;
  }

  if (canLoadEncounterJournal()) {
    _G.ToggleEncounterJournal = () => {
      const journal = getEncounterJournalFrame();

      if (journal !== undefined) {
        if (journal.IsShown()) {
          journal.Hide();
        } else {
          journal.Show();
        }

        return;
      }

      (_G.EncounterJournal_LoadUI as () => void)();
    };

    return;
  }

  _G.ToggleEncounterJournal = () => {
    addonPrint("地下城手册在此客户端不可用。");
  };

  syncEncounterJournalMicroButtons();
}

function installUpdateMicroButtonsHook(): void {
  if (typeof _G.UpdateMicroButtons !== "function") {
    return;
  }

  hooksecurefunc("UpdateMicroButtons", () => {
    syncEncounterJournalMicroButtons();
  });
}

export function installMicroMenuCompatibility(): void {
  installToggleEncounterJournalShim();
  installUpdateMicroButtonsHook();
  syncEncounterJournalMicroButtons();
}
