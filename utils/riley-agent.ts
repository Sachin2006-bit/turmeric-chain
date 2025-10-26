// TurmericChain Multilingual Sales Agent (Riley) - System Prompt and Utility Functions

export const RILEY_SYSTEM_PROMPT = `
You are "Riley" — the TurmericChain multilingual sales call agent. Your role is to call retailers and wholesalers on behalf of turmeric farmers, negotiate professionally, close deals, and return a short SMS call-summary to the farmer. Be friendly, confident, sales-savvy, and extremely clear for low-literacy users. Prioritize Telugu when language = "te", Hindi when language = "hi", otherwise use English. Keep spoken replies brief (1–2 short sentences) and always include a small machine-readable metadata for the frontend to act on.

CURRENT MARKET REFERENCE
- Use the provided current market price as a reference: ₹15,315 per quintal. Use live API data when available but if not provided, default to the above for price suggestions.

PRIMARY GUIDELINES
1. PURPOSE
   - Make outbound calls to buyers (retailers/wholesalers), negotiate price & quantity on behalf of the farmer, and try to close a deal (agree price, quantity, pickup logistics, and payment terms).
   - After the call completes, prepare a concise SMS summary to be sent to the farmer with the negotiation outcome and contact details.

2. TONE & STYLE
   - Friendly, confident, polite, and results-oriented — sound like an experienced sales rep.
   - Use very short sentences for voice output (max 2 sentences per reply). Use clear local phrasing in Telugu/Hindi.
   - Ask only one question at a time.

3. MULTI-LINGUAL & LOW-LITERACY RULES
   - Always reply in the language field: "te" → Telugu, "hi" → Hindi, "en" → English.
   - Read phone numbers and monetary amounts digit-by-digit when confirming (e.g., "9 8 5 0 1 2 3 4 5").
   - For farmers flagged low-literacy, use simpler words and offer to repeat or send SMS.

4. SAFETY & ACCURACY
   - Do not invent facts. If a required fact (price, qty, date) is missing, ask one clarifying question to obtain it.
   - When using market references, clearly state the source if available (e.g., "Reference price: AGMARKNET / local feed — ₹15,315/qtl").
`;

// Generate Riley's response based on user input and context
export function getRileyResponse(
  input: string,
  language: 'te' | 'hi' | 'en' = 'en',
  currentPrice?: number,
  marketData?: any
): {
  reply_text: string;
  language: string;
  action: string;
  action_payload?: any;
  confidence: number;
  source?: string;
  negotiation_hint?: string;
} {
  const lowerInput = input.toLowerCase();
  const price = currentPrice || 15315; // Fallback to reference price
  
  // Language-specific response templates
  const responses = {
    te: {
      greetings: ['నమస్కారం! నేను రైలీ. టర్మరిక్ చైన్‌లో మీ సహాయకుడు. మీకు ఏమి కావాలి?', 'హలో! నేను రైలీ. నేను ఎలా సహాయం చేయగలను?'],
      price_check: [`ప్రస్తుత టర్మరిక్ ధర ₹${price.toLocaleString()} క్వింటల్‌కు ఉంది. మీరు విక్రయించాలనుకుంటున్నారా?`, `డిమాండ్ మంచిగా ఉంది. ₹${price.toLocaleString()} క్వింటల్‌కు.`],
      market_info: ['మార్కెట్ బలంగా ఉంది. డిమాండ్ ఎక్కువ. మీరు విక్రయించవచ్చు.', 'మార్కెట్ పరిస్థితులు మంచివి. ధరలు పెరగవచ్చు.'],
      call_request: ['నేను కొనుగోలుదారుని కాల్ చేస్తాను. ధర మరియు పరిమాణాన్ని డిస్కస్ చేస్తాను. కొనసాగించవచ్చా?', 'నేను బైయర్‌తో మాట్లాడుతున్నాను. మీకు డీల్ కుదిరితే SMS పంపుతాను.'],
      default: ['మీరు ఏదైనా ప్రశ్న అడగవచ్చు. ధర, మార్కెట్, లేదా విక్రయం గురించి.', 'నేను ఎలా సహాయపడగలను? మీ క్వశ్చన్ ఏమిటి?']
    },
    hi: {
      greetings: ['नमस्ते! मैं राइली हूं। टर्मरिक चेन में आपकी सहायक। आपको क्या चाहिए?', 'हैलो! मैं राइली हूं। मैं कैसे मदद कर सकती हूं?'],
      price_check: [`वर्तमान टर्मरिक कीमत ₹${price.toLocaleString()} प्रति क्विंटल है। क्या आप बेचना चाहते हैं?`, `मांग अच्छी है। ₹${price.toLocaleString()} प्रति क्विंटल।`],
      market_info: ['बाजार मजबूत है। मांग अधिक है। आप बेच सकते हैं।', 'बाजार की स्थिति अच्छी है। कीमतें बढ़ सकती हैं।'],
      call_request: ['मैं खरीदार को कॉल करूंगी। मूल्य और मात्रा पर चर्चा करूंगी। क्या जारी रखें?', 'मैं खरीदार से बात कर रही हूं। अगर आपको डील मिलती है तो SMS भेजूंगी।'],
      default: ['आप कोई प्रश्न पूछ सकते हैं। कीमत, बाजार, या बिक्री के बारे में।', 'मैं कैसे मदद कर सकती हूं? आपका प्रश्न क्या है?']
    },
    en: {
      greetings: ['Hello! I am Riley, your assistant at TurmericChain. How can I help you?', 'Hi! I am Riley. What do you need?'],
      price_check: [`Current turmeric price is ₹${price.toLocaleString()} per quintal. Do you want to sell?`, `Demand is good. ₹${price.toLocaleString()} per quintal.`],
      market_info: ['Market is strong. High demand. You can sell.', 'Market conditions are good. Prices might increase.'],
      call_request: ['I will call the buyer. Discuss price and quantity. Can I proceed?', 'I am talking to the buyer. If you get a deal, I will send SMS.'],
      default: ['You can ask any question. About price, market, or selling.', 'How can I help? What is your question?']
    }
  };

  // Determine response type
  let responseType = 'default';
  let action = 'NONE';
  let confidence = 0.7;

  if (lowerInput.includes('greeting') || lowerInput.includes('hello') || lowerInput.includes('hi') || 
      lowerInput.includes('నమస్కార') || lowerInput.includes('హలో') || lowerInput.includes('नमस्ते')) {
    responseType = 'greetings';
    action = 'NONE';
  } else if (lowerInput.includes('price') || lowerInput.includes('ధర') || lowerInput.includes('कीमत') ||
             lowerInput.includes('rate') || lowerInput.includes('rates')) {
    responseType = 'price_check';
    action = 'NONE';
    confidence = 0.9;
  } else if (lowerInput.includes('market') || lowerInput.includes('మార్కెట్') || lowerInput.includes('बाजार')) {
    responseType = 'market_info';
    action = 'NONE';
    confidence = 0.8;
  } else if (lowerInput.includes('call') || lowerInput.includes('కాల్') || lowerInput.includes('कॉल') ||
             lowerInput.includes('buyer') || lowerInput.includes('కొనుగోలుదారు') || lowerInput.includes('खरीदार')) {
    responseType = 'call_request';
    action = 'REQUEST_CALL_AGENT';
    confidence = 0.85;
  }

  // Get appropriate response
  const responseSet = responses[language];
  const responseArray = (responseSet as any)[responseType] || responseSet.default;
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  const reply_text = responseArray[randomIndex];

  // Build action payload if needed
  let action_payload = undefined;
  if (action === 'REQUEST_CALL_AGENT') {
    action_payload = {
      farmerPhone: '+919876543210',
      language: language
    };
  }

  // Generate negotiation hint for price discussions
  let negotiation_hint = undefined;
  if (responseType === 'price_check') {
    const suggestedPrice = price * 1.05; // 5% above current
    const fallbackPrice = price * 1.02; // 2% above current
    negotiation_hint = language === 'te' 
      ? `Ask: ₹${Math.round(suggestedPrice).toLocaleString()}/qtl\nFallback: ₹${Math.round(fallbackPrice).toLocaleString()}/qtl`
      : `Ask: ₹${Math.round(suggestedPrice).toLocaleString()}/qtl\nFallback: ₹${Math.round(fallbackPrice).toLocaleString()}/qtl`;
  }

  return {
    reply_text,
    language,
    action,
    action_payload,
    confidence,
    source: marketData ? 'live_api' : 'reference_price',
    negotiation_hint
  };
}

// Parse phone number into digit-by-digit format
export function formatPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '').split('').join(' ');
}

// Generate SMS summary for farmer
export function generateSMSSummary(
  dealInfo: {
    buyerName: string;
    buyerPhone: string;
    price: number;
    quantity: number;
    pickupDate?: string;
    paymentTerms?: string;
  },
  language: 'te' | 'hi' | 'en' = 'en'
): string {
  const { buyerName, buyerPhone, price, quantity, pickupDate, paymentTerms } = dealInfo;
  const phoneDigits = formatPhoneDigits(buyerPhone);
  const totalValue = price * quantity;

  const templates = {
    te: `డీల్ నిర్ధారణ: ${buyerName}, ${phoneDigits}. మొత్తం: ₹${totalValue.toLocaleString()}, ${quantity}q @ ₹${price.toLocaleString()}/q. ఎంతకు: ${pickupDate || 'TBD'}. ${paymentTerms || 'UPI'}.`,
    hi: `डील पुष्टि: ${buyerName}, ${phoneDigits}। कुल: ₹${totalValue.toLocaleString()}, ${quantity}q @ ₹${price.toLocaleString()}/q। कब: ${pickupDate || 'TBD'}। ${paymentTerms || 'UPI'}।`,
    en: `Deal confirmed: ${buyerName}, ${phoneDigits}. Total: ₹${totalValue.toLocaleString()}, ${quantity}q @ ₹${price.toLocaleString()}/q. When: ${pickupDate || 'TBD'}. ${paymentTerms || 'UPI'}.`
  };

  return templates[language];
}
