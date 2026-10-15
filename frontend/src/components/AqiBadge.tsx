import { getAqiCategory } from "@/lib/aqi";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AqiBadge({ level, size = "md", className }: Props) {
  const cat = getAqiCategory(level);
  const sizes = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold text-white",
        cat.color,
        sizes[size],
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse-glow" />
      {cat.label}
    </span>
  );
}
