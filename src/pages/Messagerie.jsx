import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMessages } from '../context/MessagesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SELLERS from '../data/sellers.js';

function RealtimeBadge({ status }) {
  const cfg = {
    connected:  { color: '#4ADE80', dot: '#4ADE80', label: 'Temps réel' },
    connecting: { color: '#FBBF24', dot: '#FBBF24', label: 'Connexion...' },
    local:      { color: '#6B6B6B', dot: '#6B6B6B', label: 'Mode local' },
  }[status] || { color: '#6B6B6B', dot: '#6B6B6B', label: status };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, borderRadius: 20, padding: '2px 8px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', animation: status === 'connected' ? 'pulse 2s infinite' : 'none' }} />
      {cfg.label}
    </span>
  );
}

function ConvItem({ conv, active, onClick }) {
  const last = conv.messages.at(-1);
  const timeStr = last ? last.time : '';
  return (
    <button onClick={onClick}
      style={{ width: '100%', background: active ? 'rgba(201,168,76,.07)' : 'transparent', border: 'none', borderLeft: `3px solid ${active ? '#C9A84C' : 'transparent'}`, padding: '13px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', transition: 'all .15s' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img src={conv.sellerLogo} alt={conv.sellerName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,168,76,.2)' }} />
        {conv.unread > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, background: '#C9A84C', color: '#0A0A0A', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{conv.unread}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#F5F0E8', fontSize: 13, fontWeight: conv.unread > 0 ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.sellerName}</span>
          <span style={{ color: '#6B6B6B', fontSize: 10, flexShrink: 0 }}>{timeStr}</span>
        </div>
        <p style={{ color: conv.unread > 0 ? '#C9A84C' : '#6B6B6B', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {last ? (last.from === 'user' ? 'Vous: ' : '') + last.text : 'Nouvelle conversation'}
        </p>
      </div>
    </button>
  );
}

export default function Messagerie() {
  const { conversations, activeConvId, setActiveConvId, sendMessage, startConversation, markRead, realtimeStatus, totalUnread } = useMessages();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const sellerId = parseInt(searchParams.get('seller'));
    if (sellerId) {
      const seller = SELLERS.find(s => s.id === sellerId);
      if (seller) startConversation(seller);
    } else if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, []);

  useEffect(() => {
    if (activeConvId) { markRead(activeConvId); inputRef.current?.focus(); }
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeSeller = activeConv ? SELLERS.find(s => s.id === activeConv.sellerId) : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId || sending) return;
    setSending(true);
    await sendMessage(activeConvId, text.trim());
    setText('');
    setSending(false);
  };

  if (!user) {
    return (
      <section style={{ minHeight: '100vh', padding: '120px 24px', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>💬</div>
          <h2 className="pf" style={{ fontSize: 28, color: '#F5F0E8', marginBottom: 12 }}>Connexion requise</h2>
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>Connectez-vous pour accéder à votre messagerie et contacter les vendeurs.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/login" className="btn-g" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>Se connecter</Link>
            <Link to="/register" className="btn-o" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>S'inscrire</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @media(max-width:768px){
          .msg-section{height:auto!important;min-height:calc(100vh - 102px)}
          .msg-grid{grid-template-columns:1fr!important}
          .msg-sidebar{max-height:280px}
        }
      `}</style>
      <section className="msg-section" style={{ height: '100vh', paddingTop: 102, background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
        <div className="msg-grid" style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'minmax(220px,280px) 1fr', gap: 12, minHeight: 0 }}>

          {/* Sidebar */}
          <div className="msg-sidebar" style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(201,168,76,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 className="pf" style={{ fontSize: 17, color: '#F5F0E8' }}>Messages</h2>
                {totalUnread > 0 && <span style={{ background: '#C9A84C', color: '#0A0A0A', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</span>}
              </div>
              <RealtimeBadge status={realtimeStatus} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 && (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
                  Aucune conversation.<br />
                  <Link to="/vendeurs" style={{ color: '#C9A84C', fontSize: 12 }}>Trouver un vendeur →</Link>
                </div>
              )}
              {[...conversations].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)).map(conv => (
                <ConvItem key={conv.id} conv={conv} active={activeConvId === conv.id}
                  onClick={() => { setActiveConvId(conv.id); markRead(conv.id); }} />
              ))}
            </div>
          </div>

          {/* Thread */}
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,.1)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!activeConv ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#6B6B6B' }}>
                <span style={{ fontSize: 52 }}>💬</span>
                <p style={{ fontSize: 14 }}>Sélectionnez une conversation ou</p>
                <Link to="/vendeurs" className="btn-o" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>Trouver un vendeur</Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(201,168,76,.06)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <img src={activeConv.sellerLogo} alt={activeConv.sellerName} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,168,76,.25)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 600 }}>{activeConv.sellerName}</p>
                    <p style={{ color: '#4ADE80', fontSize: 11, marginTop: 1 }}>● Disponible</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {activeSeller && (
                      <a href={`https://wa.me/${activeSeller.tel}?text=Bonjour%20${encodeURIComponent(activeSeller.shop)}%20!`}
                        target="_blank" rel="noreferrer"
                        className="btn-o"
                        style={{ padding: '7px 14px', fontSize: 12, borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        📱 WhatsApp
                      </a>
                    )}
                    {activeSeller && (
                      <Link to={`/vendeur/${activeSeller.id}`} className="btn-o"
                        style={{ padding: '7px 14px', fontSize: 12, borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        Voir profil →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeConv.messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, marginTop: 32 }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>👋</p>
                      Commencez la conversation !
                    </div>
                  )}
                  {/* Date grouping */}
                  {(() => {
                    const groups = {};
                    activeConv.messages.forEach(m => { (groups[m.date] = groups[m.date] || []).push(m); });
                    return Object.entries(groups).map(([date, msgs]) => (
                      <div key={date}>
                        <div style={{ textAlign: 'center', margin: '8px 0' }}>
                          <span style={{ color: '#6B6B6B', fontSize: 11, background: '#0D0D0D', padding: '3px 12px', borderRadius: 20 }}>
                            {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                        {msgs.map(msg => (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                            {msg.from === 'seller' && (
                              <img src={activeConv.sellerLogo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }} />
                            )}
                            <div style={{ maxWidth: '68%' }}>
                              <div style={{ background: msg.from === 'user' ? 'linear-gradient(135deg,#8A6E2F,#C9A84C)' : 'rgba(255,255,255,.05)', border: msg.from === 'user' ? 'none' : '1px solid rgba(201,168,76,.1)', color: msg.from === 'user' ? '#0A0A0A' : '#F5F0E8', padding: '10px 14px', borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.6 }}>
                                {msg.text}
                              </div>
                              <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 3, textAlign: msg.from === 'user' ? 'right' : 'left', paddingInline: 4 }}>{msg.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} style={{ padding: '10px 14px', borderTop: '1px solid rgba(201,168,76,.06)', display: 'flex', gap: 8 }}>
                  <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Écrire un message..." style={{ flex: 1, padding: '11px 14px', borderRadius: 12, fontSize: 13 }} disabled={sending} />
                  <button type="submit" className="btn-g" style={{ padding: '11px 18px', borderRadius: 12, fontSize: 13, flexShrink: 0, opacity: (!text.trim() || sending) ? .5 : 1 }} disabled={!text.trim() || sending}>
                    {sending ? '...' : '↑'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
