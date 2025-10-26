import { PriceTick } from '../types';

// Store live price data to historical API
export async function storePriceToHistory(priceData: PriceTick): Promise<boolean> {
  try {
    const response = await fetch('/api/price/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: priceData.timestamp,
        price: priceData.price,
        volume: priceData.volume,
        change_pct_24h: priceData.change_pct_24h,
        market: priceData.market
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Price data stored to history:', result);
    return true;
  } catch (error) {
    console.error('Error storing price to history:', error);
    return false;
  }
}

// Enhanced price data fetcher that also stores to history
export async function fetchAndStorePriceData(): Promise<PriceTick[]> {
  try {
    // Import the existing fetchPriceData function
    const { fetchPriceData } = await import('./api');
    const priceData = await fetchPriceData();
    
    // Store each price tick to history
    for (const priceTick of priceData) {
      await storePriceToHistory(priceTick);
    }
    
    return priceData;
  } catch (error) {
    console.error('Error fetching and storing price data:', error);
    return [];
  }
}
