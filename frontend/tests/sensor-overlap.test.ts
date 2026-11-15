import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildSensorOverlap,
  canCompareObservedMonth,
  sensorOverlapCsv,
} from "../src/lib/sensorOverlap.ts";

const bundle = JSON.parse(readFileSync(new URL("../src/generated/bundle.json", import.meta.url), "utf8"));
const record = (date: string) => bundle.records.find((r: { date: string }) => r.date === date);

test("November 2018 overlap is based on shared cells, not matching fire events", () => {
  const result = buildSensorOverlap(bundle.grid, "2018-11");
  assert.deepEqual(result.counts, { both: 414, modis_only: 46, viirs_only: 236 });
  assert.deepEqual(result.totals, { modisDays: 735, viirsDays: 1220 });
  assert.equal(result.cells.length, 696);
  assert.ok(result.cells.every((c) => c.category === "both" ? c.modisDays > 0 && c.viirsDays > 0 : true));
});

test("September 2020 and July 2024 cells preserve their observed sensor values", () => {
  const september = buildSensorOverlap(bundle.grid, "2020-09");
  assert.deepEqual(september.counts, { both: 320, modis_only: 129, viirs_only: 176 });
  assert.deepEqual(september.totals, { modisDays: 649, viirsDays: 886 });
  const july = buildSensorOverlap(bundle.grid, "2024-07");
  assert.deepEqual(july.counts, { both: 16, modis_only: 251, viirs_only: 22 });
  assert.deepEqual(july.totals, { modisDays: 322, viirsDays: 58 });
});

test("observed availability is required; missing VIIRS does not become an only-MODIS comparison", () => {
  assert.equal(canCompareObservedMonth(record("2012-01")), false);
  assert.equal(canCompareObservedMonth(record("2012-02")), true);
  assert.equal(canCompareObservedMonth(record("2024-07")), true);
  assert.equal(canCompareObservedMonth(undefined), false);
  assert.equal(canCompareObservedMonth({ date: "2025-01", status: "estimated_from_MODIS", viirs: 0 }), false);
});

test("all months preserve audited grid totals and mutually exclusive cell membership", () => {
  for (const month of bundle.records) {
    const result = buildSensorOverlap(bundle.grid, month.date);
    const keys = result.cells.map((c) => `${c.gridX}:${c.gridY}`);
    assert.equal(new Set(keys).size, keys.length, `${month.date} duplicate grid coordinates`);
    assert.equal(Object.values(result.counts).reduce((a, b) => a + b, 0), result.cells.length);
    assert.equal(result.totals.modisDays, month.modis, `${month.date} MODIS`);
    if (canCompareObservedMonth(month)) {
      assert.equal(result.totals.viirsDays, month.viirs, `${month.date} VIIRS`);
    } else {
      assert.equal(result.totals.viirsDays, 0, `${month.date} VIIRS unavailable`);
    }
  }
});

test("empty months yield empty comparison, never a fabricated overlap", () => {
  const result = buildSensorOverlap(bundle.grid, "2001-02");
  assert.equal(result.cells.length, 0);
  assert.deepEqual(result.counts, { both: 0, modis_only: 0, viirs_only: 0 });
  assert.equal(result.totals.modisDays, 0);
});

test("exported CSV is deterministic, includes observed values and category labels", () => {
  const result = buildSensorOverlap(bundle.grid, "2018-11");
  const csv = sensorOverlapCsv(result);
  assert.equal(csv.split("\r\n").length, result.cells.length + 2);
  assert.ok(csv.startsWith("month,grid_x,grid_y,longitude,latitude,modis_utc_cell_days,viirs_utc_cell_days,category\r\n"));
  assert.ok(csv.includes(",both\r\n"));
  assert.ok(csv.includes(",viirs_only\r\n"));
  assert.ok(csv.includes(",modis_only\r\n"));
  assert.equal(sensorOverlapCsv(result), csv);
});
