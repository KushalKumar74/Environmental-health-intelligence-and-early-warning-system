import { useEva } from '@/context/EvaContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

export default function EvaBreadcrumbs() {
  const { currentBreadcrumbs, navigateBack, navigateMainMenu } = useEva();

  if (!currentBreadcrumbs || currentBreadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/40 border-b border-border text-[11px]">
      <div className="flex items-center gap-1 overflow-hidden truncate">
        {currentBreadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1 font-medium text-muted-foreground truncate">
            {idx > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />}
            <span className={idx === currentBreadcrumbs.length - 1 ? 'font-bold text-foreground truncate' : 'truncate'}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {currentBreadcrumbs.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateMainMenu}
          className="h-6 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 font-bold"
        >
          <Home className="h-3 w-3" /> Main Menu
        </Button>
      </div>
    </div>
  );
}
