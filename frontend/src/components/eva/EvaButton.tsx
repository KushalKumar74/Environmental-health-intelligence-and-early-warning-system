import { useEva } from '@/context/EvaContext';
import { Sparkles, Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EvaButton() {
  const { open, setOpen } = useEva();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <Button
        onClick={() => setOpen(!open)}
        className="h-12 px-4 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 group border border-white/20"
      >
        {open ? (
          <>
            <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="font-semibold text-xs tracking-wide">Close EVA</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold text-xs">EVA Assistant</span>
              <span className="text-[9px] opacity-90 font-normal">Ask anything...</span>
            </div>
          </>
        )}
      </Button>
    </div>
  );
}
