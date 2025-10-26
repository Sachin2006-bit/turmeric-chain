import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyDxJqODbQSJ3tq6uDPcivZUmAraXGSUthg';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function geminiConversation(userMessage: string, language: 'te' | 'en' = 'en', currentPrice?: number): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  try {
    console.log('Starting Gemini conversation...');
    
    // Use Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const systemPrompt = `
You are Riley, a helpful agricultural assistant for the TurmericChain platform. You help farmers and buyers with turmeric market information, pricing, and transactions.

Current Market Context:
- Current Turmeric Price: ₹${currentPrice || 15360} per quintal
- Market: Nizamabad
- Language: ${language === 'te' ? 'Telugu' : 'English'}

Your personality:
- Friendly and approachable
- Knowledgeable about turmeric cultivation and pricing
- Helpful in transactions
- Conversational and natural

Instructions:
- Respond naturally in a conversational manner
- Be concise but informative
- If asked about prices, mention the current live price
- If asked to connect farmers with buyers, provide helpful guidance
- Keep responses under 100 words unless detailed explanation is needed
- Use the appropriate language (${language === 'te' ? 'Telugu' : 'English'})

User message: ${userMessage}
`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Gemini response received:', text);
    
    return {
      success: true,
      response: text
    };
  } catch (error) {
    console.error('Gemini conversation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

