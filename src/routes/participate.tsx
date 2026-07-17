import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { NumberGrid } from "@/components/NumberGrid";
import { useActiveCompetition, useParticipants } from "@/hooks/useActiveCompetition";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/participate")({
  head: () => ({
    meta: [
      { title: "شاركي الآن — مسابقة لوريا الكبرى" },
      { name: "description", content: "سجّلي مشاركتك في مسابقة لوريا الكبرى واختاري رقمك." },
      { property: "og:title", content: "شاركي الآن — لوريا" },
      { property: "og:url", content: "/participate" },
    ],
    links: [{ rel: "canonical", href: "/participate" }],
  }),
  component: Participate,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم قصير").max(100),
  phone: z.string().trim().min(6, "رقم الهاتف غير صحيح").max(25),
  terms: z.literal(true, { message: "يجب الموافقة على الشروط" }),
  follow: z.literal(true, { message: "يجب تأكيد المتابعة" }),
});
type FormValues = z.infer<typeof schema>;

function Participate() {
  const nav = useNavigate();
  const { data: comp } = useActiveCompetition();
  const { data: participants = [] } = useParticipants(comp?.id);
  const [selected, setSelected] = useState<number | null>(null);
  const [success, setSuccess] = useState<{ number: number; name: string } | null>(null);

  const reserved = useMemo(() => new Set(participants.map((p) => p.number)), [participants]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

  if (!comp) {
    return <SiteLayout><EmptyState /></SiteLayout>;
  }
  if (comp.status !== "open") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="glass-strong rounded-3xl p-10">
            <p className="font-display text-2xl">التسجيل مغلق حاليًا</p>
            <Link to="/" className="btn-luxury inline-block mt-6">العودة للرئيسية</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const onSubmit = async (values: FormValues) => {
    if (!selected) { toast.error("اختاري رقمًا أولًا"); return; }
    try {
      schema.parse(values);
    } catch (e) {
      if (e instanceof z.ZodError) { toast.error(e.issues[0].message); return; }
    }
    const { error } = await supabase.from("participants").insert({
      competition_id: comp.id,
      name: values.name.trim(),
      phone: values.phone.trim(),
      number: selected,
    });
    if (error) {
      if (error.code === "23505") toast.error("هذا الرقم مستخدم بالفعل، اختاري رقمًا آخر.");
      else toast.error("تعذّر التسجيل. حاولي مرة أخرى.");
      return;
    }
    setSuccess({ number: selected, name: values.name });
  };

  if (success) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="glass-strong rounded-3xl p-10 text-center animate-fade-up">
            <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
            <h1 className="mt-4 font-display text-3xl gradient-text">تم تسجيل مشاركتك بنجاح</h1>
            <p className="mt-2 text-muted-foreground">شكرًا لك يا {success.name}، حظًا سعيدًا!</p>
            <div className="mt-6 glass rounded-2xl p-6">
              <div className="text-sm text-muted-foreground">رقم مشاركتك</div>
              <div className="mt-2 font-display text-6xl gradient-text tabular-nums">{success.number}</div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Link to="/status" className="btn-luxury">حالة المسابقة</Link>
              <button onClick={() => nav({ to: "/" })} className="glass px-6 py-3 rounded-full font-medium">الرئيسية</button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <Sparkles className="h-8 w-8 mx-auto text-primary" />
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">تسجيل المشاركة</h1>
          <p className="text-sm text-muted-foreground mt-2">املئي البيانات ثم اختاري رقمك المفضل</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="glass-strong rounded-3xl p-6 space-y-4 h-fit lg:sticky lg:top-24">
            <Field label="الاسم الكامل" error={errors.name?.message}>
              <input {...register("name")} className="input-lux" placeholder="اسمك الكريم" />
            </Field>
            <Field label="رقم الهاتف" error={errors.phone?.message}>
              <input {...register("phone")} inputMode="tel" className="input-lux" placeholder="05xxxxxxxx" dir="ltr" />
            </Field>
            <Field label="الرقم المختار">
              <div className="glass rounded-xl h-12 flex items-center justify-center font-display text-2xl gradient-text tabular-nums">
                {selected ?? "—"}
              </div>
            </Field>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" {...register("terms")} className="mt-1 accent-[color:var(--rosegold)]" />
              <span>أوافق على <Link to="/terms" className="text-primary underline">شروط المسابقة</Link></span>
            </label>
            {errors.terms && <p className="text-destructive text-xs">{errors.terms.message}</p>}
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" {...register("follow")} className="mt-1 accent-[color:var(--rosegold)]" />
              <span>أؤكد متابعة حسابات لوريا على السوشيال ميديا</span>
            </label>
            {errors.follow && <p className="text-destructive text-xs">{errors.follow.message}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-luxury w-full disabled:opacity-60">
              {isSubmitting ? "جاري التسجيل..." : "تسجيل المشاركة"}
            </button>
          </div>

          <div className="glass-strong rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">اختاري رقمك</h2>
              <span className="text-xs text-muted-foreground">{reserved.size} / {comp.total_numbers} محجوز</span>
            </div>
            <NumberGrid total={comp.total_numbers} reserved={reserved} selected={selected} onSelect={setSelected} />
          </div>
        </form>
      </div>
      <style>{`
        .input-lux { width:100%; padding: 0.85rem 1rem; border-radius: 0.9rem; background: rgba(255,255,255,0.7); border: 1px solid rgba(217,163,143,0.3); outline: none; transition: all .2s; }
        .input-lux:focus { border-color: var(--rosegold); box-shadow: 0 0 0 4px rgba(217,163,143,0.15); }
      `}</style>
    </SiteLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="glass-strong rounded-3xl p-10">
        <p className="font-display text-2xl">لا توجد مسابقة نشطة حاليًا</p>
        <Link to="/" className="btn-luxury inline-block mt-6">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
