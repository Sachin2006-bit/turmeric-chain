'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign } from 'lucide-react';
import { useApp } from '../lib/context';
import { translations } from '../locales/translations';
import { PriceTick } from '../types';
import { formatPrice } from '../utils';

interface MarketCardProps {
  priceData: PriceTick;
  onBuy?: () => void;
  onSell?: () => void;
  showActions?: boolean;
}

export function MarketCard({ 
  priceData, 
  onBuy, 
  onSell, 
  showActions = true 
}: MarketCardProps) {
  const { language, lowLiteracyMode } = useApp();
  const t = translations[language];

  const isPositive = priceData.change_pct_24h >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {priceData.market}
          </h3>
          <p className="text-sm text-gray-600">
            {priceData.symbol} • {priceData.unit}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${changeBgColor}`}>
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            <ChangeIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{priceData.change_pct_24h}%
            </span>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="text-center mb-6">
        <div className={`text-3xl font-bold ${lowLiteracyMode ? 'text-4xl' : ''} ${changeColor} mb-2`}>
          {formatPrice(priceData.price, language)}
        </div>
        <div className="text-sm text-gray-600">
          {t['price.current']}
        </div>
      </div>

      {/* Volume */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t['price.volume']}</span>
          <span className="font-semibold text-gray-900">
            {priceData.volume.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((priceData.volume / 5000) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* OHLC Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="text-center">
          <div className="text-gray-600">{language === 'te' ? 'అధిక' : 'High'}</div>
          <div className="font-semibold text-green-600">
            {formatPrice(priceData.ohlc.high, language)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">{language === 'te' ? 'తక్కువ' : 'Low'}</div>
          <div className="font-semibold text-red-600">
            {formatPrice(priceData.ohlc.low, language)}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-3">
          <button
            onClick={onSell}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            aria-label={language === 'te' ? 'విక్రయించు' : 'Sell'}
          >
            <DollarSign className="h-5 w-5" />
            <span className={lowLiteracyMode ? 'text-lg' : ''}>
              {language === 'te' ? 'విక్రయించు' : 'Sell'}
            </span>
          </button>
          <button
            onClick={onBuy}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            aria-label={language === 'te' ? 'కొనుగోలు' : 'Buy'}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className={lowLiteracyMode ? 'text-lg' : ''}>
              {language === 'te' ? 'కొనుగోలు' : 'Buy'}
            </span>
          </button>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {t['price.last_updated']}: {new Date(priceData.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
