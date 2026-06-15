import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setUnconfirmed(false);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      const msg = signInError.message || '';
      const code = signInError.code || signInError.error_code || '';
      if (
        code === 'email_not_confirmed' ||
        msg.toLowerCase().includes('not confirmed') ||
        (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm'))
      ) {
        setUnconfirmed(true);
      } else {
        setError(msg || 'Identifiants incorrects. Vérifiez votre email et mot de passe.');
      }
      return;
    }

    // Redirect to ?redirect= param if present, otherwise home
    const redirect = searchParams.get('redirect');
    navigate(redirect || '/');
  };

  return (
    <section style={{ minHeight: '100vh', padding: '120px 24px 60px', background: '#0A0A0A' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111', border: '1px solid rgba(201,168,76,.2)', borderRadius: 20, padding: 32 }}>
        <h1 className="pf" style={{ fontSize: 'clamp(28px,5vw,36px)', marginBottom: 16, color: '#F5F0E8' }}>
          Connexion
        </h1>
        <p style={{ color: '#9A9A8A', marginBottom: 24, lineHeight: 1.7 }}>
          Connectez-vous avec votre adresse email pour accéder à votre espace.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@domaine.com"
              required
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>
          <label style={{ display: 'grid', gap: 8, fontSize: 13, color: '#C9A84C' }}>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ padding: 12, borderRadius: 10 }}
            />
          </label>

          {unconfirmed && (
            <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ color: '#FBBF24', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📧 Email non confirmé</p>
              <p style={{ color: '#9A9A8A', fontSize: 12, lineHeight: 1.7 }}>
                Vérifiez votre boîte mail et cliquez sur le lien de confirmation.<br />
                Pensez à vérifier le dossier <strong>Spam</strong>.
              </p>
            </div>
          )}

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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: 24, color: '#9A9A8A', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>
            <Link to="/reset-password" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: 12 }}>
              Mot de passe oublié ?
            </Link>
          </span>
          <span>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>Créer un compte</Link>
          </span>
          <span>
            Vendeur ? Candidatez sur{' '}
            <Link to="/devenir-vendeur" style={{ color: '#C9A84C', textDecoration: 'none' }}>Devenir vendeur</Link>
          </span>
        </div>
      </div>
    </section>
  );
}
