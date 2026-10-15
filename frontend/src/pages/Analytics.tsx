import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecords } from "@/store/records";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, User, Download, FileText } from "lucide-react";
import BadgeSystem from "@/components/BadgeSystem";
import type { RiskLevel } from "@/lib/prediction";
import { RISK_BG } from "@/lib/prediction";
import { downloadRecordsCSV, downloadAnalyticsPDF } from "@/lib/exportUtils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RISK_COLORS_HSL: Record<string, string> = {
  Low: "hsl(var(--aqi-good))",
  Moderate: "hsl(var(--aqi-moderate))",
  High: "hsl(var(--aqi-unhealthy))",
  Severe: "hsl(var(--aqi-hazardous))",
};

const RISK_ORDER: RiskLevel[] = ["Low", "Moderate", "High", "Severe"];

function dominant(levels: RiskLevel[]): RiskLevel {
  const counts: Record<string, number> = {};
  levels.forEach((l) => (counts[l] = (counts[l] ?? 0) + 1));
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as RiskLevel) ?? "Low";
}

export default function Analytics() {
  const { records } = useRecords();
  const { user } = useAuth();

  const handleExportCSV = () => {
    if (records.length === 0) return toast.error("No data to export");
    downloadRecordsCSV(records);
    toast.success("CSV dataset downloaded!");
  };

  const handleExportPDF = () => {
    if (records.length === 0) return toast.error("No data to export");
    downloadAnalyticsPDF(records, user?.name);
    toast.success("Analytics PDF report downloaded!");
  };

  const distribution = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Severe: 0 };
    records.forEach((r) => { counts[r.predictedRisk] = (counts[r.predictedRisk] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [records]);

  const aqiTrend = useMemo(
    () => [...records].reverse().map((r, i) => ({
      idx: i + 1,
      aqi: r.aqi,
      score: r.score,
      when: new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    })),
    [records],
  );

  const exposureBuckets = useMemo(() => {
    const buckets = [{ name: "0–2h", value: 0 }, { name: "2–5h", value: 0 }, { name: "5–8h", value: 0 }, { name: "8h+", value: 0 }];
    records.forEach((r) => {
      if (r.hoursOutside < 2) buckets[0].value++;
      else if (r.hoursOutside < 5) buckets[1].value++;
      else if (r.hoursOutside < 8) buckets[2].value++;
      else buckets[3].value++;
    });
    return buckets;
  }, [records]);

  // ── Per-person breakdown ──────────────────────────────────────────────
  const byName = useMemo(() => {
    const groups: Record<string, typeof records> = {};
    records.forEach((r) => {
      const key = r.name?.trim() || "Unknown";
      (groups[key] ??= []).push(r);
    });
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length) // most records first
      .map(([personName, recs]) => ({
        personName,
        count: recs.length,
        avgAqi: +(recs.reduce((s, r) => s + r.aqi, 0) / recs.length).toFixed(1),
        avgScore: +(recs.reduce((s, r) => s + r.score, 0) / recs.length).toFixed(1),
        avgHours: +(recs.reduce((s, r) => s + r.hoursOutside, 0) / recs.length).toFixed(1),
        dominant: dominant(recs.map((r) => r.predictedRisk as RiskLevel)),
        riskBreakdown: RISK_ORDER.map((lvl) => ({
          name: lvl,
          value: recs.filter((r) => r.predictedRisk === lvl).length,
        })),
      }));
  }, [records]);

  const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 } as const;

  if (records.length === 0) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center bg-gradient-card">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No data to analyze yet</p>
          <p className="text-sm text-muted-foreground">Save predictions to unlock insights and badges.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights from your saved health records.</p>
        </div>
        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1.5" /> Export PDF
            </Button>
          </div>
        )}
      </header>

      {/* Badges */}
      <BadgeSystem records={records} />

      {/* ── Global charts ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Risk distribution</h2>
          <p className="text-sm text-muted-foreground">How often each risk level appears.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {distribution.map((d) => <Cell key={d.name} fill={RISK_COLORS_HSL[d.name]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">AQI &amp; risk score over time</h2>
          <p className="text-sm text-muted-foreground">Trend across your saved entries.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aqiTrend} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="when" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--aqi-unhealthy))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Outdoor exposure breakdown</h2>
          <p className="text-sm text-muted-foreground">How long you tend to spend outside.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureBuckets} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Per-person breakdown ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> Per-Person Breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            Individual statistics grouped by name.
            {byName.some((p) => p.personName === "Unknown") && (
              <span className="ml-1 italic">(Records without a name appear under "Unknown".)</span>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {byName.map(({ personName, count, avgAqi, avgScore, avgHours, dominant: dom, riskBreakdown }) => (
            <Card key={personName} className="p-5 space-y-4 bg-gradient-card">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold truncate max-w-[140px]" title={personName}>{personName}</p>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${RISK_BG[dom]}`}>
                  {dom}
                </span>
              </div>

              {/* Stats grid */}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <dt className="text-xs text-muted-foreground">Records</dt>
                  <dd className="mt-0.5 text-xl font-bold">{count}</dd>
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <dt className="text-xs text-muted-foreground">Avg AQI</dt>
                  <dd className="mt-0.5 text-xl font-bold">{avgAqi}<span className="text-xs font-normal text-muted-foreground">/5</span></dd>
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <dt className="text-xs text-muted-foreground">Avg Risk Score</dt>
                  <dd className="mt-0.5 text-xl font-bold">{avgScore}<span className="text-xs font-normal text-muted-foreground">/100</span></dd>
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <dt className="text-xs text-muted-foreground">Avg Hours Outside</dt>
                  <dd className="mt-0.5 text-xl font-bold">{avgHours}<span className="text-xs font-normal text-muted-foreground">h</span></dd>
                </div>
              </dl>

              {/* Mini risk breakdown bar */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Risk breakdown</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskBreakdown} margin={{ left: -28, right: 4, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskBreakdown.map((d) => (
                          <Cell key={d.name} fill={RISK_COLORS_HSL[d.name]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
