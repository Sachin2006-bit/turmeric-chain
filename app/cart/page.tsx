'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Package, User, MapPin } from 'lucide-react';
import { TopNav } from '../../components/TopNav';
import { useApp } from '../../lib/context';
import { translations } from '../../locales/translations';
import { formatPrice, formatWeight } from '../../utils';

export default function CartPage() {
  const router = useRouter();
  const { userRole, language } = useApp();
  const [cart, setCart] = useState<any[]>([]);
  const t = translations[language];

  // Redirect if not buyer
  useEffect(() => {
    if (userRole !== 'buyer') {
      router.push('/');
    }
  }, [userRole, router]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('buyerCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCart([]);
    }
  }, []);

  const handleQuantityChange = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (item) {
      item.quantity = Math.max(1, (item.quantity || 1) + delta);
      setCart(newCart);
      localStorage.setItem('buyerCart', JSON.stringify(newCart));
    }
  };

  const handleRemoveItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('buyerCart', JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  if (userRole !== 'buyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/buyer/listing')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Listings</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            Review your selected turmeric batches
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {language === 'te' ? 'మీ కార్ట్ ఖాళీ' : 'Your Cart is Empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'te' ? 'కార్ట్‌కు టర్మరిక్ బ్యాచ్‌లను జోడించండి' : 'Add turmeric batches to your cart'}
            </p>
            <button
              onClick={() => router.push('/buyer/listing')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {language === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'te' ? 'కార్ట్ అంశాలు' : 'Cart Items'} ({cart.length})
                </h2>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {item.batch?.photos?.[0] && (
                        <img
                          src={item.batch.photos[0]}
                          alt={item.batchId}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{item.batchId || 'Unknown Item'}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          {item.batch?.farmer?.name && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{item.batch.farmer.name}</span>
                            </div>
                          )}
                          {item.batch?.farmer?.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{item.batch.farmer.location}</span>
                            </div>
                          )}
                          {item.batch?.weight_qtl && (
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>{formatWeight(item.batch.weight_qtl, language)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => handleQuantityChange(index, -1)}
                            className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(index, 1)}
                            className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-gray-900 mb-2">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'te' ? 'ఆర్డర్ సారాంశం' : 'Order Summary'}
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'te' ? 'ఉపమొత్తం' : 'Subtotal'}</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'te' ? 'డెలివరీ' : 'Delivery'}</span>
                    <span>{language === 'te' ? 'ఉచితం' : 'Free'}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                    <span>{language === 'te' ? 'మొత్తం' : 'Total'}</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {language === 'te' ? 'చెక్అవుట్ చేయండి' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}