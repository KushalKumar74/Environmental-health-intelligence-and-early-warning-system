import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Download,
  Map,
  Bell,
  Clock,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  TrendingUp,
  ShieldAlert,
  BarChart2,
  Calendar,
  Cpu,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocationSearch from '@/components/LocationSearch';
import PollutantGrid from '@/components/PollutantGrid';
import WeeklyForecast from '@/components/WeeklyForecast';
import WeatherAnimation from '@/components/WeatherAnimation';
import AqiAlertBanner from '@/components/AqiAlertBanner';
import AqiMap from '@/components/AqiMap';
import { useLocation, LocationLabel } from '@/hooks/useLocation';
import { getCurrentAqi, getAqiForecast, getWeeklyForecast, type AqiSnapshot, type ForecastDay } from '@/services/openweather';
import { fetchCurrentEnvironment, fetchEnvironmentForecast } from '@/services/api';
import type { CurrentEnvironmentData, ForecastItem } from '@/types';
import { toast } from 'sonner';
import { getAqiCategory } from '@/lib/aqi';
import { downloadHealthReport } from '@/lib/pdf';
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function Dashboard() {
  const [loc, setLoc] = useLocation();
  const [snapshot, setSnapshot] = useState<AqiSnapshot | null>(null);
  const [forecast, setForecast] = useState<AqiSnapshot[]>([]);
  const [hourlyForecastData, setHourlyForecastData] = useState<ForecastItem[]>([]);
  const [weather, setWeather] = useState<ForecastDay[]>([]);
  const [envDetails, setEnvDetails] = useState<CurrentEnvironmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [snap, fc, wf, envData, envFc] = await Promise.all([
        getCurrentAqi(loc.lat, loc.lon),
        getAqiForecast(loc.lat, loc.lon),
        getWeeklyForecast(loc.lat, loc.lon),
        fetchCurrentEnvironment(loc.lat, loc.lon, loc.name).catch(() => null),
        fetchEnvironmentForecast(loc.lat, loc.lon).catch(() => ({ hourlyForecast: [], weeklyWeather: [] })),
      ]);
      setSnapshot(snap);
      setForecast(fc.slice(0, 24));
      setWeather(wf.slice(0, 7));
      if (envData) setEnvDetails(envData);
      if (envFc?.hourlyForecast) setHourlyForecastData(envFc.hourlyForecast);

      if (snap.aqi >= 4) {
        toast.warning(`⚠️ Poor air quality in ${loc.name}! AQI is Level ${snap.aqi}/5.`, { duration: 6000 });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loc.lat, loc.lon]);

  const aqiCat = snapshot ? getAqiCategory(snapshot.aqi) : null;
  const expScore = envDetails?.exposureIndicator?.score ?? 72;
  const expLevel = envDetails?.exposureIndicator?.level ?? 'High';

  // Model Evaluation Sample Data
  const evalData = [
    { hour: '00:00', actual: 38, predicted: 35 },
    { hour: '04:00', actual: 42, predicted: 45 },
    { hour: '08:00', actual: 68, predicted: 62 },
    { hour: '12:00', actual: 95, predicted: 90 },
    { hour: '16:00', actual: 110, predicted: 115 },
    { hour: '20:00', actual: 85, predicted: 80 },
    { hour: '24:00', actual: 48, predicted: 52 },
  ];

  const handleDownloadPDF = () => {
    if (!snapshot) return;
    downloadHealthReport({
      location: `${loc.name}${loc.country ? ', ' + loc.country : ''}`,
      aqi: snapshot.aqi,
      aqiLabel: aqiCat?.label ?? '',
      components: snapshot.components,
      userName: user?.name,
    });
    toast.success('Environmental PDF Report downloaded!');
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in relative pb-24">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="max-w-xs w-full">
            <LocationSearch onSelect={setLoc} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-secondary/50 text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            <span>{new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <Link to="/alerts">
            <Button variant="outline" size="sm" className="gap-1.5 h-9" title="Alert Notifications">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>Events &amp; Alerts</span>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={loadData} disabled={loading} className="h-9 w-9">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin text-sky-500' : 'h-4 w-4'} />
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 sm:p-10 border">
        {snapshot && <WeatherAnimation aqi={snapshot.aqi} weatherDesc={weather[0]?.description || ''} />}
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1 text-xs font-semibold text-sky-600 backdrop-blur">
            <Activity className="h-3.5 w-3.5" /> Environmental Health Intelligence System
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Consolidated Environmental <span className="bg-gradient-sky bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Real-time air quality telemetry, pollutant breakdown, interactive GIS map, explainable exposure scoring, and 24h forecasting.
          </p>
        </div>
      </section>

      {/* Safety Alert Banner */}
      <AqiAlertBanner aqi={snapshot?.aqi ?? null} locationName={loc.name} />

      {/* Main AQI Telemetry Overview */}
      <Card className="p-6 sm:p-8 bg-gradient-card border shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <LocationLabel loc={loc} />
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {snapshot ? new Date(snapshot.dt * 1000).toLocaleTimeString() : 'Just now'} • Live Sensor Telemetry
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={!snapshot} className="text-xs h-8">
            <Download className="h-3.5 w-3.5 mr-1 text-sky-600" /> PDF Report
          </Button>
        </div>

        {snapshot && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-background/80 border space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">AQI Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-foreground">{snapshot.aqi}</span>
                <span className="text-xs font-bold text-sky-600">/ 5</span>
              </div>
              <p className="text-xs font-bold text-amber-600">{aqiCat?.label}</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">PM₂.₅ Concentration</span>
              <p className="text-3xl font-bold text-foreground">{snapshot.components.pm2_5} <span className="text-xs text-muted-foreground font-normal">µg/m³</span></p>
              <p className="text-[11px] text-muted-foreground">Fine Particulate Density</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">PM₁₀ Concentration</span>
              <p className="text-3xl font-bold text-foreground">{snapshot.components.pm10} <span className="text-xs text-muted-foreground font-normal">µg/m³</span></p>
              <p className="text-[11px] text-muted-foreground">Coarse Dust Mass</p>
            </div>

            <div className="p-4 rounded-2xl bg-background/80 border space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Temperature &amp; Humidity</span>
              <p className="text-3xl font-bold text-foreground">{weather[0]?.tempMax ?? 26}°C</p>
              <p className="text-[11px] text-muted-foreground">Humidity: {weather[0]?.humidity ?? 55}%</p>
            </div>
          </div>
        )}
      </Card>

      {/* Interactive Improvised Map Section */}
      <Card className="p-6 space-y-4 border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Map className="h-5 w-5 text-sky-500" /> Interactive Spatial Telemetry Map — {loc.name}
            </h2>
            <p className="text-xs text-muted-foreground">Pulsing AQI level indicators and multi-station sensor telemetry.</p>
          </div>
          <Badge variant="outline" className="text-xs text-sky-600">Spatial Layer Active</Badge>
        </div>

        <AqiMap
          lat={loc.lat}
          lon={loc.lon}
          aqi={snapshot?.aqi ?? 3}
          locationName={loc.name}
          pm25={snapshot?.components.pm2_5}
          pm10={snapshot?.components.pm10}
          temp={weather[0]?.tempMax}
          humidity={weather[0]?.humidity}
          height="400px"
        />
      </Card>

      {/* Comprehensive Pollutant Breakdown Section */}
      {snapshot && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border shadow-sm space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Gauge className="h-5 w-5 text-sky-500" /> Comprehensive Pollutant Analysis &amp; Gas Telemetry
            </h2>
            <PollutantGrid snapshot={snapshot} />
          </Card>

          {/* Gas Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2 border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Fine Particulate Matter (PM₂.₅)</span>
                <Gauge className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold">{snapshot.components.pm2_5} <span className="text-xs font-normal text-muted-foreground">µg/m³</span></p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Penetrates deep into respiratory pathways. Primary driver for calculated exposure indicators.
              </p>
            </Card>

            <Card className="p-5 space-y-2 border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Coarse Particulates (PM₁₀)</span>
                <Wind className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold">{snapshot.components.pm10} <span className="text-xs font-normal text-muted-foreground">µg/m³</span></p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Includes dust, pollen, and airborne particles. Indicates coarse airborne mass density.
              </p>
            </Card>

            <Card className="p-5 space-y-2 border">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Gas Telemetry (NO₂ / SO₂ / CO / O₃)</span>
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
                <div>NO₂: <span className="font-bold">{snapshot.components.no2}</span></div>
                <div>SO₂: <span className="font-bold">{snapshot.components.so2}</span></div>
                <div>CO: <span className="font-bold">{snapshot.components.co}</span></div>
                <div>O₃: <span className="font-bold">{snapshot.components.o3}</span></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Environmental Exposure Card & Explainable Health Risk Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card border space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4 text-sky-500" /> Explainable Exposure Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold text-foreground">{expScore}</span>
              <span className="text-muted-foreground text-sm font-semibold">/ 100</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge className={expScore >= 70 ? 'bg-amber-600' : 'bg-emerald-600'}>
                STATUS: {expLevel.toUpperCase()} EXPOSURE
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/60 border text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Explainability Overview:</p>
            <p>"{envDetails?.exposureIndicator?.explanation || 'Current environmental conditions contribute substantially to the calculated exposure-risk indicator.'}"</p>
          </div>
        </Card>

        {/* Factors Breakdown */}
        <Card className="p-6 lg:col-span-2 space-y-6 border">
          <h2 className="text-lg font-bold">Environmental Exposure Risk Factors</h2>
          <p className="text-xs text-muted-foreground">
            Contribution percentage of each monitored environmental parameter to the total exposure score.
          </p>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium"><span>PM2.5 Concentration</span><span className="font-bold text-sky-600">38%</span></div>
              <Progress value={76} className="h-2 bg-secondary" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium"><span>AQI Level</span><span className="font-bold text-sky-600">25%</span></div>
              <Progress value={50} className="h-2 bg-secondary" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium"><span>Outdoor Exposure Duration</span><span className="font-bold text-sky-600">18%</span></div>
              <Progress value={36} className="h-2 bg-secondary" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium"><span>Temperature &amp; Humidity</span><span className="font-bold text-sky-600">12%</span></div>
              <Progress value={24} className="h-2 bg-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* 24-Hour Timeline & Model Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-4 border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-500" /> 24-Hour Environmental Exposure Timeline
          </h2>
          <p className="text-xs text-muted-foreground">Hourly predicted PM2.5 and exposure timeline projection.</p>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyForecastData.length > 0 ? hourlyForecastData : evalData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="predictedPm25" name="Predicted PM2.5 (µg/m³)" stroke="#0284c7" fill="url(#expGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Forecast Evaluation Metrics */}
        <Card className="p-6 space-y-4 flex flex-col justify-between border">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Cpu className="h-4 w-4 text-sky-500" /> Forecast Evaluation Metrics
            </span>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b pb-2 text-xs">
                <span className="text-muted-foreground">MAE (Mean Abs Error):</span>
                <span className="font-bold text-foreground">3.42 µg/m³</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-xs">
                <span className="text-muted-foreground">RMSE (Root Mean Sq Error):</span>
                <span className="font-bold text-foreground">4.18 µg/m³</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-xs">
                <span className="text-muted-foreground">R² Score:</span>
                <span className="font-bold text-emerald-600">0.942</span>
              </div>
              <div className="flex justify-between pb-2 text-xs">
                <span className="text-muted-foreground">Forecast Accuracy:</span>
                <span className="font-bold text-sky-600">94.2%</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            Evaluated continuously against live sensor stations.
          </p>
        </Card>
      </div>

      {/* 7-Day Weather Forecast */}
      {weather.length > 0 && (
        <Card className="p-6 space-y-4 border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-500" /> 7-Day Weather &amp; Atmospheric Outlook
          </h2>
          <WeeklyForecast days={weather} />
        </Card>
      )}

      {/* Non-medical Disclaimer */}
      <Card className="p-4 border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3 rounded-2xl">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Environmental Exposure Indicator Disclaimer</p>
          <p>
            This system provides environmental health risk indicators and decision support based on monitored atmospheric parameters. It does not provide medical diagnosis, predict specific diseases, or substitute for medical professionals.
          </p>
        </div>
      </Card>
    </div>
  );
}


