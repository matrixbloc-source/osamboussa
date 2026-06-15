import { useState, useEffect } from 'react';
import { supabase, IS_REAL_SUPABASE } from './supabaseClient.js';
import SELLERS_FALLBACK from '../data/sellers.js';

function mapRow(row, products = []) {
  return {
    id: row.id,
    shop: row.shop || '',
    city: row.city || '',
    email: row.email || '',
    tel: (row.phone || '').replace(/[\s+\-().]/g, ''),
    description: row.description || '',
    subscription: row.subscription || 'basic',
    verified: Boolean(row.verified),
    suspended: Boolean(row.suspended),
    rating: Number(row.rating) || 0,
    reviews: row.reviews_count || 0,
    sales: row.sales || 0,
    instagram: row.instagram || '',
    facebook: row.facebook || '',
    hours: row.hours || '',
    delivery: Boolean(row.delivery),
    deliveryTime: row.delivery_time || '',
    deliveryZone: row.delivery_zone || '',
    address: row.address || '',
    photo: row.photo || null,
    logo: row.logo || null,
    from: Number(row.from_price) || 2.00,
    types: Array.isArray(row.types) ? row.types : [],
    joinedDate: row.created_at ? row.created_at.slice(0, 7) : '',
    gallery: [],
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      img: p.img || null,
      images: Array.isArray(p.images) ? p.images : [],
    })),
  };
}

export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!IS_REAL_SUPABASE) {
      setVendors(SELLERS_FALLBACK);
      setLoading(false);
      return;
    }

    supabase
      .from('vendors')
      .select('*')
      .eq('suspended', false)
      .eq('verified', true)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setVendors((data || []).map(row => mapRow(row)));
        }
        setLoading(false);
      });
  }, []);

  return { vendors, loading, error };
}

export function useVendor(id) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // id not yet available (auth still loading) — keep loading true
    if (id === null || id === undefined) return;

    setLoading(true);
    setError(null);

    if (!IS_REAL_SUPABASE) {
      const s = SELLERS_FALLBACK.find(x => String(x.id) === String(id));
      setVendor(s || null);
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from('vendors').select('*').eq('id', id).single(),
      supabase.from('products').select('*').eq('vendor_id', id).eq('active', true),
    ]).then(([{ data: v, error: ve }, { data: prods }]) => {
      if (ve) {
        // PGRST116 = no rows found — not a hard error, just no profile yet
        if (ve.code !== 'PGRST116') setError(ve.message);
        setVendor(null);
      } else {
        setVendor(mapRow(v, prods || []));
      }
      setLoading(false);
    });
  }, [id]);

  return { vendor, loading, error };
}
