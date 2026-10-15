import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palmtree, CloudRain, Sun, Gauge, CheckCircle2 } from 'lucide-react';

interface EvaTravelCardProps {
  data: {
    destination: string;
    travelPeriod: string;
    temperature: string;
    weatherDesc: string;
    humidity: string;
    rainProbability: string;
    aqiLevel: number;
    isFarAhead?: boolean;
    outlook: string;
    suggestedActivities: string[];
  };
}

export default function EvaTravelCard({ data }: EvaTravelCardProps) {
  if (!data) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-500/30 rounded-2xl space-y-3 my-2 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Palmtree className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h4 className="font-extrabold text-sm text-foreground">{data.destination} Vacation</h4>
            <p className="text-[10px] text-muted-foreground">{data.travelPeriod}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">
          Travel Forecast
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-background/80 border space-y-0.5">
          <Sun className="h-3.5 w-3.5 mx-auto text-amber-500" />
          <span className="text-[10px] text-muted-foreground">Temp</span>
          <p className="font-bold text-foreground text-xs">{data.temperature}</p>
        </div>

        <div className="p-2 rounded-xl bg-background/80 border space-y-0.5">
          <CloudRain className="h-3.5 w-3.5 mx-auto text-sky-500" />
          <span className="text-[10px] text-muted-foreground">Rain</span>
          <p className="font-bold text-foreground text-xs">{data.rainProbability}</p>
        </div>

        <div className="p-2 rounded-xl bg-background/80 border space-y-0.5">
          <Gauge className="h-3.5 w-3.5 mx-auto text-emerald-500" />
          <span className="text-[10px] text-muted-foreground">AQI</span>
          <p className="font-bold text-foreground text-xs">Level {data.aqiLevel}/5</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-background/60 border text-xs space-y-1">
        <p className="font-bold text-[11px] text-foreground">Vacation Outlook:</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{data.outlook}</p>
      </div>

      {data.suggestedActivities && data.suggestedActivities.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Recommended Activities:</p>
          <ul className="space-y-1">
            {data.suggestedActivities.map((act, idx) => (
              <li key={idx} className="text-[11px] text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
