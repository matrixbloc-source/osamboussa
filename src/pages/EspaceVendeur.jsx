import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Rating from '../components/market/Rating.jsx';
import { supabase, IS_REAL_SUPABASE, SUPABASE_STORAGE_BUCKET } from '../lib/supabaseClient.js';
import { useVendor } from '../lib/useVendors.js';
import { getLocalWAClicks } from '../lib/trackEvent.js';

function StatCard({ label, value, sub, color = '#C9A84C', icon, live = false }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: '20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {live && <span style={{ fontSize: 10, color: '#4ADE80', background: 'rgba(74,222,128,.1)', padding: '3px 8px', borderRadius: 20 }}>● Live</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ color: '#9A9A8A', fontSize: 12, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: '#6B6B6B', fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ImagePicker({ label, preview, currentUrl, inputRef, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#C9A84C' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: '#0D0D0D', border: '1px solid rgba(201,168,76,.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(preview || currentUrl)
            ? <img src={preview || currentUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 24, opacity: .4 }}>🖼</span>
          }
        </div>
        <div>
          <button type="button" className="btn-o" onClick={() => inputRef.current?.click()}
            style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, cursor: 'pointer', display: 'block', marginBottom: 4 }}>
            {preview ? '✓ Sélectionné' : 'Choisir une image'}
          </button>
          <span style={{ color: '#6B6B6B', fontSize: 11 }}>JPG, PNG, WEBP · max 5 Mo</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
    </div>
  );
}

export default function EspaceVendeur() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { vendor, loading: vendorLoading } = useVendor(user?.id);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [form, setForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [newProductImgFiles, setNewProductImgFiles] = useState([]);
  const [newProductImgPreviews, setNewProductImgPreviews] = useState([]);
  const [newProductImgError, setNewProductImgError] = useState(null);
  const [productInsertError, setProductInsertError] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newType, setNewType] = useState('');
  const [vendorStats, setVendorStats] = useState({ wa_clicks: 0, page_views: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const logoRef = useRef(null);
  const coverRef = useRef(null);
  const productImgRef = useRef(null);

  useEffect(() => {
    if (vendor && !form) {
      setForm({ ...vendor });
      setProducts([...(vendor.products || [])]);
    }
  }, [vendor]);

  // Load analytics stats (wa_clicks, page_views) from vendor_stats table
  useEffect(() => {
    if (!user?.id) return;
    const localClicks = getLocalWAClicks(user.id);
    setVendorStats(s => ({ ...s, wa_clicks: localClicks }));
    if (!IS_REAL_SUPABASE) return;
    supabase
      .from('vendor_stats')
      .select('wa_clicks, page_views')
      .eq('vendor_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setVendorStats({ wa_clicks: Math.max(data.wa_clicks || 0, localClicks), page_views: data.page_views || 0 });
      });
  }, [user?.id]);

  useEffect(() => {
    if (activeTab !== 'reviews' || !user?.id) return;
    if (!IS_REAL_SUPABASE) {
      setReviews([
        { id: 1, client_name: 'Amina K.', rating: 5, text: 'Samboussas incroyables !', created_at: '2026-06-10' },
        { id: 2, client_name: 'Karim B.', rating: 5, text: 'Je commande toutes les semaines.', created_at: '2026-06-08' },
      ]);
      return;
    }
    supabase.from('reviews').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []));
  }, [activeTab, user?.id]);

  const isLoading = authLoading || vendorLoading;

  const setField = (field) => (e) =>
    setForm(v => ({ ...v, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addType = () => {
    const t = newType.trim();
    if (!t) return;
    if (!(form.types || []).includes(t)) setForm(v => ({ ...v, types: [...(v.types || []), t] }));
    setNewType('');
  };

  const removeType = (t) => setForm(v => ({ ...v, types: (v.types || []).filter(x => x !== t) }));

  const saveProfile = async () => {
    if (!form || !user?.id) return;
    setSaving(true);
    setSaveError(null);

    try {
      let logoUrl = form.logo;
      let photoUrl = form.photo;

      if (IS_REAL_SUPABASE) {
        const logoFile = logoRef.current?.files?.[0];
        const coverFile = coverRef.current?.files?.[0];

        if (logoFile) {
          const ext = logoFile.name.split('.').pop().toLowerCase();
          const { error } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .upload(`${user.id}/logo.${ext}`, logoFile, { upsert: true });
          if (!error) {
            logoUrl = supabase.storage.from(SUPABASE_STORAGE_BUCKET)
              .getPublicUrl(`${user.id}/logo.${ext}`).data.publicUrl;
          }
        }

        if (coverFile) {
          const ext = coverFile.name.split('.').pop().toLowerCase();
          const { error } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .upload(`${user.id}/cover.${ext}`, coverFile, { upsert: true });
          if (!error) {
            photoUrl = supabase.storage.from(SUPABASE_STORAGE_BUCKET)
              .getPublicUrl(`${user.id}/cover.${ext}`).data.publicUrl;
          }
        }

        const { error: updateErr } = await supabase.from('vendors').update({
          shop: form.shop,
          city: form.city,
          postal_code: form.postalCode || '',
          district: form.district || '',
          phone: form.tel,
          hours: form.hours,
          delivery: Boolean(form.delivery),
          delivery_time: form.deliveryTime,
          delivery_zone: form.deliveryZone,
          instagram: form.instagram,
          description: form.description,
          types: form.types || [],
          logo: logoUrl,
          photo: photoUrl,
        }).eq('id', user.id);

        if (updateErr) throw updateErr;
      }

      setForm(v => ({ ...v, logo: logoUrl, photo: photoUrl }));
      setLogoPreview(null);
      setCoverPreview(null);
      if (logoRef.current) logoRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addProductImgs = (e) => {
    const files = Array.from(e.target.files || []);
    setNewProductImgError(null);
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const valid = [];
    for (const f of files) {
      if (!allowed.includes(f.type)) { setNewProductImgError(`${f.name} : format non supporté (JPG, PNG, WebP).`); continue; }
      if (f.size > 5 * 1024 * 1024) { setNewProductImgError(`${f.name} : image trop lourde (max 5 Mo).`); continue; }
      valid.push(f);
    }
    if (valid.length > 0) {
      setNewProductImgFiles(prev => [...prev, ...valid]);
      setNewProductImgPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
    }
    e.target.value = '';
  };

  const removeProductImg = (i) => {
    URL.revokeObjectURL(newProductImgPreviews[i]);
    setNewProductImgFiles(prev => prev.filter((_, idx) => idx !== i));
    setNewProductImgPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const resetProductImgs = () => {
    newProductImgPreviews.forEach(url => URL.revokeObjectURL(url));
    setNewProductImgFiles([]);
    setNewProductImgPreviews([]);
    setNewProductImgError(null);
    if (productImgRef.current) productImgRef.current.value = '';
  };

  const addProduct = async () => {
    // ── Validation ────────────────────────────────────────────────
    const parsed = parseFloat(String(newProduct.price).replace(',', '.'));

    console.log('[addProduct] ▶ start', {
      name: newProduct.name,
      priceRaw: newProduct.price,
      priceParsed: parsed,
      userId: user?.id,
    });

    if (!newProduct.name.trim()) {
      console.warn('[addProduct] ✗ nom vide');
      setProductInsertError('Le nom du produit est requis.');
      return;
    }
    if (isNaN(parsed) || parsed < 0) {
      console.warn('[addProduct] ✗ prix invalide', parsed);
      setProductInsertError(`Prix invalide : "${newProduct.price}" → ${parsed}`);
      return;
    }

    setUploadingImg(true);
    setProductInsertError(null);

    // ── Vérification session auth ──────────────────────────────────
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    console.log('[addProduct] session:', session
      ? `✓ uid=${session.user.id}, expires=${new Date(session.expires_at * 1000).toISOString()}`
      : '✗ NULL — session expirée ou absente');

    if (!session) {
      setProductInsertError('Session expirée. Déconnectez-vous et reconnectez-vous.');
      setUploadingImg(false);
      return;
    }

    // ── Upload images ─────────────────────────────────────────────
    const allImgUrls = [];
    if (newProductImgFiles.length > 0) {
      for (let i = 0; i < newProductImgFiles.length; i++) {
        const file = newProductImgFiles[i];
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `${user.id}/products/${Date.now()}_${i}.${ext}`;
        console.log('[addProduct] upload image', path);
        const { error: upErr } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .upload(path, file, { upsert: false });
        if (upErr) {
          console.warn('[addProduct] upload error', upErr.message);
        } else {
          const { data: urlData } = supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .getPublicUrl(path);
          if (urlData?.publicUrl) allImgUrls.push(urlData.publicUrl);
        }
      }
    }

    const imgUrl = allImgUrls[0] || null;

    // ── Payload ───────────────────────────────────────────────────
    const payload = {
      vendor_id: user.id,
      name: newProduct.name.trim(),
      price: parsed,
      img: imgUrl,
      active: true,
    };
    console.log('[addProduct] payload →', JSON.stringify(payload));

    // ── Insert (sans images d'abord pour tester la colonne) ───────
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id, name, price, img, active')
      .single();

    console.log('[addProduct] result →', {
      data,
      error: error
        ? { code: error.code, message: error.message, details: error.details, hint: error.hint }
        : null,
    });

    if (error) {
      const detail = [
        error.message,
        error.details  ? `Détails : ${error.details}` : '',
        error.hint     ? `Conseil : ${error.hint}`     : '',
        `Code : ${error.code || '?'}`,
        `vendor_id utilisé : ${user.id}`,
      ].filter(Boolean).join(' — ');
      setProductInsertError(detail);
      // Ne pas effacer le formulaire en cas d'erreur
      setUploadingImg(false);
      return;
    }

    if (data) {
      // Si la colonne images existe, mettre à jour séparément (évite l'erreur si absente)
      if (allImgUrls.length > 0) {
        await supabase
          .from('products')
          .update({ img: imgUrl, images: allImgUrls })
          .eq('id', data.id);
      }

      setProducts(prev => [...prev, {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        img: data.img,
        images: allImgUrls,
      }]);

      // Effacer le formulaire uniquement en cas de succès
      setNewProduct({ name: '', price: '' });
      resetProductImgs();
      console.log('[addProduct] ✓ produit ajouté', data.id);
    }

    setUploadingImg(false);
  };

  const deleteProduct = async (productId) => {
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase.from('products').delete().eq('id', productId).eq('vendor_id', user.id);
      if (error) return;
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const stats = useMemo(() => ({
    rating: form?.rating || 0,
    reviews: form?.reviews || 0,
    waClicks: vendorStats.wa_clicks,
    pageViews: vendorStats.page_views,
  }), [form, vendorStats]);

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord' },
    { id: 'profile', label: '👤 Profil' },
    { id: 'products', label: '🛒 Produits' },
    { id: 'reviews', label: '⭐ Avis' },
  ];

  if (isLoading) {
    return (
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
        <div style={{ color: '#C9A84C', fontSize: 14 }}>Chargement de votre espace...</div>
      </section>
    );
  }

  if (!form) {
    return (
      <section style={{ padding: '16px', maxWidth: '700px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 className="pf" style={{ fontSize: 26, color: '#F5F0E8', marginBottom: 12 }}>Profil vendeur introuvable</h2>
        <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          Votre profil vendeur n'existe pas encore en base de données.<br />
          Exécutez le SQL de création de profil ou contactez l'administrateur.
        </p>
        <button onClick={signOut} className="btn-o" style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          Déconnexion
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: '16px', maxWidth: '1100px', margin: '80px auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <h2 className="pf" style={{ fontSize: 'clamp(22px,5vw,28px)', margin: 0 }}>Espace Vendeur</h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(201,168,76,.1)',
              border: '1px solid rgba(201,168,76,.4)',
              color: '#C9A84C',
              padding: '5px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 700, letterSpacing: .5,
            }}>
              🚀 Compte Fondateur · Gratuit à vie
            </span>
          </div>
          <p style={{ color: '#9A9A8A', fontSize: 13 }}>
            Connecté en tant que <span style={{ color: '#C9A84C' }}>{user?.email}</span>
          </p>
        </div>
        <button onClick={signOut} className="btn-o" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: activeTab === t.id ? '#C9A84C' : '#6B6B6B', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Analytics Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard icon="📱" label="Clics WhatsApp" value={stats.waClicks} sub="Contacts reçus" color="#4ADE80" live={IS_REAL_SUPABASE} />
            <StatCard icon="👁" label="Vues du profil" value={stats.pageViews} sub="Visites uniques" color="#A78BFA" live={IS_REAL_SUPABASE} />
            <StatCard icon="⭐" label="Note moyenne" value={stats.rating > 0 ? `${stats.rating}/5` : '—'} sub={`${stats.reviews} avis`} live={IS_REAL_SUPABASE} />
            <StatCard icon="💬" label="Avis reçus" value={stats.reviews} sub="Total" live={IS_REAL_SUPABASE} />
            <StatCard icon="📦" label="Produits actifs" value={products.length} sub="Dans votre catalogue" />
          </div>

          {/* View public profile CTA */}
          <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Votre fiche publique</p>
              <p style={{ color: '#6B6B6B', fontSize: 12 }}>Voyez ce que voient vos clients sur O'Samboussa</p>
            </div>
            <Link to={`/vendeur/${user?.id}`}
              style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.4)', color: '#C9A84C', textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Voir mon profil public ↗
            </Link>
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Mes produits ({products.length})</h3>
            {products.length === 0 ? (
              <p style={{ color: '#6B6B6B', fontSize: 13 }}>
                Aucun produit.{' '}
                <button onClick={() => setActiveTab('products')} style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Ajouter →
                </button>
              </p>
            ) : (
              products.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(products.length, 5) - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 14, width: 20 }}>#{i + 1}</span>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#0D0D0D', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🥟</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: '#C9A84C', fontSize: 12 }}>{p.price.toFixed(2)} €</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            {[
              { label: '➕ Ajouter un produit', action: () => setActiveTab('products') },
              { label: '✏️ Modifier le profil', action: () => setActiveTab('profile') },
              { label: '⭐ Voir mes avis', action: () => setActiveTab('reviews') },
            ].map(a => (
              <button key={a.label} onClick={a.action} className="btn-o"
                style={{ padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PROFILE ──────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {saved && (
            <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid #4ADE80', borderRadius: 10, padding: '12px 16px', color: '#4ADE80', fontSize: 13 }}>
              ✔ Profil mis à jour et enregistré dans Supabase.
            </div>
          )}
          {saveError && (
            <div style={{ background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 10, padding: '12px 16px', color: '#FF6B6B', fontSize: 13 }}>
              ✕ {saveError}
            </div>
          )}

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16, color: '#C9A84C' }}>Informations de base</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 14 }}>
              {[
                { label: 'Nom de la boutique', field: 'shop' },
                { label: 'Ville', field: 'city' },
                { label: 'Code postal', field: 'postalCode', placeholder: '75019' },
                { label: 'Arrondissement / Quartier', field: 'district', placeholder: '19e arrondissement' },
                { label: 'Téléphone / WhatsApp', field: 'tel' },
                { label: 'Horaires', field: 'hours', placeholder: 'Lun–Sam 10:00–20:00' },
                { label: 'Instagram (sans @)', field: 'instagram', placeholder: 'ma_boutique' },
              ].map(({ label, field, placeholder }) => (
                <label key={field} style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C' }}>
                  {label}
                  <input value={form[field] || ''} onChange={setField(field)} placeholder={placeholder || ''} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
                </label>
              ))}
            </div>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C', marginTop: 14 }}>
              Description
              <textarea value={form.description || ''} onChange={setField('description')}
                placeholder="Décrivez votre boutique et vos spécialités..."
                style={{ padding: 12, minHeight: 90, borderRadius: 8, fontSize: 14 }} />
            </label>
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14, color: '#C9A84C' }}>Spécialités</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {(form.types || []).map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', color: '#C9A84C', padding: '5px 12px', borderRadius: 20, fontSize: 13 }}>
                  {t}
                  <button onClick={() => removeType(t)} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
              {(form.types || []).length === 0 && <span style={{ color: '#6B6B6B', fontSize: 13 }}>Aucune spécialité ajoutée</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newType} onChange={e => setNewType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addType())}
                placeholder="Ex: Traditionnel, Fromage, Bœuf..."
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
              <button onClick={addType} className="btn-o" style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Ajouter</button>
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14, color: '#C9A84C' }}>Livraison</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={Boolean(form.delivery)} onChange={setField('delivery')}
                style={{ width: 18, height: 18, accentColor: '#C9A84C', cursor: 'pointer' }} />
              <span style={{ fontSize: 14 }}>Livraison disponible</span>
            </label>
            {form.delivery && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C' }}>
                  Délai de livraison
                  <input value={form.deliveryTime || ''} onChange={setField('deliveryTime')} placeholder="Ex: 30–45 min" style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#C9A84C' }}>
                  Zone de livraison
                  <input value={form.deliveryZone || ''} onChange={setField('deliveryZone')} placeholder="Ex: Paris & petite couronne" style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
                </label>
              </div>
            )}
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16, color: '#C9A84C' }}>Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 20 }}>
              <ImagePicker
                label="Logo / Avatar"
                preview={logoPreview}
                currentUrl={form.logo}
                inputRef={logoRef}
                onChange={e => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }}
              />
              <ImagePicker
                label="Photo de couverture"
                preview={coverPreview}
                currentUrl={form.photo}
                inputRef={coverRef}
                onChange={e => { const f = e.target.files?.[0]; if (f) setCoverPreview(URL.createObjectURL(f)); }}
              />
            </div>
            {!IS_REAL_SUPABASE && (
              <p style={{ color: '#FBBF24', fontSize: 12, marginTop: 12 }}>
                ⚠️ Upload inactif (Supabase non configuré — mode démo).
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-g" onClick={saveProfile} disabled={saving}
              style={{ padding: '13px 28px', borderRadius: 10, fontSize: 13, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
              {saving ? 'Enregistrement...' : '✔ Enregistrer dans Supabase'}
            </button>
            <button className="btn-o" onClick={() => { setForm({ ...vendor }); setLogoPreview(null); setCoverPreview(null); }}
              style={{ padding: '13px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6B6B6B', fontSize: 13 }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>🥟</p>
                Aucun produit. Ajoutez votre premier samboussa ci-dessous.
              </div>
            )}
            {products.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 12, background: '#111', padding: 14, borderRadius: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>🥟</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: '#C9A84C', fontSize: 13 }}>{p.price.toFixed(2)} €</div>
                </div>
                <button className="btn-o" onClick={() => deleteProduct(p.id)}
                  style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer', color: '#FF6B6B', borderColor: '#FF6B6B' }}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Ajouter un produit</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 14 }}>
              <input
                placeholder="Nom du produit *"
                value={newProduct.name}
                onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                style={{ padding: 10, borderRadius: 8, fontSize: 14 }}
              />
              <input
                placeholder="Prix (€) *"
                type="number" min="0" step="0.01"
                value={newProduct.price}
                onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                style={{ padding: 10, borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: '#9A9A8A', marginBottom: 8 }}>
                Photos du produit <span style={{ color: '#6B6B6B' }}>(optionnel · JPG, PNG, WebP · max 5 Mo chacune)</span>
              </p>

              {newProductImgPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  {newProductImgPreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#0D0D0D', border: '1px solid rgba(201,168,76,.3)' }}>
                        <img src={url} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {i === 0 && (
                        <span style={{ position: 'absolute', bottom: 3, left: 3, fontSize: 8, background: '#C9A84C', color: '#0A0A0A', padding: '2px 4px', borderRadius: 3, fontWeight: 700, lineHeight: 1.4, letterSpacing: .5 }}>
                          PRINCIPALE
                        </span>
                      )}
                      <button type="button" onClick={() => removeProductImg(i)}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#FF6B6B', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: 0 }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => productImgRef.current?.click()}
                    style={{ width: 80, height: 80, borderRadius: 8, background: '#0D0D0D', border: '1px dashed rgba(201,168,76,.3)', cursor: 'pointer', color: '#C9A84C', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    +
                  </button>
                </div>
              )}

              {newProductImgPreviews.length === 0 && (
                <button type="button" className="btn-o" onClick={() => productImgRef.current?.click()}
                  style={{ padding: '9px 16px', fontSize: 12, borderRadius: 8, cursor: 'pointer' }}>
                  📁 Ajouter des photos
                </button>
              )}

              {newProductImgError && (
                <p style={{ color: '#FF6B6B', fontSize: 11, marginTop: 6 }}>{newProductImgError}</p>
              )}

              <input
                ref={productImgRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={addProductImgs}
              />
            </div>

            {productInsertError && (
              <div style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#F87171', fontSize: 12, lineHeight: 1.6, wordBreak: 'break-all' }}>
                ⚠ {productInsertError}
              </div>
            )}

            <button
              className="btn-g"
              onClick={addProduct}
              disabled={!newProduct.name || !newProduct.price || uploadingImg}
              style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer', opacity: (!newProduct.name || !newProduct.price || uploadingImg) ? .5 : 1 }}
            >
              {uploadingImg ? `⏳ Upload ${newProductImgFiles.length} photo(s)…` : '➕ Ajouter le produit'}
            </button>
          </div>
        </div>
      )}

      {/* ── REVIEWS ──────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div>
          {stats.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#111', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="pf" style={{ fontSize: 48, color: '#C9A84C', fontWeight: 700 }}>{stats.rating}</div>
                <Rating value={stats.rating} size={16} />
                <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 6 }}>{stats.reviews} avis</p>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6B6B6B', fontSize: 13 }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>⭐</p>
                {IS_REAL_SUPABASE ? 'Aucun avis reçu pour l\'instant.' : 'Les avis clients apparaîtront ici.'}
              </div>
            ) : reviews.map(r => (
              <div key={r.id} style={{ background: '#111', padding: 16, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.client_name || 'Anonyme'}</span>
                    <span style={{ color: '#6B6B6B', fontSize: 11, marginLeft: 10 }}>
                      {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <Rating value={r.rating} size={12} />
                </div>
                {r.text && <p style={{ color: '#9A9A8A', fontSize: 13 }}>{r.text}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
