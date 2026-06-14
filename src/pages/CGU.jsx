import { Link } from 'react-router-dom';

export default function CGU() {
  const section = (title, children) => (
    <div style={{ marginBottom: 36 }}>
      <h2 className="pf" style={{ fontSize: 'clamp(18px,3vw,22px)', color: '#C9A84C', marginBottom: 12 }}>{title}</h2>
      <div style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.9 }}>{children}</div>
    </div>
  );

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p className="lbl" style={{ marginBottom: 12 }}>Légal</p>
        <h1 className="pf" style={{ fontSize: 'clamp(28px,5vw,42px)', color: '#F5F0E8', marginBottom: 8 }}>
          Conditions générales d'utilisation
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 40 }}>Dernière mise à jour : Juin 2025</p>
        <div className="divg" style={{ marginBottom: 40 }} />

        {section('1. Objet', <>
          <p>Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme O'SAMBOUSSA, marketplace dédiée aux vendeurs de samboussas et spécialités comoriennes artisanales.</p>
        </>)}

        {section('2. Accès à la plateforme', <>
          <p>L'accès à la plateforme est libre pour les visiteurs. La création d'un compte vendeur est réservée aux professionnels et artisans souhaitant référencer leurs produits. Tout compte doit être créé avec des informations exactes et à jour.</p>
        </>)}

        {section('3. Rôle de la plateforme', <>
          <p>O'SAMBOUSSA est une plateforme de mise en relation entre vendeurs artisanaux et clients. Nous ne sommes pas vendeurs directs des produits listés. Les transactions et engagements contractuels se font directement entre les vendeurs et leurs clients.</p>
        </>)}

        {section('4. Obligations des vendeurs', <>
          <p>Les vendeurs s'engagent à :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>Fournir des informations exactes sur leurs produits et services</li>
            <li style={{ marginBottom: 6 }}>Respecter la législation en vigueur concernant la vente de denrées alimentaires</li>
            <li style={{ marginBottom: 6 }}>Maintenir leurs informations de contact à jour</li>
            <li style={{ marginBottom: 6 }}>Ne pas proposer de produits illicites ou dangereux</li>
          </ul>
        </>)}

        {section('5. Propriété intellectuelle', <>
          <p>Le nom O'SAMBOUSSA, le logo et l'ensemble des contenus de la plateforme sont protégés par les droits de propriété intellectuelle. Toute reproduction sans autorisation est interdite.</p>
        </>)}

        {section('6. Limitation de responsabilité', <>
          <p>O'SAMBOUSSA ne saurait être tenu responsable des informations fournies par les vendeurs, des transactions effectuées entre vendeurs et clients, ni des problèmes liés à la qualité ou à la livraison des produits.</p>
        </>)}

        {section('7. Modification des CGU', <>
          <p>O'SAMBOUSSA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par mise à jour de la date en haut de cette page.</p>
        </>)}

        {section('8. Contact', <>
          <p>Pour toute question relative aux présentes CGU, contactez-nous à <a href="mailto:lalaprods@outlook.fr" style={{ color: '#C9A84C' }}>lalaprods@outlook.fr</a>.</p>
        </>)}

        <div className="divg" style={{ marginTop: 40, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/confidentialite" style={{ color: '#C9A84C', fontSize: 13, textDecoration: 'none' }}>Politique de confidentialité →</Link>
          <Link to="/contact" style={{ color: '#6B6B6B', fontSize: 13, textDecoration: 'none' }}>Nous contacter →</Link>
        </div>
      </div>
    </section>
  );
}
