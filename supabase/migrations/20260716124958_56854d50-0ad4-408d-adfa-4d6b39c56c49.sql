
CREATE POLICY "public read prize images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'public-assets');

CREATE POLICY "admin upload prize images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update prize images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete prize images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
