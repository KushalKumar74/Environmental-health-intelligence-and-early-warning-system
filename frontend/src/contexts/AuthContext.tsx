import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'aqi.auth.token';
const USER_KEY = 'aqi.auth.user';

function getInitialToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getInitialUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [loading, setLoading] = useState(false);

  const persist = useCallback((u: AuthUser, t: string, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    // Clear opposite storage to avoid duplicate out-of-sync tokens
    (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
    (remember ? sessionStorage : localStorage).removeItem(USER_KEY);

    storage.setItem(TOKEN_KEY, t);
    storage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${res.status}): ${text.slice(0, 120) || 'Empty response'}`);
        }
        if (!res.ok) throw new Error(data?.error || 'Login failed');
        persist(data.data, data.token, remember);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${res.status}): ${text.slice(0, 120) || 'Empty response — is the backend running?'}`);
        }
        if (!res.ok) throw new Error(data?.error || 'Registration failed');
        persist(data.data, data.token, true);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
