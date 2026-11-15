/**
 * Retrospective same-calendar-month comparisons of observed VIIRS S-NPP cell-days.
 * No estimates, model predictions, MODIS values or reference-year sensor data are
 * used as substitutes for missing VIIRS observations.
 */
import type { MonthRecord } from "./data";

export const COMPARISON_START_YEAR = 2013;
export const COMPARISON_END_YEAR = 2023;
export const MIN_COMPARISON_YEARS = 8;
/** Exploratory descriptive cutoff, not a statistical significance test. */
export const MARKEDLY_ELEVATED_RATIO = 3;

export type ActivityCategory =
  | "markedly_elevated"
  | "above_comparison_max"
  | "within_comparison_range";

export type ActivityInsight = {
  date: string;
  observed: number;
  comparisonYears: number[];
  median: number;
  maximum: number;
  ratioToMedian: number | null;
  category: ActivityCategory;
  qualityFlag: string | undefined;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function isObserved(value: MonthRecord): boolean {
  return (
    value.status === "observed_VIIRS_S_NPP" &&
    value.viirs !== null &&
    Number.isFinite(value.viirs) &&
    value.viirs >= 0
  );
}

/**
 * Research-only interpretation of *observed* values, not fire incidents.
 *
 * Same month in 2013–2023; exclude the target's year if in that range to
 * prevent the comparison period from containing the value being assessed.
 * For 2024–2025, all 11 historical years are used. Only 2013+ targets are
 * shown, excluding the limited initial VIIRS coverage period of 2012.
 *
 * "Markedly elevated" means strictly above every comparison value AND at
 * least 3x the nonzero comparison median. It is an explicit descriptive rule,
 * NOT a calibrated anomaly probability or a wildfire severity metric.
 */
export function analyzeHistoricalActivity(
  records: readonly MonthRecord[],
  date: string,
): ActivityInsight | null {
  const target = records.find((r) => r.date === date);
  const targetYear = Number(date.slice(0, 4));
  if (!target || targetYear < COMPARISON_START_YEAR || !isObserved(target)) return null;

  const month = date.slice(5);
  const comparison = records
    .filter((record) => {
      const year = Number(record.date.slice(0, 4));
      return (
        record.date.slice(5) === month &&
        year >= COMPARISON_START_YEAR &&
        year <= COMPARISON_END_YEAR &&
        year !== targetYear &&
        isObserved(record)
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const years = comparison.map((record) => Number(record.date.slice(0, 4)));
  if (years.length < MIN_COMPARISON_YEARS) return null;
  const values = comparison.map((record) => record.viirs as number);
  const referenceMedian = median(values);
  const referenceMax = Math.max(...values);
  const observed = target.viirs as number;
  const ratio = referenceMedian > 0 ? observed / referenceMedian : null;
  const aboveMax = observed > referenceMax;
  const category: ActivityCategory =
    aboveMax && ratio !== null && ratio >= MARKEDLY_ELEVATED_RATIO
      ? "markedly_elevated"
      : aboveMax
        ? "above_comparison_max"
        : "within_comparison_range";

  return {
    date,
    observed,
    comparisonYears: years,
    median: referenceMedian,
    maximum: referenceMax,
    ratioToMedian: ratio,
    category,
    qualityFlag: target.flag,
  };
}

/** Sorted by observed magnitude, not by unstable ratios with tiny denominators. */
export function notableHistoricalMonths(records: readonly MonthRecord[], limit = 3): ActivityInsight[] {
  return records
    .filter((r) => Number(r.date.slice(0, 4)) >= COMPARISON_START_YEAR && isObserved(r))
    .map((r) => analyzeHistoricalActivity(records, r.date))
    .filter((r): r is ActivityInsight => r !== null && r.category === "markedly_elevated")
    .sort((a, b) => b.observed - a.observed || a.date.localeCompare(b.date))
    .slice(0, Math.max(0, limit));
}
