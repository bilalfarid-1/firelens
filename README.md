# FireLens Butte

Historical MODIS/VIIRS hotspot explorer for Butte County, California (GEOID06007), NASA Space Apps2026. Retrospective research prototype; no operational fire alerting.

## Open the finished interface

- Double-click `release/FireLens_Butte_Offline.html`: complete app, local fonts and all data in one HTML file.
- Host `release/site/` as a static directory. Local example from this folder: `python -m http.server 8000 --directory release/site`, then visit http://localhost:8000 .
- `web/` is the preserved earlier MVP interface; the redesigned release is built from `frontend/`.

## Reproduce the release

Use Python3.12+ and Node24. In PowerShell from this folder:

```powershell
python -m pip install -r requirements.txt -r requirements_harmonization.txt
python pipeline/prepare_frontend.py
Push-Location frontend
npm ci
npm run typecheck
npm test
npm run build
Pop-Location
python pipeline/package_site.py
python -m unittest discover -s tests -v
```

Original sources and all county CSVs remain unchanged. Optional scientific regeneration uses `python pipeline/harmonize.py` then `python pipeline/sensitivity.py`; run the adapter/build commands above afterward. `pipeline/build_offline.py` builds only the earlier web interface, not the redesigned release.

## Evidence and limitations

County source rows7211/16526 MODIS/VIIRS; type0 rows7105/16450.302months,7543grid-month records. Exact official polygon membership and every monthly common-grid count were independently reproduced. See `evidence/independent_results.json`, `docs/RELEASE_STATUS.md` and `docs/REQUIREMENTS_MATRIX.md`.

Crosswalk MAE20.334 against VIIRS in2024–2025, versus unadjusted MODIS32.000. Training median/calendar-month median baselines achieve19.625/18.958; the crosswalk is not the best MAE method. VIIRS is not wildfire ground truth. Early estimates are unvalidated backward transfers; residual bands are heuristic. July2024 overlaps documented S-NPP outages. MODIS raw version strings6.03/61.03 remain unresolved provenance; avoid claiming a uniformly confirmed C6.1 archive.

NASA data attribution, third-party licenses and AI disclosure are included in app Method/Sources and docs/submission.md. Source is publicly published on GitHub. Website deployment and NASA submission have not been performed. See docs/HOSTING.md for the deployment handoff.

## GitHub source and free hosting

Project repository: https://github.com/bilalfarid-1/firelens . The tested offline app is `release/FireLens_Butte_Offline.html`; regenerated static and source ZIPs are in `release/`. See [GitHub Pages setup](docs/GITHUB_HOSTING.md) for the prepared manual-only workflow. The live website has not been deployed. Local app checks do not guarantee NASA acceptance; see [requirement coverage](docs/REQUIREMENTS_MATRIX.md) and [verified official rules](docs/OFFICIAL_REQUIREMENTS.md).

## Credits and licensing

See [credits and AI assistance](docs/CREDITS_AND_AI_ASSISTANCE.md) and [final compliance](docs/FINAL_NASA_COMPLIANCE.md). An explicit license for team-owned original code awaits owner approval; third-party notices remain in frontend/public/licenses.
