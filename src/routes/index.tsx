import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Users, Hash, Trophy } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { LureaLogo } from "@/lib/logo";
import { Countdown } from "@/components/Countdown";
import { useActiveCompetition, useParticipants } from "@/hooks/useActiveCompetition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مسابقة لوريا الكبرى — LUREA" },
      { name: "description", content: "شاركي في مسابقة لوريا الكبرى واختاري رقمك بين ٥٠٠ رقم. قد تكونين الفائزة بالجائزة الكبرى." },
      { property: "og:title", content: "مسابقة لوريا الكبرى" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: comp, isLoading } = useActiveCompetition();
  const { data: participants = [] } = useParticipants(comp?.id);
  const total = comp?.total_numbers ?? 500;
  const used = participants.length;
  const remaining = total - used;
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <SiteLayout>
      <section className="floral-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 text-center">
          <div className="animate-float inline-block">
            <LureaLogo className="h-24 w-24 sm:h-32 sm:w-32 mx-auto" />
          </div>
          <div className="mt-2 text-xs sm:text-sm tracking-[0.4em] text-primary uppercase font-semibold">LUREA</div>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight animate-fade-up">
            مسابقة <span className="shimmer-text">لوريا الكبرى</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto animate-fade-up">
            شاركي الآن واختاري رقمك من بين {total} رقم، فقد تكونين الفائزة بالجائزة الكبرى.
          </p>

          {isLoading ? (
            <div className="mt-10 glass rounded-3xl h-40 max-w-2xl mx-auto animate-pulse" />
          ) : !comp ? (
            <div className="mt-10 glass-strong rounded-3xl p-8 max-w-2xl mx-auto">
              <Sparkles className="h-10 w-10 mx-auto text-primary" />
              <p className="mt-4 font-display text-xl">لا توجد مسابقة نشطة حاليًا</p>
              <p className="text-sm text-muted-foreground mt-2">ترقّبي المسابقة القادمة قريبًا.</p>
            </div>
          ) : (
            <>
              {comp.prize_image_url && (
                <div className="mt-10 max-w-md mx-auto">
                  <div className="glass-strong rounded-3xl p-4 animate-fade-up">
                    <img src={comp.prize_image_url} alt="الجائزة" className="w-full h-64 object-cover rounded-2xl" />
                    <div className="mt-3 text-sm font-semibold gradient-text">الجائزة الحالية</div>
                  </div>
                </div>
              )}

              {comp.ends_at && comp.status === "open" && (
                <div className="mt-8 animate-fade-up">
                  <div className="text-sm text-muted-foreground mb-3">ينتهي التسجيل خلال</div>
                  <Countdown endsAt={comp.ends_at} />
                </div>
              )}

              <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto">
                <Stat icon={Users} label="مشاركات" value={used} />
                <Stat icon={Hash} label="الأرقام المتبقية" value={remaining} />
                <Stat icon={Trophy} label="نسبة الاكتمال" value={`${percent}%`} />
              </div>

              <div className="mt-10">
                {comp.status === "open" ? (
                  <Link to="/participate" className="btn-luxury inline-flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5" /> شاركي الآن
                  </Link>
                ) : comp.status === "announced" ? (
                  <Link to="/winner" className="btn-luxury inline-flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5" /> شاهدي الفائزة
                  </Link>
                ) : (
                  <div className="text-muted-foreground">التسجيل مغلق حاليًا.</div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary" />
      <div className="mt-2 font-display text-2xl sm:text-3xl gradient-text tabular-nums">{value}</div>
      <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
