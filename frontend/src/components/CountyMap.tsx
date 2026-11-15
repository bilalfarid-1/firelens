import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Expand,
  Info,
  Layers2,
  LocateFixed,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { bundle, downloadFile, exportFigure, type Sensor } from "../lib/data";
import {
  buildSensorOverlap,
  canCompareObservedMonth,
  sensorOverlapCsv,
  type SensorOverlapCategory,
} from "../lib/sensorOverlap";

const overlapColors: Record<SensorOverlapCategory, string> = {
  both: "#7746a0",
  modis_only: "#b95022",
  viirs_only: "#2463a6",
};

type Feature = {
  properties: { GEOID: string; NAME: string };
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
};
type Boundaries = { features: Feature[] };

function pathFor(feature: Feature) {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);
  return polygons
    .map((polygon) =>
      polygon
        .map(
          (ring) =>
            ring
              .map(([lng, lat], index) => {
                const [x, y] = project(lng, lat);
                return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(" ") + "Z",
        )
        .join(" "),
    )
    .join(" ");
}

const coordinates = bundle.boundary.features[0].geometry.coordinates.flat() as number[][];
const lonMin = Math.min(...coordinates.map((p) => p[0])),
  lonMax = Math.max(...coordinates.map((p) => p[0]));
const latMin = Math.min(...coordinates.map((p) => p[1])),
  latMax = Math.max(...coordinates.map((p) => p[1]));
const cosine = Math.cos((39.7 * Math.PI) / 180),
  scale = Math.min(650 / ((lonMax - lonMin) * cosine), 350 / (latMax - latMin));
function project(lng: number, lat: number) {
  return [
    400 + (lng - (lonMin + lonMax) / 2) * cosine * scale,
    218 - (lat - (latMin + latMax) / 2) * scale,
  ];
}

export default function CountyMap({
  sensor,
  setSensor,
  estimated,
  date,
}: {
  sensor: Sensor;
  setSensor: (sensor: Sensor) => void;
  estimated: boolean;
  date: string;
}) {
  const [data, setData] = useState<Boundaries | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(false);
  const [overlapMode, setOverlapMode] = useState(false);
  const record = bundle.records.find((row) => row.date === date);
  const overlapAvailable = !estimated && canCompareObservedMonth(record);
  const showOverlap = overlapMode && overlapAvailable;
  // The data is immutable; recalculate only when the selected month changes.
  const comparison = useMemo(() => buildSensorOverlap(bundle.grid, date), [date]);

  useEffect(() => {
    if (!overlapAvailable) setOverlapMode(false);
  }, [overlapAvailable]);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    Promise.resolve(bundle.boundary as unknown as Boundaries)
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!expanded) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [expanded]);

  const active = comparison.cells.filter((p) =>
    showOverlap || (sensor === "modis" ? p.modisDays > 0 : p.viirsDays > 0),
  );
  const days = (p: (typeof active)[number]) =>
    sensor === "modis" ? p.modisDays : p.viirsDays;
  const total = active.reduce((n, p) => n + days(p), 0);
  const cities = [
    { name: "Chico", lng: -121.8375, lat: 39.7285 },
    { name: "Paradise", lng: -121.6219, lat: 39.7596 },
    { name: "Oroville", lng: -121.5564, lat: 39.5138 },
    { name: "Gridley", lng: -121.6936, lat: 39.3638 },
  ];

  return (
    <section
      className={`card map-card ${expanded ? "map-expanded" : ""}`}
      aria-label="County activity map"
    >
      <div className="card-heading map-heading">
        <div className="section-title">
          <Layers2 size={17} />
          <h2>County activity map</h2>
        </div>
        <div className="segmented" aria-label="Map display mode">
          <button
            aria-pressed={!showOverlap && sensor === "viirs"}
            disabled={estimated}
            onClick={() => { setOverlapMode(false); setSensor("viirs"); }}
          >
            VIIRS S-NPP
          </button>
          <button
            aria-pressed={!showOverlap && sensor === "modis"}
            onClick={() => { setOverlapMode(false); setSensor("modis"); }}
          >
            MODIS
          </button>
          <button
            aria-pressed={showOverlap}
            disabled={!overlapAvailable}
            title={!overlapAvailable ? "Observed VIIRS required for overlap comparisons" : undefined}
            onClick={() => setOverlapMode(true)}
          >
            Overlap
          </button>
        </div>
      </div>
      <div className="map-surface">
        {error ? (
          <div className="map-error">
            <Info size={24} />
            <strong>County boundary couldn’t load</strong>
            <p>Check your connection and retry the local asset.</p>
            <button className="secondary-button" onClick={() => setAttempt((n) => n + 1)}>
              <RotateCcw size={15} />
              Retry map
            </button>
          </div>
        ) : !data ? (
          <div className="map-error" role="status">
            <span className="loading-spinner" />
            <span>Loading county boundary…</span>
          </div>
        ) : (
          <svg
            className="county-svg"
            id="county-detections-figure"
            viewBox="0 0 800 436"
            role="img"
            aria-label={showOverlap
              ? `${date}: ${comparison.counts.both} shared cells, ${comparison.counts.modis_only} MODIS-only cells, ${comparison.counts.viirs_only} VIIRS-only cells. Same month, not necessarily same UTC day.`
              : `${date}: ${active.length} occupied ${sensor} cells; ${total} cell-days. Cell data available in map details.`}
          >
            <defs>
              <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="#d9e1da" strokeWidth=".6" />
              </pattern>
              <pattern id="county-grid" width="9" height="9" patternUnits="userSpaceOnUse">
                <path d="M9 0H0V9" fill="none" stroke="#a6bbb1" strokeWidth=".35" />
              </pattern>
              <filter id="county-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="7"
                  floodColor="#355a48"
                  floodOpacity=".06"
                />
              </filter>
            </defs>
            <rect width="800" height="436" fill="#eef1e9" />
            <rect width="800" height="436" fill="url(#map-grid)" opacity=".7" />
            <g transform={`translate(400 218) scale(${zoom}) translate(-400 -218)`}>
              {data.features
                .filter((f) => f.properties.GEOID !== "06007")
                .map((feature) => (
                  <path
                    key={feature.properties.GEOID}
                    d={pathFor(feature)}
                    fill="#e9ede5"
                    stroke="#cbd3c8"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              {data.features
                .filter((f) => f.properties.GEOID === "06007")
                .map((feature) => (
                  <g key={feature.properties.GEOID} filter="url(#county-shadow)">
                    <path
                      d={pathFor(feature)}
                      fill="#dae5d9"
                      stroke="#718b78"
                      strokeWidth="1.7"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              {active.map((p) => {
                const [x, y] = project(p.longitude, p.latitude);
                return (
                  <circle
                    key={`${p.gridX}:${p.gridY}`}
                    data-detection="true"
                    data-overlap-category={showOverlap ? p.category : undefined}
                    cx={x}
                    cy={y}
                    r={Math.min(9, 2 + Math.sqrt(showOverlap ? Math.max(p.modisDays, p.viirsDays) : days(p)) * 1.2)}
                    fill={showOverlap ? overlapColors[p.category] : sensor === "modis" ? "#B95022" : "#2463A6"}
                    fillOpacity=".73"
                    stroke="white"
                    strokeWidth=".6"
                  >
                    <title>
                      {showOverlap
                        ? `${p.category.replace(/_/g, " ")}: MODIS ${p.modisDays}, VIIRS ${p.viirsDays} UTC cell-days · approximate center ${p.longitude}, ${p.latitude}`
                        : `${sensor}: ${days(p)} UTC days · approximate center ${p.longitude}, ${p.latitude}`}
                    </title>
                  </circle>
                );
              })}
              {cities.map((city) => {
                const [x, y] = project(city.lng, city.lat);
                return (
                  <g key={city.name}>
                    <circle cx={x} cy={y} r="2.6" fill="#718174" stroke="#fff" strokeWidth="1.2" />
                    <text x={x + 8} y={y + 4} className="city-name">
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
        <div className="map-label">
          <span className="outline-key" />
          Butte County <span className="map-geoid">06007</span>
        </div>
        <div className="map-controls">
          <button
            onClick={() => setZoom((n) => Math.min(2.2, n + 0.3))}
            disabled={zoom >= 2.2}
            aria-label="Zoom in"
          >
            <Plus size={17} />
          </button>
          <button
            onClick={() => setZoom((n) => Math.max(0.7, n - 0.3))}
            disabled={zoom <= 0.7}
            aria-label="Zoom out"
          >
            <Minus size={17} />
          </button>
          <button onClick={() => setZoom(1)} aria-label="Reset map extent">
            <LocateFixed size={17} />
          </button>
        </div>
        <div className="map-north">
          <span>N</span>
          <Compass size={27} strokeWidth={1.3} />
        </div>
        <div className="map-preview-label">
          <span className={`status-dot ${showOverlap ? "overlap" : sensor}`} />
          {showOverlap
            ? `${comparison.counts.both} both · ${comparison.counts.modis_only} MODIS-only · ${comparison.counts.viirs_only} VIIRS-only`
            : `${sensor === "viirs" ? "VIIRS S-NPP" : "MODIS"} · ${active.length} cells · ${total} cell-days`}
        </div>
        <button
          className="map-expand"
          aria-label={expanded ? "Close expanded map" : "Expand map"}
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X size={17} /> : <Expand size={17} />}
        </button>
        <div className="map-attribution">California official-derived display outline</div>
      </div>
      {showOverlap && (
        <div className="map-overlap-summary" aria-label="Monthly grid-cell overlap summary">
          <div className="map-overlap-legend">
            <span><i className="map-swatch" style={{ backgroundColor: overlapColors.both }} />Both sensors: <strong>{comparison.counts.both}</strong></span>
            <span><i className="map-swatch" style={{ backgroundColor: overlapColors.modis_only }} />MODIS only: <strong>{comparison.counts.modis_only}</strong></span>
            <span><i className="map-swatch" style={{ backgroundColor: overlapColors.viirs_only }} />VIIRS only: <strong>{comparison.counts.viirs_only}</strong></span>
          </div>
          <p>Shared 1-km cells occupied during the same UTC month; not necessarily the same day or fire event. Satellite coverage completeness is unknown.</p>
        </div>
      )}
      <div className="map-footer">
        <button
          className="text-link"
          onClick={() =>
            exportFigure("county-detections-figure", `FireLens_map_${date}_${showOverlap ? "overlap" : sensor}.svg`)
          }
        >
          Export map SVG
        </button>
        {showOverlap && (
          <button
            className="text-link"
            onClick={() => downloadFile(sensorOverlapCsv(comparison), `FireLens_overlap_${date}.csv`)}
          >
            Export overlap CSV
          </button>
        )}
        <div className="map-data-notice">
          <Info size={14} />
          <span>
            {showOverlap
              ? "Bubble size: greater of the two observed monthly cell-day counts."
              : `${estimated ? "VIIRS unavailable before February 2012. " : ""}${active.length
                  ? "Bubble size: recorded UTC days per 1-km cell."
                  : "No retained detections; complete observation coverage is not established."}`}
          </span>
        </div>
        <button className="text-link" onClick={() => setDetails(!details)} aria-expanded={details}>
          About this map <Info size={13} />
        </button>
      </div>
      {details && (
        <div className="map-details">
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Map cell data">
            <table>
              <caption>
                {date} · {showOverlap ? "observed sensor overlap" : `${sensor} observed occupied cells`}
              </caption>
              <thead>
                <tr>
                  <th>Grid x</th>
                  <th>Grid y</th>
                  <th>Longitude</th>
                  <th>Latitude</th>
                  {showOverlap ? (
                    <>
                      <th>MODIS UTC days</th>
                      <th>VIIRS UTC days</th>
                      <th>Category</th>
                    </>
                  ) : <th>UTC days</th>}
                </tr>
              </thead>
              <tbody>
                {active.map((p) => (
                  <tr key={`${p.gridX}:${p.gridY}`}>
                    <td>{p.gridX}</td>
                    <td>{p.gridY}</td>
                    <td>{p.longitude}</td>
                    <td>{p.latitude}</td>
                    {showOverlap ? (
                      <>
                        <td>{p.modisDays}</td>
                        <td>{p.viirsDays}</td>
                        <td>{p.category.replace(/_/g, " ")}</td>
                      </>
                    ) : <td>{days(p)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <strong>Geography, not a fire footprint.</strong>
          <p>
            Simplified official California outline. Full-resolution county membership independently
            matches all source rows. City dots are geographic references. Markers are cell centers,
            not fire footprints. No modeled spatial locations are generated. In overlap mode,
            "both" means both sensors recorded activity in a grid cell during the selected
            month; it does not mean they detected the same fire or observed it simultaneously.
          </p>
        </div>
      )}
    </section>
  );
}
