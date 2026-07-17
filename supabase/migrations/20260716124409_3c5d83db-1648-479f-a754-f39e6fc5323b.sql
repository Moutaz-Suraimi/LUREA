
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.prize_type AS ENUM ('dress', 'lingerie');
CREATE TYPE public.competition_status AS ENUM ('draft', 'open', 'closed', 'announced');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles readable by self" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- competitions
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prize_image_url TEXT,
  total_numbers INTEGER NOT NULL DEFAULT 500 CHECK (total_numbers > 0 AND total_numbers <= 10000),
  ends_at TIMESTAMPTZ,
  status public.competition_status NOT NULL DEFAULT 'draft',
  winner_participant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.competitions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.competitions TO authenticated;
GRANT ALL ON public.competitions TO service_role;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read competitions" ON public.competitions
  FOR SELECT TO anon, authenticated
  USING (status <> 'draft' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin manage competitions" ON public.competitions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER competitions_updated_at BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- participants
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 6 AND 25),
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, number)
);
GRANT SELECT, INSERT ON public.participants TO anon, authenticated;
GRANT UPDATE, DELETE ON public.participants TO authenticated;
GRANT ALL ON public.participants TO service_role;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read participants" ON public.participants
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anyone insert participants" ON public.participants
  FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.competitions c WHERE c.id = competition_id AND c.status = 'open')
    AND number <= (SELECT total_numbers FROM public.competitions WHERE id = competition_id)
  );

CREATE POLICY "admin manage participants" ON public.participants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- winners (previous winners archive)
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  winning_number INTEGER NOT NULL,
  prize_image_url TEXT,
  prize_choice public.prize_type,
  prize_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  announced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.winners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.winners TO authenticated;
GRANT ALL ON public.winners TO service_role;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read winners" ON public.winners
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin manage winners" ON public.winners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow winner to update prize_choice via token (server-side function)
CREATE POLICY "winner select by token" ON public.winners
  FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER winners_updated_at BEFORE UPDATE ON public.winners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- site_settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('terms', '"1. الاشتراك مجاني.\n2. متابعة حسابات لوريا على السوشيال ميديا شرط للفوز.\n3. اختيار الرقم نهائي ولا يمكن تعديله.\n4. السحب على الأرقام بعد اكتمال العدد أو انتهاء المدة.\n5. يتم التواصل مع الفائزة عبر رقم الهاتف المسجل.\n6. الجوائز تُسلَّم داخل المملكة فقط."'::jsonb),
  ('contact', '{"whatsapp":"+966500000000","instagram":"https://instagram.com/lurea","facebook":"https://facebook.com/lurea"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;
