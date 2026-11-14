import { useEffect, useRef, useState } from "react";
import {
  Aperture,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FlaskConical,
  Globe2,
  Info,
  Layers2,
  MapPin,
  Menu,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";
import CountyMap from "./components/CountyMap";
import SeasonalContext from "./components/SeasonalContext";

import { HistoryChart, ComparisonChart } from "./components/DataCharts";
import {
  bundle,
  loadRecords,
  downloadProduct,
  MONTHS,
  YEARS,
  MIN_DATE,
  MAX_DATE,
  VALIDATION,
  buildCsv,
  dateKey,
  dateLabel,
  downloadFile,
  formatNumber,
  isEstimated,
  monthRange,
  shiftMonth,
  type MonthRecord,
  type Sensor,
  type View,
} from "./lib/data";

const NAVIGATION = [
  { id: "explore" as const, label: "Explore", icon: Globe2 },
  { id: "comparison" as const, label: "Sensor comparison", icon: ChartNoAxesCombined },
  { id: "method" as const, label: "Method & validation", icon: FlaskConical },
  { id: "downloads" as const, label: "Downloads", icon: ArrowDownToLine },
];

function StatusBadge({ estimated, missing = false }: { estimated: boolean; missing?: boolean }) {
  return (
    <span
      className={`badge ${estimated ? "badge-modeled" : missing ? "badge-neutral" : "badge-observed"}`}
    >
      <span className="badge-dot" />
      {estimated ? "Estimated from MODIS" : missing ? "Record not supplied" : "Observed VIIRS"}
    </span>
  );
}

function Notice({
  children,
  warning = false,
  title,
}: {
  children: React.ReactNode;
  warning?: boolean;
  title?: string;
}) {
  return (
    <div className={`notice ${warning ? "notice-warning" : ""}`}>
      {warning ? <TriangleAlert size={17} /> : <Info size={17} />}
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

function Sidebar({
  view,
  setView,
  open,
  onClose,
}: {
  view: View;
  setView: (view: View) => void;
  open: boolean;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const aside = closeButton.current?.closest("aside");
        const controls = Array.from(
          aside?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ||
            [],
        ).filter((el) => el.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <>
      {open && <button className="nav-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Workspace navigation"
      >
        <button
          ref={closeButton}
          className="sidebar-close icon-button"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
        <a
          className="brand"
          href="#explore"
          onClick={(e) => {
            e.preventDefault();
            setView("explore");
            onClose();
          }}
          aria-label="FireLens home"
        >
          <span className="brand-mark">
            <Aperture size={26} strokeWidth={1.6} />
          </span>
          <span>
            <strong>
              FireLens<span className="brand-period">.</span>
            </strong>
            <small>BUTTE COUNTY</small>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Primary">
          {NAVIGATION.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "nav-active" : ""}`}
              aria-label={label}
              title={label}
              aria-current={view === id ? "page" : undefined}
              onClick={() => {
                setView(id);
                onClose();
              }}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {view === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="study-period">
            <span className="eyebrow">
              <CalendarDays size={14} />
              STUDY WINDOW
            </span>
            <strong>Nov 2000 – Dec 2025</strong>
            <p>
              Historical observations.
              <br />
              Not a live fire monitoring tool.
            </p>
          </div>
          <button
            className="sidebar-method"
            onClick={() => {
              setView("method");
              onClose();
            }}
          >
            <CircleHelp size={16} />
            <span>Understand the data</span>
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-source">
            <span className="source-symbol">
              <Layers2 size={18} />
            </span>
            <div>
              <strong>NASA FIRMS data</strong>
              <p>Space Apps research</p>
            </div>
          </div>
          <button
            className="provenance-link"
            onClick={() => {
              setView("method");
              onClose();
            }}
          >
            Data sources & provenance <ArrowUpRight size={12} />
          </button>
        </div>
      </aside>
    </>
  );
}

function DateToolbar({
  date,
  onChange,
  record,
}: {
  date: string;
  onChange: (value: string) => void;
  record?: MonthRecord;
}) {
  const [year, month] = date.split("-").map(Number);
  return (
    <section className="date-toolbar" aria-label="Select historical month">
      <div className="date-controls">
        <span className="toolbar-label">
          <CalendarDays size={16} />
          Selected month
        </span>
        <div className="month-picker">
          <button
            className="date-arrow"
            aria-label="Previous month"
            disabled={date === MIN_DATE}
            onClick={() => onChange(shiftMonth(date, -1))}
          >
            <ChevronLeft size={17} />
          </button>
          <div className="select-wrap month-select">
            <select
              aria-label="Month"
              value={month - 1}
              onChange={(e) => onChange(dateKey(year, Number(e.target.value)))}
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i} disabled={year === 2000 && i < 10}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="select-wrap year-select">
            <select
              aria-label="Year"
              value={year}
              onChange={(e) => {
                const y = Number(e.target.value);
                onChange(dateKey(y, y === 2000 && month < 11 ? 10 : month - 1));
              }}
            >
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
          <button
            className="date-arrow"
            aria-label="Next month"
            disabled={date === MAX_DATE}
            onClick={() => onChange(shiftMonth(date, 1))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <StatusBadge estimated={isEstimated(date)} missing={!record} />
      </div>
      <span className="toolbar-unit">
        <span className="unit-dot" />
        1-km cell-days <span className="unit-divider">/</span> UTC month{" "}
        <button
          className="tooltip-icon"
          aria-label="One cell-day is one 1-km grid cell with retained detections on one UTC date."
          title="One cell-day is one 1-km grid cell with retained detections on one UTC date."
        >
          <Info size={14} />
        </button>
      </span>
    </section>
  );
}

function MonthSummary({
  date,
  record,
  onMethod,
}: {
  date: string;
  record?: MonthRecord;
  onMethod: () => void;
}) {
  const estimated = isEstimated(date);
  const value = estimated ? record?.estimated : record?.viirs;
  const max = Math.max(record?.modis ?? 0, record?.viirs ?? 0, 1);
  return (
    <section className="card summary-card" aria-labelledby="summary-title">
      <div className="summary-top">
        <span className="eyebrow">SELECTED MONTH</span>
        <CalendarDays size={16} />
      </div>
      <h2 id="summary-title">{dateLabel(date)}</h2>
      <div className={`main-value ${estimated ? "modeled-text" : ""}`}>
        {formatNumber(value)}
        <span>cell-days</span>
      </div>
      <div className="indicator-label">
        <span className="desktop-indicator-label">VIIRS-reference indicator</span>
        <span className="mobile-indicator-label">VIIRS reference</span>
      </div>
      <StatusBadge estimated={estimated} missing={!record} />
      <div className="sensor-comparison">
        <div className="comparison-label">
          <h3>Sensor observations</h3>
          <span>1-km cell-days</span>
        </div>
        {(["modis", "viirs"] as Sensor[]).map((sensor) => {
          const count = record?.[sensor];
          return (
            <div className="sensor-row" key={sensor}>
              <div className="sensor-value-row">
                <span>
                  <i className={`series-square ${sensor}`} />
                  {sensor === "modis" ? "MODIS" : "VIIRS S-NPP"}
                </span>
                <strong>
                  {sensor === "viirs" && estimated ? (
                    <span className="unavailable">Unavailable</span>
                  ) : (
                    formatNumber(count)
                  )}
                </strong>
              </div>
              {sensor === "viirs" && estimated ? (
                <div className="sensor-unavailable-line" />
              ) : (
                <div className="bar-track">
                  <div
                    className={`bar-fill ${sensor}`}
                    style={{ width: `${count == null ? 0 : (count / max) * 100}%` }}
                  />
                </div>
              )}
              {count === 0 && (
                <span className="small-muted">
                  No retained detections; coverage is not established.
                </span>
              )}
            </div>
          );
        })}
      </div>
      {date === "2024-07" ? (
        <div className="summary-context warning-context">
          <TriangleAlert size={16} />
          <p>
            <strong>Coverage limitation</strong>S-NPP outage overlaps July 25–26. VIIRS observations
            are incomplete.
          </p>
        </div>
      ) : (
        <div className="summary-context">
          <Info size={16} />
          <p>
            {estimated ? (
              <>
                An exploratory county-total estimate.{" "}
                {value == null
                  ? "Modeled record and uncertainty band were not supplied."
                  : "No modeled spatial locations."}
              </>
            ) : record ? (
              "Different instruments, different detection sensitivity. Counts are not unique fires."
            ) : (
              "This month’s source record was not attached. Missing values are not zero."
            )}
          </p>
        </div>
      )}
      {estimated && record?.low != null && (
        <p className="small-muted">
          Heuristic residual band: {formatNumber(record.low)}–{formatNumber(record.high)} cell-days.
          Not guaranteed probability coverage.
        </p>
      )}
      <p className="small-muted">
        Presumed-vegetation raw rows: MODIS {formatNumber(record?.modis_raw)} / VIIRS{" "}
        {record?.viirs_raw == null ? "Unavailable" : formatNumber(record.viirs_raw)}.
      </p>
      <button className="text-link summary-link" onClick={onMethod}>
        How to read these measurements <ArrowUpRight size={13} />
      </button>
    </section>
  );
}

function YearCalendar({
  date,
  records,
  onChange,
}: {
  date: string;
  records: MonthRecord[];
  onChange: (date: string) => void;
}) {
  const [year] = date.split("-").map(Number);
  return (
    <section className="card calendar-card">
      <div className="card-heading">
        <div className="calendar-title">
          <h2>{year} at a glance</h2>
          <span>Choose a month to explore</span>
        </div>
        <div className="calendar-year-controls">
          <button
            className="icon-button"
            aria-label="Previous year"
            disabled={year === 2000}
            onClick={() => onChange(dateKey(year - 1, Number(date.slice(5)) - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span>{year}</span>
          <button
            className="icon-button"
            aria-label="Next year"
            disabled={year === 2025}
            onClick={() => onChange(dateKey(year + 1, Number(date.slice(5)) - 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="month-grid">
        {MONTHS.map((name, i) => {
          const key = dateKey(year, i);
          const record = records.find((r) => r.date === key);
          const estimated = isEstimated(key);
          const value = estimated ? record?.estimated : record?.viirs;
          return (
            <button
              key={name}
              className={`month-tile ${key === date ? "month-selected" : ""} ${estimated ? "month-estimated" : ""} ${value != null ? "month-has-data" : ""}`}
              style={
                value == null
                  ? undefined
                  : {
                      backgroundColor: estimated
                        ? `rgba(114,85,165,${0.04 + 0.15 * Math.min(1, Math.log1p(value) / Math.log1p(1500))})`
                        : `rgba(36,99,166,${0.04 + 0.18 * Math.min(1, Math.log1p(value) / Math.log1p(1500))})`,
                    }
              }
              aria-pressed={key === date}
              aria-label={`${name} ${year}: ${value == null ? "record not supplied" : `${formatNumber(value)} cell-days`}${estimated ? ", estimated period" : ""}`}
              disabled={key < MIN_DATE}
              onClick={() => onChange(key)}
            >
              <span className="month-tile-name">
                {name.slice(0, 3)}
                {key === date && <Check size={12} />}
              </span>
              <strong>{formatNumber(value)}</strong>
              <span className="month-tile-status">
                {value != null ? (
                  <>
                    <i className={`status-dot ${estimated ? "modeled" : "viirs"}`} />
                    {estimated ? "Est." : "Obs."}
                  </>
                ) : key < MIN_DATE ? (
                  "Out of range"
                ) : (
                  "Record unavailable"
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="calendar-caption">
        <span>
          <i className="status-dot viirs" />
          Observed VIIRS <i className="status-dot modeled" />
          Estimated from MODIS
        </span>
        <span>Color follows the reference indicator, not the map sensor.</span>
      </div>
    </section>
  );
}

function ComparisonView({
  date,
  records,
  select,
}: {
  date: string;
  records: MonthRecord[];
  select: (date: string) => void;
}) {
  const [start, setStart] = useState(MIN_DATE);
  const [end, setEnd] = useState(MAX_DATE);
  const invalidRange = !start || !end || end < start || start < MIN_DATE || end > MAX_DATE;
  const filtered = invalidRange ? [] : records.filter((r) => r.date >= start && r.date <= end);
  return (
    <div className="view-stack">
      <div className="card comparison-overview">
        <div>
          <span className="eyebrow">TWO INSTRUMENTS. ONE SHARED MEASURE.</span>
          <h2>Compare observations, not fire counts.</h2>
          <p>
            MODIS and VIIRS detect thermal activity at different native resolutions. A shared 1-km
            grid makes their retained cell-day counts comparable, not interchangeable.
          </p>
        </div>
        <span className="comparison-visual">
          <span className="modis-orbit">M</span>
          <span className="viirs-orbit">V</span>
        </span>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Monthly sensor comparison</h2>
            <p>Observed 1-km cell-days · 302-month source calendar</p>
          </div>
          <SlidersHorizontal size={18} />
        </div>
        <div className="range-filter">
          <label>
            Start month
            <input
              type="month"
              min={MIN_DATE}
              max={MAX_DATE}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <span className="range-arrow">
            <ArrowRight size={17} />
          </span>
          <label>
            End month
            <input
              type="month"
              min={MIN_DATE}
              max={MAX_DATE}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <button
            className="secondary-button"
            onClick={() => {
              setStart("2024-07");
              setEnd("2024-07");
              select("2024-07");
            }}
          >
            Inspect July 2024 <ArrowUpRight size={14} />
          </button>
        </div>
        {invalidRange && (
          <p className="inline-error" role="alert">
            {end < start
              ? "End month must be on or after start month."
              : "Choose a start and end within the available study window."}
          </p>
        )}
        <ComparisonChart records={filtered} start={start} end={end} />
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable monthly comparison table"
        >
          <table>
            <caption className="sr-only">Supplied monthly sensor counts in 1-km cell-days</caption>
            <thead>
              <tr>
                <th>UTC month</th>
                <th>
                  <i className="series-square modis" />
                  MODIS
                </th>
                <th>
                  <i className="series-square viirs" />
                  VIIRS S-NPP
                </th>
                <th>Model diagnostic</th>
                <th>Quality note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.date} className={date === r.date ? "selected-table-row" : ""}>
                  <td>
                    <button className="table-month" onClick={() => select(r.date)}>
                      {dateLabel(r.date)}
                      {date === r.date && <Check size={13} />}
                    </button>
                  </td>
                  <td className="numeric">{formatNumber(r.modis)}</td>
                  <td className="numeric">
                    {r.viirs === null ? "Unavailable" : formatNumber(r.viirs)}
                  </td>
                  <td className="numeric">
                    {r.diagnostic ? `~${formatNumber(r.diagnostic)}` : "Not supplied"}
                  </td>
                  <td>
                    <span
                      className={`table-status ${r.date === "2024-07" ? "table-status-warning" : ""}`}
                    >
                      {r.date === "2024-07"
                        ? "Incomplete VIIRS coverage"
                        : isEstimated(r.date)
                          ? "Pre-VIIRS period"
                          : "Observed record"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">
              <FileSpreadsheet size={27} />
              <strong>No records in this range</strong>
              <p>Try November 2008, November 2018, or July 2024.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setStart(MIN_DATE);
                  setEnd(MAX_DATE);
                }}
              >
                Reset range
              </button>
            </div>
          )}
        </div>
        <div className="table-note">
          <Info size={14} />
          Unavailable observations are never plotted or exported as zero. The complete 302-month
          calendar is included.
        </div>
      </section>
      <Notice warning title="Coverage limitation — July 2024">
        MODIS records <strong>322 cell-days</strong> and VIIRS S-NPP records <strong>58</strong>.
        NASA documents an S-NPP outage overlapping July 25–26. The supplied VIIRS observations are
        incomplete; missed detections cannot be reconstructed from these files. The model diagnostic
        (~340.8) is an estimate, not an observation.
      </Notice>
    </div>
  );
}

function MethodView() {
  const [tab, setTab] = useState("measurement");
  const tabs = [
    { id: "measurement", label: "Measurement" },
    { id: "evaluation", label: "Model & evaluation" },
    { id: "uncertainty", label: "Coverage & uncertainty" },
    { id: "sources", label: "Sources" },
  ];
  return (
    <div className="view-stack">
      <div className="method-tabs" aria-label="Method sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "method-tab-active" : ""}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "measurement" && (
        <>
          <section className="card method-card">
            <div className="method-icon">
              <Layers2 size={23} />
            </div>
            <span className="eyebrow">THE SHARED UNIT</span>
            <h2>One cell. One UTC day. One cell-day.</h2>
            <p>
              Repeated same-sensor detections in a 1-km cell on the same UTC date count once. A
              detection in that cell on a second date adds another cell-day.
            </p>
            <div className="measurement-diagram">
              <div>
                <span className="schematic-grid">
                  <i />
                  <i />
                  <i className="grid-active" />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <strong>Day 1</strong>
                <span>Repeated detections → 1</span>
              </div>
              <span className="diagram-plus">+</span>
              <div>
                <span className="schematic-grid">
                  <i />
                  <i />
                  <i className="grid-active" />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <strong>Day 2</strong>
                <span>Same cell, new date → 1</span>
              </div>
              <span className="diagram-plus">=</span>
              <div className="diagram-result">
                <strong>2</strong>
                <span>cell-days</span>
              </div>
            </div>
            <span className="small-muted">Conceptual schematic only. Not actual observations.</span>
          </section>
          <section className="card method-card">
            <h2>A fixed, reproducible measurement</h2>
            <div className="definition-grid">
              <div>
                <span>Geography</span>
                <strong>Butte County · GEOID 06007</strong>
              </div>
              <div>
                <span>Grid & projection</span>
                <strong>1,000 m · EPSG:3310</strong>
              </div>
              <div>
                <span>Date definition</span>
                <strong>UTC acquisition date</strong>
              </div>
              <div>
                <span>Retained records</span>
                <strong>type=0 · day & night</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>Native confidence retained</strong>
              </div>
              <div>
                <span>Not measured</span>
                <strong>Unique fires or burned area</strong>
              </div>
            </div>
          </section>
          <Notice title="A count of retained activity, not complete observation">
            Raw detection rows, deduplicated monthly cell-days, and distinct occupied map cells are
            different measures. A returned zero means “No retained detections”; it does not prove
            full observation coverage.
          </Notice>
        </>
      )}
      {tab === "evaluation" && (
        <>
          <section className="card">
            <div className="card-heading">
              <div>
                <h2>Agreement with observed VIIRS — 2024–2025</h2>
                <p>
                  24 months; model fitted on 2013–2023. Lower MAE is better. Reference coverage is
                  imperfect.
                </p>
              </div>
              <FlaskConical size={21} />
            </div>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Scrollable validation results"
            >
              <table className="validation-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>MAE, cell-days/month</th>
                    <th className="mae-visual-heading">Mean absolute error</th>
                  </tr>
                </thead>
                <tbody>
                  {VALIDATION.map((v, i) => (
                    <tr key={v.method} className={!i ? "crosswalk-row" : ""}>
                      <td>
                        {v.method}
                        {!i && <span className="small-label">PROJECT METHOD</span>}
                      </td>
                      <td className="numeric">{v.mae.toFixed(3)}</td>
                      <td>
                        <div className="validation-bar-track">
                          <span style={{ width: `${(v.mae / 35) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="secondary-metrics">
              <div>
                <span>Median absolute error</span>
                <strong>
                  6.543 <small>cell-days</small>
                </strong>
              </div>
              <div>
                <span>Mean absolute log1p error</span>
                <strong>0.3408</strong>
              </div>
            </div>
          </section>
          <Notice warning title="Better sensor agreement is not wildfire accuracy">
            The crosswalk improves agreement over unadjusted MODIS, but the median baselines have
            lower MAE on this test. These scores measure sensor agreement; they do not establish
            wildfire accuracy.
          </Notice>
          <section className="card method-card">
            <h2>Historical crosswalk, not a forecast</h2>
            <p>
              The early-history indicator is an exploratory backward transfer from later
              sensor-overlap years. February 2012 is the transition to observed VIIRS; January 2012
              remains estimated. The crosswalk predicts a county total, never cell-level locations.
            </p>
            <p>
              The model has not been refitted or selected against the already inspected held-out
              test set for this redesign.
            </p>
          </section>
        </>
      )}
      {tab === "uncertainty" && (
        <section className="card method-card">
          <h2>Limitations that travel with the data</h2>
          <p>These are separate evidence statuses, not one “scientifically verified” badge.</p>
          <div className="uncertainty-list">
            {[
              [
                "Observation coverage",
                "Not fully quantified. July 2024 VIIRS observations overlap an S-NPP outage. Missing detections cannot be reconstructed.",
              ],
              [
                "Early historical estimates",
                "Exploratory backward transfer. Early Terra-only coverage differs; January–June 2002 requires caution. Zero MODIS detections can still produce a positive estimate.",
              ],
              [
                "January 2012 transition",
                "Reference status remains estimated. No retained county rows must not be interpreted as full-month coverage.",
              ],
              [
                "Residual bands",
                "Heuristic bands are not guaranteed probability coverage. Bands are shown for early modeled months and do not establish actual wildfire uncertainty.",
              ],
              [
                "MODIS source versions",
                "Mixed source version codes 6.03 and 61.03. Uniform C6.1 provenance remains unresolved.",
              ],
              [
                "County membership & display",
                "Independent full-resolution California polygon replay matched every supplied county row. The map uses the simplified project display outline.",
              ],
            ].map(([title, body]) => (
              <div key={title}>
                <ShieldCheck size={18} />
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === "sources" && (
        <>
          <section className="card method-card">
            <h2>Sources & provenance</h2>
            <p>
              Local assets support offline exploration. External references are optional reading,
              not runtime dependencies.
            </p>
            <div className="source-list">
              {[
                [
                  "NASA FIRMS · MODIS attributes",
                  "Instrument definitions and source fields",
                  "https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_MODIS_Firehotspots.html",
                ],
                [
                  "NASA FIRMS · VIIRS attributes",
                  "S-NPP detection attributes and filtering context",
                  "https://firms.modaps.eosdis.nasa.gov/content/descriptions/FIRMS_VIIRS_Firehotspots.html",
                ],
                [
                  "NASA MODAPS · S-NPP outages",
                  "Coverage interruption evidence",
                  "https://modaps.modaps.eosdis.nasa.gov/services/production/outages_suomi_npp.html",
                ],
                [
                  "California official county boundary",
                  "Project display outline; independently checked county membership · GEOID 06007",
                  "https://publish.data.ca.gov/dataset/california-county-boundaries-and-identifiers",
                ],
              ].map(([name, detail, url]) => (
                <a href={url} key={name} target="_blank" rel="noreferrer">
                  <span className="source-file-icon">
                    <BookOpen size={19} />
                  </span>
                  <span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </section>
          <Notice title="Verified data lineage">
            Original NASA FIRMS request archives 848030 and 848031 are preserved. County membership
            and all common-grid monthly counts were independently reproduced. Satellite detections
            are not unique wildfires. AI assisted implementation and documentation; the team remains
            responsible for review.
          </Notice>
          <button
            className="secondary-button"
            onClick={() =>
              downloadFile(
                JSON.stringify(bundle.provenance, null, 2),
                "FireLens_Provenance.json",
                "application/json",
              )
            }
          >
            Download provenance & AI metadata
          </button>
          <details className="card method-card">
            <summary>Original archive SHA-256 checksums</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {JSON.stringify(bundle.provenance, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

function DownloadsView({
  records,
  start,
  end,
  setStart,
  setEnd,
  notify,
}: {
  records: MonthRecord[];
  start: string;
  end: string;
  setStart: (s: string) => void;
  setEnd: (s: string) => void;
  notify: (s: string) => void;
}) {
  const dates = monthRange(start, end);
  const invalid = !start || !end || !dates.length;
  const files = [
    [
      "Butte_Harmonized_Monthly.csv",
      "Complete monthly calendar",
      "302 months, observed/model flags and heuristic bands",
    ],
    [
      "Butte_Harmonized_Yearly.csv",
      "Yearly summary",
      "Partial 2000 and mixed-method 2012 remain explicit",
    ],
    [
      "Validation_Heldout_2024_2025.csv",
      "Held-out monthly validation",
      "24 months; model diagnostic and reference values",
    ],
    ["Method_Comparison.csv", "Method-score summary", "Five methods; aggregate MAE"],
    [
      "Butte_Grid_Month_Cell_Days.csv",
      "Spatial grid-month data",
      "7,543 records; observed sensor occupancy",
    ],
    [
      "Sensitivity_Grid_And_Confidence.csv",
      "Grid and confidence sensitivity",
      "Descriptive alternatives, not accuracy certification",
    ],
  ];
  return (
    <div className="view-stack">
      <section className="card export-card">
        <div className="export-heading-icon">
          <FileSpreadsheet size={25} />
        </div>
        <h2>Export a month range</h2>
        <p>
          Complete scientific columns, blank unavailable values and observed/estimated flags travel
          with each export.
        </p>
        <div className="available-range">November 2000 – December 2025 · UTC months</div>
        <div className="export-form">
          <label htmlFor="export-start">
            Start month
            <input
              id="export-start"
              type="month"
              min={MIN_DATE}
              max={MAX_DATE}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <span className="range-arrow">
            <ArrowRight size={18} />
          </span>
          <label htmlFor="export-end">
            End month
            <input
              id="export-end"
              type="month"
              min={MIN_DATE}
              max={MAX_DATE}
              value={end}
              aria-invalid={invalid}
              aria-describedby={invalid ? "range-error" : undefined}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <div className="format-field">
            <span>File format</span>
            <div>CSV</div>
          </div>
        </div>
        {invalid && (
          <p id="range-error" className="inline-error" role="alert">
            Choose an inclusive range within the study window; end must follow start.
          </p>
        )}
        <div className="export-summary">
          <div>
            <strong>
              {invalid ? "Check your date range" : `${dateLabel(start)} – ${dateLabel(end)}`}
            </strong>
            <span>{dates.length} months · original scientific schema</span>
          </div>
          <button
            className="primary-button"
            disabled={invalid}
            onClick={() => {
              downloadFile(buildCsv(dates, records), `FireLens_Butte_${start}_to_${end}.csv`);
              notify(`Exported ${dates.length} months with scientific flags.`);
            }}
          >
            <Download size={16} />
            Download monthly CSV
          </button>
        </div>
      </section>
      <section className="card">
        <div className="card-heading">
          <h2>Research files</h2>
        </div>
        <div className="download-list">
          {files.map(([name, title, desc]) => (
            <div key={name}>
              <span className="download-file-icon">
                <FileSpreadsheet size={21} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span>{name}</span>
              </div>
              <button
                className="secondary-button"
                onClick={() => {
                  downloadProduct(name);
                  notify("Downloaded " + title);
                }}
              >
                <Download size={15} />
                CSV
              </button>
            </div>
          ))}
        </div>
      </section>
      <Notice title="Interpret responsibly">
        Cell-days measure satellite hotspot detections. They are not unique wildfires, burned area
        or an emergency risk score. Observation completeness is not established.
      </Notice>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("explore");
  const [date, setDate] = useState("2018-11");
  const [sensor, setSensor] = useState<Sensor>("viirs");
  const [mobileNav, setMobileNav] = useState(false);
  const [records, setRecords] = useState<MonthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [start, setStart] = useState("2018-11");
  const [end, setEnd] = useState("2018-12");
  const [announcement, setAnnouncement] = useState("");
  const [toast, setToast] = useState("");
  const record = records.find((r) => r.date === date);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    loadRecords()
      .then((data) => {
        if (!controller.signal.aborted) setRecords(data);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 7000);
    return () => clearTimeout(id);
  }, [toast]);

  function changeDate(value: string) {
    value = value < MIN_DATE ? MIN_DATE : value > MAX_DATE ? MAX_DATE : value;
    const next = value < MIN_DATE ? MIN_DATE : value > MAX_DATE ? MAX_DATE : value;
    setDate(next);
    if (isEstimated(next)) setSensor("modis");
    const nextRecord = records.find((r) => r.date === next);
    setAnnouncement(
      `${dateLabel(next)} selected. ${isEstimated(next) ? "Estimated from MODIS." : nextRecord ? `Observed VIIRS: ${formatNumber(nextRecord.viirs)} cell-days.` : "Source record not supplied."}`,
    );
  }

  const page = {
    explore: {
      title: "Historical hotspot explorer",
      subtitle: "Compare MODIS and VIIRS detections across a shared grid and historical calendar.",
    },
    comparison: {
      title: "Sensor comparison",
      subtitle: "Understand how two satellite instruments observe the same county.",
    },
    method: {
      title: "Method & validation",
      subtitle: "The measurement, the model, and the limitations behind every number.",
    },
    downloads: {
      title: "Download the evidence",
      subtitle: "Local, transparent exports for reproducible exploration.",
    },
  }[view];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar view={view} setView={setView} open={mobileNav} onClose={() => setMobileNav(false)} />
      <div className="main-shell" inert={mobileNav}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span className="mobile-wordmark">
              FireLens<span>.</span>
            </span>
            <span className="breadcrumb-workspace">Workspace</span>
            <ChevronRight size={13} />
            <strong>{NAVIGATION.find((n) => n.id === view)?.label}</strong>
          </div>
          <div className="location-label">
            <MapPin size={14} />
            <span>Butte County, California</span>
            <span className="geoid-tag">GEOID 06007</span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">SATELLITE DATA EXPLORATION</div>
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>
            {view !== "downloads" && (
              <button
                className="primary-button export-top-button"
                onClick={() => {
                  setStart(date);
                  setEnd(date);
                  setView("downloads");
                }}
              >
                <Download size={16} />
                Export data
              </button>
            )}
          </div>
          {view !== "method" && view !== "downloads" && (
            <DateToolbar date={date} onChange={changeDate} record={record} />
          )}
          {loading ? (
            <section className="card full-loading" role="status">
              <span className="loading-spinner" />
              <h2>Loading historical observations…</h2>
              <p>Reading the complete local historical dataset.</p>
            </section>
          ) : error ? (
            <section className="card full-loading">
              <TriangleAlert size={30} />
              <h2>Historical data couldn’t load</h2>
              <p>The local observations file is unavailable. Your selected month is preserved.</p>
              <button className="primary-button" onClick={() => setAttempt((n) => n + 1)}>
                <RotateCcw size={16} />
                Retry loading
              </button>
            </section>
          ) : (
            <>
              {view === "explore" && (
                <div className="view-stack">
                  {(date === "2012-01" || (date >= "2002-01" && date <= "2002-06")) && (
                    <Notice
                      warning
                      title={
                        date === "2012-01"
                          ? "January 2012 is still estimated"
                          : "Early Terra-only coverage"
                      }
                    >
                      {date === "2012-01"
                        ? "Observed VIIRS begins in February 2012. The absence of retained county rows does not establish full-month coverage. January is an exploratory MODIS-based estimate."
                        : "Early sensor availability differs from the later overlap period. Historical estimates should be interpreted with caution."}
                    </Notice>
                  )}
                  <div className="explore-workspace">
                    <CountyMap
                      date={date}
                      sensor={sensor}
                      setSensor={setSensor}
                      estimated={isEstimated(date)}
                    />
                    <MonthSummary date={date} record={record} onMethod={() => setView("method")} />
                  </div>
                  <YearCalendar date={date} records={records} onChange={changeDate} />
                  <HistoryChart records={records} onSelect={changeDate} />
                  <SeasonalContext records={records} onSelect={changeDate} date={date} />
                  <div className="explore-bottom-note">
                    <span>
                      <BookOpen size={15} />A little context goes a long way.
                    </span>
                    <p>
                      Satellite detections are observations, not an inventory of individual
                      wildfires.
                    </p>
                    <button className="text-link" onClick={() => setView("method")}>
                      Read the methodology <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
              {view === "comparison" && (
                <ComparisonView date={date} records={records} select={changeDate} />
              )}
              {view === "method" && <MethodView />}
              {view === "downloads" && (
                <DownloadsView
                  records={records}
                  start={start}
                  end={end}
                  setStart={setStart}
                  setEnd={setEnd}
                  notify={setToast}
                />
              )}
            </>
          )}
          <footer className="main-footer">
            <span>
              <Aperture size={13} />
              FireLens Butte <span className="footer-divider">/</span> Historical data, considered
              carefully.
            </span>
            <span className="prototype-label">
              <span className="prototype-square" />
              302 months · NASA FIRMS · Research prototype
            </span>
          </footer>
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Check size={17} />
          </span>
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss export notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
