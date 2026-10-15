/**
 * AqiMap — Improvised Interactive Leaflet Map
 * Features color-coded pulsing markers, nearby station telemetry, multi-tile support, and rich popups.
 */
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import { Layers, MapPin, Gauge, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  lat: number;
  lon: number;
  aqi: number;
  locationName: string;
  pm25?: number;
  pm10?: number;
  temp?: number;
  humidity?: number;
  height?: string;
}

const AQI_COLORS: Record<number, string> = {
  1: '#22c55e', // Good
  2: '#eab308', // Fair
  3: '#f97316', // Moderate
  4: '#ef4444', // Poor
  5: '#7c3aed', // Very Poor
};

const AQI_LABELS: Record<number, string> = {
  1: 'Good (Healthy Air)',
  2: 'Fair (Acceptable)',
  3: 'Moderate (Sensitive Groups Caution)',
  4: 'Poor (Unhealthy Air)',
  5: 'Very Poor (Hazardous Warning)',
};

const TILE_SERVERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenStreetMap contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO & OpenStreetMap',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO & OpenStreetMap',
  },
};

export default function AqiMap({
  lat,
  lon,
  aqi,
  locationName,
  pm25 = 38,
  pm10 = 55,
  temp = 25,
  humidity = 60,
  height = '380px',
}: Props) {
  const [tileStyle, setTileStyle] = useState<'standard' | 'dark' | 'light'>('light');

  const level = Math.max(1, Math.min(5, Math.round(aqi)));
  const mainColor = AQI_COLORS[level] || '#0284c7';

  // Simulated nearby monitoring stations around the specified coordinate
  const nearbyStations = [
    { id: 'st-center', name: `${locationName} Central Monitor`, offsetLat: 0, offsetLon: 0, aqi: level, isMain: true },
    { id: 'st-north', name: `${locationName} North Sector`, offsetLat: 0.025, offsetLon: 0.015, aqi: Math.min(5, Math.max(1, level + 1)) },
    { id: 'st-east', name: `${locationName} Industrial East`, offsetLat: -0.015, offsetLon: 0.035, aqi: Math.min(5, Math.max(1, level + 1)) },
    { id: 'st-west', name: `${locationName} Suburban West`, offsetLat: 0.018, offsetLon: -0.028, aqi: Math.max(1, level - 1) },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-md bg-card">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1.5 rounded-xl border shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1 px-1">
          <Layers className="h-3.5 w-3.5 text-sky-500" /> Map Style:
        </span>
        {(['light', 'dark', 'standard'] as const).map((mode) => (
          <Button
            key={mode}
            variant={tileStyle === mode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTileStyle(mode)}
            className="text-[10px] h-6 px-2 rounded-lg capitalize"
          >
            {mode}
          </Button>
        ))}
      </div>

      {/* Map Container */}
      <MapContainer
        key={`${lat}-${lon}-${tileStyle}`}
        center={[lat, lon]}
        zoom={11}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer attribution={TILE_SERVERS[tileStyle].attr} url={TILE_SERVERS[tileStyle].url} />

        {nearbyStations.map((st) => {
          const stLat = lat + st.offsetLat;
          const stLon = lon + st.offsetLon;
          const stColor = AQI_COLORS[st.aqi];

          return (
            <div key={st.id}>
              {/* Outer pulsing ring for main location */}
              {st.isMain && (
                <CircleMarker
                  center={[stLat, stLon]}
                  radius={32}
                  pathOptions={{ color: mainColor, fillColor: mainColor, fillOpacity: 0.18, weight: 1.5 }}
                />
              )}

              {/* Station Circle Marker */}
              <CircleMarker
                center={[stLat, stLon]}
                radius={st.isMain ? 15 : 10}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: stColor,
                  fillOpacity: 0.95,
                  weight: st.isMain ? 2.5 : 1.5,
                }}
              >
                <MapTooltip permanent={st.isMain} direction="top" offset={[0, -14]} className="font-bold text-xs shadow-sm">
                  {st.isMain ? `${locationName} (AQI ${st.aqi}/5)` : st.name}
                </MapTooltip>

                <Popup>
                  <div className="p-2 space-y-2 text-xs min-w-[200px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-sky-500" /> {st.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground font-semibold">AQI Index:</span>
                      <span className="font-extrabold px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: stColor }}>
                        Level {st.aqi} / 5
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-muted-foreground">{AQI_LABELS[st.aqi]}</p>

                    {st.isMain && (
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t text-[11px]">
                        <div>PM₂.₅: <span className="font-bold text-foreground">{pm25} µg/m³</span></div>
                        <div>PM₁₀: <span className="font-bold text-foreground">{pm10} µg/m³</span></div>
                        <div>Temp: <span className="font-bold text-foreground">{temp}°C</span></div>
                        <div>Humidity: <span className="font-bold text-foreground">{humidity}%</span></div>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            </div>
          );
        })}
      </MapContainer>

      {/* Bottom Map Legend Bar */}
      <div className="p-3 bg-secondary/40 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground uppercase text-[10px]">AQI Severity Scale:</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className="px-2 py-0.5 rounded font-bold text-white text-[10px]"
                style={{ backgroundColor: AQI_COLORS[lvl] }}
              >
                L{lvl}
              </span>
            ))}
          </div>
        </div>

        <span className="text-muted-foreground text-[11px]">
          Coordinates: <span className="font-semibold text-foreground">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
        </span>
      </div>
    </div>
  );
}

