import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    cat: 'Devenir vendeur',
    items: [
      {
        q: 'Comment devenir vendeur sur O\'Samboussa ?',
        a: 'Remplissez le formulaire sur la page "Devenir vendeur" avec vos informations (nom, ville, spécialités, photos). Notre équipe examine votre candidature sous 48h. Une fois validé, vous choisissez votre abonnement et activez votre profil.',
      },
      {
        q: 'Comment fonctionne l\'abonnement vendeur ?',
        a: 'Trois formules : Basic (9,99€/mois — 10 produits), Pro (19,99€/mois — produits illimités + badge Premium), Premium (39,99€/mois — priorité recherche + publicité page d\'accueil + statistiques avancées). Le paiement est mensuel et résiliable à tout moment.',
      },
      {
        q: 'Comment recevoir les paiements de mes clients ?',
        a: 'Les clients vous contactent directement via WhatsApp ou la messagerie intégrée. Vous gérez le paiement de manière indépendante (virement, Lydia, espèces, PayPal…). O\'Samboussa est une plateforme de mise en relation, pas un intermédiaire de paiement.',
      },
      {
        q: 'Comment modifier son profil vendeur ?',
        a: 'Connectez-vous à votre espace vendeur avec vos identifiants, puis accédez à l\'onglet "Profil". Vous pouvez modifier votre logo, vos photos, votre description, vos horaires, votre zone de livraison et vos produits en temps réel.',
      },
    ],
  },
  {
    cat: 'Commandes & Livraison',
    items: [
      {
        q: 'Comment contacter un vendeur ?',
        a: 'Sur la fiche de chaque vendeur, cliquez sur "Contacter sur WhatsApp" pour une réponse rapide, ou utilisez notre messagerie intégrée via le bouton "Envoyer un message". La plupart des vendeurs répondent dans l\'heure.',
      },
      {
        q: 'Comment fonctionne la livraison ?',
        a: 'Chaque vendeur définit sa propre zone de livraison et ses délais. Certains proposent la livraison à domicile, d\'autres uniquement le retrait sur place. Ces informations sont indiquées sur chaque fiche vendeur. Pour les grandes commandes, certains vendeurs proposent l\'expédition nationale en colis réfrigéré.',
      },
    ],
  },
  {
    cat: 'Support & Signalements',
    items: [
      {
        q: 'Comment signaler un problème ?',
        a: 'Pour signaler un vendeur, une commande litigieuse ou un contenu inapproprié, contactez-nous directement par email à lalaprods@outlook.fr ou par téléphone au +33 6 63 98 23 27. Nous traitons tous les signalements sous 24h.',
      },
    ],
  },
];

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.12)'}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: 'rgba(255,255,255,.02)', border: 'none', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 }}>
        <span style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 500, textAlign: 'left', lineHeight: 1.5 }}>{q}</span>
        <span style={{ color: '#C9A84C', fontSize: 20, flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', color: '#9A9A8A', fontSize: 14, lineHeight: 1.8, borderTop: '1px solid rgba(201,168,76,.06)' }}>
          <p style={{ paddingTop: 14 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="lbl" style={{ marginBottom: 14 }}>Centre d'aide</p>
          <h1 className="pf" style={{ fontSize: 'clamp(30px,5vw,48px)', color: '#F5F0E8', marginBottom: 12 }}>
            <span className="gold-text">Support O'Samboussa</span>
          </h1>
          <div className="divg" style={{ maxWidth: 200, margin: '0 auto 16px' }} />
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.7 }}>Trouvez les réponses à vos questions ou contactez notre équipe.</p>
        </div>

        {FAQS.map(cat => (
          <div key={cat.cat} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>{cat.cat}</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {cat.items.map(item => <Accordion key={item.q} q={item.q} a={item.a} />)}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 56, background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <p className="pf" style={{ fontSize: 22, color: '#F5F0E8', marginBottom: 8 }}>Vous n'avez pas trouvé votre réponse ?</p>
          <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 24 }}>Notre équipe répond sous 24h du lundi au dimanche.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:lalaprods@outlook.fr" className="btn-g" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ✉️ Envoyer un email
            </a>
            <a href="tel:+33663982327" className="btn-o" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              📞 Appeler
            </a>
            <Link to="/contact" className="btn-o" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Page Contact →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
