'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  userRole: 'farmer' | 'buyer' | null;
  login: (phoneNumber: string, role: 'farmer' | 'buyer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'farmer' | 'buyer' | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('turmericChainAuth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(authData.isAuthenticated || false);
        setPhoneNumber(authData.phoneNumber || null);
        setUserRole(authData.userRole || null);
      } catch (error) {
        console.error('Error loading auth state:', error);
      }
    }
  }, []);

  const login = (phone: string, role: 'farmer' | 'buyer') => {
    setIsAuthenticated(true);
    setPhoneNumber(phone);
    setUserRole(role);
    
    // Save to localStorage
    localStorage.setItem('turmericChainAuth', JSON.stringify({
      isAuthenticated: true,
      phoneNumber: phone,
      userRole: role
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPhoneNumber(null);
    setUserRole(null);
    
    // Remove from localStorage
    localStorage.removeItem('turmericChainAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, phoneNumber, userRole, login, logout }}>
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

