# Final manual deployment handoff - 15 November 2026

Live website: https://bilalfarid-1.github.io/firelens/ (HTTP200). Last verified successful Pages run43702528689 deployed b972c9d, so the live application is stale. Current tested release assets contain both Historical Activity Insight and Sensor Overlap Map. Their hashes match release_manifest.json and recorded PR #2 acceptance logs request the current index-BE3nu07C.js bundle. No new scientific audit or application build was required for the final presentation update.

## Republish the tested release manually

1. Open https://github.com/bilalfarid-1/firelens/actions/workflows/pages.yml .
2. Select **Run workflow** > branch **main** > **Run workflow**. The workflow is named **Publish FireLens to GitHub Pages (manual)**.
3. Wait for the deploy job to complete successfully. It uploads the committed release/site directory; it does not retrain or rebuild science. If GitHub requests environment approval, the repository owner reviews and approves the github-pages deployment.
4. Open the successful run's github-pages URL in a fresh/private browser tab. Reload to avoid cached old assets.
5. Confirm November2018 shows VIIRS1220 / MODIS735, Historical Activity Insight is present, and the map offers **Overlap** (414 both /46 MODIS-only /236 VIIRS-only). Confirm July2024 warnings, early unavailable VIIRS and downloads remain. The current tested JavaScript asset is index-BE3nu07C.js; the stale live asset was index-Bk1xKUw8.js.

The website URL does not change after redeployment. No Pages settings change is needed for the existing working deployment. The owner must verify the new workflow SHA/status; a source push alone does not republish this manual workflow. No deployment was triggered by this documentation task.

## Submission links

- Demo PDF: https://raw.githubusercontent.com/bilalfarid-1/firelens/main/docs/demo/FireLens_Demo_6_Slides.pdf
- Latest source/final-project fallback: https://github.com/bilalfarid-1/firelens
- Live app, after refreshing/verifying: https://bilalfarid-1.github.io/firelens/
- NASA team: https://www.spaceappschallenge.org/2026/find-a-team/geonexus_m/?tab=members

Remaining unverified matters: individual accepted-versus-waitlisted event status; actual idea origin and challenge-work chronology; unresolved prototype/geographic-data/third-party rights. Public roster membership does not settle these. Source MIT is approved/applied; original NASA observations and separate assets are not relicensed. NASA legal declarations and Submit for Judging remain owner actions; Save Progress is insufficient.

The recorded general cutoff is15November2026 at23:59 registered-event local time, hence23:59PKT for Multan; private portal/local cutoff remains unverified. Use the controlling portal deadline. No NASA submission occurred in this workflow.
