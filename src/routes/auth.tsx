import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { LureaLogo } from "@/lib/logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — لوريا" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin", replace: true });
    });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
        nav({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. سجّلي الدخول الآن.");
        setMode("signin");
      }
    } catch (e: any) {
      const msg = e?.message || "خطأ في المصادقة";
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "(غير محددة)";
      console.error("Auth error:", e, "Supabase URL:", supabaseUrl);
      toast.error(msg + (msg === "Failed to fetch" ? ` — تحقق من اتصال الإنترنت أو إعدادات Supabase. URL: ${supabaseUrl}` : ""));
    } finally { setLoading(false); }
  };


  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex flex-col items-center">
            <LureaLogo className="h-16 w-16" />
            <h1 className="mt-4 font-display text-2xl">{mode === "signin" ? "تسجيل دخول الأدمن" : "إنشاء حساب"}</h1>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" dir="ltr" className="input-lux" />
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة السر" dir="ltr" className="input-lux" />
            <button disabled={loading} className="btn-luxury w-full disabled:opacity-60">
              {loading ? "..." : mode === "signin" ? "دخول" : "إنشاء"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-sm text-muted-foreground hover:text-primary">
            {mode === "signin" ? "ليس لديك حساب؟ إنشاء" : "لديك حساب؟ تسجيل دخول"}
          </button>
        </div>
      </div>
      <style>{`.input-lux { width:100%; padding: 0.85rem 1rem; border-radius: 0.9rem; background: rgba(255,255,255,0.7); border: 1px solid rgba(217,163,143,0.3); outline: none; } .input-lux:focus { border-color: var(--rosegold); box-shadow: 0 0 0 4px rgba(217,163,143,0.15); }`}</style>
    </SiteLayout>
  );
}
