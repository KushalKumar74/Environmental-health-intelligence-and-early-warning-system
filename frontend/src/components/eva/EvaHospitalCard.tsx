import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hospital, MapPin, Phone, Star, Bed, Clock, ShieldAlert } from 'lucide-react';

interface HospitalItem {
  id: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  distanceKm?: number;
  distanceStr?: string;
  specialties?: string[];
  rating?: number;
  phone?: string;
  bedCount?: number;
  availableBeds?: number;
  status?: string;
}

interface EvaHospitalCardProps {
  data: {
    locationName?: string;
    hospitals: HospitalItem[];
  };
}

export default function EvaHospitalCard({ data }: EvaHospitalCardProps) {
  if (!data || !data.hospitals || data.hospitals.length === 0) {
    return (
      <Card className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-200">
        No healthcare facilities found matching your criteria.
      </Card>
    );
  }

  return (
    <div className="space-y-3 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Hospital className="h-4 w-4 text-emerald-500" />
          <span>Healthcare Facilities ({data.locationName || 'Searched Area'})</span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
          {data.hospitals.length} Found
        </Badge>
      </div>

      <div className="space-y-2.5">
        {data.hospitals.map((hosp, idx) => (
          <Card key={hosp.id || idx} className="p-3 bg-card border border-border/70 rounded-xl space-y-2 shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span>{hosp.name}</span>
                </h5>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate max-w-[220px]">{hosp.address || hosp.city || 'Address available on call'}</span>
                </p>
              </div>

              {hosp.distanceStr && (
                <Badge variant="secondary" className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 flex-shrink-0">
                  📍 {hosp.distanceStr}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              {hosp.type && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  {hosp.type}
                </Badge>
              )}

              {hosp.rating && (
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {hosp.rating}
                </span>
              )}

              {hosp.status && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                  <Clock className="h-2.5 w-2.5" />
                  {hosp.status}
                </span>
              )}

              {hosp.availableBeds !== undefined && (
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-medium">
                  <Bed className="h-2.5 w-2.5" />
                  {hosp.availableBeds} beds open
                </span>
              )}
            </div>

            {hosp.specialties && hosp.specialties.length > 0 && (
              <div className="pt-1 border-t border-border/40 flex flex-wrap gap-1">
                {hosp.specialties.map((spec, sIdx) => (
                  <span key={sIdx} className="text-[9px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {hosp.phone && (
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-border/40">
                <a
                  href={`tel:${hosp.phone}`}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Phone className="h-3 w-3" />
                  {hosp.phone}
                </a>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-500" /> Emergency Ready
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
