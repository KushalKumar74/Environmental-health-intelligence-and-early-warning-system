import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sun, CloudRain, Clock, CheckCircle2 } from 'lucide-react';

interface DayItem {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  rainContingency: string;
}

interface EvaItineraryCardProps {
  data: {
    destination: string;
    travelPeriod: string;
    pace: string;
    daysCount: number;
    activityTheme: string;
    weatherSummary: string;
    days: DayItem[];
  };
}

export default function EvaItineraryCard({ data }: EvaItineraryCardProps) {
  if (!data || !data.days) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl space-y-3 my-2 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          <div>
            <h4 className="font-extrabold text-xs text-foreground">
              {data.destination} — {data.daysCount}-Day Itinerary
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {data.pace} Pace • {data.activityTheme} Focus
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">
          Custom Plan
        </Badge>
      </div>

      <div className="text-[11px] bg-background/70 p-2 rounded-xl border border-border/50 text-muted-foreground flex items-center justify-between">
        <span>🌤 Weather Forecast:</span>
        <span className="font-semibold text-foreground">{data.weatherSummary}</span>
      </div>

      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {data.days.map((day) => (
          <div key={day.day} className="p-3 bg-background/90 border border-border/80 rounded-xl space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                Day {day.day}: {day.title}
              </span>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>

            <div className="space-y-1 text-[11px] text-muted-foreground pt-0.5">
              <p className="flex items-start gap-1">
                <Sun className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Morning:</strong> {day.morning}</span>
              </p>
              <p className="flex items-start gap-1">
                <Sun className="h-3 w-3 text-sky-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Afternoon:</strong> {day.afternoon}</span>
              </p>
              <p className="flex items-start gap-1">
                <CheckCircle2 className="h-3 w-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Evening:</strong> {day.evening}</span>
              </p>
              {day.rainContingency && (
                <p className="flex items-start gap-1 text-[10px] text-sky-600 dark:text-sky-400 pt-1 border-t border-border/30">
                  <CloudRain className="h-3 w-3 text-sky-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Rain Plan:</strong> {day.rainContingency}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
