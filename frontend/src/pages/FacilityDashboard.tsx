import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocationSearch from '@/components/LocationSearch';
import { fetchFacilities, fetchFacilityReadings, fetchEnvironmentReport } from '@/services/api';
import type { FacilityData, FacilityReadingData, Location } from '@/types';
import { Hospital, Download, MapPin, Building2, RefreshCw, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useLocation } from '@/hooks/useLocation';

export default function FacilityDashboard() {
  const [globalLoc] = useLocation();
  const [activeLoc, setActiveLoc] = useState<Location>({
    name: globalLoc.name,
    lat: globalLoc.lat,
    lon: globalLoc.lon,
  });

  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityData | null>(null);
  const [readings, setReadings] = useState<FacilityReadingData[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync activeLoc with global location whenever global Dashboard location changes
  useEffect(() => {
    setActiveLoc({
      name: globalLoc.name,
      lat: globalLoc.lat,
      lon: globalLoc.lon,
    });
  }, [globalLoc.name, globalLoc.lat, globalLoc.lon]);

  const loadFacilitiesForLocation = async (locName: string, lat: number, lon: number) => {
    setLoading(true);
    try {
      const data = await fetchFacilities(locName, lat, lon);
      setFacilities(data);
      if (data.length > 0) {
        setSelectedFacility(data[0]);
      } else {
        setSelectedFacility(null);
      }
    } catch (err) {
      toast.error('Failed to load facilities for ' + locName);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilitiesForLocation(activeLoc.name, activeLoc.lat, activeLoc.lon);
  }, [activeLoc.name, activeLoc.lat, activeLoc.lon]);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilityReadings(selectedFacility._id)
        .then(setReadings)
        .catch(() => setReadings([]));
    }
  }, [selectedFacility]);

  const handleFacilitySearchSelect = (loc: Location) => {
    setActiveLoc(loc);
    toast.info(`Performing temporary facility lookup for ${loc.name}`);
  };

  const resetToGlobalLocation = () => {
    setActiveLoc({
      name: globalLoc.name,
      lat: globalLoc.lat,
      lon: globalLoc.lon,
    });
    toast.info(`Reset Facilities location to Dashboard default (${globalLoc.name})`);
  };

  const handleExportFacilityReport = async () => {
    if (!selectedFacility) return;
    try {
      await fetchEnvironmentReport(selectedFacility.locationName, 7);
      toast.success(`Exported PDF Report for ${selectedFacility.name}`);
    } catch (err) {
      toast.error('Failed to export facility report');
    }
  };

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pm25: r.pm25,
    aqi: r.aqi,
    indoorIndex: r.indoorAirIndex,
  }));

  const isCustomLookup = activeLoc.name !== globalLoc.name;

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase flex items-center gap-1.5 mb-1">
            <Hospital className="h-4 w-4" /> Healthcare Environment Module
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Facility Environmental Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time environmental telemetry for healthcare facilities in your selected location.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportFacilityReport} disabled={!selectedFacility} className="gap-1.5 text-xs h-9">
            <Download className="h-4 w-4 text-emerald-600" /> Export Facility PDF Report
          </Button>
        </div>
      </div>

      {/* Location Bar & Facility Search */}
      <Card className="p-6 bg-secondary/30 border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" /> Current Facilities Location
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-foreground">{activeLoc.name}</span>
              {isCustomLookup && (
                <Badge variant="secondary" className="text-[11px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                  Temporary Lookup
                </Badge>
              )}
            </div>
            {isCustomLookup && (
              <Button variant="link" size="sm" onClick={resetToGlobalLocation} className="p-0 h-auto text-xs text-emerald-600 mt-1">
                ← Reset to Dashboard Location ({globalLoc.name})
              </Button>
            )}
          </div>

          <div className="max-w-xs w-full">
            <LocationSearch onSelect={handleFacilitySearchSelect} />
          </div>
        </div>
      </Card>

      {/* Facilities Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" /> Monitored Facilities in {activeLoc.name}
          </h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />}
        </div>

        {facilities.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground space-y-2">
            <Hospital className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-semibold">No registered facilities found in {activeLoc.name}</p>
            <p className="text-xs">Use the search bar above to look up facilities in another city.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((fac) => (
              <Card
                key={fac._id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedFacility?._id === fac._id ? 'border-emerald-600 bg-emerald-500/10 shadow-md' : 'hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{fac.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{fac.address}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Capacity: <span className="font-semibold text-foreground">{fac.capacity} beds</span></p>
                  </div>
                  <Badge className={fac.alertStatus === 'NORMAL' ? 'bg-emerald-600' : fac.alertStatus === 'MODERATE' ? 'bg-amber-600' : 'bg-red-600'}>
                    {fac.alertStatus}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Facility Detailed Telemetry View */}
      {selectedFacility && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Monitored Location</span>
              <p className="text-lg font-bold text-foreground truncate">{selectedFacility.locationName}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Active Telemetry Feed</p>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Outdoor PM2.5</span>
              <p className="text-3xl font-bold text-foreground">42 <span className="text-xs font-normal text-muted-foreground">µg/m³</span></p>
              <p className="text-[11px] text-muted-foreground">Location Baseline: Normal</p>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Indoor Air Quality Index</span>
              <p className="text-3xl font-bold text-emerald-600">18 <span className="text-xs font-normal text-muted-foreground">IAQ</span></p>
              <p className="text-[11px] text-muted-foreground">HEPA Filtration Active</p>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold">Ventilation Status</span>
              <p className="text-2xl font-bold text-sky-600">OPTIMAL</p>
              <p className="text-[11px] text-muted-foreground">Air Exchanges: 14/hr</p>
            </Card>
          </div>

          {/* 24-Hour Telemetry Trend Chart */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold">24-Hour Telemetry Trend — {selectedFacility.name}</h2>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pm25" name="Outdoor PM2.5 (µg/m³)" stroke="#059669" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="indoorIndex" name="Indoor Air Index" stroke="#0284c7" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
