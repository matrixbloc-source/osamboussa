import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    color: '#9A9A8A',
    glow: 'rgba(154,154,138,.15)',
    badge: null,
    features: [
      { ok: true, text: 'Jusqu\'à 10 produits' },
      { ok: true, text: 'Profil vendeur complet' },
      { ok: true, text: 'Messagerie clients' },
      { ok: true, text: 'Fiche dans l\'annuaire' },
      { ok: false, text: 'Badge vérifié Premium' },
      { ok: false, text: 'Mise en avant résultats' },
      { ok: false, text: 'Priorité dans les recherches' },
      { ok: false, text: 'Publicité page d\'accueil' },
      { ok: false, text: 'Statistiques avancées' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    color: '#C9A84C',
    glow: 'rgba(201,168,76,.2)',
    badge: '⭐ Populaire',
    features: [
      { ok: true, text: 'Produits illimités' },
      { ok: true, text: 'Profil vendeur complet' },
      { ok: true, text: 'Messagerie clients' },
      { ok: true, text: 'Fiche dans l\'annuaire' },
      { ok: true, text: 'Badge vérifié Premium' },
      { ok: true, text: 'Mise en avant résultats' },
      { ok: false, text: 'Priorité dans les recherches' },
      { ok: false, text: 'Publicité page d\'accueil' },
      { ok: false, text: 'Statistiques avancées' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39.99,
    color: '#E8D5A3',
    glow: 'rgba(232,213,163,.2)',
    badge: '👑 Top vendeur',
    features: [
      { ok: true, text: 'Produits illimités' },
      { ok: true, text: 'Profil vendeur complet' },
      { ok: true, text: 'Messagerie clients' },
      { ok: true, text: 'Fiche dans l\'annuaire' },
      { ok: true, text: 'Badge vérifié Premium' },
      { ok: true, text: 'Mise en avant résultats' },
      { ok: true, text: 'Priorité dans les recherches' },
      { ok: true, text: 'Publicité page d\'accueil' },
      { ok: true, text: 'Statistiques avancées' },
    ],
  },
];

export default function Abonnements() {
  const { user } = useAuth();

  const handleSubscribe = (plan) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }
    // Stripe Checkout — nécessite une clé publishable et un backend
    // loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    alert(`Abonnement ${plan.name} sélectionné. Intégration Stripe à configurer avec votre clé publishable.`);
  };

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="lbl" style={{ marginBottom: 14 }}>Tarifs vendeurs</p>
          <h1 className="pf" style={{ fontSize: 'clamp(30px,5vw,52px)', color: '#F5F0E8', lineHeight: 1.15, marginBottom: 16 }}>
            Choisissez votre<br /><span className="gold-text">formule vendeur</span>
          </h1>
          <div className="divg" style={{ maxWidth: 220, margin: '0 auto 16px' }} />
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Rejoignez la marketplace O'Samboussa et commencez à vendre vos samboussas artisanaux à travers toute la France.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 64 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.id === 'pro' ? `linear-gradient(180deg, rgba(201,168,76,.06), rgba(201,168,76,.02))` : '#111',
              border: `1px solid ${plan.id === 'pro' ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.1)'}`,
              borderRadius: 20,
              padding: 32,
              position: 'relative',
              transition: 'all .3s',
              boxShadow: plan.id === 'pro' ? `0 0 40px ${plan.glow}` : 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${plan.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = plan.id === 'pro' ? `0 0 40px ${plan.glow}` : 'none'; }}>

              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.id === 'pro' ? 'linear-gradient(135deg,#8A6E2F,#C9A84C,#E8D5A3)' : '#1A1A1A', color: plan.id === 'pro' ? '#0A0A0A' : plan.color, padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', border: `1px solid ${plan.color}40` }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <p style={{ color: plan.color, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="pf" style={{ fontSize: 48, fontWeight: 700, color: '#F5F0E8' }}>{plan.price.toFixed(2)}</span>
                  <span style={{ color: '#6B6B6B', fontSize: 14 }}>€/mois</span>
                </div>
              </div>

              <div className="divg" style={{ marginBottom: 24 }} />

              <ul style={{ listStyle: 'none', display: 'grid', gap: 10, marginBottom: 32 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: f.ok ? '#F5F0E8' : '#3A3A3A' }}>
                    <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: f.ok ? 'rgba(74,222,128,.15)' : 'transparent', border: f.ok ? '1px solid #4ADE80' : '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: f.ok ? '#4ADE80' : '#3A3A3A' }}>
                      {f.ok ? '✓' : '✕'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={plan.id === 'pro' ? 'btn-g' : 'btn-o'}
                style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {user ? `Choisir ${plan.name}` : 'Commencer gratuitement'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 20, padding: 32 }}>
          <h2 className="pf" style={{ fontSize: 24, color: '#F5F0E8', marginBottom: 24, textAlign: 'center' }}>Questions fréquentes sur les abonnements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { q: 'Puis-je changer de formule ?', r: 'Oui, à tout moment. Le changement prend effet à la prochaine période de facturation.' },
              { q: 'Puis-je résilier ?', r: 'Oui, sans engagement. La résiliation est effective à la fin de la période en cours.' },
              { q: 'Quel mode de paiement ?', r: 'Carte bancaire (Visa, Mastercard, Amex) via Stripe. Paiement 100% sécurisé.' },
              { q: 'Y a-t-il une période d\'essai ?', r: 'Non, mais vous pouvez commencer avec le pack Basic à 9,99€/mois sans engagement.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ color: '#C9A84C', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{faq.q}</p>
                <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7 }}>{faq.r}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: '#6B6B6B', fontSize: 13 }}>
            Des questions ? <Link to="/support" style={{ color: '#C9A84C', textDecoration: 'none' }}>Consultez notre FAQ</Link> ou <Link to="/contact" style={{ color: '#C9A84C', textDecoration: 'none' }}>contactez-nous</Link>.
          </p>
        </div>

      </div>
    </section>
  );
}
