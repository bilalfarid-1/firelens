# FIRELENS — LOCAL CODEX AUDIT-FIRST HANDOFF

**Date prepared:** 2026-11-14  
**Project:** NASA Space Apps Challenge 2026 — Harmonization of MODIS and VIIRS Hot Spots  
**Fixed study region:** Butte County, California, USA — Census GEOID **06007**  
**Team:** Three people; first hackathon; focus on verifiable, submission-ready minimum viable product (MVP).  
**Role for Codex:** Independent verifier, debugger, and implementation maintainer — NOT a passive consumer of the previous assistant's claims.

> **Read this file, but do not trust its claims until you inspect the actual code and data.** It is a guide to what to test, not an approval certificate.

## 1. Inputs and how to use them

Primary archive: `NASA_Butte_County_FireLens_MVP_2026-11-14.zip` (contains the implemented MVP, the original NASA data archives, pipeline, outputs, web app, tests, and documentation). Extract it into its own directory and open **`NASA_Butte_County_Ready_For_Codex/`** as your working folder. Do not run scripts inside an archive viewer.

Optional original-history archive: `NASA_Space_Apps_Butte_County_New_Chat_Starter_Package(1).zip` (the **pre-harmonization** starter). Use it for provenance and independent comparison, but **do not extract it over the MVP** or replace more recent files with older ones. It contains `START_HERE_NEW_CHAT_HANDOFF.md` and `README_START_HERE.md`; those describe the project state *before* the MVP was developed.

ZIP SHA-256 values observed by the handoff author on 2026-11-14:

| Archive | SHA-256 |
|---|---|
| `NASA_Butte_County_FireLens_MVP_2026-11-14.zip` | `84bc43b012e41ecfcea0693cf8618219b6f1d8bb8007b709c10a0680852c1c15` |
| `NASA_Space_Apps_Butte_County_New_Chat_Starter_Package(1).zip` | `3525dd2b27fadb3659d3009dc9f6bf96afd501bba620f8d34d14e13cf0d35eca` |

Use your own SHA-256 results; if either differs, stop treating this handoff as a matching manifest and report what you actually received.

## 2. User's goals and non-negotiable requirements

The project must produce a **scientifically defensible retrospective calendar of satellite hotspot activity** and an interactive web demonstration before the registered event's actual hackathon submission deadline. NASA challenge: [Harmonization of MODIS and VIIRS Hot Spots](https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/).

- **Do not change the county.** Use Butte County, GEOID `06007`.
- Original NASA FIRMS data: **MODIS C6.1 Terra/Aqua** and **VIIRS S-NPP C2** active-fire/hotspot archives, requested for a bounding rectangle, then county-filtered.
- Original NASA downloads were obtained; **do not download them again** unless an independently verified corruption or real omission makes replacement essential.
- **Do not modify the original downloaded ZIPs** or erase provenance / source data.
- Different sensor pixel footprints, overpass times, confidence semantics, detection thresholds, and completeness mean equal raw counts are **not equivalent measurements**.
- A hotspot is a satellite thermal anomaly **detection**, **not a confirmed unique wildfire**, burned area, incident count, or fire severity.
- Prefer a simple, valid, functional MVP over a major rewrite or speculative AI/ML.
- No emailing anyone, spending money, or contacting project/data organizations. Use published public sources when required.
- Explain scientific decisions in accessible language, separate observed data from modeled estimates, and document uncertainty and limitations.
- Work through normal testing and bounded repairs without constantly asking the user. **Ask before destructive changes, paid services, publishing, submission, or major scientific target shifts.**

## 3. What the package appears to contain (VERIFY all of this)

Start with these exact paths under `NASA_Butte_County_Ready_For_Codex/`:

| File / directory | Intended purpose |
|---|---|
| `OPEN_THIS_FIRST.md`, `RUN_MVP.md`, `QA_CHECKLIST.md` | Current MVP orientation, commands, claimed test gates |
| `README_START_HERE.md` | Retained *earlier* pre-harmonization handoff, not the latest status |
| `DL_FIRE_M-C61_848030.zip` | Immutable NASA MODIS C6.1 source archive |
| `DL_FIRE_SV-C2_848031.zip` | Immutable NASA VIIRS S-NPP C2 source archive |
| `process_butte_county.py` | County-membership filtering and exact GIS boundary fetching |
| `results/` | Supplied county subsets, raw monthly/yearly counts, original audits and manifests |
| `pipeline/harmonize.py` | EPSG:3310 grid × UTC day aggregation, overlap-trained VIIRS-reference crosswalk, validation, exports |
| `pipeline/sensitivity.py` | Grid-origin, grid-size, and per-sensor confidence sensitivity |
| `pipeline/build_offline.py` | Bundles site/data into the standalone HTML |
| `products/` | Harmonized calendar, yearly data, grid data, validation tables, model manifest |
| `web/index.html`, `web/app.js`, `web/styles.css` | Hostable static web app |
| `web/FireLens_Butte_Offline.html` | Self-contained browser app; should work when double-clicked |
| `web/data/` | Generated JSON/CSV/GeoJSON site data |
| `tests/`, `evidence/`, `screenshots/`, `charts/`, `docs/` | Tests, previous run logs, screenshots, charts, methodology, demo and submission drafts |

From the ZIP inspection in the ChatGPT environment: 64 entries, ZIP CRC test passed. Two source archives matched their manifest SHA-256 values; six generated product CSVs matched their manifest values; the bundled nine Python tests passed again (9/9). **These are limited, internal checks; independently reproduce them.**

Previous project's stated numeric checkpoints to test, NOT accept blindly:

- County subset rows (all `type` values): **7,211 MODIS** and **16,526 VIIRS S-NPP**.
- Presumed-vegetation (`type=0`) observations: **7,105 MODIS**, **16,450 VIIRS**.
- Common spatial-temporal unit: **distinct EPSG:3310 1-km grid cell × UTC acquisition day**, counted within UTC calendar months.
- Continuous calendar: **302 months**, November 2000 through December 2025.
- Model fitting: only **2013–2023** overlapping months, leave-entire-year-out model selection.
- Independent declared final test: **2024–2025**, 24 months. Reported model MAE = **20.334 cell-days per month** vs uncorrected MODIS = **32.000**, both compared with VIIRS detections, NOT fire truth.
- July 2024 large disagreement: **322 MODIS** vs **58 VIIRS** grid cell-days, but model predicts ~**340.82**. Supplied raw source shows MODIS detections on July 25–26 but zero VIIRS county detections on those dates. DO NOT presume why.
- Historical VIIRS-reference series uses **observed VIIRS where available (Feb 2012 onward)** and **MODIS-derived modeled VIIRS-reference estimates earlier**. January 2012 is partial VIIRS coverage, labeled modeled. The post-2012 series is **not independent verification of the model**, and the early extrapolation is not independently truth-validated.
- Interval bounds for modeled values are based on train-era residuals and are **heuristic**, NOT calibrated 90% probability coverage.

## 4. FIRST technical operation — establish independent baseline, do not edit yet

1. Extract the **actual** ZIP and inspect all files, metadata, code, declared schemas and manifests. Do not rely solely on logs or Markdown claims.
2. Record the original ZIP SHA-256, the two nested NASA source ZIP SHA-256, counts from **inside** archive CSVs, source schemas, output schema, and hashes of existing `products/*.csv`.
3. Preserve the extracted original folder untouched, or make a separate working copy / git baseline before making edits.
4. Verify that every stated test genuinely checks what its name claims; existing tests may be too narrow and may not detect flawed assumptions.
5. Create `audit/` with a `baseline_manifest.json`, command logs, independent recomputation, and an `AUDIT_REPORT.md`. Avoid writing into `results/` until comparisons are complete.

Windows PowerShell commands (run from `NASA_Butte_County_Ready_For_Codex/`):

```powershell
Get-FileHash .\DL_FIRE_M-C61_848030.zip -Algorithm SHA256
Get-FileHash .\DL_FIRE_SV-C2_848031.zip -Algorithm SHA256
py -m pip install -r requirements_harmonization.txt
py -m unittest discover -s tests -v
```

Do not treat a PASS from the supplied test suite as a guarantee. Independently calculate at least these from source records: 2018-11 grid cell-days, 2024-07 cell-days, 2024-07-25/26 instrument records, at least one quiet month, and handling of VIIRS pre-2012 null values. Check leap days, boundary timestamps, date parsing, and duplicate/overpass behavior.

## 5. HIGH PRIORITY — independently reproduce exact county filtering

`results/Butte_County_Boundary.geojson` is a **simplified polygon**. Previous work claims 117 edge cases were examined and three VIIRS classifications overridden against the full official geometry, but these are inherited claims. A local full-resolution replay has **not yet been independently demonstrated**.

Use the existing official boundary URL in `process_butte_county.py`: California County Boundaries and Identifiers, FeatureServer query for `CENSUS_GEOID='06007'`. Query/source may change; record response, retrieval timestamp, geometry validity, projected area, feature count, source URL, and SHA-256.

Run in a new folder only:

```powershell
py -m pip install -r requirements.txt
py process_butte_county.py --out results_exact_replay
```

Then compare `results_exact_replay/MODIS_Butte_Raw_Detections.csv` and `results_exact_replay/VIIRS_SNPP_Butte_Raw_Detections.csv` to the supplied county files **at row level** (not only count). Compare yearly/monthly outputs. Save a CSV of *every* changed membership classification with source row identity and coordinates. If exact service fails, retain `PARTIAL` and record error, not a fabricated PASS.

Do **not** automatically replace the current scientific outputs after an exact-boundary difference. First inspect any discrepancies and ask whether a scientifically material change warrants controlled regeneration. Preserve originals and compare results.

## 6. HIGH PRIORITY — audit scientific meaning independently

Read `docs/scientific_method.md`, `docs/assumptions_and_limits.md`, `products/harmonization_manifest.json` **and the implementation**. Then verify:

1. Both sensors use the same grid CRS, fixed origin, cell size, date support and **correct coordinate transform order**; grouping removes within-cell same-day multiplicity but does **not** imply equal fire-detection probability.
2. Inclusion rules (`type=0`; both day/night; native confidence untreated in primary output) are supported by authoritative NASA/FIRMS docs; no false equivalence in confidence or FRP.
3. Model training, model selection, and held-out evaluation use strictly disjoint time blocks; inspect source code for leakage, inappropriate hyperparameter search, or test-year-based tweaks.
4. Independently recalculate the reported MAE, median error, log error, and July 2024 mismatch from product CSV and/or raw data.
5. Compare simpler baselines on the same split; verify no hand-chosen correction factor and explain why a log crosswalk was selected.
6. Inspect whether VIIRS snapshot completeness / orbit coverage makes it a problematic target in 2024. Seek official public documentation or source metadata; if it cannot be established, leave the July inconsistency explicitly unresolved. Do not automatically relabel a lack of returned records as known no-fire observations.
7. Historical 2000–2011 model transfer from 2013–2023 represents a strong unverified temporal assumption; Terra-only early coverage and the 2012 method seam remain apparent.
8. Confirm that 302 months, export dates, yearly summaries, map cells, and model/observed flags are consistent. `type=0` does not mean every retained detection is a verified wildfire.
9. The previous test result measures **sensor agreement versus VIIRS**, not independent real-world wildfire accuracy. **Do not claim** confirmed fire counts, acreage, area burned, prospective predictive skill, or ground-truth calibration.
10. Discuss whether the results justify the label *harmonized VIIRS-reference indicator*, or require a more cautious name/label. Preserve original raw comparisons regardless.

If a claim is not reproducible, downgrade it in app, README, and submission draft instead of hiding the contradiction.

## 7. Web app verification (ACTUAL Windows/browser run required)

Test first without any edit:

```powershell
# Double-click this file in Windows File Explorer:
# web\FireLens_Butte_Offline.html

# Then separately test hosted mode:
py -m http.server 8000 --directory web
# Open http://localhost:8000 in Edge / Firefox
```

Check: chart and map both load; month/year selection; MODIS, VIIRS and harmonized views; 2008 (VIIRS unavailable, not zero); 2018-11 (high activity); 2024-07 (anomaly); early 2012; full CSV download and custom filtered CSV export; mobile sizing; data attribution; error-free JavaScript console; proper offline behavior. Confirm the downloaded file content matches the source CSV and its requested date range. Test hosted mode **through actual browser navigation**, not only static DOM injection. The previous assistant's environment could not test localhost navigation. Capture new evidence screenshots.

If source data or JavaScript changes, regenerate the offline HTML:

```powershell
py pipeline/harmonize.py
py pipeline/sensitivity.py
py pipeline/build_offline.py
py -m unittest discover -s tests -v
```

**Use those regeneration commands only when needed**—avoid redoing completed processing for no reason. On every edit, ensure the standalone HTML is not stale relative to web source/data.

## 8. Deliverables, workflow, and deadline discipline

Work in this order: **(1) audit → (2) fix only reproducible P0/P1 problems → (3) rerun affected validations → (4) final screenshots/demo → (5) submission documents.** Save every command/output and state exactly what changed. Avoid a wholesale framework rewrite, unnecessary datasets or external dependencies.

- Verify the **actual NASA global deadline and the team's registered local event deadline** from official current pages; do not assume one event's local cutoff applies to all teams.
- Read `docs/submission.md`, `docs/demo_script.md`, and `docs/team_finish_plan.md`; mark draft placeholders to be filled by the team (team names, working public link, video, submission, AI-assisted work disclosure as required).
- Do not submit, create accounts, publish the project, send messages, or incur costs unless explicitly authorized.
- Suggested parallel ownership: A = science + exact boundary, B = app + hosting, C = test verification + demo + submission text.
- Prioritize a truthful, working submission over a speculative higher-accuracy model near the deadline.

## 9. Mandatory audit report format

At the end of the initial audit, produce `audit/AUDIT_REPORT.md` and print a concise decision:

| Check | PASS / PARTIAL / FAIL / NOT TESTED | Evidence file/path | Difference / limitation | Priority |
|---|---|---|---|---|
| ZIP integrity + original hashes | | | | |
| Independently counted raw source and county rows | | | | |
| Exact official Butte polygon membership | | | | |
| Grid-day aggregation (independent recomputation) | | | | |
| Sensor-specific scientific filtering | | | | |
| Split integrity and held-out metrics | | | | |
| July 2024 data completeness investigation | | | | |
| Static and offline browser behaviors | | | | |
| Source ↔ generated data ↔ web consistency | | | | |
| NASA demo/submission completeness | | | | |

For each failed check, give the exact path/line or row, the observed result, and a reproducible command. Distinguish **reported by earlier assistant**, **independently reproduced**, **verified against authoritative source**, and **unresolved**. Do not provide a misleading overall PASS when any required scientific gate is still open.

## 10. First response from Codex

Tell the user: (a) which exact files it opened; (b) where the working directory is; (c) whether the input archive hash agrees; (d) the first **actual command it ran** and its observed output; and (e) the next verification step. Then continue independently through the bounded audit rather than ask for approval at each step.
