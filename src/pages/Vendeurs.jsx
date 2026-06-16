import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SellerCard from '../components/market/SellerCard.jsx';
import SellerFilters from '../components/market/SellerFilters.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useVendors } from '../lib/useVendors.js';
import useSEO from '../lib/useSEO.js';

// ─── Données marketing ────────────────────────────────────────────────────────

const REGIONS = [
  {
    name: 'Afrique',
    icon: '🌍',
    desc: "Samboussas, beignets, thiéboudienne, jus de bissap, gingembre, thiakry et bien plus encore.",
    gradient: 'linear-gradient(135deg,rgba(180,100,20,.16) 0%,rgba(201,168,76,.05) 100%)',
    border: 'rgba(180,100,20,.28)',
    accent: '#D4891A',
    tags: ['Comores', 'Sénégal', 'Cameroun', "Côte d'Ivoire", 'Mali'],
  },
  {
    name: 'Asie',
    icon: '🌏',
    desc: "Nems, baos, momos, dim sum, currys maison et créations de terroir asiatiques.",
    gradient: 'linear-gradient(135deg,rgba(80,40,140,.16) 0%,rgba(120,80,200,.04) 100%)',
    border: 'rgba(100,60,200,.22)',
    accent: '#9060C8',
    tags: ['Vietnam', 'Chine', 'Inde', 'Japon', 'Thaïlande'],
  },
  {
    name: 'Océan Indien',
    icon: '🏝️',
    desc: "Rougails, caris, achards, bonbons piments et samossas de La Réunion à Maurice.",
    gradient: 'linear-gradient(135deg,rgba(20,80,120,.16) 0%,rgba(30,150,180,.04) 100%)',
    border: 'rgba(30,140,170,.22)',
    accent: '#1E8CA8',
    tags: ['La Réunion', 'Mayotte', 'Maurice', 'Madagascar'],
  },
];

const WHY_ITEMS = [
  {
    icon: '🤲',
    title: 'Artisanal & fait maison',
    desc: "Chaque produit est préparé à la main par un passionné — jamais industriel, jamais en usine.",
  },
  {
    icon: '📍',
    title: 'Vendeurs près de chez vous',
    desc: "Des artisans dans votre ville ou région. Retrouvez la saveur de vos voyages à deux pas.",
  },
  {
    icon: '💬',
    title: 'Contact direct WhatsApp',
    desc: "Commandez sans intermédiaire, sans frais cachés. Un message suffit pour tout organiser.",
  },
  {
    icon: '🌍',
    title: 'Découverte culturelle',
    desc: "Explorez des recettes transmises de génération en génération, venues d'Afrique, d'Asie et des îles.",
  },
];

const POPULAR_CITIES = [
  'Paris', 'Marseille', 'Lyon', 'Bordeaux', 'Lille',
  'Nantes', 'Toulouse', 'Nice', 'Strasbourg', 'Montpellier', 'Rennes',
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HomeHero({ onFind }) {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg,#0E0B04 0%,#0A0A0A 45%,#050810 100%)',
      borderBottom: '1px solid rgba(201,168,76,.1)',
    }}>
      {/* Orbes décoratifs */}
      <div aria-hidden style={{ position:'absolute', top:'-10%', right:'-5%', width:'clamp(280px,44vw,580px)', height:'clamp(280px,44vw,580px)', background:'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 68%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-15%', left:'-8%', width:'clamp(250px,38vw,500px)', height:'clamp(250px,38vw,500px)', background:'radial-gradient(circle,rgba(130,80,30,.09) 0%,transparent 68%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', top:'40%', right:'20%', width:260, height:260, background:'radial-gradient(circle,rgba(30,140,170,.04) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      {/* Icônes flottantes décoratives */}
      <div aria-hidden style={{ position:'absolute', right:'4%', top:'18%', fontSize:'clamp(70px,11vw,130px)', opacity:.04, transform:'rotate(18deg)', pointerEvents:'none', userSelect:'none', lineHeight:1 }}>🌍</div>
      <div aria-hidden style={{ position:'absolute', right:'22%', bottom:'12%', fontSize:'clamp(50px,8vw,100px)', opacity:.03, transform:'rotate(-14deg)', pointerEvents:'none', userSelect:'none' }}>🌏</div>
      <div aria-hidden style={{ position:'absolute', left:'1%', bottom:'25%', fontSize:'clamp(36px,6vw,80px)', opacity:.025, transform:'rotate(10deg)', pointerEvents:'none', userSelect:'none' }}>🏝️</div>

      {/* Contenu */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'clamp(108px,15vw,148px) 24px clamp(60px,8vw,88px)',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(201,168,76,.07)',
          border: '1px solid rgba(201,168,76,.2)',
          borderRadius: 100, padding: '7px 18px',
          marginBottom: 'clamp(22px,3.5vw,36px)',
        }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#C9A84C', animation:'pulse 2s ease-in-out infinite', display:'inline-block', flexShrink:0 }} />
          <span style={{ fontSize:11, letterSpacing:'2.5px', textTransform:'uppercase', color:'#C9A84C', fontWeight:500, whiteSpace:'nowrap' }}>
            Marketplace culinaire · France entière
          </span>
        </div>

        {/* Titre */}
        <h1 className="pf" style={{
          fontSize: 'clamp(30px,6.5vw,72px)',
          lineHeight: 1.07,
          fontWeight: 700,
          maxWidth: 820,
          marginBottom: 'clamp(14px,2vw,24px)',
          color: '#F5F0E8',
          letterSpacing: '-0.02em',
        }}>
          Retrouvez les saveurs<br />
          que vous avez{' '}
          <span className="gold-shimmer">aimées en voyage.</span>
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: 'clamp(14px,1.9vw,19px)',
          color: '#9A9A8A',
          lineHeight: 1.75,
          maxWidth: 560,
          marginBottom: 'clamp(28px,4.5vw,48px)',
          fontWeight: 300,
        }}>
          Découvrez des vendeurs passionnés de spécialités artisanales{' '}
          <span style={{ color:'#C9A84C', fontWeight:400 }}>africaines, asiatiques</span>{' '}
          et de{' '}
          <span style={{ color:'#C9A84C', fontWeight:400 }}>l'océan Indien</span>{' '}
          — partout en France.
        </p>

        {/* CTA */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:'clamp(36px,6vw,60px)' }}>
          <button
            className="btn-g"
            onClick={onFind}
            style={{ padding:'clamp(13px,1.8vw,17px) clamp(22px,3.5vw,40px)', borderRadius:12, fontSize:'clamp(13px,1.4vw,15px)', letterSpacing:1, cursor:'pointer' }}
          >
            Trouver un vendeur →
          </button>
          <Link
            to="/devenir-vendeur"
            className="btn-o"
            style={{ padding:'clamp(13px,1.8vw,17px) clamp(22px,3.5vw,40px)', borderRadius:12, fontSize:'clamp(13px,1.4vw,15px)', textDecoration:'none', display:'inline-block' }}
          >
            Créer ma boutique gratuitement
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 'clamp(18px,4vw,48px)', flexWrap: 'wrap',
          paddingTop: 'clamp(22px,3vw,32px)',
          borderTop: '1px solid rgba(201,168,76,.1)',
        }}>
          {[
            { value:'3',    label:'Continents représentés' },
            { value:'100%', label:'Artisanal & fait maison' },
            { value:'0 €',  label:'Inscription vendeur' },
            { value:'⚡',   label:'Contact WhatsApp direct' },
          ].map((s, i) => (
            <div key={i} style={{ minWidth:70 }}>
              <div style={{ fontSize:'clamp(18px,2.8vw,28px)', fontWeight:700, color:'#C9A84C', fontFamily:"'Playfair Display',serif" }}>{s.value}</div>
              <div style={{ fontSize:10, color:'#5A5A5A', letterSpacing:'1.5px', textTransform:'uppercase', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Régions du monde ─────────────────────────────────────────────────────────

function WorldRegions() {
  return (
    <div style={{ background:'#080808', padding:'clamp(48px,8vw,80px) 24px', borderBottom:'1px solid rgba(201,168,76,.07)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'clamp(32px,5vw,52px)' }}>
          <p className="lbl" style={{ marginBottom:14 }}>Explorez le monde</p>
          <h2 className="pf" style={{ fontSize:'clamp(22px,4vw,40px)', color:'#F5F0E8', fontWeight:700, marginBottom:14 }}>
            Trois continents,{' '}
            <span className="gold-text">mille saveurs</span>
          </h2>
          <p style={{ color:'#6B6B6B', fontSize:'clamp(13px,1.4vw,15px)', maxWidth:500, margin:'0 auto', lineHeight:1.75 }}>
            O'Samboussa rassemble des artisans de toutes origines pour vous faire voyager à travers les saveurs.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap:'clamp(12px,2vw,20px)' }}>
          {REGIONS.map(r => (
            <div
              key={r.name}
              style={{
                background: r.gradient,
                border: `1px solid ${r.border}`,
                borderRadius: 20,
                padding: 'clamp(24px,3vw,36px)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform .3s ease, box-shadow .3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 20px 56px rgba(0,0,0,.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div aria-hidden style={{ position:'absolute', right:-12, top:-12, fontSize:90, opacity:.055, pointerEvents:'none', userSelect:'none' }}>{r.icon}</div>
              <div style={{ fontSize:'clamp(30px,4.5vw,48px)', marginBottom:16 }}>{r.icon}</div>
              <h3 className="pf" style={{ fontSize:'clamp(20px,3vw,28px)', color:'#F5F0E8', fontWeight:700, marginBottom:10 }}>{r.name}</h3>
              <p style={{ color:'#8A8A7A', fontSize:'clamp(12px,1.3vw,14px)', lineHeight:1.75, marginBottom:20 }}>{r.desc}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {r.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize:10, letterSpacing:1, textTransform:'uppercase',
                    color:r.accent, border:`1px solid ${r.border}`,
                    padding:'4px 10px', borderRadius:100, fontWeight:500,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pourquoi O'Samboussa ─────────────────────────────────────────────────────

function WhySection() {
  return (
    <div style={{ background:'#0A0A0A', padding:'clamp(48px,8vw,80px) 24px', borderBottom:'1px solid rgba(201,168,76,.07)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'clamp(32px,5vw,52px)' }}>
          <p className="lbl" style={{ marginBottom:14 }}>Pourquoi nous choisir</p>
          <h2 className="pf" style={{ fontSize:'clamp(22px,4vw,38px)', color:'#F5F0E8', fontWeight:700 }}>
            La marketplace qui{' '}
            <span className="gold-text">vous respecte</span>
          </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:'clamp(12px,2vw,18px)' }}>
          {WHY_ITEMS.map((w, i) => (
            <div
              key={i}
              style={{
                background: '#111111',
                border: '1px solid rgba(201,168,76,.1)',
                borderRadius: 16,
                padding: 'clamp(24px,3vw,32px)',
                transition: 'border-color .25s ease, transform .25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.38)'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,168,76,.1)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{ fontSize:'clamp(28px,4vw,40px)', marginBottom:16 }}>{w.icon}</div>
              <h4 className="pf" style={{ fontSize:'clamp(16px,2vw,20px)', color:'#F5F0E8', fontWeight:600, marginBottom:10 }}>{w.title}</h4>
              <p style={{ color:'#6B6B6B', fontSize:'clamp(12px,1.3vw,14px)', lineHeight:1.75 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Villes populaires ────────────────────────────────────────────────────────

function CitiesStrip({ cities, activeCity, onCity, onFind }) {
  const sorted = [
    ...POPULAR_CITIES.filter(c => cities.includes(c)),
    ...cities.filter(c => !POPULAR_CITIES.includes(c)),
  ];
  if (sorted.length === 0) return null;

  const Pill = ({ label, value }) => {
    const active = activeCity === value;
    return (
      <button
        onClick={() => { onCity(value); onFind(); }}
        style={{
          padding: '9px 20px', borderRadius: 100, fontSize: 12, cursor: 'pointer',
          border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,.18)'}`,
          background: active ? 'rgba(201,168,76,.14)' : 'transparent',
          color: active ? '#C9A84C' : '#7A7A6A',
          fontWeight: active ? 600 : 400,
          letterSpacing: .5, transition: 'all .15s ease',
          fontFamily: "'Inter',sans-serif",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ background:'#0C0C0C', padding:'clamp(36px,6vw,60px) 24px', borderBottom:'1px solid rgba(201,168,76,.07)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <p className="lbl" style={{ marginBottom:10 }}>Trouver par ville</p>
            <h2 className="pf" style={{ fontSize:'clamp(18px,3vw,30px)', color:'#F5F0E8', fontWeight:700 }}>
              Des vendeurs{' '}
              <span className="gold-text">partout en France</span>
            </h2>
          </div>
          <button
            className="btn-o"
            onClick={onFind}
            style={{ padding:'10px 22px', borderRadius:10, fontSize:12, whiteSpace:'nowrap', cursor:'pointer' }}
          >
            Voir tous →
          </button>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          <Pill label="📍 Toute la France" value="" />
          {sorted.map(c => <Pill key={c} label={c} value={c} />)}
        </div>
      </div>
    </div>
  );
}

// ─── CTA Devenir vendeur ──────────────────────────────────────────────────────

function VendorCTA() {
  return (
    <div style={{
      marginTop: 'clamp(48px,8vw,80px)',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg,#0D0A05 0%,#0A0A0A 50%,#05080E 100%)',
      border: '1px solid rgba(201,168,76,.18)',
      borderRadius: 24,
      padding: 'clamp(40px,6vw,72px) clamp(24px,4vw,56px)',
    }}>
      <div aria-hidden style={{ position:'absolute', right:-40, top:-40, width:320, height:320, background:'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', left:-40, bottom:-40, width:260, height:260, background:'radial-gradient(circle,rgba(30,140,170,.05) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:680, margin:'0 auto', textAlign:'center' }}>
        <p className="lbl" style={{ marginBottom:16 }}>Vous proposez des spécialités artisanales ?</p>
        <h3 className="pf" style={{ fontSize:'clamp(22px,4vw,36px)', color:'#F5F0E8', fontWeight:700, marginBottom:16, lineHeight:1.15 }}>
          Rejoignez la marketplace<br />des artisans du monde
        </h3>
        <p style={{ color:'#6B6B6B', fontSize:'clamp(13px,1.4vw,15px)', lineHeight:1.7, maxWidth:480, margin:'0 auto 32px' }}>
          Inscription 100% gratuite · Compte Fondateur à vie · Visible sur Google par ville et par spécialité.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
          <Link
            to="/devenir-vendeur"
            className="btn-g"
            style={{ padding:'clamp(13px,2vw,16px) clamp(22px,3vw,36px)', borderRadius:12, fontSize:'clamp(13px,1.4vw,14px)', textDecoration:'none' }}
          >
            Créer ma boutique gratuitement →
          </Link>
          <Link
            to="/abonnements"
            className="btn-o"
            style={{ padding:'clamp(13px,2vw,16px) clamp(22px,3vw,36px)', borderRadius:12, fontSize:'clamp(13px,1.4vw,14px)', textDecoration:'none', display:'inline-block' }}
          >
            Voir les abonnements
          </Link>
        </div>

        <div style={{ display:'flex', gap:'clamp(14px,3vw,28px)', justifyContent:'center', flexWrap:'wrap' }}>
          {['🚀 Gratuit pour commencer', '📱 Commandes par WhatsApp', '🌍 Toutes spécialités acceptées'].map((item, i) => (
            <span key={i} style={{ fontSize:11, color:'#5A5A5A', letterSpacing:.5 }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Vendeurs() {
  const location = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(location.search);

  const { vendors, loading, error } = useVendors();

  const [qtxt, setQtxt]               = useState('');
  const [city, setCity]               = useState(q.get('city') || '');
  const [onlyDelivery, setOnlyDelivery] = useState(q.get('delivery') === 'true');
  const [types, setTypes]             = useState([]);
  const [minRating, setMinRating]     = useState(null);
  const [tab, setTab]                 = useState(q.get('tab') === 'fav' ? 'fav' : 'all');
  const { favorites }                 = useFavorites();

  const listingRef = useRef(null);
  const scrollToListing = useCallback(() => {
    if (!listingRef.current) return;
    const top = listingRef.current.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

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
    title: "Spécialités artisanales africaines, asiatiques & océan Indien — O'Samboussa",
    description: "Trouvez des vendeurs de spécialités artisanales africaines, asiatiques et de l'océan Indien près de chez vous. Samboussas, nems, caris, rougail et bien plus. Partout en France.",
  });

  const changeTab = (t) => {
    setTab(t);
    navigate(t === 'fav' ? '/vendeurs?tab=fav' : '/vendeurs', { replace: true });
  };

  return (
    <>
      {/* ── Marketing ── */}
      <HomeHero onFind={scrollToListing} />
      <WorldRegions />
      <WhySection />
      <CitiesStrip
        cities={cities}
        activeCity={city}
        onCity={setCity}
        onFind={scrollToListing}
      />

      {/* ── Listing vendeurs ── */}
      <section
        ref={listingRef}
        style={{ padding: '0 16px clamp(48px,8vw,80px)', maxWidth: 1200, margin: '0 auto' }}
      >
        {/* En-tête */}
        <div style={{ padding: 'clamp(40px,6vw,64px) 0 20px' }}>
          <p className="lbl" style={{ marginBottom: 8 }}>Artisans référencés</p>
          <h2 className="pf" style={{ fontSize: 'clamp(22px,4vw,32px)', marginBottom: 6 }}>
            Vendeurs <span className="gold-text">O'Samboussa</span>
          </h2>
          <p style={{ color: '#9A9A8A', fontSize: 13 }}>
            {loading
              ? 'Chargement...'
              : `${vendors.length} vendeur${vendors.length > 1 ? 's' : ''} référencé${vendors.length > 1 ? 's' : ''} — spécialités artisanales du monde entier`}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tous les vendeurs' },
            { id: 'fav', label: `❤️ Favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid rgba(201,168,76,.25)', background: tab === t.id ? '#C9A84C' : 'transparent', color: tab === t.id ? '#0A0A0A' : '#C9A84C', fontWeight: tab === t.id ? 700 : 400, transition: 'all .15s' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ marginBottom: 24 }}>
          <SellerFilters
            qtxt={qtxt} setQtxt={setQtxt}
            city={city} setCity={setCity}
            onlyDelivery={onlyDelivery} setOnlyDelivery={setOnlyDelivery}
            cities={cities} typesList={typesList}
            types={types} setTypes={setTypes}
            minRating={minRating} setMinRating={setMinRating}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 10, padding: '12px 16px', color: '#FF6B6B', fontSize: 13, marginBottom: 20 }}>
            Erreur de chargement : {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(clamp(160px,42vw,260px),1fr))', gap: 14 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: '#111', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(201,168,76,.06)', height: 280, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Grille */}
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

        {/* CTA vendeur */}
        {!loading && <VendorCTA />}
      </section>
    </>
  );
}
