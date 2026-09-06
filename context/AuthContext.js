import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await authApi.getToken();
      if (token) {
        try {
          setUser(await authApi.fetchMe());
        } catch {
          await authApi.logout();
        }
      }
      setBooting(false);
    })();
  }, []);

  async function login(credentials) {
    setUser(await authApi.login(credentials));
  }

  async function register(payload) {
    setUser(await authApi.register(payload));
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function deleteAccount() {
    await authApi.deleteAccount();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
