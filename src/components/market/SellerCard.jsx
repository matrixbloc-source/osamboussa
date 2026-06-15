import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Rating from './Rating.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { trackWA } from '../../lib/trackEvent.js';

export default function SellerCard({ seller, featured = false }) {
  const { isFav, toggle } = useFavorites();
  const img = seller.photo || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800';
  const fav = isFav(seller.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: featured ? 1.015 : 1.025, boxShadow: '0 8px 28px rgba(201,168,76,.12)' }}
      transition={{ duration: 0.22 }}
      style={{
        background: '#111',
        borderRadius: featured ? 16 : 12,
        overflow: 'hidden',
        border: '1px solid rgba(201,168,76,.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}>

      {/* Cover */}
      <div style={{ height: featured ? 200 : 160, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>

        {/* Fav button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(seller.id); }}
          style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: fav ? 'rgba(239,68,68,.9)' : 'rgba(0,0,0,.55)', border: fav ? '1px solid #EF4444' : '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', transition: 'all .2s' }}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
          {fav ? '❤️' : '🤍'}
        </button>

        {/* Delivery badge */}
        {seller.delivery && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.35)', color: '#4ADE80', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
            🚚 Livraison
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: featured ? 16 : 12, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(13px,2vw,15px)', lineHeight: 1.3 }}>{seller.shop}</div>
            {seller.verified && (
              <span style={{ background: '#052f14', color: '#4ADE80', padding: '3px 7px', borderRadius: 20, fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>✔︎</span>
            )}
          </div>
          <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 5 }}>
            📍 {seller.city}{seller.types?.length > 0 ? ` · ${seller.types.slice(0, 2).join(', ')}` : ''}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#C9A84C' }}>dès {(seller.from ?? 2).toFixed(2)} €</div>
            {seller.sales && <div style={{ color: '#6B6B6B', fontSize: 11 }}>{seller.sales} ventes</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Rating value={seller.rating || 4.6} size={12} />
            <span style={{ fontSize: 11, color: '#9A9A8A' }}>{seller.reviews} avis</span>
          </div>
          <a
            href={`https://wa.me/${seller.tel || '33600000000'}?text=Bonjour%20${encodeURIComponent(seller.shop)}%20!`}
            className="btn-g"
            onClick={e => { e.stopPropagation(); trackWA(seller.id); }}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', marginTop: 10, padding: '9px 12px', textDecoration: 'none', fontSize: 11, textAlign: 'center', borderRadius: 8 }}>
            Contacter sur WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}
