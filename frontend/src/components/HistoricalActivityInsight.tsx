import { useMemo } from "react";
import { ArrowUpRight, Info, TrendingUp, TriangleAlert } from "lucide-react";
import type { MonthRecord } from "../lib/data";
import { dateLabel, formatNumber } from "../lib/data";
import { analyzeHistoricalActivity, notableHistoricalMonths } from "../lib/anomaly";

export default function HistoricalActivityInsight({
  records,
  date,
  onSelect,
}: {
  records: MonthRecord[];
  date: string;
  onSelect: (date: string) => void;
}) {
  const selected = useMemo(() => analyzeHistoricalActivity(records, date), [records, date]);
  const notable = useMemo(() => notableHistoricalMonths(records), [records]);

  return (
    <section className="card activity-card" aria-labelledby="activity-title">
      <div className="card-heading">
        <div>
          <h2 id="activity-title">Historical activity insight</h2>
          <p>Retrospective comparison of observed VIIRS S-NPP cell-days</p>
        </div>
        <TrendingUp size={18} aria-hidden="true" />
      </div>
      {selected ? (
        <div className="activity-content">
          <div className="activity-topline">
            <h3>{dateLabel(date)}</h3>
            <span className={`activity-state activity-state-${selected.category}`}>
              {selected.category === "markedly_elevated"
                ? "Markedly elevated"
                : selected.category === "above_comparison_max"
                  ? "Above comparison maximum"
                  : "Within comparison range"}
            </span>
          </div>
          <div className="activity-stat-grid">
            <div>
              <span>Observed VIIRS</span>
              <strong>{formatNumber(selected.observed)}</strong>
              <small>1-km cell-days</small>
            </div>
            <div>
              <span>Same-month median</span>
              <strong>{formatNumber(selected.median)}</strong>
              <small>{selected.comparisonYears.length} other comparison years</small>
            </div>
            <div>
              <span>Comparison maximum</span>
              <strong>{formatNumber(selected.maximum)}</strong>
              <small>2013–2023 reference window</small>
            </div>
          </div>
          <p className="activity-explanation">
            {selected.category === "markedly_elevated" ? (
              <>
                This month was <strong>{selected.ratioToMedian?.toFixed(2)}×</strong> its
                same-month comparison median and exceeded every comparison year.
              </>
            ) : selected.category === "above_comparison_max" ? (
              <>
                This month exceeded the highest comparison observation
                {selected.ratioToMedian !== null
                  ? ` (${selected.ratioToMedian.toFixed(2)}× the median).`
                  : ". The median is zero, so no ratio is displayed."}
              </>
            ) : (
              <>
                This month did not exceed the highest comparison observation
                {selected.ratioToMedian !== null
                  ? ` (${selected.ratioToMedian.toFixed(2)}× the median).`
                  : ". The median is zero, so no ratio is displayed."}
              </>
            )}
          </p>
          {selected.qualityFlag === "large_sensor_disagreement" && (
            <p className="activity-quality-warning">
              <TriangleAlert size={16} aria-hidden="true" />
              Significant MODIS–VIIRS disagreement. Known S-NPP outages overlap July 2024;
              this observation should not be interpreted as complete-month coverage.
            </p>
          )}
          <p className="activity-method-note">
            <Info size={15} aria-hidden="true" />
            Comparison uses observed VIIRS values from the same calendar month in
            2013–2023, excluding the selected year. “Markedly elevated” means above the
            comparison maximum and at least 3× its nonzero median (an exploratory
            threshold). Not a count of fires, risk alert or significance test.
            Satellite observation completeness has not been independently established.
          </p>
        </div>
      ) : (
        <p className="activity-unavailable">
          Historical VIIRS comparison is unavailable for this month. This feature
          requires observed VIIRS data from 2013 onward and at least eight other
          same-month comparison years. Estimated early-year values are never used as observations.
        </p>
      )}
      {notable.length > 0 && (
        <div className="activity-examples">
          <span>Explore notable months</span>
          <div>
            {notable.map((event) => (
              <button
                key={event.date}
                type="button"
                className="activity-example"
                aria-pressed={event.date === date}
                onClick={() => onSelect(event.date)}
              >
                {dateLabel(event.date, true)} · {formatNumber(event.observed)}
                <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
