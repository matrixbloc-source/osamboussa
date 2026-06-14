import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Impossible de se connecter.');
      return;
    }

    navigate('/espace-vendeur');
  };

  return (
    <section style={{minHeight:'100vh',padding:'120px 24px 60px',background:'#0A0A0A'}}>
      <div style={{maxWidth:520,margin:'0 auto',background:'#111',border:'1px solid rgba(201,168,76,.2)',borderRadius:20,padding:32}}>
        <h1 className="pf" style={{fontSize:'clamp(28px,5vw,36px)',marginBottom:16,color:'#F5F0E8'}}>Connexion vendeur</h1>
        <p style={{color:'#9A9A8A',marginBottom:24,lineHeight:1.7}}>Connectez-vous avec votre adresse email pour accéder à votre espace vendeur.</p>

        <form onSubmit={handleSubmit} style={{display:'grid',gap:16}}>
          <label style={{display:'grid',gap:8,fontSize:13,color:'#C9A84C'}}>Email
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="exemple@domaine.com" required style={{padding:12,borderRadius:10}} />
          </label>
          <label style={{display:'grid',gap:8,fontSize:13,color:'#C9A84C'}}>Mot de passe
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required style={{padding:12,borderRadius:10}} />
          </label>
          {error && <div style={{color:'#FF6B6B',fontSize:13}}>{error}</div>}
          <button type="submit" className="btn-g" style={{padding:'14px 18px',fontSize:13,display:'inline-flex',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{marginTop:24,color:'#9A9A8A',fontSize:13}}>
          Nouveau vendeur ? <Link to="/register" style={{color:'#C9A84C',textDecoration:'none'}}>Créer un compte</Link>
        </div>
      </div>
    </section>
  );
}
