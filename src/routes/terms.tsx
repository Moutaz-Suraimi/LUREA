import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط والأحكام — لوريا" },
      { name: "description", content: "شروط وأحكام المشاركة في مسابقة لوريا الكبرى." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  const { data } = useQuery({
    queryKey: ["settings", "terms"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "terms").maybeSingle();
      return (data?.value as string) ?? "";
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-display text-3xl sm:text-4xl text-center">الشروط والأحكام</h1>
        <div className="mt-8 glass-strong rounded-3xl p-6 sm:p-10 whitespace-pre-line leading-loose text-foreground/85">
          {data || "جاري التحميل..."}
        </div>
      </div>
    </SiteLayout>
  );
}
