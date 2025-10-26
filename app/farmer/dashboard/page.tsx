'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Package, TrendingUp, Bell, Eye, Plus } from 'lucide-react';
import { TopNav } from '../../../components/TopNav';
import { PriceTicker } from '../../../components/PriceTicker';
import { PriceChart } from '../../../components/PriceChart';
import { VoiceAssistantButton } from '../../../components/VoiceAssistantButton';
import { AIPriceSuggestion } from '../../../components/AIPriceSuggestion';
import { CallAgent } from '../../../components/CallAgent';
import { useApp } from '../../../lib/context';
import { useAuth } from '../../../lib/auth-context';
import { translations } from '../../../locales/translations';
import { mockBatches } from '../../../mock/data';
import { Batch } from '../../../types';
import { formatPrice, formatWeight, formatDate, getStatusColor, getGradeColor } from '../../../utils';

export default function FarmerDashboard() {
  const router = useRouter();
  const { userRole, language, lowLiteracyMode, addNotification } = useApp();
  const { isAuthenticated, phoneNumber } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState({
    totalBatches: 0,
    listed: 0,
    sold: 0,
    pendingOffers: 0
  });

  const t = translations[language];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if not farmer
  useEffect(() => {
    if (isAuthenticated && userRole !== 'farmer') {
      router.push('/buyer/dashboard');
    }
  }, [isAuthenticated, userRole, router]);

  // Load farmer's batches
  useEffect(() => {
    // Filter batches for current farmer (using farmer_01 as demo)
    const farmerBatches = mockBatches.filter(batch => batch.farmerId === 'farmer_01');
    setBatches(farmerBatches);

    // Calculate stats
    setStats({
      totalBatches: farmerBatches.length,
      listed: farmerBatches.filter(b => b.status === 'listed').length,
      sold: farmerBatches.filter(b => b.status === 'sold').length,
      pendingOffers: 2 // Mock pending offers
    });
  }, []);

  const handleUploadNew = () => {
    router.push('/farmer/upload');
  };

  const handleViewListings = () => {
    router.push('/farmer/listings');
  };

  const handleViewBatch = (batchId: string) => {
    router.push(`/farmer/listings?batch=${batchId}`);
  };

  const recentBatches = batches.slice(0, 3);

  if (userRole !== 'farmer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'te' ? 'స్వాగతం, రామయ్య!' : 'Welcome, Ramayya!'}
          </h1>
          <p className="text-gray-600">
            {language === 'te' 
              ? 'మీ టర్మరిక్ వ్యాపారాన్ని నిర్వహించండి'
              : 'Manage your turmeric business'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t['farmer.total_batches']}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.totalBatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t['farmer.listed']}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.listed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t['farmer.pending_offers']}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.pendingOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{t['farmer.sold']}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.sold}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Ticker */}
            <PriceTicker market="Nizamabad" />

            {/* Price Chart */}
            <PriceChart market="Nizamabad" timeRange="1d" height={300} />

            {/* AI Price Suggestion */}
            <AIPriceSuggestion />


            {/* Call Agent */}
            <CallAgent farmerPhone="+919876543210" />

            {/* Recent Batches */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'te' ? 'ఇటీవలి బ్యాచ్‌లు' : 'Recent Batches'}
                </h2>
                <button
                  onClick={handleViewListings}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {language === 'te' ? 'అన్ని చూడండి' : 'View All'}
                </button>
              </div>

              <div className="space-y-4">
                {recentBatches.map((batch) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {language === 'te' ? `బ్యాచ్ ${batch.id.split('_')[1]}` : `Batch ${batch.id.split('_')[1]}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatWeight(batch.weight_qtl, language)} • {formatDate(batch.harvest_date, language)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                          {t[`status.${batch.status}`]}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {formatPrice(batch.price_recommended, language)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{t['grade.finger']}: {batch.grade}</span>
                        <span>{t['ai.curcumin']}: {batch.ai.curcumin_est}</span>
                      </div>
                      <button
                        onClick={() => handleViewBatch(batch.id)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{language === 'te' ? 'చూడండి' : 'View'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Voice Assistant */}
            <VoiceAssistantButton farmerPhone="+919876543210" />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'త్వరిత చర్యలు' : 'Quick Actions'}
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleUploadNew}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  <span className={lowLiteracyMode ? 'text-lg' : ''}>
                    {t['farmer.upload_new']}
                  </span>
                </button>
                
                <button
                  onClick={handleViewListings}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Eye className="h-5 w-5" />
                  <span className={lowLiteracyMode ? 'text-lg' : ''}>
                    {language === 'te' ? 'జాబితాలు చూడండి' : 'View Listings'}
                  </span>
                </button>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'మార్కెట్ అంతర్దృష్టులు' : 'Market Insights'}
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    {language === 'te' 
                      ? 'ప్రస్తుత మార్కెట్ బలమైన డిమాండ్ చూపిస్తోంది'
                      : 'Current market shows strong demand'
                    }
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {language === 'te'
                      ? 'AI సూచన: 2-3 రోజులు వేచి ఉండండి'
                      : 'AI Suggestion: Wait for 2-3 days'
                    }
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {language === 'te'
                      ? 'అధిక నాణ్యత బ్యాచ్‌లకు ప్రీమియం ధరలు'
                      : 'Premium prices for high-quality batches'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
