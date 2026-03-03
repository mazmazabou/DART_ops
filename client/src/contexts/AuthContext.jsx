import { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe, fetchProfile, doLogout } from '../api';
import { getLoginUrl } from '../utils/campus';

const AuthContext = createContext(null);

export function AuthProvider({ children, expectedRole = 'rider' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe().then(me => {
      if (!me) {
        window.location.href = getLoginUrl();
        return;
      }
      if (!me.demoMode && me.role !== expectedRole) {
        if (me.role === 'office') window.location.href = '/';
        else if (me.role === 'driver') window.location.href = '/driver';
        else window.location.href = '/rider';
        return;
      }
      // Enrich with profile fields
      fetchProfile().then(profile => {
        setUser({ ...me, ...profile });
        setLoading(false);
      }).catch(() => {
        setUser(me);
        setLoading(false);
      });
    });
  }, []);

  const logout = async () => {
    await doLogout();
    window.location.href = getLoginUrl();
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isTerminated: !!user?.terminated, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
