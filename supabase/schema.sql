-- ==============================================================================
-- FOODHUB COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Target Engine: PostgreSQL 14+ (Supabase)
-- Execution Order:
--   1. Extensions & Base Trigger Functions
--   2. Four Core Tables (Created before any function or policy references them)
--   3. Performance Indexes & Updated At Triggers
--   4. Security Helper Functions (public.is_admin() created after public.profiles)
--   5. Row Level Security (RLS) Enablement & Policies
--   6. Auth Registration Trigger (Automatic customer profile sync)
--   7. Atomic Server-Side Order Placement RPC Function (Anti-tamper pricing)
--   8. Sample Menu Seed Data
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & BASE TRIGGER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generic timestamp updater function (does not reference any tables)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. CREATE ALL FOUR TABLES FIRST
-- (All tables must exist before functions and policies that query them)
-- ------------------------------------------------------------------------------

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table 2: menu_items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text,
  category text NOT NULL,
  is_vegetarian boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table 3: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  delivery_address text NOT NULL,
  subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  delivery_fee numeric(10, 2) NOT NULL DEFAULT 30.00 CHECK (delivery_fee >= 0),
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL DEFAULT 'cash_on_delivery' 
    CHECK (payment_method IN ('cash_on_delivery', 'card', 'upi', 'net_banking')),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table 4: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total numeric(10, 2) NOT NULL CHECK (line_total >= 0)
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES & UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);

-- Updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. SECURITY HELPER FUNCTIONS (DEFINED AFTER public.profiles EXISTS)
-- ------------------------------------------------------------------------------

-- Helper function to check if current user is an admin.
-- Defined as SECURITY DEFINER with SET search_path = public to bypass RLS on
-- profiles and completely prevent infinite recursion in RLS policies.
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

-- Secure access to is_admin helper
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all four tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer');

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own customer profile" ON public.profiles;
CREATE POLICY "Users can insert own customer profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'customer');

DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 5.2 MENU_ITEMS POLICIES
-- Public & authenticated users can read all available food items
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Public can view available menu items"
  ON public.menu_items
  FOR SELECT
  TO public
  USING (is_available = true);

-- Admins can view all menu items (including discontinued/unavailable items)
DROP POLICY IF EXISTS "Admins can view all menu items" ON public.menu_items;
CREATE POLICY "Admins can view all menu items"
  ON public.menu_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins have full management control (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items"
  ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items"
  ON public.menu_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5.3 ORDERS POLICIES
-- Customers can only view their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Clean up any existing customer direct insert policy on orders.
-- Customers MUST place orders through the secure place_order RPC function.
DROP POLICY IF EXISTS "Customers can insert own orders" ON public.orders;

-- Admins can insert orders directly
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
CREATE POLICY "Admins can insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Customers can cancel their own order only while status is pending
DROP POLICY IF EXISTS "Customers can cancel own pending orders" ON public.orders;
CREATE POLICY "Customers can cancel own pending orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Admins can update any order (status changes, details)
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5.4 ORDER_ITEMS POLICIES
-- Customers can only read items from orders they own
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Clean up any existing customer direct insert policy on order_items.
-- Order items are created atomically via the place_order RPC function.
DROP POLICY IF EXISTS "Customers can insert own order items" ON public.order_items;

-- Admins can manage all order items directly
DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;
CREATE POLICY "Admins can insert order items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
CREATE POLICY "Admins can update order items"
  ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. AUTH REGISTRATION TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically creates a customer profile entry whenever a new user signs up.
-- Enforces 'customer' role so users cannot escalate privileges during registration.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. SECURE DATABASE-SIDE ORDER PLACEMENT RPC
-- ------------------------------------------------------------------------------
-- Atomically creates an order and its items in a single transaction.
-- Calculates prices directly from public.menu_items table to prevent client-side
-- price tampering.
CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_phone text,
  p_delivery_address text,
  p_payment_method text,
  p_items jsonb,
  p_delivery_fee numeric DEFAULT 30.00
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_tax numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2) := COALESCE(p_delivery_fee, 30.00);
  v_total numeric(10, 2) := 0;
  v_item record;
  v_menu_record record;
  v_line_total numeric(10, 2);
  v_order_items_to_insert jsonb := '[]'::jsonb;
BEGIN
  -- 1. Verify authenticated caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: Please sign in to place an order.';
  END IF;

  -- 2. Validate input fields
  IF TRIM(COALESCE(p_customer_name, '')) = '' THEN
    RAISE EXCEPTION 'Customer name is required.';
  END IF;

  IF TRIM(COALESCE(p_phone, '')) = '' THEN
    RAISE EXCEPTION 'Contact phone number is required.';
  END IF;

  IF TRIM(COALESCE(p_delivery_address, '')) = '' THEN
    RAISE EXCEPTION 'Delivery address is required.';
  END IF;

  IF p_payment_method NOT IN ('cash_on_delivery', 'card', 'upi', 'net_banking') THEN
    RAISE EXCEPTION 'Invalid payment method: %. Allowed values: cash_on_delivery, card, upi, net_banking.', p_payment_method;
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot place an empty order. Please select at least one item.';
  END IF;

  IF v_delivery_fee < 0 THEN
    RAISE EXCEPTION 'Delivery fee cannot be negative.';
  END IF;

  -- 3. Calculate line totals directly from database records (prevents frontend price manipulation)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id uuid, quantity integer)
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero.';
    END IF;

    SELECT id, name, price, is_available
    INTO v_menu_record
    FROM public.menu_items
    WHERE id = v_item.menu_item_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item with ID % does not exist.', v_item.menu_item_id;
    END IF;

    IF NOT v_menu_record.is_available THEN
      RAISE EXCEPTION 'Menu item "%" is currently sold out or unavailable.', v_menu_record.name;
    END IF;

    v_line_total := ROUND(v_menu_record.price * v_item.quantity, 2);
    v_subtotal := v_subtotal + v_line_total;

    v_order_items_to_insert := v_order_items_to_insert || jsonb_build_object(
      'menu_item_id', v_menu_record.id,
      'item_name', v_menu_record.name,
      'quantity', v_item.quantity,
      'unit_price', v_menu_record.price,
      'line_total', v_line_total
    );
  END LOOP;

  -- 4. Calculate 5% GST and final order total
  v_tax := ROUND(v_subtotal * 0.05, 2);
  v_total := v_subtotal + v_tax + v_delivery_fee;

  -- 5. Atomically insert master order record
  INSERT INTO public.orders (
    user_id,
    customer_name,
    phone,
    delivery_address,
    subtotal,
    tax,
    delivery_fee,
    total,
    payment_method,
    status
  ) VALUES (
    v_user_id,
    TRIM(p_customer_name),
    TRIM(p_phone),
    TRIM(p_delivery_address),
    v_subtotal,
    v_tax,
    v_delivery_fee,
    v_total,
    p_payment_method,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- 6. Atomically insert order item line records
  INSERT INTO public.order_items (
    order_id,
    menu_item_id,
    item_name,
    quantity,
    unit_price,
    line_total
  )
  SELECT
    v_order_id,
    (item->>'menu_item_id')::uuid,
    item->>'item_name',
    (item->>'quantity')::integer,
    (item->>'unit_price')::numeric,
    (item->>'line_total')::numeric
  FROM jsonb_array_elements(v_order_items_to_insert) AS item;

  -- 7. Return summary response
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'status', 'pending',
    'subtotal', v_subtotal,
    'tax', v_tax,
    'delivery_fee', v_delivery_fee,
    'total', v_total
  );
END;
$$;

-- Revoke default public execution and grant strictly to authenticated users
REVOKE EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, numeric) TO authenticated;

-- ------------------------------------------------------------------------------
-- 8. SAMPLE MENU SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Paneer Butter Masala',
  'Rich and creamy curry made with cottage cheese cubes simmered in a spiced tomato, butter, and cashew sauce.',
  280.00,
  'Main Course',
  true,
  true,
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Paneer Butter Masala');

INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Masala Dosa',
  'Crispy golden fermented rice & lentil crepe stuffed with spiced potato masala, served with piping hot sambar and fresh chutneys.',
  140.00,
  'South Indian',
  true,
  true,
  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Masala Dosa');

INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Chicken Biryani',
  'Slow-cooked aromatic basmati rice layered with tender marinated chicken pieces, caramelized onions, and authentic royal spices.',
  320.00,
  'Biryani',
  false,
  true,
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Chicken Biryani');

INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Veg Fried Rice',
  'Wok-tossed long-grain basmati rice mixed with crunchy garden vegetables, spring onions, and oriental savory seasonings.',
  190.00,
  'Chinese',
  true,
  true,
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Veg Fried Rice');

INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Butter Naan',
  'Traditional fluffy leavened flatbread freshly baked in a clay tandoor oven, brushed with generous amounts of butter.',
  50.00,
  'Breads',
  true,
  true,
  'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Butter Naan');

INSERT INTO public.menu_items (name, description, price, category, is_vegetarian, is_available, image_url)
SELECT 
  'Gobi Manchurian',
  'Crispy batter-fried cauliflower florets glazed in a tangy, spicy, and savory dark soya and garlic Indo-Chinese sauce.',
  210.00,
  'Starters',
  true,
  true,
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Gobi Manchurian');
