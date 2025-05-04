"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  login: (data: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage
  const storedData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
  const initialData = storedData ? JSON.parse(storedData) : null;
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialData);
  const [userData, setUserData] = useState<UserData | null>(initialData);

  // Save userData to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  const login = (data: UserData) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        login,
        logout,
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