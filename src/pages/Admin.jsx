import { useState, useMemo, useEffect } from 'react';
import { supabase, IS_REAL_SUPABASE } from '../lib/supabaseClient.js';

const REPORTS = [
  { id: 'r1', type: 'Contenu inapproprié', seller: 'Les Délices de Lyon', reporter: 'client_42', date: '12/06/2026', status: 'En attente' },
  { id: 'r2', type: 'Fausse information', seller: 'Couscouma & Co', reporter: 'client_17', date: '10/06/2026', status: 'En attente' },
];

const NOTIFICATIONS_TPL = [
  { id: 'n1', label: 'Bienvenue sur la plateforme', body: "Votre compte O'Samboussa a été validé. Bienvenue !" },
  { id: 'n2', label: 'Complétez votre profil', body: 'Votre profil est presque complet. Ajoutez vos produits et photos pour attirer plus de clients.' },
  { id: 'n3', label: 'Nouvelle mise à jour', body: 'De nouvelles fonctionnalités sont disponibles dans votre espace vendeur.' },
];

const ADMIN_SQL = `-- Exécuter UNE FOIS dans Supabase → SQL Editor
CREATE POLICY "admin_update_vendors" ON public.vendors
  FOR UPDATE
  USING  ((auth.jwt()->'user_metadata'->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

CREATE POLICY "admin_delete_vendors" ON public.vendors
  FOR DELETE
  USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');`;

export default function Admin() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [showSQL, setShowSQL] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState(REPORTS);
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSent, setNotifSent] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (!IS_REAL_SUPABASE) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('vendors')
      .select('id, shop, city, email, phone, subscription, verified, suspended, rating, reviews_count, sales, types, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setVendors(data);
    setLoading(false);
  }

  async function applyUpdate(id, patch) {
    setActionError(null);
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    if (!IS_REAL_SUPABASE) return;
    const { error } = await supabase.from('vendors').update(patch).eq('id', id);
    if (error) { setActionError(error.message); load(); }
  }

  async function applyDelete(id, shop) {
    if (!window.confirm(`Supprimer définitivement "${shop || 'ce vendeur'}" ?`)) return;
    setActionError(null);
    setVendors(prev => prev.filter(v => v.id !== id));
    if (!IS_REAL_SUPABASE) return;
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) { setActionError(error.message); load(); }
  }

  const validate = (id) => applyUpdate(id, { verified: true });
  const suspend  = (id) => applyUpdate(id, { suspended: true });
  const restore  = (id) => applyUpdate(id, { suspended: false });
  const remove   = (id, shop) => applyDelete(id, shop);
  const resolveReport = (id) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Résolu' } : r));

  const stats = useMemo(() => ({
    total: vendors.length,
    verified: vendors.filter(v => v.verified && !v.suspended).length,
    pending: vendors.filter(v => !v.verified && !v.suspended).length,
    suspended: vendors.filter(v => v.suspended).length,
    cities: new Set(vendors.map(v => v.city).filter(Boolean)).size,
  }), [vendors]);

  const filtered = useMemo(() => vendors.filter(v => {
    const q = search.toLowerCase();
    if (q && !v.shop?.toLowerCase().includes(q) && !v.email?.toLowerCase().includes(q) && !v.city?.toLowerCase().includes(q)) return false;
    if (filterStatus === 'verified' && !(v.verified && !v.suspended)) return false;
    if (filterStatus === 'pending' && (v.verified || v.suspended)) return false;
    if (filterStatus === 'suspended' && !v.suspended) return false;
    return true;
  }), [vendors, search, filterStatus]);

  const sendNotification = () => {
    if (!notifMsg.trim()) return;
    setNotifSent(true);
    setNotifMsg('');
    setTimeout(() => setNotifSent(false), 3000);
  };

  const isRLSError = actionError && (actionError.includes('row-level') || actionError.includes('policy') || actionError.includes('violates'));

  const tabs = [
    { id: 'overview', label: "📊 Vue d'ensemble" },
    { id: 'sellers', label: `🏪 Vendeurs (${vendors.length})` },
    { id: 'reports', label: `🚩 Signalements (${reports.filter(r => r.status === 'En attente').length})` },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  if (loading) return (
    <section style={{ padding: 16, maxWidth: 1100, margin: '80px auto', textAlign: 'center', paddingTop: 80 }}>
      <div style={{ color: '#C9A84C', fontSize: 14, animation: 'pulse 1.5s infinite' }}>Chargement des données admin…</div>
    </section>
  );

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="pf" style={{ fontSize: 'clamp(22px,5vw,28px)' }}>Administration</h2>
        <p style={{ color: '#9A9A8A', fontSize: 13, marginTop: 4 }}>
          Panneau O'Samboussa · {vendors.length} vendeur{vendors.length !== 1 ? 's' : ''} chargé{vendors.length !== 1 ? 's' : ''} depuis Supabase
          <button onClick={load} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
            ↻ Actualiser
          </button>
        </p>
      </div>

      {/* Error / RLS banner */}
      {actionError && (
        <div style={{ background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.35)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ color: '#FF6B6B', fontSize: 13, marginBottom: isRLSError ? 8 : 0 }}>⚠ {actionError}</div>
          {isRLSError && (
            <>
              <div style={{ color: '#9A9A8A', fontSize: 12, marginBottom: 8 }}>
                Les politiques admin Supabase ne sont pas configurées.{' '}
                <button onClick={() => setShowSQL(s => !s)} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                  {showSQL ? 'Masquer le SQL' : 'Voir le SQL à exécuter →'}
                </button>
              </div>
              {showSQL && (
                <pre style={{ background: '#0A0A0A', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, padding: 14, fontSize: 11, color: '#C9A84C', overflowX: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {ADMIN_SQL}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(201,168,76,.1)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t.id ? '#C9A84C' : '#6B6B6B', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total vendeurs',  val: stats.total,                        color: '#F5F0E8', icon: '🏪' },
              { label: 'Vérifiés actifs', val: stats.verified,                     color: '#4ADE80', icon: '✅' },
              { label: 'En attente',      val: stats.pending,                      color: '#FBBF24', icon: '⏳' },
              { label: 'Suspendus',       val: stats.suspended,                    color: '#FF6B6B', icon: '🚫' },
              { label: 'Villes',          val: stats.cities,                       color: '#C9A84C', icon: '📍' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🚀</div>
            <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Phase Fondateur · Accès gratuit à vie</p>
            <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7 }}>
              Tous les vendeurs inscrits pendant cette phase bénéficient du Compte Fondateur.<br />
              Les fonctionnalités payantes seront introduites après la phase de lancement.
            </p>
          </div>
        </div>
      )}

      {/* ── SELLERS ── */}
      {activeTab === 'sellers' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, ville…"
              style={{ padding: '9px 14px', borderRadius: 8, fontSize: 13, flex: '1 1 200px', minWidth: 180 }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, width: 155 }}>
              <option value="all">Tous les statuts</option>
              <option value="verified">✅ Vérifiés</option>
              <option value="pending">⏳ En attente</option>
              <option value="suspended">🚫 Suspendus</option>
            </select>
            <span style={{ color: '#6B6B6B', fontSize: 12, whiteSpace: 'nowrap' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 48, background: '#111', borderRadius: 12 }}>
              {vendors.length === 0 ? "Aucun vendeur dans Supabase pour l'instant." : 'Aucun résultat pour ces filtres.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map(v => {
                const types = Array.isArray(v.types) ? v.types : [];
                const date  = v.created_at ? v.created_at.slice(0, 10) : '—';
                return (
                  <div key={v.id}
                    style={{ background: '#0D0D0D', border: `1px solid ${v.suspended ? 'rgba(255,107,107,.2)' : 'rgba(201,168,76,.06)'}`, borderRadius: 10, padding: '14px 16px', opacity: v.suspended ? 0.65 : 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>{v.shop || '(sans nom)'}</span>
                          {v.verified && !v.suspended && <span style={{ color: '#4ADE80', fontSize: 10, background: 'rgba(74,222,128,.1)', padding: '2px 8px', borderRadius: 20 }}>✔ Vérifié</span>}
                          {!v.verified && !v.suspended && <span style={{ color: '#FBBF24', fontSize: 10, background: 'rgba(251,191,36,.1)', padding: '2px 8px', borderRadius: 20 }}>⏳ En attente</span>}
                          {v.suspended && <span style={{ color: '#FF6B6B', fontSize: 10, background: 'rgba(255,107,107,.1)', padding: '2px 8px', borderRadius: 20 }}>🚫 Suspendu</span>}
                          <span style={{ color: '#C9A84C', fontSize: 10, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', padding: '2px 8px', borderRadius: 20 }}>🚀 Fondateur</span>
                        </div>
                        <div style={{ color: '#9A9A8A', fontSize: 12, lineHeight: 1.9 }}>
                          {v.email && <><span>✉ {v.email}</span> &nbsp;</>}
                          {v.city && <><span>📍 {v.city}</span> &nbsp;</>}
                          {types.length > 0 && <><span>🏷 {types.join(', ')}</span> &nbsp;</>}
                          <span>⭐ {Number(v.rating || 0).toFixed(1)} · {v.reviews_count || 0} avis</span>
                          &nbsp;<span>📅 {date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {!v.verified && !v.suspended && (
                          <button className="btn-o" onClick={() => validate(v.id)}
                            style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                            Valider
                          </button>
                        )}
                        {!v.suspended
                          ? <button className="btn-o" onClick={() => suspend(v.id)}
                              style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#FBBF24', borderColor: '#FBBF24', borderRadius: 6 }}>
                              Suspendre
                            </button>
                          : <button className="btn-o" onClick={() => restore(v.id)}
                              style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                              Restaurer
                            </button>
                        }
                        <button className="btn-o" onClick={() => remove(v.id, v.shop)}
                          style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#FF6B6B', borderColor: '#FF6B6B', borderRadius: 6 }}>
                          Suppr.
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REPORTS ── */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#9A9A8A', fontSize: 12 }}>
            ℹ Signalements en mode démonstration. Créez une table{' '}
            <code style={{ color: '#C9A84C', background: 'rgba(201,168,76,.1)', padding: '1px 6px', borderRadius: 4 }}>reports</code>
            {' '}dans Supabase pour les rendre persistants.
          </div>
          {reports.length === 0 && (
            <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 48 }}>Aucun signalement en attente.</div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{ background: '#111', border: `1px solid ${r.status === 'Résolu' ? 'rgba(74,222,128,.2)' : 'rgba(255,107,107,.2)'}`, borderRadius: 12, padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>🚩 {r.type}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: r.status === 'Résolu' ? 'rgba(74,222,128,.1)' : 'rgba(255,107,107,.1)', color: r.status === 'Résolu' ? '#4ADE80' : '#FF6B6B' }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ color: '#9A9A8A', fontSize: 12 }}>
                    Vendeur : <span style={{ color: '#C9A84C' }}>{r.seller}</span> · Signalé par : {r.reporter} · {r.date}
                  </div>
                </div>
                {r.status === 'En attente' && (
                  <button className="btn-o" onClick={() => resolveReport(r.id)}
                    style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                    Résoudre
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === 'notifications' && (
        <div>
          <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#9A9A8A', fontSize: 12 }}>
            ℹ Notifications simulées — intégration email/push (SendGrid, Expo, etc.) requise pour un envoi réel.
          </div>
          {notifSent && (
            <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid #4ADE80', borderRadius: 10, padding: '12px 16px', color: '#4ADE80', fontSize: 13, marginBottom: 16 }}>
              ✔ Notification simulée vers {vendors.length} vendeur{vendors.length !== 1 ? 's' : ''}.
            </div>
          )}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Envoyer un message</h3>
            <textarea
              value={notifMsg}
              onChange={e => setNotifMsg(e.target.value)}
              placeholder="Message à envoyer à tous les vendeurs…"
              style={{ padding: 12, minHeight: 100, borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 12 }}
            />
            <button className="btn-g" onClick={sendNotification} disabled={!notifMsg.trim()}
              style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, cursor: notifMsg.trim() ? 'pointer' : 'not-allowed', opacity: notifMsg.trim() ? 1 : 0.5 }}>
              Envoyer à tous ({vendors.length} vendeurs)
            </button>
          </div>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Modèles</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {NOTIFICATIONS_TPL.map(n => (
                <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: '12px 14px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{n.label}</div>
                    <div style={{ color: '#6B6B6B', fontSize: 12 }}>{n.body}</div>
                  </div>
                  <button className="btn-o" onClick={() => setNotifMsg(n.body)}
                    style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 6 }}>
                    Utiliser
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
