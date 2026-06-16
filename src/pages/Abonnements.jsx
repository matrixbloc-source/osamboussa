import { Link } from 'react-router-dom';
import { useFounderCount } from '../lib/useFounderCount.js';

export default function Abonnements() {
  const { remaining, isFull, loading, limit, pct } = useFounderCount();

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="lbl" style={{ marginBottom: 14 }}>Phase de lancement</p>
          <h1 className="pf" style={{ fontSize: 'clamp(30px,5vw,52px)', color: '#F5F0E8', lineHeight: 1.15, marginBottom: 16 }}>
            🎁 <span className="gold-text">Offre Fondateur</span>
          </h1>
          <div className="divg" style={{ maxWidth: 220, margin: '0 auto 20px' }} />
          <p style={{ color: '#6B6B6B', fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Les {limit} premiers vendeurs rejoignant O'Samboussa obtiennent un{' '}
            <strong style={{ color: '#C9A84C' }}>Compte Fondateur gratuit à vie</strong>.
          </p>
        </div>

        {/* Dynamic founder counter */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(201,168,76,.07),rgba(201,168,76,.03))',
          border: '1px solid rgba(201,168,76,.28)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 32, textAlign: 'center',
          animation: 'founder-pulse 3s ease-in-out infinite',
        }}>
          <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
            Places fondateurs
          </p>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: 'rgba(201,168,76,.3)', fontFamily: "'Playfair Display',serif" }}>—</span>
              <span style={{ fontSize: 20, color: '#3A3A3A' }}>/ {limit}</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 56, fontWeight: 700, color: isFull ? '#EF4444' : '#C9A84C', fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
                  {isFull ? '0' : remaining}
                </span>
                <span style={{ fontSize: 20, color: '#5A5A5A' }}>/ {limit}</span>
              </div>
              <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 16 }}>
                {isFull
                  ? 'Toutes les places fondateurs sont prises.'
                  : `place${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`}
              </p>
            </>
          )}

          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 100, height: 8, overflow: 'hidden', marginBottom: 12, maxWidth: 340, margin: '0 auto 12px' }}>
            <div style={{
              height: '100%', borderRadius: 100,
              background: isFull ? '#EF4444' : 'linear-gradient(90deg,#8A6E2F,#C9A84C)',
              width: loading ? '0%' : `${pct}%`,
              transition: 'width 1.2s ease',
            }} />
          </div>
          <p style={{ fontSize: 11, color: '#3A3A3A', letterSpacing: .5 }}>
            {loading ? '' : `${pct}% des places utilisées`}
          </p>
        </div>

        {/* Founder card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,.08), rgba(232,213,163,.04))',
          border: '1px solid rgba(201,168,76,.35)',
          borderRadius: 24, padding: 48, textAlign: 'center', marginBottom: 40,
        }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🚀</div>
          <h2 className="pf" style={{ fontSize: 36, color: '#F5F0E8', marginBottom: 10 }}>Compte Fondateur</h2>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 18, marginBottom: 32, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Gratuit à vie
          </p>

          <ul style={{ listStyle: 'none', display: 'inline-grid', gap: 14, marginBottom: 36, textAlign: 'left' }}>
            {[
              'Fiche vendeur complète avec photos',
              'Produits illimités dans votre catalogue',
              'Contact WhatsApp direct avec les clients',
              'Visibilité dans toutes les villes de France',
              'Badge Compte Fondateur exclusif',
              'Accès prioritaire aux futures fonctionnalités',
            ].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#F5F0E8' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(74,222,128,.15)', border: '1px solid #4ADE80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#4ADE80', flexShrink: 0,
                }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {isFull ? (
            <>
              <div style={{ background: 'rgba(255,100,100,.06)', border: '1px solid rgba(255,100,100,.18)', borderRadius: 12, padding: '12px 20px', marginBottom: 16 }}>
                <p style={{ color: 'rgba(255,160,160,.8)', fontSize: 13 }}>
                  Les 50 places fondateurs sont épuisées. Des tarifs réguliers seront annoncés prochainement.
                </p>
              </div>
              <Link to="/contact" className="btn-o"
                style={{ padding: '14px 36px', borderRadius: 12, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
                Rejoindre la liste d'attente →
              </Link>
            </>
          ) : (
            <>
              <Link to="/devenir-vendeur" className="btn-g"
                style={{ padding: '16px 48px', borderRadius: 12, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
                🎁 Rejoindre l'Offre Fondateur →
              </Link>
              <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 16 }}>Sans carte bancaire · Sans engagement · {remaining} place{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}</p>
            </>
          )}
        </div>

        {/* FAQ */}
        <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 16, padding: 28 }}>
          <h3 className="pf" style={{ fontSize: 20, color: '#F5F0E8', marginBottom: 20, textAlign: 'center' }}>
            Questions fréquentes
          </h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              {
                q: 'Jusqu\'à quand est-ce gratuit ?',
                r: `Pendant toute la phase de lancement pour les ${limit} premiers vendeurs. Les Comptes Fondateurs garderont leur accès gratuit à vie, même après l'introduction de fonctionnalités payantes.`,
              },
              {
                q: 'Faut-il une carte bancaire ?',
                r: 'Non. L\'inscription est 100% gratuite, sans carte bancaire, sans engagement, sans conditions cachées.',
              },
              {
                q: 'Que se passe-t-il après la phase de lancement ?',
                r: 'Des fonctionnalités avancées pourront être introduites sous forme d\'options payantes. Les Comptes Fondateurs conserveront à vie les fonctionnalités actuelles sans frais.',
              },
              {
                q: 'Comment m\'inscrire ?',
                r: 'Remplissez le formulaire "Devenir vendeur". Notre équipe examine votre candidature sous 48h et valide votre profil.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ color: '#C9A84C', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{faq.q}</p>
                <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7 }}>{faq.r}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ color: '#6B6B6B', fontSize: 13 }}>
            Des questions ?{' '}
            <Link to="/contact" style={{ color: '#C9A84C', textDecoration: 'none' }}>Contactez-nous</Link>
          </p>
        </div>

      </div>
    </section>
  );
}
