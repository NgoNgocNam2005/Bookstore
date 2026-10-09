import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { apiRequest } from '../services/api.js';

const TOKEN_KEY = 'manage-book-store.access-token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await apiRequest('/auth/me', { token });

        if (!cancelled) {
          setUser(result.user);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [logout, token]);

  const login = useCallback(async (credentials) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });

    localStorage.setItem(TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);

    return result.user;
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const result = await apiRequest('/users/me', {
      method: 'PATCH',
      body: profile,
      token
    });

    setUser(result.user);
    return result.user;
  }, [token]);

  const changePassword = useCallback(async (passwordData) => {
    return apiRequest('/users/me/password', {
      method: 'PATCH',
      body: passwordData,
      token
    });
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    updateProfile,
    changePassword
  }), [
    changePassword,
    isLoading,
    login,
    logout,
    token,
    updateProfile,
    user
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
