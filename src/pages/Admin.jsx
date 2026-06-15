import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase, IS_REAL_SUPABASE } from '../lib/supabaseClient.js';

/* ── Status helpers ──────────────────────────────────────────────── */
function getStatus(v) {
  if (v.suspended) return 'suspended';
  if (v.refused)   return 'refused';
  if (v.verified)  return 'verified';
  return 'pending';
}

const STATUS_STYLE = {
  verified:  { color: '#4ADE80', bg: 'rgba(74,222,128,.12)',  label: '✔ Vérifié' },
  pending:   { color: '#FBBF24', bg: 'rgba(251,191,36,.12)', label: '⏳ En attente' },
  suspended: { color: '#F87171', bg: 'rgba(248,113,113,.12)', label: '🚫 Suspendu' },
  refused:   { color: '#FB923C', bg: 'rgba(251,146,60,.12)',  label: '✕ Refusé' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 9px', borderRadius: 20 }}>
      {s.label}
    </span>
  );
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color = '#F5F0E8', sub }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: '18px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ color: '#C9A84C', fontSize: 10, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ── Mini bar chart (CSS only) ───────────────────────────────────── */
function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
      {title && <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{title}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 28px', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#9A9A8A', fontSize: 12, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {i + 1}. {d.label}
            </span>
            <div style={{ background: '#1A1A1A', borderRadius: 4, height: 7, overflow: 'hidden' }}>
              <div style={{
                background: `linear-gradient(90deg, #8A6E2F, #C9A84C)`,
                height: '100%', borderRadius: 4,
                width: `${(d.value / max) * 100}%`,
                transition: 'width .6s ease',
              }} />
            </div>
            <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 12 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Refuse modal ────────────────────────────────────────────────── */
function RefuseModal({ vendor, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid rgba(248,113,113,.3)', borderRadius: 18, padding: 28, maxWidth: 420, width: '100%', animation: 'fadeIn .2s ease' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>✕</div>
        <h3 className="pf" style={{ fontSize: 20, marginBottom: 8, color: '#F5F0E8', textAlign: 'center' }}>
          Refuser "{vendor?.shop}" ?
        </h3>
        <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
          Le vendeur restera en base mais ne sera plus visible. Vous pourrez le restaurer à tout moment.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motif du refus (optionnel — ex: profil incomplet, contenu inadapté…)"
          style={{ padding: 12, borderRadius: 8, fontSize: 13, width: '100%', minHeight: 80, marginBottom: 18, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-o"
            style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={() => onConfirm(reason)}
            style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: 'rgba(248,113,113,.15)', border: '1px solid #F87171', color: '#F87171', fontWeight: 600 }}>
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SQL helper snippet ──────────────────────────────────────────── */
const MIGRATION_NOTE = `Exécutez le fichier supabase/migrations.sql dans Supabase Dashboard → SQL Editor pour activer toutes les fonctionnalités.`;

/* ══════════════════════════════════════════════════════════════════ */
export default function Admin() {
  const [vendors,      setVendors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionError,  setActionError]  = useState(null);
  const [activeTab,    setActiveTab]    = useState('overview');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refuseTarget, setRefuseTarget] = useState(null); // vendor to refuse
  const [reports,      setReports]      = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [notifMsg,     setNotifMsg]     = useState('');
  const [notifSent,    setNotifSent]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!IS_REAL_SUPABASE) { setLoading(false); return; }

    // Try with extended columns; fall back to base columns if migration not yet run
    let { data, error } = await supabase
      .from('vendors')
      .select('id, shop, city, email, phone, verified, suspended, refused, refuse_reason, validated_at, rating, reviews_count, sales, types, created_at, logo, photo')
      .order('created_at', { ascending: false });

    if (error?.message?.includes('column') || error?.message?.includes('refused')) {
      const res = await supabase
        .from('vendors')
        .select('id, shop, city, email, phone, verified, suspended, rating, reviews_count, sales, types, created_at, logo, photo')
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    }

    if (!error && data) setVendors(data);
    else if (error) setActionError(error.message);
    setLoading(false);
  }, []);

  const loadReports = useCallback(async () => {
    if (!IS_REAL_SUPABASE) return;
    setReportsLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setReportsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (activeTab === 'reports') loadReports();
  }, [activeTab, loadReports]);

  /* ── Actions ──────────────────────────────────────────────────── */
  async function applyUpdate(id, patch) {
    setActionError(null);
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    if (!IS_REAL_SUPABASE) return;
    const { error } = await supabase.from('vendors').update(patch).eq('id', id);
    if (error) { setActionError(error.message); load(); }
  }

  async function applyDelete(id, shop) {
    if (!window.confirm(`Supprimer définitivement "${shop || 'ce vendeur'}" ?`)) return;
    setVendors(prev => prev.filter(v => v.id !== id));
    if (!IS_REAL_SUPABASE) return;
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) { setActionError(error.message); load(); }
  }

  const validate = (id) => applyUpdate(id, {
    verified: true, suspended: false, refused: false,
    validated_at: new Date().toISOString(),
  });
  const suspend  = (id) => applyUpdate(id, { suspended: true });
  const restore  = (id) => applyUpdate(id, { suspended: false, refused: false, verified: false });
  const refuse   = (id, reason) => {
    setRefuseTarget(null);
    applyUpdate(id, { verified: false, suspended: false, refused: true, refuse_reason: reason || null });
  };

  const resolveReport = async (reportId) => {
    setReports(prev => prev.map(r => r.id === reportId
      ? { ...r, status: 'resolved', resolved_at: new Date().toISOString() } : r));
    if (!IS_REAL_SUPABASE) return;
    await supabase.from('reports').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', reportId);
  };

  const dismissReport = async (reportId) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    if (!IS_REAL_SUPABASE) return;
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
  };

  const sendNotification = () => {
    if (!notifMsg.trim()) return;
    setNotifSent(true);
    setNotifMsg('');
    setTimeout(() => setNotifSent(false), 3000);
  };

  /* ── Derived stats ────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const topCities = Object.entries(
      vendors.reduce((acc, v) => { if (v.city) acc[v.city] = (acc[v.city] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));

    const topVendors = [...vendors]
      .filter(v => v.verified && !v.suspended && (v.rating || 0) > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    return {
      total:     vendors.length,
      verified:  vendors.filter(v => v.verified && !v.suspended).length,
      pending:   vendors.filter(v => !v.verified && !v.suspended && !v.refused).length,
      suspended: vendors.filter(v => v.suspended).length,
      refused:   vendors.filter(v => v.refused && !v.suspended).length,
      cities:    new Set(vendors.map(v => v.city).filter(Boolean)).size,
      thisWeek:  vendors.filter(v => v.created_at && (now - new Date(v.created_at).getTime()) < week).length,
      topCities,
      topVendors,
    };
  }, [vendors]);

  const filtered = useMemo(() => vendors.filter(v => {
    const q = search.toLowerCase();
    if (q && !v.shop?.toLowerCase().includes(q) && !v.email?.toLowerCase().includes(q) && !v.city?.toLowerCase().includes(q)) return false;
    const st = getStatus(v);
    if (filterStatus !== 'all' && st !== filterStatus) return false;
    return true;
  }), [vendors, search, filterStatus]);

  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const tabs = [
    { id: 'overview',       label: "📊 Vue d'ensemble" },
    { id: 'sellers',        label: `🏪 Vendeurs (${vendors.length})` },
    { id: 'reports',        label: `🚩 Signalements${pendingReports > 0 ? ` (${pendingReports})` : ''}` },
    { id: 'notifications',  label: '🔔 Notifications' },
  ];

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) return (
    <section style={{ padding: 16, maxWidth: 1100, margin: '80px auto', textAlign: 'center', paddingTop: 80 }}>
      <div style={{ color: '#C9A84C', fontSize: 14, animation: 'pulse 1.5s infinite' }}>
        Chargement des données admin…
      </div>
    </section>
  );

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>

      {/* Refuse modal */}
      {refuseTarget && (
        <RefuseModal
          vendor={refuseTarget}
          onConfirm={(reason) => refuse(refuseTarget.id, reason)}
          onClose={() => setRefuseTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h2 className="pf" style={{ fontSize: 'clamp(22px,5vw,28px)' }}>Administration</h2>
          <p style={{ color: '#9A9A8A', fontSize: 13, marginTop: 4 }}>
            O'Samboussa · {vendors.length} vendeur{vendors.length !== 1 ? 's' : ''} en base
            <button onClick={load} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer' }}>
              ↻ Actualiser
            </button>
          </p>
        </div>
        {!IS_REAL_SUPABASE && (
          <span style={{ fontSize: 11, color: '#FBBF24', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', padding: '5px 12px', borderRadius: 20 }}>
            ⚠ Mode démo — configurez Supabase
          </span>
        )}
      </div>

      {/* Error banner */}
      {actionError && (
        <div style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#F87171', fontSize: 13 }}>
          ⚠ {actionError}
          {(actionError.includes('policy') || actionError.includes('row-level')) && (
            <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 6 }}>{MIGRATION_NOTE}</div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(201,168,76,.1)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t.id ? '#C9A84C' : '#6B6B6B', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400, transition: 'color .2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 20 }}>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
            <StatCard icon="🏪" label="Total vendeurs"     value={stats.total}     color="#F5F0E8" />
            <StatCard icon="✅" label="Vérifiés"           value={stats.verified}  color="#4ADE80" />
            <StatCard icon="⏳" label="En attente"         value={stats.pending}   color="#FBBF24" />
            <StatCard icon="🚫" label="Suspendus"          value={stats.suspended} color="#F87171" />
            <StatCard icon="✕"  label="Refusés"            value={stats.refused}   color="#FB923C" />
            <StatCard icon="📍" label="Villes"             value={stats.cities}    color="#C9A84C" />
            <StatCard icon="🆕" label="Nouveaux (7j)"      value={stats.thisWeek}  color="#A78BFA"
              sub={stats.thisWeek > 0 ? `+${stats.thisWeek} cette semaine` : 'Aucun'} />
          </div>

          {/* Charts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>

            {/* Top villes */}
            {stats.topCities.length > 0 && (
              <BarChart title="Top villes" data={stats.topCities} />
            )}

            {/* Top vendeurs */}
            {stats.topVendors.length > 0 && (
              <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
                <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Top vendeurs</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {stats.topVendors.map((v, i) => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: 13, width: 20, textAlign: 'center' }}>#{i + 1}</span>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#0D0D0D', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.logo ? <img src={v.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>🏪</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.shop}</div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>📍 {v.city}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C' }}>⭐ {Number(v.rating).toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: '#6B6B6B' }}>{v.reviews_count || 0} avis</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase Fondateur */}
          <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 36 }}>🚀</span>
            <div>
              <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Phase Fondateur · Accès gratuit à vie</p>
              <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7 }}>
                Tous les vendeurs inscrits pendant cette phase bénéficient du Compte Fondateur.<br />
                Objectif : atteindre <strong style={{ color: '#C9A84C' }}>50 vendeurs vérifiés</strong> avant d'introduire des fonctionnalités payantes.
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#C9A84C' }}>{stats.verified} / 50</div>
              <div style={{ fontSize: 11, color: '#6B6B6B' }}>vendeurs vérifiés</div>
              <div style={{ background: '#1A1A1A', borderRadius: 4, height: 6, marginTop: 8, width: 120 }}>
                <div style={{ background: 'linear-gradient(90deg,#8A6E2F,#C9A84C)', height: '100%', borderRadius: 4, width: `${Math.min((stats.verified / 50) * 100, 100)}%`, transition: 'width .6s' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SELLERS ═══════════════════════════════════════════════ */}
      {activeTab === 'sellers' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher par nom, email, ville…"
              style={{ padding: '9px 14px', borderRadius: 8, fontSize: 13, flex: '1 1 200px', minWidth: 180 }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, minWidth: 150 }}>
              <option value="all">Tous les statuts</option>
              <option value="verified">✅ Vérifiés</option>
              <option value="pending">⏳ En attente</option>
              <option value="suspended">🚫 Suspendus</option>
              <option value="refused">✕ Refusés</option>
            </select>
            <span style={{ color: '#6B6B6B', fontSize: 12, whiteSpace: 'nowrap' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 48, background: '#111', borderRadius: 12 }}>
              {vendors.length === 0 ? 'Aucun vendeur dans Supabase.' : 'Aucun résultat pour ces filtres.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map(v => {
                const status = getStatus(v);
                const types  = Array.isArray(v.types) ? v.types : [];
                const date   = v.created_at ? v.created_at.slice(0, 10) : '—';
                const validatedAt = v.validated_at ? v.validated_at.slice(0, 10) : null;
                return (
                  <div key={v.id} style={{
                    background: '#0D0D0D',
                    border: `1px solid ${status === 'suspended' ? 'rgba(248,113,113,.2)' : status === 'refused' ? 'rgba(251,146,60,.15)' : 'rgba(201,168,76,.06)'}`,
                    borderRadius: 10, padding: '14px 16px',
                    opacity: (status === 'suspended' || status === 'refused') ? 0.75 : 1,
                    transition: 'opacity .2s',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        {/* Name + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          {v.logo && (
                            <img src={v.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <span style={{ fontWeight: 800, fontSize: 15 }}>{v.shop || '(sans nom)'}</span>
                          <StatusBadge status={status} />
                          <span style={{ color: '#C9A84C', fontSize: 10, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', padding: '2px 8px', borderRadius: 20 }}>
                            🚀 Fondateur
                          </span>
                        </div>

                        {/* Meta */}
                        <div style={{ color: '#9A9A8A', fontSize: 12, lineHeight: 1.9, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                          {v.email && <span>✉ {v.email}</span>}
                          {v.city && <span>📍 {v.city}</span>}
                          {types.length > 0 && <span>🏷 {types.slice(0, 3).join(', ')}</span>}
                          <span>⭐ {Number(v.rating || 0).toFixed(1)} · {v.reviews_count || 0} avis</span>
                          <span>📅 Inscrit le {date}</span>
                          {validatedAt && <span style={{ color: '#4ADE80' }}>✔ Validé le {validatedAt}</span>}
                          {v.refuse_reason && <span style={{ color: '#FB923C' }}>Motif : {v.refuse_reason}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link to={`/vendeur/${v.id}`}
                          style={{ padding: '7px 12px', fontSize: 11, borderRadius: 6, border: '1px solid rgba(201,168,76,.3)', color: '#C9A84C', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          Voir ↗
                        </Link>
                        {status === 'pending' && (
                          <>
                            <button className="btn-o" onClick={() => validate(v.id)}
                              style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                              Valider ✔
                            </button>
                            <button className="btn-o" onClick={() => setRefuseTarget(v)}
                              style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#FB923C', borderColor: '#FB923C', borderRadius: 6 }}>
                              Refuser
                            </button>
                          </>
                        )}
                        {status === 'verified' && (
                          <button className="btn-o" onClick={() => suspend(v.id)}
                            style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#FBBF24', borderColor: '#FBBF24', borderRadius: 6 }}>
                            Suspendre
                          </button>
                        )}
                        {(status === 'suspended' || status === 'refused') && (
                          <button className="btn-o" onClick={() => restore(v.id)}
                            style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                            Restaurer
                          </button>
                        )}
                        <button className="btn-o" onClick={() => applyDelete(v.id, v.shop)}
                          style={{ padding: '7px 12px', fontSize: 11, cursor: 'pointer', color: '#F87171', borderColor: '#F87171', borderRadius: 6 }}>
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

      {/* ══ REPORTS ═══════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div>
          {!IS_REAL_SUPABASE && (
            <div style={{ background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#FBBF24', fontSize: 12 }}>
              ⚠ Supabase non configuré — exécutez <code style={{ background: 'rgba(255,255,255,.07)', padding: '1px 6px', borderRadius: 4 }}>supabase/migrations.sql</code> pour activer les signalements.
            </div>
          )}
          {reportsLoading && <p style={{ color: '#6B6B6B', fontSize: 13, textAlign: 'center', padding: 32 }}>Chargement…</p>}
          {!reportsLoading && reports.length === 0 && (
            <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 56, background: '#111', borderRadius: 12 }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🚩</p>
              Aucun signalement pour l'instant.
            </div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{
                background: '#111',
                border: `1px solid ${r.status === 'pending' ? 'rgba(248,113,113,.2)' : 'rgba(255,255,255,.05)'}`,
                borderRadius: 12, padding: '16px 18px',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
                opacity: r.status !== 'pending' ? 0.6 : 1,
              }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>🚩 {r.report_type || r.type || 'Signalement'}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                      background: r.status === 'resolved' ? 'rgba(74,222,128,.12)' : r.status === 'dismissed' ? 'rgba(107,107,107,.15)' : 'rgba(248,113,113,.12)',
                      color: r.status === 'resolved' ? '#4ADE80' : r.status === 'dismissed' ? '#6B6B6B' : '#F87171',
                    }}>
                      {r.status === 'resolved' ? '✔ Résolu' : r.status === 'dismissed' ? 'Ignoré' : 'En attente'}
                    </span>
                  </div>
                  <div style={{ color: '#9A9A8A', fontSize: 12, lineHeight: 1.7 }}>
                    {r.vendor_name && <span>Vendeur : <span style={{ color: '#C9A84C' }}>{r.vendor_name}</span> · </span>}
                    {r.reason && <span>Motif : {r.reason} · </span>}
                    {r.reporter_info && <span>Signalé par : {r.reporter_info} · </span>}
                    <span>{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-o" onClick={() => resolveReport(r.id)}
                      style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80', borderRadius: 6 }}>
                      Résoudre
                    </button>
                    <button className="btn-o" onClick={() => dismissReport(r.id)}
                      style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#6B6B6B', borderColor: '#6B6B6B', borderRadius: 6 }}>
                      Ignorer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ NOTIFICATIONS ══════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div>
          {notifSent && (
            <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid #4ADE80', borderRadius: 10, padding: '12px 16px', color: '#4ADE80', fontSize: 13, marginBottom: 16, animation: 'fadeIn .3s' }}>
              ✔ Message simulé envoyé à {vendors.length} vendeur{vendors.length !== 1 ? 's' : ''}.
            </div>
          )}

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 6, color: '#C9A84C' }}>Envoyer un message groupé</h3>
            <p style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 14 }}>
              ℹ Intégrez SendGrid ou Resend pour un envoi email réel. Actuellement simulé.
            </p>
            <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
              placeholder="Message à envoyer à tous les vendeurs actifs…"
              style={{ padding: 12, minHeight: 100, borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 12 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-g" onClick={sendNotification} disabled={!notifMsg.trim()}
                style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, cursor: notifMsg.trim() ? 'pointer' : 'not-allowed', opacity: notifMsg.trim() ? 1 : 0.5 }}>
                Envoyer à tous ({stats.verified} vérifiés)
              </button>
              <span style={{ color: '#6B6B6B', fontSize: 12 }}>{notifMsg.length} / 500 caractères</span>
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14, color: '#C9A84C' }}>Modèles de messages</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: '🎉 Bienvenue et validation', body: "Félicitations, votre boutique O'Samboussa est maintenant active ! Complétez vos produits et photos pour attirer vos premiers clients." },
                { label: '📸 Demande de photos', body: 'Votre profil manque de photos. Ajoutez des photos de vos samboussas pour booster votre visibilité sur la plateforme.' },
                { label: '⚠ Profil incomplet', body: 'Votre profil vendeur est incomplet. Pensez à ajouter votre description, vos horaires et vos spécialités.' },
                { label: '🆕 Nouvelle fonctionnalité', body: "De nouvelles fonctionnalités sont disponibles dans votre espace vendeur O'Samboussa. Découvrez-les dès maintenant !" },
              ].map(n => (
                <div key={n.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: '12px 14px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{n.label}</div>
                    <div style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.5 }}>{n.body}</div>
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
