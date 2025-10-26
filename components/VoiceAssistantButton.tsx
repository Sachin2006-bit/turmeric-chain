'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../lib/context';
import { translations } from '../locales/translations';
import { textToSpeech } from '../utils/elevenlabs';

interface VoiceAssistantButtonProps {
  farmerPhone?: string;
  className?: string;
}

export function VoiceAssistantButton({ 
  farmerPhone = '+919876543210',
  className = ''
}: VoiceAssistantButtonProps) {
  const { language, currentPrice } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = translations[language];

  // Announce current price using ElevenLabs
  const announcePrice = async () => {
    if (!currentPrice) {
      const message = language === 'te' 
        ? 'ధర సమాచారం అందుబాటులో లేదు'
        : 'Price information not available';
      console.log(message);
      return;
    }

    setIsSpeaking(true);
    
    try {
      // Generate price announcement text
      const priceText = language === 'te'
        ? `ప్రస్తుత టర్మరిక్ ధర ${currentPrice.price.toLocaleString()} రూపాయలు క్వింటల్‌కు ఉంది. మార్పు ${currentPrice.change_pct_24h > 0 ? 'పెరిగింది' : 'తగ్గింది'} ${Math.abs(currentPrice.change_pct_24h).toFixed(2)} శాతం.`
        : `Current turmeric price is ${currentPrice.price.toLocaleString()} rupees per quintal. Change is ${currentPrice.change_pct_24h > 0 ? 'up' : 'down'} ${Math.abs(currentPrice.change_pct_24h).toFixed(2)} percent.`;

      console.log('Announcing price:', priceText);

      // Use ElevenLabs TTS
      const audioUrl = await textToSpeech(priceText);
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          console.error('Error playing ElevenLabs audio');
          setIsSpeaking(false);
        };
        await audio.play();
      } else {
        console.log('ElevenLabs TTS failed, using fallback');
        // Fallback: use browser TTS
        const utterance = new SpeechSynthesisUtterance(priceText);
        utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error announcing price:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'}
        </h3>
        
        {/* Announce Price Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={announcePrice}
            disabled={isSpeaking || !currentPrice}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isSpeaking
                ? 'bg-yellow-500 text-white cursor-not-allowed'
                : currentPrice
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            } disabled:opacity-50`}
          >
            {isSpeaking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{language === 'te' ? 'మాట్లాడుతోంది...' : 'Speaking...'}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                <span>
                  {language === 'te' 
                    ? 'ధర వినండి' 
                    : currentPrice 
                      ? `Announce Price (₹${currentPrice.price.toLocaleString()})`
                      : 'Price Not Available'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Status */}
        {!currentPrice && (
          <p className="text-sm text-red-600">
            {language === 'te' ? 'ధర సమాచారం లోడ్ కావడంలో...' : 'Loading price information...'}
          </p>
        )}

        {currentPrice && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              {language === 'te' 
                ? 'మీరు బటన్‌ను నొక్కినప్పుడు, ప్రస్తుత టర్మరిక్ ధరను విన్నారు' 
                : 'Click the button to hear the current turmeric price'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
