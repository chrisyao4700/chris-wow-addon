export type SpellTextEffectBinding = {
  /** Spell names in any locale the player might see (combat log, spellbook, etc.). */
  spellNames: string[];
  displayText: string;
};

export class SpellTextEffectRegistry {
  private bindings: SpellTextEffectBinding[];
  private readonly spellIdToDisplayText: Record<number, string> = {};

  constructor(bindings: SpellTextEffectBinding[] = []) {
    this.bindings = bindings;
  }

  setBindings(bindings: SpellTextEffectBinding[]): void {
    this.bindings = bindings;
    this.rebuildTrackedSpellIds();
  }

  getBindings(): readonly SpellTextEffectBinding[] {
    return this.bindings;
  }

  getTrackedSpellIds(): Record<number, string> {
    return this.spellIdToDisplayText;
  }

  resolveDisplayText(spellId: number | undefined, spellName: string | undefined): string | undefined {
    const byName = this.resolveBySpellName(spellName);

    if (byName !== undefined) {
      return byName;
    }

    if (spellId !== undefined && spellId > 0) {
      return this.spellIdToDisplayText[spellId];
    }

    return undefined;
  }

  rebuildTrackedSpellIds(): void {
    for (const key of Object.keys(this.spellIdToDisplayText)) {
      delete this.spellIdToDisplayText[Number(key)];
    }

    if (this.bindings.length === 0) {
      return;
    }

    const displayTextBySpellName: Record<string, string> = {};

    for (const binding of this.bindings) {
      for (const alias of binding.spellNames) {
        displayTextBySpellName[alias] = binding.displayText;
      }
    }

    const numTabs = GetNumSpellTabs();

    for (let tab = 1; tab <= numTabs; tab++) {
      const [, , offset, numSpells] = GetSpellTabInfo(tab);

      for (let index = offset + 1; index <= offset + numSpells; index++) {
        const [spellName, , , , , , spellId] = GetSpellInfo(index, "spell");

        if (spellId === undefined || spellName === undefined) {
          continue;
        }

        const displayText = displayTextBySpellName[spellName];

        if (displayText !== undefined) {
          this.spellIdToDisplayText[spellId] = displayText;
        }
      }
    }
  }

  private resolveBySpellName(spellName: string | undefined): string | undefined {
    if (spellName === undefined || spellName === "") {
      return undefined;
    }

    for (const binding of this.bindings) {
      for (const alias of binding.spellNames) {
        if (spellName === alias) {
          return binding.displayText;
        }
      }
    }

    return undefined;
  }
}
