# Current local release - 15 November 2026

Software release: PASS for recorded checks. NASA submission readiness: PARTIAL; owner confirmations remain. Latest application integration: 6ae8aedaa092c312f02432fb8617ca061c422735.

## Included functionality

The four-view React application includes the 302-month calendar, observed sensor maps, comparisons, model validation and CSV/SVG downloads. Historical Activity Insight (PR #1) and Sensor Overlap Map (PR #2) are integrated, with original teammate commits retained and explicit contribution credit. The updated offline HTML, static website and ZIPs are in release/. No runtime backend or NASA API key is needed.

## Recorded verification

- 19 frontend tests and 12 Python integrity/regression tests passed.
- 70 overlap-specific hosted/offline browser checks and 78 existing acceptance checks passed.
- Independent overlap comparison: all 302 months and 7,543 grid-month rows matched canonical CSV values.
- Overlap CSV exports, SVG legend/caveats/metadata and mobile layouts checked; protected input hashes unchanged.
- TypeScript, build, packaging and ZIP integrity passed. The existing bundled-data size warning remains; this is not a runtime error.

Commands, logs and limits: [PR2_INTEGRATION.md](../audit/PR2_INTEGRATION.md), [evidence](../evidence/pr2-integration/). These are prior recorded results, not new tests run for this documentation update. They are not a scientific ground-truth or full accessibility certification.

## Rights and remaining owner actions

MIT is approved and applied to team-owned original source code/documentation. Third-party, prototype and geographic-data permissions remain separately documented in RIGHTS_INVENTORY.md. Team composition is coordinator-reported as five registered members and three active contributors; see TEAM_CONTRIBUTIONS.md for verified GitHub contributions and unresolved identities.

The demo PDF is six slides with team identity placeholders. The source and demo draft are public. GitHub Pages remains unapproved; no website deployment or NASA submission occurred in this workflow. Owner must confirm identities/roster, true idea/work chronology, remaining rights, portal deadline and legal attestations; see OWNER_ACTIONS.md and SUBMISSION_READY.md.

Scientific limitations remain: VIIRS is not ground truth; sensors/coverage differ; July2024 outages affect comparison; early transfer and heuristic bands are unvalidated; median baselines beat crosswalk MAE; mixed MODIS source version strings remain unresolved. Monthly overlap is not simultaneous detection or a wildfire-event match.
