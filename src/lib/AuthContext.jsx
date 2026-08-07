import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setUser(null);
      setAuthError({ type: 'auth_required', message: error.message });
    } else {
      setUser(data?.session?.user || null);
      setAuthError(null);
    }

    setAuthChecked(true);
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    checkUserAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setAuthError({ type: 'auth_required' });
      } else {
        setAuthError(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUserAuth]);

  const signIn = async ({ email, password }) => {
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoadingAuth(false);

    if (error) {
      setAuthError({ type: 'login_failed', message: error.message });
      return { error };
    }

    setUser(data.user);
    setAuthError(null);
    return { data };
  };

  const signOut = async () => {
    setIsLoadingAuth(true);
    const { error } = await supabase.auth.signOut();
    setIsLoadingAuth(false);

    if (error) {
      setAuthError({ type: 'signout_failed', message: error.message });
      return { error };
    }

    setUser(null);
    setAuthError(null);
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        authChecked,
        authError,
        checkUserAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};