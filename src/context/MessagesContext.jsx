import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL } from '../lib/supabaseClient.js';

const MessagesContext = createContext(null);

// Détecte si Supabase est configuré avec de vraies credentials
const IS_REAL_SUPABASE = Boolean(
  SUPABASE_URL && !SUPABASE_URL.includes('placeholder')
);

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_1',
    sellerId: 1,
    sellerName: 'Samboussa du Marché',
    sellerLogo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80',
    messages: [
      { id: 'm1', from: 'seller', text: 'Bonjour ! Comment puis-je vous aider ?', time: '10:30', date: '2026-06-10' },
      { id: 'm2', from: 'user', text: 'Bonjour, je voudrais commander 20 samboussas classiques pour samedi.', time: '10:35', date: '2026-06-10' },
      { id: 'm3', from: 'seller', text: 'Bien sûr ! C\'est possible. Le prix sera de 130€ pour 20 pièces. Vous souhaitez en livraison ou retrait ?', time: '10:38', date: '2026-06-10' },
    ],
    unread: 1,
    lastActivity: '2026-06-10T10:38:00',
  },
  {
    id: 'conv_2',
    sellerId: 2,
    sellerName: 'La Maison des Samboussas',
    sellerLogo: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=200&q=80',
    messages: [
      { id: 'm4', from: 'user', text: 'Bonjour, livrez-vous à Lyon ?', time: '14:20', date: '2026-06-12' },
      { id: 'm5', from: 'seller', text: 'Bonjour ! Malheureusement nous livrons uniquement sur Marseille et alentours. Pour les grandes commandes nous pouvons expédier en colis réfrigéré.', time: '14:45', date: '2026-06-12' },
    ],
    unread: 0,
    lastActivity: '2026-06-12T14:45:00',
  },
];

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(
    IS_REAL_SUPABASE ? 'connecting' : 'local'
  );

  // Supabase Realtime — actif uniquement si credentials réels
  useEffect(() => {
    if (!IS_REAL_SUPABASE) return;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new;
          const newMsg = {
            id: row.id,
            from: row.sender_type, // 'user' | 'seller'
            text: row.content,
            time: new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(row.created_at).toISOString().slice(0, 10),
          };
          setConversations(prev =>
            prev.map(c =>
              c.id === row.conversation_id
                ? {
                    ...c,
                    messages: [...c.messages, newMsg],
                    unread: c.id !== activeConvId ? c.unread + 1 : 0,
                    lastActivity: row.created_at,
                  }
                : c
            )
          );
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : status.toLowerCase());
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);

  const sendMessage = useCallback(async (convId, text) => {
    const now = new Date();
    const newMsg = {
      id: `m_${Date.now()}`,
      from: 'user',
      text,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().slice(0, 10),
    };

    // Optimistic update local
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, newMsg], lastActivity: now.toISOString() }
          : c
      )
    );

    // Persist to Supabase si disponible
    if (IS_REAL_SUPABASE) {
      await supabase.from('messages').insert({
        conversation_id: convId,
        content: text,
        sender_type: 'user',
        created_at: now.toISOString(),
      });
    }
  }, []);

  const startConversation = useCallback((seller) => {
    const existing = conversations.find(c => c.sellerId === seller.id);
    if (existing) { setActiveConvId(existing.id); return existing.id; }
    const newConv = {
      id: `conv_${seller.id}`,
      sellerId: seller.id,
      sellerName: seller.shop,
      sellerLogo: seller.logo,
      messages: [],
      unread: 0,
      lastActivity: new Date().toISOString(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    return newConv.id;
  }, [conversations]);

  const markRead = useCallback((convId) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unread: 0 } : c)
    );
  }, []);

  return (
    <MessagesContext.Provider value={{
      conversations,
      activeConvId,
      setActiveConvId,
      totalUnread,
      realtimeStatus,
      isRealtime: IS_REAL_SUPABASE,
      sendMessage,
      startConversation,
      markRead,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be inside MessagesProvider');
  return ctx;
}
