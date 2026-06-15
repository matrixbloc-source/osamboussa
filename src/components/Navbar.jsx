import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useVendorStatus } from '../context/VendorContext.jsx';

function FounderBadge({ style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'rgba(201,168,76,.1)',
      border: '1px solid rgba(201,168,76,.4)',
      color: '#C9A84C',
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: .5,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      🚀 Compte Fondateur
    </span>
  );
}

export default function Navbar({ cartCount, setCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const { isVendor, isPendingVendor } = useVendorStatus();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const activePath = location.pathname;

  const baseLinks = [
    { label: 'Vendeurs', to: '/vendeurs' },
    { label: 'Rejoindre gratuitement', to: '/abonnements' },
  ];

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
            {baseLinks.map(link => (
              <Link key={link.to} to={link.to} className={`navlink ${activePath === link.to ? 'act' : ''}`} style={{ padding: 6, display: 'inline-block' }}>
                {link.label}
              </Link>
            ))}

            {/* Devenir vendeur / badge en attente / badge actif */}
            {isVendor ? (
              <Link to="/espace-vendeur" style={{ textDecoration: 'none' }}>
                <FounderBadge />
              </Link>
            ) : isPendingVendor ? (
              <Link to="/espace-vendeur" style={{ textDecoration: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.35)', color: '#FBBF24', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .5, whiteSpace: 'nowrap' }}>
                  ⏳ Validation en cours
                </span>
              </Link>
            ) : (
              <Link to="/devenir-vendeur" className={`navlink ${activePath === '/devenir-vendeur' ? 'act' : ''}`} style={{ padding: 6 }}>
                Devenir vendeur
              </Link>
            )}

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

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {(isVendor || isPendingVendor) && (
                    <Link to="/espace-vendeur" className="btn-g" style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>Mon espace</Link>
                  )}
                  <button onClick={signOut} className="navlink" style={{ fontSize: 11, padding: '7px 10px' }}>Déco.</button>
                </div>
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

          {/* Badge vendeur prominent dans le menu mobile */}
          {isVendor && (
            <Link to="/espace-vendeur" onClick={() => setMenu(false)} style={{ textDecoration: 'none' }}>
              <FounderBadge style={{ fontSize: 14, padding: '8px 20px' }} />
            </Link>
          )}

          {/* Badge vendeur en attente dans menu mobile */}
          {isPendingVendor && !isVendor && (
            <Link to="/espace-vendeur" onClick={() => setMenu(false)} style={{ textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.35)', color: '#FBBF24', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                ⏳ Candidature en cours de validation
              </span>
            </Link>
          )}

          {[
            { label: 'Vendeurs', to: '/vendeurs' },
            ...(!isVendor && !isPendingVendor ? [{ label: 'Devenir vendeur', to: '/devenir-vendeur' }] : []),
            { label: 'Rejoindre gratuitement', to: '/abonnements' },
            { label: 'Contact', to: '/contact' },
            { label: 'Support', to: '/support' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="navlink" style={{ fontSize: 16, letterSpacing: 2 }} onClick={() => setMenu(false)}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', gap: 10 }}>
              {(isVendor || isPendingVendor) && (
                <Link to="/espace-vendeur" onClick={() => setMenu(false)} className="btn-g" style={{ padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>Mon espace</Link>
              )}
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
