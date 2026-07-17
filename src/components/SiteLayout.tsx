import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LureaLogo } from "@/lib/logo";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/participate", label: "شاركي الآن" },
  { to: "/status", label: "حالة المسابقة" },
  { to: "/winner", label: "الفائزة" },
  { to: "/winners", label: "الفائزات السابقات" },
  { to: "/terms", label: "الشروط" },
  { to: "/contact", label: "تواصل" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <LureaLogo className="h-10 w-10 sm:h-12 sm:w-12" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg sm:text-xl gradient-text truncate">لوريا</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">الأناقة في كل التفاصيل</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === n.to
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <button
            className="lg:hidden p-2 rounded-full hover:bg-primary/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav className="lg:hidden glass-strong border-t border-white/10 px-4 py-3 flex flex-col gap-1 animate-fade-up">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-2xl text-base ${
                  pathname === n.to ? "bg-primary/15 text-primary font-semibold" : "text-foreground/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-white/10 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <div className="flex items-center gap-3">
              <LureaLogo className="h-12 w-12" />
              <div>
                <div className="font-display text-xl gradient-text">LUREA</div>
                <div className="text-xs text-muted-foreground">الأناقة في كل التفاصيل</div>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              منصة مسابقات لوريا الكبرى — تجربة فاخرة وفرصة للفوز بأرقى الجوائز.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-foreground/70">
              {NAV.slice(0, 5).map((n) => (
                <li key={n.to}><Link to={n.to} className="hover:text-primary">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg mb-3">تابعينا</h4>
            <div className="flex gap-3">
              <a href="https://wa.me/966500000000" aria-label="واتساب" className="glass p-3 rounded-full hover:bg-primary/10"><MessageCircle className="h-5 w-5" /></a>
              <a href="https://instagram.com/lurea" aria-label="إنستغرام" className="glass p-3 rounded-full hover:bg-primary/10"><Instagram className="h-5 w-5" /></a>
              <a href="https://facebook.com/lurea" aria-label="فيسبوك" className="glass p-3 rounded-full hover:bg-primary/10"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="text-center pb-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LUREA — جميع الحقوق محفوظة
          {" · "}
          <Link to="/auth" className="hover:text-primary transition-colors">إدارة</Link>
        </div>
      </footer>
    </div>
  );
}
