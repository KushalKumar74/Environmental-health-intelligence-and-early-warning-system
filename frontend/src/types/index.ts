export type AlertSeverity = 'INFO' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type UserRole = 'USER' | 'FACILITY_USER' | 'ADMIN';

export interface EnvironmentalFactor {
  factor: string;
  value: string;
  contribution: number;
  explanation: string;
}

export interface ExposureIndicator {
  score: number;
  level: string;
  statusText: string;
  explanation: string;
  factorBreakdown: EnvironmentalFactor[];
}

export interface CurrentEnvironmentData {
  locationName: string;
  coordinates: { lat: number; lon: number };
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  components: Record<string, number>;
  exposureIndicator: ExposureIndicator;
  sourceInfo: {
    source: string;
    timestamp: string;
    isLive: boolean;
  };
}

export interface EnvironmentalAlertData {
  _id: string;
  alertId: string;
  type: string;
  severity: AlertSeverity;
  locationName: string;
  pollutant: string;
  observedValue: number;
  thresholdValue: number;
  message: string;
  recommendedMonitoringAction: string;
  status: AlertStatus;
  createdAt: string;
}

export interface EventTimelineItem {
  stage: string;
  timestamp: string;
  description: string;
  pm25Value?: number;
}

export interface EnvironmentalEventData {
  _id: string;
  eventId: string;
  type: string;
  locationName: string;
  latitude: number;
  longitude: number;
  pollutant: string;
  startTime: string;
  peakTime: string;
  peakValue: number;
  baselineValue: number;
  durationMinutes: number;
  severity: AlertSeverity;
  confidenceScore: number;
  status: 'DETECTION' | 'INCREASING' | 'PEAK' | 'MONITORING' | 'BASELINE' | 'RESOLVED';
  timeline: EventTimelineItem[];
}

export interface FacilityData {
  _id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'elderly-care' | 'rehabilitation' | 'school';
  address: string;
  locationName: string;
  latitude: number;
  longitude: number;
  capacity: number;
  monitoringStatus: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  alertStatus: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface FacilityReadingData {
  _id: string;
  facilityId: string;
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  indoorAirIndex: number;
  ventilationStatus: string;
}

export interface ForecastItem {
  time: string;
  timestamp: number;
  predictedPm25: number;
  predictedAqi: number;
  exposureScore: number;
  exposureCategory: string;
  temperature: number;
  humidity: number;
}

export interface ModelEvalMetrics {
  mae: number;
  rmse: number;
  r2: number;
  accuracy: number;
  anomalyPrecision: number;
  anomalyRecall: number;
  anomalyF1: number;
}

export interface ModelEvalData {
  modelName: string;
  modelVersion: string;
  lastTrained: string;
  metrics: ModelEvalMetrics;
  forecastVsActualSample: Array<{ sample: number; actual: number; predicted: number }>;
}

export interface AdminStatsData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalFacilities: number;
    activeAlerts: number;
    activeEvents: number;
  };
  apiStatus: Record<string, string>;
  systemHealth: Record<string, string>;
}
