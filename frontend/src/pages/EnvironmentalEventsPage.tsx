import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchEnvironmentalEvents } from '@/services/api';
import type { EnvironmentalEventData } from '@/types';
import { Activity, ShieldAlert, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function EnvironmentalEventsPage() {
  const [events, setEvents] = useState<EnvironmentalEventData[]>([]);

  useEffect(() => {
    fetchEnvironmentalEvents().then(setEvents).catch(() => {});
  }, []);

  const stages = ['Detection', 'Increasing', 'Peak', 'Monitoring', 'Baseline', 'Resolved'];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase flex items-center gap-1.5 mb-1">
          <AlertOctagon className="h-4 w-4" /> Anomaly Event Intelligence
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Environmental Event Management &amp; Anomaly Lifecycle</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pollution anomaly records detected by the Isolation Forest ML model and their lifecycle tracking.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.map((evt) => (
          <Card key={evt._id} className="p-6 space-y-6 border-l-4 border-l-rose-500 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{evt.eventId}</h2>
                  <Badge className="bg-rose-600">{evt.severity}</Badge>
                  <span className="text-xs text-muted-foreground">• {evt.locationName}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pollutant: <span className="font-semibold text-foreground">{evt.pollutant}</span> | Peak Observed: <span className="font-semibold text-rose-600">{evt.peakValue} µg/m³</span> | Baseline: {evt.baselineValue} µg/m³
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-sky-600">ML Confidence: {Math.round(evt.confidenceScore * 100)}%</span>
                <p className="text-[11px] text-muted-foreground">Detection Model: Isolation Forest v1.0</p>
              </div>
            </div>

            {/* Visual Lifecycle Timeline */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifecycle Timeline Progression</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {stages.map((stg, idx) => {
                  const isCurrent = evt.status.toUpperCase() === stg.toUpperCase();
                  return (
                    <div
                      key={stg}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-rose-600 text-white shadow-md border-rose-600'
                          : 'bg-secondary/40 text-muted-foreground border-border'
                      }`}
                    >
                      <div className="text-[10px] opacity-75">Stage {idx + 1}</div>
                      <div>{stg}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Logs */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-xs font-bold text-muted-foreground">Event Audit Log</h4>
              <div className="space-y-1.5 text-xs">
                {evt.timeline.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-secondary/30 p-2.5 rounded-lg">
                    <span className="font-medium text-foreground">{item.stage}: {item.description}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
