-- Ótica Fernandes — schema do painel de administração
-- Rode este script inteiro no SQL Editor do seu projeto Supabase (Supabase Dashboard → SQL Editor → New query).

-- 1) Produtos -----------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  price numeric(10, 2) not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "products are publicly readable"
  on products for select
  to anon, authenticated
  using (true);

create policy "authenticated users manage products"
  on products for all
  to authenticated
  using (true)
  with check (true);

-- 2) Galeria da loja ------------------------------------------------------
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_images enable row level security;

create policy "gallery is publicly readable"
  on gallery_images for select
  to anon, authenticated
  using (true);

create policy "authenticated users manage gallery"
  on gallery_images for all
  to authenticated
  using (true)
  with check (true);

-- 3) Textos e contato do site (uma única linha) ---------------------------
create table if not exists site_settings (
  id boolean primary key default true constraint site_settings_singleton check (id),
  hero_eyebrow text not null default '',
  hero_text text not null default '',
  story_text text not null default '',
  story_years text not null default '',
  hours_weekday text not null default '',
  hours_saturday text not null default '',
  whatsapp_number text not null default '',
  whatsapp_message text not null default '',
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "settings are publicly readable"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "authenticated users manage settings"
  on site_settings for all
  to authenticated
  using (true)
  with check (true);

-- Linha inicial com os textos que já estão no site hoje.
insert into site_settings (
  id, hero_eyebrow, hero_text, story_text, story_years,
  hours_weekday, hours_saturday, whatsapp_number, whatsapp_message
) values (
  true,
  'Desde 1976 em Pederneiras',
  'Óculos, joias e relógios escolhidos para acompanhar a sua história, o seu ritmo e o seu jeito de ser.',
  'O que começou com um sonho de família se tornou uma referência em Pederneiras. Hoje, seguimos unindo atendimento próximo, curadoria cuidadosa e aquele olhar especial para encontrar o que combina com você.',
  '50',
  'Segunda a sexta, 9h às 18h',
  'Sábado, 9h às 13h',
  '5514999040617',
  'Olá! Gostaria de mais informações.'
)
on conflict (id) do nothing;

-- 4) Storage: buckets públicos para as fotos -------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

create policy "public read product-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "authenticated write product-images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "public read gallery-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery-images');

create policy "authenticated write gallery-images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'gallery-images')
  with check (bucket_id = 'gallery-images');
