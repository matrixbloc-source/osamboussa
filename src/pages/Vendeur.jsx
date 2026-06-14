import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Rating from '../components/market/Rating.jsx';
import SELLERS, { SUBSCRIPTION_PLANS } from '../data/sellers.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useMessages } from '../context/MessagesContext.jsx';

const MOCK_REVIEWS = [
  ['Amina K.', 'Samboussas incroyables, croustillants et bien garnis. Livraison rapide !'],
  ['Karim B.', 'Le meilleur rapport qualité-prix que j\'ai trouvé. Je commande toutes les semaines.'],
  ['Sophie M.', 'Parfait pour l\'apéro. Tout le monde a adoré. Je recommande vivement.'],
  ['Paul D.', 'Très bon accueil, réponse rapide sur WhatsApp. Produit authentique.'],
];

export default function Vendeur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = SELLERS.find(x => String(x.id) === id) || SELLERS[0];
  const { isFav, toggle } = useFavorites();
  const { startConversation } = useMessages();
  const plan = s.subscription ? SUBSCRIPTION_PLANS[s.subscription] : null;

  const reviews = Array.from({ length: Math.min(4, Math.max(2, Math.floor(s.reviews / 40))) }).map((_, i) => ({
    id: i + 1,
    name: MOCK_REVIEWS[i % 4][0],
    rating: Math.max(3.5, s.rating - i * 0.15),
    text: MOCK_REVIEWS[i % 4][1],
  }));

  const handleContact = () => {
    startConversation(s);
    navigate('/messagerie');
  };

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
        style={{ height: 'clamp(180px,40vw,300px)', background: s.photo ? `linear-gradient(180deg,rgba(10,10,10,.2),rgba(10,10,10,.7)),url(${s.photo})` : '#111', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, display: 'flex', alignItems: 'flex-end', padding: '24px', color: '#F5F0E8', marginBottom: 24, position: 'relative' }}>

        {/* Fav + plan badges */}
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
          {plan && s.subscription !== 'basic' && (
            <span style={{ background: 'rgba(0,0,0,.7)', border: `1px solid ${plan.color}60`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: plan.color, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
              {s.subscription === 'premium' ? '👑' : '⭐'} {plan.label}
            </span>
          )}
          <button onClick={() => toggle(s.id)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isFav(s.id) ? 'rgba(239,68,68,.85)' : 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            {isFav(s.id) ? '❤️' : '🤍'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <img src={s.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(201,168,76,.4)', flexShrink: 0 }} />
          <div>
            <h1 className="pf" style={{ fontSize: 'clamp(20px,5vw,34px)', margin: 0, lineHeight: 1.1 }}>{s.shop}</h1>
            <div style={{ color: '#C9A84C', marginTop: 4, fontWeight: 700, fontSize: 15 }}>dès {s.from.toFixed(2)} €</div>
            <div style={{ color: 'rgba(245,240,232,.7)', marginTop: 4, fontSize: 13, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>📍 {s.city}</span>
              <span>⭐ {s.rating} ({s.reviews} avis)</span>
              {s.delivery && <span>🚚 {s.deliveryTime}</span>}
              <span>🏆 {s.sales} ventes</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* Left column */}
        <div>
          <p style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{s.description}</p>

          <h3 style={{ fontSize: 'clamp(16px,4vw,20px)', marginBottom: 14 }}>Produits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {s.products.map(p => (
              <div key={p.id} style={{ background: '#111', padding: 12, borderRadius: 12, border: '1px solid rgba(201,168,76,.06)' }}>
                <div style={{ height: 110, overflow: 'hidden', borderRadius: 8, marginBottom: 10 }}>
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ color: '#C9A84C', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{p.price.toFixed(2)} €</div>
                <a href={`https://wa.me/${s.tel}?text=Bonjour, je voudrais commander : ${encodeURIComponent(p.name)}`}
                  target="_blank" rel="noreferrer"
                  className="btn-g"
                  style={{ display: 'block', marginTop: 8, padding: '8px', fontSize: 11, textAlign: 'center', borderRadius: 6, textDecoration: 'none' }}>
                  Commander
                </a>
              </div>
            ))}
          </div>

          {s.gallery?.length > 0 && (
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
            <img src={s.logo} alt="logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(201,168,76,.2)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{s.shop}</div>
              <div style={{ color: '#9A9A8A', fontSize: 12 }}>📍 {s.city}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Rating value={s.rating} />
            <span style={{ color: '#9A9A8A', fontSize: 12 }}>{s.reviews} avis</span>
          </div>

          <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Spécialités', val: s.types.join(', ') },
              { label: 'Livraison', val: s.delivery ? `✅ ${s.deliveryTime}` : '❌ Non disponible' },
              { label: 'Zone', val: s.deliveryZone || '—' },
              { label: 'Horaires', val: s.hours || 'Lun–Dim 10:00–22:00' },
              { label: 'Ventes', val: `${s.sales} commandes` },
              { label: 'Membre depuis', val: s.joinedDate || '2023' },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ color: '#6B6B6B' }}>{label}</span>
                <span style={{ color: '#F5F0E8', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{val}</span>
              </div>
            ))}
          </div>

          <a href={`https://wa.me/${s.tel || '33600000000'}?text=Bonjour%20${encodeURIComponent(s.shop)}%20!`}
            target="_blank" rel="noreferrer"
            className="btn-g"
            style={{ display: 'block', textAlign: 'center', padding: '13px', textDecoration: 'none', borderRadius: 10, fontSize: 13, marginBottom: 10 }}>
            📱 Contacter sur WhatsApp
          </a>

          <button onClick={handleContact} className="btn-o"
            style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>
            💬 Envoyer un message
          </button>

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
