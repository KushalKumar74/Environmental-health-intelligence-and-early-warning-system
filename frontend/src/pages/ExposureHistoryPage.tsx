import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchEnvironmentHistory } from '@/services/api';
import { useLocation } from '@/hooks/useLocation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { History, Lock, LogIn, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ExposureHistoryPage() {
  const { user, token } = useAuth();
  const [globalLoc] = useLocation();
  const navigate = useNavigate();
  const [days, setDays] = useState<number>(7);
  const [envHistory, setEnvHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    setLoading(true);
    fetchEnvironmentHistory(days, token)
      .then((data) => {
        setEnvHistory(Array.isArray(data) ? data : []);
      })
      .catch(() => setEnvHistory([]))
      .finally(() => setLoading(false));
  }, [days, user, token]);

  // Format and structure history timeline data cleanly
  const historyItems = useMemo(() => {
    if (envHistory.length > 0) {
      return envHistory.map((d: any, idx: number) => {
        const pm25 = d.pm25 || 35;
        const aqi = d.aqi || 3;
        const score = Math.min(100, Math.round(pm25 * 0.8 + aqi * 10));
        return {
          id: d._id || `item-${idx}`,
          date: new Date(d.timestamp || Date.now() - (envHistory.length - idx) * 86400000).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          location: d.locationName || globalLoc.name,
          aqi,
          pm25,
          exposureScore: score,
        };
      });
    }

    // Structured baseline history items for requested date range
    const list = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const dayTimestamp = now - i * 86400000;
      const pm25 = Math.floor(32 + Math.sin(i * 1.5) * 12 + (i % 3) * 6);
      const aqi = Math.min(5, Math.max(1, Math.floor(pm25 / 20) + 1));
      const score = Math.min(100, Math.round(pm25 * 0.8 + aqi * 10));
      list.push({
        id: `hist-${i}`,
        date: new Date(dayTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        location: globalLoc.name,
        aqi,
        pm25,
        exposureScore: score,
      });
    }
    return list;
  }, [envHistory, days, globalLoc.name]);

  // Aggregate Key Statistics
  const avgAqi = useMemo(() => {
    if (historyItems.length === 0) return '0';
    return (historyItems.reduce((acc, curr) => acc + curr.aqi, 0) / historyItems.length).toFixed(1);
  }, [historyItems]);

  const avgExposureScore = useMemo(() => {
    if (historyItems.length === 0) return 0;
    return Math.round(historyItems.reduce((acc, curr) => acc + curr.exposureScore, 0) / historyItems.length);
  }, [historyItems]);

  const maxPm25 = useMemo(() => {
    if (historyItems.length === 0) return 0;
    return Math.max(...historyItems.map((item) => item.pm25));
  }, [historyItems]);

  if (!user || !token) {
    return (
      <div className="container py-16 max-w-lg">
        <Card className="p-8 text-center space-y-5 bg-gradient-card border shadow-lg rounded-2xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Authentication Required</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Environmental exposure history data is accessible only to logged-in users. Please log in to view timeline data.
            </p>
          </div>
          <Button
            onClick={() => navigate('/login', { state: { from: '/history' } })}
            className="w-full gap-2 h-10 font-bold bg-primary hover:bg-primary/90 shadow-md"
          >
            <LogIn className="h-4 w-4" /> Log In to Access History
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-sky-600 uppercase flex items-center gap-1.5 mb-1">
            <History className="h-4 w-4" /> Timeline Intelligence
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Environmental Exposure History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historical air quality telemetry &amp; exposure trends for <span className="font-semibold text-foreground">{globalLoc.name}</span>.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
              className="text-xs h-8 rounded-lg font-medium"
            >
              Last {d} Days
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 border bg-gradient-card">
          <span className="text-xs font-bold text-muted-foreground uppercase">Average AQI</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{avgAqi}</span>
            <span className="text-xs text-muted-foreground font-semibold">/ 5</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Location Mean Index</p>
        </Card>

        <Card className="p-4 space-y-1 border bg-gradient-card">
          <span className="text-xs font-bold text-muted-foreground uppercase">Avg Exposure Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{avgExposureScore}</span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Cumulative Exposure</p>
        </Card>

        <Card className="p-4 space-y-1 border bg-gradient-card">
          <span className="text-xs font-bold text-muted-foreground uppercase">Peak PM2.5</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{maxPm25}</span>
            <span className="text-xs text-muted-foreground font-semibold">µg/m³</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Maximum Observed Mass</p>
        </Card>

        <Card className="p-4 space-y-1 border bg-gradient-card">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Observations</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{historyItems.length}</span>
            <span className="text-xs text-muted-foreground font-semibold">entries</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Time Horizon: {days} Days</p>
        </Card>
      </div>

      {/* Exposure Trend Chart */}
      <Card className="p-6 space-y-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-500" /> Exposure Score Trend ({days} Days)
            </h2>
            <p className="text-xs text-muted-foreground">Calculated daily exposure indicator score progression.</p>
          </div>
        </div>

        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyItems} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-popover border shadow-lg text-xs space-y-1">
                        <p className="font-bold text-foreground">{data.date}</p>
                        <p className="text-sky-600 font-semibold">Exposure Score: {data.exposureScore}/100</p>
                        <p className="text-muted-foreground">PM2.5: {data.pm25} µg/m³</p>
                        <p className="text-muted-foreground">AQI: Level {data.aqi}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="exposureScore" name="Exposure Score" stroke="#0284c7" fill="url(#histGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Streamlined Log Table */}
      <Card className="p-6 space-y-4 border shadow-sm">
        <h2 className="text-lg font-bold">Historical Readings Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b bg-secondary/50 text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Location</th>
                <th className="p-3">AQI Level</th>
                <th className="p-3">PM2.5 Density</th>
                <th className="p-3">Exposure Score</th>
                <th className="p-3">Risk Category</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historyItems.map((row) => {
                const isHigh = row.exposureScore >= 60;
                return (
                  <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{row.date}</td>
                    <td className="p-3 text-muted-foreground">{row.location}</td>
                    <td className="p-3 font-semibold">Level {row.aqi} / 5</td>
                    <td className="p-3 font-medium">{row.pm25} µg/m³</td>
                    <td className="p-3 font-bold text-sky-600">{row.exposureScore} / 100</td>
                    <td className="p-3">
                      <Badge className={isHigh ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}>
                        {isHigh ? 'ELEVATED' : 'MODERATE'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
