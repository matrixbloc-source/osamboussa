import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessages } from '../context/MessagesContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Navbar({ cartCount, setCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { totalUnread } = useMessages();
  const { favorites } = useFavorites();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Vendeurs', to: '/vendeurs' },
    { label: 'Devenir vendeur', to: '/devenir-vendeur' },
    { label: 'Abonnements', to: '/abonnements' },
  ];

  const activePath = location.pathname;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 34, left: 0, right: 0, zIndex: 900,
        background: scrolled ? 'rgba(10,10,10,.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,.1)' : 'none',
        transition: 'all .4s', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/vendeurs" style={{ textDecoration: 'none' }}>
            <span className="pf gold-shimmer" style={{ fontSize: 21, fontWeight: 700, letterSpacing: 2, color: '#F5F0E8' }}>O'SAMBOUSSA</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links-desktop" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} className={`navlink ${activePath === link.to ? 'act' : ''}`} style={{ padding: 6, display: 'inline-block' }}>
                {link.label}
              </Link>
            ))}
            <a href="https://www.instagram.com/osamboussa_marseille?igsh=ZW81emM5MzkyNGZ4&utm_source=qr"
              target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'linear-gradient(135deg,#833ab430,#fd1d1d30,#fcb04530)', border: '1px solid rgba(253,29,29,.35)', color: '#fcb045', fontSize: 11, letterSpacing: 1, fontWeight: 600, textDecoration: 'none', transition: 'all .3s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#833ab460,#fd1d1d60,#fcb04560)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#833ab430,#fd1d1d30,#fcb04530)'; e.currentTarget.style.transform = 'none'; }}>
              <span>📸</span><span>Instagram</span>
            </a>
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Favorites */}
            <Link to="/vendeurs?tab=fav" style={{ position: 'relative', background: 'none', border: '1px solid rgba(201,168,76,.3)', padding: '7px 12px', borderRadius: 8, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, transition: 'all .3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.background = 'rgba(201,168,76,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'; e.currentTarget.style.background = 'none'; }}>
              ❤️
              {favorites.length > 0 && <span style={{ background: '#EF4444', color: '#fff', borderRadius: '50%', width: 17, height: 17, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{favorites.length}</span>}
            </Link>

            {/* Messages */}
            <Link to="/messagerie" style={{ position: 'relative', background: 'none', border: '1px solid rgba(201,168,76,.3)', padding: '7px 12px', borderRadius: 8, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, transition: 'all .3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.background = 'rgba(201,168,76,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'; e.currentTarget.style.background = 'none'; }}>
              💬
              {totalUnread > 0 && <span style={{ background: '#C9A84C', color: '#0A0A0A', borderRadius: '50%', width: 17, height: 17, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalUnread}</span>}
            </Link>

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Link to="/espace-vendeur" className="btn-g" style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>Mon espace</Link>
                <button onClick={signOut} className="navlink" style={{ fontSize: 11, padding: '7px 10px' }}>Déco.</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <Link to="/login" className="btn-o" style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>Connexion</Link>
                <Link to="/register" className="btn-g" style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>S'inscrire</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="sm" onClick={() => setMenu(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C9A84C', fontSize: 22, padding: '4px 6px' }}>☰</button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menu && (
        <div style={{ position: 'fixed', inset: 0, background: '#0A0A0A', zIndex: 998, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, animation: 'fadeIn .3s ease', padding: 24 }}>
          <button onClick={() => setMenu(false)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#C9A84C', fontSize: 28, cursor: 'pointer' }}>✕</button>
          <Link to="/vendeurs" style={{ textDecoration: 'none' }} onClick={() => setMenu(false)}>
            <span className="pf gold-shimmer" style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>O'SAMBOUSSA</span>
          </Link>
          {[...links, { label: 'Contact', to: '/contact' }, { label: 'Support', to: '/support' }].map(link => (
            <Link key={link.to} to={link.to} className="navlink" style={{ fontSize: 16, letterSpacing: 2 }} onClick={() => setMenu(false)}>
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Link to="/messagerie" onClick={() => setMenu(false)} className="btn-o" style={{ padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>
              💬 {totalUnread > 0 ? `Messages (${totalUnread})` : 'Messages'}
            </Link>
          </div>
          {user ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/espace-vendeur" onClick={() => setMenu(false)} className="btn-g" style={{ padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>Mon espace</Link>
              <button onClick={() => { signOut(); setMenu(false); }} className="btn-o" style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" onClick={() => setMenu(false)} className="btn-o" style={{ padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>Connexion</Link>
              <Link to="/register" onClick={() => setMenu(false)} className="btn-g" style={{ padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>S'inscrire</Link>
            </div>
          )}
          <a href="https://www.instagram.com/osamboussa_marseille?igsh=ZW81emM5MzkyNGZ4&utm_source=qr" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 24, background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 1 }}>
            <span>📸</span><span>@osamboussa_marseille</span>
          </a>
        </div>
      )}
    </>
  );
}
