import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/hooks/useLocation';
import { fetchCurrentEnvironment } from '@/services/api';
import type { CurrentEnvironmentData } from '@/types';
import { Activity, Info, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export default function ExposurePage() {
  const [loc, setLoc] = useLocation();
  const [envData, setEnvData] = useState<CurrentEnvironmentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCurrentEnvironment(loc.lat, loc.lon, loc.name)
      .then(setEnvData)
      .finally(() => setLoading(false));
  }, [loc.lat, loc.lon, loc.name]);

  const score = envData?.exposureIndicator?.score ?? 72;
  const level = envData?.exposureIndicator?.level ?? 'High';

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-sky-600 uppercase flex items-center gap-1.5 mb-1">
            <Activity className="h-4 w-4" /> Explainable Risk Assessment
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Environmental Health Exposure Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quantitative environmental exposure indicator and factor breakdown (Non-diagnostic decision support).
          </p>
        </div>
        <div className="max-w-xs w-full">
          <LocationSearch onSelect={setLoc} />
        </div>
      </div>

      {/* Main Exposure Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card border flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Calculated Exposure Indicator</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold text-foreground">{score}</span>
              <span className="text-muted-foreground text-sm font-semibold">/ 100</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${score >= 70 ? 'bg-amber-600' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                STATUS: {level.toUpperCase()} EXPOSURE
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/60 border text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Explainability Overview:</p>
            <p>"{envData?.exposureIndicator?.explanation || 'Current environmental conditions contribute substantially to the calculated exposure-risk indicator.'}"</p>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-sky-500 flex-shrink-0" />
            Decision support metrics calculated using ambient PM2.5, AQI, outdoor duration, and atmospheric conditions.
          </div>
        </Card>

        {/* Factors Breakdown */}
        <Card className="p-6 lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold">Environmental Exposure Risk Factors</h2>
          <p className="text-xs text-muted-foreground">
            Contribution percentage of each monitored environmental parameter to the total exposure score.
          </p>

          <div className="space-y-5">
            {envData?.exposureIndicator?.factorBreakdown?.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{item.factor} ({item.value})</span>
                  <span className="text-sky-600 font-bold">{item.contribution}%</span>
                </div>
                <Progress value={item.contribution * 2} className="h-2 bg-secondary" />
                <p className="text-[11px] text-muted-foreground">{item.explanation}</p>
              </div>
            )) || (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium"><span>PM2.5 Concentration (68 µg/m³)</span><span className="font-bold text-sky-600">38%</span></div>
                  <Progress value={76} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium"><span>AQI Level (Level 4/5)</span><span className="font-bold text-sky-600">25%</span></div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium"><span>Outdoor Exposure Duration (3 hours)</span><span className="font-bold text-sky-600">18%</span></div>
                  <Progress value={36} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium"><span>Temperature &amp; Humidity (26°C, 55%)</span><span className="font-bold text-sky-600">12%</span></div>
                  <Progress value={24} className="h-2" />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

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
