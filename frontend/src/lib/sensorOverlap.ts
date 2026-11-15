/**
 * Compare retained, observed monthly cell occupancy on the shared 1-km grid.
 * A cell in "both" has at least one retained cell-day for each sensor in the
 * selected UTC month. It does NOT imply a simultaneous or matched detection.
 */
export type SensorOverlapCategory = "both" | "modis_only" | "viirs_only";
export type GridRow = readonly (string | number)[];

export type SensorOverlapCell = {
  gridX: number;
  gridY: number;
  longitude: number;
  latitude: number;
  modisDays: number;
  viirsDays: number;
  category: SensorOverlapCategory;
};

export type SensorOverlap = {
  month: string;
  cells: SensorOverlapCell[];
  counts: Record<SensorOverlapCategory, number>;
  totals: { modisDays: number; viirsDays: number };
};

export function buildSensorOverlap(rows: readonly GridRow[], month: string): SensorOverlap {
  const counts = { both: 0, modis_only: 0, viirs_only: 0 };
  const totals = { modisDays: 0, viirsDays: 0 };
  const cells: SensorOverlapCell[] = [];

  for (const row of rows) {
    if (row[0] !== month) continue;
    const [gridX, gridY, longitude, latitude, modisDays, viirsDays] = [
      Number(row[1]), Number(row[2]), Number(row[3]), Number(row[4]),
      Number(row[5]), Number(row[6]),
    ];
    if (![gridX, gridY, longitude, latitude, modisDays, viirsDays].every(Number.isFinite) ||
        modisDays < 0 || viirsDays < 0 || (modisDays === 0 && viirsDays === 0)) {
      throw new Error(`Invalid observed grid cell for ${month}`);
    }
    const category: SensorOverlapCategory =
      modisDays > 0 && viirsDays > 0 ? "both" : modisDays > 0 ? "modis_only" : "viirs_only";
    counts[category] += 1;
    totals.modisDays += modisDays;
    totals.viirsDays += viirsDays;
    cells.push({ gridX, gridY, longitude, latitude, modisDays, viirsDays, category });
  }
  return { month, cells, counts, totals };
}

/** Explicitly gate comparisons to months with an observed S-NPP reference. */
export function canCompareObservedMonth(
  record: { date: string; viirs?: number | null; status?: string } | undefined,
): boolean {
  return !!record && record.date >= "2012-02" &&
    typeof record.viirs === "number" && Number.isFinite(record.viirs) && record.viirs >= 0 &&
    record.status === "observed_VIIRS_S_NPP";
}

export function sensorOverlapCsv(overlap: SensorOverlap): string {
  const header = "month,grid_x,grid_y,longitude,latitude,modis_utc_cell_days,viirs_utc_cell_days,category";
  return [
    header,
    ...overlap.cells.map((cell) => [
      overlap.month,
      cell.gridX,
      cell.gridY,
      cell.longitude,
      cell.latitude,
      cell.modisDays,
      cell.viirsDays,
      cell.category,
    ].join(",")),
  ].join("\r\n") + "\r\n";
}
