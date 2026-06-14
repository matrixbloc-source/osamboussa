import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirm: '', shop: '', city: '', phone: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp({
      email: form.email,
      password: form.password,
      shop: form.shop,
      city: form.city,
      phone: form.phone,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message || "Impossible de créer le compte.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📧</div>
          <h1 className="pf" style={{ fontSize: 'clamp(24px,5vw,32px)', color: '#F5F0E8', marginBottom: 16 }}>
            Vérifiez votre email
          </h1>
          <p style={{ color: '#9A9A8A', lineHeight: 1.8, marginBottom: 8 }}>
            Un lien de confirmation a été envoyé à
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 15, marginBottom: 24 }}>
            {form.email}
          </p>
          <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.8, marginBottom: 32 }}>
            Cliquez sur le lien dans l'email pour activer votre compte.<br />
            Vérifiez aussi votre dossier <strong style={{ color: '#9A9A8A' }}>Spam / Courriers indésirables</strong>.
          </p>
          <Link to="/login" className="btn-g" style={{ padding: '13px 32px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Aller à la connexion →
          </Link>
        </div>
      </section>
    );
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <label key={key} style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
      {label}
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        required={key !== 'phone'}
        style={{ padding: 12, borderRadius: 10 }}
      />
    </label>
  );

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32 }}>
        <h1 className="pf" style={{ fontSize: 'clamp(28px,5vw,36px)', marginBottom: 16, color: '#F5F0E8' }}>
          Créer un compte vendeur
        </h1>
        <p style={{ color: '#9A9A8A', marginBottom: 24, lineHeight: 1.7 }}>
          Rejoignez la plateforme O'Samboussa et commencez à vendre vos samboussas artisanaux.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {field('Nom de la boutique', 'shop', 'text', 'Ma Boutique Samboussa')}
          {field('Ville', 'city', 'text', 'Marseille')}
          {field('Téléphone / WhatsApp', 'phone', 'tel', '+33 6 XX XX XX XX')}
          {field('Email', 'email', 'email', 'exemple@domaine.com')}
          {field('Mot de passe', 'password', 'password', '••••••••')}
          {field('Confirmer le mot de passe', 'confirm', 'password', '••••••••')}
          {error && <div style={{ color: '#FF6B6B', fontSize: 13, background: 'rgba(255,107,107,.08)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,.2)' }}>{error}</div>}
          <button
            type="submit"
            className="btn-g"
            style={{ padding: '14px 18px', fontSize: 13, display: 'inline-flex', justifyContent: 'center', borderRadius: 10 }}
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ marginTop: 24, color: '#9A9A8A', fontSize: 13 }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>Se connecter</Link>
        </div>
      </div>
    </section>
  );
}
