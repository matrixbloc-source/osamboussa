import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function ResetPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(74,222,128,.3)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h1 className="pf" style={{ fontSize: 28, marginBottom: 12, color: '#F5F0E8' }}>Email envoyé !</h1>
          <p style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
            Un lien de réinitialisation a été envoyé à{' '}
            <span style={{ color: '#C9A84C' }}>{email}</span>.
          </p>
          <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
            Cliquez sur le lien dans le mail pour créer un nouveau mot de passe.<br />
            Pensez à vérifier votre dossier <strong style={{ color: '#9A9A8A' }}>Spam</strong>.
          </p>
          <Link to="/login" className="btn-o" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            ← Retour à la connexion
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32 }}>
        <h1 className="pf" style={{ fontSize: 'clamp(24px,5vw,32px)', marginBottom: 12, color: '#F5F0E8' }}>
          Mot de passe oublié
        </h1>
        <p style={{ color: '#9A9A8A', marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
          Entrez votre adresse email — nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Adresse email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemple@domaine.com"
              required
              autoFocus
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
            disabled={loading}
            style={{ padding: '14px 18px', fontSize: 13, borderRadius: 10, display: 'flex', justifyContent: 'center' }}
          >
            {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#C9A84C', fontSize: 13, textDecoration: 'none' }}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  );
}
