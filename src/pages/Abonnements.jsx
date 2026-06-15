import { Link } from 'react-router-dom';

export default function Abonnements() {
  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="lbl" style={{ marginBottom: 14 }}>Phase de lancement</p>
          <h1 className="pf" style={{ fontSize: 'clamp(30px,5vw,52px)', color: '#F5F0E8', lineHeight: 1.15, marginBottom: 16 }}>
            Rejoignez O'Samboussa<br /><span className="gold-text">gratuitement</span>
          </h1>
          <div className="divg" style={{ maxWidth: 220, margin: '0 auto 20px' }} />
          <p style={{ color: '#6B6B6B', fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Pendant la phase de lancement, l'inscription est entièrement gratuite.<br />
            Les premiers vendeurs rejoignant la plateforme obtiennent un{' '}
            <strong style={{ color: '#C9A84C' }}>Compte Fondateur gratuit à vie</strong>.
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

          <Link to="/devenir-vendeur" className="btn-g"
            style={{ padding: '16px 48px', borderRadius: 12, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Rejoindre gratuitement →
          </Link>
          <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 16 }}>Sans carte bancaire · Sans engagement</p>
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
                r: 'Pendant toute la phase de lancement. Les Comptes Fondateurs garderont leur accès gratuit à vie, même après l\'éventuelle introduction de fonctionnalités payantes.',
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
