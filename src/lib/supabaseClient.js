import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'vendor-images';

// true uniquement quand URL et clé anon sont réelles
export const IS_REAL_SUPABASE = Boolean(
  SUPABASE_URL && !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder') &&
  SUPABASE_ANON_KEY.startsWith('eyJ')
);

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

export const VENDORS_TABLE = 'vendors';
export const PRODUCTS_TABLE = 'products';
export const CITIES_TABLE = 'cities';
export const REVIEWS_TABLE = 'reviews';

export async function signInVendor({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function registerVendor({ email, password, shop, city, phone }) {
  const authResult = await supabase.auth.signUp({ email, password });
  if (authResult.error) {
    return { error: authResult.error, data: null };
  }

  const userId = authResult.data.user?.id;
  if (userId) {
    const profileResult = await supabase.from(VENDORS_TABLE).insert([
      {
        id: userId,
        email,
        shop,
        city,
        phone,
        created_at: new Date().toISOString(),
      },
    ]);
    if (profileResult.error) {
      return { error: profileResult.error, data: authResult.data };
    }
  }

  return { data: authResult.data, error: null };
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
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, {
    upsert: true,
  });
}

export function getVendorImageUrl(path) {
  return supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path).data?.publicUrl || null;
}
