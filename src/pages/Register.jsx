import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Impossible de créer le compte.');
      return;
    }

    // If session returned immediately (autoconfirm on), redirect home
    if (data?.session) {
      navigate('/');
      return;
    }

    // Email confirmation required
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
            Cliquez sur le lien pour activer votre compte.<br />
            Vérifiez aussi votre dossier <strong style={{ color: '#9A9A8A' }}>Spam</strong>.
          </p>
          <Link to="/login" className="btn-g" style={{ padding: '13px 32px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Aller à la connexion →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32 }}>
        <h1 className="pf" style={{ fontSize: 'clamp(28px,5vw,36px)', marginBottom: 16, color: '#F5F0E8' }}>
          Créer un compte
        </h1>
        <p style={{ color: '#9A9A8A', marginBottom: 24, lineHeight: 1.7 }}>
          Créez un compte pour contacter les vendeurs et gérer vos favoris.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="exemple@domaine.com"
              required
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Mot de passe
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Minimum 6 caractères"
              required
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Confirmer le mot de passe
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="••••••••"
              required
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>

          {error && (
            <div style={{ color: '#FF6B6B', fontSize: 13, background: 'rgba(255,107,107,.08)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-g"
            style={{ padding: '14px 18px', fontSize: 13, display: 'inline-flex', justifyContent: 'center', borderRadius: 10 }}
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ marginTop: 24, color: '#9A9A8A', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>Se connecter</Link>
          </span>
          <div style={{ marginTop: 8, padding: '12px 16px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 10 }}>
            <p style={{ color: '#9A9A8A', fontSize: 12, lineHeight: 1.7 }}>
              Vous souhaitez <strong style={{ color: '#C9A84C' }}>vendre vos samboussas</strong> sur la plateforme ?{' '}
              <Link to="/devenir-vendeur" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>
                Candidatez ici →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
