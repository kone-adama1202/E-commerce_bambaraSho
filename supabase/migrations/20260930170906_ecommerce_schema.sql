/*
# E-commerce schema: profiles, categories, products, orders, order_items

## Overview
Creates the complete database schema for a Malian e-commerce PWA with:
- User profiles with admin/customer roles
- Product categories (jerseys, smartphones, shoes, fabrics, etc.)
- Products with stock management and pricing in FCFA
- Orders with cash-on-delivery payment and status tracking
- Order items with price/product name snapshots

## New Tables
1. profiles — extends auth.users with full_name, phone, role (admin/customer)
2. categories — product categories with slug, image, sort order
3. products — products with price, stock, images, active flag
4. orders — customer orders with delivery address, status, payment method
5. order_items — line items with quantity, unit_price snapshot, product name snapshot

## Security
- RLS enabled on all tables
- Public (anon + authenticated) read access for active products and categories
- Admin-only write access for products and categories (via is_admin() check)
- Users can only access their own orders; admin can access/update all orders
- Users cannot modify their own role column (column-level privilege restriction)
- First registered user automatically becomes admin (via trigger on auth.users)
- Order number auto-generated from sequence (CMD-XXXXX format)
*/

-- ============================================================
-- Table: profiles (must exist before is_admin function)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile"
ON public.profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

-- Users can update their own profile (full_name, phone only — role restricted via column privileges)
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Column-level: prevent users from updating their role
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;

-- ============================================================
-- Helper: is_admin()
-- Returns true if the current authenticated user has admin role
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- Table: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
DROP POLICY IF EXISTS "select_categories" ON public.categories;
CREATE POLICY "select_categories"
ON public.categories FOR SELECT
TO anon, authenticated USING (true);

-- Admin can insert categories
DROP POLICY IF EXISTS "insert_categories_admin" ON public.categories;
CREATE POLICY "insert_categories_admin"
ON public.categories FOR INSERT
TO authenticated WITH CHECK (is_admin());

-- Admin can update categories
DROP POLICY IF EXISTS "update_categories_admin" ON public.categories;
CREATE POLICY "update_categories_admin"
ON public.categories FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin can delete categories
DROP POLICY IF EXISTS "delete_categories_admin" ON public.categories;
CREATE POLICY "delete_categories_admin"
ON public.categories FOR DELETE
TO authenticated USING (is_admin());

-- ============================================================
-- Table: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(12,0) NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read active products; admin can read all
DROP POLICY IF EXISTS "select_products" ON public.products;
CREATE POLICY "select_products"
ON public.products FOR SELECT
TO anon, authenticated USING (active = true OR is_admin());

-- Admin can insert products
DROP POLICY IF EXISTS "insert_products_admin" ON public.products;
CREATE POLICY "insert_products_admin"
ON public.products FOR INSERT
TO authenticated WITH CHECK (is_admin());

-- Admin can update products
DROP POLICY IF EXISTS "update_products_admin" ON public.products;
CREATE POLICY "update_products_admin"
ON public.products FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin can delete products
DROP POLICY IF EXISTS "delete_products_admin" ON public.products;
CREATE POLICY "delete_products_admin"
ON public.products FOR DELETE
TO authenticated USING (is_admin());

-- ============================================================
-- Sequence for order numbers
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1000;

-- ============================================================
-- Table: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('CMD-' || nextval('public.order_number_seq')::text),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(12,0) NOT NULL DEFAULT 0 CHECK (total >= 0),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  city text NOT NULL DEFAULT '',
  notes text,
  payment_method text NOT NULL DEFAULT 'cash_on_delivery',
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders; admin can read all
DROP POLICY IF EXISTS "select_orders" ON public.orders;
CREATE POLICY "select_orders"
ON public.orders FOR SELECT
TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Users can create their own orders
DROP POLICY IF EXISTS "insert_orders" ON public.orders;
CREATE POLICY "insert_orders"
ON public.orders FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only admin can update orders (status changes, etc.)
DROP POLICY IF EXISTS "update_orders_admin" ON public.orders;
CREATE POLICY "update_orders_admin"
ON public.orders FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Only admin can delete orders
DROP POLICY IF EXISTS "delete_orders_admin" ON public.orders;
CREATE POLICY "delete_orders_admin"
ON public.orders FOR DELETE
TO authenticated USING (is_admin());

-- ============================================================
-- Table: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,0) NOT NULL CHECK (unit_price >= 0),
  total numeric(12,0) NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their own orders; admin can read all
DROP POLICY IF EXISTS "select_order_items" ON public.order_items;
CREATE POLICY "select_order_items"
ON public.order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);

-- Users can insert items into their own orders
DROP POLICY IF EXISTS "insert_order_items" ON public.order_items;
CREATE POLICY "insert_order_items"
ON public.order_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Only admin can update/delete order items
DROP POLICY IF EXISTS "update_order_items_admin" ON public.order_items;
CREATE POLICY "update_order_items_admin"
ON public.order_items FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_order_items_admin" ON public.order_items;
CREATE POLICY "delete_order_items_admin"
ON public.order_items FOR DELETE
TO authenticated USING (is_admin());

-- ============================================================
-- Trigger: auto-create profile on signup
-- First user becomes admin automatically
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  new_role text;
BEGIN
  SELECT count(*) INTO user_count FROM public.profiles;
  IF user_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    new_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
