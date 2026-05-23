type Messages = {
  help: string;
  loaded: string;
  reset: string;
  stats(count: number): string;
  debugHeader: string;
  debugLine(label: string, value: string): string;
  settingsUnavailable: string;
  settingsTitle: string;
  settingsDescription: string;
  launchCount(count: number): string;
  showMinimapButton: string;
  showLoginMessage: string;
  settingsFeaturesHeader: string;
  enableCustomActionLayout: string;
  enableSpellTextEffect: string;
  enableDemonSlayerUnitFrames: string;
  enableDemonSlayerSystemButtons: string;
  featureDisabled: (featureName: string) => string;
  resetLaunchCount: string;
  printDebugInfo: string;
  minimapTooltipTitle: string;
  minimapTooltipLeftClick: string;
  minimapTooltipRightClick: string;
};

const enUS: Messages = {
  help: "Commands: /cwa, /cwa stats, /cwa reset, /cwa debug, /cwa layout, /cwa effect, /cwa effect test, /cwa frames, /cwa buttons, /cwa options",
  loaded: "loaded. Try /cwa.",
  reset: "Saved launch count reset.",
  stats: count => `Loaded ${count} time(s) on this account.`,
  debugHeader: "Runtime diagnostics:",
  debugLine: (label, value) => `${label}: ${value}`,
  settingsUnavailable: "Settings panel is not available in this client.",
  settingsTitle: "Chris Wow Addon",
  settingsDescription: "Configure addon features.",
  launchCount: count => `Launch count: ${count}`,
  showMinimapButton: "Show minimap button",
  showLoginMessage: "Show login message",
  settingsFeaturesHeader: "Features",
  enableCustomActionLayout: "Compact action bar layout",
  enableSpellTextEffect: "Spell text on cast",
  enableDemonSlayerUnitFrames: "Demon Slayer player/target frames",
  enableDemonSlayerSystemButtons: "Demon Slayer menu bar buttons",
  featureDisabled: featureName => `${featureName} is disabled in addon settings.`,
  resetLaunchCount: "Reset launch count",
  printDebugInfo: "Print debug info",
  minimapTooltipTitle: "Chris Wow Addon",
  minimapTooltipLeftClick: "Left-click to open settings.",
  minimapTooltipRightClick: "Right-click to print debug info."
};

const zhCN: Messages = {
  help: "命令：/cwa、/cwa stats、/cwa reset、/cwa debug、/cwa layout、/cwa effect、/cwa effect test、/cwa frames、/cwa buttons、/cwa options",
  loaded: "已加载。输入 /cwa 查看命令。",
  reset: "已重置加载次数。",
  stats: count => `此账号已加载 ${count} 次。`,
  debugHeader: "运行环境诊断：",
  debugLine: (label, value) => `${label}：${value}`,
  settingsUnavailable: "当前客户端无法打开设置面板。",
  settingsTitle: "Chris Wow Addon",
  settingsDescription: "配置插件功能。",
  launchCount: count => `加载次数：${count}`,
  showMinimapButton: "显示小地图按钮",
  showLoginMessage: "显示登录提示",
  settingsFeaturesHeader: "功能",
  enableCustomActionLayout: "紧凑动作条布局",
  enableSpellTextEffect: "施法时显示技能文字",
  enableDemonSlayerUnitFrames: "鬼灭之刃风格玩家/目标框体",
  enableDemonSlayerSystemButtons: "鬼灭之刃风格菜单栏按钮",
  featureDisabled: featureName => `${featureName} 已在插件设置中关闭。`,
  resetLaunchCount: "重置加载次数",
  printDebugInfo: "输出调试信息",
  minimapTooltipTitle: "Chris Wow Addon",
  minimapTooltipLeftClick: "左键打开设置。",
  minimapTooltipRightClick: "右键输出调试信息。"
};

export function getMessages(): Messages {
  const locale = GetLocale();

  if (locale === "zhCN") {
    return zhCN;
  }

  return enUS;
}
