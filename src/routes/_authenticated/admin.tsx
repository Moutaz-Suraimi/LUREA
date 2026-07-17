import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Trophy, Download, Save, Search, Shuffle, Award } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompetition, useParticipants, type Competition } from "@/hooks/useActiveCompetition";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — لوريا" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setUserEmail(userRes.user?.email ?? "");
      if (!userRes.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  if (isAdmin === null) return <SiteLayout><div className="p-10 text-center">جاري التحقق...</div></SiteLayout>;
  if (!isAdmin) return (
    <SiteLayout>
      <div className="mx-auto max-w-lg p-8">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <p className="font-display text-2xl">لا تملكين صلاحية الوصول</p>
          <p className="text-sm text-muted-foreground mt-3">
            حسابك <span dir="ltr" className="font-mono">{userEmail}</span> غير مسجّل كأدمن.
            <br />أعطي هذا البريد لصاحب الموقع لإضافة صلاحية الإدارة.
          </p>
          <button onClick={signOut} className="btn-luxury mt-6">تسجيل خروج</button>
        </div>
      </div>
    </SiteLayout>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-display text-3xl">لوحة التحكم</h1>
          <button onClick={signOut} className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm">
            <LogOut className="h-4 w-4" /> خروج
          </button>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <CompetitionsPanel />
          <StatsPanel />
        </div>
        <ParticipantsPanel />
        <SettingsPanel />
      </div>
    </SiteLayout>
  );
}

function CompetitionsPanel() {
  const qc = useQueryClient();
  const { data: comp } = useActiveCompetition();
  const { data: all = [] } = useQuery({
    queryKey: ["all-competitions"],
    queryFn: async () => {
      const { data } = await supabase.from("competitions").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Competition[];
    },
  });

  const [form, setForm] = useState<Partial<Competition>>({
    title: "",
    description: "",
    prize_image_url: "",
    total_numbers: 500,
    ends_at: "",
    status: "draft",
  });

  useEffect(() => {
    if (comp) setForm({ ...comp, ends_at: comp.ends_at ? comp.ends_at.slice(0, 16) : "" });
  }, [comp?.id]);

  const save = async () => {
    const payload = {
      title: form.title!,
      description: form.description ?? null,
      prize_image_url: form.prize_image_url || null,
      total_numbers: Number(form.total_numbers) || 500,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      status: form.status || "draft",
    };
    if (form.id) {
      const { error } = await supabase.from("competitions").update(payload).eq("id", form.id);
      if (error) return toast.error(error.message);
      toast.success("تم الحفظ");
    } else {
      const { error } = await supabase.from("competitions").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("تم الإنشاء");
      setForm({ title: "", description: "", prize_image_url: "", total_numbers: 500, ends_at: "", status: "draft" });
    }
    qc.invalidateQueries();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المسابقة وكل مشاركاتها؟")) return;
    const { error } = await supabase.from("competitions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    toast.success("تم الحذف");
  };

  const uploadImage = async (file: File) => {
    const path = `prizes/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
    if (error) return toast.error("رفع الصورة تعذّر: " + error.message);
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    setForm((f) => ({ ...f, prize_image_url: data.publicUrl }));
    toast.success("تم رفع الصورة");
  };

  return (
    <section className="glass-strong rounded-3xl p-6">
      <h2 className="font-display text-2xl mb-4">إدارة المسابقات</h2>
      <div className="grid gap-3">
        <input placeholder="عنوان المسابقة" className="input-lux" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="الوصف" rows={2} className="input-lux resize-none" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min={1} max={10000} placeholder="عدد الأرقام" className="input-lux" value={form.total_numbers || 500} onChange={(e) => setForm({ ...form, total_numbers: Number(e.target.value) })} />
          <select className="input-lux" value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="draft">مسودة</option>
            <option value="open">فتح التسجيل</option>
            <option value="closed">إغلاق</option>
            <option value="announced">إعلان الفائزة</option>
          </select>
        </div>
        <label className="text-xs text-muted-foreground">تاريخ الانتهاء</label>
        <input type="datetime-local" className="input-lux" value={form.ends_at || ""} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
        <label className="text-xs text-muted-foreground">صورة الجائزة</label>
        <input placeholder="رابط الصورة" className="input-lux" value={form.prize_image_url || ""} onChange={(e) => setForm({ ...form, prize_image_url: e.target.value })} />
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" />
        {form.prize_image_url && <img src={form.prize_image_url} alt="" className="w-40 h-40 object-cover rounded-2xl" />}
        <button onClick={save} className="btn-luxury flex items-center gap-2 justify-center">
          {form.id ? <><Save className="h-4 w-4" /> حفظ التعديلات</> : <><Plus className="h-4 w-4" /> إنشاء مسابقة</>}
        </button>
        {form.id && <button onClick={() => setForm({ title: "", description: "", prize_image_url: "", total_numbers: 500, ends_at: "", status: "draft" })} className="text-sm text-muted-foreground">مسابقة جديدة</button>}
      </div>
      <div className="mt-6">
        <h3 className="font-display text-lg mb-2">كل المسابقات</h3>
        <ul className="divide-y divide-white/40 max-h-72 overflow-auto">
          {all.map((c) => (
            <li key={c.id} className="py-3 flex items-center justify-between gap-3">
              <button className="text-right flex-1 truncate hover:text-primary" onClick={() => setForm({ ...c, ends_at: c.ends_at ? c.ends_at.slice(0,16) : "" })}>
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.status}</div>
              </button>
              <button onClick={() => remove(c.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-full"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>
      <style>{`.input-lux { padding: 0.7rem 0.9rem; border-radius: 0.75rem; background: rgba(255,255,255,0.7); border: 1px solid rgba(217,163,143,0.3); outline: none; width: 100%; } .input-lux:focus { border-color: var(--rosegold); }`}</style>
    </section>
  );
}

function StatsPanel() {
  const { data: comp } = useActiveCompetition();
  const { data: participants = [] } = useParticipants(comp?.id);
  const qc = useQueryClient();

  const pickWinner = async () => {
    if (!comp) return;
    if (participants.length === 0) return toast.error("لا مشاركات للسحب");
    const winner = participants[Math.floor(Math.random() * participants.length)];
    if (!confirm(`إعلان ${winner.name} (رقم ${winner.number}) فائزة؟`)) return;
    const { error } = await supabase.from("winners").insert({
      competition_id: comp.id,
      participant_id: winner.id,
      participant_name: winner.name,
      winning_number: winner.number,
      prize_image_url: comp.prize_image_url,
    });
    if (error) return toast.error(error.message);
    await supabase.from("competitions").update({ status: "announced", winner_participant_id: winner.id }).eq("id", comp.id);
    qc.invalidateQueries();
    toast.success("🎉 تم إعلان الفائزة!");
  };

  const changeStatus = async (newStatus: "open" | "closed") => {
    if (!comp) return;
    const labels = { open: "فتح التسجيل", closed: "إغلاق التسجيل" };
    if (!confirm(`${labels[newStatus]}؟`)) return;
    const { error } = await supabase.from("competitions").update({ status: newStatus }).eq("id", comp.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    toast.success(`✅ تم: ${labels[newStatus]}`);
  };

  const pct = comp && comp.total_numbers > 0 ? Math.round((participants.length / comp.total_numbers) * 100) : 0;

  const statusBadge: Record<string, string> = {
    draft: "مسودة",
    open: "مفتوحة ✅",
    closed: "مغلقة 🔒",
    announced: "تم الإعلان 🏆",
  };

  return (
    <section className="glass-strong rounded-3xl p-6">
      <h2 className="font-display text-2xl mb-4">الإحصائيات والسحب</h2>
      {!comp ? (
        <p className="text-muted-foreground text-sm">لا مسابقة نشطة. أنشئ مسابقة من اليسار ثم غيّر حالتها إلى «فتح التسجيل».</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-semibold truncate">{comp.title}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
              {statusBadge[comp.status] ?? comp.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBox label="مشاركات" value={participants.length} />
            <StatBox label="متبقي" value={comp.total_numbers - participants.length} />
            <StatBox label="إجمالي" value={comp.total_numbers} />
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>نسبة الاكتمال</span><span>{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[oklch(0.62_0.08_35)] to-[oklch(0.82_0.05_40)] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/40">
            <p className="text-xs font-semibold text-muted-foreground mb-3">إجراءات سريعة</p>
            <div className="flex flex-wrap gap-2">
              {comp.status === "draft" || comp.status === "closed" ? (
                <button
                  onClick={() => changeStatus("open")}
                  className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  ✅ فتح التسجيل
                </button>
              ) : null}
              {comp.status === "open" && (
                <button
                  onClick={() => changeStatus("closed")}
                  className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  🔒 إغلاق التسجيل
                </button>
              )}
              {(comp.status === "open" || comp.status === "closed") && (
                <button
                  onClick={pickWinner}
                  disabled={participants.length === 0}
                  className="btn-luxury flex items-center gap-2 text-sm py-2 disabled:opacity-40"
                >
                  <Shuffle className="h-4 w-4" /> سحب عشوائي
                </button>
              )}
            </div>
            {participants.length === 0 && <p className="text-xs text-muted-foreground mt-2">لا توجد مشاركات بعد للسحب.</p>}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">يمكنك أيضاً الضغط على أيقونة 🏆 بجانب أي مشاركة لاختيارها يدويًا.</p>
        </>
      )}
    </section>
  );
}

function ParticipantsPanel() {
  const { data: comp } = useActiveCompetition();
  const { data: participants = [] } = useParticipants(comp?.id);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return participants;
    return participants.filter((p) => p.name.toLowerCase().includes(s) || p.phone.includes(s) || String(p.number) === s);
  }, [participants, q]);

  const remove = async (id: string) => {
    if (!confirm("حذف المشاركة؟")) return;
    const { error } = await supabase.from("participants").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
  };

  const setWinner = async (pid: string) => {
    if (!comp) return;
    const p = participants.find((x) => x.id === pid);
    if (!p) return;
    if (!confirm(`إعلان ${p.name} فائزة؟`)) return;
    const { error } = await supabase.from("winners").insert({
      competition_id: comp.id,
      participant_id: p.id,
      participant_name: p.name,
      winning_number: p.number,
      prize_image_url: comp.prize_image_url,
    });
    if (error) return toast.error(error.message);
    await supabase.from("competitions").update({ status: "announced", winner_participant_id: p.id }).eq("id", comp.id);
    qc.invalidateQueries();
    toast.success("تم إعلان الفائزة");
  };

  const exportCsv = () => {
    const rows = [["الرقم","الاسم","الهاتف","التاريخ"], ...participants.map((p) => [p.number, p.name, p.phone, new Date(p.created_at).toLocaleString("ar-EG")])];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `participants-${Date.now()}.csv`; a.click();
  };

  return (
    <section className="glass-strong rounded-3xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display text-2xl">المشاركات ({participants.length})</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="pr-9 pl-3 py-2 rounded-full bg-white/70 border border-primary/20 text-sm outline-none" />
          </div>
          <button onClick={exportCsv} className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm"><Download className="h-4 w-4" /> Excel</button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground">
            <tr><th className="text-right p-2">#</th><th className="text-right p-2">الاسم</th><th className="text-right p-2">الهاتف</th><th className="text-right p-2">التاريخ</th><th className="p-2">إجراءات</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/40">
                <td className="p-2 font-display text-lg gradient-text tabular-nums">{p.number}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2" dir="ltr">{p.phone}</td>
                <td className="p-2 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("ar-EG")}</td>
                <td className="p-2 flex gap-1 justify-center">
                  <button onClick={() => setWinner(p.id)} title="اختيار فائزة" className="p-2 rounded-full hover:bg-primary/10 text-primary"><Award className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} title="حذف" className="p-2 rounded-full hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">لا نتائج</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsPanel() {
  const qc = useQueryClient();
  const { data: terms } = useQuery({
    queryKey: ["settings", "terms"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "terms").maybeSingle();
      return (data?.value as string) ?? "";
    },
  });
  const [text, setText] = useState("");
  useEffect(() => setText(terms || ""), [terms]);

  const save = async () => {
    const { error } = await supabase.from("site_settings").upsert({ key: "terms", value: text as any });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["settings", "terms"] });
    toast.success("تم حفظ الشروط");
  };

  return (
    <section className="glass-strong rounded-3xl p-6 mt-6">
      <h2 className="font-display text-2xl mb-4">إدارة الشروط</h2>
      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-primary/20 focus:border-primary outline-none resize-y" />
      <button onClick={save} className="btn-luxury mt-3 flex items-center gap-2"><Save className="h-4 w-4" /> حفظ</button>
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="font-display text-2xl gradient-text">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
