import type { ForecastDay } from "@/services/openweather";
import { Droplets, Wind } from "lucide-react";

export default function WeeklyForecast({ days }: { days: ForecastDay[] }) {
  if (!days.length) return null;

  const today = new Date().toISOString().slice(0, 10);

  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: "short" });
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((d, idx) => {
        const isToday = d.date === today || idx === 0;
        return (
          <div
            key={d.date}
            className={`rounded-xl border p-4 text-center transition-smooth hover:shadow-elegant hover:-translate-y-0.5 ${
              isToday
                ? "bg-primary/10 border-primary/30 shadow-sm"
                : "bg-gradient-card"
            }`}
          >
            <p className={`text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
              {isToday ? "Today" : fmtDay(d.date)}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mb-1">
              {fmtDate(d.date)}
            </p>
            <img
              src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
              alt={d.description}
              className="mx-auto h-12 w-12 animate-float"
              loading="lazy"
            />
            <p className="text-xs capitalize text-muted-foreground line-clamp-1 mt-1">{d.description}</p>
            <p className="mt-1 text-base font-semibold">
              {Math.round(d.tempMax)}°{" "}
              <span className="text-xs text-muted-foreground">/ {Math.round(d.tempMin)}°</span>
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Droplets className="h-2.5 w-2.5" />{d.humidity}%
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Wind className="h-2.5 w-2.5" />{d.windSpeed.toFixed(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
