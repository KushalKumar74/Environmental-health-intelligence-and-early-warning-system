import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, Navigation } from 'lucide-react';

interface PlaceItem {
  id: string;
  name: string;
  type: string;
  distanceStr: string;
  rating: number;
  address: string;
  phone?: string;
  openNow?: boolean;
  availableSlots?: number;
}

interface EvaPlaceCardProps {
  data: {
    label: string;
    locationName: string;
    places: PlaceItem[];
  };
}

export default function EvaPlaceCard({ data }: EvaPlaceCardProps) {
  if (!data || !data.places || data.places.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <span>{data.label} ({data.locationName})</span>
        </span>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
          {data.places.length} Found
        </Badge>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.places.map((place) => (
          <Card key={place.id} className="p-3 bg-card border border-border/80 rounded-xl space-y-1.5 shadow-2xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-bold text-xs text-foreground">{place.name}</h5>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{place.address}</span>
                </p>
              </div>

              <Badge variant="secondary" className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 flex-shrink-0">
                📍 {place.distanceStr}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1 border-t border-border/40">
              <Badge variant="outline" className="bg-muted text-muted-foreground text-[9px]">
                {place.type}
              </Badge>

              {place.rating && (
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {place.rating}
                </span>
              )}

              {place.availableSlots !== undefined && (
                <span className="text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {place.availableSlots} Open Slots
                </span>
              )}

              {place.phone && (
                <a href={`tel:${place.phone}`} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 ml-auto">
                  <Phone className="h-3 w-3" /> Call
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
