import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAqiCategory } from "@/lib/aqi";

interface AqiAlertBannerProps {
  aqi: number | null;
  locationName?: string;
}

export default function AqiAlertBanner({ aqi, locationName }: AqiAlertBannerProps) {
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("aqi_alert_threshold");
    return saved ? parseInt(saved, 10) : 3; // Default alert threshold: AQI >= 3
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    localStorage.setItem("aqi_alert_threshold", threshold.toString());
  }, [threshold]);

  if (aqi == null) return null;

  const isExceeded = aqi >= threshold;
  const category = getAqiCategory(aqi);

  if (dismissed && !isExceeded) return null;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isExceeded
        ? "bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20"
        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isExceeded ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">
                {isExceeded ? "⚠️ AQI Safety Alert Triggered!" : "Air Quality is Within Your Safety Limit"}
              </h3>
            </div>
            <p className="text-xs opacity-90">
              {isExceeded
                ? `Current AQI (${aqi}/5 · ${category.label}) at ${locationName || 'your location'} exceeds your safety threshold of AQI ≥ ${threshold}.`
                : `Current AQI (${aqi}/5 · ${category.label}) is below your warning threshold of AQI ≥ ${threshold}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-lg border text-xs text-foreground">
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Alert if AQI ≥</span>
            <Select value={threshold.toString()} onValueChange={(val) => { setThreshold(parseInt(val, 10)); setDismissed(false); }}>
              <SelectTrigger className="h-7 text-xs w-28 border-none bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">AQI ≥ 2 (Fair)</SelectItem>
                <SelectItem value="3">AQI ≥ 3 (Moderate)</SelectItem>
                <SelectItem value="4">AQI ≥ 4 (Poor)</SelectItem>
                <SelectItem value="5">AQI ≥ 5 (Severe)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isExceeded && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-destructive/40 hover:bg-destructive/10 text-destructive"
              onClick={() => setDismissed(true)}
            >
              <BellOff className="mr-1 h-3.5 w-3.5" /> Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
