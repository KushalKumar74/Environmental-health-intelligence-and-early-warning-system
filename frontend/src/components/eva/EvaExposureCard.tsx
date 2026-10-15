import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldCheck, TrendingDown } from 'lucide-react';

interface EvaExposureCardProps {
  data: {
    period: string;
    score: number;
    avgPm25: number;
    status: string;
  };
}

export default function EvaExposureCard({ data }: EvaExposureCardProps) {
  if (!data) return null;

  return (
    <Card className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl space-y-3 my-2 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <div>
            <h4 className="font-bold text-xs text-foreground">Environmental Exposure Score</h4>
            <p className="text-[10px] text-muted-foreground">Personal Telemetry Baseline</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-[10px]">
          {data.status} Exposure
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-background/80 border space-y-0.5">
          <ShieldCheck className="h-4 w-4 mx-auto text-emerald-500" />
          <span className="text-[10px] text-muted-foreground">Exposure Risk Index</span>
          <p className="font-bold text-foreground text-sm">{data.score} / 100</p>
        </div>

        <div className="p-2 rounded-xl bg-background/80 border space-y-0.5">
          <TrendingDown className="h-4 w-4 mx-auto text-sky-500" />
          <span className="text-[10px] text-muted-foreground">Avg PM2.5 Intake</span>
          <p className="font-bold text-foreground text-sm">{data.avgPm25} µg/m³</p>
        </div>
      </div>
    </Card>
  );
}
