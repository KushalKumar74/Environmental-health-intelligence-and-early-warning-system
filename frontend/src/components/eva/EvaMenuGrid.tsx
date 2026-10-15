import { useEva } from '@/context/EvaContext';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Wind,
  Palmtree,
  Hospital,
  MapPin,
  Route,
  Activity,
  Bell,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Home,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Sun,
  Wind,
  Palmtree,
  Hospital,
  MapPin,
  Route,
  Activity,
  Bell,
  TrendingUp,
  Sparkles,
};

interface EvaMenuGridProps {
  options: any[];
  title?: string;
  message?: string;
}

export default function EvaMenuGrid({ options, title, message }: EvaMenuGridProps) {
  const { sendMenuAction, navigateBack, navigateMainMenu, loading } = useEva();

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2">
      {message && (
        <p className="text-xs font-semibold text-foreground/90 leading-snug">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-1.5">
        {options.map((opt) => {
          const IconComponent = opt.icon ? iconMap[opt.icon] || ChevronRight : ChevronRight;

          return (
            <Button
              key={opt.id}
              variant="outline"
              disabled={loading}
              onClick={() => sendMenuAction(opt.id, opt)}
              className="w-full justify-between h-auto py-2.5 px-3 bg-background hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left font-medium text-xs transition-all border-border/80 shadow-2xs group rounded-xl"
            >
              <div className="flex items-center gap-2.5 truncate">
                <IconComponent className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  {opt.label}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          disabled={loading}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateMainMenu}
          disabled={loading}
          className="h-7 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"
        >
          <Home className="h-3 w-3" /> Main Menu
        </Button>
      </div>
    </div>
  );
}
