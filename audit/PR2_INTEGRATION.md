# Sensor Overlap Map - PR #2 review and integration

Owner-authorized review, fixes and merge on 15 November 2026. Main baseline b8b6ab3888c8de77c3c4324241d47f19b9b0e431; teammate PR head d83c6404a9466d7c8d339deb46a357450afaa5de preserved as the second merge parent. PR: https://github.com/bilalfarid-1/firelens/pull/2 . Contributor GitHub account: MuhammadSaif700. No real-world identity or unrelated contribution inferred.

## Decision and demonstrated fixes

**PASS for the tested combined release.** Include alongside Historical Activity Insight; the new comparison remains exploratory historical observation inspection, not wildfire ground truth or a matched-event detector.

1. Resolved the actual index.css merge conflict by retaining both PR #1 and PR #2 style blocks. Historical Activity Insight, its test glob and all eight earlier feature tests remain intact.
2. Fixed canCompareObservedMonth: the original null-only guard admitted missing/undefined, non-finite and negative VIIRS values. It now requires a finite nonnegative observed value in the reference era from February 2012. Valid observed zero remains eligible. Added a regression test for these cases and pre-reference data.
3. Fixed standalone SVG context: the HTML legend was outside the exported SVG. Overlap exports now include a visible color/count legend, the same-month-not-same-event caveat and occupied-cell units in metadata, distinguishing cell counts from the cell-day bubble metric. Normal SVG exports retain their existing defaults.
4. Updated stale author-environment/merge instructions in feature documentation, recorded validated Node24 instructions, added contribution credit and refreshed the actual static/offline distributions and ZIPs. Current test results are maintainer checks, not a claim that GitHub Actions executed them.

Original teammate implementation is credited in README and CREDITS_AND_AI_ASSISTANCE.md. Maintainer corrections and release work were performed by Codex under owner authorization; original Git authorship remains in the merge history.

## Verification

| Check | Result | Evidence under evidence/pr2-integration/ |
|---|---|---|
| Dependency installation | PASS | npm-ci.log |
| Frontend tests | 19/19 PASS: four original +eight historical +six overlap +one new availability regression | frontend-tests.log |
| TypeScript and production build | PASS; existing bundled-data size warning only | typecheck.log, build.log |
| Python integrity/regression tests | 12/12 PASS | python-tests.log |
| Final packaging | PASS | package.log |
| Independent occupied-cell comparison | 302 months /7543 grid-month rows; coordinates, per-sensor counts, categories and totals match canonical CSV exactly | independent_check.json |
| New overlap UI/combined feature checks | 35 hosted +35 offline PASS | browser_summary.json, browser-review.log |
| Existing browser acceptance checks | 39 hosted +39 offline PASS, including CSV and original SVG verification | regression-gate.log, browser_summary.json |
| Overlap CSVs | Both modes: all696 November cells and empty-month exports checked against canonical data | representative hosted-overlap.csv, hosted-empty.csv |
| Overlap SVGs | Both modes:696 category markers; visible legend/caveat, AI disclosure and occupied-cell metadata verified; standalone export visually inspected | hosted-overlap.svg, export-preview.png |
| Protected inputs | All ten SHA-256 values unchanged | protected_hashes.json |

Initial full checks passed before the SVG-context fix. Affected frontend tests/typecheck/build/package and browser suites were rerun after that fix; delta_checks.json records the final build/check commands. Earlier raw logs remain locally outside the public checkout, including initial logs. The final browser run covers desktop/mobile widths320/360/390/768/1440, observed/estimated transitions, clearing disabled overlap, zoom/reset/expand/Escape, accessible table, retained historical panel, missing/quiet months and July outage warning. No JS exceptions or external runtime requests were observed. This is not a complete accessibility certification.

## Scientific interpretation retained

November2018:414 both,46 MODIS-only,236 VIIRS-only occupied cells; MODIS735 and VIIRS1220 cell-days. September2020:320/129/176 cells. July2024:16/251/22 cells, with322/58 cell-days and documented coverage limitations. Monthly overlap may involve entirely different UTC days and overpasses. Single-sensor-only cells do not prove missed wildfires. No modeled VIIRS spatial positions are generated. Before observed VIIRS availability, comparison is disabled; raw MODIS maps remain available.

The harmonization model, parameters, source archives, geographic filtering, generated bundle and scientific products are unchanged. All Python pipelines, root MIT license and deployment workflow are unchanged in this PR #2 integration. Existing model limitations, worse MAE than median baselines, unvalidated early transfer and heuristic bands remain disclosed.

## Release and approval boundary

Refreshed release/site, offline HTML, static ZIP, source ZIP and manifest carry the combined features and existing approved MIT/third-party notices. The established Source_2026-11-14.zip filename is retained for links, with contents refreshed on15November and identified by current hashes. ZIP CRC and manifest hashes are verified after generation.

Source publication/merge is authorized by the owner. Website deployment and NASA submission are not part of this integration and were not performed. Demo identity, portal eligibility, work/idea chronology and separate asset-rights confirmations remain owner matters.
