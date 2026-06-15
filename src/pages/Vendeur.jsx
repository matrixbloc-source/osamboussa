import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Rating from '../components/market/Rating.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useVendor } from '../lib/useVendors.js';
import useSEO from '../lib/useSEO.js';
import { trackWA } from '../lib/trackEvent.js';

const MOCK_REVIEWS = [
  ['Amina K.', 'Samboussas incroyables, croustillants et bien garnis. Livraison rapide !'],
  ['Karim B.', 'Le meilleur rapport qualité-prix que j\'ai trouvé. Je commande toutes les semaines.'],
  ['Sophie M.', 'Parfait pour l\'apéro. Tout le monde a adoré. Je recommande vivement.'],
  ['Paul D.', 'Très bon accueil, réponse rapide sur WhatsApp. Produit authentique.'],
];

export default function Vendeur() {
  const { id } = useParams();
  const { vendor: s, loading, error } = useVendor(id);
  const { isFav, toggle } = useFavorites();
  const [shared, setShared] = useState(false);

  useSEO({
    title: s ? `${s.shop} — Samboussas à ${s.city} | O'Samboussa` : "O'Samboussa",
    description: s ? `Commandez vos samboussas comoriens artisanaux chez ${s.shop} à ${s.city}. ${(s.types || []).slice(0, 3).join(', ')}. Contact direct sur WhatsApp.` : '',
    og: s ? { title: `${s.shop} sur O'Samboussa 🥟`, description: `Samboussas artisanaux à ${s.city} · Commandez sur WhatsApp` } : {},
  });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: s?.shop, text: `Découvrez ${s?.shop} sur O'Samboussa 🥟`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  if (loading) {
    return (
      <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: '#C9A84C', fontSize: 14 }}>
          Chargement du vendeur...
        </div>
      </section>
    );
  }

  if (error || !s) {
    return (
      <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto', textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
        <h2 className="pf" style={{ fontSize: 28, color: '#F5F0E8', marginBottom: 12 }}>Vendeur introuvable</h2>
        <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 24 }}>Ce vendeur n'existe pas ou a été retiré de la plateforme.</p>
        <Link to="/vendeurs" className="btn-g" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
          Voir tous les vendeurs
        </Link>
      </section>
    );
  }

  const reviews = Array.from({ length: Math.min(4, Math.max(2, Math.floor((s.reviews || 0) / 40) || 2)) }).map((_, i) => ({
    id: i + 1,
    name: MOCK_REVIEWS[i % 4][0],
    rating: Math.max(3.5, (s.rating || 4.5) - i * 0.15),
    text: MOCK_REVIEWS[i % 4][1],
  }));

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, fontSize: 13, color: '#6B6B6B' }}>
        <Link to="/vendeurs" style={{ color: '#C9A84C', textDecoration: 'none' }}>Vendeurs</Link>
        <span>›</span>
        <span>{s.shop}</span>
      </div>

      {/* Hero banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ height: 'clamp(180px,40vw,300px)', background: s.photo ? `linear-gradient(180deg,rgba(10,10,10,.2),rgba(10,10,10,.7)),url(${s.photo}) center/cover` : 'linear-gradient(135deg,#161208,#111)', borderRadius: 16, display: 'flex', alignItems: 'flex-end', padding: '24px', color: '#F5F0E8', marginBottom: 24, position: 'relative' }}>

        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
          <button onClick={handleShare}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'all .2s' }}
            title="Partager cette fiche">
            {shared ? '✓' : '🔗'}
          </button>
          <button onClick={() => toggle(s.id)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isFav(s.id) ? 'rgba(239,68,68,.85)' : 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            {isFav(s.id) ? '❤️' : '🤍'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          {s.logo
            ? <img src={s.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(201,168,76,.4)', flexShrink: 0 }} />
            : <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(201,168,76,.15)', border: '2px solid rgba(201,168,76,.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏪</div>
          }
          <div>
            <h1 className="pf" style={{ fontSize: 'clamp(20px,5vw,34px)', margin: 0, lineHeight: 1.1 }}>{s.shop}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.4)', color: '#C9A84C', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .5, marginTop: 5, marginBottom: 2 }}>
              🚀 Compte Fondateur
            </span>
            <div style={{ color: '#C9A84C', marginTop: 4, fontWeight: 700, fontSize: 15 }}>dès {s.from.toFixed(2)} €</div>
            <div style={{ color: 'rgba(245,240,232,.7)', marginTop: 4, fontSize: 13, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>📍 {s.city}</span>
              {s.rating > 0 && <span>⭐ {s.rating} ({s.reviews} avis)</span>}
              {s.delivery && <span>🚚 {s.deliveryTime}</span>}
              {s.sales > 0 && <span>🏆 {s.sales} ventes</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* Left column */}
        <div>
          {s.description && (
            <p style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{s.description}</p>
          )}

          {s.products && s.products.length > 0 && (
            <>
              <h3 style={{ fontSize: 'clamp(16px,4vw,20px)', marginBottom: 14 }}>Produits</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                {s.products.map(p => (
                  <div key={p.id} style={{ background: '#111', padding: 12, borderRadius: 12, border: '1px solid rgba(201,168,76,.06)' }}>
                    <div style={{ height: 110, overflow: 'hidden', borderRadius: 8, marginBottom: 10, background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.img
                        ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 36 }}>🥟</span>
                      }
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                    <div style={{ color: '#C9A84C', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{p.price.toFixed(2)} €</div>
                    {s.tel && (
                      <a href={`https://wa.me/${s.tel}?text=Bonjour, je voudrais commander : ${encodeURIComponent(p.name)}`}
                        onClick={() => trackWA(s.id)}
                        target="_blank" rel="noreferrer"
                        className="btn-g"
                        style={{ display: 'block', marginTop: 8, padding: '8px', fontSize: 11, textAlign: 'center', borderRadius: 6, textDecoration: 'none' }}>
                        Commander
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {s.gallery && s.gallery.length > 0 && (
            <>
              <h3 style={{ fontSize: 'clamp(16px,4vw,20px)', marginBottom: 14 }}>Galerie</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 10, marginBottom: 24 }}>
                {s.gallery.map((src, i) => (
                  <div key={i} style={{ overflow: 'hidden', borderRadius: 10, height: 110, background: '#111' }}>
                    <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 style={{ fontSize: 'clamp(16px,4vw,20px)', marginBottom: 14 }}>Avis clients</h3>
          <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: '#0D0D0D', padding: 14, borderRadius: 10, border: '1px solid rgba(201,168,76,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                  <Rating value={r.rating} size={12} />
                </div>
                <p style={{ color: '#9A9A8A', fontSize: 13, lineHeight: 1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ background: '#0D0D0D', padding: 20, borderRadius: 16, height: 'fit-content', border: '1px solid rgba(201,168,76,.08)', position: 'sticky', top: 110 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {s.logo
              ? <img src={s.logo} alt="logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(201,168,76,.2)' }} />
              : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏪</div>
            }
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{s.shop}</div>
              <div style={{ color: '#9A9A8A', fontSize: 12 }}>📍 {s.city}</div>
            </div>
          </div>

          {s.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Rating value={s.rating} />
              <span style={{ color: '#9A9A8A', fontSize: 12 }}>{s.reviews} avis</span>
            </div>
          )}

          <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
            {[
              s.types?.length > 0 && { label: 'Spécialités', val: s.types.join(', ') },
              { label: 'Livraison', val: s.delivery ? `✅ ${s.deliveryTime || 'Disponible'}` : '❌ Non disponible' },
              s.deliveryZone && { label: 'Zone', val: s.deliveryZone },
              s.hours && { label: 'Horaires', val: s.hours },
              s.sales > 0 && { label: 'Ventes', val: `${s.sales} commandes` },
              s.joinedDate && { label: 'Membre depuis', val: s.joinedDate },
            ].filter(Boolean).map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ color: '#6B6B6B' }}>{label}</span>
                <span style={{ color: '#F5F0E8', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{val}</span>
              </div>
            ))}
          </div>

          {s.tel && (
            <a href={`https://wa.me/${s.tel}?text=Bonjour%20${encodeURIComponent(s.shop)}%20!`}
              onClick={() => trackWA(s.id)}
              target="_blank" rel="noreferrer"
              className="btn-g"
              style={{ display: 'block', textAlign: 'center', padding: '13px', textDecoration: 'none', borderRadius: 10, fontSize: 13, marginBottom: 10 }}>
              📱 Contacter sur WhatsApp
            </a>
          )}

          {s.instagram && (
            <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9A9A8A', fontSize: 13, textDecoration: 'none', padding: '8px', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#E1306C'}
              onMouseLeave={e => e.currentTarget.style.color = '#9A9A8A'}>
              📸 @{s.instagram}
            </a>
          )}
        </aside>
      </div>
    </section>
  );
}
