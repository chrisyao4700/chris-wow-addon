import { coerceAuraNumber } from "./player-aura";
import type { BuffTriggerStyleSlug } from "./style-slugs";

export type BuffTriggerPriority = "low" | "normal" | "high";

export type BuffTriggerEffectBinding = {
  auraNames: string[];
  auraIds?: number[];
  styleSlug: BuffTriggerStyleSlug;
  priority?: BuffTriggerPriority;
  source?: "player" | "pet" | "any";
  minStacks?: number;
  retriggerCooldownSeconds?: number;
  note?: string;
};

export class BuffTriggerEffectRegistry {
  private bindings: BuffTriggerEffectBinding[] = [];
  private readonly auraNameToBinding: Record<string, BuffTriggerEffectBinding> = {};
  private readonly auraIdToBinding: Record<number, BuffTriggerEffectBinding> = {};

  setBindings(bindings: BuffTriggerEffectBinding[]): void {
    this.bindings = bindings;
    this.rebuildLookupMaps();
  }

  getBindings(): readonly BuffTriggerEffectBinding[] {
    return this.bindings;
  }

  getWatchedAuraNameCount(): number {
    return Object.keys(this.auraNameToBinding).length;
  }

  resolveBinding(auraName: string | undefined, spellId: unknown): BuffTriggerEffectBinding | undefined {
    if (auraName !== undefined && auraName !== "") {
      const byName = this.auraNameToBinding[auraName];

      if (byName !== undefined) {
        return byName;
      }
    }

    const resolvedSpellId = coerceAuraNumber(spellId);

    if (resolvedSpellId !== undefined) {
      return this.auraIdToBinding[resolvedSpellId];
    }

    return undefined;
  }

  private rebuildLookupMaps(): void {
    for (const key of Object.keys(this.auraNameToBinding)) {
      delete this.auraNameToBinding[key];
    }

    for (const key of Object.keys(this.auraIdToBinding)) {
      delete this.auraIdToBinding[Number(key)];
    }

    for (const binding of this.bindings) {
      for (const auraName of binding.auraNames) {
        this.auraNameToBinding[auraName] = binding;
      }

      if (binding.auraIds === undefined) {
        continue;
      }

      for (const auraId of binding.auraIds) {
        this.auraIdToBinding[auraId] = binding;
      }
    }
  }
}
