import type { ReactNode } from "react";
import type { GeoResult } from "@/services/openweather";
import { useGlobalLocation } from "@/context/LocationContext";

export function useLocation(): [GeoResult, (l: GeoResult) => void] {
  return useGlobalLocation();
}

export function LocationLabel({ loc, children }: { loc: GeoResult; children?: ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{loc.name}</span>
      {loc.state ? `, ${loc.state}` : ""}
      {loc.country ? `, ${loc.country}` : ""}
      {children}
    </p>
  );
}
