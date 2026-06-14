export default function SellerFilters({ qtxt, setQtxt, city, setCity, onlyDelivery, setOnlyDelivery, cities = [], typesList = [], types = [], setTypes, minRating, setMinRating }) {
  const toggleType = (t) => {
    if (types.includes(t)) setTypes(types.filter(x => x !== t));
    else setTypes([...types, t]);
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        placeholder="🔍 Rechercher un vendeur..."
        value={qtxt}
        onChange={e => setQtxt(e.target.value)}
        style={{ padding: '10px 14px', minWidth: 180, flex: '1 1 180px', fontSize: 14 }}
      />
      <select value={city} onChange={e => setCity(e.target.value)} style={{ padding: 10, fontSize: 14, flex: '0 1 auto', color: city ? '#F5F0E8' : '#6B6B6B', background: '#1A1A1A', border: '1px solid rgba(201,168,76,.2)' }}>
        <option value="">Toutes les villes</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={minRating ?? ''} onChange={e => setMinRating(e.target.value ? parseFloat(e.target.value) : null)} style={{ padding: 10, fontSize: 14, flex: '0 1 auto', background: '#1A1A1A', border: '1px solid rgba(201,168,76,.2)', color: minRating ? '#F5F0E8' : '#6B6B6B' }}>
        <option value="">Toutes les notes</option>
        <option value="4.5">⭐ 4.5+</option>
        <option value="4.0">⭐ 4.0+</option>
        <option value="3.5">⭐ 3.5+</option>
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={onlyDelivery} onChange={e => setOnlyDelivery(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#C9A84C' }} />
        <span>🚚 Livraison</span>
      </label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flex: '0 1 100%', marginTop: 2 }}>
        {typesList.map(t => (
          <button key={t} onClick={() => toggleType(t)}
            style={{ padding: '6px 12px', borderRadius: 20, background: types.includes(t) ? '#C9A84C' : 'transparent', color: types.includes(t) ? '#0A0A0A' : '#C9A84C', border: '1px solid rgba(201,168,76,.25)', fontSize: 12, cursor: 'pointer', fontWeight: types.includes(t) ? 700 : 400, transition: 'all .15s' }}>
            {t}
          </button>
        ))}
        {(qtxt || city || onlyDelivery || types.length > 0 || minRating) && (
          <button onClick={() => { setQtxt(''); setCity(''); setOnlyDelivery(false); setTypes([]); setMinRating(null); }}
            style={{ padding: '6px 12px', borderRadius: 20, background: 'transparent', color: '#6B6B6B', border: '1px solid rgba(255,255,255,.08)', fontSize: 12, cursor: 'pointer' }}>
            ✕ Effacer filtres
          </button>
        )}
      </div>
    </div>
  );
}
