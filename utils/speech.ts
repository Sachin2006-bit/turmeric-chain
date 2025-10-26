export class SpeechSynthesisHelper {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    // If voices are not loaded yet, wait for them
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  speak(text: string, language: 'te' | 'en' = 'en', rate: number = 0.8) {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find appropriate voice for the language
    const voice = this.voices.find(v => 
      language === 'te' ? v.lang.startsWith('te') : v.lang.startsWith('en')
    );
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

export class SpeechRecognitionHelper {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'te-IN'; // Default to Telugu
  }

  startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    language: 'te' | 'en' = 'te'
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    // Prevent starting if already listening
    if (this.isListening) {
      console.log('Speech recognition already in progress');
      return;
    }

    // Stop any existing recognition first
    try {
      this.recognition.stop();
      // Small delay to ensure it's stopped
      setTimeout(() => {
        this.isListening = true;
        this.recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
          this.isListening = false;
        };

        this.recognition.onerror = (event: any) => {
          // Filter out "network" errors that are not critical
          if (event.error !== 'network') {
            onError?.(event.error);
          }
          this.isListening = false;
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };

        try {
          this.recognition.start();
        } catch (err: any) {
          console.error('Error starting recognition:', err);
          this.isListening = false;
          onError?.('Failed to start speech recognition');
        }
      }, 100);
    } catch (err) {
      console.error('Error stopping recognition:', err);
      // If stop fails, still try to start
      this.isListening = true;
      this.recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'network') {
          onError?.(event.error);
        }
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (startErr: any) {
        console.error('Error starting recognition:', startErr);
        this.isListening = false;
        onError?.('Failed to start speech recognition');
      }
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        if (this.isListening) {
          this.recognition.stop();
        }
        this.isListening = false;
      } catch (err) {
        console.error('Error stopping recognition:', err);
        this.isListening = false;
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Enhanced rule-based response system with conversation context
export function getEnhancedResponse(
  text: string, 
  language: 'te' | 'en' = 'en',
  conversationHistory: Array<{input: string; response: string; timestamp: Date}> = []
): string {
  const lowerText = text.toLowerCase();
  const responseCount = conversationHistory.length;
  
  // Generate varied responses based on conversation history
  const responses = {
    te: {
      price: [
        'ప్రస్తుత టర్మరిక్ ధర ₹8,250 క్వింటల్‌కు ఉంది. ఇది గత 24 గంటలలో 2.3% పెరిగింది.',
        'ధరలు బాగా బలంగా ఉన్నాయి. ₹8,250 క్వింటల్‌కు ఉంది. మీరు విక్రయించవచ్చు.',
        'టర్మరిక్ ధరలు పెరుగుతున్నాయి. ప్రస్తుత ధర ₹8,250. మంచి సమయం విక్రయించడానికి.',
        'ధరలు స్థిరంగా ఉన్నాయి. ₹8,250 క్వింటల్‌కు. మీరు ఇప్పుడు విక్రయించవచ్చు.'
      ],
      market: [
        'నిజామాబాద్ మార్కెట్‌లో బలమైన డిమాండ్ ఉంది. మీరు 2-3 రోజులు వేచి ఉండవచ్చు.',
        'మార్కెట్ బాగా బలంగా ఉంది. డిమాండ్ ఎక్కువగా ఉంది. మీరు వేచి ఉండవచ్చు.',
        'మార్కెట్ పరిస్థితులు మంచివి. ధరలు పెరగవచ్చు. మీరు కొద్ది రోజులు వేచి ఉండండి.',
        'మార్కెట్ లో బలమైన డిమాండ్ ఉంది. ధరలు స్థిరంగా ఉన్నాయి.'
      ],
      sell: [
        'ఇప్పుడు విక్రయించడం మంచిది. AI సూచన ప్రకారం ధరలు పెరగవచ్చు.',
        'విక్రయించడానికి మంచి సమయం. ధరలు బలంగా ఉన్నాయి. మీరు విక్రయించవచ్చు.',
        'ఇప్పుడు విక్రయించండి. మార్కెట్ పరిస్థితులు మంచివి. మీకు మంచి ధర లభిస్తుంది.',
        'విక్రయించడానికి సరైన సమయం. ధరలు ఎక్కువగా ఉన్నాయి.'
      ],
      default: [
        'మీరు ఏదైనా ప్రశ్న అడగవచ్చు. ధర, మార్కెట్, లేదా విక్రయం గురించి తెలుసుకోండి.',
        'మీరు ధరలు, మార్కెట్ పరిస్థితులు, లేదా విక్రయం గురించి అడగవచ్చు.',
        'ధరలు, మార్కెట్, లేదా విక్రయం గురించి మీరు ఏదైనా అడగవచ్చు.',
        'మీరు టర్మరిక్ వ్యాపారం గురించి ఏదైనా తెలుసుకోవచ్చు.'
      ]
    },
    en: {
      price: [
        'Current turmeric price is ₹8,250 per quintal. It has increased by 2.3% in the last 24 hours.',
        'Prices are strong at ₹8,250 per quintal. You can sell now.',
        'Turmeric prices are rising. Current price is ₹8,250. Good time to sell.',
        'Prices are stable at ₹8,250 per quintal. You can sell now.'
      ],
      market: [
        'Nizamabad market shows strong demand. You can wait for 2-3 days.',
        'Market is very strong. High demand. You can wait.',
        'Market conditions are good. Prices might increase. Wait for few days.',
        'Strong demand in market. Prices are stable.'
      ],
      sell: [
        'It\'s good to sell now. AI suggests prices might increase further.',
        'Good time to sell. Prices are strong. You can sell.',
        'Sell now. Market conditions are good. You will get good price.',
        'Right time to sell. Prices are high.'
      ],
      default: [
        'You can ask any question. Learn about prices, market, or selling.',
        'You can ask about prices, market conditions, or selling.',
        'Ask anything about prices, market, or selling.',
        'You can learn anything about turmeric business.'
      ]
    }
  };

  // Select response based on input and conversation history
  let responseType = 'default';
  if (lowerText.includes('ధర') || lowerText.includes('price')) {
    responseType = 'price';
  } else if (lowerText.includes('మార్కెట్') || lowerText.includes('market')) {
    responseType = 'market';
  } else if (lowerText.includes('విక్రయించు') || lowerText.includes('sell')) {
    responseType = 'sell';
  }

  // Get varied response based on conversation count
  const responseArray = (responses[language] as any)[responseType];
  const responseIndex = responseCount % responseArray.length;
  
  return responseArray[responseIndex];
}

// Simple rule-based response system for demo (kept for backward compatibility)
export function getSimpleResponse(text: string, language: 'te' | 'en' = 'en'): string {
  return getEnhancedResponse(text, language, []);
}
