import bundle from "../generated/bundle.json";
export { bundle };
export type Sensor = "viirs" | "modis";
export type View = "explore" | "comparison" | "method" | "downloads";
export type MonthRecord = {
  date: string;
  modis: number;
  viirs: number | null;
  estimated: number | null;
  diagnostic?: number;
  note?: string;
  low?: number | null;
  high?: number | null;
  flag?: string;
  status?: string;
  modis_raw?: number;
  viirs_raw?: number | null;
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MIN_DATE = "2000-11";
export const MAX_DATE = "2025-12";
export const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);
export const formatNumber = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("en-US", { maximumFractionDigits: 1 });
export const dateKey = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;
export const dateLabel = (date: string, short = false) => {
  const [year, month] = date.split("-").map(Number);
  return `${short ? MONTHS[month - 1].slice(0, 3) : MONTHS[month - 1]} ${year}`;
};
export const isEstimated = (date: string) => date < "2012-02";

export function shiftMonth(date: string, direction: number): string {
  const [year, month] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + direction, 1));
  const key = dateKey(next.getUTCFullYear(), next.getUTCMonth());
  return key < MIN_DATE ? MIN_DATE : key > MAX_DATE ? MAX_DATE : key;
}

export function monthRange(start: string, end: string): string[] {
  if (start < MIN_DATE || end > MAX_DATE || end < start) return [];
  const dates: string[] = [];
  for (let date = start; date <= end; date = shiftMonth(date, 1)) {
    dates.push(date);
    if (date === end || date === MAX_DATE) break;
  }
  return dates;
}

export function buildCsv(dates: string[], _records: MonthRecord[]): string {
  const source = bundle.monthlyRows.filter((r) => dates.includes(r.month));
  if (!source.length) return "";
  const keys = Object.keys(source[0]) as (keyof (typeof source)[0])[];
  const escape = (v: string) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  return (
    [keys.join(","), ...source.map((r) => keys.map((k) => escape(r[k])).join(","))].join("\r\n") +
    "\r\n"
  );
}
export function downloadProduct(name: string) {
  const content = (bundle.csv as Record<string, string>)[name];
  if (!content) throw Error("Download is unavailable: " + name);
  downloadFile(content, name);
}
export function loadRecords(): Promise<MonthRecord[]> {
  return Promise.resolve().then(() => {
    const records = bundle.records as MonthRecord[];
    if (
      records.length !== 302 ||
      records[0].date !== MIN_DATE ||
      records[301].date !== MAX_DATE ||
      records.some((r) => !Number.isFinite(r.modis))
    )
      throw Error("Invalid local calendar bundle");
    return records;
  });
}

export function downloadFile(contents: string, filename: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\uFEFF", contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFigure(
  id: string,
  filename: string,
  context?: { unit?: string; notes?: string[] },
) {
  const original = document.getElementById(id);
  if (!original) throw Error("Figure is unavailable");
  const figure = original.cloneNode(true) as SVGSVGElement;
  figure.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  figure.style.background = "#FFFFFF";
  figure.style.fontFamily = "Arial,sans-serif";
  const box = figure.viewBox.baseVal;
  const height = box.height;
  const notes = context?.notes ?? [];
  figure.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${height + 45 + notes.length * 18}`);
  const caption = document.createElementNS("http://www.w3.org/2000/svg", "text");
  caption.setAttribute("x", "12");
  caption.setAttribute("y", String(height + 25));
  caption.setAttribute("font-size", "11");
  caption.setAttribute("fill", "#18232D");
  caption.textContent =
    "FireLens · AI-assisted code/visualization · NASA FIRMS detections · not unique wildfires";
  figure.appendChild(caption);
  notes.forEach((note, index) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "text");
    line.setAttribute("x", "12");
    line.setAttribute("y", String(height + 43 + index * 18));
    line.setAttribute("font-size", "11");
    line.setAttribute("fill", "#18232D");
    line.textContent = note;
    figure.appendChild(line);
  });
  const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
  metadata.textContent = JSON.stringify({
    ai_assistance:
      "Code and visualization implementation assisted by AI; original NASA observations unchanged.",
    description: original.getAttribute("aria-label"),
    source: "NASA FIRMS",
    unit: context?.unit ?? "1-km cell-days / UTC month",
    notes: context?.notes,
  });
  figure.appendChild(metadata);
  downloadFile(
    new XMLSerializer().serializeToString(figure),
    filename,
    "image/svg+xml;charset=utf-8",
  );
}

export const VALIDATION = bundle.validation;
