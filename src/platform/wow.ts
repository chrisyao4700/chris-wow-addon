import { ADDON_NAME, TITAN_INTERFACE_VERSION } from "../config";

export type RuntimeInfo = {
  version: string;
  build: string;
  buildDate: string;
  interfaceVersion: number;
  expectedInterfaceVersion: number;
  locale: string;
  projectId: number | undefined;
  projectClassic: number | undefined;
  isTitanInterface: boolean;
};

export function addonPrint(message: string): void {
  print(`|cff33ff99${ADDON_NAME}|r ${message}`);
}

export function getRuntimeInfo(): RuntimeInfo {
  const [version, build, buildDate, interfaceVersion] = GetBuildInfo();

  return {
    version: version || "unknown",
    build: build || "unknown",
    buildDate: buildDate || "unknown",
    interfaceVersion: interfaceVersion || 0,
    expectedInterfaceVersion: TITAN_INTERFACE_VERSION,
    locale: GetLocale(),
    projectId: WOW_PROJECT_ID,
    projectClassic: WOW_PROJECT_CLASSIC,
    isTitanInterface: interfaceVersion === TITAN_INTERFACE_VERSION
  };
}
