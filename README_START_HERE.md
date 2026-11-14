# NASA Space Apps 2026 — Butte County dataset: next stage

## Status

**Stage: County-level raw data filtering completed; scientific harmonization NOT yet attempted.**

Source archives: NASA FIRMS requests `848030` (MODIS C6.1) and `848031` (VIIRS S-NPP C2), requested rectangle (-122.10, 39.25, -121.03, 40.18), 2000-11-01–2025-12-31.

County: Butte County, California, Census GEOID `06007`. Source: [California Department of Technology, California County Boundaries and Identifiers](https://publish.data.ca.gov/dataset/california-county-boundaries-and-identifiers).

The data was ingested and separated by county membership. **Final raw county counts:** 7,211 MODIS and 16,526 VIIRS S-NPP detections. These are **not unique fires**, do not imply one instrument is more accurate, and are not harmonized.

## Directory

- Two original NASA ZIP files: unchanged from uploads
- `process_butte_county.py`: reproducible county processing; defaults to fetching the full-resolution government boundary over the internet
- `Butte_county_boundary_polyline_approx.txt`: offline simplified county polygon encoded at 5 decimal places
- `results/Butte_County_Data_Quality_Report.md`: methods, data counts, caveats
- `results/Butte_County_Boundary.geojson`: OFFLINE APPROXIMATION of county boundary, not full geometry
- `results/full_resolution_edge_verification.json`: exactly 117 detections near simplified boundary audited against the original full-resolution government geometry; three VIIRS source rows corrected
- `results/MODIS_Butte_Raw_Detections.csv`, `results/VIIRS_SNPP_Butte_Raw_Detections.csv`: county-filtered source observations, original fields preserved
- `results/Butte_County_Monthly_Raw_Detections.csv`: month-by-month counts with VIIRS pre-2012 BLANK (not zero)
- `results/Butte_County_Yearly_Raw_Detections.csv`: yearly raw detection counts
- `results/processing_manifest.json`: source checksums and processing metadata

## Running on your Windows PC with Codex

1. Unzip the package into a new project folder.
2. Open the folder in Codex (or VS Code with Python installed).
3. From that folder, install `py -m pip install -r requirements.txt` (or `python -m pip install -r requirements.txt`).
4. To independently re-run using **original full-resolution county geometry**, run:

   ```powershell
   py process_butte_county.py
   ```

   This accesses the official California GIS query over the internet, saves the exact polygon into `results/Butte_County_Boundary.geojson`, and recomputes all county counts.

5. If the government GIS service is unreachable, run the **offline audited fallback**:

   ```powershell
   py process_butte_county.py --local-approx
   ```

   The fallback polygon is simplified to about 11m tolerance; 117 edge candidates were checked against the original 2,911-vertex polygon and 3 correction overrides were stored in the script. The raw counts have been audited, but the included polygon file itself remains approximate. For publication/mapping, run exact online mode when possible.

The input original ZIP files remain unchanged. The scripts write only to `results/`.

## Your next *scientific* phase (different from cleaning)

1. Examine `results/Butte_County_Monthly_Raw_Detections.csv` and group observations into well-defined, common temporal/spatial units. Do not merge individual MODIS and VIIRS rows as equivalent.
2. Study sensor resolutions, overpass timing and multiple detections per fire; inspect confidence, FRP, detection `type`, and missing-observation/coverage issues. Preserve all raw records.
3. Choose a transparent harmonization method and explicitly document its assumptions. Avoid arbitrary global scaling (for instance, just multiplying all MODIS counts by a constant).
4. Validate on held-out years/seasons. Report error metrics and uncertainty, and clearly distinguish *detected hot spots* from confirmed fire events.
5. Build the interactive historical fire calendar and a CSV export using **verified** processed data; label model outputs clearly.

**Important:** The currently completed work establishes geographic and file integrity, not scientific calibration accuracy. This package contains no AI/ML trained model.
