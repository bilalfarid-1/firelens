# Independent audit update — 14 November 2026

This update supersedes inherited boundary and coverage claims. MVP remains a draft.

Exact official GEOID 06007 polygon: valid, 2,911 vertices, 1,677.816 square miles. Independent point membership across original ZIP rows matches supplied 7,211 MODIS and 16,526 VIIRS rows exactly. Three simplified-polygon differences and 117 near-edge records independently reproduced. Display map still uses the simplified outline.

All 604 monthly sensor checks and 7,543 grid-month rows reproduce. November 2018: 735/1,220 MODIS/VIIRS cell-days; July 2024: 322/58. No original source data changed.

Model train/CV years are 2013–2023; test 2024–2025 is excluded in the implementation. Independent model MAE 20.333504, median absolute error 6.542565, mean absolute log1p error .340840. Unadjusted MODIS MAE 32; trained ratio 32.850352. Additional training-only baselines: constant median MAE 19.625; calendar-month median 18.958333. The crosswalk improves log error but is not the best MAE model among these baselines. Do not reselect using this holdout. Historical development-time isolation cannot be proven from a single source snapshot.

NASA MODAPS lists S-NPP outages July 9–16 and July 24–29, 2024: https://modaps.modaps.eosdis.nasa.gov/services/production/outages_suomi_npp.html . July 25–26 archive absence overlaps the latter outage. This supports incomplete reference coverage; it cannot recover missing detections or prove the entire mismatch's cause. Keep all 24 evaluation months and describe scores as snapshot-specific sensor agreement.

Early MODIS transfer remains unvalidated; the fitted crosswalk predicts about 2.893 cell-days even at zero MODIS detections. Terra-only flags corrected for January–June 2002. The 2012 seam and heuristic uncertainty band remain material limits. MODIS county source versions are 6.03 and 61.03: do not describe the complete archive as uniformly C6.1 without resolving NASA version provenance.

Team registered event, supplied by user: Multan, Pakistan (virtual participation). Official global page states Sunday 15 November 2026 at 11:59 pm local time: https://www.spaceappschallenge.org/2026/ . Multan page identifies GMT+5: https://www.spaceappschallenge.org/2026/local-events/multan/ . A separate Multan local judging cutoff was not established. Islamabad instructions do not apply. Global deadline translates to 23:59 PKT, subject to the registered portal's displayed cutoff. No publishing/submission performed.

Team still supplies: team/member names, code/app public URLs if used, final video, portal-specific fields, and manual submission. Use docs/demo_script.md with the July explanation and baseline qualification above. Disclose AI assistance and cite NASA FIRMS and California boundary sources.
