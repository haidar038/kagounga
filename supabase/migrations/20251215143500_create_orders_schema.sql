-- Create orders table if it doesn't exist
create table if not exists "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid references "auth"."users" on delete set null,
    "status" text not null default 'PENDING',
    "total_amount" numeric not null,
    "shipping_cost" numeric not null default 0,
    "customer_name" text not null,
    "customer_email" text not null,
    "customer_phone" text not null,
    "shipping_address" text not null,
    "city" text not null,
    "postal_code" text not null,
    "external_id" text unique,
    "invoice_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    primary key ("id")
);

-- Ensure shipping_cost column exists (idempotent update)
do $$ 
begin
  if not exists (select from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping_cost') then
    alter table "public"."orders" add column "shipping_cost" numeric not null default 0;
  end if;
end $$;

-- Create order items table if it doesn't exist
create table if not exists "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid references "public"."orders" on delete cascade,
    "product_id" text not null,
    "product_name" text not null,
    "quantity" integer not null check (quantity > 0),
    "price" numeric not null,
    "created_at" timestamp with time zone default now(),
    primary key ("id")
);

-- Enable RLS
alter table "public"."orders" enable row level security;
alter table "public"."order_items" enable row level security;

-- Drop existing policies to ensure clean slate (idempotent)
drop policy if exists "Users can view their own orders" on "public"."orders";
drop policy if exists "Users can insert their own orders" on "public"."orders";
drop policy if exists "Anon can create orders" on "public"."orders";

drop policy if exists "Users can view their own order items" on "public"."order_items";
drop policy if exists "Users can insert their own order items" on "public"."order_items";
drop policy if exists "Anon can create order items" on "public"."order_items";

-- Recreate Policies

-- 1. View Policies (Authenticated only, for history)
create policy "Users can view their own orders"
on "public"."orders"
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can view their own order items"
on "public"."order_items"
for select
to authenticated
using (
    exists (
        select 1 from "public"."orders"
        where "orders".id = "order_items".order_id
        and "orders".user_id = auth.uid()
    )
);

-- 2. Insert Policies
-- We are moving order creation to Backend (Edge Function) which uses Service Role.
-- Service Role bypasses RLS.
-- Therefore, we technically DON'T need insert policies for Client if we strictly use Backend.
-- However, if we want to support Client-side creation as backup or for other features:

create policy "Users can insert their own orders"
on "public"."orders"
for insert
to authenticated
with check (true); 

create policy "Anon can create orders"
on "public"."orders"
for insert
to anon
with check (true);

create policy "Users can insert their own order items"
on "public"."order_items"
for insert
to authenticated
with check (true);

create policy "Anon can create order items"
on "public"."order_items"
for insert
to anon
with check (true);
