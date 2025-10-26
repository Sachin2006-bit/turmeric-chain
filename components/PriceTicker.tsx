'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { useApp } from '../lib/context';
import { translations } from '../locales/translations';
import { PriceTick } from '../types';
import { formatPrice } from '../utils';
import { fetchPriceData } from '../utils/api';
import { fetchAndStorePriceData } from '../utils/priceHistory';
import { SpeechSynthesisHelper } from '../utils/speech';

interface PriceTickerProps {
  market?: string;
  showSparkline?: boolean;
  autoRefresh?: boolean;
}

export function PriceTicker({ 
  market = 'Nizamabad', 
  showSparkline = true,
  autoRefresh = true 
}: PriceTickerProps) {
  const { language, lowLiteracyMode, currentPrice, updatePrice } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveData, setIsLiveData] = useState(false);
  const [speechSynthesis] = useState(() => new SpeechSynthesisHelper());

  const t = translations[language];

  // Fetch price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      const priceData = await fetchAndStorePriceData();
      if (priceData.length > 0) {
        const price = priceData.find(p => p.market === market) || priceData[0];
        updatePrice(price);
        setLastUpdated(new Date());
        setIsLiveData(price.source === 'moneycontrol');
        
        // Auto-announce price in low literacy mode
        if (lowLiteracyMode && language === 'te') {
          const priceText = `ప్రస్తుత టర్మరిక్ ధర ${formatPrice(price.price, language)} క్వింటల్‌కు ఉంది`;
          speechSynthesis.speak(priceText, language);
        }
      }
    } catch (error) {
      console.error('Error loading price data:', error);
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh price data
  useEffect(() => {
    loadPriceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadPriceData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [market, autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    loadPriceData();
  };

  // Announce price manually
  const handleAnnouncePrice = () => {
    if (currentPrice) {
      const priceText = language === 'te' 
        ? `ప్రస్తుత టర్మరిక్ ధర ${formatPrice(currentPrice.price, language)} క్వింటల్‌కు ఉంది. మార్పు ${currentPrice.change_pct_24h > 0 ? '+' : ''}${currentPrice.change_pct_24h}%`
        : `Current turmeric price is ${formatPrice(currentPrice.price, language)} per quintal. Change is ${currentPrice.change_pct_24h > 0 ? '+' : ''}${currentPrice.change_pct_24h}%`;
      
      speechSynthesis.speak(priceText, language);
    }
  };

  if (!currentPrice) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">{t['common.loading']}</span>
        </div>
      </div>
    );
  }

  const isPositive = currentPrice.change_pct_24h >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t['price.current']} - {market}
          </h2>
          {isLiveData && (
            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{language === 'te' ? 'లైవ్' : 'LIVE'}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
          aria-label="Refresh price"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Price */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${lowLiteracyMode ? 'text-4xl' : ''} ${changeColor}`}>
            {formatPrice(currentPrice.price, language)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t['price.current']}
          </div>
          {lowLiteracyMode && (
            <button
              onClick={handleAnnouncePrice}
              className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
            >
              🔊 {language === 'te' ? 'వినండి' : 'Listen'}
            </button>
          )}
        </div>

        {/* Change */}
        <div className="text-center">
          <div className={`flex items-center justify-center space-x-1 ${changeColor}`}>
            <ChangeIcon className="h-5 w-5" />
            <span className={`text-xl font-semibold ${lowLiteracyMode ? 'text-2xl' : ''}`}>
              {isPositive ? '+' : ''}{currentPrice.change_pct_24h}%
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t['price.change']} (24h)
          </div>
        </div>

        {/* Volume */}
        <div className="text-center">
          <div className={`text-xl font-semibold ${lowLiteracyMode ? 'text-2xl' : ''} text-gray-900`}>
            {currentPrice.volume.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t['price.volume']}
          </div>
        </div>
      </div>

      {/* OHLC Data */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">{language === 'te' ? 'తెరవండి' : 'Open'}</div>
            <div className="font-semibold">{formatPrice(currentPrice.ohlc.open, language)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{language === 'te' ? 'అధిక' : 'High'}</div>
            <div className="font-semibold text-green-600">{formatPrice(currentPrice.ohlc.high, language)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{language === 'te' ? 'తక్కువ' : 'Low'}</div>
            <div className="font-semibold text-red-600">{formatPrice(currentPrice.ohlc.low, language)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{language === 'te' ? 'ముగింపు' : 'Close'}</div>
            <div className="font-semibold">{formatPrice(currentPrice.ohlc.close, language)}</div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{t['price.last_updated']}</span>
            {isLiveData && (
              <span className="text-green-600 font-medium">
                {language === 'te' ? 'మనీకంట్రోల్' : 'MoneyControl'}
              </span>
            )}
          </div>
          <span>{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
