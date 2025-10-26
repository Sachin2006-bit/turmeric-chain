'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Language, PriceTick, Notification } from '../types';
import { loadFromLocalStorage, saveToLocalStorage, getNotifications } from '../utils/api';

interface AppContextType {
  // User state
  userRole: UserRole | null;
  language: Language;
  lowLiteracyMode: boolean;
  
  // Price data
  currentPrice: PriceTick | null;
  priceHistory: PriceTick[];
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  setUserRole: (role: UserRole | null) => void;
  setLanguage: (lang: Language) => void;
  setLowLiteracyMode: (enabled: boolean) => void;
  updatePrice: (price: PriceTick) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [lowLiteracyMode, setLowLiteracyMode] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<PriceTick | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceTick[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load initial state from localStorage
  useEffect(() => {
    const savedRole = loadFromLocalStorage<UserRole | null>('userRole', null);
    const savedLang = loadFromLocalStorage<Language>('language', 'en');
    const savedLowLiteracy = loadFromLocalStorage<boolean>('lowLiteracyMode', false);
    
    setUserRole(savedRole);
    setLanguage(savedLang);
    setLowLiteracyMode(savedLowLiteracy);
    setNotifications(getNotifications());
    
    // Clear any old Telugu default from localStorage if it exists
    if (savedLang === 'te' && !localStorage.getItem('language')) {
      setLanguage('en');
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    saveToLocalStorage('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    saveToLocalStorage('language', language);
  }, [language]);

  useEffect(() => {
    saveToLocalStorage('lowLiteracyMode', lowLiteracyMode);
  }, [lowLiteracyMode]);

  const updatePrice = (price: PriceTick) => {
    setCurrentPrice(price);
    setPriceHistory(prev => [price, ...prev.slice(0, 99)]); // Keep last 100 prices
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'delivered' } : n)
    );
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        language,
        lowLiteracyMode,
        currentPrice,
        priceHistory,
        notifications,
        setUserRole,
        setLanguage,
        setLowLiteracyMode,
        updatePrice,
        addNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
