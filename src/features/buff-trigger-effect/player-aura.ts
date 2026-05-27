export type PlayerAuraRow = {
  auraName: string;
  spellId?: number;
  count?: number;
  duration?: number;
  expirationTime?: number;
};

type WowAuraData = {
  name?: string;
  spellId?: number;
  applications?: number;
  duration?: number;
  expirationTime?: number;
  points?: number;
};

export function coerceAuraNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || value <= 0) {
    return undefined;
  }

  return value;
}

function readAuraDataTable(data: WowAuraData): PlayerAuraRow | undefined {
  const auraName = data.name;

  if (auraName === undefined || auraName === "") {
    return undefined;
  }

  return {
    auraName,
    spellId: coerceAuraNumber(data.spellId),
    count: coerceAuraNumber(data.applications) ?? coerceAuraNumber(data.points),
    duration: coerceAuraNumber(data.duration),
    expirationTime: coerceAuraNumber(data.expirationTime)
  };
}

function tryReadAuraViaCUnitAuras(index: number): PlayerAuraRow | undefined {
  const api = (_G as { C_UnitAuras?: {
    GetBuffDataByIndex?: (unit: string, index: number) => WowAuraData | undefined;
    GetAuraDataByIndex?: (unit: string, index: number, filter?: string) => WowAuraData | undefined;
  } }).C_UnitAuras;

  if (api === undefined) {
    return undefined;
  }

  const readers: Array<() => WowAuraData | undefined> = [];

  if (api.GetBuffDataByIndex !== undefined) {
    readers.push(() => api.GetBuffDataByIndex!("player", index));
  }

  if (api.GetAuraDataByIndex !== undefined) {
    readers.push(() => api.GetAuraDataByIndex!("player", index, "HELPFUL"));
  }

  for (const read of readers) {
    const [ok, data] = pcall(read);

    if (!ok || data === undefined || data === null) {
      continue;
    }

    const row = readAuraDataTable(data);

    if (row !== undefined) {
      return row;
    }
  }

  return undefined;
}

function resolveLegacySpellId(second: unknown, tenth: unknown, eleventh: unknown, twelfth: unknown): number | undefined {
  if (typeof second === "number") {
    return coerceAuraNumber(tenth) ?? coerceAuraNumber(eleventh) ?? coerceAuraNumber(twelfth);
  }

  return coerceAuraNumber(eleventh) ?? coerceAuraNumber(twelfth) ?? coerceAuraNumber(tenth);
}

function readPlayerAuraLegacy(index: number): PlayerAuraRow | undefined {
  const [
    auraName,
    second,
    third,
    fourth,
    fifth,
    sixth,
    seventh,
    _eighth,
    _ninth,
    tenth,
    eleventh,
    twelfth
  ] = UnitAura("player", index, "HELPFUL");

  if (auraName === undefined || auraName === "") {
    return undefined;
  }

  if (typeof second === "number") {
    return {
      auraName,
      spellId: resolveLegacySpellId(second, tenth, eleventh, twelfth),
      count: coerceAuraNumber(third),
      duration: coerceAuraNumber(fifth),
      expirationTime: coerceAuraNumber(sixth)
    };
  }

  return {
    auraName,
    spellId: resolveLegacySpellId(second, tenth, eleventh, twelfth),
    count: coerceAuraNumber(fourth),
    duration: coerceAuraNumber(sixth),
    expirationTime: coerceAuraNumber(seventh)
  };
}

export function readPlayerAura(index: number): PlayerAuraRow | undefined {
  const modern = tryReadAuraViaCUnitAuras(index);

  if (modern !== undefined) {
    return modern;
  }

  return readPlayerAuraLegacy(index);
}
