# Historical Activity Insight - PR #1 integration

Owner-authorized integration on 15 November 2026. Main baseline32131ff02cc2a764dab62bfe32f8be82462bc414; original teammate commit3c124d346a9bbe9c20a85bcebc2f7d736e0e025b retained as the second merge parent. PR: https://github.com/bilalfarid-1/firelens/pull/1 . The contribution is attributed to GitHub account MuhammadSaif700; no unverified real-world identity or unrelated contribution is assigned. Codex performed independent verification, documentation corrections and release integration.

## Changes and resolved findings

- Integrated the teammate's feature, CSS, calculation helper and eight new tests without changing its scientific comparison logic. The frontend test command now includes all test files.
- Corrected the feature document's stale/ambiguous build-status note. Prior author environment limitations and maintainer verification are distinguished.
- Explained why the new median excludes the selected year (November2018=28), whereas existing fixed-period Seasonal context includes it (median33). Retained retrospective/heuristic labels and July coverage warning.
- Rebuilt release/site and the self-contained offline HTML, and regenerated static/source ZIPs and their SHA-256 manifest. The feature is now in shipped app artifacts, not only source.
- Release packager copies the existing approved MIT license into the static site and embeds its notice in offline HTML. This is a distribution-notice correction, not a new license choice or scientific algorithm change. Third-party/data rights remain separate.
- Added explicit contribution credit to README and credits. No additional human contributions or model authorship are inferred.

## Verification

| Check | Result | Evidence |
|---|---|---|
| npm ci | PASS | evidence/pr1-integration/npm-ci.log |
| npm test | 12/12 PASS: four existing + eight new | frontend-tests.log |
| npm run typecheck | PASS | typecheck.log |
| npm run build | PASS; existing large bundled-data warning | build.log |
| Python unit/integrity tests | 12/12 PASS | python-tests.log |
| Static/offline packaging | PASS; final MIT distribution notices checked | package.log |
| New feature browser checks | 23 hosted +23 offline PASS | browser_summary.json |
| Existing browser regression gate | 39 hosted +39 offline PASS | browser_summary.json and regression logs |
| Downloads / SVGs | All original regression CSV comparisons and SVG disclosure parsing PASS; feature-walkthrough monthly downloads equal canonical rows | regression-gate.log |
| Protected source/result hashes | All ten unchanged | protected_hashes.json |
| Independent feature comparison | Previously reviewed302 records /156 eligible observations, zero mismatches; feature module and bundle bytes unchanged from that verified head | independent_feature_check.json |
| Release ZIPs / manifest | CRC and SHA-256 checks performed after regeneration | release/release_manifest.json |

Browser coverage includes unavailable and early estimated data, quiet months, selected-year exclusion, notable-month navigation, July coverage warning, model baseline disclosure, mobile navigation and widths360/390/768/1440. No JS exceptions or external runtime requests observed. This is not a full accessibility certification or scientific ground-truth validation. Screenshots visually reviewed during the independent review; rebuilt code retains those exact feature/component and data bytes.

The new3x category is a descriptive convention, not a significance test, fire risk prediction or sensor-independent truth. July2024 remains58 observed VIIRS versus322 MODIS; no missing-detection count is inferred. Existing model scores and limitations remain unchanged. Scientific processing, original datasets, products, model parameters, root license and deployment workflow are unmodified.

## Packaging and publication boundary

The source ZIP retains its established filename FireLens_Butte_Source_2026-11-14.zip for existing links; its contents were refreshed during this15November integration and current bytes are identified by release_manifest.json. The static ZIP includes its LICENSE and supporting notices. No NASA observations were downloaded or regenerated.

Source publication is authorized by the owner. Website deployment and NASA submission are not part of this integration and were not performed. Demo identities, private portal eligibility, work/idea chronology and separate asset rights remain owner-confirmed matters. No contribution credit implies those questions are resolved.
