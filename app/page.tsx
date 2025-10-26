'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ShoppingCart, TrendingUp, Mic, Shield, Globe, Phone } from 'lucide-react';
import { useApp } from '../lib/context';
import { translations } from '../locales/translations';

export default function Home() {
  const router = useRouter();
  const { language, setUserRole } = useApp();
  const t = translations[language];

  const handleRoleSelect = (role: 'farmer' | 'buyer') => {
    setUserRole(role);
    router.push(`/${role}/dashboard`);
  };

  const features = [
    {
      icon: TrendingUp,
      title: language === 'te' ? 'AI ధర సూచనలు' : 'AI Price Suggestions',
      description: language === 'te' 
        ? 'ఉత్పత్తి చిత్రం మరియు వివరాల ఆధారంగా AI ధరలను అంచనా వేయండి'
        : 'Get intelligent price predictions using product images and details'
    },
    {
      icon: Mic,
      title: language === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant',
      description: language === 'te'
        ? 'మాటల ద్వారా మార్కెట్ గురించి తెలుసుకోండి'
        : 'Get market insights through voice commands'
    },
    {
      icon: Phone,
      title: language === 'te' ? 'కాల్ ఏజెంట్' : 'Call Agent',
      description: language === 'te'
        ? 'టర్మరిక్ స్పెషలిస్ట్‌తో నేరుగా మాట్లాడండి'
        : 'Speak directly with turmeric specialists'
    },
    {
      icon: Shield,
      title: language === 'te' ? 'బ్లాక్‌చైన్ ట్రేసబిలిటీ' : 'Blockchain Traceability',
      description: language === 'te'
        ? 'మీ ఉత్పత్తుల యొక్క ప్రామాణికతను నిర్ధారించండి'
        : 'Verify authenticity of your products'
    },
    {
      icon: Globe,
      title: language === 'te' ? 'బహుభాషా మద్దతు' : 'Multi-language Support',
      description: language === 'te'
        ? 'తెలుగు మరియు ఆంగ్ల భాషలలో ఉపయోగించండి'
        : 'Use in Telugu and English languages'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-green-600 p-4 rounded-full">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/logo.svg" 
                alt="TurmericChain Logo" 
                className="h-24 w-24 mb-4"
              />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                {language === 'te' ? (
                  <>
                    <span className="text-green-600">టర్మరిక్</span> చైన్
                  </>
                ) : (
                  <>
                    <span className="text-green-600">Turmeric</span>Chain
                  </>
                )}
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {language === 'te' 
                ? 'రైతులు మరియు కొనుగోలుదారుల కోసం AI-ఆధారిత టర్మరిక్ మార్కెట్‌ప్లేస్'
                : 'AI-powered turmeric marketplace for farmers and buyers'
              }
            </p>

            {/* Role Selection */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => handleRoleSelect('farmer')}
                className="flex items-center justify-center space-x-3 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold shadow-lg"
              >
                <Leaf className="h-6 w-6" />
                <span>{language === 'te' ? 'రైతుగా లాగిన్' : 'Login as Farmer'}</span>
              </button>
              
              <button
                onClick={() => handleRoleSelect('buyer')}
                className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>{language === 'te' ? 'కొనుగోలుదారుగా లాగిన్' : 'Login as Buyer'}</span>
              </button>
            </div>

            {/* Demo Button */}
            <div className="mb-16">
              <button
                onClick={() => router.push('/demo/mockdata')}
                className="text-green-600 hover:text-green-700 font-medium underline"
              >
                {language === 'te' ? 'డెమో చూడండి' : 'View Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'te' ? 'ముఖ్య లక్షణాలు' : 'Key Features'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'te'
                ? 'ఆధునిక సాంకేతికతతో టర్మరిక్ వ్యాపారాన్ని మెరుగుపరచండి'
                : 'Transform your turmeric business with modern technology'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'te' ? 'ఇప్పుడే ప్రారంభించండి' : 'Get Started Today'}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {language === 'te'
              ? 'మీ టర్మరిక్ వ్యాపారాన్ని డిజిటల్‌లోకి తీసుకురండి'
              : 'Bring your turmeric business into the digital age'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleRoleSelect('farmer')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {language === 'te' ? 'రైతుగా ప్రారంభించండి' : 'Start as Farmer'}
            </button>
            <button
              onClick={() => handleRoleSelect('buyer')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              {language === 'te' ? 'కొనుగోలుదారుగా ప్రారంభించండి' : 'Start as Buyer'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-2 rounded-full">
              <Leaf className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'te' ? 'టర్మరిక్ చైన్' : 'TurmericChain'}
          </h3>
          <p className="text-gray-400">
            {language === 'te'
              ? 'రైతులు మరియు కొనుగోలుదారుల కోసం AI-ఆధారిత మార్కెట్‌ప్లేస్'
              : 'AI-powered marketplace for farmers and buyers'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
