import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Share2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Fireworks } from "@/components/Fireworks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/winner")({
  head: () => ({
    meta: [
      { title: "الفائزة — مسابقة لوريا الكبرى" },
      { name: "description", content: "إعلان الفائزة في مسابقة لوريا الكبرى." },
      { property: "og:url", content: "/winner" },
    ],
    links: [{ rel: "canonical", href: "/winner" }],
  }),
  component: WinnerPage,
});

function WinnerPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest-winner"],
    queryFn: async () => {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .order("announced_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const share = async () => {
    const text = `🎉 فازت ${data?.participant_name} بالرقم ${data?.winning_number} في مسابقة لوريا الكبرى!`;
    try {
      if (navigator.share) await navigator.share({ title: "مسابقة لوريا", text, url: window.location.href });
      else { await navigator.clipboard.writeText(text + " " + window.location.href); toast.success("تم النسخ"); }
    } catch {}
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden min-h-[70vh]">
        {data && <Fireworks />}
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          {isLoading ? (
            <div className="glass rounded-3xl h-64 animate-pulse" />
          ) : !data ? (
            <div className="glass-strong rounded-3xl p-10">
              <Trophy className="h-12 w-12 mx-auto text-primary" />
              <p className="mt-4 font-display text-2xl">لم يتم إعلان فائزة بعد</p>
              <Link to="/" className="btn-luxury inline-block mt-6">الرئيسية</Link>
            </div>
          ) : (
            <div className="glass-strong rounded-3xl p-8 sm:p-12 animate-fade-up">
              <div className="text-lg sm:text-xl">🎉 تم إعلان الفائزة 🎉</div>
              <h1 className="mt-4 font-display text-4xl sm:text-6xl gradient-text">{data.participant_name}</h1>
              <div className="mt-8 inline-block">
                <div className="text-sm text-muted-foreground">الرقم الفائز</div>
                <div className="mt-2 animate-spin-number font-display text-7xl sm:text-9xl gradient-text tabular-nums">
                  {data.winning_number}
                </div>
              </div>
              {data.prize_image_url && (
                <img src={data.prize_image_url} alt="الجائزة" className="mt-8 mx-auto w-64 h-64 object-cover rounded-2xl shadow-[var(--shadow-elegant)]" />
              )}
              <button onClick={share} className="btn-luxury inline-flex items-center gap-2 mt-8">
                <Share2 className="h-4 w-4" /> مشاركة
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
