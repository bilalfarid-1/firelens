import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { dateLabel, formatNumber, isEstimated, exportFigure, type MonthRecord } from "../lib/data";
const index = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5)) - 1;
export function HistoryChart({
  records,
  onSelect,
}: {
  records: MonthRecord[];
  onSelect: (s: string) => void;
}) {
  const [table, setTable] = useState(false);
  const value = (r: MonthRecord) => (isEstimated(r.date) ? r.estimated : r.viirs);
  const ceiling = Math.ceil(Math.max(...records.map((r) => value(r) || 0), 1) / 250) * 250;
  const x = (i: number) => 55 + (i / (records.length - 1)) * 990,
    y = (v: number) => 190 - (v / ceiling) * 145;
  const seam = records.findIndex((r) => r.date === "2012-02");
  const line = (arr: MonthRecord[]) =>
    arr.map((r) => `${x(records.indexOf(r))},${y(value(r) || 0)}`).join(" ");
  const band = records.filter((r) => isEstimated(r.date) && r.high != null);
  const bandpath = band
    .map((r) => `${x(records.indexOf(r))},${y(r.high || 0)}`)
    .concat([...band].reverse().map((r) => `${x(records.indexOf(r))},${y(r.low || 0)}`))
    .join(" ");
  return (
    <section className="card history-card">
      <div className="card-heading">
        <div>
          <h2>Historical context</h2>
          <p>VIIRS-reference indicator · 1-km cell-days / UTC month</p>
        </div>
        <div className="chart-legend">
          <span>
            <i className="legend-dash" />
            Estimated from MODIS
          </span>
          <span>
            <i className="legend-line" />
            Observed VIIRS
          </span>
        </div>
      </div>
      <div className="history-chart">
        <svg
          id="historical-indicator-figure"
          viewBox="0 0 1100 235"
          role="img"
          aria-label="Complete 302-month historical indicator. Purple dashed estimates through January 2012; blue observations thereafter. Table provides exact values."
        >
          <rect x="55" y="35" width={x(seam) - 55} height="155" fill="#F1EDF8" />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1="55"
                x2="1045"
                y1={y(t * ceiling)}
                y2={y(t * ceiling)}
                stroke="#dce2e8"
                strokeDasharray="3 4"
              />
              <text x="46" y={y(t * ceiling) + 4} textAnchor="end">
                {formatNumber(t * ceiling)}
              </text>
            </g>
          ))}
          <line x1={x(seam)} x2={x(seam)} y1="30" y2="190" stroke="#7255a5" strokeDasharray="4 4" />
          <text x={x(seam) + 5} y="23">
            Feb 2012 · method seam
          </text>
          <polyline
            points={line(records.filter((r) => isEstimated(r.date)))}
            fill="none"
            stroke="#7255A5"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
          <polyline
            points={line(records.filter((r) => !isEstimated(r.date)))}
            fill="none"
            stroke="#2463A6"
            strokeWidth="2"
          />
          {records
            .filter((_, i) => (i % 60 === 0 && i < 285) || i === 301)
            .map((r) => (
              <text key={r.date} x={x(records.indexOf(r))} y="216" textAnchor="middle">
                {r.date.slice(0, 4)}
              </text>
            ))}
        </svg>
      </div>
      <div className="chart-footnote">
        <button
          className="text-link"
          onClick={() =>
            exportFigure("historical-indicator-figure", "FireLens_historical_indicator.svg")
          }
        >
          Export chart SVG
        </button>
        <span>
          <Info size={13} />
          2000 includes Nov–Dec only. The method seam is not guaranteed trend-neutral. Early
          residual bands are heuristic; see monthly data.
        </span>
        <button className="text-link" onClick={() => setTable(!table)} aria-expanded={table}>
          View monthly data <ChevronDown size={14} />
        </button>
      </div>
      {table && (
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Historical monthly data"
        >
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Indicator, cell-days</th>
                <th>Status</th>
                <th>Heuristic band</th>
                <th>Explore</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.date}>
                  <td>{dateLabel(r.date)}</td>
                  <td>{formatNumber(value(r))}</td>
                  <td>{isEstimated(r.date) ? "Estimated from MODIS" : "Observed VIIRS"}</td>
                  <td>
                    {r.low != null
                      ? `${formatNumber(r.low)}–${formatNumber(r.high)}`
                      : "Not applicable"}
                  </td>
                  <td>
                    <button className="text-link" onClick={() => onSelect(r.date)}>
                      Select {dateLabel(r.date, true)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export function ComparisonChart({
  records,
  start,
  end,
}: {
  records: MonthRecord[];
  start: string;
  end: string;
}) {
  if (!records.length) return null;
  const first = index(start),
    last = index(end),
    max = Math.ceil(Math.max(1, ...records.flatMap((r) => [r.modis, r.viirs || 0])) / 100) * 100;
  const x = (s: string) =>
      last === first ? 550 : 55 + ((index(s) - first) / (last - first)) * 990,
    y = (v: number) => 180 - (v / max) * 140;
  const path = (sensor: "modis" | "viirs") => {
    let drawing = false;
    return records
      .map((r) => {
        const v = r[sensor];
        if (v == null) {
          drawing = false;
          return "";
        }
        const point = `${drawing ? "L" : "M"}${x(r.date)},${y(v)}`;
        drawing = true;
        return point;
      })
      .join(" ");
  };
  return (
    <div className="comparison-chart-block">
      <div className="comparison-chart-key">
        <span>Observed 1-km cell-days · UTC month</span>
        <div>
          <span>
            <i className="series-square modis" />
            MODIS
          </span>
          <span>
            <i className="status-dot viirs" />
            VIIRS S-NPP
          </span>
        </div>
      </div>
      <div className="sensor-chart">
        <svg
          id="sensor-comparison-figure"
          viewBox="0 0 1100 240"
          role="img"
          aria-label="Observed monthly sensor comparison; dashed orange MODIS, solid blue VIIRS. Exact values follow in the table."
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1="55"
                x2="1045"
                y1={y(t * max)}
                y2={y(t * max)}
                stroke="#DCE2E8"
                strokeDasharray="3 4"
              />
              <text x="45" y={y(t * max) + 4} textAnchor="end">
                {formatNumber(max * t)}
              </text>
            </g>
          ))}
          <path
            d={path("modis")}
            fill="none"
            stroke="#B95022"
            strokeWidth="2"
            strokeDasharray="5 2"
          />
          <path d={path("viirs")} fill="none" stroke="#2463A6" strokeWidth="2" />
          {records.map((r) => (
            <g key={r.date}>
              <circle cx={x(r.date)} cy={y(r.modis)} r="2.5" fill="#B95022">
                <title>
                  {dateLabel(r.date)} MODIS: {r.modis}
                </title>
              </circle>
              {r.viirs != null && (
                <circle cx={x(r.date)} cy={y(r.viirs)} r="2.5" fill="#2463A6">
                  <title>
                    {dateLabel(r.date)} VIIRS: {r.viirs}
                  </title>
                </circle>
              )}
            </g>
          ))}
          {records
            .filter(
              (_, i) =>
                i === 0 || i === records.length - 1 || (records.length > 24 && i % 60 === 0),
            )
            .map((r) => (
              <text key={r.date} x={x(r.date)} y="208" textAnchor="middle">
                {dateLabel(r.date, true)}
              </text>
            ))}
        </svg>
      </div>
      <p className="comparison-chart-note">
        <button
          className="text-link"
          onClick={() =>
            exportFigure("sensor-comparison-figure", `FireLens_comparison_${start}_${end}.svg`)
          }
        >
          Export comparison SVG
        </button>{" "}
        VIIRS unavailable before February 2012. Zero detections do not establish complete coverage.
        Both sensors use the same count axis.
      </p>
    </div>
  );
}
