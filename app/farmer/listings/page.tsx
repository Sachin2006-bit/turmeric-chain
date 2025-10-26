'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, Edit, Trash2, QrCode, Package, Calendar, Droplets, Hash } from 'lucide-react';
import { TopNav } from '../../../components/TopNav';
import { useApp } from '../../../lib/context';
import { translations } from '../../../locales/translations';
import { mockBatches } from '../../../mock/data';
import { Batch } from '../../../types';
import { formatPrice, formatWeight, formatDate, getStatusColor, getGradeColor } from '../../../utils';

function FarmerListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole, language, lowLiteracyMode } = useApp();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [filter, setFilter] = useState<'all' | 'listed' | 'booked' | 'sold'>('all');

  const t = translations[language];

  // Redirect if not farmer
  useEffect(() => {
    if (userRole !== 'farmer') {
      router.push('/');
    }
  }, [userRole, router]);

  // Load farmer's batches
  useEffect(() => {
    // Filter batches for current farmer (using farmer_01 as demo)
    const farmerBatches = mockBatches.filter(batch => batch.farmerId === 'farmer_01');
    setBatches(farmerBatches);

    // Check if specific batch is selected
    const batchId = searchParams.get('batch');
    if (batchId) {
      const batch = farmerBatches.find(b => b.id === batchId);
      if (batch) {
        setSelectedBatch(batch);
      }
    }
  }, [searchParams]);

  const filteredBatches = batches.filter(batch => {
    if (filter === 'all') return true;
    return batch.status === filter;
  });

  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
  };

  const handleEditBatch = (batch: Batch) => {
    // Navigate to edit page (for now, just show alert)
    alert(language === 'te' ? 'సవరించు ఫంక్షన్ త్వరలో వస్తుంది' : 'Edit function coming soon');
  };

  const handleDeleteBatch = (batch: Batch) => {
    if (confirm(language === 'te' ? 'ఈ బ్యాచ్‌ను తొలగించాలనుకుంటున్నారా?' : 'Are you sure you want to delete this batch?')) {
      setBatches(prev => prev.filter(b => b.id !== batch.id));
      if (selectedBatch?.id === batch.id) {
        setSelectedBatch(null);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedBatch(null);
    router.push('/farmer/listings');
  };

  if (userRole !== 'farmer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/farmer/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'te' ? 'వెనుకకు' : 'Back'}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t['nav.listings']}
          </h1>
          <p className="text-gray-600">
            {language === 'te' 
              ? 'మీ టర్మరిక్ బ్యాచ్‌లను నిర్వహించండి'
              : 'Manage your turmeric batches'
            }
          </p>
        </div>

        {!selectedBatch ? (
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: language === 'te' ? 'అన్ని' : 'All' },
                  { key: 'listed', label: t['status.listed'] },
                  { key: 'booked', label: t['status.booked'] },
                  { key: 'sold', label: t['status.sold'] }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === key
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {language === 'te' ? `బ్యాచ్ ${batch.id.split('_')[1]}` : `Batch ${batch.id.split('_')[1]}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(batch.harvest_date, language)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {t[`status.${batch.status}`]}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t['common.weight']}</span>
                      <span className="font-medium">{formatWeight(batch.weight_qtl, language)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t['upload.moisture']}</span>
                      <span className="font-medium">{batch.moisture_pct}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t['upload.grade']}</span>
                      <span className="font-medium">{batch.grade}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t['common.price']}</span>
                      <span className="font-semibold text-green-600">{formatPrice(batch.price_recommended, language)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewBatch(batch)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{language === 'te' ? 'చూడండి' : 'View'}</span>
                    </button>
                    <button
                      onClick={() => handleEditBatch(batch)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{language === 'te' ? 'సవరించు' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{language === 'te' ? 'తొలగించు' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBatches.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'te' ? 'బ్యాచ్‌లు లేవు' : 'No batches found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'te' 
                    ? 'ఇంకా బ్యాచ్‌లు లేవు. కొత్త బ్యాచ్ అప్‌లోడ్ చేయండి.'
                    : 'No batches yet. Upload a new batch.'
                  }
                </p>
                <button
                  onClick={() => router.push('/farmer/upload')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {language === 'te' ? 'కొత్త బ్యాచ్ అప్‌లోడ్ చేయండి' : 'Upload New Batch'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Batch Detail View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{language === 'te' ? 'జాబితాకు తిరిగి వెళ్లండి' : 'Back to List'}</span>
              </button>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBatch.status)}`}>
                {t[`status.${selectedBatch.status}`]}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Photos and QR */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t['upload.photos']}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBatch.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Batch photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'te' ? 'QR కోడ్' : 'QR Code'}
                  </h3>
                  <div className="text-center">
                    <img
                      src={selectedBatch.qr}
                      alt="Batch QR Code"
                      className="mx-auto w-32 h-32"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      {language === 'te' ? 'బ్యాచ్ హ్యాష్' : 'Batch Hash'}: {selectedBatch.batch_hash.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'te' ? 'బ్యాచ్ వివరాలు' : 'Batch Details'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">{t['common.weight']}</span>
                        <p className="font-medium">{formatWeight(selectedBatch.weight_qtl, language)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">{t['upload.moisture']}</span>
                        <p className="font-medium">{selectedBatch.moisture_pct}%</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">{t['upload.harvest_date']}</span>
                        <p className="font-medium">{formatDate(selectedBatch.harvest_date, language)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Hash className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">{t['upload.grade']}</span>
                        <p className="font-medium">{selectedBatch.grade}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t['farmer.ai_suggestion']}
                  </h3>
                  
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t['ai.grade']}</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(selectedBatch.ai.grade)}`}>
                        {selectedBatch.ai.grade}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t['ai.curcumin']}</span>
                      <span className="font-medium">{selectedBatch.ai.curcumin_est}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t['ai.confidence']}</span>
                      <span className="font-medium">{Math.round(selectedBatch.ai.confidence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t['ai.recommended_price']}</span>
                      <span className="font-semibold text-green-600">{formatPrice(selectedBatch.price_recommended, language)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'te' ? 'చర్యలు' : 'Actions'}
                  </h3>
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      {t['farmer.accept_price']}
                    </button>
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      {t['farmer.call_agent']}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FarmerListings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FarmerListingsContent />
    </Suspense>
  );
}
