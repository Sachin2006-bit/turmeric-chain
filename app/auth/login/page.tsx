'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { translations } from '../../../locales/translations';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'farmer' | 'buyer' | null>(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'role'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [devOTP, setDevOTP] = useState('');

  const t = translations[language];

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.length < 10) {
        setError(language === 'te' ? 'చెల్లుబాటుఅయ్యే మొబైల్ నంబర్‌ను నమోదు చేయండి' : 'Please enter a valid mobile number');
        setLoading(false);
        return;
      }

      // Send OTP
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          mobileNumber: phoneNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        // In development, fetch OTP from API response
        setDevOTP(data.otp || '');
      } else {
        setError(data.error || (language === 'te' ? 'OTP పంపడంలో లోపం' : 'Failed to send OTP'));
      }
    } catch (err) {
      setError(language === 'te' ? 'సర్వర్ లోపం' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify OTP
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          mobileNumber: phoneNumber,
          otp
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('role');
      } else {
        setError(data.error || (language === 'te' ? 'చెల్లని OTP' : 'Invalid OTP'));
      }
    } catch (err) {
      setError(language === 'te' ? 'సర్వర్ లోపం' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend',
          mobileNumber: phoneNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        setError(language === 'te' ? 'OTP మళ్లీ పంపబడింది' : 'OTP resent successfully');
      } else {
        setError(data.error || (language === 'te' ? 'OTP మళ్లీ పంపడంలో లోపం' : 'Failed to resend OTP'));
      }
    } catch (err) {
      setError(language === 'te' ? 'సర్వర్ లోపం' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: 'farmer' | 'buyer') => {
    setRole(selectedRole);
    login(phoneNumber, selectedRole);
    router.push(`/${selectedRole}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
            className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm"
          >
            {language === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="TurmericChain Logo" className="h-20 w-20" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'te' ? 'సైన్ ఇన్ చేయండి' : 'Sign In'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'te' 
                  ? 'కొనసాగించడానికి మీ మొబైల్ నంబర్‌ను నమోదు చేయండి' 
                  : 'Enter your mobile number to continue'}
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={language === 'te' ? '9876543210' : '9876543210'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      maxLength={10}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...')
                    : (language === 'te' ? 'OTP పొందండి' : 'Get OTP')}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div>
              <button
                onClick={() => setStep('phone')}
                className="text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                {language === 'te' ? 'వెనుకకు' : 'Back'}
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'te' ? 'OTP సరిచూడండి' : 'Verify OTP'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'te'
                  ? `మీ ${phoneNumber} నంబర్‌కు పంపిన 6 అంకెల OTP నమోదు చేయండి`
                  : `Enter the 6-digit OTP sent to ${phoneNumber}`}
              </p>

              {/* Development: Show OTP on screen */}
              {devOTP && (
                <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    {language === 'te' ? '🧪 డెవలప్‌మెంట్ OTP:' : '🧪 Development OTP:'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 text-center cursor-pointer" onClick={() => setOtp(devOTP)}>
                    {devOTP}
                  </p>
                  <p className="text-xs text-yellow-700 mt-2 text-center">
                    {language === 'te' ? 'ఈ OTP ని క్లిక్ చేసి ఎంటర్ చేయండి' : 'Click OTP to auto-fill'}
                  </p>
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'OTP కోడ్' : 'OTP Code'}
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={language === 'te' ? '123456' : '123456'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      maxLength={6}
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (language === 'te' ? 'సరిచూస్తోంది...' : 'Verifying...')
                    : (language === 'te' ? 'సరిచూడండి' : 'Verify')}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full text-gray-600 hover:text-gray-900 text-sm disabled:opacity-50"
                >
                  {language === 'te' ? 'OTP ని మళ్లీ పంపండి' : "Didn't receive OTP? Resend"}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Role Selection */}
          {step === 'role' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'te' ? 'మీ పాత్రను ఎంచుకోండి' : 'Select Your Role'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'te'
                  ? 'మీరు రైతు లేదా కొనుగోలుదారు అవుతారు'
                  : 'Are you a farmer or a buyer?'}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('farmer')}
                  className="w-full p-6 border-2 border-green-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all text-left"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'te' ? 'రైతు' : 'Farmer'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'te' ? 'ఉత్పత్తులు పేర్చడానికి' : 'List your products'}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('buyer')}
                  className="w-full p-6 border-2 border-blue-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'te' ? 'కొనుగోలుదారు' : 'Buyer'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'te' ? 'ఉత్పత్తులను కొనండి' : 'Browse and buy products'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {language === 'te' 
            ? 'కొనసాగించడం ద్వారా, మీరు మా ' : 'By continuing, you agree to our '}
          <a href="#" className="text-green-600 hover:underline">
            {language === 'te' ? 'నిబంధనలు & షరతులు' : 'Terms & Conditions'}
          </a>
        </p>
      </div>
    </div>
  );
}

