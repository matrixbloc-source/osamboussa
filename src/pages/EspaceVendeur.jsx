import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SELLERS, { SUBSCRIPTION_PLANS } from '../data/sellers.js';
import Rating from '../components/market/Rating.jsx';

function SubscriptionGate({ required, current, children }) {
  const order = { basic: 1, pro: 2, premium: 3 };
  if (!current || order[current] < order[required]) {
    const need = SUBSCRIPTION_PLANS[required];
    return (
      <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 10 }}>🔒</p>
        <p className="pf" style={{ fontSize: 18, color: '#F5F0E8', marginBottom: 8 }}>Fonctionnalité {need?.label}</p>
        <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
          Cette fonctionnalité est disponible à partir du pack <strong style={{ color: need?.color }}>{need?.label}</strong> à {need?.price.toFixed(2)} €/mois.
        </p>
        <Link to="/abonnements" className="btn-g" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
          Passer au pack {need?.label} →
        </Link>
      </div>
    );
  }
  return children;
}
function StatCard({ label, value, sub, color = '#C9A84C', icon }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: '20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 10, color: '#4ADE80', background: 'rgba(74,222,128,.1)', padding: '3px 8px', borderRadius: 20 }}>+12%</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function EspaceVendeur() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const seller = SELLERS[0];
  const [editedSeller, setEditedSeller] = useState({ ...seller });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', img: '' });
  const [products, setProducts] = useState([...seller.products]);
  const [saved, setSaved] = useState(false);
  const plan = SUBSCRIPTION_PLANS[seller.subscription] || SUBSCRIPTION_PLANS.basic;

  const stats = useMemo(() => ({
    revenue: (seller.sales * seller.from * 1.4).toFixed(0),
    orders: seller.sales,
    visitors: seller.sales * 8,
    rating: seller.rating,
  }), []);

  const saveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    setProducts(prev => [...prev, { id: `p_${Date.now()}`, name: newProduct.name, price: parseFloat(newProduct.price), img: newProduct.img || 'https://via.placeholder.com/320' }]);
    setNewProduct({ name: '', price: '', img: '' });
  };

  const productLimit = seller.subscription === 'basic' ? 10 : Infinity;
  const canAddProduct = products.length < productLimit;

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord' },
    { id: 'profile', label: '👤 Profil' },
    { id: 'products', label: '🛒 Produits' },
    { id: 'subscription', label: '💳 Abonnement' },
    { id: 'reviews', label: '⭐ Avis', minPlan: 'pro' },
    { id: 'stats', label: '📈 Statistiques', minPlan: 'premium' },
  ];

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="pf" style={{ fontSize: 'clamp(22px,5vw,28px)' }}>Espace Vendeur</h2>
          <p style={{ color: '#9A9A8A', fontSize: 13, marginTop: 4 }}>
            Connecté en tant que <span style={{ color: '#C9A84C' }}>{user?.email || 'vendeur@demo.com'}</span>
            <span style={{ marginLeft: 12, background: `${plan.color}20`, color: plan.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${plan.color}40` }}>
              {plan.label}
            </span>
          </p>
        </div>
        <button onClick={signOut} className="btn-o" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', borderBottom: '1px solid rgba(201,168,76,.1)', paddingBottom: 0 }}>
        {tabs.map(t => {
          const planOrder = { basic: 1, pro: 2, premium: 3 };
          const locked = t.minPlan && (planOrder[seller.subscription] || 1) < planOrder[t.minPlan];
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t.id ? '#C9A84C' : locked ? '#3A3A3A' : '#6B6B6B', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', transition: 'all .15s', fontWeight: activeTab === t.id ? 600 : 400 }}>
              {t.label}{locked ? ' 🔒' : ''}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard icon="💰" label="Chiffre d'affaires" value={`${parseInt(stats.revenue).toLocaleString('fr')} €`} sub="Ce mois" color="#4ADE80" />
            <StatCard icon="📦" label="Commandes" value={stats.orders} sub="Total" />
            <StatCard icon="👁" label="Visiteurs" value={stats.visitors.toLocaleString('fr')} sub="Ce mois" />
            <StatCard icon="⭐" label="Note moyenne" value={`${stats.rating}/5`} sub={`${seller.reviews} avis`} />
          </div>

          {/* Produits les plus vendus */}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Produits les plus vendus</h3>
            {seller.products.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < seller.products.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 14, width: 20 }}>#{i + 1}</span>
                <img src={p.img} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: '#C9A84C', fontSize: 12 }}>{p.price.toFixed(2)} €</div>
                </div>
                <div style={{ color: '#9A9A8A', fontSize: 12 }}>{[45, 72, 31, 88, 54, 67, 39][i % 7]} ventes</div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            {[
              { label: '➕ Ajouter un produit', action: () => setActiveTab('products') },
              { label: '✏️ Modifier le profil', action: () => setActiveTab('profile') },
              { label: '💳 Gérer l\'abonnement', action: () => setActiveTab('subscription') },
              { label: '💬 Messagerie', href: '/messagerie' },
            ].map(a => a.href ? (
              <Link key={a.label} to={a.href} className="btn-o" style={{ padding: '12px', borderRadius: 10, fontSize: 13, textDecoration: 'none', textAlign: 'center', display: 'block' }}>{a.label}</Link>
            ) : (
              <button key={a.label} onClick={a.action} className="btn-o" style={{ padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>{a.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {saved && <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid #4ADE80', borderRadius: 10, padding: '12px 16px', color: '#4ADE80', fontSize: 13 }}>✔ Profil mis à jour avec succès !</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 14 }}>
            {[
              { label: 'Nom du commerce', field: 'shop' },
              { label: 'Ville', field: 'city' },
              { label: 'Téléphone / WhatsApp', field: 'tel' },
              { label: 'Horaires', field: 'hours' },
              { label: 'Zone de livraison', field: 'deliveryZone' },
              { label: 'Instagram', field: 'instagram' },
            ].map(({ label, field }) => (
              <label key={field} style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C' }}>
                {label}
                <input value={editedSeller[field] || ''} onChange={e => setEditedSeller(p => ({ ...p, [field]: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
              </label>
            ))}
            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C', gridColumn: '1/-1' }}>
              Description
              <textarea value={editedSeller.description || ''} onChange={e => setEditedSeller(p => ({ ...p, description: e.target.value }))} style={{ padding: 12, minHeight: 100, borderRadius: 8, fontSize: 14 }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-g" onClick={saveProfile} style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Enregistrer</button>
            <button className="btn-o" onClick={() => setEditedSeller({ ...seller })} style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Réinitialiser</button>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
            {products.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 12, background: '#111', padding: 14, borderRadius: 10 }}>
                <img src={p.img} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: '#C9A84C', fontSize: 13 }}>{p.price.toFixed(2)} €</div>
                </div>
                <button className="btn-o" onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer' }}>Supprimer</button>
              </div>
            ))}
          </div>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Ajouter un produit</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
              <input placeholder="Nom du produit *" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={{ padding: 10, borderRadius: 8, fontSize: 14 }} />
              <input placeholder="Prix (€) *" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ padding: 10, borderRadius: 8, fontSize: 14 }} />
              <input placeholder="URL image (optionnel)" value={newProduct.img} onChange={e => setNewProduct(p => ({ ...p, img: e.target.value }))} style={{ padding: 10, borderRadius: 8, fontSize: 14 }} />
            </div>
            {seller.subscription === 'basic' && (
              <p style={{ marginTop: 10, color: '#FBBF24', fontSize: 12 }}>
                ⚠️ Pack Basic — {products.length}/{productLimit} produits.{' '}
                <Link to="/abonnements" style={{ color: '#C9A84C', textDecoration: 'none' }}>Passer au Pro →</Link>
              </p>
            )}
            {canAddProduct
              ? <button className="btn-g" onClick={addProduct} style={{ marginTop: 12, padding: '12px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>➕ Ajouter</button>
              : <p style={{ marginTop: 12, color: '#FF6B6B', fontSize: 13 }}>Limite de {productLimit} produits atteinte. <Link to="/abonnements" style={{ color: '#C9A84C', textDecoration: 'none' }}>Passer au Pro →</Link></p>
            }
          </div>
        </div>
      )}

      {/* SUBSCRIPTION */}
      {activeTab === 'subscription' && (
        <div>
          <div style={{ background: `linear-gradient(135deg, rgba(201,168,76,.08), rgba(232,213,163,.04))`, border: `1px solid ${plan.color}40`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 4 }}>Abonnement actuel</p>
                <p className="pf" style={{ fontSize: 24, color: plan.color }}>Pack {plan.label}</p>
                <p style={{ color: '#9A9A8A', fontSize: 13, marginTop: 4 }}>{plan.price.toFixed(2)} €/mois · Renouvellement le 14/07/2026</p>
              </div>
              <Link to="/abonnements" className="btn-g" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
                Changer de formule →
              </Link>
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Historique des paiements</h3>
            {[
              { date: '14/06/2026', amount: plan.price.toFixed(2), status: 'Payé' },
              { date: '14/05/2026', amount: plan.price.toFixed(2), status: 'Payé' },
              { date: '14/04/2026', amount: plan.price.toFixed(2), status: 'Payé' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                <span style={{ color: '#9A9A8A', fontSize: 13 }}>{p.date}</span>
                <span style={{ color: '#F5F0E8', fontSize: 13, fontWeight: 600 }}>{p.amount} €</span>
                <span style={{ color: '#4ADE80', fontSize: 12, background: 'rgba(74,222,128,.1)', padding: '3px 10px', borderRadius: 20 }}>✓ {p.status}</span>
              </div>
            ))}
          </div>

          <button className="btn-o" style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#FF6B6B', borderColor: '#FF6B6B' }}
            onClick={() => alert('Annulation à confirmer — cette action nécessite le backend Stripe.')}>
            Annuler l'abonnement
          </button>
        </div>
      )}

      {/* STATS — Premium only */}
      {activeTab === 'stats' && (
        <SubscriptionGate required="premium" current={seller.subscription}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
              {[
                { label: 'Taux de conversion', value: '3.2%', change: '+0.4%', icon: '🎯' },
                { label: 'Panier moyen', value: '18,50 €', change: '+2,10 €', icon: '🛒' },
                { label: 'Taux de retour client', value: '64%', change: '+8%', icon: '🔄' },
                { label: 'Position dans les résultats', value: '#1', change: '▲ 2', icon: '🏆' },
              ].map(s => (
                <div key={s.label} style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 12, padding: '18px 16px' }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C', marginTop: 8 }}>{s.value}</div>
                  <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 3 }}>{s.label}</div>
                  <div style={{ color: '#4ADE80', fontSize: 11, marginTop: 4 }}>{s.change} ce mois</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Trafic mensuel — 30 derniers jours</h3>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
                {[40, 55, 38, 70, 62, 88, 76, 90, 68, 95, 82, 100, 78, 65, 80, 92, 72, 85, 96, 88, 75, 60, 70, 85, 90, 78, 65, 88, 94, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg,#C9A84C,#8A6E2F)`, borderRadius: '2px 2px 0 0', opacity: .8 }} title={`Jour ${i + 1}: ${h} visiteurs`} />
                ))}
              </div>
            </div>
          </div>
        </SubscriptionGate>
      )}

      {/* REVIEWS */}
      {activeTab === 'reviews' && (
        <SubscriptionGate required="pro" current={seller.subscription}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#111', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="pf" style={{ fontSize: 48, color: '#C9A84C', fontWeight: 700 }}>{seller.rating}</div>
              <Rating value={seller.rating} size={16} />
              <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 6 }}>{seller.reviews} avis</p>
            </div>
            <div className="divg" style={{ width: 1, height: 80, background: 'linear-gradient(180deg,transparent,#C9A84C,transparent)' }} />
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const pct = star >= 4 ? (star === 5 ? 60 : 30) : (star === 3 ? 8 : 2);
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#C9A84C', fontSize: 12, width: 20 }}>{star}★</span>
                    <div style={{ flex: 1, height: 6, background: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#8A6E2F,#C9A84C)', borderRadius: 3 }} />
                    </div>
                    <span style={{ color: '#6B6B6B', fontSize: 11, width: 28 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { name: 'Amina K.', rating: 5, text: 'Samboussas incroyables, livraison rapide !', date: '10/06/2026' },
              { name: 'Karim B.', rating: 5, text: 'Je commande toutes les semaines. Qualité irréprochable.', date: '08/06/2026' },
              { name: 'Sophie M.', rating: 4, text: 'Très bon, mais un peu d\'attente en livraison.', date: '05/06/2026' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#111', padding: 16, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</span>
                    <span style={{ color: '#6B6B6B', fontSize: 11, marginLeft: 10 }}>{r.date}</span>
                  </div>
                  <Rating value={r.rating} size={12} />
                </div>
                <p style={{ color: '#9A9A8A', fontSize: 13 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
        </SubscriptionGate>
      )}
    </section>
  );
}
