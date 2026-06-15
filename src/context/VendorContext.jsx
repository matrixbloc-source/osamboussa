import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { supabase, IS_REAL_SUPABASE } from '../lib/supabaseClient.js';

const VendorContext = createContext(null);

export const PLAN_BADGE = {
  basic:   { icon: '🏪', color: '#9A9A8A', label: 'Basic Actif' },
  pro:     { icon: '⭐', color: '#C9A84C', label: 'Pro Actif' },
  premium: { icon: '👑', color: '#E8D5A3', label: 'Premium Actif' },
};

export function VendorProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    if (!IS_REAL_SUPABASE) {
      setStatus(null);
      setLoading(false);
      return;
    }

    supabase
      .from('vendors')
      .select('id, shop, subscription, verified, suspended')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data || data.suspended) {
          setStatus(null);
        } else {
          setStatus({
            plan: data.subscription || 'basic',
            shop: data.shop || '',
            verified: Boolean(data.verified),
          });
        }
        setLoading(false);
      });
  }, [user, authLoading]);

  const verified = Boolean(status?.verified);

  return (
    <VendorContext.Provider value={{
      isVendor: Boolean(status) && verified,
      isPendingVendor: Boolean(status) && !verified,
      vendorPlan: status?.plan ?? null,
      vendorShop: status?.shop ?? null,
      vendorVerified: verified,
      vendorLoading: loading,
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendorStatus() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error('useVendorStatus must be inside VendorProvider');
  return ctx;
}
