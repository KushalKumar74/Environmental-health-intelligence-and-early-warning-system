import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { GeoResult } from "@/services/openweather";

const KEY = "aqi.location.v1";
const DEFAULT: GeoResult = { name: "Mumbai", country: "IN", lat: 19.076, lon: 72.8777 };

interface LocationContextType {
  location: GeoResult;
  setLocation: (loc: GeoResult) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<GeoResult>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as GeoResult) : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  const setLocation = (loc: GeoResult) => {
    setLocationState(loc);
    try {
      localStorage.setItem(KEY, JSON.stringify(loc));
    } catch (e) {
      console.error("Failed to save location to localStorage", e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(location));
    } catch (e) {
      console.error("Failed to sync location to localStorage", e);
    }
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useGlobalLocation(): [GeoResult, (l: GeoResult) => void] {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useGlobalLocation must be used within a LocationProvider");
  }
  return [ctx.location, ctx.setLocation];
}
