import { POLLUTANT_LABELS, getAqiCategory } from "@/lib/aqi";
import type { AqiSnapshot } from "@/services/openweather";
import AqiBadge from "./AqiBadge";

export default function PollutantGrid({ snapshot }: { snapshot: AqiSnapshot }) {
  const cat = getAqiCategory(snapshot.aqi);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current air quality</h3>
          <p className="mt-1 text-5xl font-bold tracking-tight">{snapshot.aqi}<span className="text-2xl text-muted-foreground">/5</span></p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{cat.description}</p>
        </div>
        <AqiBadge level={snapshot.aqi} size="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(snapshot.components).map(([key, val]) => {
          const meta = POLLUTANT_LABELS[key] ?? { name: key, unit: "" };
          return (
            <div key={key} className="rounded-xl border bg-gradient-card p-4 transition-smooth hover:shadow-elegant">
              <p className="text-xs font-medium text-muted-foreground">{meta.name}</p>
              <p className="mt-1 text-xl font-semibold">{(val ?? 0).toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">{meta.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
