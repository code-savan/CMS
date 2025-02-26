import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';

// Define our own User type instead of using Supabase's
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check token validity and refresh if needed
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token || !refreshToken) {
      setUser(null);
      return;
    }

    try {
      // Check if token is expired (you might want to decode JWT to check expiration)
      const response = await authApi.refreshToken(refreshToken);
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, sign out
      await signOut();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        await checkAndRefreshToken();
      }
      setLoading(false);
    };

    initAuth();

    // Set up periodic token refresh (every 23 hours)
    const refreshInterval = setInterval(checkAndRefreshToken, 23 * 60 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const signUp = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await authApi.register({ email, password });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { user, access, refresh } = response.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    } catch (error) {
      console.error('Error in signin:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
