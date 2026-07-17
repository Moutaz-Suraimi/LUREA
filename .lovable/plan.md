
# مسابقة لوريا الكبرى — خطة البناء

مشروع كبير جدًا. سأبنيه على مرحلتين لتسليم قيمة سريعة قابلة للاستخدام، ثم التوسع.

## المرحلة 1 (هذا الطلب — MVP كامل قابل للاستخدام)

### الهوية والتصميم
- لوغو LUREA كأصل (asset) من الصورة المرفوعة.
- Design tokens في `src/styles.css` بألوان: Rose Gold `#D9A38F`، Blush `#F7E8E3`، Ivory `#FFF8F5`، Soft Brown `#8A5E52`.
- خطوط: Playfair Display + Cormorant (فاخر) + Cairo/Tajawal للعربي.
- RTL كامل (`dir="rtl"` في `<html>`).
- Glassmorphism cards, gradients ناعمة, ظلال Rose Gold, Framer-style animations (باستخدام tw-animate-css + CSS keyframes — بدون إضافة framer-motion لتقليل bundle).

### قاعدة البيانات (Lovable Cloud)
Enums + جداول:
- `app_role` enum (`admin`)
- `prize_type` enum (`dress`, `lingerie`)
- `competition_status` enum (`draft`, `open`, `closed`, `announced`)
- `competitions` — العنوان، الوصف، صورة الجائزة، المجموع (500)، تاريخ الانتهاء، الحالة، الفائزة
- `participants` — competition_id, name, phone, number (1-500), created_at, UNIQUE(competition_id, number)
- `winners` — competition_id, participant_id, prize_choice, announced_at
- `user_roles` — user_id, role (نمط has_role الآمن)
- `site_settings` — key/value (شروط، روابط سوشيال)

RLS كامل + GRANTs. Realtime على `participants` و`competitions`.

### الصفحات (TanStack Router)
- `/` — Hero + لوغو + المسابقة النشطة + عداد تنازلي + عدد المشاركات/المتبقي + CTA "شاركي الآن"
- `/participate` — نموذج (اسم/هاتف/شروط/متابعة) + اختيار رقم من شبكة 1–500
- `/status` — إحصائيات لحظية + progress bar + آخر المشاركات
- `/winner` — إعلان الفائزة (يظهر بعد `announced`) بمؤثرات ألعاب نارية CSS
- `/winners` — بطاقات الفائزات السابقات
- `/terms` — الشروط
- `/contact` — واتساب/إنستغرام/فيسبوك + نموذج تواصل
- `/auth` — تسجيل دخول الأدمن (إيميل + كلمة سر)
- `/_authenticated/admin` — لوحة تحكم:
  - إنشاء/تعديل/حذف مسابقات
  - رفع صورة الجائزة (Storage bucket)
  - عرض/بحث/حذف مشاركات
  - تصدير Excel (CSV)
  - اختيار فائزة يدويًا أو عشوائيًا
  - إعلان الفائزة
  - تعديل الشروط
- صفحة اختيار الجائزة `/prize-choice/:token` (رابط خاص للفائزة)

### PWA + SEO
- `public/manifest.webmanifest` + أيقونات + `theme-color`.
- `<link rel="manifest">` في `__root.tsx`.
- Meta tags لكل صفحة + OG + Twitter card.
- `sitemap.xml` + `robots.txt`.
- **بدون Service Worker** (offline كامل خارج نطاق MVP، تجنّبًا للتعقيد داخل preview Lovable).

## المرحلة 2 (تحسينات لاحقة عند الطلب)
- Offline كامل بـ vite-plugin-pwa.
- ألعاب نارية Canvas متقدمة (بدل CSS).
- تصدير Excel حقيقي (xlsx) بدل CSV.
- إحصائيات زيارات.
- إدارة صفحات ديناميكية بالكامل من الداشبورد.

## ملاحظات
- الباك-إند = Lovable Cloud (Supabase). لن يُذكر Supabase للمستخدم.
- ستحتاجين تسجيل حساب أدمن من `/auth` بعد النشر، ثم أضيف يدويًا صلاحية admin من قاعدة البيانات (سأشرح الخطوة).
- صورة الجائزة الافتراضية: placeholder فاخر لحين رفع الصورة الحقيقية من الداشبورد.
- بدون Google Sign-In (طلبت إيميل+كلمة سر فقط للأدمن).
