import { getSettings } from "../../core/db";

let isApplyingLayout = false;
let pendingLayoutSync = false;

export function isLayoutApplying(): boolean {
  return isApplyingLayout;
}

export function setLayoutApplying(value: boolean): void {
  isApplyingLayout = value;
}

export function isPendingLayoutSync(): boolean {
  return pendingLayoutSync;
}

export function setPendingLayoutSync(value: boolean): void {
  pendingLayoutSync = value;
}

export function isCustomLayoutEnabled(): boolean {
  return getSettings().enableCustomActionLayout;
}

export function isCombatLocked(): boolean {
  return InCombatLockdown !== undefined && InCombatLockdown();
}

export function isPlayerInWorld(): boolean {
  const playerName = UnitName("player");

  return playerName !== undefined && playerName !== "";
}
