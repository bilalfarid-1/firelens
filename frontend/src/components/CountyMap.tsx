import { useEffect, useState } from "react";
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
import { bundle, exportFigure, type Sensor } from "../lib/data";

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

  const active = bundle.grid.filter(
    (p) => p[0] === date && Number(p[sensor === "modis" ? 5 : 6]) > 0,
  );
  const days = (p: (string | number)[]) => Number(p[sensor === "modis" ? 5 : 6]);
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
        <div className="segmented" aria-label="Map sensor">
          <button
            aria-pressed={sensor === "viirs"}
            disabled={estimated}
            onClick={() => setSensor("viirs")}
          >
            VIIRS S-NPP
          </button>
          <button aria-pressed={sensor === "modis"} onClick={() => setSensor("modis")}>
            MODIS
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
            aria-label={`${date}: ${active.length} occupied ${sensor} cells; ${total} cell-days. Cell data available in map details.`}
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
                const [x, y] = project(Number(p[3]), Number(p[4]));
                return (
                  <circle
                    key={`${p[1]}:${p[2]}`}
                    data-detection="true"
                    cx={x}
                    cy={y}
                    r={Math.min(9, 2 + Math.sqrt(days(p)) * 1.2)}
                    fill={sensor === "modis" ? "#B95022" : "#2463A6"}
                    fillOpacity=".68"
                    stroke="white"
                    strokeWidth=".6"
                  >
                    <title>
                      {sensor}: {days(p)} UTC days · approximate center {p[3]}, {p[4]}
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
          <span className={`status-dot ${sensor}`} />
          {sensor === "viirs" ? "VIIRS S-NPP" : "MODIS"} · {active.length} cells · {total} cell-days
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
      <div className="map-footer">
        <button
          className="text-link"
          onClick={() =>
            exportFigure("county-detections-figure", `FireLens_map_${date}_${sensor}.svg`)
          }
        >
          Export map SVG
        </button>
        <div className="map-data-notice">
          <Info size={14} />
          <span>
            {estimated ? "VIIRS unavailable before February 2012. " : ""}
            {active.length
              ? "Bubble size: recorded UTC days per 1-km cell."
              : "No retained detections; complete observation coverage is not established."}
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
                {date} · {sensor} observed occupied cells
              </caption>
              <thead>
                <tr>
                  <th>Grid x</th>
                  <th>Grid y</th>
                  <th>Longitude</th>
                  <th>Latitude</th>
                  <th>UTC days</th>
                </tr>
              </thead>
              <tbody>
                {active.map((p) => (
                  <tr key={`${p[1]}:${p[2]}`}>
                    <td>{p[1]}</td>
                    <td>{p[2]}</td>
                    <td>{p[3]}</td>
                    <td>{p[4]}</td>
                    <td>{days(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <strong>Geography, not a fire footprint.</strong>
          <p>
            Simplified official California outline. Full-resolution county membership independently
            matches all source rows. City dots are geographic references. Markers are cell centers,
            not fire footprints. No modeled spatial locations are generated.
          </p>
        </div>
      )}
    </section>
  );
}
