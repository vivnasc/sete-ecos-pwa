"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { StockItem } from "@/lib/types";

export function useStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getHouseholdId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("household_id") || "";
    }
    return "";
  };

  const fetchItems = useCallback(async () => {
    const householdId = getHouseholdId();
    if (!householdId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("stock_items")
      .select("*")
      .eq("household_id", householdId)
      .order("category")
      .order("name");

    if (!error && data) setItems(data as StockItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (item: Partial<StockItem>) => {
    const householdId = getHouseholdId();
    const { data, error } = await supabase
      .from("stock_items")
      .insert({ ...item, household_id: householdId })
      .select()
      .single();
    if (!error && data) {
      setItems((prev) => [...prev, data as StockItem]);
      return data as StockItem;
    }
    return null;
  };

  const updateItem = async (id: string, updates: Partial<StockItem>) => {
    const { data, error } = await supabase
      .from("stock_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setItems((prev) => prev.map((i) => (i.id === id ? (data as StockItem) : i)));
    }
  };

  const adjustQuantity = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    await updateItem(id, { quantity: newQty });
  };

  const deleteItem = async (id: string) => {
    await supabase.from("stock_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, fetchItems, addItem, updateItem, adjustQuantity, deleteItem };
}
