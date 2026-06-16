import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SellerCard from '../components/market/SellerCard.jsx';
import { useVendors } from '../lib/useVendors.js';
import useSEO from '../lib/useSEO.js';

const CITY_MAP = {
  'marseille': 'Marseille',
  'paris': 'Paris',
  'lyon': 'Lyon',
  'toulouse': 'Toulouse',
  'bordeaux': 'Bordeaux',
  'montpellier': 'Montpellier',
  'nice': 'Nice',
  'nantes': 'Nantes',
  'lille': 'Lille',
  'strasbourg': 'Strasbourg',
  'rennes': 'Rennes',
  'grenoble': 'Grenoble',
  'aix-en-provence': 'Aix-en-Provence',
  'saint-etienne': 'Saint-Étienne',
  'reims': 'Reims',
  'toulon': 'Toulon',
  'dijon': 'Dijon',
  'angers': 'Angers',
  'nimes': 'Nîmes',
  'villeurbanne': 'Villeurbanne',
};

export default function VilleSamboussas() {
  const { ville } = useParams();
  const slug = ville?.toLowerCase() || '';
  const cityName = CITY_MAP[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '');

  const { vendors, loading } = useVendors();
  const cityVendors = vendors.filter(v =>
    v.city?.toLowerCase() === cityName.toLowerCase()
  );

  useSEO({
    title: `Spécialités artisanales à ${cityName} — Samboussas & saveurs du monde | O'Samboussa`,
    description: `Trouvez les meilleurs vendeurs de spécialités artisanales africaines, asiatiques et de l'océan Indien à ${cityName}. Commande directe sur WhatsApp, livraison à domicile ou retrait sur place.`,
    og: {
      title: `Spécialités artisanales à ${cityName} — O'Samboussa`,
      description: `${cityVendors.length > 0 ? cityVendors.length + ' vendeur' + (cityVendors.length > 1 ? 's' : '') + ' de spécialités artisanales à ' + cityName : 'Découvrez les spécialités artisanales à ' + cityName}.`,
    },
  });

  const otherCities = Object.entries(CITY_MAP).filter(([s]) => s !== slug).slice(0, 10);

  return (
    <section style={{ padding: '16px', maxWidth: '1200px', margin: '80px auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, fontSize: 13, color: '#6B6B6B' }}>
        <Link to="/vendeurs" style={{ color: '#C9A84C', textDecoration: 'none' }}>Vendeurs</Link>
        <span>›</span>
        <span>Samboussas à {cityName}</span>
      </div>

      {/* Header SEO */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}>
        <p className="lbl" style={{ marginBottom: 8 }}>{cityName}</p>
        <h1 className="pf" style={{ fontSize: 'clamp(24px,5vw,38px)', marginBottom: 10, lineHeight: 1.15 }}>
          Samboussas à <span className="gold-text">{cityName}</span>
        </h1>
        <p style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.7, maxWidth: 600 }}>
          {cityVendors.length > 0
            ? `${cityVendors.length} vendeur${cityVendors.length > 1 ? 's' : ''} de spécialités artisanales à ${cityName}. Contactez-les directement sur WhatsApp pour commander.`
            : `Nous cherchons des vendeurs de samboussas artisanaux à ${cityName}. Inscription gratuite à vie.`
          }
        </p>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(clamp(160px,42vw,260px),1fr))', gap: 14, marginBottom: 40 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#111', borderRadius: 12, height: 280, border: '1px solid rgba(201,168,76,.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Vendors grid */}
      {!loading && cityVendors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(clamp(160px,42vw,260px),1fr))', gap: 14, marginBottom: 40 }}>
          {cityVendors.map(s => (
            <Link key={s.id} to={`/vendeur/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <SellerCard seller={s} />
            </Link>
          ))}
        </div>
      )}

      {/* Empty state — devenir le premier */}
      {!loading && cityVendors.length === 0 && (
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🥟</div>
          <h2 className="pf" style={{ fontSize: 22, color: '#F5F0E8', marginBottom: 12 }}>
            Pas encore de vendeurs à {cityName}
          </h2>
          <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Soyez le premier vendeur de samboussas référencé à {cityName}. Inscription 100% gratuite, Compte Fondateur à vie.
          </p>
          <Link to="/devenir-vendeur" className="btn-g"
            style={{ padding: '14px 32px', borderRadius: 12, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            🚀 Devenir le premier vendeur à {cityName} →
          </Link>
        </div>
      )}

      {/* CTA Become vendor (when there are already vendors) */}
      {!loading && cityVendors.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,.06),rgba(232,213,163,.03))', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <h3 className="pf" style={{ fontSize: 'clamp(18px,4vw,24px)', color: '#F5F0E8', marginBottom: 10 }}>
            Vous proposez des spécialités artisanales à {cityName} ?
          </h3>
          <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 20 }}>
            Rejoignez O'Samboussa gratuitement · Compte Fondateur à vie · Visible sur Google
          </p>
          <Link to="/devenir-vendeur" className="btn-g"
            style={{ padding: '13px 32px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Inscription gratuite →
          </Link>
        </div>
      )}

      {/* Other cities */}
      <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, marginBottom: 14, color: '#C9A84C', letterSpacing: 1 }}>
          Samboussas dans d'autres villes
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {otherCities.map(([s, name]) => (
            <Link key={s} to={`/samoussas/${s}`}
              style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', color: '#C9A84C', textDecoration: 'none', fontSize: 13, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,.06)'; }}>
              {name}
            </Link>
          ))}
        </div>
      </div>

      {/* SEO text block */}
      <div style={{ color: '#3A3A3A', fontSize: 13, lineHeight: 1.9, borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: 24 }}>
        <h2 style={{ color: '#5A5A5A', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Trouver des spécialités artisanales à {cityName}
        </h2>
        <p>
          O'Samboussa est la marketplace culinaire artisanale des saveurs africaines, asiatiques et de l'océan Indien en France.
          Retrouvez tous les vendeurs de spécialités artisanales à {cityName} : commandez directement sur WhatsApp,
          choisissez votre spécialité (samboussas, nems, caris, rougails, beignets…)
          et profitez d'une livraison à domicile ou d'un retrait sur place selon les vendeurs.
        </p>
      </div>

    </section>
  );
}
