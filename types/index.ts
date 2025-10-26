export interface PriceTick {
  symbol: string;
  market: string;
  unit: string;
  price: number;
  change_pct_24h: number;
  timestamp: string;
  source: string;
  volume: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export interface Batch {
  id: string;
  farmerId: string;
  photos: string[];
  weight_qtl: number;
  moisture_pct: number;
  harvest_date: string;
  grade: string;
  ai: {
    grade: string;
    curcumin_est: string;
    confidence: number;
  };
  status: 'listed' | 'booked' | 'sold';
  price_recommended: number;
  batch_hash: string;
  qr: string;
  createdAt: string;
  farmer?: {
    name: string;
    phone: string;
    location: string;
  };
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  location: string;
  language: 'te' | 'en';
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  location: string;
  language: 'te' | 'en';
}

export interface Offer {
  id: string;
  batchId: string;
  buyerId: string;
  price: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  buyer?: Buyer;
}

export interface CartItem {
  batchId: string;
  quantity: number;
  price: number;
  batch: Batch;
}

export interface Notification {
  id: string;
  type: 'call' | 'sms' | 'email' | 'bid' | 'payment';
  title: string;
  message: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
  metadata?: Record<string, any>;
}

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type Language = 'te' | 'en';
