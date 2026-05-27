import { BUFF_REFRESH_DURATION_THRESHOLD_SECONDS } from "./animation-utils";
import { readPlayerAura } from "./player-aura";
import type { BuffTriggerEffectBinding, BuffTriggerEffectRegistry } from "./registry";

export type BuffTriggerKind = "gain" | "refresh" | "lose";

export type ActiveBuffSnapshot = {
  key: string;
  auraName: string;
  spellId?: number;
  count?: number;
  duration?: number;
  expirationTime?: number;
};

export type BuffTriggerEvent = {
  binding: BuffTriggerEffectBinding;
  snapshot: ActiveBuffSnapshot;
  triggerKind: BuffTriggerKind;
};

function snapshotKey(snapshot: ActiveBuffSnapshot): string {
  if (snapshot.spellId !== undefined) {
    return `id:${snapshot.spellId}`;
  }

  return `name:${snapshot.auraName}`;
}

function bindingPassesSource(binding: BuffTriggerEffectBinding): boolean {
  return binding.source === undefined || binding.source === "player" || binding.source === "any";
}

function bindingPassesStacks(binding: BuffTriggerEffectBinding, count: number | undefined): boolean {
  const minStacks = binding.minStacks ?? 1;
  const stacks = count ?? 1;

  return stacks >= minStacks;
}

export class BuffTriggerAuraScanner {
  private readonly activeSnapshots: Record<string, ActiveBuffSnapshot> = {};
  private readonly activeBindings: Record<string, BuffTriggerEffectBinding> = {};
  private suppressPlayback = false;

  constructor(
    private readonly registry: BuffTriggerEffectRegistry,
    private readonly onTrigger: (event: BuffTriggerEvent) => void
  ) {}

  setSuppressPlayback(suppressPlayback: boolean): void {
    this.suppressPlayback = suppressPlayback;
  }

  clearSnapshots(): void {
    for (const key of Object.keys(this.activeSnapshots)) {
      delete this.activeSnapshots[key];
    }

    for (const key of Object.keys(this.activeBindings)) {
      delete this.activeBindings[key];
    }
  }

  getActiveSnapshotCount(): number {
    return Object.keys(this.activeSnapshots).length;
  }

  scanPlayerAuras(): void {
    if (this.registry.getBindings().length === 0) {
      this.clearSnapshots();
      return;
    }

    const nextSnapshots: Record<string, ActiveBuffSnapshot> = {};
    const nextBindings: Record<string, BuffTriggerEffectBinding> = {};
    const events: BuffTriggerEvent[] = [];

    for (let index = 1; index <= 80; index++) {
      const aura = readPlayerAura(index);

      if (aura === undefined) {
        break;
      }

      const binding = this.registry.resolveBinding(aura.auraName, aura.spellId);

      if (binding === undefined || !bindingPassesSource(binding) || !bindingPassesStacks(binding, aura.count)) {
        continue;
      }

      const snapshot: ActiveBuffSnapshot = {
        key: "",
        auraName: aura.auraName,
        spellId: aura.spellId,
        count: aura.count,
        duration: aura.duration,
        expirationTime: aura.expirationTime
      };
      snapshot.key = snapshotKey(snapshot);
      nextSnapshots[snapshot.key] = snapshot;
      nextBindings[snapshot.key] = binding;

      const previous = this.activeSnapshots[snapshot.key];

      if (previous === undefined) {
        events.push({ binding, snapshot, triggerKind: "gain" });
        continue;
      }

      const gainedStacks = (aura.count ?? 1) > (previous.count ?? 1);
      const extendedDuration =
        aura.expirationTime !== undefined &&
        previous.expirationTime !== undefined &&
        aura.expirationTime - previous.expirationTime >= BUFF_REFRESH_DURATION_THRESHOLD_SECONDS;

      if (gainedStacks || extendedDuration) {
        events.push({ binding, snapshot, triggerKind: "refresh" });
      }
    }

    for (const key of Object.keys(this.activeSnapshots)) {
      if (nextSnapshots[key] !== undefined) {
        continue;
      }

      const binding = this.activeBindings[key];

      if (binding === undefined) {
        continue;
      }

      events.push({
        binding,
        snapshot: this.activeSnapshots[key],
        triggerKind: "lose"
      });
    }

    for (const key of Object.keys(this.activeSnapshots)) {
      delete this.activeSnapshots[key];
    }

    for (const key of Object.keys(this.activeBindings)) {
      delete this.activeBindings[key];
    }

    for (const [key, snapshot] of Object.entries(nextSnapshots)) {
      this.activeSnapshots[key] = snapshot;
      this.activeBindings[key] = nextBindings[key];
    }

    if (this.suppressPlayback) {
      return;
    }

    for (const event of events) {
      if (event.triggerKind === "lose") {
        continue;
      }

      this.onTrigger(event);
    }

    for (const event of events) {
      if (event.triggerKind !== "lose") {
        continue;
      }

      this.onTrigger(event);
    }
  }
}
