import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocode, reverseGeocode, type GeoResult } from "@/services/openweather";
import { toast } from "sonner";

interface Props {
  onSelect: (loc: GeoResult) => void;
}

export default function LocationSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await geocode(query.trim());
        setResults(r);
      } catch {
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const loc = r[0] ?? {
            name: "Your location",
            country: "",
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          onSelect(loc);
          setQuery("");
          setResults([]);
        } catch {
          toast.error("Could not resolve location");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setGeoLoading(false);
      },
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search city (e.g. Mumbai, Berlin, NYC)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={useMyLocation} disabled={geoLoading}>
          {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="hidden sm:inline ml-2">My location</span>
        </Button>
      </div>
      {(results.length > 0 || loading) && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border bg-popover shadow-elegant overflow-hidden">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {results.map((r) => (
            <button
              key={`${r.lat}-${r.lon}-${r.name}`}
              onClick={() => {
                onSelect(r);
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-secondary transition-smooth"
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{r.name}</span>
              <span className="text-muted-foreground">
                {r.state ? `${r.state}, ` : ""}
                {r.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
