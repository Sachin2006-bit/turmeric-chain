'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, Globe, User, LogOut } from 'lucide-react';
import { useApp } from '../lib/context';
import { useAuth } from '../lib/auth-context';
import { translations } from '../locales/translations';
import { UserRole, Language } from '../types';

interface TopNavProps {
  onSwitchRole?: () => void;
}

export function TopNav({ onSwitchRole }: TopNavProps) {
  const { userRole, language, setLanguage, notifications, markNotificationAsRead, setUserRole } = useApp();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const t = translations[language];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'te' ? 'en' : 'te');
  };

  const handleRoleSwitch = () => {
    if (onSwitchRole) {
      onSwitchRole();
    } else {
      // Default role switching behavior
      const newRole = userRole === 'farmer' ? 'buyer' : 'farmer';
      setUserRole(newRole);
      
      // Redirect to appropriate dashboard
      const targetPath = newRole === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
      router.push(targetPath);
    }
  };

  const unreadNotifications = notifications.filter(n => n.status === 'queued').length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/logo.svg" 
                alt="TurmericChain Logo" 
                className="h-12 w-12"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-600">
                {language === 'te' ? 'టర్మరిక్ చైన్' : 'TurmericChain'}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
              aria-label={t['nav.language']}
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
            </button>

            {/* Role Switch */}
            {userRole && (
              <button
                onClick={handleRoleSwitch}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                aria-label={t['nav.switch_role']}
              >
                <User className="h-4 w-4" />
                <span>
                  {userRole === 'farmer' 
                    ? (language === 'te' ? 'కొనుగోలుదారుగా మార్చు' : 'Switch to Buyer')
                    : (language === 'te' ? 'రైతుగా మార్చు' : 'Switch to Farmer')
                  }
                </span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                aria-label={t['nav.notifications']}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t['nav.notifications']}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {language === 'te' ? 'నోటిఫికేషన్‌లు లేవు' : 'No notifications'}
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.status === 'queued' ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Role Display */}
            {userRole && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-md">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {userRole === 'farmer' 
                    ? (language === 'te' ? 'రైతు' : 'Farmer')
                    : (language === 'te' ? 'కొనుగోలుదారు' : 'Buyer')
                  }
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              aria-label="Open menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Language Toggle */}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{language === 'te' ? 'సైన్ అవుట్' : 'Sign Out'}</span>
              </button>

              {/* Role Switch */}
              {userRole && (
                <button
                  onClick={handleRoleSwitch}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>
                    {userRole === 'farmer' 
                      ? (language === 'te' ? 'కొనుగోలుదారుగా మార్చు' : 'Switch to Buyer')
                      : (language === 'te' ? 'రైతుగా మార్చు' : 'Switch to Farmer')
                    }
                  </span>
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span>{t['nav.notifications']}</span>
                {unreadNotifications > 0 && (
                  <span className="ml-auto h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
