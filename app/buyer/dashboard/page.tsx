'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, TrendingUp, Bell, Eye, Search, Filter } from 'lucide-react';
import { TopNav } from '../../../components/TopNav';
import { PriceTicker } from '../../../components/PriceTicker';
import { PriceChart } from '../../../components/PriceChart';
import { VoiceAssistantButton } from '../../../components/VoiceAssistantButton';
import { useApp } from '../../../lib/context';
import { useAuth } from '../../../lib/auth-context';
import { translations } from '../../../locales/translations';
import { mockBatches } from '../../../mock/data';
import { Batch } from '../../../types';
import { formatPrice, formatWeight, formatDate, getStatusColor, getGradeColor } from '../../../utils';

export default function BuyerDashboard() {
  const router = useRouter();
  const { userRole, language, lowLiteracyMode, addNotification } = useApp();
  const { isAuthenticated } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [stats, setStats] = useState({
    totalListings: 0,
    available: 0,
    inCart: 0,
    purchased: 0
  });

  const t = translations[language];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if not buyer
  useEffect(() => {
    if (isAuthenticated && userRole !== 'buyer') {
      router.push('/farmer/dashboard');
    }
  }, [isAuthenticated, userRole, router]);


  // Load available batches
  useEffect(() => {
    // Filter batches that are available for purchase
    const availableBatches = mockBatches.filter(batch => batch.status === 'listed');
    setBatches(availableBatches);
    setFilteredBatches(availableBatches);

    // Calculate stats
    setStats({
      totalListings: availableBatches.length,
      available: availableBatches.length,
      inCart: 2, // Mock cart items
      purchased: 5 // Mock purchased items
    });
  }, []);

  // Filter batches based on search and grade
  useEffect(() => {
    let filtered = batches;

    if (searchTerm) {
      filtered = filtered.filter(batch => 
        batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.farmerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(batch => batch.grade === selectedGrade);
    }

    setFilteredBatches(filtered);
  }, [searchTerm, selectedGrade, batches]);

  const handleViewBatch = (batchId: string) => {
    router.push(`/buyer/listing?batch=${batchId}`);
  };

  const handleAddToCart = (batchId: string) => {
    addNotification({
      type: 'success',
      message: language === 'te' ? 'కార్ట్‌లో జోడించబడింది' : 'Added to cart'
    });
  };

  const handleMakeOffer = (batchId: string) => {
    addNotification({
      type: 'info',
      message: language === 'te' ? 'ఆఫర్ పంపబడింది' : 'Offer sent'
    });
  };

  const recentBatches = filteredBatches.slice(0, 6);

  if (userRole !== 'buyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'te' ? 'స్వాగతం, కొనుగోలుదారు!' : 'Welcome, Buyer!'}
          </h1>
          <p className="text-gray-600">
            {language === 'te' 
              ? 'ఉత్తమ నాణ్యత టర్మరిక్‌ను కనుగొనండి'
              : 'Find the best quality turmeric'
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
                <p className="text-sm text-gray-600">{language === 'te' ? 'మొత్తం జాబితాలు' : 'Total Listings'}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{language === 'te' ? 'అందుబాటులో' : 'Available'}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{language === 'te' ? 'కార్ట్‌లో' : 'In Cart'}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.inCart}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{language === 'te' ? 'కొనుగోలు చేసినవి' : 'Purchased'}</p>
                <p className={`text-2xl font-bold ${lowLiteracyMode ? 'text-3xl' : ''}`}>{stats.purchased}</p>
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

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'te' ? 'బ్యాచ్‌ను వెతకండి...' : 'Search batches...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని గ్రేడ్‌లు' : 'All Grades'}</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Available Batches */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'te' ? 'అందుబాటులో ఉన్న బ్యాచ్‌లు' : 'Available Batches'}
                </h2>
                <button
                  onClick={() => router.push('/buyer/listing')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {language === 'te' ? 'అన్ని చూడండి' : 'View All'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentBatches.map((batch) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
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
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(batch.grade)}`}>
                        Grade {batch.grade}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{language === 'te' ? 'ధర' : 'Price'}</span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(batch.price_recommended, language)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{language === 'te' ? 'కర్కుమిన్' : 'Curcumin'}</span>
                        <span className="font-medium">{batch.ai.curcumin_est}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{language === 'te' ? 'రైతు' : 'Farmer'}</span>
                        <span className="font-medium">{batch.farmerId}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBatch(batch.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{language === 'te' ? 'చూడండి' : 'View'}</span>
                      </button>
                      <button
                        onClick={() => handleAddToCart(batch.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>{language === 'te' ? 'కార్ట్' : 'Cart'}</span>
                      </button>
                      <button
                        onClick={() => handleMakeOffer(batch.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>{language === 'te' ? 'ఆఫర్' : 'Offer'}</span>
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
                  onClick={() => router.push('/buyer/listing')}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Search className="h-5 w-5" />
                  <span className={lowLiteracyMode ? 'text-lg' : ''}>
                    {language === 'te' ? 'అన్ని జాబితాలు' : 'Browse All Listings'}
                  </span>
                </button>
                
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className={lowLiteracyMode ? 'text-lg' : ''}>
                    {language === 'te' ? 'కార్ట్ చూడండి' : 'View Cart'}
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
                      ? 'అధిక నాణ్యత బ్యాచ్‌లు అందుబాటులో ఉన్నాయి'
                      : 'High-quality batches available'
                    }
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {language === 'te'
                      ? 'ధరలు స్థిరంగా ఉన్నాయి'
                      : 'Prices are stable'
                    }
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {language === 'te'
                      ? 'వేగవంతమైన డెలివరీ అందుబాటులో'
                      : 'Fast delivery available'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'ఇటీవలి కార్యకలాపాలు' : 'Recent Activity'}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    {language === 'te' ? 'బ్యాచ్ 001 కార్ట్‌లో జోడించబడింది' : 'Batch 001 added to cart'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    {language === 'te' ? 'బ్యాచ్ 002 కోసం ఆఫర్ పంపబడింది' : 'Offer sent for Batch 002'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    {language === 'te' ? 'బ్యాచ్ 003 కొనుగోలు పూర్తయింది' : 'Batch 003 purchase completed'}
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
