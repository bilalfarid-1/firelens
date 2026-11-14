import { useMemo } from "react";
import { MONTHS, formatNumber, dateLabel, isEstimated, type MonthRecord } from "../lib/data";
export default function SeasonalContext({
  records,
  onSelect,
  date,
}: {
  records: MonthRecord[];
  onSelect: (s: string) => void;
  date: string;
}) {
  const months = useMemo(
    () =>
      MONTHS.map((name, i) => {
        const counts = records
          .filter(
            (r) => r.date >= "2013-01" && r.date <= "2023-12" && Number(r.date.slice(5)) === i + 1,
          )
          .map((r) => r.viirs)
          .filter((n): n is number => n !== null)
          .sort((a, b) => a - b);
        return {
          name,
          median: counts[Math.floor(counts.length / 2)],
          month: String(i + 1).padStart(2, "0"),
        };
      }),
    [records],
  );
  const max = Math.max(...months.map((m) => m.median), 1);
  const selected = records.find((r) => r.date === date);
  const selectedValue = selected ? (isEstimated(date) ? selected.estimated : selected.viirs) : null;
  const baseline = months[Number(date.slice(5)) - 1].median;
  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <h2>Seasonal context</h2>
          <p>
            Median observed VIIRS cell-days for each UTC calendar month, 2013–2023. Historical
            detection activity, not predicted fire risk.
          </p>
        </div>
      </div>
      <div className="seasonal-bars">
        {months.map((m) => (
          <button
            key={m.name}
            onClick={() => onSelect(date.slice(0, 4) + "-" + m.month)}
            aria-label={`${m.name}: training-period median ${m.median} cell-days; explore this month`}
          >
            <span>{m.name.slice(0, 3)}</span>
            <span className="seasonal-track">
              <i style={{ height: `${Math.max(2, (m.median / max) * 100)}%` }} />
            </span>
            <strong>{formatNumber(m.median)}</strong>
          </button>
        ))}
      </div>
      <p className="chart-footnote">
        {dateLabel(date)}: {formatNumber(selectedValue)}{" "}
        {isEstimated(date) ? "estimated" : "observed VIIRS"} cell-days; same-month 2013–2023 VIIRS
        median: {formatNumber(baseline)}. This comparison does not correct observation coverage.
      </p>
      <p className="chart-footnote">
        The same-month baseline helps inspect historical seasonality. Orbit, cloud and algorithm
        differences remain; this is not an early-warning system.
      </p>
    </section>
  );
}
