import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Instagram, Facebook, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصلي معنا — لوريا" },
      { name: "description", content: "تواصلي مع لوريا عبر واتساب أو السوشيال ميديا." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { data: contact } = useQuery({
    queryKey: ["settings", "contact"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle();
      return (data?.value ?? {}) as { whatsapp?: string; instagram?: string; facebook?: string };
    },
  });

  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");

  const sendWa = () => {
    if (!msg.trim()) { toast.error("اكتبي رسالتك أولًا"); return; }
    const num = (contact?.whatsapp || "+966500000000").replace(/\D/g, "");
    const text = encodeURIComponent(`مرحبًا، ${name ? "أنا " + name + ". " : ""}${msg}`);
    window.open(`https://wa.me/${num}?text=${text}`, "_blank");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-display text-3xl sm:text-4xl text-center">تواصلي معنا</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a href={`https://wa.me/${(contact?.whatsapp || "+966500000000").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="glass-strong rounded-3xl p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div className="mt-3 font-display text-lg">واتساب</div>
          </a>
          <a href={contact?.instagram || "https://instagram.com/lurea"} target="_blank" rel="noreferrer" className="glass-strong rounded-3xl p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <Instagram className="h-8 w-8 text-primary" />
            <div className="mt-3 font-display text-lg">إنستغرام</div>
          </a>
          <a href={contact?.facebook || "https://facebook.com/lurea"} target="_blank" rel="noreferrer" className="glass-strong rounded-3xl p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <Facebook className="h-8 w-8 text-primary" />
            <div className="mt-3 font-display text-lg">فيسبوك</div>
          </a>
        </div>

        <div className="mt-8 glass-strong rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">أرسلي رسالة</h2>
          <div className="mt-4 grid gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-primary/20 focus:border-primary outline-none" />
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="رسالتك" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-primary/20 focus:border-primary outline-none resize-none" />
            <button onClick={sendWa} className="btn-luxury inline-flex items-center gap-2 justify-center">
              <Send className="h-4 w-4" /> إرسال عبر واتساب
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
