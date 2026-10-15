import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAlerts, acknowledgeAlert, dismissAlert, fetchEnvironmentalEvents } from '@/services/api';
import type { EnvironmentalAlertData, AlertSeverity, EnvironmentalEventData } from '@/types';
import { Bell, ShieldAlert, CheckCircle2, AlertOctagon, Check, Activity, Clock, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EnvironmentalAlertData[]>([]);
  const [events, setEvents] = useState<EnvironmentalEventData[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(selectedSeverity === 'ALL' ? undefined : selectedSeverity);
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load environmental alerts');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await fetchEnvironmentalEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load environmental events');
    }
  };

  useEffect(() => {
    loadAlerts();
    loadEvents();
  }, [selectedSeverity]);

  const handleAck = async (id: string) => {
    try {
      await acknowledgeAlert(id, token || undefined);
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (err) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissAlert(id, token || undefined);
      toast.success('Alert dismissed');
      loadAlerts();
    } catch (err) {
      toast.error('Failed to dismiss alert');
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge className="bg-red-600 hover:bg-red-700 text-white">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">HIGH</Badge>;
      case 'MODERATE':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">MODERATE</Badge>;
      default:
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white">INFO</Badge>;
    }
  };

  const stages = ['Detection', 'Increasing', 'Peak', 'Monitoring', 'Baseline', 'Resolved'];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase flex items-center gap-1.5 mb-1">
          <Bell className="h-4 w-4" /> Integrated Intelligence &amp; Early Warning System
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Environmental Events &amp; Early Warning Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Unified management for real-time pollution warnings, active alerts, and ML Isolation Forest anomaly event lifecycles.
        </p>
      </div>

      {/* Main Tabs: Early Warning Alerts vs Anomaly Event Lifecycles */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Active Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4" /> Anomaly Events ({events.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Early Warning Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold">Active Pollution &amp; Risk Alerts</h2>
              <p className="text-xs text-muted-foreground">Filter alerts by severity classification.</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'INFO'].map((sev) => (
                <Button
                  key={sev}
                  variant={selectedSeverity === sev ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity(sev)}
                  className="text-xs h-8 rounded-lg"
                >
                  {sev}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="font-semibold text-base">No active environmental alerts</p>
                <p className="text-xs">Environmental conditions match standard baseline parameters.</p>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert._id} className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className={`h-6 w-6 ${alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{alert.type}</h3>
                          {getSeverityBadge(alert.severity)}
                          <span className="text-xs text-muted-foreground">• {alert.locationName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Observed: <span className="font-semibold text-foreground">{alert.observedValue} µg/m³</span> (Threshold: {alert.thresholdValue} µg/m³)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAck(alert._id)} className="text-xs h-8 gap-1">
                            <Check className="h-3.5 w-3.5" /> Acknowledge
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert._id)} className="text-xs h-8 text-muted-foreground">
                            Dismiss
                          </Button>
                        </>
                      )}
                      {alert.status === 'ACKNOWLEDGED' && (
                        <Badge variant="outline" className="text-xs text-sky-600 border-sky-300">
                          ACKNOWLEDGED
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-foreground bg-secondary/50 p-3 rounded-xl border">
                    "{alert.message}"
                  </p>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t pt-2">
                    <span>Action: {alert.recommendedMonitoringAction}</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Environmental Anomaly Events */}
        <TabsContent value="events" className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold">ML Pollution Anomaly Lifecycles</h2>
            <p className="text-xs text-muted-foreground">Isolation Forest ML detection records and lifecycle stage progression.</p>
          </div>

          <div className="space-y-6">
            {events.map((evt) => (
              <Card key={evt._id} className="p-6 space-y-6 border-l-4 border-l-rose-500 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{evt.eventId}</h3>
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifecycle Timeline Progression</h4>
                  
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

                {/* Stage Audit Logs */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

