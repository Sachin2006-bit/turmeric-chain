import { NextRequest, NextResponse } from 'next/server';

interface HistoricalPriceData {
  timestamp: string;
  price: number;
  volume: number;
  change_pct_24h: number;
  market: string;
}

// In-memory storage for demo (in production, use a database)
let priceHistory: HistoricalPriceData[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1d';
    const market = searchParams.get('market') || 'Nizamabad';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log(`Fetching historical price data for ${market}, timeRange: ${timeRange}`);

    // Generate mock historical data if none exists
    if (priceHistory.length === 0) {
      priceHistory = generateMockHistoricalData(market);
    }

    // Filter data based on time range
    const filteredData = filterDataByTimeRange(priceHistory, timeRange, market);
    
    // Limit results
    const limitedData = filteredData.slice(-limit);

    return NextResponse.json({
      success: true,
      data: limitedData,
      meta: {
        timeRange,
        market,
        count: limitedData.length,
        lastUpdated: new Date().toISOString()
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    });

  } catch (error) {
    console.error('Error fetching historical price data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical price data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timestamp, price, volume, change_pct_24h, market } = body;

    // Validate required fields
    if (!timestamp || !price || !market) {
      return NextResponse.json(
        { error: 'Missing required fields: timestamp, price, market' },
        { status: 400 }
      );
    }

    const newPriceData: HistoricalPriceData = {
      timestamp,
      price: Number(price),
      volume: Number(volume) || 0,
      change_pct_24h: Number(change_pct_24h) || 0,
      market
    };

    // Add to history
    priceHistory.push(newPriceData);

    // Keep only last 1000 records to prevent memory issues
    if (priceHistory.length > 1000) {
      priceHistory = priceHistory.slice(-1000);
    }

    console.log('Added new price data:', newPriceData);

    return NextResponse.json({
      success: true,
      data: newPriceData,
      message: 'Price data added successfully'
    });

  } catch (error) {
    console.error('Error adding price data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add price data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate mock historical data
function generateMockHistoricalData(market: string): HistoricalPriceData[] {
  const data: HistoricalPriceData[] = [];
  const now = new Date();
  const basePrice = 8000 + Math.random() * 1000;
  let currentPrice = basePrice;
  let trend = 0; // Overall trend direction

  // Generate data for the last 30 days with hourly intervals
  for (let i = 30 * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour
    
    // Create more realistic price movements with trend
    const randomChange = (Math.random() - 0.5) * 10; // Smaller random movements
    const trendChange = trend * 0.1; // Gradual trend
    const totalChange = randomChange + trendChange;
    
    // Occasionally change trend direction
    if (Math.random() < 0.05) {
      trend = (Math.random() - 0.5) * 2;
    }
    
    currentPrice = Math.max(7000, Math.min(10000, currentPrice + totalChange));
    
    data.push({
      timestamp: timestamp.toISOString(),
      price: Math.round(currentPrice),
      volume: Math.round(Math.random() * 800 + 200), // More realistic volume range
      change_pct_24h: ((currentPrice - basePrice) / basePrice) * 100,
      market
    });
  }

  return data;
}

// Filter data by time range
function filterDataByTimeRange(
  data: HistoricalPriceData[], 
  timeRange: string, 
  market: string
): HistoricalPriceData[] {
  const now = new Date();
  let startTime: Date;

  switch (timeRange) {
    case '1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '4h':
      startTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      break;
    case '1d':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return data.filter(item => {
    const itemTime = new Date(item.timestamp);
    return itemTime >= startTime && item.market === market;
  });
}
