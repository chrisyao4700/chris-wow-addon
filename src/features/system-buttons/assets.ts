import { ADDON_NAME } from "../../core/config";
import { isBundledSystemButtonAsset } from "./asset-manifest";

export { isBundledSystemButtonAsset };

const ASSET_ROOT = `Interface\\AddOns\\${ADDON_NAME}\\assets\\system-buttons`;

export type SystemButtonTextureRole = "normal" | "pushed" | "disabled" | "highlight";

export function getSystemButtonTexturePath(assetId: string, role: SystemButtonTextureRole = "normal"): string {
  if (role === "normal") {
    return `${ASSET_ROOT}\\${assetId}`;
  }

  return `${ASSET_ROOT}\\${assetId}-${role}`;
}

export function getSystemButtonTexturePathCandidates(
  assetId: string,
  role: SystemButtonTextureRole = "normal"
): string[] {
  const base = getSystemButtonTexturePath(assetId, role);

  if (role === "normal") {
    return [base, `${base}.tga`];
  }

  const normalBase = getSystemButtonTexturePath(assetId, "normal");
  return [base, `${base}.tga`, normalBase, `${normalBase}.tga`];
}

export function shouldTrustBundledSystemButtonAsset(assetId: string, role: SystemButtonTextureRole): boolean {
  return role === "normal" && isBundledSystemButtonAsset(assetId);
}
