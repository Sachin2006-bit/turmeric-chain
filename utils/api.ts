import { PriceTick, Notification } from '../types';
import { getEnhancedResponse } from './speech';

// MoneyControl API integration for live turmeric prices
export async function fetchMoneyControlPrice(): Promise<PriceTick | null> {
  // Use our server-side API route to avoid CORS issues
  const apiUrl = '/api/price/moneycontrol';
  
  try {
    console.log('Fetching live turmeric price from MoneyControl API via server route...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('MoneyControl API response:', data);
    
    if (data.code === '200' && data.data) {
      const priceData = data.data;
      
      // Calculate percentage change
      const change = priceData.lastPrice - priceData.prevClose;
      const changePercent = (change / priceData.prevClose) * 100;
      
      const priceTick: PriceTick = {
        symbol: 'TURMERIC',
        market: 'Nizamabad',
        unit: 'quintal',
        price: Math.round(priceData.lastPrice),
        change_pct_24h: Math.round(changePercent * 100) / 100,
        timestamp: new Date().toISOString(),
        source: 'moneycontrol',
        volume: Math.round(priceData.tradedVol || 0),
        ohlc: {
          open: Math.round(priceData.openPrice || priceData.lastPrice),
          high: Math.round(priceData.highPrice || priceData.lastPrice),
          low: Math.round(priceData.lowPrice || priceData.lastPrice),
          close: Math.round(priceData.lastPrice)
        }
      };
      
      console.log('Live price data processed:', priceTick);
      return priceTick;
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    console.error('Error fetching MoneyControl price data:', error);
    return null;
  }
}

// Price API integration
export async function fetchPriceData(): Promise<PriceTick[]> {
  // Try to fetch live data from MoneyControl first
  const livePrice = await fetchMoneyControlPrice();
  
  if (livePrice) {
    return [livePrice];
  }
  
  // Fallback to mock data if live API fails
  console.log('Falling back to mock data due to API error');
  return getMockPriceData();
}

// Mock price data generator
function getMockPriceData(): PriceTick[] {
  const basePrice = 8000 + Math.random() * 1000;
  const change = (Math.random() - 0.5) * 10; // -5% to +5%
  
  return [
    {
      symbol: 'TURMERIC',
      market: 'Nizamabad',
      unit: 'quintal',
      price: Math.round(basePrice),
      change_pct_24h: Math.round(change * 10) / 10,
      timestamp: new Date().toISOString(),
      source: 'agmarknet',
      volume: Math.round(2000 + Math.random() * 1000),
      ohlc: {
        open: Math.round(basePrice - 100),
        high: Math.round(basePrice + 200),
        low: Math.round(basePrice - 200),
        close: Math.round(basePrice)
      }
    }
  ];
}

// n8n Webhook integration
export async function triggerN8nWebhook(
  type: 'CALL_AGENT' | 'AI_CHAT' | 'PAYMENT_SUCCESS' | 'NEW_OFFER',
  data: Record<string, any>
): Promise<{success: boolean; response?: any; error?: string}> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('N8N webhook not configured, simulating action:', type, data);
    return {success: true, response: null}; // Simulate success for demo
  }

  try {
    console.log('Calling n8n webhook:', {
      url: webhookUrl,
      type,
      data,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('N8N webhook response:', responseData);

    return {
      success: true,
      response: responseData
    };
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Call Agent simulation
export async function triggerCallAgent(
  farmerPhone: string,
  buyerPhone: string,
  batchId: string,
  language: 'te' | 'en' = 'en'
): Promise<boolean> {
  return await triggerN8nWebhook('CALL_AGENT', {
    farmer: { phone: farmerPhone },
    buyer: { phone: buyerPhone },
    batchId,
    language
  });
}

// AI Chat with ElevenLabs Agent integration
export async function triggerAIChat(
  text: string,
  farmerPhone: string,
  language: 'te' | 'en' = 'en'
): Promise<{success: boolean; response?: string; audioUrl?: string; error?: string}> {
  console.log('Triggering AI Chat with ElevenLabs:', {
    text,
    farmerPhone,
    language,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Directly use n8n webhook
    console.log('Using n8n webhook for AI response');
    
    // Fallback to n8n webhook
    const n8nResult = await triggerN8nWebhook('AI_CHAT', {
      text,
      farmerPhone,
      language
    });
    
    if (n8nResult.success && n8nResult.response) {
      const responseText = n8nResult.response.message || n8nResult.response.response || n8nResult.response.text || n8nResult.response;
      return {
        success: true,
        response: typeof responseText === 'string' ? responseText : JSON.stringify(responseText)
      };
    }
    
    // Final fallback to local response
    console.log('Both ElevenLabs and n8n failed, using local response');
    const localResponse = getEnhancedResponse(text, language, []);
    return {
      success: true,
      response: localResponse
    };
    
  } catch (error) {
    console.error('Error in AI Chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Payment success notification
export async function notifyPaymentSuccess(
  batchId: string,
  farmerPhone: string,
  amount: number,
  buyerPhone: string
): Promise<boolean> {
  return await triggerN8nWebhook('PAYMENT_SUCCESS', {
    batchId,
    farmerPhone,
    amount,
    buyerPhone,
    timestamp: new Date().toISOString()
  });
}

// New offer notification
export async function notifyNewOffer(
  batchId: string,
  farmerPhone: string,
  buyerPhone: string,
  offerPrice: number
): Promise<boolean> {
  return await triggerN8nWebhook('NEW_OFFER', {
    batchId,
    farmerPhone,
    buyerPhone,
    offerPrice,
    timestamp: new Date().toISOString()
  });
}

// Razorpay integration
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const razorpayLoaded = await loadRazorpayScript();
  
  if (!razorpayLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}

// Local storage utilities for demo
export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }
  return defaultValue;
}

// Notification management
export function createNotification(
  type: Notification['type'],
  title: string,
  message: string,
  metadata?: Record<string, any>
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    status: 'queued',
    createdAt: new Date().toISOString(),
    metadata
  };
}

export function saveNotification(notification: Notification): void {
  const notifications = loadFromLocalStorage<Notification[]>('notifications', []);
  notifications.unshift(notification);
  saveToLocalStorage('notifications', notifications.slice(0, 50)); // Keep last 50
}

export function getNotifications(): Notification[] {
  return loadFromLocalStorage<Notification[]>('notifications', []);
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, status: 'delivered' as const } : n
  );
  saveToLocalStorage('notifications', updated);
}
