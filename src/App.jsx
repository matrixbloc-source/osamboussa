import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartPanel from "./components/CartPanel.jsx";
import Vendeurs from "./pages/Vendeurs.jsx";
import Vendeur from "./pages/Vendeur.jsx";
import DevenirVendeur from "./pages/DevenirVendeur.jsx";
import Villes from "./pages/Villes.jsx";
import EspaceVendeur from "./pages/EspaceVendeur.jsx";
import Admin from "./pages/Admin.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CGU from "./pages/CGU.jsx";
import Confidentialite from "./pages/Confidentialite.jsx";
import Support from "./pages/Support.jsx";
import Abonnements from "./pages/Abonnements.jsx";
import VilleSamboussas from "./pages/VilleSamboussas.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import { VendorProvider } from "./context/VendorContext.jsx";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;overflow-x:hidden;width:100%}
  body{background:#0A0A0A;color:#F5F0E8;font-family:'Inter',sans-serif;overflow-x:hidden;width:100%}
  #root{overflow-x:hidden;width:100%}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#0A0A0A}
  ::-webkit-scrollbar-thumb{background:#8A6E2F;border-radius:3px}
  .pf{font-family:'Playfair Display',serif}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideLeft{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
  .gold-text{background:linear-gradient(135deg,#C9A84C 0%,#E8D5A3 50%,#C9A84C 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .gold-shimmer{background:linear-gradient(90deg,#C9A84C,#E8D5A3,#C9A84C);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .btn-g{background:linear-gradient(135deg,#8A6E2F,#C9A84C,#E8D5A3,#C9A84C);background-size:300% 300%;border:none;cursor:pointer;transition:all .3s;font-family:'Inter',sans-serif;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#0A0A0A}
  .btn-g:hover{background-position:right center;transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,.4)}
  .btn-o{background:transparent;border:1px solid #C9A84C;color:#C9A84C;cursor:pointer;transition:all .3s;font-family:'Inter',sans-serif;font-weight:500;letter-spacing:1px}
  .btn-o:hover{background:rgba(201,168,76,.1);box-shadow:0 0 18px rgba(201,168,76,.2)}
  .navlink{color:#6B6B6B;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;transition:color .3s;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif}
  .navlink:hover,.navlink.act{color:#C9A84C}
  .divg{height:1px;background:linear-gradient(90deg,transparent,#C9A84C,transparent)}
  .lbl{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;font-weight:500}
  .qbtn{width:28px;height:28px;border:1px solid rgba(201,168,76,.4);background:transparent;color:#C9A84C;cursor:pointer;border-radius:4px;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .qbtn:hover{background:rgba(201,168,76,.15);border-color:#C9A84C}
  input,textarea,select{background:#1A1A1A;border:1px solid rgba(201,168,76,.2);color:#F5F0E8;font-family:'Inter',sans-serif;transition:border-color .3s;outline:none;width:100%}
  input:focus,textarea:focus,select:focus{border-color:#C9A84C;box-shadow:0 0 12px rgba(201,168,76,.1)}
  input::placeholder,textarea::placeholder{color:#6B6B6B}
  select option{background:#1A1A1A;color:#F5F0E8}
  .nav-links-desktop{display:flex;gap:20px;align-items:center}
  .sm{display:none}
  @media(max-width:768px){.nav-links-desktop{display:none!important}.sm{display:flex!important}}
  @media(max-width:420px){nav{padding:0 12px}.btn-g{padding:8px 10px;font-size:12px}.navlink{font-size:11px}input,textarea{font-size:14px}.pf{font-size:inherit}}
`;

function AnnouncementBanner() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'linear-gradient(90deg,#0A0A0A 0%,#1A1400 40%,#0A0A0A 100%)', borderBottom: '1px solid rgba(201,168,76,.3)', height: 34, overflow: 'hidden', animation: 'fadeIn .6s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', whiteSpace: 'nowrap', animation: 'marquee 22s linear infinite', width: 'max-content' }}>
        {['🌍 Spécialités africaines, asiatiques & océan Indien', '🤲 Produits artisanaux — faits à la main avec passion', '🚚 Livraison disponible partout en France', '📍 Trouvez un vendeur près de chez vous', '📞 Samboussas cuits sur demande · 06 63 98 23 27', '✨ Inscription vendeur 100% gratuite', '🌟 La gastronomie du monde à portée de main'].map((text, index) => (
          <span key={index} style={{ color: '#C9A84C', fontSize: 11, letterSpacing: 1.5, fontWeight: 500, padding: '0 28px' }}>
            {text}<span style={{ color: 'rgba(201,168,76,.3)', marginLeft: 28 }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: Math.min(100, item.qty + qty) } : item);
      return [...prev, { ...product, qty: Math.min(100, qty) }];
    });
  };

  const priceFor = (cat, qty) => {
    const base = qty * 1;
    return { total: base, unit: qty ? base / qty : 0, savings: 0 };
  };

  return (
    <AuthProvider>
      <VendorProvider>
      <FavoritesProvider>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <AnnouncementBanner />
          <Navbar cartCount={cartCount} setCartOpen={setCartOpen} />
          <main style={{ paddingTop: 40 }}>
            <Routes>
              <Route path="/" element={<Vendeurs />} />
              <Route path="/vendeurs" element={<Vendeurs />} />
              <Route path="/vendeur/:id" element={<Vendeur />} />
              <Route path="/devenir-vendeur" element={<DevenirVendeur />} />
              <Route path="/villes" element={<Villes />} />
              <Route path="/espace-vendeur" element={<RequireAuth><EspaceVendeur /></RequireAuth>} />
              <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/confidentialite" element={<Confidentialite />} />
              <Route path="/support" element={<Support />} />
              <Route path="/abonnements" element={<Abonnements />} />
              <Route path="/samoussas/:ville" element={<VilleSamboussas />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/products" element={<Vendeurs />} />
              <Route path="/commande" element={<Vendeurs />} />
              <Route path="*" element={<Vendeurs />} />
            </Routes>
          </main>
          <Footer />
          {cartOpen && <CartPanel cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} priceFor={priceFor} IMGS={{}} MAX_QTY={100} />}
      </FavoritesProvider>
     
     </VendorProvider>
    </AuthProvider>
  );
}
