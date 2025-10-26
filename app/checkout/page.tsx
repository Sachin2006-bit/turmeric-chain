'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, MapPin, Phone, User, Package, CreditCard } from 'lucide-react';
import { TopNav } from '../../components/TopNav';
import { useApp } from '../../lib/context';
import { translations } from '../../locales/translations';
import { formatPrice, formatWeight } from '../../utils';

interface CartItem {
  batchId: string;
  quantity: number;
  price: number;
  batch?: {
    photos?: string[];
    weight_qtl?: number;
    farmer?: {
      name?: string;
      location?: string;
    };
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { userRole, language } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    state: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

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
      } else {
        router.push('/buyer/listing');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      router.push('/buyer/listing');
    }
  }, [router]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert(language === 'te' ? 'దయచేసి అవసరమైన వివరాలను పూర్తి చేయండి' : 'Please fill in all required details');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const orderAmount = getCartTotal();

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const Razorpay = (window as any).Razorpay;

        const options = {
          key: 'rzp_test_RY1meRrhXnyu7U',
          amount: orderAmount * 100, // Convert to paise
          currency: 'INR',
          name: 'TurmericChain',
          description: 'Turmeric Order Payment',
          image: '/logo.svg',
          handler: async function (response: any) {
            console.log('Payment success:', response);
            setPaymentStatus('success');
            setIsProcessing(false);

            // Clear cart
            localStorage.removeItem('buyerCart');

            // Redirect to success page after 2 seconds
            setTimeout(() => {
              router.push('/buyer/dashboard');
            }, 2000);
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          theme: {
            color: '#10b981'
          },
          modal: {
            ondismiss: () => {
              setPaymentStatus('failed');
              setIsProcessing(false);
            }
          }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        setPaymentStatus('failed');
        setIsProcessing(false);
      };

    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            {language === 'te' ? 'కార్ట్‌లో అంశాలు లేవు' : 'No items in cart'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'te' ? 'కార్ట్‌కు తిరిగి వెళ్లండి' : 'Back to Cart'}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'te' ? 'చెక్అవుట్' : 'Checkout'}
          </h1>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <p className="text-green-800 font-medium">
              {language === 'te' ? 'చెల్లింపు విజయవంతం!' : 'Payment Successful!'}
            </p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <p className="text-red-800 font-medium">
              {language === 'te' ? 'చెల్లింపు విఫలమైంది. మళ్లీ ప్రయత్నించండి.' : 'Payment failed. Please try again.'}
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 animate-pulse" />
            <p className="text-yellow-800 font-medium">
              {language === 'te' ? 'చెల్లింపు ప్రాసెస్ కావడంలో...' : 'Processing payment...'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'డెలివరీ వివరాలు' : 'Delivery Details'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    {language === 'te' ? 'పేరు *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {language === 'te' ? 'ఫోన్ నంబర్ *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'te' ? 'ఇమెయిల్' : 'Email'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {language === 'te' ? 'చిరునామా *' : 'Address *'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'te' ? 'నగరం *' : 'City *'}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'te' ? 'రాష్ట్రం' : 'State'}
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'te' ? 'పిన్‌కోడ్ *' : 'Pincode *'}
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'ఆర్డర్ సారాంశం' : 'Order Summary'}
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                    <Package className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.batchId}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{language === 'te' ? 'ఉపమొత్తం' : 'Subtotal'}</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{language === 'te' ? 'డెలివరీ' : 'Delivery'}</span>
                  <span className="text-green-600 font-semibold">
                    {language === 'te' ? 'ఉచితం' : 'Free'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900">
                  <span>{language === 'te' ? 'మొత్తం' : 'Total'}</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || paymentStatus === 'processing'}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-5 w-5" />
                <span>
                  {isProcessing 
                    ? (language === 'te' ? 'ప్రాసెస్ కావడంలో...' : 'Processing...')
                    : (language === 'te' ? 'చెల్లింపు చేయండి' : 'Pay Now')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

