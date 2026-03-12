import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getStoredUser,
  isAuthenticated,
  loginRequest,
  logoutRequest,
  type AuthUser,
} from '../services/auth';

type AuthContextType = {
  user: AuthUser | null;
  authenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  authenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logged = isAuthenticated();
    const storedUser = getStoredUser();

    setAuthenticated(logged);
    setUser(logged ? storedUser : null);
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const loggedUser = await loginRequest(username, password);
    setUser(loggedUser);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authenticated,
      loading,
      login,
      logout,
    }),
    [user, authenticated, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};