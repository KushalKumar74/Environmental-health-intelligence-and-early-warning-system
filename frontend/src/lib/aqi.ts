// AQI category mapping. OpenWeather returns 1..5; we expose richer EPA-style buckets.
export type AqiCategory = {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  color: string; // tailwind class fragment
  textColor: string;
};

export const AQI_CATEGORIES: Record<number, AqiCategory> = {
  1: { level: 1, label: "Good", description: "Air quality is satisfactory; minimal risk.", color: "bg-aqi-good", textColor: "text-aqi-good" },
  2: { level: 2, label: "Fair", description: "Acceptable; some pollutants may pose minor concern for very sensitive groups.", color: "bg-aqi-moderate", textColor: "text-aqi-moderate" },
  3: { level: 3, label: "Moderate", description: "Sensitive groups may experience health effects.", color: "bg-aqi-sensitive", textColor: "text-aqi-sensitive" },
  4: { level: 4, label: "Poor", description: "Everyone may begin to experience adverse effects.", color: "bg-aqi-unhealthy", textColor: "text-aqi-unhealthy" },
  5: { level: 5, label: "Very Poor", description: "Health warnings of emergency conditions.", color: "bg-aqi-very-unhealthy", textColor: "text-aqi-very-unhealthy" },
};

export const getAqiCategory = (level: number): AqiCategory =>
  AQI_CATEGORIES[Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5];

export const POLLUTANT_LABELS: Record<string, { name: string; unit: string }> = {
  co: { name: "CO", unit: "μg/m³" },
  no: { name: "NO", unit: "μg/m³" },
  no2: { name: "NO₂", unit: "μg/m³" },
  o3: { name: "O₃", unit: "μg/m³" },
  so2: { name: "SO₂", unit: "μg/m³" },
  pm2_5: { name: "PM₂.₅", unit: "μg/m³" },
  pm10: { name: "PM₁₀", unit: "μg/m³" },
  nh3: { name: "NH₃", unit: "μg/m³" },
};
