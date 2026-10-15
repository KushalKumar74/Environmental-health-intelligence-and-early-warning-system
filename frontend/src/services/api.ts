import type {
  CurrentEnvironmentData,
  EnvironmentalAlertData,
  EnvironmentalEventData,
  FacilityData,
  FacilityReadingData,
  ForecastItem,
  ModelEvalData,
  AdminStatsData,
} from '@/types';

const BASE = '/api';

export async function fetchCurrentEnvironment(lat: number, lon: number, locationName: string): Promise<CurrentEnvironmentData> {
  const res = await fetch(`${BASE}/environment/current?lat=${lat}&lon=${lon}&locationName=${encodeURIComponent(locationName)}`);
  if (!res.ok) throw new Error('Failed to fetch current environment data');
  const json = await res.json();
  return json.data;
}

export async function fetchEnvironmentForecast(lat: number, lon: number): Promise<{ hourlyForecast: ForecastItem[]; weeklyWeather: any[] }> {
  const res = await fetch(`${BASE}/environment/forecast?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

export async function fetchEnvironmentHistory(days: number = 7, token?: string): Promise<any[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/environment/history?days=${days}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch history');
  const json = await res.json();
  return json.data;
}

export async function fetchAlerts(severity?: string, status?: string): Promise<EnvironmentalAlertData[]> {
  let url = `${BASE}/alerts`;
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const json = await res.json();
  return json.data;
}

export async function acknowledgeAlert(alertId: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  await fetch(`${BASE}/alerts/${alertId}/acknowledge`, { method: 'POST', headers });
}

export async function dismissAlert(alertId: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  await fetch(`${BASE}/alerts/${alertId}/dismiss`, { method: 'POST', headers });
}

export async function fetchEnvironmentalEvents(): Promise<EnvironmentalEventData[]> {
  const res = await fetch(`${BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const json = await res.json();
  return json.data;
}

export async function fetchFacilities(locationName?: string, lat?: number, lon?: number): Promise<FacilityData[]> {
  let url = `${BASE}/facilities`;
  const params = new URLSearchParams();
  if (locationName) params.append('locationName', locationName);
  if (lat) params.append('lat', String(lat));
  if (lon) params.append('lon', String(lon));
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch facilities');
  const json = await res.json();
  return json.data;
}

export async function fetchFacilityReadings(facilityId: string): Promise<FacilityReadingData[]> {
  const res = await fetch(`${BASE}/facilities/${facilityId}/readings`);
  if (!res.ok) throw new Error('Failed to fetch facility readings');
  const json = await res.json();
  return json.data;
}

export async function fetchMapLayers(): Promise<any> {
  const res = await fetch(`${BASE}/environment/map-layers`);
  if (!res.ok) throw new Error('Failed to fetch map layers');
  const json = await res.json();
  return json.layers;
}

export async function queryAssistantApi(
  question?: string,
  locationName: string = 'Bangalore',
  lat: number = 12.9716,
  lon: number = 77.5946,
  history?: Array<{ sender: 'user' | 'bot'; text: string }>,
  attachmentText?: string,
  actionId?: string,
  pageContext?: string,
  vacationParams?: any
): Promise<{
  success: boolean;
  answer: string;
  responseType?: string;
  title?: string;
  breadcrumbs?: string[];
  category?: string;
  badge?: string;
  structuredData?: any;
  menuOptions?: any[];
  quickActions?: any[];
  disclaimer?: string;
}> {
  const res = await fetch(`${BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, locationName, lat, lon, history, attachmentText, actionId, pageContext, vacationParams }),
  });
  if (!res.ok) throw new Error('Assistant query failed');
  return res.json();
}

export async function fetchAdminStats(token: string): Promise<AdminStatsData> {
  const res = await fetch(`${BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export async function fetchModelEvaluation(token: string): Promise<ModelEvalData> {
  const res = await fetch(`${BASE}/admin/model-eval`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch model evaluation');
  const json = await res.json();
  return json.data;
}

export async function fetchEnvironmentReport(locationName: string, days: number = 7): Promise<any> {
  const res = await fetch(`${BASE}/reports/environment?locationName=${encodeURIComponent(locationName)}&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  const json = await res.json();
  return json.data;
}
