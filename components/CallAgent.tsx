'use client';

import React, { useState } from 'react';
import { Phone, PhoneCall, Clock, User } from 'lucide-react';
import { translations } from '../locales/translations';
import { useApp } from '../lib/context';
import { CallAgentModal } from './CallAgentModal';

interface CallAgentProps {
  className?: string;
  farmerPhone?: string;
  buyerPhone?: string;
  batchId?: string;
}

export function CallAgent({ 
  className = '', 
  farmerPhone = '+919876543210',
  buyerPhone = '+919876543211',
  batchId = 'batch_001'
}: CallAgentProps) {
  const { language } = useApp();
  const t = translations[language];
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCallAgent = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Phone className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'te' ? 'కాల్ ఏజెంట్' : 'Call Agent'}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Agent Info */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {language === 'te' ? 'రాజేష్ కుమార్' : 'Rajesh Kumar'}
                </h3>
                <p className="text-sm text-gray-700 font-semibold">
                  {language === 'te' ? '🎯 ప్రీమియం సేల్స్‌పర్సన్' : '🎯 Premium Salesperson'}
                </p>
              </div>
            </div>
            
            {/* Context Banner */}
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-3 mb-3 border border-blue-300">
              <p className="text-xs font-semibold text-gray-800 mb-1">
                {language === 'te' ? '✨ వేదిక యొక్క బాధ్యతలు:' : '✨ Agent Capabilities:'}
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">💼</span>
                  <span>
                    {language === 'te' 
                      ? 'ఫార్మర్‌కు అనుకూలంగా ఎగుమతి మరియు హోల్‌సేల్‌లో డీల్స్ పూర్తి చేస్తుంది'
                      : 'Closes deals with retailers and wholesalers on behalf of farmer'
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>
                    {language === 'te' 
                      ? 'ఉత్తమ మార్కెట్ తెలివి మరియు ఆర్థిక విశ్లేషణ అందిస్తుంది'
                      : 'Provides excellent market intelligence and pricing analysis'
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🤝</span>
                  <span>
                    {language === 'te' 
                      ? 'విజయవంతమైన వ్యాపార వాటికి సహాయపడుతుంది'
                      : 'Helps negotiate successful business deals'
                    }
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'te' ? 'ఫోన్:' : 'Phone:'}</span>
                <span className="font-medium">+91 98765 43210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'te' ? 'అనుభవం:' : 'Experience:'}</span>
                <span className="font-medium">8+ Years Sales</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'te' ? 'రేటింగ్:' : 'Rating:'}</span>
                <span className="font-medium">⭐ 4.9/5 (200+ Deals)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'te' ? 'ఖాతాదారులు:' : 'Specialty:'}</span>
                <span className="font-medium text-green-600">
                  {language === 'te' ? '🎯 వ్యాపార ముగింపు' : '🎯 Deal Closure'}
                </span>
              </div>
            </div>
          </div>

          {/* Call Button */}
          <button
            onClick={handleCallAgent}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <PhoneCall className="h-4 w-4" />
            <span>{language === 'te' ? 'ఏజెంట్‌ను కాల్ చేయండి' : 'Call Agent'}</span>
          </button>

          {/* Call Features */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900">
                {language === 'te' ? '24/7 అందుబాటులో' : '24/7 Available'}
              </div>
              <div className="text-gray-600">
                {language === 'te' ? 'అన్ని సమయాల్లో' : 'All Hours'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900">
                {language === 'te' ? 'వెంటనే సమాధానం' : 'Instant Response'}
              </div>
              <div className="text-gray-600">
                {language === 'te' ? '< 5 నిమిషాలు' : '< 5 minutes'}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center">
            {language === 'te' 
              ? 'మీ టర్మరిక్ గురించి ప్రశ్నలు ఉంటే మా స్పెషలిస్ట్‌ను కాల్ చేయండి'
              : 'Call our specialist for any questions about your turmeric'
            }
          </div>

          {/* Twilio Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-yellow-800 font-medium mb-1">
                  {language === 'te' ? 'Twilio ఖాతా గమనిక' : 'Twilio Account Notice'}
                </p>
                <p className="text-yellow-700 mb-1">
                  {language === 'te' 
                    ? 'ఉచిత ఖాతా - ధృవీకరించబడిన నంబర్లకు మాత్రమే కాల్‌లు'
                    : 'Free account - calls only to verified numbers'
                  }
                </p>
                <p className="text-yellow-700">
                  {language === 'te' 
                    ? 'ధృవీకరణ: 9100982321 | మానవ వంటి వాయిస్'
                    : 'Verify: 9100982321 | Human-like voice'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Agent Modal */}
      <CallAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farmerPhone={farmerPhone}
        buyerPhone={buyerPhone}
        batchId={batchId}
      />
    </>
  );
}
