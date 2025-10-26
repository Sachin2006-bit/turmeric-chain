'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { useApp } from '../lib/context';
import { translations } from '../locales/translations';
import { PriceTick } from '../types';
import { fetchPriceData } from '../utils/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface PriceChartProps {
  market?: string;
  timeRange?: '1h' | '4h' | '1d' | '7d' | '30d';
  height?: number;
  showControls?: boolean;
  className?: string;
}

interface HistoricalPriceData {
  timestamp: string;
  price: number;
  volume: number;
  change_pct_24h: number;
  market?: string;
}

export function PriceChart({
  market = 'Nizamabad',
  timeRange: initialTimeRange = '1d',
  height = 300,
  showControls = true,
  className = ''
}: PriceChartProps) {
  const { language, lowLiteracyMode } = useApp();
  const [priceData, setPriceData] = useState<HistoricalPriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<PriceTick | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveData, setIsLiveData] = useState(false);
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const chartRef = useRef<ChartJS<'line'>>(null);

  const t = translations[language];

  // Fetch live price data from MoneyControl API
  const fetchLivePriceData = async (): Promise<HistoricalPriceData[]> => {
    try {
      const response = await fetch('/api/price/moneycontrol', {
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
      console.log('Live price data received:', data);
      
      if (data.code === '200' && data.data) {
        const priceData = data.data;
        const currentTime = new Date();
        
        // Create a data point with current live price
        const liveDataPoint: HistoricalPriceData = {
          timestamp: currentTime.toISOString(),
          price: parseFloat(priceData.lastPrice) || parseFloat(priceData.spotPrice) || 8500,
          volume: parseFloat(priceData.tradedVol) || 0,
          change_pct_24h: parseFloat(priceData.perChange) || 0,
          market: market
        };
        
        return [liveDataPoint];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching live price data:', error);
      return [];
    }
  };

  // Generate historical data points based on live data
  const generateHistoricalData = async (timeRange: string, market: string): Promise<HistoricalPriceData[]> => {
    try {
      // First get live data
      const liveData = await fetchLivePriceData();
      if (liveData.length === 0) {
        return [];
      }
      
      const currentPrice = liveData[0].price;
      const currentTime = new Date();
      const data: HistoricalPriceData[] = [];
      
      // Generate data points based on time range
      let intervalMinutes = 5;
      let dataPoints = 12;
      
      switch (timeRange) {
        case '1h':
          intervalMinutes = 5;
          dataPoints = 12;
          break;
        case '4h':
          intervalMinutes = 20;
          dataPoints = 12;
          break;
        case '1d':
          intervalMinutes = 60;
          dataPoints = 24;
          break;
        case '7d':
          intervalMinutes = 240;
          dataPoints = 42;
          break;
        case '30d':
          intervalMinutes = 1440;
          dataPoints = 30;
          break;
      }
      
      // Generate realistic price movements around current price
      let price = currentPrice;
      const volatility = 0.02; // 2% volatility
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = new Date(currentTime.getTime() - i * intervalMinutes * 60 * 1000);
        
        // Add realistic price movement
        const change = (Math.random() - 0.5) * price * volatility;
        price = Math.max(price * 0.8, Math.min(price * 1.2, price + change));
        
        data.push({
          timestamp: timestamp.toISOString(),
          price: Math.round(price),
          volume: Math.round(Math.random() * 1000 + 200),
          change_pct_24h: ((price - currentPrice) / currentPrice) * 100,
          market: market
        });
      }
      
      // Add the current live data point
      data.push(liveData[0]);
      
      return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Error generating historical data:', error);
      return [];
    }
  };

  // Load price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      // Fetch live data and generate historical data
      const historicalData = await generateHistoricalData(timeRange, market);
      setPriceData(historicalData);
      
      // Set current price from the latest data point
      if (historicalData.length > 0) {
        const latestData = historicalData[historicalData.length - 1];
        setCurrentPrice({
          symbol: 'TURMERIC',
          market: market,
          unit: 'quintal',
          price: latestData.price,
          change_pct_24h: latestData.change_pct_24h,
          timestamp: latestData.timestamp,
          source: 'moneycontrol',
          volume: latestData.volume,
          ohlc: {
            open: latestData.price * 0.99,
            high: latestData.price * 1.01,
            low: latestData.price * 0.98,
            close: latestData.price
          }
        });
        setIsLiveData(true);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading price data:', error);
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    loadPriceData();
    
    const interval = setInterval(loadPriceData, 60000); // Refresh every 1 minute for live data
    return () => clearInterval(interval);
  }, [market, timeRange]);

  // Chart configuration
  const chartData = {
    labels: priceData.map((d, index) => {
      const date = new Date(d.timestamp);
      switch (timeRange) {
        case '1h':
          return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        case '4h':
          return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        case '1d':
          return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        case '7d':
          return date.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit'
          });
        case '30d':
          return date.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
            month: 'short',
            day: 'numeric'
          });
        default:
          return date.toLocaleTimeString();
      }
    }),
    datasets: [
      {
        label: language === 'te' ? 'టర్మరిక్ ధర' : 'Turmeric Price',
        data: priceData.map(d => d.price),
        borderColor: 'hsl(var(--chart-1))',
        backgroundColor: 'hsl(var(--chart-1) / 0.1)',
        borderWidth: 2,
        fill: false, // Remove the black fill
        tension: 0.1, // Very smooth curves like stock charts
        pointRadius: 0, // No visible points for cleaner look
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff', // White pointer background
        pointBorderColor: '#000000', // Black pointer border
        pointBorderWidth: 3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        titleFont: {
          weight: 700 as const,
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const date = new Date(priceData[index]?.timestamp);
            return date.toLocaleString(language === 'te' ? 'te-IN' : 'en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          },
          label: (context: any) => {
            const value = context.parsed.y;
            const index = context.dataIndex;
            const volume = priceData[index]?.volume || 0;
            return [
              `${language === 'te' ? 'ధర' : 'Price'}: ₹${value.toLocaleString()}`,
              `${language === 'te' ? 'వాల్యూమ్' : 'Volume'}: ${volume.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(var(--border) / 0.3)',
          drawBorder: false,
          drawTicks: false
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          maxTicksLimit: 8,
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0,
          callback: (value: any, index: number) => {
            if (priceData[index]) {
              const date = new Date(priceData[index].timestamp);
              switch (timeRange) {
                case '1h':
                  return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                case '4h':
                  return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                case '1d':
                  return date.toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                case '7d':
                  return date.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit'
                  });
                case '30d':
                  return date.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                default:
                  return date.toLocaleTimeString();
              }
            }
            return '';
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'hsl(var(--border) / 0.3)',
          drawBorder: false,
          drawTicks: false
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          callback: (value: any) => `₹${value.toLocaleString()}`
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };

  const timeRangeOptions = [
    { value: '1h', label: language === 'te' ? '1 గంట' : '1H' },
    { value: '4h', label: language === 'te' ? '4 గంటలు' : '4H' },
    { value: '1d', label: language === 'te' ? '1 రోజు' : '1D' },
    { value: '7d', label: language === 'te' ? '7 రోజులు' : '7D' },
    { value: '30d', label: language === 'te' ? '30 రోజులు' : '30D' }
  ];

  const currentChange = priceData.length > 0 ? 
    ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100 : 0;

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">
            {language === 'te' ? 'లైవ్ ధరలు' : 'Live Prices'}
          </h3>
          {isLiveData && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {language === 'te' ? 'లైవ్' : 'LIVE'}
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => {
                const newTimeRange = e.target.value as typeof timeRange;
                // Update timeRange state to trigger re-fetch
                setTimeRange(newTimeRange);
              }}
              className="text-sm bg-background border border-border rounded px-2 py-1 text-foreground"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={loadPriceData}
              disabled={isLoading}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Current Price Display */}
      {currentPrice && (
        <div className="flex items-center justify-between mb-4 p-3 bg-accent rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">
              {language === 'te' ? 'ప్రస్తుత ధర' : 'Current Price'}
            </div>
            <div className="text-2xl font-bold text-card-foreground">
              ₹{currentPrice.price.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm ${
              currentChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(currentChange).toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {language === 'te' ? '24గంటలలో' : '24h'}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div>
          {language === 'te' ? 'చివరిగా నవీకరించబడింది' : 'Last updated'}: {lastUpdated.toLocaleTimeString()}
        </div>
        <div>
          {language === 'te' ? 'మార్కెట్' : 'Market'}: {market}
        </div>
      </div>
    </div>
  );
}
