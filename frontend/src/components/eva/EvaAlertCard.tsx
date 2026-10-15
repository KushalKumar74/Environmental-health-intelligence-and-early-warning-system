import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EvaAlertCardProps {
  data: {
    alertId?: string;
    trigger?: string;
    observed?: number;
    location?: string;
    timestamp?: string;
  };
}

export default function EvaAlertCard({ data }: EvaAlertCardProps) {
  if (!data) return null;

  return (
    <Card className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 my-2 shadow-sm">
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div>
            <h4 className="font-bold text-xs text-foreground">Environmental Alert Explanation</h4>
            <p className="text-[10px] text-muted-foreground">{data.location || 'Bangalore'} • {data.timestamp || 'Today'}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">
          Threshold Triggered
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="p-2 rounded-xl bg-background/80 border space-y-1">
          <p className="font-bold text-[11px] text-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" /> Trigger Condition:
          </p>
          <p className="text-[11px] text-muted-foreground">{data.trigger || 'PM2.5 exceeded threshold'} (Observed: {data.observed || 168} AQI)</p>
        </div>

        <div className="p-2 rounded-xl bg-background/80 border space-y-1">
          <p className="font-bold text-[11px] text-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Safety Recommendation:
          </p>
          <p className="text-[11px] text-muted-foreground">Consider reducing prolonged outdoor heavy exertion during peak evening hours.</p>
        </div>
      </div>
    </Card>
  );
}
