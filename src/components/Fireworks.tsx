import { useMemo } from "react";

export function Fireworks() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, b) => ({
        b,
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 40}%`,
        delay: Math.random() * 3,
        particles: Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return { i, x: `${Math.cos(a) * 90}px`, y: `${Math.sin(a) * 90}px` };
        }),
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bursts.map((burst) => (
        <div key={burst.b} className="absolute" style={{ left: burst.left, top: burst.top }}>
          {burst.particles.map((p) => (
            <span
              key={p.i}
              className="absolute block w-2 h-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, #D9A38F, #F7E8E3)`,
                boxShadow: "0 0 12px #D9A38F",
                ["--x" as string]: p.x,
                ["--y" as string]: p.y,
                ["--initY" as string]: "0px",
                animation: `firework 2.4s ease-out ${burst.delay}s infinite`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
