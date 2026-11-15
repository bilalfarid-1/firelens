# FireLens: MODIS vs VIIRS monthly grid-cell overlap map

## New feature

The **Overlap** button on the Explore page's County activity map presents the
retained NASA FIRMS observations on the existing shared 1-km grid. For the
selected UTC month, each occupied cell belongs to exactly one category:

- **Both sensors (purple):** positive MODIS and positive VIIRS S-NPP cell-day counts.
- **MODIS only (orange):** positive MODIS, zero retained VIIRS cell-days.
- **VIIRS only (blue):** positive VIIRS, zero retained MODIS cell-days.

The map displays each cell at its precomputed approximate geographic center,
using the existing verified county polygon and no newly modeled locations.
Bubble size reflects the larger of the two observed counts in overlap mode.
The below-map legend displays grid-cell counts, while **About this map** lists
per-cell values. **Export overlap CSV** saves those observed values and their
category; SVG export includes the overlap depiction.

## Interpretation and limitations

**Monthly overlap is not co-detection of a fire.** The two instruments may have
observed the cell on completely different UTC days or at different overpass
times. A zero retained count may reflect lack of detection or satellite
coverage; **MODIS-only** and **VIIRS-only** do not prove an instrument missed a
wildfire. These are detected cell-days, not incident counts, burned area,
fire footprints, exposure, or emergency risk.

The Overlap button is disabled before observed VIIRS S-NPP monthly data begin
in February 2012. MODIS-based modeled monthly estimates are never interpreted
as observed VIIRS map locations. For July 2024, the known S-NPP availability
issues make the spatial contrast particularly coverage-sensitive: do not
interpret VIIRS-only/MODIS-only counts as fully observed differences.

## Reproducible check

From `frontend/` on a machine with Node 22+ and npm dependencies installed:

```bash
npm ci
node --experimental-strip-types --test tests/*.test.ts
npm run typecheck
npm run build
npm run dev
```

Select November 2018 and **Overlap**. Expected occupied 1-km grid cells:
**414 both**, **46 MODIS-only**, **236 VIIRS-only**. Their monthly observed
cell-day totals are MODIS **735** and VIIRS **1,220**. These are separately
measured quantities: 414 shared cells does **not** mean 414 simultaneous fire
detections. For September 2020 the counts are 320 / 129 / 176; for July 2024,
16 / 251 / 22, respectively.

## Engineering and team review

- Pure calculations live in `frontend/src/lib/sensorOverlap.ts` and are verified
  against all 302 months in `frontend/tests/sensor-overlap.test.ts`.
- Only `frontend/src/components/CountyMap.tsx` and `frontend/src/index.css`
  change the app UI; no data pipeline, NASA archives, model, or generated
  bundle files are modified.
- This feature is independent of the earlier *Historical Activity Insight* PR.
  If that PR is unmerged, create this PR from upstream `main`, not from the
  first feature branch. The team can review them independently.
- The local automated unit tests were run in the authoring environment; the
  full npm typecheck/build and visual browser review require Node packages and
  should be confirmed before merging.
