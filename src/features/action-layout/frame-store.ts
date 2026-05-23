export type FramePoint = {
  point: WowPoint;
  relativeTo?: WowFrame;
  relativePoint: WowPoint;
  x: number;
  y: number;
};

export type FrameSnapshot = {
  parent?: WowFrame;
  scale: number;
  width: number;
  height: number;
  wasShown: boolean;
  points: FramePoint[];
};

const snapshots: Record<string, FrameSnapshot | undefined> = {};
const hookedFrames: Record<string, boolean | undefined> = {};

export function getFrame(name: string): WowFrame | undefined {
  return _G[name] as WowFrame | undefined;
}

export function getGlobalTexture(name: string): WowTexture | undefined {
  return _G[name] as WowTexture | undefined;
}

function hasMethod(frame: WowFrame, methodName: string): boolean {
  return typeof (frame as unknown as Record<string, unknown>)[methodName] === "function";
}

function hasMethods(frame: WowFrame, methodNames: string[]): boolean {
  for (const methodName of methodNames) {
    if (!hasMethod(frame, methodName)) {
      return false;
    }
  }

  return true;
}

function canSnapshotFrame(frame: WowFrame): boolean {
  return hasMethods(frame, ["GetNumPoints", "GetPoint", "GetParent", "GetScale", "GetWidth", "GetHeight", "IsShown"]);
}

export function canLayoutFrame(frame: WowFrame | undefined): frame is WowFrame {
  if (frame === undefined) {
    return false;
  }

  return hasMethods(frame, [
    "ClearAllPoints",
    "SetPoint",
    "SetParent",
    "SetScale",
    "SetSize",
    "Show",
    "Hide"
  ]);
}

export function canHideFrame(frame: WowFrame | undefined): frame is WowFrame {
  return frame !== undefined && hasMethod(frame, "Hide");
}

export function hasFrameMethod(frame: WowFrame, methodName: string): boolean {
  return hasMethod(frame, methodName);
}

export function captureFrame(name: string, frame: WowFrame): void {
  if (snapshots[name] !== undefined) {
    return;
  }

  if (!canSnapshotFrame(frame)) {
    return;
  }

  const points: FramePoint[] = [];

  for (let pointIndex = 1; pointIndex <= frame.GetNumPoints(); pointIndex++) {
    const [point, relativeTo, relativePoint, x, y] = frame.GetPoint(pointIndex);
    points.push({
      point,
      relativeTo,
      relativePoint,
      x: x || 0,
      y: y || 0
    });
  }

  snapshots[name] = {
    parent: frame.GetParent(),
    scale: frame.GetScale(),
    width: frame.GetWidth(),
    height: frame.GetHeight(),
    wasShown: frame.IsShown(),
    points
  };
}

export function getFrameSnapshot(name: string): FrameSnapshot | undefined {
  return snapshots[name];
}

export function restoreFrame(name: string): void {
  const frame = getFrame(name);
  const snapshot = snapshots[name];

  if (frame === undefined || snapshot === undefined) {
    return;
  }

  if (!canLayoutFrame(frame)) {
    return;
  }

  frame.SetParent(snapshot.parent ?? UIParent);
  frame.SetScale(snapshot.scale);
  frame.SetSize(snapshot.width, snapshot.height);
  frame.ClearAllPoints();

  for (const point of snapshot.points) {
    frame.SetPoint(point.point, point.relativeTo ?? UIParent, point.relativePoint, point.x, point.y);
  }

  if (snapshot.wasShown) {
    frame.Show();
    return;
  }

  frame.Hide();
}

export function restoreFrames(names: readonly string[]): void {
  for (const name of names) {
    restoreFrame(name);
  }
}

export function setIgnoreFramePositionManager(frame: WowFrame): void {
  (frame as unknown as { ignoreFramePositionManager?: boolean }).ignoreFramePositionManager = true;
}

export function hookLayoutFrame(name: string, frame: WowFrame, onReshow: () => void): void {
  if (hookedFrames[name]) {
    return;
  }

  if (!hasMethod(frame, "HookScript")) {
    return;
  }

  hookedFrames[name] = true;
  frame.HookScript("OnShow", () => {
    onReshow();
  });
}

export function countExistingFrames(names: readonly string[]): number {
  let count = 0;

  for (const name of names) {
    if (getFrame(name) !== undefined) {
      count++;
    }
  }

  return count;
}
