# NASA FIRMS Butte County — County filtering and quality report

## Verdict
**PASS — county filter using full-resolution official county boundary.**

Boundary: California Department of Technology, **CENSUS_GEOID 06007**, source: https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/California_County_Boundaries_and_Identifiers_Blue_Version_view/FeatureServer/1/query?where=CENSUS_GEOID+%3D+%2706007%27&outFields=%2A&returnGeometry=true&outSR=4326&f=geojson
Boundary mode: `exact_official_polygon`; computed area ≈ 1677.8 square miles.

## Raw detection counts
| Dataset | In original download rectangle | Inside Butte County | Outside county | Near boundary (within 25 m) |
|---|---:|---:|---:|---:|
| MODIS | 19,993 | 7,211 | 12,782 | n/a |
| VIIRS_SNPP | 51,944 | 16,526 | 35,418 | n/a |

### Selected year comparison (COUNTY, UNHARMONIZED)
| Year | MODIS | VIIRS S-NPP |
|---|---:|---:|
| 2012 | 57 | 227 |
| 2018 | 1,177 | 4,961 |
| 2020 | 1,101 | 4,587 |
| 2021 | 470 | 1,412 |
| 2024 | 607 | 614 |
| 2025 | 201 | 780 |

## Quality and scientific interpretation
- All original NASA ZIP files are unchanged. Both ZIP CRC checks passed and SHA-256 values are in `processing_manifest.json`.
- The filtering removes observations outside the official Butte County polygon; no counts are automatically corrected for different sensor resolution or overpass times.
- A row is a satellite-detected thermal anomaly, **not** a verified unique wildfire.
- Zero monthly rows mean **no hotspot records returned**; that is **not proof of complete satellite observation coverage**.
- VIIRS S-NPP did not operate in the pre-2012 part of the MODIS record, so the pre-2012 VIIRS cells remain blank.
- Quality fields are instrument-specific: MODIS confidence is numeric and VIIRS confidence is categorical. They are not equivalent.
- `type` values are preserved without exclusion pending source-specific documentation; raw counts may include non-wildfire thermal sources.
- High-fire years can overwhelm a naïve regression. Reserve held-out fire seasons/years for validation before calibration.

## Next stage
1. Run full-resolution boundary verification (if needed), inspect monthly pattern and sensor-specific `type` and confidence fields.
2. Develop a common spatial and temporal aggregation; investigate overpasses, event recurrence and low-activity years.
3. Calibrate only if supported by overlap data, and validate on held-out years; do not interpret raw ratios as corrections.
4. Build web calendar and date-range CSV export based on verified inputs.
