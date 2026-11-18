-- HULLE starter database schema (Supabase/Postgres)
-- Run only in a NEW Supabase project after reviewing the schema.
-- This is a foundation, not a complete affiliate attribution/payment system.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'creator', 'customer');
create type public.product_type as enum ('original', 'affiliate');
create type public.product_status as enum ('pending', 'approved', 'rejected', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.app_role not null default 'customer',
  social_handle text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  product_type public.product_type not null,
  name text not null,
  description text,
  category text,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  affiliate_program text,
  affiliate_url text,
  status public.product_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint affiliate_link_required check (
    product_type <> 'affiliate' or affiliate_url is not null
  )
);

create table public.creator_commission_rules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  share_percent numeric(5,2) not null check (share_percent >= 0 and share_percent <= 100),
  created_at timestamptz not null default now()
);

create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  click_id text unique not null,
  clicked_at timestamptz not null default now()
);

create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  network_name text not null,
  network_transaction_id text unique not null,
  product_id uuid references public.products(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  gross_commission numeric(12,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending','confirmed','rejected','reversed')),
  reported_at timestamptz not null default now()
);

-- Enable RLS. Policies must be added before exposing tables to client apps.
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.creator_commission_rules enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;

-- Security note:
-- Do NOT add permissive public write policies.
-- Create carefully tested policies for:
-- 1) public read of approved products only
-- 2) authenticated creators inserting their own pending products
-- 3) creators reading/updating only their own profile and earnings
-- 4) admin-only approval and commission-rule management
-- 5) server-only conversion webhook writes using service-role key.
-- Never put the Supabase service-role key in browser JavaScript.
