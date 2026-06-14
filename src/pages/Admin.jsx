import { useState, useMemo } from 'react';
import SELLERS, { SUBSCRIPTION_PLANS } from '../data/sellers.js';

const REPORTS = [
  { id: 'r1', type: 'Contenu inapproprié', seller: 'Les Délices de Lyon', reporter: 'client_42', date: '12/06/2026', status: 'En attente' },
  { id: 'r2', type: 'Fausse information', seller: 'Couscouma & Co', reporter: 'client_17', date: '10/06/2026', status: 'En attente' },
];

const NOTIFICATIONS_TPL = [
  { id: 'n1', label: 'Bienvenue sur la plateforme', body: 'Votre compte O\'Samboussa a été validé. Bienvenue !' },
  { id: 'n2', label: 'Abonnement expirant', body: 'Votre abonnement expire dans 7 jours. Pensez à le renouveler.' },
  { id: 'n3', label: 'Nouvelle mise à jour', body: 'De nouvelles fonctionnalités sont disponibles dans votre espace vendeur.' },
];

export default function Admin() {
  const [sellers, setSellers] = useState(SELLERS.map(s => ({ ...s })));
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState(REPORTS);
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSent, setNotifSent] = useState(false);

  const validate = (id) => setSellers(prev => prev.map(s => s.id === id ? { ...s, verified: true } : s));
  const suspend = (id) => setSellers(prev => prev.map(s => s.id === id ? { ...s, suspended: true } : s));
  const restore = (id) => setSellers(prev => prev.map(s => s.id === id ? { ...s, suspended: false } : s));
  const remove = (id) => setSellers(prev => prev.filter(s => s.id !== id));
  const resolveReport = (id) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Résolu' } : r));

  const stats = useMemo(() => ({
    total: sellers.length,
    verified: sellers.filter(s => s.verified).length,
    suspended: sellers.filter(s => s.suspended).length,
    cities: new Set(sellers.map(s => s.city)).size,
    revenue: sellers.reduce((sum, s) => sum + (SUBSCRIPTION_PLANS[s.subscription]?.price || 0), 0),
    pending: sellers.filter(s => !s.verified && !s.suspended).length,
  }), [sellers]);

  const sendNotification = () => {
    if (!notifMsg.trim()) return;
    setNotifSent(true);
    setNotifMsg('');
    setTimeout(() => setNotifSent(false), 3000);
  };

  const tabs = [
    { id: 'overview', label: '📊 Vue d\'ensemble' },
    { id: 'sellers', label: '🏪 Vendeurs' },
    { id: 'reports', label: `🚩 Signalements (${reports.filter(r => r.status === 'En attente').length})` },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="pf" style={{ fontSize: 'clamp(22px,5vw,28px)' }}>Administration</h2>
        <p style={{ color: '#9A9A8A', fontSize: 13, marginTop: 4 }}>Panneau de gestion O'Samboussa Marketplace</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(201,168,76,.1)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t.id ? '#C9A84C' : '#6B6B6B', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Vendeurs total', val: stats.total, color: '#F5F0E8', icon: '🏪' },
              { label: 'Vérifiés', val: stats.verified, color: '#4ADE80', icon: '✅' },
              { label: 'En attente', val: stats.pending, color: '#FBBF24', icon: '⏳' },
              { label: 'Suspendus', val: stats.suspended, color: '#FF6B6B', icon: '🚫' },
              { label: 'Villes', val: stats.cities, color: '#C9A84C', icon: '📍' },
              { label: 'MRR (€)', val: `${stats.revenue.toFixed(2)} €`, color: '#4ADE80', icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Abonnements répartition */}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Répartition des abonnements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                const count = sellers.filter(s => s.subscription === key).length;
                return (
                  <div key={key} style={{ background: 'rgba(255,255,255,.02)', border: `1px solid ${plan.color}30`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ color: plan.color, fontSize: 20, fontWeight: 800 }}>{count}</div>
                    <div style={{ color: plan.color, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Pack {plan.label}</div>
                    <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 4 }}>{plan.price.toFixed(2)} €/mois</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SELLERS */}
      {activeTab === 'sellers' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {sellers.map(s => {
            const plan = SUBSCRIPTION_PLANS[s.subscription];
            return (
              <div key={s.id} style={{ background: '#0D0D0D', border: `1px solid ${s.suspended ? 'rgba(255,107,107,.2)' : 'rgba(201,168,76,.06)'}`, borderRadius: 10, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', opacity: s.suspended ? 0.6 : 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{s.shop}</span>
                    {s.verified && <span style={{ color: '#4ADE80', fontSize: 10, background: 'rgba(74,222,128,.1)', padding: '2px 8px', borderRadius: 20 }}>✔ Vérifié</span>}
                    {s.suspended && <span style={{ color: '#FF6B6B', fontSize: 10, background: 'rgba(255,107,107,.1)', padding: '2px 8px', borderRadius: 20 }}>🚫 Suspendu</span>}
                    {plan && <span style={{ color: plan.color, fontSize: 10, background: `${plan.color}15`, border: `1px solid ${plan.color}30`, padding: '2px 8px', borderRadius: 20 }}>{plan.label}</span>}
                  </div>
                  <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 6 }}>
                    📍 {s.city} · {s.types.join(', ')} · ⭐ {s.rating} · {s.reviews} avis
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {!s.verified && !s.suspended && (
                    <button className="btn-o" onClick={() => validate(s.id)} style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80' }}>Valider</button>
                  )}
                  {!s.suspended
                    ? <button className="btn-o" onClick={() => suspend(s.id)} style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#FBBF24', borderColor: '#FBBF24' }}>Suspendre</button>
                    : <button className="btn-o" onClick={() => restore(s.id)} style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80' }}>Restaurer</button>
                  }
                  <button className="btn-o" onClick={() => remove(s.id)} style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#FF6B6B', borderColor: '#FF6B6B' }}>Suppr.</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {reports.length === 0 && <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 32 }}>Aucun signalement en attente.</div>}
          {reports.map(r => (
            <div key={r.id} style={{ background: '#111', border: `1px solid ${r.status === 'Résolu' ? 'rgba(74,222,128,.2)' : 'rgba(255,107,107,.2)'}`, borderRadius: 12, padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>🚩 {r.type}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: r.status === 'Résolu' ? 'rgba(74,222,128,.1)' : 'rgba(255,107,107,.1)', color: r.status === 'Résolu' ? '#4ADE80' : '#FF6B6B' }}>{r.status}</span>
                </div>
                <div style={{ color: '#9A9A8A', fontSize: 12 }}>
                  Vendeur : <span style={{ color: '#C9A84C' }}>{r.seller}</span> · Signalé par : {r.reporter} · {r.date}
                </div>
              </div>
              {r.status === 'En attente' && (
                <button className="btn-o" onClick={() => resolveReport(r.id)} style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#4ADE80', borderColor: '#4ADE80' }}>Résoudre</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div>
          {notifSent && <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid #4ADE80', borderRadius: 10, padding: '12px 16px', color: '#4ADE80', fontSize: 13, marginBottom: 16 }}>✔ Notification envoyée à tous les vendeurs.</div>}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Envoyer une notification</h3>
            <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Message à envoyer à tous les vendeurs..." style={{ padding: 12, minHeight: 100, borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-g" onClick={sendNotification} disabled={!notifMsg.trim()} style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                Envoyer à tous ({sellers.length} vendeurs)
              </button>
            </div>
          </div>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Modèles de notifications</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {NOTIFICATIONS_TPL.map(n => (
                <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: '12px 14px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{n.label}</div>
                    <div style={{ color: '#6B6B6B', fontSize: 12 }}>{n.body}</div>
                  </div>
                  <button className="btn-o" onClick={() => setNotifMsg(n.body)} style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Utiliser</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
