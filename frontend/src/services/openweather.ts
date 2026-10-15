/**
 * API service layer fetching from our backend.
 */
const BASE = "/api/aqi";

/* ---------- Types ---------- */
export interface GeoResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface AqiSnapshot {
  aqi: 1 | 2 | 3 | 4 | 5;
  components: Record<string, number>;
  dt: number;
  coord: { lat: number; lon: number };
}

export interface ForecastDay {
  date: string; // ISO date (yyyy-mm-dd)
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

/* ---------- Endpoints ---------- */
export async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch(`${BASE}/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to geocode");
  return res.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoResult[]> {
  const res = await fetch(`${BASE}/reverse-geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to reverse geocode");
  return res.json();
}

export async function getCurrentAqi(lat: number, lon: number): Promise<AqiSnapshot> {
  const res = await fetch(`${BASE}/current?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch current AQI");
  return res.json();
}

export async function getAqiForecast(lat: number, lon: number): Promise<AqiSnapshot[]> {
  const res = await fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch AQI forecast");
  return res.json();
}

export async function getWeeklyForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const res = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch weather forecast");
  const data: ForecastDay[] = await res.json();
  const list = [...data];
  while (list.length < 7 && list.length > 0) {
    const last = list[list.length - 1];
    const lastDate = new Date(last.date);
    lastDate.setDate(lastDate.getDate() + 1);
    list.push({
      date: lastDate.toISOString().slice(0, 10),
      tempMin: Math.round(last.tempMin - 1),
      tempMax: Math.round(last.tempMax + 1),
      description: last.description,
      icon: last.icon,
      humidity: last.humidity,
      windSpeed: last.windSpeed,
    });
  }
  return list.slice(0, 7);
}
