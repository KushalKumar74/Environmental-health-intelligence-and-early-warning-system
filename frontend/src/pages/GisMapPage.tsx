import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationSearch from '@/components/LocationSearch';
import AqiMap from '@/components/AqiMap';
import { useLocation } from '@/hooks/useLocation';
import { fetchMapLayers, fetchFacilities } from '@/services/api';
import type { FacilityData } from '@/types';
import { Map, Layers, Hospital, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function GisMapPage() {
  const [loc, setLoc] = useLocation();
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [facilities, setFacilities] = useState<FacilityData[]>([]);

  useEffect(() => {
    fetchFacilities().then(setFacilities).catch(() => {});
  }, []);

  const layers = [
    { id: 1, name: 'Layer 1: AQI Overview', color: 'bg-sky-500' },
    { id: 2, name: 'Layer 2: PM2.5 Concentration', color: 'bg-indigo-500' },
    { id: 3, name: 'Layer 3: PM10 Density', color: 'bg-purple-500' },
    { id: 4, name: 'Layer 4: Pollution Trend', color: 'bg-amber-500' },
    { id: 5, name: 'Layer 5: Exposure Indicator', color: 'bg-red-500' },
    { id: 6, name: 'Layer 6: Environmental Anomalies', color: 'bg-rose-600' },
    { id: 7, name: 'Layer 7: Healthcare Facilities', color: 'bg-emerald-600' },
  ];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-sky-600 uppercase flex items-center gap-1.5 mb-1">
            <Map className="h-4 w-4" /> Spatial Intelligence
          </span>
          <h1 className="text-3xl font-bold tracking-tight">GIS Environmental Health Map</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Multi-layer spatial mapping for pollution indicators, anomaly vectors, and facility proximity.
          </p>
        </div>

        <div className="max-w-xs w-full">
          <LocationSearch onSelect={setLoc} />
        </div>
      </div>

      {/* Layer Selector Bar */}
      <Card className="p-4 bg-secondary/50 border flex items-center gap-2 overflow-x-auto">
        <Layers className="h-4 w-4 text-sky-500 flex-shrink-0 mr-1" />
        <span className="text-xs font-bold text-muted-foreground uppercase flex-shrink-0">Active Layer:</span>
        {layers.map((l) => (
          <Button
            key={l.id}
            variant={activeLayer === l.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayer(l.id)}
            className="text-xs h-8 rounded-lg flex-shrink-0"
          >
            {l.name}
          </Button>
        ))}
      </Card>

      {/* Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Map className="h-5 w-5 text-sky-500" /> Interactive Spatial Map — {layers.find(l => l.id === activeLayer)?.name}
            </h2>
            <span className="text-xs text-muted-foreground">{loc.name} Coordinates: {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}</span>
          </div>

          <AqiMap lat={loc.lat} lon={loc.lon} aqi={3} locationName={loc.name} />
        </Card>

        {/* Layer Info & Legend */}
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">GIS Layer Legend</h3>
          
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
              <span className="font-bold text-sky-700 dark:text-sky-300">Selected View:</span>
              <p className="text-muted-foreground leading-relaxed">
                Displaying {layers.find(l => l.id === activeLayer)?.name}. Click map markers for localized telemetry details.
              </p>
            </div>

            {activeLayer === 7 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <Hospital className="h-4 w-4 text-emerald-500" /> Monitored Facilities ({facilities.length})
                </h4>
                {facilities.map((fac) => (
                  <div key={fac._id} className="p-2.5 rounded-lg border bg-card text-[11px] space-y-0.5">
                    <p className="font-bold text-foreground">{fac.name}</p>
                    <p className="text-muted-foreground">{fac.type.toUpperCase()} • Status: <span className="font-semibold text-emerald-600">{fac.monitoringStatus}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
