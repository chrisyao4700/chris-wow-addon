import { ADDON_TITLE, SLASH_ALIASES } from "./config";

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
  enableDemonSlayerSystemButtons: string;
  spellEffectLayoutHeader: string;
  spellEffectLayoutScale: string;
  spellEffectLayoutScaleValue(value: number): string;
  spellEffectLayoutAdjust: string;
  spellEffectLayoutDone: string;
  spellEffectLayoutReset: string;
  spellEffectLayoutDragHint: string;
  spellEffectLayoutEditorTitle: string;
  spellEffectLayoutResetConfirm: string;
  spellEffectLayoutEditorOpened: string;
  spellEffectLayoutEditorClosed: string;
  featureDisabled: (featureName: string) => string;
  resetLaunchCount: string;
  printDebugInfo: string;
  minimapTooltipTitle: string;
  minimapTooltipLeftClick: string;
  minimapTooltipRightClick: string;
};

const enUS: Messages = {
  help: `Commands: ${SLASH_ALIASES.short}, ${SLASH_ALIASES.short} stats, ${SLASH_ALIASES.short} reset, ${SLASH_ALIASES.short} debug, ${SLASH_ALIASES.short} layout, ${SLASH_ALIASES.short} effect, ${SLASH_ALIASES.short} effect test, ${SLASH_ALIASES.short} effect layout, ${SLASH_ALIASES.short} buttons, ${SLASH_ALIASES.short} options`,
  loaded: `loaded. Try ${SLASH_ALIASES.short}.`,
  reset: "Saved launch count reset.",
  stats: count => `Loaded ${count} time(s) on this account.`,
  debugHeader: "Runtime diagnostics:",
  debugLine: (label, value) => `${label}: ${value}`,
  settingsUnavailable: "Settings panel is not available in this client.",
  settingsTitle: ADDON_TITLE,
  settingsDescription: "Configure addon features.",
  launchCount: count => `Launch count: ${count}`,
  showMinimapButton: "Show minimap button",
  showLoginMessage: "Show login message",
  settingsFeaturesHeader: "Features",
  enableCustomActionLayout: "Slayer action bar layout",
  enableSpellTextEffect: "Spell text on cast",
  enableDemonSlayerSystemButtons: "Demon Slayer menu bar buttons",
  spellEffectLayoutHeader: "Spell effect layout",
  spellEffectLayoutScale: "Effect scale",
  spellEffectLayoutScaleValue: value => `${value.toFixed(2)}x`,
  spellEffectLayoutAdjust: "Adjust position",
  spellEffectLayoutDone: "Done",
  spellEffectLayoutReset: "Reset layout",
  spellEffectLayoutDragHint: "Drag to move the spell effect",
  spellEffectLayoutEditorTitle: "Adjust spell effect position and scale",
  spellEffectLayoutResetConfirm: "Spell effect layout reset.",
  spellEffectLayoutEditorOpened: "Spell effect layout editor enabled. Drag the highlight to move it.",
  spellEffectLayoutEditorClosed: "Spell effect layout editor closed.",
  featureDisabled: featureName => `${featureName} is disabled in addon settings.`,
  resetLaunchCount: "Reset launch count",
  printDebugInfo: "Print debug info",
  minimapTooltipTitle: ADDON_TITLE,
  minimapTooltipLeftClick: "Left-click to open settings.",
  minimapTooltipRightClick: "Right-click to print debug info."
};

const zhCN: Messages = {
  help: `命令：${SLASH_ALIASES.short}、${SLASH_ALIASES.short} stats、${SLASH_ALIASES.short} reset、${SLASH_ALIASES.short} debug、${SLASH_ALIASES.short} layout、${SLASH_ALIASES.short} effect、${SLASH_ALIASES.short} effect test、${SLASH_ALIASES.short} effect layout、${SLASH_ALIASES.short} buttons、${SLASH_ALIASES.short} options`,
  loaded: `已加载。输入 ${SLASH_ALIASES.short} 查看命令。`,
  reset: "已重置加载次数。",
  stats: count => `此账号已加载 ${count} 次。`,
  debugHeader: "运行环境诊断：",
  debugLine: (label, value) => `${label}：${value}`,
  settingsUnavailable: "当前客户端无法打开设置面板。",
  settingsTitle: ADDON_TITLE,
  settingsDescription: "配置插件功能。",
  launchCount: count => `加载次数：${count}`,
  showMinimapButton: "显示小地图按钮",
  showLoginMessage: "显示登录提示",
  settingsFeaturesHeader: "功能",
  enableCustomActionLayout: "Slayer 风格动作条",
  enableSpellTextEffect: "施法时显示技能文字",
  enableDemonSlayerSystemButtons: "鬼灭之刃风格菜单栏按钮",
  spellEffectLayoutHeader: "技能特效布局",
  spellEffectLayoutScale: "特效缩放",
  spellEffectLayoutScaleValue: value => `${value.toFixed(2)}x`,
  spellEffectLayoutAdjust: "调整位置",
  spellEffectLayoutDone: "完成",
  spellEffectLayoutReset: "重置布局",
  spellEffectLayoutDragHint: "拖动以移动技能特效",
  spellEffectLayoutEditorTitle: "调整技能特效位置与缩放",
  spellEffectLayoutResetConfirm: "已重置技能特效布局。",
  spellEffectLayoutEditorOpened: "已开启技能特效布局编辑器，拖动高亮区域即可移动。",
  spellEffectLayoutEditorClosed: "已关闭技能特效布局编辑器。",
  featureDisabled: featureName => `${featureName} 已在插件设置中关闭。`,
  resetLaunchCount: "重置加载次数",
  printDebugInfo: "输出调试信息",
  minimapTooltipTitle: ADDON_TITLE,
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
