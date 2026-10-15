import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Thermometer, Droplets, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EvaDataCardProps {
  data: {
    location?: string;
    aqi?: number;
    category?: string;
    pm25?: number;
    pm10?: number;
    temp?: number;
    humidity?: number;
    windSpeed?: number;
    riskLevel?: string;
    healthRecommendation?: string;
  };
}

const getAqiColor = (aqi?: number) => {
  if (aqi === undefined) return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
  if (aqi <= 50) return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Good' };
  if (aqi <= 100) return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400', label: 'Moderate' };
  if (aqi <= 150) return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'Unhealthy Sensitive' };
  if (aqi <= 200) return { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-600 dark:text-red-400', label: 'Unhealthy' };
  return { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-600 dark:text-purple-400', label: 'Very Unhealthy / Hazardous' };
};

export default function EvaDataCard({ data }: EvaDataCardProps) {
  if (!data) return null;

  const colorStyle = getAqiColor(data.aqi);

  return (
    <Card className={`p-3.5 border rounded-2xl space-y-3 my-2 shadow-sm ${colorStyle.bg}`}>
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${colorStyle.text}`} />
          <div>
            <h4 className="font-bold text-xs text-foreground">{data.location || 'Telemetry Update'}</h4>
            <p className="text-[10px] text-muted-foreground">Environmental Snapshot</p>
          </div>
        </div>

        {data.aqi !== undefined && (
          <Badge variant="outline" className={`text-[10px] font-bold ${colorStyle.text} border-current`}>
            AQI {data.aqi} • {data.category || colorStyle.label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
        {data.pm25 !== undefined && (
          <div className="p-1.5 rounded-lg bg-background/80 border space-y-0.5">
            <span className="text-[9px] text-muted-foreground block font-medium">PM2.5</span>
            <span className="font-bold text-foreground text-xs">{data.pm25}</span>
            <span className="text-[8px] text-muted-foreground block">µg/m³</span>
          </div>
        )}

        {data.pm10 !== undefined && (
          <div className="p-1.5 rounded-lg bg-background/80 border space-y-0.5">
            <span className="text-[9px] text-muted-foreground block font-medium">PM10</span>
            <span className="font-bold text-foreground text-xs">{data.pm10}</span>
            <span className="text-[8px] text-muted-foreground block">µg/m³</span>
          </div>
        )}

        {data.temp !== undefined && (
          <div className="p-1.5 rounded-lg bg-background/80 border space-y-0.5">
            <Thermometer className="h-3 w-3 mx-auto text-amber-500" />
            <span className="font-bold text-foreground text-xs">{data.temp}°C</span>
            <span className="text-[8px] text-muted-foreground block">Temp</span>
          </div>
        )}

        {data.humidity !== undefined && (
          <div className="p-1.5 rounded-lg bg-background/80 border space-y-0.5">
            <Droplets className="h-3 w-3 mx-auto text-sky-500" />
            <span className="font-bold text-foreground text-xs">{data.humidity}%</span>
            <span className="text-[8px] text-muted-foreground block">Humidity</span>
          </div>
        )}
      </div>

      {data.healthRecommendation && (
        <div className="p-2 rounded-xl bg-background/80 border text-xs space-y-1">
          <p className="font-semibold text-[10px] text-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Recommendation
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">{data.healthRecommendation}</p>
        </div>
      )}
    </Card>
  );
}
