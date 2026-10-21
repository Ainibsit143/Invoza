import { createContext, useContext, useEffect, useState } from "react";

import { api, getToken, setToken, removeToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token exists, ask the server who the user is
  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get("/auth/me");

        if (!ignore) {
          setUser(data.user);
        }
      } catch (error) {
        // Token is invalid/expired or the user no longer exists
        if (error.status === 401 || error.status === 404) {
          removeToken();
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });

    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}