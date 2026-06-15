import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <div style={{ color: '#C9A84C', fontSize: 14 }}>Chargement…</div>
    </section>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
