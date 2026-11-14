import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const bundle = JSON.parse(
  readFileSync(new URL("../src/generated/bundle.json", import.meta.url), "utf8"),
);
test("complete 302-month calendar has correct unavailable/estimated transition", () => {
  assert.equal(bundle.records.length, 302);
  assert.equal(bundle.records[0].date, "2000-11");
  assert.equal(bundle.records.at(-1).date, "2025-12");
  for (const r of bundle.records) {
    assert.equal(r.viirs === null, r.date < "2012-02");
    assert.equal(r.estimated !== null, r.date < "2012-02");
    assert.ok(r.modis >= 0);
  }
});
test("all map totals match independently audited monthly cell-days", () => {
  assert.equal(bundle.grid.length, 7543);
  for (const r of bundle.records) {
    const points = bundle.grid.filter((p) => p[0] === r.date);
    for (const [key, i] of [
      ["modis", 5],
      ["viirs", 6],
    ])
      if (r[key] != null)
        assert.equal(
          points.reduce((n, p) => n + p[i], 0),
          r[key],
          r.date + " " + key,
        );
  }
});
test("all six original CSV downloads match the product files byte-for-byte after newline normalization", () => {
  for (const name of Object.keys(bundle.csv).filter((n) => n !== "Method_Comparison.csv")) {
    const product = readFileSync(new URL("../../products/" + name, import.meta.url), "utf8");
    assert.equal(bundle.csv[name].replaceAll("\r\n", "\n"), product.replaceAll("\r\n", "\n"), name);
  }
});
test("stress months retain observed references and exploratory estimates", () => {
  const nov = bundle.records.find((r) => r.date === "2018-11"),
    july = bundle.records.find((r) => r.date === "2024-07");
  assert.equal(nov.modis, 735);
  assert.equal(nov.viirs, 1220);
  assert.equal(july.modis, 322);
  assert.equal(july.viirs, 58);
  assert.ok(july.diagnostic > 340);
  for (const r of bundle.records.filter((r) => r.date >= "2002-01" && r.date <= "2002-06"))
    assert.equal(r.flag, "MODIS_early_Terra_only");
});
