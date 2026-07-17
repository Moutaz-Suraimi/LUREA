import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    seconds: Math.floor((d / 1000) % 60),
    done: d === 0,
  };
}

export function Countdown({ endsAt }: { endsAt?: string | null }) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [t, setT] = useState(() => (target ? diff(target) : null));
  useEffect(() => {
    if (!target) return;
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  if (!target || !t) return null;

  const cell = (n: number, label: string) => (
    <div className="glass rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-center min-w-[68px] sm:min-w-[84px]">
      <div className="font-display text-3xl sm:text-4xl gradient-text tabular-nums">
        {String(n).padStart(2, "0")}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
      {cell(t.days, "أيام")}
      {cell(t.hours, "ساعات")}
      {cell(t.minutes, "دقائق")}
      {cell(t.seconds, "ثواني")}
    </div>
  );
}
