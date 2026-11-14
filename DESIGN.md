# FireLens Butte — Product Design Specification

Status: proposed design brief for prototype generation, not an implemented interface.
Prepared: 14 November 2026.
Audience: the team, prototype generator, designer and subsequent implementation agent.
Scope: redesign the existing FireLens interface. Keep the scientific model, fixed geography and verified data intact.

## 1. Design objective

Create a polished satellite-data exploration workspace for **Butte County, California — GEOID 06007**. A visitor should understand what is measured, select a historical month, compare the instruments and inspect spatial activity within seconds.

The interface should feel like a carefully designed environmental research product: calm, precise, readable and useful. Give real data and controls the visual prominence currently occupied by decorative illustration and marketing copy.

Primary user task: **select a month → compare MODIS and VIIRS → inspect mapped detections → understand observation/estimate status → export evidence.**

Secondary tasks: explore long-term history, understand the model and evaluation, inspect provenance and download reproducible outputs.

Design for first-time hackathon judges, students and technically curious researchers. Use clear explanations without assuming remote-sensing expertise.

## 2. Reference and interpretation

Reference inspected: local AQI Predictor project at `C:/Users/bilal/Documents/GitHub/aqi-predictor/aqi-predictor-main`, particularly `standalone.html` and `app/static/index.html`. Its standalone desktop interface was opened in Windows Edge during the design review.

Borrow these principles:

- A persistent application navigation rail.
- Clear page identity and filters near the top.
- Strong numerical hierarchy with aligned units.
- A coherent relationship between main measurement, supporting comparisons and charts.
- Neutral surfaces, deliberate spacing and consistent component structure.

Adapt the reference for historical satellite data. Use restrained elevation and smaller corners than its clay-style cards. FireLens needs analytical clarity rather than a large AQI-style colored score card.

This specification is a reasoned application of the UI/UX Pro Max companion skill. No upstream ranking database or design-search engine was executed. Proposed accessibility targets require implementation-time measurement.

## 3. Product identity and tone

Name: **FireLens**. Regional descriptor: **Butte County**.
Page title: **Historical hotspot explorer**.
Supporting sentence: “Compare MODIS and VIIRS detections across a shared grid and historical calendar.”

Voice: direct, specific and approachable. Prefer “Satellite detections,” “Observed VIIRS,” “Estimated from MODIS,” “Coverage limitation” and “Download monthly CSV.”

Avoid grand claims, futuristic marketing language, artificial live telemetry, pulsing indicators and invented accuracy scores. The product is retrospective; its observations end in December 2025.

Use a modest wordmark and a simple geometric lens/grid symbol. Do not use the NASA logo as the product mark. Put NASA data attribution and the Space Apps context in a small source/footer area.

## 4. Information architecture

Four primary destinations, all inside one coherent application shell:

1. **Explore** — selected month, sensor comparison, map, year calendar and historical context.
2. **Sensor comparison** — observed time series, monthly table and disagreement inspection.
3. **Method & validation** — measurement definition, model, evaluation, uncertainty and provenance.
4. **Downloads** — range export, full monthly/yearly CSVs and validation results.

These can be in-page sections or lightweight views. The prototype must show a clear active navigation state. Do not generate unrelated marketing, pricing, account or onboarding pages.

Keep selected month/year shared across relevant views. Navigating to validation must not reset the exploration state.

## 5. Application shell

### Desktop: 1440 × 1000 target

- Left rail: 216–232px; full viewport height; subtle right border.
- Main area: remaining width; 28–32px outer padding; content max-width approximately 1440px within the main area on very wide displays.
- Rail top: wordmark, county subtitle, small “Historical data” descriptor.
- Rail middle: four icon-and-text destinations, 44px minimum comfortable row height.
- Rail bottom: date window, source attribution and a text link to provenance.
- Main header: page title and subtitle left; primary “Export data” action right.
- Date toolbar immediately below the header, then the actual workspace.
- Sticky behavior must not cover controls, chart labels or keyboard-focused elements.

### Navigation style

Use a single locally available outline icon family, approximately 18–20px with consistent stroke width. Icons support text labels. Active item uses a pale tinted surface, darker text and a small structural marker. Hover is subtle. Do not use emoji for navigation or data status.

### Suggested first-screen composition

```text
┌──────────────────┬───────────────────────────────────────────────────────┐
│ FireLens         │ Historical hotspot explorer           [Export data]  │
│ Butte County     │ Butte County, CA · GEOID 06007 · Nov 2000–Dec 2025    │
│                  ├───────────────────────────────────────────────────────┤
│ Explore          │ [‹] [November ▾] [2018 ▾] [›]  [Observed VIIRS]       │
│ Sensor comparison│ Shared unit: 1-km cell-days / UTC month               │
│ Method &         ├─────────────────────────────────┬─────────────────────┤
│ validation       │                                 │ Selected month      │
│ Downloads        │ County activity map             │ Nov 2018            │
│                  │                                 │ 1,220 cell-days     │
│                  │ [VIIRS S-NPP | MODIS]           │ Observed VIIRS      │
│                  │                                 │                     │
│                  │ Actual county outline and       │ MODIS        735    │
│                  │ data-driven grid markers        │ VIIRS      1,220    │
│                  │                                 │ Comparison bars     │
│                  ├─────────────────────────────────┴─────────────────────┤
│                  │ 2018 overview — 12 selectable months                  │
│                  ├───────────────────────────────────────────────────────┤
│ NASA FIRMS       │ Historical context — labeled axes and method seam    │
└──────────────────┴───────────────────────────────────────────────────────┘
```

This is a hierarchy guide, not a requirement to copy box dimensions literally. At shorter laptop heights, the historical context may fall below the fold. Keep date controls, meaningful map content and both sensor values visible first.

## 6. Visual system

### Color tokens

| Token | Hex | Purpose |
|---|---|---|
| `canvas` | `#F4F6F8` | Overall application background |
| `surface` | `#FFFFFF` | Main cards, tables and controls |
| `surface-subtle` | `#EDF1F5` | Secondary surfaces and inactive control backgrounds |
| `text-primary` | `#18232D` | Headings, body and important numbers |
| `text-secondary` | `#536273` | Supporting text and axes |
| `border` | `#DCE2E8` | Dividers and component boundaries |
| `primary` | `#234E65` | Primary actions and active navigation |
| `primary-soft` | `#E7EFF4` | Active navigation surface |
| `modis` | `#B95022` | MODIS data series |
| `modis-soft` | `#FFF0E8` | MODIS supporting surface |
| `viirs` | `#2463A6` | VIIRS data series |
| `viirs-soft` | `#EAF2FC` | Observed VIIRS supporting surface |
| `modeled` | `#7255A5` | Modeled historical indicator |
| `modeled-soft` | `#F1EDF8` | Estimated-period badges/surfaces |
| `warning` | `#8A570D` | Coverage warnings and caution text |
| `warning-soft` | `#FFF4DF` | Coverage notice background |
| `error` | `#B42318` | Failed loads and invalid forms |
| `error-soft` | `#FFF0EE` | Error surfaces |
| `focus` | `#245BD8` | Keyboard focus outline |

Use data colors consistently on every page. Amber means a data limitation, not wildfire danger. Colors do not express severity or emergency risk. Do not use red/green to imply accurate/inaccurate sensors.

Contrast ratios have not been certified for these combinations. Validate normal text, badges, charts, controls and focus indicators during implementation; adjust token shades as needed.

### Typography

- Primary font: **Inter**, locally bundled if available; fallback `Segoe UI, Arial, sans-serif`.
- Numeric presentation: tabular lining figures using `font-variant-numeric: tabular-nums`. Optional locally bundled **IBM Plex Mono** for compact technical metadata; fallback `Consolas, monospace`.
- No decorative serif display headings.
- Page heading: 28–32px / 1.2, weight 600.
- Section heading: 18–20px / 1.35, weight 600.
- Selected-month indicator: 44–52px / 1.05, weight 600; 36–40px on mobile.
- Sensor measurements: 24–28px, weight 600.
- Body: 14–16px / 1.5–1.65.
- Control labels and table content: 13–14px.
- Supporting metadata: 12px minimum; keep uppercase labels short and sparse.
- Keep units beside or immediately below values, with lower emphasis but readable contrast.

### Spacing, corners and elevation

- Spacing scale: 4, 8, 12, 16, 24, 32, 48px.
- Main desktop gutters: 24px; within compact groups: 8–12px.
- Card padding: 20–24px desktop; 16px mobile.
- Control radius: 6–8px; card radius: 10–12px; status badge radius: 4–6px.
- Standard border: 1px.
- Default cards use borders rather than shadows. Optional floating menu shadow: `0 8px 24px rgba(24,35,45,.10)`.
- Avoid pill-shaped large cards, inset clay shadows, frosted glass, decorative gradients and floating glows.

## 7. Explore view

### Date toolbar

- Separate labeled month and year selects, previous/next month buttons and a small status badge.
- Study range: November 2000 through December 2025.
- Date navigation crosses year boundaries correctly and stops at range limits.
- Disable unsupported months in 2000; never fabricate January–October data.
- Date changes update map, numeric summary, year overview selection and relevant comparison highlights together.
- Primary date display: “November 2018”; compact alternatives may use “Nov 2018.”
- Show “UTC calendar month” near the measure definition.

### Selected-month summary

Structure:

1. Month label.
2. VIIRS-reference indicator value and unit.
3. Explicit **Observed VIIRS** or **Estimated from MODIS** status.
4. Separate MODIS and VIIRS observed comparison rows.
5. Contextual coverage/estimate note.

Do not turn the indicator into a health score, risk gauge, completion ring or percentage.

Use integer formatting for observed counts. Modeled expectations may show one decimal, labeled “estimated.” Dataset exports retain their existing precision.

### Sensor comparison module

Two aligned horizontal bars and values: MODIS in orange, VIIRS in blue. Both bars use the same zero-based scale within the module. Include a small unit label: “1-km cell-days.”

Unavailable VIIRS is rendered as **Unavailable** with an explanatory note, not a zero-length observed bar. A true returned-record zero must be described as “No retained detections”; it is not proof of complete observation.

Optional expandable detail: source-coded vegetation detection row counts. Label raw rows separately from deduplicated cell-days.

### County map

- Main visualization, approximately 60–68% of the top workspace width on desktop.
- Use the actual bundled Butte County geometry and data-driven grid positions. Do not generate a decorative county shape or random markers.
- Quiet neutral map surface with subtle geographic context only where supplied. No mandatory external tile service.
- Sensor selector: **VIIRS S-NPP / MODIS**, consistently labeled.
- No modeled spatial layer: the monthly model estimates a county total and does not produce cell-level locations.
- Marker size represents recorded UTC days in the cell; legend must explain this. Marker count represents distinct occupied cells, not monthly cell-days.
- Marker details: sensor, approximate cell center, recorded UTC days in the selected month. Support click/tap and keyboard-accessible equivalent data access.
- Avoid presenting markers as exact ignition points or burning footprints.
- Map caption: “Detection locations aggregated to 1-km cells. Display outline simplified; county membership independently checked against the exact official polygon.”
- Zero returned activity: show the county outline and a useful empty state, not a blank error panel.
- Pre-VIIRS period: VIIRS map option disabled with a visible reason; MODIS remains available.

### Year calendar

- Twelve equally sized month buttons in chronological order.
- Desktop: 12 columns if readable at the available width; otherwise 6 × 2. Tablet: 6 × 2. Mobile: 3 × 4.
- Each tile: month, indicator value, compact observation/estimate marker.
- Selected tile has a strong outline and text/state marker; selection cannot depend solely on color.
- Observed tiles use a restrained blue sequential intensity scale. Estimated tiles use a visibly different treatment such as a purple status marker and subtle pattern.
- Explain that calendar color follows the VIIRS-reference indicator, not whichever sensor is selected on the map.
- Keep numeric labels readable at every intensity.

### Historical context

- Labeled annual or monthly chart with honest axis values and units.
- Clearly mark the February 2012 transition to observed VIIRS; January 2012 remains estimated.
- Distinguish mixed 2012 annual composition explicitly if displaying annual totals.
- Estimated segment uses dashed/patterned treatment plus a text legend; observed uses solid blue.
- Explain incomplete first year: 2000 includes November–December only.
- Clicking a year may update the selected year. Chart tooltips must also be accessible by focus/tap or an accompanying table.
- Do not smooth across the method seam or imply a corrected, bias-free wildfire trend.

## 8. Sensor comparison view

Main content: aligned observed MODIS and VIIRS monthly series with a shared count axis and date axis. VIIRS before February 2012 is absent, not plotted at zero. A model diagnostic can be a separately labeled optional dashed line; it is distinct from the historical stitched indicator.

Include a date-range control and an accessible table with month, MODIS cell-days, VIIRS cell-days, estimated diagnostic and quality note. Preserve units in the table heading.

Feature July 2024 as a selectable example rather than a promotional callout:

> **Coverage limitation — July 2024**
> MODIS records 322 cell-days and VIIRS S-NPP records 58. NASA documents an S-NPP outage overlapping July 25–26. The supplied VIIRS observations are incomplete; missed detections cannot be reconstructed from these files.

Details can show model diagnostic ~340.8 and link to validation/source notes. Do not label either sensor the winner.

## 9. Method & validation view

Organize into readable sections or tabs: **Measurement**, **Model & evaluation**, **Coverage & uncertainty**, **Sources**. Keep critical caveats visible near their associated results rather than burying all limitations in a footer.

### Measurement explanation

Use a small conceptual cell/day diagram if helpful: repeated same-sensor detections in one cell on one UTC date count once; the same cell on a second date adds another cell-day. Label it as a schematic, not real observations.

State CRS EPSG:3310, 1,000m fixed grid, UTC acquisition date, type=0 selection, both day/night and native confidence retained.

### Evaluation table

Title: **Agreement with observed VIIRS — 2024–2025**.
Subtitle: “24 months; model fitted on 2013–2023. Reference coverage is imperfect.”

| Method | MAE, cell-days/month |
|---|---:|
| MODIS-to-VIIRS crosswalk | 20.334 |
| Unadjusted MODIS | 32.000 |
| Training-derived ratio | 32.850 |
| Training median | 19.625 |
| Training calendar-month median | 18.958 |

Show secondary model metrics without turning them into decorative KPI trophies: median absolute error 6.543; mean absolute log1p error 0.3408.

Required interpretation: “The crosswalk improves agreement over unadjusted MODIS, but the median baselines have lower MAE on this test. These scores measure sensor agreement; they do not establish wildfire accuracy.”

Do not present “accuracy: 94%,” percentage improvement as the sole result, or “best model” badges. Do not change the model based on this already inspected test set for the redesign.

### Uncertainty and provenance

- Estimated early history is an exploratory backward transfer from later overlap years.
- Early Terra-only coverage differs; retain January–June 2002 warnings.
- Zero MODIS detections can produce a positive model estimate.
- Heuristic residual bands are not guaranteed probability coverage.
- Dataset observation coverage is not fully quantified.
- Original MODIS source version codes are mixed (6.03 and 61.03); uniform C6.1 provenance remains unresolved.
- Exact county membership replay passed; display geometry remains simplified.
- Present these as separate statuses, not one “scientifically verified” badge.

Sources: NASA FIRMS MODIS/VIIRS attribute pages; NASA MODAPS S-NPP outage table; official California county boundary query; project audit evidence. External links are optional reading, not runtime dependencies.

## 10. Downloads view and export interaction

Primary module: **Export a month range**, with persistent Start month and End month labels, available range, format CSV and an export button. Default range should be meaningful and visible; do not silently export the whole dataset when a custom range is selected.

Show a summary before action, e.g. “November–December 2018 · 2 months.” Inline error for end before start. Explain unavailable fields remain blank and observed/estimated flags are included.

Secondary download rows: Full monthly dataset; Yearly summary; Held-out validation. Include short content descriptions and meaningful filenames.

Do not create buttons for downloads that have no file behind them. Additional grid/provenance downloads are optional only when wired to actual existing artifacts.

Success feedback: nonblocking accessible status message, e.g. “Exported 2 months.” Keep the user’s range after export.

## 11. Required prototype states and real example data

Generate these states with the same shell and component system:

1. **Explore desktop — November 2018**: VIIRS-reference observed indicator 1,220; MODIS735; VIIRS1,220; populated county map. Default flagship screen.
2. **Explore desktop — July 2024**: observed indicator58; MODIS322; VIIRS58; visible coverage note; diagnostic model value~340.8 only if clearly labeled.
3. **Explore desktop — pre-VIIRS, e.g. November 2008**: MODIS4; VIIRS unavailable; modeled indicator and band must come from the actual calendar record, not an invented value. Disabled VIIRS map selector with explanation.
4. **January 2012 transition**: partial availability note; reference status estimated from MODIS. Do not equate the absence of retained county rows with full-month coverage.
5. **Method & validation**: full baseline comparison and honest interpretation.
6. **Downloads**: selected range, inline invalid-range state and success message.
7. **Mobile Explore — 390 × 844**: deliberate stacked composition.
8. **Data loading failure**: concise explanation and retry/recovery path.

Use actual values from `web/data/calendar.json`, `web/data/grid.json` and the product CSVs. For any value not specified here, read it from those files or leave a clearly labeled design placeholder. Never fabricate scientific measurements to make the mockup attractive.

## 12. Responsive behavior

### Wide desktop ≥1280px

Persistent rail; two-column map/summary workspace; 12-month calendar where legible; full comparison table; comfortably spaced toolbar.

### Laptop/tablet 768–1279px

Use a compact rail or top navigation at the narrower end. Preserve labels through tooltips plus accessible names if the rail is icon-only. Map and summary may use a 60/40 split before stacking. Calendar6×2. Controls wrap into intentional rows; no clipped labels.

### Mobile <768px

- Compact wordmark/header; navigation as a labeled menu or four-item compact bar with sufficient safe-area spacing.
- Main padding16px; no large decorative header.
- Order: title → date controls → selected-month summary/comparison → contextual warning → map → calendar → historical chart.
- Month/year controls fit on one or two clean rows; targets44px where practical.
- Calendar3×4; map approximately300–360px tall.
- Tables use an intentional scroll container or stacked comparison rows, with column meaning retained.
- Export form stacks; primary button full width.
- No horizontal document overflow at360px,390px or430px widths.

## 13. Accessibility and interaction states

Provide default, hover, keyboard focus, selected, disabled, loading, empty, error and success states for relevant components.

- Semantic landmarks, one page-level heading and logical section headings.
- Skip link to main content.
- Logical keyboard navigation; visible focus on every control; no focus trap.
- Selected navigation/calendar state conveyed programmatically.
- Sensor badges include names; chart lines have distinct styling as well as color.
- Tooltips are supplemental, never the only location of essential information.
- Announce completed date changes or exports without reading the entire page unnecessarily.
- Respect reduced-motion preferences. Use150–180ms transitions for control feedback only; avoid chart sweeps and metric count-up animation.
- Target WCAG AA contrast; measure rather than assuming compliance.
- No automatic interaction that moves keyboard focus unexpectedly.
- Keep figure descriptions and an accessible data table available for charts/map summaries.

## 14. Runtime and implementation boundaries

Existing implementation is static HTML, CSS and JavaScript with local JSON/CSV/GeoJSON and an offline bundler. Keep the prototype translatable to that architecture. React may be used by a prototype tool, but it does not imply an approved framework migration.

Offline demonstration is a core requirement. Avoid remote fonts, CDNs, API keys, paid map tiles, login, external analytics and runtime data fetches from third parties. Assets should be local and bundleable. The standalone generated HTML and localhost site must remain consistent.

The redesign changes presentation and interaction. It does not change county membership, scientific filtering, model fitting, sensor totals, dates, uncertainty calculations or source archives.

Any newly proposed analysis feature—incident clustering, forecasting, custom geography, burned-area estimates, modeled cell locations—is outside this prototype brief.

## 15. Prototype delivery expectations

Supply an editable prototype or source export, plus desktop/mobile previews. Include:

- Explore, comparison, validation and downloads layouts.
- Reusable navigation, toolbar, metric, comparison, badge, notice, chart, table and export components.
- Named color/type/spacing tokens.
- The representative data states in section11.
- Interactive date selection, sensor selection, navigation and export-form feedback where supported.
- Notes identifying static mockups versus functional interactions.
- Local asset files and font licenses if custom fonts are supplied.

Prioritize the desktop Explore screen, July2024 state and mobile Explore before polishing secondary pages. The team will return the prototype for implementation review; the current document does not authorize publishing.

## 16. Acceptance checklist

- [ ] The primary month-selection and sensor-comparison task is obvious without scrolling past a marketing hero.
- [ ] Map and sensor values form the primary visual hierarchy.
- [ ] Selected state is recognizable without color alone.
- [ ] Every value has an understandable unit and observed/estimated context.
- [ ] Early VIIRS absence reads Unavailable rather than0.
- [ ] July2024 coverage limitation appears beside its values.
- [ ] Model performance includes the simpler baselines.
- [ ] Raw detections, monthly cell-days and distinct map cells are distinct concepts.
- [ ] Charts have readable axes/legends; the2012 seam remains visible.
- [ ] Mobile composition is designed explicitly and does not overflow.
- [ ] Keyboard focus, errors, empty/loading states and reduced motion are specified.
- [ ] No invented data, risk scores, live status or unique-wildfire claims.
- [ ] The design can work from locally bundled assets in offline and localhost modes.

## 17. Short prompt for a prototype generator

Design FireLens Butte, a polished historical satellite-hotspot exploration workspace. Follow this DESIGN.md as the source of truth. Use a light neutral analytical interface, restrained white surfaces, charcoal typography, orange MODIS, blue VIIRS and purple modeled-history semantics. Build a compact application shell with navigation, date toolbar, a large actual Butte County map, adjacent monthly indicator/sensor comparison,12-month calendar and historical chart. Include comparison, validation and download views. Use the supplied real JSON/CSV/GeoJSON data; keep observation, estimation and coverage limitations explicit. Show desktop November2018, July2024, pre-VIIRS and390px mobile states. Prioritize clean hierarchy, precise alignment and accessible interactions. Deliver editable components and source; avoid decorative planets, marketing heroes, heavy clay shadows, fabricated measurements and external runtime dependencies.
