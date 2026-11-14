# Official form draft — owner review required

Project Name: FireLens Butte — Historical Satellite Hotspot Explorer

High-Level Summary: FireLens compares historical NASA FIRMS MODIS and VIIRS S-NPP hotspot activity in Butte County, California. A shared 1-km cell-day calendar, observed maps and downloadable evidence expose sensor differences; early MODIS-based estimates are explicitly marked as exploratory.

Final Project Link: https://github.com/bilalfarid-1/firelens (public source). Website: NOT DEPLOYED; do not substitute the expected Pages URL until verified.

Project Demo Link: public demo: https://github.com/bilalfarid-1/firelens/blob/main/docs/demo/FireLens_Demo_6_Slides.pdf — six-slide PDF rendered from real application screenshots, visually inspected. Anonymous raw PDF access verified HTTP 200 after push; see audit/PUBLIC_SOURCE_CHECK.md. A 28-second recording storyboard is also available in demo_script.md.

Use of SI: ChatGPT/Codex assisted code, design translation, testing and documentation; the supplied prototype used Figma Make. Original NASA observations were not AI-generated. The team must add a truthful account of idea origin and actual independent review. Do not assert that SI originated no ideas without confirming the team's history.

NASA Data: FIRMS MODIS Terra/Aqua archive request 848030 and VIIRS S-NPP request 848031; historical detections, not unique wildfire events. See references.md for exact attribute documentation.

Space Agency Partner Data and Other References: No additional agency partner dataset is claimed. California official county geometry; NASA MODAPS outage documentation; React, Lucide, Inter and scientific/frontend libraries listed in requirements and package-lock. See references.md and credits.

Team: TODO accepted roster of all three members; owner confirms Multan Local Event, virtual participation. No credentials belong in this document.

Owner checklist: confirm work-start chronology and idea origin; approve license; verify prototype rights; fill public demo link; inspect all required account fields; acknowledge terms only if true; final Submit for Judging requires separate authorization. General Multan deadline: 15 November 2026 23:59 PKT; check authenticated portal/local announcements.

Judging: Impact—historical data inspection for learners/researchers; Creativity—paired sensor views and offline evidence; Validity—independent aggregation replay with limitations; Relevance—historical harmonization calendar for one county; Presentation—working interface, exports and concise demo. No operational prediction or guaranteed outcome is claimed.

Detailed description and references follow (review wording before pasting):

> Current official-guide verification: read OFFICIAL_REQUIREMENTS.md, including SI/AI attribution, media rules, team eligibility and exact public form fields.

# Submission copy â€” team review required

## Project title
FireLens Butte â€” Historical Satellite Hotspot Explorer

## Summary
FireLens is a reproducible web application for exploring historical MODIS and VIIRS S-NPP hotspot detections in Butte County, California. It places source-coded vegetation detections on a shared1km grid and UTC-day support, compares sensor observations, and estimates an exploratory VIIRS-reference monthly indicator before VIIRS availability. A302month calendar, observed detection map, comparison charts, seasonal context, evaluation and CSV exports make the evidence inspectable. A self-contained offline version supports demonstrations without a network.

## NASA data and method
Original NASA FIRMS request archives848030 and848031 are preserved. Exact official California county membership independently matches7211MODIS and16526VIIRS source rows; type0 selection retains7105/16450. Distinct sensor/cell/UTCdate pairs remove same-day multiplicity. Both sensors still differ in footprint, overpasses, thresholds and coverage. The robust log crosswalk is fitted on2013â€“2023 with whole-year cross-validation;2024â€“2025 are excluded from fitting/selection by the supplied code.

## Evaluation and limitations
Held-out sensor-agreement MAE is20.334cell-days/month versus32.000 for unadjusted MODIS. Simple training median baselines achieve lower MAE19.625/18.958; no best-model claim is made. July2024 has322MODIS versus58VIIRS cell-days and overlaps documented S-NPP outages. Early-period model transfer is unvalidated; bands are heuristic, and coverage completeness is not quantified. Mixed MODIS version strings remain a provenance limitation. This is a historical research/education tool, not real-time warning, wildfire-event inventory or burned-area estimation.

## Challenge fit
One fixed area of interest, explicit sensor harmonization, historical activity calendar, observed spatial comparison, seasonal context and visible unusual sensor disagreement. These support historical inspection by students/researchers and a basis for future coverage-aware work; emergency readiness or forecast skill is not established.

## Technology
Python/NumPy/pandas/SciPy/PyProj/Shapely/Matplotlib scientific pipeline; React/TypeScript/Vite/Tailwind frontend; native SVG charts/map; local JSON/CSV/GeoJSON. No external runtime data services. Cite source and dependency licenses.

## Sources
- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- MODIS attributes: https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_MODIS_Firehotspots.html
- VIIRS attributes: https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html
- S-NPP outages: https://modaps.modaps.eosdis.nasa.gov/services/production/outages_suomi_npp.html
- California boundary: https://publish.data.ca.gov/dataset/california-county-boundaries-and-identifiers

## AI and third-party disclosure
AI tools assisted code generation, design translation, source synthesis, testing and documentation. The supplied editable prototype was generated using Figma Make. The team remains responsible for review and final claims. Inter is SIL OFL; Lucide is ISC; React is MIT. NASA observations and California geometry are credited separately; this project is not endorsed by NASA.

## Team completes before submission
Team name/member names; final application URL; reproducible source/archive URL; demo URL; exact portal fields and mandatory disclosures; anonymous-link access check; manual submission/status receipt. Team owner registered event: Multan,Pakistan, virtual participation (user supplied). Official global page states15Nov2026 23:59local; use23:59PKT subject to portal. Separate Multan local judging cutoff and complete current guide remain unverified. Do not apply Islamabad instructions. Nothing has been published or submitted.
