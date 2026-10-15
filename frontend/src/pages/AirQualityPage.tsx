import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationSearch from '@/components/LocationSearch';
import PollutantGrid from '@/components/PollutantGrid';
import { useLocation, LocationLabel } from '@/hooks/useLocation';
import { getCurrentAqi, type AqiSnapshot } from '@/services/openweather';
import { Wind, Gauge, ShieldAlert, Thermometer, Droplets, ArrowUpRight } from 'lucide-react';
import { getAqiCategory } from '@/lib/aqi';

export default function AirQualityPage() {
  const [loc, setLoc] = useLocation();
  const [snapshot, setSnapshot] = useState<AqiSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCurrentAqi(loc.lat, loc.lon)
      .then(setSnapshot)
      .finally(() => setLoading(false));
  }, [loc.lat, loc.lon]);

  const cat = snapshot ? getAqiCategory(snapshot.aqi) : null;

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-sky-600 uppercase flex items-center gap-1.5 mb-1">
            <Wind className="h-4 w-4" /> Environmental Health Intelligence
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Air Quality &amp; Atmospheric Telemetry</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time pollutant breakdown, PM2.5, PM10, gas metrics, and environmental parameters.
          </p>
        </div>
        <div className="max-w-xs w-full">
          <LocationSearch onSelect={setLoc} />
        </div>
      </div>

      <LocationLabel loc={loc} />

      {/* Main Status & Pollutant Grid */}
      {snapshot && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Comprehensive Pollutant Analysis</h2>
                <p className="text-xs text-muted-foreground">Concentration measurements in µg/m³</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${cat?.color}`}>
                  AQI Level {snapshot.aqi} / 5 — {cat?.label}
                </span>
              </div>
            </div>
            <PollutantGrid snapshot={snapshot} />
          </Card>

          {/* Breakdown cards for gas metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Fine Particulate Matter (PM₂.₅)</span>
                <Gauge className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold">{snapshot.components.pm2_5} <span className="text-xs font-normal text-muted-foreground">µg/m³</span></p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Penetrates deep into respiratory pathways. Primary driver for calculated exposure indicators.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Coarse Particulates (PM₁₀)</span>
                <Wind className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold">{snapshot.components.pm10} <span className="text-xs font-normal text-muted-foreground">µg/m³</span></p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Includes dust, pollen, and airborne particles. Indicates coarse airborne mass density.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
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
    </div>
  );
}
