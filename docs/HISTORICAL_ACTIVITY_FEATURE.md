# Historical Activity Insight — research feature (team review)

## What changed

The Explore screen now includes a retrospective, same-calendar-month VIIRS S-NPP comparison. It displays the selected month's observed 1-km grid-cell-days, a comparison median and maximum, the number of comparison years, and a plain-language category. An optional set of three notable months helps reviewers navigate the exploratory examples.

The existing MODIS–VIIRS regression, all satellite data, the historical reference indicator, CSV products, and offline architecture are **unchanged**. The feature reads the already-bundled monthly records, and makes no live requests.

## Comparison rules

* Target months: **2013–2025**, and only if the supplied `reference_status` is `observed_VIIRS_S_NPP` with a finite nonnegative VIIRS value. Earlier estimated months and the partial-coverage 2012 period are not analyzed.
* Reference set: observed VIIRS for the **same calendar month** in **2013–2023**, excluding the selected target year (if it is inside that interval). This gives 10 years for eligible 2013–2023 targets and 11 years for 2024–2025 targets, assuming a complete reference set. At least 8 observations are required.
* Median and maximum are calculated directly from reference observations. When the median is zero, the ratio is unavailable, not infinity.
* **Markedly elevated**: selected observation strictly exceeds the reference maximum **and** is at least 3 times the nonzero reference median.
* **Above comparison maximum**: observation strictly exceeds the maximum but does not meet the 3x criterion (or has zero reference median).
* **Within comparison range**: observation does not exceed the maximum. This does **not** mean low activity, safe conditions, a verified normal year, or complete satellite observation.

The 3x cutoff is an *exploratory, interpretable display heuristic*, not a statistically calibrated decision rule. The tool does not estimate wildfire incidence, probability, severity, burned area or risk. The choice of 2013–2023 is a fixed, retrospective comparison period, **not** a claim of prospective out-of-sample anomaly detection. Revisit the reference window and thresholds for additional study regions or operational use.

## Verified examples

| Target month | Observed VIIRS | Reference years | Median | Reference maximum | Classification |
|---|---:|---:|---:|---:|---|
| November 2018 | 1,220 | 10 | 28 | 67 | Markedly elevated |
| September 2020 | 886 | 10 | 29 | 54 | Markedly elevated |
| July 2024 | 58 | 11 | 10 | 263 | Within comparison range (with **coverage warning**) |

Important: July 2024 includes documented VIIRS S-NPP outages and major sensor disagreement. Its selected VIIRS value cannot establish how much fire activity was actually missed, and its relative comparison must not be presented as a definitive absence of unusual fires. Observation completeness is not independently established for the rest of the series either.

## Quality / privacy / deployment

- Historical observed records only; no model-derived reference values disguised as measurements.
- Existing source-product files and scientific model unmodified.
- Accessible labels and responsive UI; native buttons for notable-month navigation.
- Works offline using `frontend/src/generated/bundle.json`.
- Never use the displayed category for emergency decisions, official alerts, safety guidance, or unique-fire counts.

## Test commands

```bash
cd frontend
npm ci
npm test
npm run typecheck
npm run build
cd ..
python -m unittest discover -s tests -p 'test_*.py' -v
```

In the author's restricted local environment, `npm test` and the existing Python tests passed. `npm ci`/full TypeScript typecheck/build could **not** be completed because npm package tarballs were not available offline. Run those checks in CI before merge.

## Suggested team review

1. Are the comparison window and 3x descriptive cutoff understandable to nontechnical users?
2. Should the badge say "markedly elevated" or "unusual observed activity"?
3. Is the separate data-quality warning prominent enough for July 2024?
4. Should a future version allow a different, explicitly documented reference period?
5. Verify full browser responsiveness/accessibility and offline deployment on the feature branch.
