import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(user) {
  if (!user) return false;
  // Supabase auth metadata role (set in Supabase dashboard → Auth → Users)
  if (user.user_metadata?.role === 'admin') return true;
  // Fallback: email whitelist via env variable
  return ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
}

export default function RequireAdmin({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin(user)) {
    return (
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0A0A0A' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
          <h1 className="pf" style={{ fontSize: 'clamp(24px,5vw,32px)', color: '#F5F0E8', marginBottom: 12 }}>
            Accès refusé
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Vous n'avez pas les droits d'accès à cette page.<br />
            Seuls les administrateurs O'Samboussa peuvent accéder au panneau d'administration.
          </p>
          <Link to="/vendeurs" className="btn-g" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Retour à l'accueil
          </Link>
          <p style={{ color: '#6B6B6B', fontSize: 12, marginTop: 20 }}>
            Connecté en tant que : <span style={{ color: '#C9A84C' }}>{user.email}</span>
          </p>
        </div>
      </section>
    );
  }

  return children;
}
