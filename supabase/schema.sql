-- ============================================================
-- O'SAMBOUSSA MARKETPLACE — Schéma Supabase complet
-- Coller dans : Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. TABLE VENDORS
-- Créée automatiquement lors de l'inscription via registerVendor()
-- ============================================================
create table if not exists public.vendors (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  shop          text not null,
  city          text,
  phone         text,
  description   text,
  subscription  text not null default 'basic'
                  check (subscription in ('basic', 'pro', 'premium')),
  verified      boolean not null default false,
  suspended     boolean not null default false,
  rating        numeric(3,2) default 0,
  reviews_count integer default 0,
  sales         integer default 0,
  instagram     text,
  facebook      text,
  hours         text,
  delivery      boolean default false,
  delivery_time text,
  delivery_zone text,
  address       text,
  created_at    timestamptz not null default now()
);

alter table public.vendors enable row level security;

-- Tout le monde peut lire les vendeurs (annuaire public)
create policy "vendors_read_all"
  on public.vendors for select
  using (true);

-- Un vendeur peut insérer son propre profil (id = son uid auth)
create policy "vendors_insert_own"
  on public.vendors for insert
  with check (id = auth.uid());

-- Un vendeur peut modifier son propre profil
create policy "vendors_update_own"
  on public.vendors for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 2. TABLE PRODUCTS
-- Produits associés à un vendeur
-- ============================================================
create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  uuid not null references public.vendors(id) on delete cascade,
  name       text not null,
  price      numeric(10,2) not null check (price >= 0),
  img        text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Lecture publique des produits actifs
create policy "products_read_all"
  on public.products for select
  using (active = true);

-- Un vendeur peut insérer ses propres produits
create policy "products_insert_own"
  on public.products for insert
  with check (vendor_id = auth.uid());

-- Un vendeur peut modifier ses propres produits
create policy "products_update_own"
  on public.products for update
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

-- Un vendeur peut supprimer ses propres produits
create policy "products_delete_own"
  on public.products for delete
  using (vendor_id = auth.uid());

-- ============================================================
-- 3. TABLE CONVERSATIONS
-- Thread de messagerie entre un client et un vendeur
-- ============================================================
create table if not exists public.conversations (
  id            text primary key,
  seller_id     integer,
  client_id     uuid references auth.users(id) on delete set null,
  seller_name   text,
  seller_logo   text,
  last_activity timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table public.conversations enable row level security;

-- Lecture : participants uniquement
create policy "conversations_read_participant"
  on public.conversations for select
  using (client_id = auth.uid());

-- Insertion : utilisateurs authentifiés
create policy "conversations_insert_auth"
  on public.conversations for insert
  with check (client_id = auth.uid());

-- Mise à jour : participants (last_activity)
create policy "conversations_update_participant"
  on public.conversations for update
  using (client_id = auth.uid());

-- ============================================================
-- 4. TABLE MESSAGES
-- Messages individuels dans une conversation
-- Realtime activé sur cette table
-- Note : conversation_id est un identifiant texte (ex: conv_1, conv_2)
-- sans FK pour permettre les inserts sans pré-créer la conversation en DB
-- ============================================================
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  content         text not null,
  sender_type     text not null check (sender_type in ('user', 'seller')),
  sender_id       uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Lecture : utilisateurs authentifiés (filtré côté app par conversation)
create policy "messages_read_auth"
  on public.messages for select
  using (auth.role() = 'authenticated');

-- Insertion : utilisateurs authentifiés
create policy "messages_insert_auth"
  on public.messages for insert
  with check (auth.role() = 'authenticated');

-- Activer Realtime sur la table messages
alter publication supabase_realtime add table public.messages;

-- ============================================================
-- 5. TABLE REVIEWS
-- Avis clients sur les vendeurs
-- ============================================================
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  uuid not null references public.vendors(id) on delete cascade,
  client_id  uuid references auth.users(id) on delete set null,
  client_name text,
  rating     numeric(2,1) not null check (rating >= 1 and rating <= 5),
  text       text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Lecture publique des avis
create policy "reviews_read_all"
  on public.reviews for select
  using (true);

-- Insertion : utilisateurs authentifiés
create policy "reviews_insert_auth"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 6. TABLE CITIES
-- Liste des villes disponibles (optionnel — actuellement géré en local)
-- ============================================================
create table if not exists public.cities (
  id         serial primary key,
  name       text not null unique,
  slug       text,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;

create policy "cities_read_all"
  on public.cities for select
  using (true);

-- Données initiales
insert into public.cities (name, slug) values
  ('Paris', 'paris'),
  ('Marseille', 'marseille'),
  ('Lyon', 'lyon'),
  ('Bordeaux', 'bordeaux'),
  ('Toulouse', 'toulouse'),
  ('Nice', 'nice'),
  ('Nantes', 'nantes'),
  ('Strasbourg', 'strasbourg')
on conflict (name) do nothing;

-- ============================================================
-- 7. STORAGE — Bucket images vendeurs
-- Créer dans : Supabase Dashboard → Storage → New bucket
-- Nom : vendor-images  |  Public : OUI
-- ============================================================

-- Policy Storage : lecture publique
create policy "storage_vendor_images_read"
  on storage.objects for select
  using (bucket_id = 'vendor-images');

-- Policy Storage : upload par vendeurs authentifiés
create policy "storage_vendor_images_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'vendor-images'
    and auth.role() = 'authenticated'
  );

-- Policy Storage : suppression par propriétaire
create policy "storage_vendor_images_delete"
  on storage.objects for delete
  using (
    bucket_id = 'vendor-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 8. FONCTION — Mise à jour automatique de la note vendeur
-- Appelée à chaque INSERT dans reviews
-- ============================================================
create or replace function public.update_vendor_rating()
returns trigger language plpgsql security definer as $$
begin
  update public.vendors
  set
    rating        = (select round(avg(rating)::numeric, 2) from public.reviews where vendor_id = new.vendor_id),
    reviews_count = (select count(*) from public.reviews where vendor_id = new.vendor_id)
  where id = new.vendor_id;
  return new;
end;
$$;

drop trigger if exists on_review_insert on public.reviews;
create trigger on_review_insert
  after insert on public.reviews
  for each row execute function public.update_vendor_rating();

-- ============================================================
-- 9. TRIGGER — Auto-création du profil vendeur à l'inscription
-- Se déclenche quand auth.users reçoit un nouvel utilisateur.
-- Les champs shop/city/phone viennent de options.data passés au signup.
-- ============================================================
create or replace function public.handle_new_vendor()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.vendors (id, email, shop, city, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'shop', 'Ma boutique'),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_vendor();

-- ============================================================
-- 10. RÔLE ADMIN
-- Attribuer via Supabase Dashboard → Auth → Users → Edit user
-- Champ : user_metadata → { "role": "admin" }
-- OU via cette requête SQL (remplacer l'email) :
-- ============================================================
-- update auth.users
--   set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
-- where email = 'admin@osamboussa.fr';
