import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { dateLabel, formatNumber, isEstimated, type MonthRecord } from "../lib/data";

export default function HistoryChart({
  records,
  onSelect,
}: {
  records: MonthRecord[];
  onSelect: (date: string) => void;
}) {
  const [showTable, setShowTable] = useState(false);
  const x = (date: string) => {
    const [y, m] = date.split("-").map(Number);
    return 58 + ((y - 2000 + (m - 1) / 12) / 26) * 1002;
  };
  const y = (value: number) => 174 - (value / 1500) * 136;
  return (
    <section className="card history-card">
      <div className="card-heading">
        <div>
          <h2>Historical context</h2>
          <p>VIIRS-reference indicator · 1-km cell-days per UTC month</p>
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
      <div
        className="history-chart"
        tabIndex={0}
        role="region"
        aria-label="Scrollable historical context chart"
      >
        <svg
          viewBox="0 0 1100 215"
          role="img"
          aria-label="Sparse historical chart showing only two supplied observed VIIRS values: November 2018, 1,220; July 2024, 58. No line connects missing months. Observed VIIRS begins February 2012."
        >
          <rect x="58" y="23" width={x("2012-02") - 58} height="151" fill="#f5f2f9" rx="3" />
          {[0, 500, 1000, 1500].map((tick) => (
            <g key={tick}>
              <line
                x1="58"
                x2="1060"
                y1={y(tick)}
                y2={y(tick)}
                stroke="#e8ecf0"
                strokeDasharray={tick ? "3 4" : undefined}
              />
              <text x="42" y={y(tick) + 4} textAnchor="end">
                {formatNumber(tick)}
              </text>
            </g>
          ))}
          <line
            x1={x("2012-02")}
            x2={x("2012-02")}
            y1="22"
            y2="174"
            stroke="#9d8aaf"
            strokeDasharray="4 4"
          />
          <text x={x("2012-02") + 9} y="16" className="seam-label">
            FEB 2012 · VIIRS begins
          </text>
          <text x="83" y="58" className="chart-period">
            ESTIMATED HISTORY
          </text>
          <text x="83" y="76" className="chart-hint">
            Calendar records not supplied
          </text>
          {records
            .filter((r) => !isEstimated(r.date) && r.viirs !== null)
            .map((record) => (
              <g key={record.date}>
                <line
                  x1={x(record.date)}
                  x2={x(record.date)}
                  y1={y(record.viirs!)}
                  y2="174"
                  stroke="#2463a6"
                  strokeWidth="3"
                  opacity=".3"
                />
                <circle
                  cx={x(record.date)}
                  cy={y(record.viirs!)}
                  r="5"
                  fill="#2463a6"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x(record.date) - 10}
                  y={y(record.viirs!) - 12}
                  textAnchor="end"
                  className="chart-value"
                >
                  {dateLabel(record.date, true)} · {formatNumber(record.viirs)}
                </text>
              </g>
            ))}
          {[2000, 2005, 2010, 2015, 2020, 2025].map((year) => (
            <text key={year} x={x(`${year}-01`)} y="200" textAnchor="middle">
              {year}
            </text>
          ))}
        </svg>
      </div>
      <div className="chart-footnote">
        <span>
          <Info size={13} />
          Only supplied monthly examples are plotted. Gaps are not zero. 2000 includes Nov–Dec only.
        </span>
        <button
          className="text-link"
          onClick={() => setShowTable(!showTable)}
          aria-expanded={showTable}
        >
          View data <ChevronDown size={14} className={showTable ? "rotate" : ""} />
        </button>
      </div>
      {showTable && (
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable historical data table"
        >
          <table>
            <caption className="sr-only">Available historical monthly observations</caption>
            <thead>
              <tr>
                <th>Month</th>
                <th>Reference indicator</th>
                <th>Status</th>
                <th>Explore</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.date}>
                  <td>{dateLabel(r.date)}</td>
                  <td>{formatNumber(isEstimated(r.date) ? r.estimated : r.viirs)} cell-days</td>
                  <td>{isEstimated(r.date) ? "Estimate not supplied" : "Observed VIIRS"}</td>
                  <td>
                    <button className="text-link" onClick={() => onSelect(r.date)}>
                      Select month
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
