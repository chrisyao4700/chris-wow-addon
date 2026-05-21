type Messages = {
  help: string;
  loaded: string;
  reset: string;
  stats(count: number): string;
  debugHeader: string;
  debugLine(label: string, value: string): string;
};

const enUS: Messages = {
  help: "Commands: /cwa, /cwa stats, /cwa reset, /cwa debug",
  loaded: "loaded. Try /cwa.",
  reset: "Saved launch count reset.",
  stats: count => `Loaded ${count} time(s) on this account.`,
  debugHeader: "Runtime diagnostics:",
  debugLine: (label, value) => `${label}: ${value}`
};

const zhCN: Messages = {
  help: "命令：/cwa、/cwa stats、/cwa reset、/cwa debug",
  loaded: "已加载。输入 /cwa 查看命令。",
  reset: "已重置加载次数。",
  stats: count => `此账号已加载 ${count} 次。`,
  debugHeader: "运行环境诊断：",
  debugLine: (label, value) => `${label}：${value}`
};

export function getMessages(): Messages {
  const locale = GetLocale();

  if (locale === "zhCN") {
    return zhCN;
  }

  return enUS;
}
