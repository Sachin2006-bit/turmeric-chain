import { Farmer, Buyer, Batch, PriceTick, Offer } from '../src/types';

export const mockFarmers: Farmer[] = [
  {
    id: 'farmer_01',
    name: 'రామయ్య',
    phone: '+919876543210',
    location: 'నిజామాబాద్',
    language: 'te'
  },
  {
    id: 'farmer_02',
    name: 'సీతారామయ్య',
    phone: '+919876543211',
    location: 'అదిలాబాద్',
    language: 'te'
  },
  {
    id: 'farmer_03',
    name: 'వెంకటేశ్',
    phone: '+919876543212',
    location: 'కరీంనగర్',
    language: 'te'
  },
  {
    id: 'farmer_04',
    name: 'Rajesh Kumar',
    phone: '+919876543213',
    location: 'Nizamabad',
    language: 'en'
  }
];

export const mockBuyers: Buyer[] = [
  {
    id: 'buyer_01',
    name: 'అగ్రో ట్రేడర్స్',
    phone: '+919876543220',
    location: 'హైదరాబాద్',
    language: 'te'
  },
  {
    id: 'buyer_02',
    name: 'స్పైస్ ఎక్స్పోర్ట్',
    phone: '+919876543221',
    location: 'విజయవాడ',
    language: 'te'
  },
  {
    id: 'buyer_03',
    name: 'Premium Spices Co.',
    phone: '+919876543222',
    location: 'Mumbai',
    language: 'en'
  }
];

export const mockBatches: Batch[] = [
  {
    id: 'batch_001',
    farmerId: 'farmer_01',
    photos: ['/api/placeholder/400/300?i=0', '/api/placeholder/400/300?i=1'],
    weight_qtl: 2.5,
    moisture_pct: 8.5,
    harvest_date: '2025-10-10',
    grade: 'Finger',
    ai: {
      grade: 'A',
      curcumin_est: '2.5%',
      confidence: 0.78
    },
    status: 'listed',
    price_recommended: 8400,
    batch_hash: 'sha256:abc123...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T10:00:00Z',
    farmer: mockFarmers[0]
  },
  {
    id: 'batch_002',
    farmerId: 'farmer_02',
    photos: ['/api/placeholder/400/300?i=1', '/api/placeholder/400/300?i=2'],
    weight_qtl: 3.2,
    moisture_pct: 7.8,
    harvest_date: '2025-10-12',
    grade: 'Finger',
    ai: {
      grade: 'A+',
      curcumin_est: '3.1%',
      confidence: 0.85
    },
    status: 'listed',
    price_recommended: 9200,
    batch_hash: 'sha256:def456...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T11:00:00Z',
    farmer: mockFarmers[1]
  },
  {
    id: 'batch_003',
    farmerId: 'farmer_03',
    photos: ['/api/placeholder/400/300?i=2', '/api/placeholder/400/300?i=3'],
    weight_qtl: 1.8,
    moisture_pct: 9.2,
    harvest_date: '2025-10-08',
    grade: 'Bulb',
    ai: {
      grade: 'B',
      curcumin_est: '1.8%',
      confidence: 0.72
    },
    status: 'booked',
    price_recommended: 7200,
    batch_hash: 'sha256:ghi789...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T09:00:00Z',
    farmer: mockFarmers[2]
  },
  {
    id: 'batch_004',
    farmerId: 'farmer_04',
    photos: ['/api/placeholder/400/300?i=3', '/api/placeholder/400/300?i=4'],
    weight_qtl: 4.1,
    moisture_pct: 8.0,
    harvest_date: '2025-10-15',
    grade: 'Finger',
    ai: {
      grade: 'A',
      curcumin_est: '2.8%',
      confidence: 0.81
    },
    status: 'listed',
    price_recommended: 8800,
    batch_hash: 'sha256:jkl012...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T12:00:00Z',
    farmer: mockFarmers[3]
  },
  {
    id: 'batch_005',
    farmerId: 'farmer_01',
    photos: ['/api/placeholder/400/300?i=4', '/api/placeholder/400/300?i=5'],
    weight_qtl: 2.9,
    moisture_pct: 7.5,
    harvest_date: '2025-10-18',
    grade: 'Finger',
    ai: {
      grade: 'A+',
      curcumin_est: '3.2%',
      confidence: 0.88
    },
    status: 'sold',
    price_recommended: 9500,
    batch_hash: 'sha256:mno345...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T08:00:00Z',
    farmer: mockFarmers[0]
  },
  {
    id: 'batch_006',
    farmerId: 'farmer_02',
    photos: ['/api/placeholder/400/300?i=5', '/api/placeholder/400/300?i=6'],
    weight_qtl: 3.7,
    moisture_pct: 8.8,
    harvest_date: '2025-10-20',
    grade: 'Bulb',
    ai: {
      grade: 'B+',
      curcumin_est: '2.1%',
      confidence: 0.75
    },
    status: 'listed',
    price_recommended: 7800,
    batch_hash: 'sha256:pqr678...',
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: '2025-10-25T13:00:00Z',
    farmer: mockFarmers[1]
  }
];

export const mockPriceTicks: PriceTick[] = [
  {
    symbol: 'TURMERIC',
    market: 'Nizamabad',
    unit: 'quintal',
    price: 8250,
    change_pct_24h: 2.3,
    timestamp: '2025-10-25T14:02:12+05:30',
    source: 'agmarknet',
    volume: 2500,
    ohlc: {
      open: 8200,
      high: 8300,
      low: 8100,
      close: 8250
    }
  },
  {
    symbol: 'TURMERIC',
    market: 'Adilabad',
    unit: 'quintal',
    price: 8150,
    change_pct_24h: 1.8,
    timestamp: '2025-10-25T14:02:12+05:30',
    source: 'agmarknet',
    volume: 1800,
    ohlc: {
      open: 8100,
      high: 8200,
      low: 8050,
      close: 8150
    }
  },
  {
    symbol: 'TURMERIC',
    market: 'Karimnagar',
    unit: 'quintal',
    price: 8350,
    change_pct_24h: 3.1,
    timestamp: '2025-10-25T14:02:12+05:30',
    source: 'agmarknet',
    volume: 3200,
    ohlc: {
      open: 8200,
      high: 8400,
      low: 8150,
      close: 8350
    }
  }
];

export const mockOffers: Offer[] = [
  {
    id: 'offer_001',
    batchId: 'batch_001',
    buyerId: 'buyer_01',
    price: 8500,
    quantity: 2.5,
    status: 'pending',
    createdAt: '2025-10-25T14:30:00Z',
    buyer: mockBuyers[0]
  },
  {
    id: 'offer_002',
    batchId: 'batch_002',
    buyerId: 'buyer_02',
    price: 9000,
    quantity: 3.2,
    status: 'pending',
    createdAt: '2025-10-25T15:00:00Z',
    buyer: mockBuyers[1]
  }
];
