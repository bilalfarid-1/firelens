# Current scientific method

Butte County,GEOID06007. Original FIRMS MODIS Terra/Aqua and VIIRS S-NPP archives remain unchanged. Full-resolution official polygon replay independently matches all original filtered rows. The map displays a simplified outline; membership uses detection centers, not footprint intersection.

Retain source type0 presumed vegetation detections, native confidence and both day/night. Assign longitude/latitude using always_xy to EPSG3310; floor projected coordinates/1000 with origin0. Count distinct sensor,UTC acquisition date,grid-x,grid-y pairs monthly. Cell-days are not unique wildfires, burned area or incident severity. Nominal sensor pixel sizes differ, and resampling does not equalize detection sensitivity or coverage.

Fit robust soft_l1 log1p monthly regression on2013–2023. Compare intercept/slope and annual-harmonic candidates by leave-entire-year-out log error; simpler selected. Evaluate2024–2025 excluding those years from fitting/model selection in code. Development-history independence cannot be proven from the source snapshot. No model was reselected after audit. Crosswalk MAE20.334, medianAE6.543, logAE.3408; naiveMAE32.000, ratio32.850, training median19.625, calendar-month median18.958. These measure agreement with an imperfect VIIRS reference.

Indicator uses observed VIIRS fromFeb2012 onward and MODIS-based estimates earlier. Jan2012 is partial and modeled. Terra-only early years differ; flags includeJan–Jun2002. Heuristic bands use90thpercentile calibration-era leave-year-out absolute log residuals; no guaranteed probability coverage. The backward transfer is not independently truth-validated and can predict positive counts from zero MODIS detections. The2012 seam remains.

July2024 observations322MODIS/58VIIRS; model diagnostic~340.8. MODAPS documents outagesJul9–16 andJul24–29, overlappingJul25–26 missing VIIRS records. No missed-detection total can be inferred. Do not remove this month or relabel missing coverage as known no-fire.

Version caveat: county MODIS source rows contain6093 coded6.03 and1118 coded61.03. Exact uniform C6.1 provenance unresolved; preserve codes and avoid overclaim. See evidence/independent_results.json, docs/INDEPENDENT_AUDIT_UPDATE.md and sources linked in submission.md.

Seasonal panel reports median observed VIIRS monthly cell-days by calendar month over2013–2023; it is descriptive historical context, not anomaly certification or future risk. Scientific outputs remain in products/; frontend consumes them without fitting models.
