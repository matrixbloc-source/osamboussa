import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SellerCard from '../components/market/SellerCard.jsx';
import SellerFilters from '../components/market/SellerFilters.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useVendors } from '../lib/useVendors.js';
import useSEO from '../lib/useSEO.js';

export default function Vendeurs() {
  const location = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(location.search);

  const { vendors, loading, error } = useVendors();

  const [qtxt, setQtxt] = useState('');
  const [city, setCity] = useState(q.get('city') || '');
  const [onlyDelivery, setOnlyDelivery] = useState(q.get('delivery') === 'true');
  const [types, setTypes] = useState([]);
  const [minRating, setMinRating] = useState(null);
  const [tab, setTab] = useState(q.get('tab') === 'fav' ? 'fav' : 'all');
  const { favorites } = useFavorites();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setTab(params.get('tab') === 'fav' ? 'fav' : 'all');
    if (params.get('city')) setCity(params.get('city'));
    if (params.get('delivery') === 'true') setOnlyDelivery(true);
  }, [location.search]);

  const cities = useMemo(
    () => Array.from(new Set(vendors.map(s => s.city).filter(Boolean))),
    [vendors]
  );
  const typesList = useMemo(
    () => Array.from(new Set(vendors.flatMap(s => s.types || []))),
    [vendors]
  );

  const allFiltered = useMemo(() => {
    let list = vendors;
    if (tab === 'fav') list = list.filter(s => favorites.includes(s.id));
    if (qtxt) list = list.filter(s =>
      s.shop.toLowerCase().includes(qtxt.toLowerCase()) ||
      s.city.toLowerCase().includes(qtxt.toLowerCase()) ||
      (s.types || []).some(t => t.toLowerCase().includes(qtxt.toLowerCase()))
    );
    if (city) list = list.filter(s => s.city === city);
    if (onlyDelivery) list = list.filter(s => s.delivery);
    if (types.length) list = list.filter(s => types.some(t => (s.types || []).includes(t)));
    if (minRating) list = list.filter(s => s.rating >= minRating);
    return [...list].sort((a, b) => b.rating - a.rating);
  }, [vendors, qtxt, city, onlyDelivery, types, minRating, tab, favorites]);

  useSEO({
    title: "Vendeurs de samboussas artisanaux — Marketplace O'Samboussa",
    description: "Trouvez les meilleurs vendeurs de samboussas comoriens artisanaux près de chez vous. Commandez directement sur WhatsApp. Marseille, Paris, Lyon et toute la France.",
  });

  const changeTab = (t) => {
    setTab(t);
    navigate(t === 'fav' ? '/vendeurs?tab=fav' : '/vendeurs', { replace: true });
  };

  return (
    <section style={{ padding: '16px', maxWidth: '1200px', margin: '80px auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="lbl" style={{ marginBottom: 8 }}>Marketplace</p>
        <h2 className="pf" style={{ fontSize: 'clamp(24px,5vw,34px)', marginBottom: 6 }}>
          Vendeurs <span className="gold-text">O'Samboussa</span>
        </h2>
        <p style={{ color: '#9A9A8A', fontSize: 13 }}>
          {loading ? 'Chargement...' : `${vendors.length} vendeur${vendors.length > 1 ? 's' : ''} référencés — samboussas comoriens artisanaux`}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Tous les vendeurs' },
          { id: 'fav', label: `❤️ Favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
        ].map(t => (
          <button key={t.id} onClick={() => changeTab(t.id)}
            style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid rgba(201,168,76,.25)', background: tab === t.id ? '#C9A84C' : 'transparent', color: tab === t.id ? '#0A0A0A' : '#C9A84C', fontWeight: tab === t.id ? 700 : 400, transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <SellerFilters qtxt={qtxt} setQtxt={setQtxt} city={city} setCity={setCity} onlyDelivery={onlyDelivery} setOnlyDelivery={setOnlyDelivery} cities={cities} typesList={typesList} types={types} setTypes={setTypes} minRating={minRating} setMinRating={setMinRating} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 10, padding: '12px 16px', color: '#FF6B6B', fontSize: 13, marginBottom: 20 }}>
          Erreur de chargement : {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(clamp(160px,42vw,260px),1fr))', gap: 14 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: '#111', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(201,168,76,.06)', height: 280, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Grid principale */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(clamp(160px,42vw,260px),1fr))', gap: 14 }}>
          {allFiltered.map(s => (
            <Link key={s.id} to={`/vendeur/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <SellerCard seller={s} />
            </Link>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && allFiltered.length === 0 && (
        <div style={{ marginTop: 56, textAlign: 'center', color: '#6B6B6B' }}>
          {tab === 'fav' ? (
            <>
              <p style={{ fontSize: 42, marginBottom: 12 }}>🤍</p>
              <p style={{ fontSize: 14, marginBottom: 16 }}>Aucun favori pour l'instant.</p>
              <button onClick={() => changeTab('all')} className="btn-o" style={{ padding: '10px 22px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                Voir tous les vendeurs
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 42, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 14 }}>Aucun vendeur trouvé avec ces critères.</p>
            </>
          )}
        </div>
      )}

      {/* CTA Devenir vendeur */}
      {!loading && (
        <div style={{ marginTop: 56, background: 'linear-gradient(135deg,rgba(201,168,76,.06),rgba(232,213,163,.03))', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Rejoindre la marketplace</p>
          <h3 className="pf" style={{ fontSize: 'clamp(20px,4vw,28px)', color: '#F5F0E8', marginBottom: 10 }}>Vous êtes vendeur de samboussas ?</h3>
          <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
            Inscription 100% gratuite · Compte Fondateur à vie · Visible sur Google par ville
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/devenir-vendeur" className="btn-g" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>
              🚀 Inscription gratuite →
            </Link>
            <Link to="/abonnements" className="btn-o" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>
              En savoir plus
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
