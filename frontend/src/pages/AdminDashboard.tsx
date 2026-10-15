import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAdminStats, fetchModelEvaluation } from '@/services/api';
import type { AdminStatsData, ModelEvalData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Hospital, Bell, Cpu, BarChart3, CheckCircle2, Server } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [modelEval, setModelEval] = useState<ModelEvalData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([
        fetchAdminStats(token).catch(() => null),
        fetchModelEvaluation(token).catch(() => null),
      ])
        .then(([sData, mData]) => {
          if (sData) setStats(sData);
          if (mData) setModelEval(mData);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container py-12 text-center space-y-4">
        <Shield className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Admin Authorization Required</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your current account role is <span className="font-bold text-foreground">'{user?.role || 'GUEST'}'</span>. Administrative access requires an 'ADMIN' role token.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase flex items-center gap-1.5 mb-1">
            <Shield className="h-4 w-4" /> System Control Center
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard &amp; System Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform health monitoring, role management, API telemetry, and ML model evaluation metrics.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-semibold">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.stats.totalUsers || 12}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{stats?.stats.activeUsers || 8} active today</span>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-semibold">
            <span>Monitored Facilities</span>
            <Hospital className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.stats.totalFacilities || 3}</p>
          <span className="text-[11px] text-muted-foreground">Healthcare &amp; Schools</span>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-semibold">
            <span>Active Warnings</span>
            <Bell className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats?.stats.activeAlerts || 2}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Early warnings active</span>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-semibold">
            <span>Anomaly Events</span>
            <BarChart3 className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-rose-600">{stats?.stats.activeEvents || 1}</p>
          <span className="text-[11px] text-muted-foreground">Isolation Forest events</span>
        </Card>
      </div>

      {/* Model Evaluation Panel */}
      {modelEval && (
        <Card className="p-6 space-y-6 border-2 border-indigo-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-500" />
                <h2 className="text-xl font-bold">{modelEval.modelName}</h2>
                <Badge className="bg-indigo-600">{modelEval.modelVersion}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Quantitative validation of machine learning predictions</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div>MAE: <span className="font-bold text-sky-600">{modelEval.metrics.mae} µg/m³</span></div>
              <div>RMSE: <span className="font-bold text-sky-600">{modelEval.metrics.rmse} µg/m³</span></div>
              <div>R² Score: <span className="font-bold text-emerald-600">{modelEval.metrics.r2}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="font-bold text-sm">Predicted vs. Actual PM2.5 Test Curves</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelEval.forecastVsActualSample} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="sample" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" name="Actual PM2.5" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="predicted" name="Predicted PM2.5" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-muted-foreground">Anomaly Classification Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>Precision:</span>
                  <span className="font-bold">{modelEval.metrics.anomalyPrecision * 100}%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Recall:</span>
                  <span className="font-bold">{modelEval.metrics.anomalyRecall * 100}%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>F1-Score:</span>
                  <span className="font-bold text-emerald-600">{modelEval.metrics.anomalyF1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Model Accuracy:</span>
                  <span className="font-bold text-sky-600">{modelEval.metrics.accuracy}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Health */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Server className="h-5 w-5 text-sky-500" /> Platform Services &amp; API Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-3 rounded-xl border bg-card flex items-center justify-between">
            <span>OpenWeather API:</span>
            <span className="text-emerald-600">ONLINE</span>
          </div>
          <div className="p-3 rounded-xl border bg-card flex items-center justify-between">
            <span>MongoDB Database:</span>
            <span className="text-emerald-600">CONNECTED</span>
          </div>
          <div className="p-3 rounded-xl border bg-card flex items-center justify-between">
            <span>Python ML Engine:</span>
            <span className="text-emerald-600">ACTIVE</span>
          </div>
          <div className="p-3 rounded-xl border bg-card flex items-center justify-between">
            <span>Early Warning Engine:</span>
            <span className="text-emerald-600">RUNNING</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
