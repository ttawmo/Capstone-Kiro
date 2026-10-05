import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase connection with graceful local fallback.
 *
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, we connect to the
 * real project. Otherwise `supabase` is null and the data layer (data.ts) uses a
 * local in-memory store instead — so the app runs end-to-end with no backend.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string)
  : null;

export const dataSource = hasSupabase ? "supabase" : "local";
