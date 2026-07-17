import { Lock } from "lucide-react";

interface Props {
  total: number;
  reserved: Set<number>;
  selected?: number | null;
  onSelect?: (n: number) => void;
  readOnly?: boolean;
}

export function NumberGrid({ total, reserved, selected, onSelect, readOnly }: Props) {
  return (
    <div
      className="grid gap-1.5 sm:gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))" }}
      dir="ltr"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const taken = reserved.has(n);
        const isSel = selected === n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly || taken}
            onClick={() => !taken && onSelect?.(n)}
            aria-label={`رقم ${n}${taken ? " محجوز" : ""}`}
            className={[
              "aspect-square rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold tabular-nums",
              "transition-all duration-150 flex items-center justify-center relative",
              taken
                ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                : isSel
                  ? "bg-gradient-to-br from-[oklch(0.82_0.05_40)] to-[oklch(0.62_0.08_35)] text-white scale-110 shadow-[0_8px_20px_-6px_oklch(0.65_0.1_35_/_0.5)]"
                  : "glass hover:bg-primary/15 hover:text-primary hover:scale-105 text-foreground/80",
            ].join(" ")}
          >
            {taken ? <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : n}
          </button>
        );
      })}
    </div>
  );
}
