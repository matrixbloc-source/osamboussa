import { supabase, IS_REAL_SUPABASE } from './supabaseClient.js';

/*
  Tracking WhatsApp clicks.
  Requires this SQL in Supabase (run once):

  CREATE TABLE IF NOT EXISTS public.vendor_stats (
    vendor_id uuid PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    wa_clicks  integer DEFAULT 0,
    page_views integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
  );
  ALTER TABLE vendor_stats ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "public insert" ON vendor_stats FOR INSERT WITH CHECK (true);
  CREATE POLICY "public update" ON vendor_stats FOR UPDATE USING (true);
  CREATE POLICY "public select" ON vendor_stats FOR SELECT USING (true);

  CREATE OR REPLACE FUNCTION public.inc_wa_clicks(vid text)
  RETURNS void LANGUAGE sql AS $$
    INSERT INTO vendor_stats (vendor_id, wa_clicks)
    VALUES (vid::uuid, 1)
    ON CONFLICT (vendor_id) DO UPDATE
    SET wa_clicks = vendor_stats.wa_clicks + 1, updated_at = now();
  $$;
*/

export function trackWA(vendorId) {
  if (!vendorId) return;

  // Local tracking — always works, per device
  try {
    const stored = JSON.parse(localStorage.getItem('wa_clicks') || '{}');
    stored[vendorId] = (stored[vendorId] || 0) + 1;
    localStorage.setItem('wa_clicks', JSON.stringify(stored));
  } catch { /* ignore */ }

  // Remote tracking — requires the SQL above to be run
  if (!IS_REAL_SUPABASE) return;
  supabase
    .rpc('inc_wa_clicks', { vid: vendorId })
    .then(() => {})
    .catch(() => {}); // silently fail if SQL not yet run
}
