# GeoNexus_M - NASA project form copy

## Project Name
FireLens Butte - Historical Satellite Hotspot Explorer

## High-Level Project Summary
FireLens compares historical NASA FIRMS MODIS and VIIRS S-NPP hotspot activity in Butte County, California. A shared 1-km cell-day calendar, observed maps and downloadable evidence expose sensor differences; early MODIS-based estimates are explicitly marked as exploratory.

## Project Demo Link
https://raw.githubusercontent.com/bilalfarid-1/firelens/main/docs/demo/FireLens_Demo_6_Slides.pdf

Six-slide PDF, including the title slide, with GeoNexus_M and the five exact NASA roster names. Scientific and SI disclosures are retained. The optional 28-second video storyboard in demo_script.md is not a completed video.

## Final Project Link
https://github.com/bilalfarid-1/firelens

The source repository is public. Website: https://bilalfarid-1.github.io/firelens/ (HTTP200, but last verified deployment b972c9d is older than the latest tested release; manually republish main before using it as the final app link). No NASA submission has been performed in this workflow.

## Detailed Description
FireLens addresses "Harmonization of MODIS and VIIRS Hot Spots" through a retrospective web application for one fixed area: Butte County, California (GEOID 06007). Its 302-month calendar covers November 2000 to December 2025. Users select dates, inspect observed spatial activity, compare sensor measurements and same-month historical medians, inspect validation, and download CSV data or SVG figures. A self-contained offline application supports use without external runtime services.

Two teammate-contributed features extend this exploration. Historical Activity Insight compares an observed month with other same-calendar-month VIIRS observations from 2013-2023, excluding the selected year; its elevated-activity labels are descriptive heuristics, not statistical significance tests or risk alerts. Sensor Overlap Map distinguishes cells occupied by both sensors, MODIS only or VIIRS only and exports the results. Monthly spatial overlap does not imply simultaneous observation or the same wildfire; zero retained observations do not prove a missed fire.

The pipeline independently reproduced exact county membership: 7,211 MODIS and 16,526 VIIRS source detections. Retaining source type 0 gives 7,105 and 16,450 detections. Distinct sensor/grid-cell/UTC-day combinations produce occupied 1-km cell-days on an EPSG:3310 grid and 7,543 observed grid-month rows. These are satellite hotspot activity measures, not unique wildfire events, burned area or real-time forecasts. Shared aggregation does not equalize sensor sensitivity, overpass timing or observation coverage.

A statistical crosswalk trained on 2013-2023 supplies exploratory estimates before the observed VIIRS series begins in February 2012, including a partial January transition. Its 2024-2025 held-out MAE against VIIRS is approximately 20.3335 cell-days/month, compared with 32.000 for raw MODIS, 19.625 for the training median and 18.9583 for the calendar-month median. The crosswalk is not the best MAE baseline. VIIRS is not wildfire ground truth; early backward transfer is unvalidated and residual bands are heuristic.

July 2024 illustrates a difficult comparison: MODIS 322 versus VIIRS 58 cell-days, overlapping a documented S-NPP outage. We cannot infer how many detections were missed. Mixed MODIS source version strings remain an unresolved provenance limitation. The application supports education and reproducible historical inspection; sensor-independent truth, operational warning and forecast skill are not established.

## Use of Super Intelligence (SI)
ChatGPT/Codex assisted processing and application code, UI design translation, source inspection, testing, exports and documentation. The supplied editable prototype used Figma Make. NASA's original observations were not AI-generated; derived products were computed using assisted processing code. Assistance is acknowledged in source/provenance metadata, the interface, exported SVGs and demo credits. The PDF uses actual application screenshots, not synthetic event imagery. No synthetic voice/video was produced.

GitHub contributor MuhammadSaif700 supplied Historical Activity Insight (PR #1) and Sensor Overlap Map (PR #2); both original commits are retained. Codex independently checked and integrated the contributions, corrected demonstrated issues, and rebuilt the releases. This does not establish the tools used by that contributor; the team should confirm any additional SI use.

TODO OWNER: state truthfully who originated the solution idea and which design/scientific decisions the team independently reviewed. Do not paste this TODO as an attestation or claim an unverified human-only origin.

## NASA Data
- NASA Earthdata FIRMS: https://www.earthdata.nasa.gov/data/tools/firms
- Preserved FIRMS MODIS Terra/Aqua request 848030 and VIIRS S-NPP request 848031.
- MODIS attribute documentation: https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_MODIS_Firehotspots.html
- VIIRS attribute documentation: https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html
- NASA MODAPS S-NPP outage records: https://modaps.modaps.eosdis.nasa.gov/services/production/outages_suomi_npp.html

## Space Agency Partner Data and Other References
No additional space-agency-partner dataset is claimed.
- California county geometry: https://publish.data.ca.gov/dataset/california-county-boundaries-and-identifiers
- React/ReactDOM (MIT), Lucide (ISC), Inter (SIL OFL); existing notice texts in frontend/public/licenses.
- Scientific and build dependencies: requirements.txt, requirements_harmonization.txt, frontend/package-lock.json and evidence/final/npm_dependency_inventory.json.
- Design/prototype assistance: supplied Figma Make prototype; prior AQI Predictor interface informed navigation and numerical hierarchy. Prototype/material rights require owner confirmation.
- See references.md and RIGHTS_INVENTORY.md. Team-owned original code and associated documentation use the approved root MIT License, Copyright (c) 2026 FireLens Butte contributors. NASA data, California geometry and third-party assets retain separate rights; unresolved permissions remain in RIGHTS_INVENTORY.md.

Team composition (coordinator-reported): five registered members, three reported active contributors. The five exact displayed identities and NASA roster roles are recorded in TEAM_IDENTITY.md; remaining individual contributions and event acceptance still require confirmation. Verified GitHub contributions are documented in TEAM_CONTRIBUTIONS.md.

## Owner checklist - complete before legal declarations
- DONE: GeoNexus_M and all five exact roster names confirmed on the public NASA team page. TODO: check each member's actual acceptance status and eligibility in the authenticated portal; membership alone is insufficient.
- TODO: actual challenge-work start versus event kickoff, prior prototype history, and genuine idea origin. Commit/upload dates alone are insufficient.
- DONE: MIT approved and applied to team-owned original code/documentation. TODO: confirm remaining prototype, geographic-data and third-party asset rights.
- DONE: demo identity placeholders replaced and the six-page PDF prepared with exact roster names. Verify the public PDF after the final source push, and manually republish the tested main release before selecting the live app link.
- TODO: verify the portal's controlling deadline and any earlier Multan judging cutoff. Published general deadline: Sunday 15 November 2026, 23:59 Local Event time; for confirmed Multan, 23:59 PKT (UTC+5). Do not apply Islamabad's deadline.
- TODO: review every required portal field, English content, permitted likenesses, references and truthful SI/originality declarations.
- NASA has NOT been submitted. Save Progress is not submission. Only the authorized owner should select Submit for Judging and retain successful confirmation after explicit approval.

## Verified team identity

Team: GeoNexus_M. Team Owner: Muhammad Zargham Khan (@zargham_khan). Other roster members: Muhammad Sachal Khalid (@sachal990); Muhammad Bilal Farid (@thebilalfarid); muhammad Saif (@fias); Muhammad Bilal Zafar Khan (@mbzk). Preserve this capitalization. Membership/event association is confirmed; individual acceptance status and unrelated contributions are not inferred.
