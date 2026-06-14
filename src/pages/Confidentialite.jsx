import { Link } from 'react-router-dom';

export default function Confidentialite() {
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
          Politique de confidentialité
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 40 }}>Dernière mise à jour : Juin 2025</p>
        <div className="divg" style={{ marginBottom: 40 }} />

        {section('1. Responsable du traitement', <>
          <p>O'SAMBOUSSA, accessible à l'adresse <strong style={{ color: '#F5F0E8' }}>osamboussa.fr</strong>, est responsable du traitement des données personnelles collectées sur cette plateforme.</p>
          <p style={{ marginTop: 8 }}>Contact DPO : <a href="mailto:lalaprods@outlook.fr" style={{ color: '#C9A84C' }}>lalaprods@outlook.fr</a></p>
        </>)}

        {section('2. Données collectées', <>
          <p>Nous collectons les données suivantes :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#F5F0E8' }}>Compte vendeur :</strong> nom, email, numéro de téléphone, nom du commerce, ville</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#F5F0E8' }}>Navigation :</strong> adresse IP, pages visitées, durée de session (données anonymisées)</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#F5F0E8' }}>Formulaire de contact :</strong> nom, email, message</li>
          </ul>
        </>)}

        {section('3. Finalités du traitement', <>
          <p>Vos données sont utilisées pour :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>Gérer votre compte vendeur et votre profil sur la plateforme</li>
            <li style={{ marginBottom: 6 }}>Vous mettre en relation avec des clients potentiels</li>
            <li style={{ marginBottom: 6 }}>Améliorer l'expérience utilisateur de la plateforme</li>
            <li style={{ marginBottom: 6 }}>Répondre à vos demandes de support</li>
          </ul>
        </>)}

        {section('4. Base légale', <>
          <p>Le traitement de vos données repose sur :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>L'exécution du contrat (gestion du compte vendeur)</li>
            <li style={{ marginBottom: 6 }}>Notre intérêt légitime (amélioration du service)</li>
            <li style={{ marginBottom: 6 }}>Votre consentement explicite (communications marketing)</li>
          </ul>
        </>)}

        {section('5. Conservation des données', <>
          <p>Vos données sont conservées pendant la durée de vie de votre compte, et au maximum 3 ans après la dernière activité. Les données de navigation anonymisées sont conservées 13 mois.</p>
        </>)}

        {section('6. Partage des données', <>
          <p>Nous ne vendons jamais vos données. Elles peuvent être partagées avec :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>Supabase (hébergement base de données — UE)</li>
            <li style={{ marginBottom: 6 }}>Les autorités compétentes sur demande légale</li>
          </ul>
        </>)}

        {section('7. Vos droits (RGPD)', <>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>Droit d'accès à vos données personnelles</li>
            <li style={{ marginBottom: 6 }}>Droit de rectification</li>
            <li style={{ marginBottom: 6 }}>Droit à l'effacement ("droit à l'oubli")</li>
            <li style={{ marginBottom: 6 }}>Droit à la portabilité</li>
            <li style={{ marginBottom: 6 }}>Droit d'opposition au traitement</li>
          </ul>
          <p style={{ marginTop: 8 }}>Pour exercer vos droits : <a href="mailto:lalaprods@outlook.fr" style={{ color: '#C9A84C' }}>lalaprods@outlook.fr</a></p>
        </>)}

        {section('8. Cookies', <>
          <p>La plateforme utilise uniquement des cookies techniques nécessaires au bon fonctionnement du service (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
        </>)}

        <div className="divg" style={{ marginTop: 40, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/cgu" style={{ color: '#C9A84C', fontSize: 13, textDecoration: 'none' }}>Conditions générales →</Link>
          <Link to="/contact" style={{ color: '#6B6B6B', fontSize: 13, textDecoration: 'none' }}>Nous contacter →</Link>
        </div>
      </div>
    </section>
  );
}
