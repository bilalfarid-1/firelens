# Requirement coverage — local release

This matrix separates implemented functionality from scientific and submission limitations. The full challenge Details/Resources and current submission guide were subsequently verified in Windows Edge. Correct challenge URL: https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/ . See OFFICIAL_REQUIREMENTS.md and evidence/Project_Submission_Guide_snapshot.yml. Account-specific submission remains a team action.

| Requirement / gate | Status | Implementation / evidence |
|---|---|---|
| Fixed Butte County GEOID06007 | PASS | Exact polygon row-level audit; unchanged county inputs |
| Original NASA data/provenance preserved | PASS | evidence/release/release_integrity.json;65original files and10protected working files unchanged |
| Explicit MODIS/VIIRS harmonization | PARTIAL for scientific objective | Shared EPSG3310 cell-day support; overlap-trained exploratory crosswalk; observed/model flags |
| Historical activity calendar | PASS |302months, Nov2000–Dec2025; disabled out-of-range months |
| Historical spatial patterns | PASS |7543observed grid-month records; separate instrument maps and cell table |
| Historical unusual/critical periods inspection | PARTIAL | Full comparison/history, same-month historical median context and July2024 coverage warning. No validated operational critical-period alert or forecast |
| Sensor differences/quality semantics | PASS for documented treatment | Type0, native confidence/daynight retained; common support does not equalize sensor sensitivity |
| Coverage completeness, July2024 | PARTIAL | NASA outage evidence; no observation denominator or reconstruction |
| Uniform MODIS version provenance | PARTIAL |6.03/61.03raw codes preserved; exact interpretation unresolved |
| Model evaluation | PASS for reproduction |132train/24test months; all five baselines shown; agreement with VIIRS is not wildfire truth |
| Early-year extrapolation / calibrated uncertainty | PARTIAL | Explicit estimates, heuristic bands and Terra-only caveats; independent truth validation unavailable |
| Complete downloads | PASS | Six download actions and custom ranges checked in both modes; every CSV row compared with canonical products |
| Design/mobile interactions | PASS for checked behaviors |78browser assertions across hosted/offline;360/390/768/1440overflow checks; actual screenshots |
| Offline/localhost/subdirectory hosting | PASS | Actual Edge file URL withHTTP blocked; local /site/ navigation with relative assets; no external runtime requests |
| Accessibility | PARTIAL | Semantic controls/tables, focus treatment, keyboard navigation, drawer focus checks;7key token contrasts pass4.5:1. Full manual screen-reader audit not performed |
| NASA resource use/citations | PASS for source match | Official challenge Resources explicitly lists FIRMS; archive source and citations match |
| Public project/demo links | NOT TESTED | Hosting folder and source ZIP prepared; not published |
| Team details / portal submission | NOT TESTED | Multan virtual confirmed by user; team fills names, actual fields, demoURL and submission receipt |
| Exact local judging cutoff | PARTIAL | Global15Nov23:59local published; separate Multan cutoff unverified |

Do not describe this matrix as complete NASA eligibility certification. It establishes what was built/tested and exposes remaining checks. No requirement is silently converted into an accuracy claim or unauthorized publishing action.
