import { createClient } from '@supabase/supabase-js';

// Clé anon publique — safe pour le frontend (jamais la service_role key)
const _URL = 'https://egjpoqdmgurykxabxtdt.supabase.co';
const _KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnanBvcWRtZ3VyeWt4YWJ4dGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzczNTIsImV4cCI6MjA5NzAxMzM1Mn0.EE3WpbBOxVc6YvJbwAnu5au2FAnZU1cbwuNBaE-Bik8';

// Les variables Vercel sont prioritaires ; les valeurs ci-dessus servent de fallback
// si Vite ne les injecte pas au build (évite placeholder.supabase.co → ERR_NAME_NOT_RESOLVED)
export const SUPABASE_URL          = import.meta.env.VITE_SUPABASE_URL          || _URL;
export const SUPABASE_ANON_KEY     = import.meta.env.VITE_SUPABASE_ANON_KEY     || _KEY;
export const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'vendor-images';

// Toujours true — les fallbacks pointent vers le vrai projet Supabase
export const IS_REAL_SUPABASE = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const VENDORS_TABLE  = 'vendors';
export const PRODUCTS_TABLE = 'products';
export const CITIES_TABLE   = 'cities';
export const REVIEWS_TABLE  = 'reviews';

export async function signInVendor({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function registerVendor({ email, password, shop, city, phone }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { shop, city, phone } },
  });
}

export async function signOutVendor() {
  return supabase.auth.signOut();
}

export async function fetchVendors() {
  return supabase.from(VENDORS_TABLE).select('*');
}

export async function fetchProducts() {
  return supabase.from(PRODUCTS_TABLE).select('*');
}

export async function fetchCities() {
  return supabase.from(CITIES_TABLE).select('*');
}

export async function fetchReviews() {
  return supabase.from(REVIEWS_TABLE).select('*');
}

export async function uploadVendorImage(path, file) {
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, { upsert: true });
}

export function getVendorImageUrl(path) {
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data?.publicUrl || null;
}
