import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyzeHistoricalActivity,
  notableHistoricalMonths,
} from "../src/lib/anomaly.ts";
import type { MonthRecord } from "../src/lib/data.ts";

const bundle = JSON.parse(
  readFileSync(new URL("../src/generated/bundle.json", import.meta.url), "utf8"),
);
const records = bundle.records as MonthRecord[];

test("November 2018 accurately excludes 2018 from its November baseline", () => {
  const result = analyzeHistoricalActivity(records, "2018-11");
  assert.ok(result);
  assert.equal(result.observed, 1220);
  assert.equal(result.comparisonYears.length, 10);
  assert.ok(!result.comparisonYears.includes(2018));
  assert.equal(result.median, 28);
  assert.equal(result.maximum, 67);
  assert.equal(result.category, "markedly_elevated");
  assert.ok(Math.abs((result.ratioToMedian ?? 0) - 43.5714286) < 1e-6);
});

test("September 2020 correctly finds its observed VIIRS comparison", () => {
  const result = analyzeHistoricalActivity(records, "2020-09");
  assert.ok(result);
  assert.equal(result.observed, 886);
  assert.equal(result.comparisonYears.length, 10);
  assert.equal(result.median, 29);
  assert.equal(result.maximum, 54);
  assert.equal(result.category, "markedly_elevated");
});

test("2024 uses 11 comparison years and never labels an outage as verified low activity", () => {
  const july = analyzeHistoricalActivity(records, "2024-07");
  assert.ok(july);
  assert.equal(july.comparisonYears.length, 11);
  assert.equal(july.observed, 58);
  assert.equal(july.median, 10);
  assert.equal(july.maximum, 263);
  assert.equal(july.category, "within_comparison_range");
  assert.equal(july.qualityFlag, "large_sensor_disagreement");
});

test("estimated years and the limited 2012 VIIRS coverage period are ineligible", () => {
  assert.equal(analyzeHistoricalActivity(records, "2007-08"), null);
  assert.equal(analyzeHistoricalActivity(records, "2012-02"), null);
  assert.equal(analyzeHistoricalActivity(records, "not-a-date"), null);
});

test("does not substitute missing or estimated values into a comparison baseline", () => {
  const changed = records.map((r) => ({ ...r }));
  const nov2019 = changed.find((r) => r.date === "2019-11")!;
  nov2019.viirs = null;
  nov2019.estimated = 99999;
  nov2019.status = "estimated_from_MODIS";
  const result = analyzeHistoricalActivity(changed, "2018-11");
  assert.ok(result);
  assert.equal(result.comparisonYears.length, 9);
  assert.ok(!result.comparisonYears.includes(2019));
  // At least 8 reliable calendar-month comparison observations are required.
  for (const year of [2014, 2015]) {
    changed.find((r) => r.date === `${year}-11`)!.viirs = null;
  }
  assert.equal(analyzeHistoricalActivity(changed, "2018-11"), null);
});

test("zero median never creates an infinite ratio or a false 3x claim", () => {
  const synthetic: MonthRecord[] = [];
  for (let year = 2013; year <= 2023; year++) {
    synthetic.push({
      date: `${year}-05`,
      modis: 0,
      viirs: year === 2018 ? 4 : 0,
      estimated: null,
      status: "observed_VIIRS_S_NPP",
    });
  }
  const result = analyzeHistoricalActivity(synthetic, "2018-05");
  assert.ok(result);
  assert.equal(result.median, 0);
  assert.equal(result.ratioToMedian, null);
  assert.equal(result.category, "above_comparison_max");
});

test("notable months list draws observed values only, ordered by magnitude", () => {
  const top = notableHistoricalMonths(records, 3);
  assert.equal(top.length, 3);
  assert.equal(top[0].date, "2018-11");
  assert.equal(top[1].date, "2020-09");
  assert.ok(top.every((item) => item.category === "markedly_elevated"));
  assert.ok(top.every((item, index) => index === 0 || top[index - 1].observed >= item.observed));
});

test("candidate itself is never allowed into its own comparison period", () => {
  const single: MonthRecord[] = Array.from({ length: 11 }, (_, i) => ({
    date: `${2013 + i}-02`,
    modis: 0,
    viirs: i === 5 ? 100 : 10,
    estimated: null,
    status: "observed_VIIRS_S_NPP",
  }));
  const result = analyzeHistoricalActivity(single, "2018-02");
  assert.ok(result);
  assert.equal(result.maximum, 10);
  assert.equal(result.median, 10);
});
