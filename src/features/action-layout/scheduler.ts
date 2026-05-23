import {
  LAYOUT_BOOTSTRAP_RETRY_SECONDS,
  LAYOUT_BOOTSTRAP_STABILIZE_SECONDS,
  LAYOUT_BOOTSTRAP_TIMEOUT_SECONDS,
  LAYOUT_DEFERRED_SYNC_DELAYS_SECONDS,
  LAYOUT_WATCHDOG_INTERVAL_SECONDS,
  LAYOUT_MIN_SYNC_INTERVAL_SECONDS,
  RELAYOUT_DELAY_SECONDS
} from "./constants";
import {
  isCombatLocked,
  isCustomLayoutEnabled,
  isLayoutApplying,
  isPendingLayoutSync,
  isPlayerInWorld,
  setPendingLayoutSync
} from "./layout-state";
import { areActionBarFramesReady, isCustomLayoutApplied, isMainActionBarReady } from "./readiness";

let layoutSyncScheduled = false;
let layoutSyncCooldownUntil = 0;
let layoutBootstrapActive = false;
let layoutBootstrapElapsed = 0;
let layoutBootstrapRetryElapsed = 0;
let layoutBootstrapStabilizeRemaining = 0;
let layoutBootstrapTickPending = false;
let layoutWatchdogActive = false;

const layoutSyncRunners: Array<() => void> = [];

export function registerLayoutSyncRunner(runner: () => void): void {
  layoutSyncRunners.push(runner);
}

export function onLayoutFrameReshow(): void {
  if (isLayoutApplying() || isCombatLocked() || !isCustomLayoutEnabled()) {
    return;
  }

  scheduleLayoutSync();
}

export function isLayoutSyncScheduled(): boolean {
  return layoutSyncScheduled;
}

export function isLayoutBootstrapActive(): boolean {
  return layoutBootstrapActive;
}

export function getLayoutBootstrapStabilizeRemaining(): number {
  return layoutBootstrapStabilizeRemaining;
}

function getTimeSeconds(): number {
  if (GetTime !== undefined) {
    return GetTime();
  }

  return 0;
}

function runLayoutSync(): void {
  layoutSyncCooldownUntil = getTimeSeconds() + LAYOUT_MIN_SYNC_INTERVAL_SECONDS;

  for (const runner of layoutSyncRunners) {
    runner();
  }
}

function runScheduledLayoutSync(): void {
  layoutSyncScheduled = false;

  if (!isCustomLayoutEnabled() || isCombatLocked()) {
    return;
  }

  if (getTimeSeconds() < layoutSyncCooldownUntil) {
    scheduleLayoutSync();
    return;
  }

  runLayoutSync();
}

function tickLayoutBootstrap(): void {
  layoutBootstrapTickPending = false;

  if (!layoutBootstrapActive || !isCustomLayoutEnabled()) {
    layoutBootstrapActive = false;
    layoutBootstrapStabilizeRemaining = 0;
    return;
  }

  layoutBootstrapElapsed += LAYOUT_BOOTSTRAP_RETRY_SECONDS;
  layoutBootstrapRetryElapsed += LAYOUT_BOOTSTRAP_RETRY_SECONDS;

  if (areActionBarFramesReady()) {
    if (layoutBootstrapStabilizeRemaining <= 0) {
      layoutBootstrapStabilizeRemaining = LAYOUT_BOOTSTRAP_STABILIZE_SECONDS;
    }

    layoutBootstrapStabilizeRemaining -= LAYOUT_BOOTSTRAP_RETRY_SECONDS;

    if (layoutBootstrapRetryElapsed >= LAYOUT_BOOTSTRAP_RETRY_SECONDS) {
      layoutBootstrapRetryElapsed = 0;
      runLayoutSync();
    }

    if (layoutBootstrapStabilizeRemaining <= 0) {
      layoutBootstrapActive = false;
      return;
    }
  } else if (layoutBootstrapElapsed >= LAYOUT_BOOTSTRAP_TIMEOUT_SECONDS) {
    layoutBootstrapActive = false;
    layoutBootstrapStabilizeRemaining = 0;
    return;
  } else if (layoutBootstrapRetryElapsed >= LAYOUT_BOOTSTRAP_RETRY_SECONDS) {
    layoutBootstrapRetryElapsed = 0;
    runLayoutSync();
  }

  scheduleLayoutBootstrapTick();
}

function scheduleLayoutBootstrapTick(): void {
  if (layoutBootstrapTickPending || !layoutBootstrapActive || C_Timer === undefined) {
    return;
  }

  layoutBootstrapTickPending = true;
  C_Timer.After(LAYOUT_BOOTSTRAP_RETRY_SECONDS, tickLayoutBootstrap);
}

function tickLayoutWatchdog(): void {
  layoutWatchdogActive = false;

  if (!isCustomLayoutEnabled()) {
    return;
  }

  if (!isCombatLocked() && !isLayoutApplying()) {
    if (isMainActionBarReady() && !isCustomLayoutApplied()) {
      runLayoutSync();
    }
  }

  startLayoutWatchdog();
}

export function startLayoutWatchdog(): void {
  if (layoutWatchdogActive || !isCustomLayoutEnabled() || C_Timer === undefined) {
    return;
  }

  layoutWatchdogActive = true;
  C_Timer.After(LAYOUT_WATCHDOG_INTERVAL_SECONDS, tickLayoutWatchdog);
}

export function stopLayoutWatchdog(): void {
  layoutWatchdogActive = false;
}

export function scheduleLayoutSync(): void {
  if (!isCustomLayoutEnabled() || isCombatLocked()) {
    if (isCombatLocked() && isCustomLayoutEnabled()) {
      setPendingLayoutSync(true);
    }

    return;
  }

  if (layoutSyncScheduled) {
    return;
  }

  if (getTimeSeconds() < layoutSyncCooldownUntil) {
    layoutSyncScheduled = true;

    if (C_Timer !== undefined) {
      const delaySeconds = Math.max(RELAYOUT_DELAY_SECONDS, layoutSyncCooldownUntil - getTimeSeconds());
      C_Timer.After(delaySeconds, runScheduledLayoutSync);
    }

    return;
  }

  layoutSyncScheduled = true;

  if (C_Timer === undefined) {
    runScheduledLayoutSync();
    return;
  }

  C_Timer.After(RELAYOUT_DELAY_SECONDS, runScheduledLayoutSync);
}

function scheduleDeferredLayoutSync(): void {
  if (!isCustomLayoutEnabled() || C_Timer === undefined) {
    return;
  }

  for (const delaySeconds of LAYOUT_DEFERRED_SYNC_DELAYS_SECONDS) {
    C_Timer.After(delaySeconds, () => {
      if (!isCustomLayoutEnabled() || !isPlayerInWorld() || isCombatLocked()) {
        return;
      }

      runLayoutSync();
    });
  }
}

export function scheduleLayoutBootstrap(force = false): void {
  if (!isCustomLayoutEnabled()) {
    layoutBootstrapActive = false;
    layoutBootstrapStabilizeRemaining = 0;
    stopLayoutWatchdog();
    return;
  }

  if (!force && !isPlayerInWorld()) {
    return;
  }

  if (isCombatLocked()) {
    setPendingLayoutSync(true);
    return;
  }

  layoutBootstrapActive = true;
  layoutBootstrapElapsed = 0;
  layoutBootstrapRetryElapsed = LAYOUT_BOOTSTRAP_RETRY_SECONDS;
  layoutBootstrapStabilizeRemaining = 0;
  startLayoutWatchdog();
  runLayoutSync();
  scheduleDeferredLayoutSync();
  scheduleLayoutBootstrapTick();
}

export function ensureLayoutScheduler(): void {
  startLayoutWatchdog();
}
