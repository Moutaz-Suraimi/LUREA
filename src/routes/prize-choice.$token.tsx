import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/prize-choice/$token")({
  head: () => ({ meta: [{ title: "اختاري جائزتك — لوريا" }, { name: "robots", content: "noindex" }] }),
  component: PrizeChoice,
});

function PrizeChoice() {
  const { token } = Route.useParams();
  const qc = useQueryClient();
  const { data: winner, isLoading } = useQuery({
    queryKey: ["winner-by-token", token],
    queryFn: async () => {
      const { data } = await supabase.from("winners").select("*").eq("prize_token", token).maybeSingle();
      return data;
    },
  });
  const [saving, setSaving] = useState(false);

  const choose = async (choice: "dress" | "lingerie") => {
    if (!winner) return;
    setSaving(true);
    const { error } = await supabase.from("winners").update({ prize_choice: choice }).eq("prize_token", token);
    setSaving(false);
    if (error) return toast.error("تعذّر الحفظ");
    qc.invalidateQueries({ queryKey: ["winner-by-token", token] });
    toast.success("تم اختيار الجائزة بنجاح");
  };

  if (isLoading) return <SiteLayout><div className="p-10 text-center">جاري التحميل...</div></SiteLayout>;
  if (!winner) return <SiteLayout><div className="p-10 text-center glass-strong rounded-3xl m-6">رابط غير صالح</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <h1 className="font-display text-3xl gradient-text">مبروك يا {winner.participant_name}!</h1>
          <p className="mt-2 text-muted-foreground">اختاري نوع جائزتك:</p>
          {winner.prize_choice ? (
            <div className="mt-8 glass rounded-2xl p-6">
              <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
              <p className="mt-3">تم اختيار الجائزة: <strong>{winner.prize_choice === "dress" ? "👗 فستان" : "🩷 لانجري"}</strong></p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button disabled={saving} onClick={() => choose("dress")} className="glass-strong rounded-3xl p-8 hover:scale-105 transition-transform">
                <div className="text-5xl">👗</div>
                <div className="mt-3 font-display text-xl">فستان</div>
              </button>
              <button disabled={saving} onClick={() => choose("lingerie")} className="glass-strong rounded-3xl p-8 hover:scale-105 transition-transform">
                <div className="text-5xl">🩷</div>
                <div className="mt-3 font-display text-xl">لانجري</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
