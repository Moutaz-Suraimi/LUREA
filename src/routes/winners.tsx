import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "الفائزات السابقات — لوريا" },
      { name: "description", content: "أرشيف الفائزات السابقات في مسابقات لوريا الكبرى." },
      { property: "og:url", content: "/winners" },
    ],
    links: [{ rel: "canonical", href: "/winners" }],
  }),
  component: Winners,
});

function Winners() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["winners-list"],
    queryFn: async () => {
      const { data } = await supabase.from("winners").select("*").order("announced_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <Trophy className="h-12 w-12 mx-auto text-primary" />
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">الفائزات السابقات</h1>
          <p className="mt-2 text-sm text-muted-foreground">كل واحدة منهن فازت برقمها الخاص</p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-primary/40" />
            <p className="mt-4 font-display text-xl">لا فائزات مسجّلات بعد</p>
            <p className="text-sm text-muted-foreground mt-2">شاركي الآن وكوني أول الفائزات!</p>
            <Link to="/participate" className="btn-luxury inline-block mt-6">شاركي الآن</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((w: any, i: number) => (
              <article
                key={w.id}
                className="glass-strong rounded-3xl overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {w.prize_image_url ? (
                  <img src={w.prize_image_url} alt="الجائزة" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-[oklch(0.96_0.03_30)] to-[oklch(0.88_0.06_35)] flex items-center justify-center">
                    <Trophy className="h-16 w-16 text-primary/50" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-xl">{w.participant_name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(w.announced_at).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                      {w.prize_choice === "dress" ? "👗 فستان" : w.prize_choice === "lingerie" ? "✨ لانجري" : "🎁 جائزة"}
                    </span>
                    <span className="font-display text-3xl gradient-text tabular-nums">#{w.winning_number}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
