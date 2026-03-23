import { cn } from "@/lib/utils";

const LEAF_PATHS = [
  "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1-2 2-5 2-10S13 2 12 2z",
  "M2 12c0-3 4-8 10-10C8 6 6 10 6 14s2 6 6 8C5 20 2 16 2 12z",
  "M12 2c3 2 6 6 6 10s-3 8-6 10c-1-3-2-6-2-10s1-7 2-10z",
  "M4 4c4 0 8 3 10 8-2 5-6 8-10 8 1-3 1-6 0-8s-1-5 0-8z",
  "M20 4c-3 2-6 5-7 8 1 3 4 6 7 8-1-3-2-5-2-8s1-5 2-8z",
];

interface LeafParticlesProps {
  count?: number;
  className?: string;
}

function generatePositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const x = ((seed * 37 + 13) % 80) + 5;
    const y = ((seed * 53 + 7) % 70) + 10;
    const baseScale = 0.5 + (((seed * 17) % 40) / 100);
    const rotate = ((seed * 23) % 50) - 25;
    return { x: `${x}%`, y: `${y}%`, scale: baseScale, rotate };
  });
}

export function LeafParticles({ count = 5, className }: LeafParticlesProps) {
  const positions = generatePositions(count);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {positions.map((pos, i) => {
        const path = LEAF_PATHS[i % LEAF_PATHS.length];
        const rotationDelta = 10 + i * 8;

        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              "absolute h-8 w-8 text-primary/20 dark:text-primary/10 leaf-drift",
              i >= 3 && "hidden md:block"
            )}
            style={{
              left: pos.x,
              top: pos.y,
              ["--leaf-scale" as string]: pos.scale,
              ["--leaf-rotate-start" as string]: `${pos.rotate}deg`,
              ["--leaf-rotate-delta" as string]: `${rotationDelta}deg`,
              animationDuration: `${8 + i * 2}s`,
            }}
          >
            <path d={path} />
          </svg>
        );
      })}
    </div>
  );
}
