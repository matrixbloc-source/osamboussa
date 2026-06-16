import { useState, useEffect } from 'react';
import { supabase, IS_REAL_SUPABASE } from './supabaseClient.js';

const FOUNDER_LIMIT = 50;

export function useFounderCount() {
  const [count, setCount]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!IS_REAL_SUPABASE) {
      // Fallback démo — simuler 8 vendeurs pour tester l'affichage
      setCount(8);
      setLoading(false);
      return;
    }

    supabase
      .from('vendors')
      .select('id', { count: 'exact', head: true })
      .then(({ count: n, error }) => {
        if (!error && n !== null) setCount(n);
        setLoading(false);
      });
  }, []);

  const remaining = count !== null ? Math.max(0, FOUNDER_LIMIT - count) : null;
  const isFull    = remaining === 0;
  const pct       = count !== null ? Math.min(100, Math.round((count / FOUNDER_LIMIT) * 100)) : 0;

  return { count, remaining, isFull, loading, limit: FOUNDER_LIMIT, pct };
}
