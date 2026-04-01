-- Cozinha de Casa — Database Schema
-- Execute in Supabase SQL Editor

-- 1. Households
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at timestamptz DEFAULT now()
);

-- 2. Household Members
CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cook', 'buyer', 'member')),
  dietary_profile jsonb DEFAULT '{"allergies":[],"diet":null,"preferences":null}'::jsonb,
  eats_with_family boolean DEFAULT true,
  lunch_at text,
  is_child boolean DEFAULT false,
  age integer,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 3. Stock Items
CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  location text NOT NULL CHECK (location IN ('fridge', 'freezer', 'pantry', 'shelf')),
  quantity decimal NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'un',
  min_threshold decimal,
  expiry_date date,
  frozen_at date,
  portions_total integer,
  portions_remaining integer,
  source text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Prato principal',
  cuisine text,
  tags text[] DEFAULT '{}',
  prep_time_min integer NOT NULL DEFAULT 30,
  servings integer NOT NULL DEFAULT 5,
  difficulty text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  steps text[] DEFAULT '{}',
  notes text,
  photo_url text,
  youtube_videos jsonb,
  is_favorite boolean DEFAULT false,
  is_vivianne_safe boolean GENERATED ALWAYS AS (
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(ingredients) AS ing
      WHERE (ing->>'is_allergen_milk')::boolean = true
         OR (ing->>'is_allergen_wheat')::boolean = true
    )
  ) STORED,
  is_ticy_safe boolean GENERATED ALWAYS AS (
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(ingredients) AS ing
      WHERE (ing->>'is_allergen_egg')::boolean = true
    )
  ) STORED,
  times_used integer DEFAULT 0,
  last_used_at timestamptz,
  parent_recipe_id uuid REFERENCES recipes(id),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 5. Weekly Menus
CREATE TABLE IF NOT EXISTS weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  slot text NOT NULL CHECK (slot IN ('lunchbox_lowcarb', 'lunchbox_school', 'dinner', 'dinner_adapted')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  free_text text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(household_id, week_start, day_of_week, slot)
);

-- 6. Shopping List Items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity decimal NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'un',
  category text DEFAULT 'Outros',
  buy_at text NOT NULL DEFAULT 'Supermercado',
  assigned_to uuid REFERENCES household_members(id),
  is_checked boolean DEFAULT false,
  auto_generated boolean DEFAULT false,
  recipe_source text,
  created_at timestamptz DEFAULT now()
);

-- 7. Notes
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  author_id uuid REFERENCES household_members(id),
  content text NOT NULL,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'day_note', 'recipe_feedback', 'preference')),
  linked_date date,
  linked_recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  linked_member_id uuid REFERENCES household_members(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_household ON stock_items(household_id);
CREATE INDEX IF NOT EXISTS idx_recipes_household ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_menus_household_week ON weekly_menus(household_id, week_start);
CREATE INDEX IF NOT EXISTS idx_shopping_household ON shopping_list_items(household_id);
CREATE INDEX IF NOT EXISTS idx_members_household ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_members_auth ON household_members(auth_user_id);

-- RLS Policies
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Helper function: get household_id for current user
CREATE OR REPLACE FUNCTION get_my_household_id()
RETURNS uuid AS $$
  SELECT household_id FROM household_members WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Households: members can read their own household
CREATE POLICY "Members can view their household" ON households
  FOR SELECT USING (id = get_my_household_id());

-- Household Members: can view co-members
CREATE POLICY "Members can view co-members" ON household_members
  FOR SELECT USING (household_id = get_my_household_id());

CREATE POLICY "Users can insert their own member record" ON household_members
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own member record" ON household_members
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Stock: household members full access
CREATE POLICY "Household members manage stock" ON stock_items
  FOR ALL USING (household_id = get_my_household_id())
  WITH CHECK (household_id = get_my_household_id());

-- Recipes: household members full access
CREATE POLICY "Household members manage recipes" ON recipes
  FOR ALL USING (household_id = get_my_household_id())
  WITH CHECK (household_id = get_my_household_id());

-- Weekly Menus: household members full access
CREATE POLICY "Household members manage menus" ON weekly_menus
  FOR ALL USING (household_id = get_my_household_id())
  WITH CHECK (household_id = get_my_household_id());

-- Shopping List: household members full access
CREATE POLICY "Household members manage shopping" ON shopping_list_items
  FOR ALL USING (household_id = get_my_household_id())
  WITH CHECK (household_id = get_my_household_id());

-- Notes: household members full access
CREATE POLICY "Household members manage notes" ON notes
  FOR ALL USING (household_id = get_my_household_id())
  WITH CHECK (household_id = get_my_household_id());

-- Allow household creation by authenticated users
CREATE POLICY "Authenticated users can create households" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
