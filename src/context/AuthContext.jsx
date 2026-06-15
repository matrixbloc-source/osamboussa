import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, registerVendor } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => authListener.subscription?.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = async ({ email, password, shop, city, phone }) => {
    return registerVendor({ email, password, shop, city, phone });
  };
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called inside AuthProvider');
  }
  return context;
}
