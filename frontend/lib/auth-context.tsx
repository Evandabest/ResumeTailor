"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  token: string | null;
  login: (data: UserData, token: string) => void;
  logout: () => void;
  fetchWithAuth: (options: { url: string; method?: string; body?: any; headers?: Record<string, string> }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage
  const storedData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
  const initialData = storedData ? JSON.parse(storedData) : null;
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialData);
  const [userData, setUserData] = useState<UserData | null>(initialData);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );

  // Save userData to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  const login = (data: UserData, token: string) => {
    setUserData(data);
    setToken(token);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      document.cookie = `token=${token}; path=/`;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  };

  const fetchWithAuth = async (options: { url: string; method?: string; body?: any; headers?: Record<string, string> }) => {
    const headers: Record<string, string> = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(options.url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        login,
        token,
        logout,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
