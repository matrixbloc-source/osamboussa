-- ================================================================
-- O'SAMBOUSSA — Migration Supabase complète v2
-- Idempotente : peut être exécutée plusieurs fois sans erreur.
-- Exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. TABLE vendors
--    Source de vérité pour tous les profils vendeurs.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vendors (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop           text,
  city           text,
  email          text,
  phone          text,
  description    text,
  address        text,
  types          text[]      DEFAULT '{}',
  hours          text,
  delivery       boolean     DEFAULT false,
  delivery_time  text,
  delivery_zone  text,
  instagram      text,
  facebook       text,
  logo           text,
  photo          text,
  from_price     numeric     DEFAULT 2.00,
  rating         numeric     DEFAULT 0,
  reviews_count  integer     DEFAULT 0,
  sales          integer     DEFAULT 0,
  subscription   text        DEFAULT 'basic',
  verified       boolean     DEFAULT false,
  suspended      boolean     DEFAULT false,
  refused        boolean     DEFAULT false,
  refuse_reason  text,
  validated_at   timestamptz,
  validated_by   text,
  created_at     timestamptz DEFAULT now()
);

-- Colonnes ajoutées en Phase 6 — idempotentes via ADD COLUMN IF NOT EXISTS
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS refused        boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS refuse_reason  text,
  ADD COLUMN IF NOT EXISTS validated_at   timestamptz,
  ADD COLUMN IF NOT EXISTS validated_by   text,
  ADD COLUMN IF NOT EXISTS address        text,
  ADD COLUMN IF NOT EXISTS facebook       text,
  ADD COLUMN IF NOT EXISTS from_price     numeric     DEFAULT 2.00,
  ADD COLUMN IF NOT EXISTS reviews_count  integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales          integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription   text        DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS delivery_time  text,
  ADD COLUMN IF NOT EXISTS delivery_zone  text,
  ADD COLUMN IF NOT EXISTS types          text[]      DEFAULT '{}';

-- ════════════════════════════════════════════════════════════════
-- 2. TABLE products
--    Catalogue des produits par vendeur.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.products (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid        NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  price       numeric     NOT NULL DEFAULT 0,
  img         text,
  images      text[]      DEFAULT '{}',
  active      boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
-- 3. TABLE vendor_stats
--    Compteurs analytics par vendeur (clics WA + vues profil).
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vendor_stats (
  vendor_id   uuid        PRIMARY KEY REFERENCES public.vendors(id) ON DELETE CASCADE,
  wa_clicks   integer     DEFAULT 0,
  page_views  integer     DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
-- 4. TABLE reports
--    Signalements soumis par les visiteurs.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reports (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     uuid        REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name   text,
  report_type   text        NOT NULL DEFAULT 'other'
                            CHECK (report_type IN ('vendor','photo','review','other')),
  reason        text        NOT NULL,
  reporter_info text,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','resolved','dismissed')),
  created_at    timestamptz DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   text
);

-- ════════════════════════════════════════════════════════════════
-- 5. TABLE reviews
--    Avis clients par vendeur.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reviews (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    uuid        NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  client_name  text,
  rating       integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         text,
  created_at   timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
-- 6. INDEX — Performance requêtes fréquentes
-- ════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS vendors_city_idx        ON public.vendors(city);
CREATE INDEX IF NOT EXISTS vendors_status_idx      ON public.vendors(verified, suspended);
CREATE INDEX IF NOT EXISTS vendors_created_idx     ON public.vendors(created_at DESC);
CREATE INDEX IF NOT EXISTS vendors_refused_idx     ON public.vendors(refused) WHERE refused = true;
CREATE INDEX IF NOT EXISTS products_vendor_idx     ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS products_active_idx     ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS reports_status_idx      ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_vendor_idx      ON public.reports(vendor_id);
CREATE INDEX IF NOT EXISTS reviews_vendor_idx      ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS stats_updated_idx       ON public.vendor_stats(updated_at DESC);

-- ════════════════════════════════════════════════════════════════
-- 7. RPC — Incréments atomiques analytics
--    SECURITY DEFINER : bypass RLS pour compteurs anonymes.
-- ════════════════════════════════════════════════════════════════

-- Clic WhatsApp
CREATE OR REPLACE FUNCTION public.inc_wa_clicks(vid text)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
  INSERT INTO public.vendor_stats (vendor_id, wa_clicks, page_views, updated_at)
  VALUES (vid::uuid, 1, 0, now())
  ON CONFLICT (vendor_id) DO UPDATE
    SET wa_clicks  = vendor_stats.wa_clicks + 1,
        updated_at = now();
$$;

-- Vue de profil
CREATE OR REPLACE FUNCTION public.inc_page_views(vid text)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
  INSERT INTO public.vendor_stats (vendor_id, wa_clicks, page_views, updated_at)
  VALUES (vid::uuid, 0, 1, now())
  ON CONFLICT (vendor_id) DO UPDATE
    SET page_views = vendor_stats.page_views + 1,
        updated_at = now();
$$;

-- ════════════════════════════════════════════════════════════════
-- 8. TRIGGER — Création automatique du profil vendeur
--    Exécuté après chaque création d'utilisateur Supabase Auth.
--    Lit shop/city/phone depuis les user_metadata du signUp.
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.vendors (
    id, email, shop, city, phone,
    subscription, verified, suspended, refused, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'shop',  ''),
    COALESCE(NEW.raw_user_meta_data->>'city',  ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'basic', false, false, false,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Supprimer puis recréer pour garantir la version la plus récente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();

-- ════════════════════════════════════════════════════════════════
-- 9. TRIGGER — Sécurité : empêche l'auto-vérification
--    Un vendeur ne peut pas modifier ses propres champs de statut.
--    Seul l'admin (matrixbloc@gmail.com ou role=admin) peut le faire.
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.guard_vendor_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  caller_email text;
  caller_role  text;
  is_admin     boolean;
BEGIN
  caller_email := auth.jwt()->>'email';
  caller_role  := auth.jwt()->'user_metadata'->>'role';
  is_admin     := (caller_email = 'matrixbloc@gmail.com' OR caller_role = 'admin');

  IF NOT is_admin THEN
    -- Restaure les champs de statut à leur valeur précédente
    NEW.verified      := OLD.verified;
    NEW.suspended     := OLD.suspended;
    NEW.refused       := OLD.refused;
    NEW.refuse_reason := OLD.refuse_reason;
    NEW.validated_at  := OLD.validated_at;
    NEW.validated_by  := OLD.validated_by;
  ELSE
    -- Admin : auto-renseigne validated_by si validation
    IF NEW.verified = true AND OLD.verified = false THEN
      NEW.validated_at := COALESCE(NEW.validated_at, now());
      NEW.validated_by := COALESCE(NEW.validated_by, caller_email);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendors_guard_status ON public.vendors;
CREATE TRIGGER vendors_guard_status
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.guard_vendor_status();

-- ════════════════════════════════════════════════════════════════
-- 10. RLS — Activation sur toutes les tables
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.vendors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews      ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════
-- 11. POLICIES — vendors
-- ════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "v_public_select"   ON public.vendors;
DROP POLICY IF EXISTS "v_own_insert"      ON public.vendors;
DROP POLICY IF EXISTS "v_own_update"      ON public.vendors;
DROP POLICY IF EXISTS "v_admin_select"    ON public.vendors;
DROP POLICY IF EXISTS "v_admin_update"    ON public.vendors;
DROP POLICY IF EXISTS "v_admin_delete"    ON public.vendors;
-- Nettoyer les anciennes policies si elles existent
DROP POLICY IF EXISTS "vendors_public_select"   ON public.vendors;
DROP POLICY IF EXISTS "vendors_own_insert"      ON public.vendors;
DROP POLICY IF EXISTS "vendors_own_update"      ON public.vendors;
DROP POLICY IF EXISTS "vendors_admin_select"    ON public.vendors;
DROP POLICY IF EXISTS "vendors_admin_update"    ON public.vendors;
DROP POLICY IF EXISTS "vendors_admin_delete"    ON public.vendors;
DROP POLICY IF EXISTS "admin_update_vendors"    ON public.vendors;

-- Lecture publique : visiteurs voient les profils vérifiés actifs
CREATE POLICY "v_public_select" ON public.vendors
  FOR SELECT USING (
    (verified = true AND suspended = false AND (refused IS NULL OR refused = false))
    OR auth.uid() = id
  );

-- Admin voit TOUT (y compris en attente, refusés, suspendus)
CREATE POLICY "v_admin_select" ON public.vendors
  FOR SELECT USING (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Insertion : un utilisateur authentifié peut créer son propre profil
CREATE POLICY "v_own_insert" ON public.vendors
  FOR INSERT WITH CHECK (
    auth.uid() = id
    OR (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Mise à jour : chaque vendeur modifie son propre profil
CREATE POLICY "v_own_update" ON public.vendors
  FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin met à jour n'importe quel profil (statuts, validation, refus…)
CREATE POLICY "v_admin_update" ON public.vendors
  FOR UPDATE
  USING (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin supprime n'importe quel profil
CREATE POLICY "v_admin_delete" ON public.vendors
  FOR DELETE USING (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ════════════════════════════════════════════════════════════════
-- 12. POLICIES — products
-- ════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "p_public_select"  ON public.products;
DROP POLICY IF EXISTS "p_own_insert"     ON public.products;
DROP POLICY IF EXISTS "p_own_update"     ON public.products;
DROP POLICY IF EXISTS "p_own_delete"     ON public.products;
DROP POLICY IF EXISTS "products_public_select" ON public.products;
DROP POLICY IF EXISTS "products_own_insert"    ON public.products;
DROP POLICY IF EXISTS "products_own_update"    ON public.products;
DROP POLICY IF EXISTS "products_own_delete"    ON public.products;

CREATE POLICY "p_public_select" ON public.products
  FOR SELECT USING (active = true OR auth.uid() = vendor_id);

CREATE POLICY "p_own_insert" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "p_own_update" ON public.products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "p_own_delete" ON public.products
  FOR DELETE USING (
    auth.uid() = vendor_id
    OR (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ════════════════════════════════════════════════════════════════
-- 13. POLICIES — vendor_stats
--     Compteurs publics en lecture/écriture car les RPCs sont
--     SECURITY DEFINER et passent par le service_role.
-- ════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "s_public_select"  ON public.vendor_stats;
DROP POLICY IF EXISTS "s_public_insert"  ON public.vendor_stats;
DROP POLICY IF EXISTS "s_public_update"  ON public.vendor_stats;
DROP POLICY IF EXISTS "stats_public_select" ON public.vendor_stats;
DROP POLICY IF EXISTS "stats_public_insert" ON public.vendor_stats;
DROP POLICY IF EXISTS "stats_public_update" ON public.vendor_stats;

CREATE POLICY "s_public_select" ON public.vendor_stats
  FOR SELECT USING (true);

CREATE POLICY "s_public_insert" ON public.vendor_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "s_public_update" ON public.vendor_stats
  FOR UPDATE USING (true);

-- ════════════════════════════════════════════════════════════════
-- 14. POLICIES — reports
--     Tout le monde peut signaler. Seul l'admin lit et modifie.
-- ════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "r_public_insert"  ON public.reports;
DROP POLICY IF EXISTS "r_admin_select"   ON public.reports;
DROP POLICY IF EXISTS "r_admin_update"   ON public.reports;
DROP POLICY IF EXISTS "reports_public_insert" ON public.reports;
DROP POLICY IF EXISTS "reports_admin_all"     ON public.reports;
DROP POLICY IF EXISTS "reports_admin_select"  ON public.reports;
DROP POLICY IF EXISTS "reports_admin_update"  ON public.reports;

CREATE POLICY "r_public_insert" ON public.reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "r_admin_select" ON public.reports
  FOR SELECT USING (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "r_admin_update" ON public.reports
  FOR UPDATE USING (
    (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ════════════════════════════════════════════════════════════════
-- 15. POLICIES — reviews
--     Lecture publique, écriture publique (pas d'auth requise).
-- ════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "rv_public_select"  ON public.reviews;
DROP POLICY IF EXISTS "rv_public_insert"  ON public.reviews;
DROP POLICY IF EXISTS "reviews_public_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_public_insert" ON public.reviews;

CREATE POLICY "rv_public_select" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "rv_public_insert" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════
-- 16. GRANTS — Permissions sur les tables et fonctions
-- ════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- vendors : anon lit, authenticated écrit sur son propre profil
GRANT SELECT           ON public.vendors      TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;

-- products
GRANT SELECT           ON public.products     TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- vendor_stats : les deux rôles peuvent écrire (via RPC SECURITY DEFINER)
GRANT SELECT, INSERT, UPDATE ON public.vendor_stats TO anon, authenticated;

-- reviews
GRANT SELECT, INSERT   ON public.reviews      TO anon, authenticated;

-- reports : tout le monde peut insérer, authenticated peut lire
GRANT INSERT           ON public.reports      TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;

-- Fonctions RPC : accessibles sans authentification pour le tracking
GRANT EXECUTE ON FUNCTION public.inc_wa_clicks(text)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.inc_page_views(text) TO anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- 17. STORAGE — Bucket vendor-images + policies objets
-- ════════════════════════════════════════════════════════════════

-- Créer le bucket (ou mettre à jour s'il existe déjà)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-images',
  'vendor-images',
  true,
  5242880,   -- 5 Mo max par fichier
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp'];

-- Supprimer les anciennes policies storage pour ce bucket
DROP POLICY IF EXISTS "osamboussa_storage_read"         ON storage.objects;
DROP POLICY IF EXISTS "osamboussa_storage_upload"       ON storage.objects;
DROP POLICY IF EXISTS "osamboussa_storage_update"       ON storage.objects;
DROP POLICY IF EXISTS "osamboussa_storage_delete"       ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read"             ON storage.objects;
DROP POLICY IF EXISTS "storage_own_upload"              ON storage.objects;
DROP POLICY IF EXISTS "storage_own_update"              ON storage.objects;
DROP POLICY IF EXISTS "storage_own_delete"              ON storage.objects;

-- Lecture publique : n'importe qui peut voir les images
CREATE POLICY "osamboussa_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'vendor-images');

-- Upload : un utilisateur authentifié peut uploader dans son dossier {uid}/...
CREATE POLICY "osamboussa_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vendor-images'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Mise à jour : uniquement ses propres fichiers
CREATE POLICY "osamboussa_storage_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'vendor-images'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Suppression : ses propres fichiers ou admin
CREATE POLICY "osamboussa_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vendor-images'
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR (auth.jwt()->>'email') = 'matrixbloc@gmail.com'
      OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
    )
  );

-- ════════════════════════════════════════════════════════════════
-- 18. VERIFICATION FINALE — Affiche l'état des tables créées
-- ════════════════════════════════════════════════════════════════

SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_active
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('vendors','products','vendor_stats','reports','reviews')
ORDER BY tablename;
