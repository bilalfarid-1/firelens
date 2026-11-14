import { dateLabel, formatNumber, type MonthRecord } from "../lib/data";

function monthIndex(date: string) {
  const [year, month] = date.split("-").map(Number);
  return year * 12 + month - 1;
}

export default function ComparisonChart({
  records,
  start,
  end,
}: {
  records: MonthRecord[];
  start: string;
  end: string;
}) {
  if (!records.length || !start || !end || end < start) return null;
  const first = monthIndex(start);
  const last = monthIndex(end);
  const highest = Math.max(500, ...records.flatMap((r) => [r.modis, r.viirs ?? 0]));
  const ceiling = Math.ceil(highest / 500) * 500;
  const x = (date: string) =>
    last === first ? 550 : 65 + ((monthIndex(date) - first) / (last - first)) * 980;
  const y = (count: number) => 177 - (count / ceiling) * 138;
  const step = ceiling <= 500 ? 100 : 500;
  const ticks = Array.from({ length: ceiling / step + 1 }, (_, i) => step * i);
  return (
    <div className="comparison-chart-block">
      <div className="comparison-chart-key">
        <span>Observed 1-km cell-days</span>
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
      <div
        className="sensor-chart"
        role="region"
        tabIndex={0}
        aria-label="Scrollable observed sensor comparison chart"
      >
        <svg
          viewBox="0 0 1100 225"
          role="img"
          aria-label="MODIS and VIIRS observed monthly cell-day counts, on one shared zero-based axis. Only supplied records are plotted; gaps are not zero. VIIRS is absent before February 2012. Exact values are in the following table."
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1="65"
                x2="1045"
                y1={y(tick)}
                y2={y(tick)}
                stroke="#e4eaf0"
                strokeDasharray={tick ? "3 4" : undefined}
              />
              <text x="48" y={y(tick) + 4} textAnchor="end">
                {formatNumber(Math.round(tick))}
              </text>
            </g>
          ))}
          {records.map((r) => (
            <g key={r.date}>
              <line
                x1={x(r.date)}
                x2={x(r.date)}
                y1="30"
                y2="177"
                stroke="#e8edf1"
                strokeDasharray="2 4"
              />
              <rect
                x={x(r.date) - 8}
                y={y(r.modis) - 4}
                width="8"
                height="8"
                rx="1"
                fill="#b95022"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text
                x={x(r.date) - 13}
                y={y(r.modis) + 3}
                textAnchor="end"
                className="modis-chart-label"
              >
                {formatNumber(r.modis)}
              </text>
              {r.viirs !== null && (
                <>
                  <circle
                    cx={x(r.date) + 4}
                    cy={y(r.viirs)}
                    r="4.5"
                    fill="#2463a6"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <text x={x(r.date) + 15} y={y(r.viirs) + 3} className="viirs-chart-label">
                    {formatNumber(r.viirs)}
                  </text>
                </>
              )}
              <text x={x(r.date)} y="199" textAnchor="middle">
                {dateLabel(r.date, true)}
              </text>
            </g>
          ))}
          <text x="65" y="221">
            {last === first
              ? dateLabel(start)
              : `Selected window: ${dateLabel(start, true)} – ${dateLabel(end, true)}`}
          </text>
          <text x="1045" y="221" textAnchor="end">
            UTC month
          </text>
        </svg>
      </div>
      <p className="comparison-chart-note">
        Supplied observations only. Points are not connected across missing months; no VIIRS
        observations are plotted before February 2012.
      </p>
    </div>
  );
}
