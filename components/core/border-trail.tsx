import { cn } from "@/lib/utils";

interface BorderTrailProps {
  className?: string;
  size?: number;
  transition?: {
    duration?: number;
    ease?: string;
  };
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
}

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]",
        className
      )}
      style={style}
    >
      <div
        className="absolute aspect-square bg-zinc-500"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          animation: `border-trail ${transition?.duration ?? 10}s linear infinite`,
          ...transition,
        }}
        onAnimationEnd={onAnimationComplete}
      />
    </div>
  );
}

