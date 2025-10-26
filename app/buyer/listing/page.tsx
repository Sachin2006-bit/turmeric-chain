'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, Package, Search, Filter, Eye, ArrowLeft, Heart, Star, MapPin, Calendar, User, Tag } from 'lucide-react';
import { TopNav } from '../../../components/TopNav';
import { PriceTicker } from '../../../components/PriceTicker';
import { PriceChart } from '../../../components/PriceChart';
import { useApp } from '../../../lib/context';
import { translations } from '../../../locales/translations';
import { mockBatches, mockFarmers } from '../../../mock/data';
import { Batch } from '../../../types';
import { formatPrice, formatWeight, formatDate, getStatusColor, getGradeColor } from '../../../utils';

interface CartItem {
  batchId: string;
  quantity: number;
  price: number;
  batch: Batch;
}

export default function EnhancedBuyerListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole, language, lowLiteracyMode, addNotification } = useApp();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedFarmer, setSelectedFarmer] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 15000});
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'weight' | 'rating'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const t = translations[language];

  // Redirect if not buyer
  useEffect(() => {
    if (userRole !== 'buyer') {
      router.push('/');
    }
  }, [userRole, router]);

  // Load available batches
  useEffect(() => {
    const availableBatches = mockBatches.filter(batch => batch.status === 'listed');
    setBatches(availableBatches);
    setFilteredBatches(availableBatches);

    // Check if specific batch is requested
    const batchId = searchParams.get('batch');
    if (batchId) {
      const batch = availableBatches.find(b => b.id === batchId);
      if (batch) {
        setSelectedBatch(batch);
        setShowDetails(true);
      }
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('buyerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('buyerFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [searchParams]);

  // Filter and sort batches
  useEffect(() => {
    let filtered = batches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(batch => {
        const farmer = mockFarmers.find(f => f.id === batch.farmerId);
        return (
          batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.farmerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (farmer && farmer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          batch.grade.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Grade filter
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(batch => batch.grade === selectedGrade);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(batch => {
        const farmer = mockFarmers.find(f => f.id === batch.farmerId);
        return farmer?.location === selectedLocation;
      });
    }

    // Farmer filter
    if (selectedFarmer !== 'all') {
      filtered = filtered.filter(batch => batch.farmerId === selectedFarmer);
    }

    // Price range filter
    filtered = filtered.filter(batch => 
      batch.price_recommended >= priceRange.min && 
      batch.price_recommended <= priceRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price_recommended - b.price_recommended;
        case 'weight':
          return b.weight_qtl - a.weight_qtl;
        case 'rating':
          return (b.ai?.confidence || 0) - (a.ai?.confidence || 0);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredBatches(filtered);
  }, [searchTerm, selectedGrade, selectedLocation, selectedFarmer, priceRange, sortBy, batches]);

  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDetails(true);
  };

  const handleAddToCart = (batch: Batch) => {
    const existingItem = cart.find(item => item.batchId === batch.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.batchId === batch.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        batchId: batch.id,
        quantity: 1,
        price: batch.price_recommended,
        batch: batch
      }]);
    }

    // Save to localStorage
    const newCart = existingItem 
      ? cart.map(item => 
          item.batchId === batch.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, {
          batchId: batch.id,
          quantity: 1,
          price: batch.price_recommended,
          batch: batch
        }];
    
    localStorage.setItem('buyerCart', JSON.stringify(newCart));
    setCart(newCart);

    addNotification({
      id: `notification_${Date.now()}`,
      type: 'bid',
      title: language === 'te' ? 'కార్ట్‌లో జోడించబడింది' : 'Added to Cart',
      message: language === 'te' ? `${batch.id} కార్ట్‌లో జోడించబడింది` : `${batch.id} added to cart`,
      status: 'delivered',
      createdAt: new Date().toISOString()
    });

    // Navigate to checkout page
    router.push('/cart');
  };

  const handleRemoveFromCart = (batchId: string) => {
    const newCart = cart.filter(item => item.batchId !== batchId);
    setCart(newCart);
    localStorage.setItem('buyerCart', JSON.stringify(newCart));
  };

  const handleUpdateQuantity = (batchId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(batchId);
      return;
    }

    const newCart = cart.map(item => 
      item.batchId === batchId 
        ? { ...item, quantity }
        : item
    );
    setCart(newCart);
    localStorage.setItem('buyerCart', JSON.stringify(newCart));
  };

  const handleToggleFavorite = (batchId: string) => {
    const newFavorites = favorites.includes(batchId)
      ? favorites.filter(id => id !== batchId)
      : [...favorites, batchId];
    
    setFavorites(newFavorites);
    localStorage.setItem('buyerFavorites', JSON.stringify(newFavorites));
  };


  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedBatch(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (userRole !== 'buyer') {
    return null;
  }

  if (showDetails && selectedBatch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'te' ? 'జాబితాకు తిరిగి వెళ్లండి' : 'Back to Listings'}</span>
          </button>

          {/* Batch Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                {selectedBatch.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Turmeric ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedBatch.id}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{selectedBatch.farmer?.name || 'Unknown Farmer'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedBatch.farmer?.location || 'Nizamabad'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedBatch.harvest_date, language)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{language === 'te' ? 'బరువు' : 'Weight'}</h3>
                    <p className="text-2xl font-bold text-green-600">{formatWeight(selectedBatch.weight_qtl, language)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{language === 'te' ? 'ధర' : 'Price'}</h3>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(selectedBatch.price_recommended, language)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{language === 'te' ? 'గ్రేడ్' : 'Grade'}</h3>
                    <p className="text-lg font-semibold text-blue-600">{selectedBatch.grade}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{language === 'te' ? 'తేమ' : 'Moisture'}</h3>
                    <p className="text-lg font-semibold text-orange-600">{selectedBatch.moisture_pct}%</p>
                  </div>
                </div>


                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAddToCart(selectedBatch)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{language === 'te' ? 'కార్ట్‌లో జోడించండి' : 'Add to Cart'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleToggleFavorite(selectedBatch.id)}
                    className={`p-3 rounded-lg transition-colors ${
                      favorites.includes(selectedBatch.id)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.includes(selectedBatch.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'te' ? 'టర్మరిక్ మార్కెట్‌ప్లేస్' : 'Turmeric Marketplace'}
          </h1>
          <p className="text-gray-600">
            {language === 'te' ? 'ఉత్తమ నాణ్యత టర్మరిక్‌ను కనుగొనండి' : 'Find the best quality turmeric'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'te' ? 'ఫిల్టర్‌లు' : 'Filters'}
              </h2>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'వెతకండి' : 'Search'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={language === 'te' ? 'రైతు పేరు లేదా బ్యాచ్...' : 'Farmer name or batch...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Grade Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'గ్రేడ్' : 'Grade'}
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని గ్రేడ్‌లు' : 'All Grades'}</option>
                    <option value="Finger">{language === 'te' ? 'ఫింగర్' : 'Finger'}</option>
                    <option value="Bulb">{language === 'te' ? 'బల్బ్' : 'Bulb'}</option>
                    <option value="Mixed">{language === 'te' ? 'మిక్స్డ్' : 'Mixed'}</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'స్థానం' : 'Location'}
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని స్థానాలు' : 'All Locations'}</option>
                    <option value="Nizamabad">{language === 'te' ? 'నిజామాబాద్' : 'Nizamabad'}</option>
                    <option value="Adilabad">{language === 'te' ? 'అదిలాబాద్' : 'Adilabad'}</option>
                    <option value="Karimnagar">{language === 'te' ? 'కరీంనగర్' : 'Karimnagar'}</option>
                    <option value="Warangal">{language === 'te' ? 'వరంగల్' : 'Warangal'}</option>
                  </select>
                </div>

                {/* Farmer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'రైతు' : 'Farmer'}
                  </label>
                  <select
                    value={selectedFarmer}
                    onChange={(e) => setSelectedFarmer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని రైతులు' : 'All Farmers'}</option>
                    {mockFarmers.map(farmer => (
                      <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'ధర పరిధి' : 'Price Range'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder={language === 'te' ? 'కనీసం' : 'Min'}
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({...prev, min: parseInt(e.target.value) || 0}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder={language === 'te' ? 'గరిష్టం' : 'Max'}
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({...prev, max: parseInt(e.target.value) || 15000}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'వరుస క్రమం' : 'Sort By'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="date">{language === 'te' ? 'తేదీ' : 'Date'}</option>
                    <option value="price">{language === 'te' ? 'ధర' : 'Price'}</option>
                    <option value="weight">{language === 'te' ? 'బరువు' : 'Weight'}</option>
                    <option value="rating">{language === 'te' ? 'రేటింగ్' : 'Rating'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  {filteredBatches.length} {language === 'te' ? 'ఫలితాలు' : 'results'}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                  >
                    <Package className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{getCartItemCount()} {language === 'te' ? 'అంశాలు' : 'items'}</span>
                  <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={() => router.push('/cart')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {language === 'te' ? 'కార్ట్ చూడండి' : 'View Cart'}
                </button>
              </div>
            </div>

            {/* Batch Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => {
                  const farmer = mockFarmers.find(f => f.id === batch.farmerId);
                  const isInCart = cart.some(item => item.batchId === batch.id);
                  const cartItem = cart.find(item => item.batchId === batch.id);
                  
                  return (
                    <div key={batch.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={batch.photos[0]}
                          alt={batch.id}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => handleToggleFavorite(batch.id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(batch.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(batch.grade)}`}>
                            {batch.grade}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{batch.id}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{(batch.ai?.confidence || 0.8).toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{farmer?.name || 'Unknown Farmer'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{batch.farmer?.location || 'Nizamabad'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{formatWeight(batch.weight_qtl, language)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-lg font-bold text-green-600">{formatPrice(batch.price_recommended, language)}</p>
                            <p className="text-xs text-gray-500">{language === 'te' ? 'క్వింటల్‌కు' : 'per quintal'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">₹{(batch.price_recommended * batch.weight_qtl).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{language === 'te' ? 'మొత్తం' : 'total'}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewBatch(batch)}
                            className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>{language === 'te' ? 'చూడండి' : 'View'}</span>
                          </button>
                          
                          {isInCart ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleUpdateQuantity(batch.id, (cartItem?.quantity || 1) - 1)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-sm font-medium">{cartItem?.quantity || 0}</span>
                              <button
                                onClick={() => handleUpdateQuantity(batch.id, (cartItem?.quantity || 1) + 1)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(batch)}
                              className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>{language === 'te' ? 'కార్ట్' : 'Cart'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBatches.map((batch) => {
                  const farmer = mockFarmers.find(f => f.id === batch.farmerId);
                  const isInCart = cart.some(item => item.batchId === batch.id);
                  const cartItem = cart.find(item => item.batchId === batch.id);
                  
                  return (
                    <div key={batch.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img
                          src={batch.photos[0]}
                          alt={batch.id}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{batch.id}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{farmer?.name || 'Unknown Farmer'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{batch.farmer?.location || 'Nizamabad'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(batch.harvest_date, language)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(batch.grade)}`}>
                                {batch.grade}
                              </span>
                              <button
                                onClick={() => handleToggleFavorite(batch.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Heart className={`h-4 w-4 ${favorites.includes(batch.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">{language === 'te' ? 'బరువు' : 'Weight'}</p>
                              <p className="font-semibold text-gray-900">{formatWeight(batch.weight_qtl, language)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{language === 'te' ? 'తేమ' : 'Moisture'}</p>
                              <p className="font-semibold text-gray-900">{batch.moisture_pct}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{language === 'te' ? 'ధర' : 'Price'}</p>
                              <p className="font-semibold text-green-600">{formatPrice(batch.price_recommended, language)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{language === 'te' ? 'మొత్తం' : 'Total'}</p>
                              <p className="font-semibold text-gray-900">₹{(batch.price_recommended * batch.weight_qtl).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleViewBatch(batch)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="h-4 w-4" />
                              <span>{language === 'te' ? 'వివరాలు చూడండి' : 'View Details'}</span>
                            </button>
                            
                            <div className="flex items-center space-x-2">
                              {isInCart ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleUpdateQuantity(batch.id, (cartItem?.quantity || 1) - 1)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-sm font-medium">{cartItem?.quantity || 0}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(batch.id, (cartItem?.quantity || 1) + 1)}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(batch)}
                                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  <span>{language === 'te' ? 'కార్ట్‌లో జోడించండి' : 'Add to Cart'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredBatches.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'te' ? 'ఫలితాలు లేవు' : 'No Results Found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'te' ? 'మీ శోధన ప్రకారం ఫలితాలు లేవు. ఫిల్టర్‌లను మార్చి మళ్లీ ప్రయత్నించండి.' : 'No results found for your search. Try adjusting your filters.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}