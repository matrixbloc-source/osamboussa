import { supabase, IS_REAL_SUPABASE } from './supabaseClient.js';

/*
  Tracking events for vendor analytics.
  Requires the SQL in supabase/migrations.sql to be run first.
  All functions fail silently if Supabase is not configured or tables don't exist yet.
*/

function localInc(key, vendorId) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    stored[vendorId] = (stored[vendorId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stored));
  } catch { /* ignore */ }
}

/** Track a WhatsApp button click */
export function trackWA(vendorId) {
  if (!vendorId) return;
  localInc('wa_clicks', vendorId);
  if (!IS_REAL_SUPABASE) return;
  supabase.rpc('inc_wa_clicks', { vid: vendorId }).then(() => {}).catch(() => {});
}

/** Track a vendor profile page view */
export function trackView(vendorId) {
  if (!vendorId) return;
  if (!IS_REAL_SUPABASE) return;
  supabase.rpc('inc_page_views', { vid: vendorId }).then(() => {}).catch(() => {});
}

/** Read local WA clicks for a vendor (shown in dashboard before Supabase loads) */
export function getLocalWAClicks(vendorId) {
  try {
    const stored = JSON.parse(localStorage.getItem('wa_clicks') || '{}');
    return stored[vendorId] || 0;
  } catch { return 0; }
}
