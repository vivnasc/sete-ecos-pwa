export type UserRole = "admin" | "cook" | "buyer" | "member";

export interface DietaryProfile {
  allergies: string[]; // 'milk', 'wheat', 'egg'
  diet: string | null; // 'low_carb', 'normal', 'adapted'
  preferences: string | null;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  name: string;
  role: UserRole;
  dietary_profile: DietaryProfile;
  eats_with_family: boolean;
  lunch_at: string | null; // 'creche' for Cris
  is_child: boolean;
  age: number | null;
  auth_user_id: string | null;
}

export type StockLocation = "fridge" | "freezer" | "pantry" | "shelf";

export interface StockItem {
  id: string;
  household_id: string;
  name: string;
  category: string;
  location: StockLocation;
  quantity: number;
  unit: string;
  min_threshold: number | null;
  expiry_date: string | null;
  frozen_at: string | null;
  portions_total: number | null;
  portions_remaining: number | null;
  source: string | null;
  updated_at: string;
}

export interface RecipeIngredient {
  name: string;
  qty: number;
  unit: string;
  is_allergen_milk: boolean;
  is_allergen_wheat: boolean;
  is_allergen_egg: boolean;
}

export interface YouTubeVideo {
  video_id: string;
  title: string;
  thumbnail: string;
  duration: string;
  is_favorite: boolean;
}

export interface Recipe {
  id: string;
  household_id: string;
  name: string;
  category: string;
  cuisine: string | null;
  tags: string[];
  prep_time_min: number;
  servings: number;
  difficulty: string | null;
  ingredients: RecipeIngredient[];
  steps: string[];
  notes: string | null;
  photo_url: string | null;
  youtube_videos: YouTubeVideo[] | null;
  is_favorite: boolean;
  is_vivianne_safe: boolean;
  is_ticy_safe: boolean;
  times_used: number;
  last_used_at: string | null;
  parent_recipe_id: string | null;
  created_by: string;
  created_at: string;
}

export type MenuSlot = "lunchbox_lowcarb" | "lunchbox_school" | "dinner" | "dinner_adapted";

export interface WeeklyMenu {
  id: string;
  household_id: string;
  week_start: string;
  day_of_week: number; // 0=Mon ... 6=Sun
  slot: MenuSlot;
  recipe_id: string | null;
  free_text: string | null;
  notes: string | null;
  created_at: string;
  recipe?: Recipe;
}

export type ShoppingSection = "Mercado" | "Supermercado" | "Talho" | "Komatipoort" | "Outros";

export interface ShoppingListItem {
  id: string;
  household_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  buy_at: ShoppingSection;
  assigned_to: string | null;
  is_checked: boolean;
  auto_generated: boolean;
  created_at: string;
}

export type NoteType = "general" | "day_note" | "recipe_feedback" | "preference";

export interface Note {
  id: string;
  household_id: string;
  author_id: string;
  content: string;
  type: NoteType;
  linked_date: string | null;
  linked_recipe_id: string | null;
  linked_member_id: string | null;
  created_at: string;
}
