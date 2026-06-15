import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [done, setDone]         = useState(false);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    // Supabase émet PASSWORD_RECOVERY quand l'utilisateur arrive depuis le lien email
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6)  { setError('Minimum 6 caractères.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  if (done) {
    return (
      <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(74,222,128,.3)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h1 className="pf" style={{ fontSize: 28, marginBottom: 12, color: '#4ADE80' }}>Mot de passe mis à jour !</h1>
          <p style={{ color: '#9A9A8A', fontSize: 14, lineHeight: 1.8 }}>
            Vous allez être redirigé vers la page de connexion…
          </p>
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>⏳</div>
          <p style={{ color: '#9A9A8A', fontSize: 14, marginBottom: 12 }}>
            Vérification du lien de réinitialisation…
          </p>
          <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.7 }}>
            Si cette page reste bloquée, votre lien a peut-être expiré.{' '}
            <Link to="/reset-password" style={{ color: '#C9A84C', textDecoration: 'none' }}>
              Recommencer →
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32 }}>
        <h1 className="pf" style={{ fontSize: 'clamp(24px,5vw,32px)', marginBottom: 12, color: '#F5F0E8' }}>
          Nouveau mot de passe
        </h1>
        <p style={{ color: '#9A9A8A', marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Nouveau mot de passe
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              autoFocus
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Répétez votre mot de passe"
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
            disabled={loading}
            style={{ padding: '14px 18px', fontSize: 13, borderRadius: 10, display: 'flex', justifyContent: 'center' }}
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </section>
  );
}
