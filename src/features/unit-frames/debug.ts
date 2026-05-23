import { addonPrint } from "../../platform/wow";

const FLUSH_INTERVAL_SECONDS = 2;
const REENTRANCY_WARN_DEPTH = 8;

let debugEnabled = false;
const callCounts = new Map<string, number>();
let maxReentrancyDepth = 0;
let reentrancyDepth = 0;
let debugFlushScheduled = false;

export function isUnitFrameDebugEnabled(): boolean {
  return debugEnabled;
}

let onDebugEnabledChanged: ((enabled: boolean) => void) | undefined;

export function setUnitFrameDebugChangeListener(listener: (enabled: boolean) => void): void {
  onDebugEnabledChanged = listener;
}

export function setUnitFrameDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
  callCounts.clear();
  maxReentrancyDepth = 0;
  onDebugEnabledChanged?.(enabled);
  syncUnitFrameDebugTimer();
  addonPrint(`Unit frame debug logging: ${enabled ? "on" : "off"}`);
}

export function traceUnitFrame(source: string, count = 1): void {
  if (!debugEnabled) {
    return;
  }

  callCounts.set(source, (callCounts.get(source) ?? 0) + count);
}

export function runUnitFrameDebugGuard<T>(source: string, action: () => T): T {
  if (!debugEnabled) {
    return action();
  }

  reentrancyDepth += 1;

  if (reentrancyDepth > maxReentrancyDepth) {
    maxReentrancyDepth = reentrancyDepth;
  }

  if (reentrancyDepth >= REENTRANCY_WARN_DEPTH) {
    traceUnitFrame(`${source}:reentrancy-depth-${reentrancyDepth}`);
  }

  try {
    return action();
  } finally {
    reentrancyDepth -= 1;
  }
}

function runDebugFlushTick(): void {
  debugFlushScheduled = false;

  if (!debugEnabled) {
    return;
  }

  flushUnitFrameDebugSummary(false);
  scheduleDebugFlushTick();
}

function scheduleDebugFlushTick(): void {
  if (debugFlushScheduled || !debugEnabled || C_Timer === undefined) {
    return;
  }

  debugFlushScheduled = true;
  C_Timer.After(FLUSH_INTERVAL_SECONDS, runDebugFlushTick);
}

export function syncUnitFrameDebugTimer(): void {
  if (!debugEnabled) {
    debugFlushScheduled = false;
    return;
  }

  scheduleDebugFlushTick();
}

export function flushUnitFrameDebugSummary(force: boolean): void {
  if (!debugEnabled && !force) {
    return;
  }

  const entries = [...callCounts.entries()].sort((left, right) => right[1] - left[1]);

  if (entries.length === 0) {
    addonPrint("Unit frame debug: no traced calls yet.");
    return;
  }

  addonPrint(`Unit frame debug (top ${Math.min(entries.length, 12)} / ${entries.length} sources):`);

  for (const [source, count] of entries.slice(0, 12)) {
    addonPrint(`  ${count}x ${source}`);
  }

  if (maxReentrancyDepth > 1) {
    addonPrint(`  max reentrancy depth: ${maxReentrancyDepth}`);
  }

  callCounts.clear();
  maxReentrancyDepth = reentrancyDepth;
}
