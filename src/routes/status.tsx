import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Countdown } from "@/components/Countdown";
import { useActiveCompetition, useParticipants } from "@/hooks/useActiveCompetition";
import { Sparkles, Users, Hash, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "حالة المسابقة — لوريا" },
      { name: "description", content: "تابعي حالة مسابقة لوريا الكبرى لحظة بلحظة." },
      { property: "og:url", content: "/status" },
    ],
    links: [{ rel: "canonical", href: "/status" }],
  }),
  component: Status,
});

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: "قريبًا", color: "bg-gray-100 text-gray-600" },
  open: { label: "التسجيل مفتوح 🟢", color: "bg-green-100 text-green-700" },
  closed: { label: "التسجيل مغلق 🔒", color: "bg-amber-100 text-amber-700" },
  announced: { label: "تم إعلان الفائزة 🏆", color: "bg-primary/10 text-primary" },
};

function Status() {
  const { data: comp } = useActiveCompetition();
  const { data: participants = [] } = useParticipants(comp?.id);
  const total = comp?.total_numbers ?? 0;
  const used = participants.length;
  const remaining = total - used;
  const pct = total ? Math.round((used / total) * 100) : 0;
  const badge = comp ? STATUS_LABEL[comp.status] : null;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <TrendingUp className="h-9 w-9 mx-auto text-primary" />
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">حالة المسابقة</h1>
          {badge && (
            <span className={`inline-block mt-3 text-sm px-4 py-1.5 rounded-full font-medium ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>

        {!comp ? (
          <div className="glass-strong rounded-3xl p-10 text-center">
            <Sparkles className="h-10 w-10 mx-auto text-primary" />
            <p className="mt-4 font-display text-xl">لا توجد مسابقة نشطة حاليًا</p>
            <p className="text-sm text-muted-foreground mt-2">ترقّبي المسابقة القادمة قريبًا.</p>
          </div>
        ) : (
          <>
            {/* إحصائيات */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              <StatCard icon={Users} label="إجمالي المشاركات" value={used} />
              <StatCard icon={Hash} label="الأرقام المتبقية" value={remaining} />
              <StatCard icon={TrendingUp} label="نسبة الاكتمال" value={`${pct}%`} />
            </div>

            {/* شريط التقدم */}
            <div className="mt-6 glass-strong rounded-3xl p-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">التقدم نحو الاكتمال</span>
                <span className="tabular-nums text-muted-foreground">{used} / {total}</span>
              </div>
              <div className="h-5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[oklch(0.62_0.08_35)] to-[oklch(0.82_0.05_40)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">{pct}% مكتملة</p>
            </div>

            {/* عداد تنازلي */}
            {comp.ends_at && comp.status === "open" && (
              <div className="mt-6 glass-strong rounded-3xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">ينتهي التسجيل خلال</p>
                <Countdown endsAt={comp.ends_at} />
              </div>
            )}

            {/* زر المشاركة */}
            {comp.status === "open" && (
              <div className="mt-6 text-center">
                <Link to="/participate" className="btn-luxury inline-flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" /> شاركي الآن
                </Link>
              </div>
            )}
            {comp.status === "announced" && (
              <div className="mt-6 text-center">
                <Link to="/winner" className="btn-luxury inline-flex items-center gap-2 text-lg">
                  🏆 شاهدي الفائزة
                </Link>
              </div>
            )}

            {/* قائمة آخر المشاركات */}
            <div className="mt-8 glass-strong rounded-3xl p-6">
              <h2 className="font-display text-xl mb-4">آخر المشاركات</h2>
              {participants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا مشاركات بعد. كوني الأولى!</p>
              ) : (
                <ul className="divide-y divide-white/40">
                  {participants.slice(0, 20).map((p) => (
                    <li key={p.id} className="py-3 flex items-center justify-between text-sm gap-3">
                      <span className="truncate text-foreground/80">{maskName(p.name)}</span>
                      <span className="font-display text-xl gradient-text tabular-nums shrink-0">#{p.number}</span>
                    </li>
                  ))}
                </ul>
              )}
              {participants.length > 20 && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  وأكثر من {participants.length - 20} مشاركة أخرى...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-5 text-center">
      <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary" />
      <div className="mt-2 font-display text-2xl sm:text-3xl gradient-text tabular-nums">{value}</div>
      <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function maskName(n: string) {
  const parts = n.trim().split(/\s+/);
  return parts.map((p) => (p.length <= 2 ? p : p[0] + "•".repeat(Math.min(3, p.length - 1)))).join(" ");
}
